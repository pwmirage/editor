import DB from './script/DB.mjs';
import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'

const port = 24677;
const MG_VERSION = 1;

const g_db = {};
eval(fs.readFileSync('data/base/npc_recipes.js')+'');
eval(fs.readFileSync('data/base/npc_goods.js')+'');
eval(fs.readFileSync('data/base/npc_spawns.js')+'');
eval(fs.readFileSync('data/base/npcs.js')+'');
eval(fs.readFileSync('data/base/quests.js')+'');
eval(fs.readFileSync('data/base/items.js')+'');
eval(fs.readFileSync('data/base/recipes.js')+'');

const _fetch = async (url) => {
	return new Promise((resolve, reject) => {
		https.get(url, (res) => {
			let data = '';

			if (res.statusCode !== 200) {
				res.resume();
				return reject('fetch("' + url + '") returned ' + res.statusCode);
			}

			res.setEncoding('utf8');
			res.on('data', (chunk) => { data += chunk; });
			res.on('end', () => {
				return resolve(data);
			});
			}).on('error', (e) => {
				return reject('fetch("' + url + '") failed: ' + e.message);
			});
	});
};

const read_file = async (path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf8', (e, data) => {
			if (e) {
				return reject(e);
			}
			return resolve(data);
		});
	});
};

const save_file = async (path, content) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, content, 'utf8', (e) => {
			if (e) {
				return reject(e);
			}
			return resolve();
		});
	});
};

function load_ext_script(url, on_success = () => {}, on_fail = () => {}) {
	return new Promise((resolve, reject) => {
		_fetch(url).then((script_str) => {
			eval(script_str);
			on_success();
			resolve();
		}).catch((e) => {
			on_fail();
			reject();
		});
	});
}

function load_script(url, on_success = () => {}, on_fail = () => {}) {
	const file = url.split('?')[0];

	read_file(file).then((src) => {
		eval(src);
		on_success();
	}).catch((e) => {
		on_fail();
	});
}

function log(severity, msg) {
	/* be silent */
	//console.log(severity + ': ' + msg);
}

const get_proj_src = async (uri) => {
	let is_local;
	let branch;
	let url;
	if (/^(internal\/)?[0-9]+_[a-zA-Z0-9]+$/.test(uri)) {
		url = uri.replace('internal/', '') + '.json';
		is_local = true;
	} else if (/^(github|public)\/[0-9]+_[a-z0-9\._,'"!\$%]+$/.test(uri)) {
		url = uri.replace(/^(github|public)\//g, '');
		branch = 'public';
	} else if (/^test\/[0-9]+_[a-z0-9\._,'"!\$%]+$/.test(uri)) {
		url = uri.replace('test/', '');
		branch = 'test';
	} else {
		console.log('Unknown base project URI (' + uri + ')');
		throw new Error(500);
	}

	if (!is_local) {
		return await _fetch('https://raw.githubusercontent.com/pwmirage/version/' + branch + '/cache/' + url);
	}

	try {
		/* try to get a cached version */
		return await read_file('uploads/cache/' + url);
	} catch (e) {
		/* no cached base, read a piece of it manually */
		return await read_file('uploads/' + url);
	}
};

const get_base = (proj) => {
	let base = '';
	for (const mods_table of proj) {
		if (!mods_table) continue;
		for (const mod of mods_table) {
			if (!mod) continue;
			if (!mod._db) console.log('no _db: ' + mod);
			if (mod._db.type !== 'metadata') continue;
			if (mod.id !== 0) continue;
			if (mod.project && mod.project.base) {
				base = mod.project.base;
			}
			break;
		}
	}
	return base;
}

const get_local_project = async (file) => {
	const deps = [];
	let base = file;

	const proj_src =  await read_file('uploads/' + file + '.json');
	let proj = JSON.parse('[' + proj_src + ']');
	const local_proj = proj;

	base = get_base(proj);
	while (base) {
		const proj_src = await get_proj_src(base);
		proj = JSON.parse('[' + proj_src + ']');
		deps.push(proj);
		base = get_base(proj);
	}

	return { project: local_proj, deps: deps };
}

const normalize_project = (proj_map) => {
	for (let obj of proj_map.keys()) {
		if (obj.name == '') {
			obj.name = 'unnamed';
		}
		if (obj.shop_price && obj.price) {
			if (obj.shop_price < obj.price) {
				obj.price = obj.shop_price;
			}
		}
	}
}

const new_db = () => {
	const db = new DB();

	const db_meta = {
		id: 0,
		tag: "version",
		base: 0,
		edit_time: 0,
		project: {},
	};

	db.register_type('metadata', [db_meta]);
	db.register_type('items', g_db.items);
	db.register_type('recipes', g_db.recipes);
	db.register_type('npc_goods', g_db.npc_goods);
	db.register_type('npc_recipes', g_db.npc_recipes);
	db.register_type('npc_spawns', g_db.npc_spawns);
	db.register_type('npcs', g_db.npcs);
	db.register_type('quests', g_db.quests);
	return db;
}

function is_empty(obj) {
	for (const f in obj) {
		const v = obj[f];
		if (v == 0 || v == '' || f == '_db') continue;
		return false;
	}

	return true;
}

function dump(data, spacing = 1) {
	return JSON.stringify(data, function(k, v) {
		/* keep the _db at its minimum */
		if (k === '_db') return { type: v.type, prev: v.diff_original, refs: v.refs };
		/* dont include any nulls, undefined results in no output at all */
		if (v === null) return undefined;
		if (typeof v === 'object' && is_empty(v)) {
			return Array.isArray(v) ? [] : undefined;
		}
		/* magic skipped field - makes non empty objects empty */
		if (k === '__skip__') return undefined;
		return v;
	}, spacing);
}

const export_project = async (user, hash, export_type) => {
	const file = user + '_' + hash;

	if (!/^[0-9]+_[a-zA-Z0-9]+$/.test(file)) {
		console.log("invalid name: " + file);
		throw new Error(400);
	}

	const db = new_db();

	switch (export_type) {
	case 'cache': {
		const { project, deps } = await get_local_project(file);
		const modified = new Map();
		db.register_commit_cb((obj) => {
			if (obj._db.type == 'metadata') return;
			modified.set(obj, true);
		});

		for (let i = deps.length - 1; i >= 0; i--) {
			await db.load(deps[i]);
		}

		await db.load(project);
		normalize_project(modified);
		for (let obj of modified.keys()) {
			if (db.is_obj_equal(obj, obj._db.changesets[0])) {
				/* this was modified back and forth, but no diff at the end */
				modified.delete(obj);
			}
		}

		const modified_arr = Array.from(modified.keys());
		const base_cache_str = JSON.stringify(modified_arr, (k, v) => {
			if (k === '_db') return { type: v.type };
			if (v === null) return undefined;
			return v;
		}, 1);
		await save_file('uploads/cache/' + file + '.json', base_cache_str);
		break;
	}
	case 'export': {
		const { project, deps } = await get_local_project(file);
		for (let i = deps.length - 1; i >= 0; i--) {
			await db.load(deps[i]);
		}

		const project_changes = new Map();
		const org_id = Symbol();
		db.register_commit_cb((obj) => {
			if (obj._db.type == 'metadata' && obj.id != 0) return;
			if (!obj._db[org_id]) obj._db[org_id] = obj._db.latest_state;
			project_changes.set(obj, true);
		});

		await db.load(project);
		normalize_project(project_changes);
		for (let obj of project_changes.keys()) {
			if (db.is_obj_equal(obj, obj._db[org_id])) {
				/* this was modified back and forth, but no diff at the end */
				project_changes.delete(obj);
			}
		}

		const project_changes_arr = Array.from(project_changes.keys());
		const cache_str = JSON.stringify(project_changes_arr, (k, v) => {
			if (k === '_db') return { type: v.type, latest_state: v[org_id] };
			if (v === null) return undefined;
			return v;
		}, 1);
		await save_file('uploads/export/' + file + '.json', cache_str);
		break;
	}
	case 'preview': {
		console.log(db.npc_recipes[15612].tabs[1]);
		const { project, deps } = await get_local_project(file);
		for (let i = deps.length - 1; i >= 0; i--) {
			await db.load(deps[i]);
			console.log(db.npc_recipes[15612].tabs[1]);
		}

		db.new_generation();
		let mod_refcnt = new Map();
		const append_obj = (obj) => {
			if (!obj._db.diff_original) {
				obj._db.diff_original = db.clone(obj._db.latest_state);
			}
			mod_refcnt.set(obj, (mod_refcnt.get(obj) || 0) + 1);
		}

		db.register_commit_cb((obj) => {
			if (obj._db.type == 'metadata' && obj.id != 0) return;
			append_obj(obj);
		});

		await db.load(project);
		console.log(db.npc_recipes[15612].tabs[1]);

		/* minimize all objects */
		for (const [obj, cnt] of mod_refcnt.entries()) {
			const minimize = (val, prev) => {
				let ret = true;
				for (const f in val) {
					if (f === '_db') continue;

					if (typeof(val[f]) === 'object' && !prev[f]) { /* not minimization - just set prev to non-null if it was changed from null */
						prev[f] = { __skip__: 1 };
					} else if ((typeof(val[f]) !== 'object' && val[f] === prev[f]) ||
					    (typeof(val[f]) === 'object' && minimize(val[f], prev[f] || {}))) {
						prev[f] = {};
					} else {
						ret = false;
					}
				}
				return ret;
			};
			if (obj._db.diff_original.id === 0) {
				obj._db.diff_original = { id: -1 };
			} else {
				minimize(obj, obj._db.diff_original);
			}
		}

		/* reference additional parent objects */
		const modified = Array.from(mod_refcnt.keys());
		for (const obj of modified) {
			switch (obj._db.type) {
				case 'recipes': {
					const refs = [];
					for (const list of db.npc_recipes) {
						for (const tab of list.tabs) {
							if (!tab.recipes) continue;
							if (tab.recipes.includes(obj.id)) {
								refs.push({ id: list.id, _db: { type: list._db.type }});
								append_obj(list);
							}
						}
					}
					obj._db.refs = refs;
					break;
				}
			}
		}

		/* sort all referenced objects by refcnt, hottest first */
		mod_refcnt =  new Map([...mod_refcnt].sort((a, b) => a[1] - b[1]));

		const sorted_db = {
			metadata: [],
			npc_spawns: [],
			npcs: [],
			npc_recipes: [],
			npc_goods: [],
			recipes: [],
			items: [],
		};

		for (const [obj, cnt] of mod_refcnt.entries()) {
			if (!sorted_db[obj._db.type]) continue;
			sorted_db[obj._db.type].push(obj);
		};

		/* append any referenced objects */
		for (const obj of mod_refcnt.keys()) {
			switch (obj._db.type) {
				case 'npc_spawns': {
					const npc = db.npcs[obj.type];
					if (!npc || sorted_db.npcs.includes(npc)) continue;
					append_obj(npc);
					sorted_db.npcs.push(npc);
					break;
				}
				case 'npc_recipes': {
					for (const tab of obj.tabs) {
						if (!tab || !tab.recipes) continue;
						for (const recipe_id of tab.recipes) {
							const recipe = db.recipes[recipe_id];
							if (!recipe || sorted_db.recipes.includes(recipe)) continue;
							append_obj(recipe);
							sorted_db.recipes.push(recipe);
						}
					}
					break;
				}
				case 'recipes': {
					for (const mat of obj.mats) {
						const item = db.items[mat.id];
						if (!item || sorted_db.items.includes(item)) continue;
						append_obj(item);
						sorted_db.items.push(item);
					}
					for (const tgt of obj.targets) {
						const item = db.items[tgt.id];
						if (!item || sorted_db.items.includes(item)) continue;
						append_obj(item);
						sorted_db.items.push(item);
					}
					break;
				}
				case 'npc_goods': {
					for (const tab of obj.tabs) {
						if (!tab || !tab.items) continue;
						for (const item_id of tab.items) {
							const item = db.items[item_id];
							if (!item || sorted_db.items.includes(item)) continue;
							append_obj(item);
							sorted_db.items.push(item);
						}
					}
					break;
				}
			}
		}

		const cache_str = dump(sorted_db);
		await save_file('uploads/preview/' + file + '.json', cache_str);
		break;
	}
	}
};

const request_handler = async (request, response) => {
	const error = (code) => {
		response.writeHead(code, {"Content-Type": "application/json"});
		response.end();
	};

	const url = request.url;
	const url_parts = url.split('/');
	const req_type = url_parts[1];

	switch (req_type) {
	case 'export':
	case 'cache':
	case 'preview':
		const user = url_parts[2];
		const hash = url_parts[3];

		try {
			await export_project(user, hash, req_type);
		} catch (e) {
			console.log(e);
			return error(400);
		}

		response.writeHead(200, {"Content-Type": "application/json"});
		response.end();
		break;
	default:
		return error(405);
	}

};

const server = http.createServer(request_handler);

server.listen(port, (err) => {
	if (err) {
		return console.log("Error", err);
	}
});
