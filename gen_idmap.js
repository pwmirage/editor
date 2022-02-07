/* SPDX-License-Identifier: MIT
 * Copyright(c) 2022 Darek Stojaczyk for pwmirage.com
 */

'use strict';

class Loading {
	static show_tag() {};
	static hide_tag() {};
	static show_error_tag() {};
	static try_cancel_tag() {};
};

const fs = require('fs');
const ROOT_URL = 'ROOT_URL/';
const DB = require('./script/db.js');
eval(fs.readFileSync('./script/util.js'));
const PWDB = eval('(' + fs.readFileSync('./script/pwdb.js') + ')');

const read_file = async (path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, data) => {
			if (err) {
				return reject(err);
			}
			return resolve(data);
		});
	});
};

const save_file = async (path, content) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, content, 'utf8', (err) => {
			if (err) {
				return reject(err);
			}
			return resolve();
		});
	});
};

const get = async (url, { is_json, headers } = {}) => {
	const ret = { ok: false, data: is_json ? {} : '' };

	if (url.startsWith(ROOT_URL)) {
		try {
			url = __dirname + '/' + url.replace(ROOT_URL, '').split('?v=')[0];
			const data = await read_file(url);
			if (is_json) {
				ret.data = JSON.parse(data);
			} else {
				ret.data = data;
			}
		} catch (e) { console.error(e); }
	}

	return ret;
}

(async () => {
PWDB.init();

const map_id = {
	gs01: 1,
	is01: 2,
	is02: 3,
	is05: 4,
	is06: 5,
	is07: 6,
	is08: 7,
	is09: 8,
	is10: 9,
	is11: 10,
	is12: 11,
	is13: 12,
	is14: 13,
	is15: 14,
	is16: 15,
	is17: 16,
	is18: 17,
	is19: 18,
	is20: 19,
	is21: 20,
	is22: 21,
	is23: 22,
	is24: 23,
	is25: 24,
	is26: 25,
	is27: 26,
	is28: 27,
	is29: 28,
	is31: 29,
	is32: 30,
	is33: 31,
	a26b: 32,
};

const usage = () => {
	console.log('Usage: ./gen_idmap.js idmap triggers|spawners|recipes|tasks');
	console.log('       ./gen_idmap.js db');
};

const args = process.argv.slice(2);

const op_type = args[0];
const arr_type = args[1];
if (op_type === 'idmap') {
	const db = await PWDB.new_db({ pid: 0 });

	if (arr_type === 'triggers') {
		for (const t in db.type_info) {
			if (!t.startsWith('triggers_')) {
				continue;
			}
			const type_id = map_id[t.substring('triggers_'.length)];
			const type = db.type_info[t];
			const to_export = db[t].filter(o => o.id && o.id < DB.parse_id('2:0'));
			const lid_entries = to_export.map(o => ({ lid: DB.serialize_id(o.id), id: o.id - 0x80100000 - type.alias_offset, type: type_id }));
			for (const e of lid_entries) {
				console.log(JSON.stringify(e) + ',');
			}
		};
	} else if (arr_type === 'spawners') {
		for (const t in db.type_info) {
			if (!t.startsWith('spawners_')) {
				continue;
			}
			const type_id = map_id[t.substring('spawners_'.length)];
			const type = db.type_info[t];
			const to_export = db[t].filter(o => o.id && o.id < DB.parse_id('2:0'));
			const lid_entries = to_export.map(o => ({ lid: DB.serialize_id(o.id), id: o.id, type: type_id }));
			for (const o of lid_entries) {
				if (o.id >= 0x80100000 + type.alias_offset + type.resource_offset) {
					o.id = o.id - 0x80100000 - type.alias_offset - type.resource_offset + 100000;
				} else {
					o.id = o.id - 0x80100000 - type.alias_offset;
				}
				console.log(JSON.stringify(o) + ',');
			}
		};
	} else if (arr_type === 'recipes') {
		const type = db.type_info.recipes;
		const to_export = db.recipes.filter(r => r.id && r.id <= DB.parse_id('2:0'));
		const lid_entries = to_export.map(o => ({ lid: DB.serialize_id(o.id), id: o.id - 0x80100000 - type.alias_offset, type: 69 }));
		for (const e of lid_entries) {
			console.log(JSON.stringify(e) + ',');
		}
	} else if (arr_type === 'tasks') {
		const type = db.type_info.tasks;
		const to_export = db.tasks.filter(r => r.id && r.id <= DB.parse_id('2:0'));
		const lid_entries = to_export.map(o => ({ lid: DB.serialize_id(o.id), id: o.id - 0x80100000 - type.alias_offset, type: 69 }));
		for (const e of lid_entries) {
			console.log(JSON.stringify(e) + ',');
		}
	} else {
		usage();
	}
} else if (op_type === 'db') {
	/* "move" all recipes into a different id space, so that all IDs in the editor
	 * can be unique. The recipes are still accessible at their original IDs for
	 * backward compatibility. */

	const recipes = JSON.parse(await read_file('data/base/recipes.json'));
	const alias_offsets = {};
	const resource_offsets = {};

	let highest_off = 0;
	let current_off = 0;
	for (const r of recipes) {
		if (r.id >= current_off) {
			current_off = r.id + 1;
		}
		r.id += 0x80100000;
	}
	alias_offsets.recipes = highest_off;
	highest_off += current_off;
	current_off = 0;
	await save_file('data/base/recipes.json', JSON.stringify(recipes));

	const tasks = JSON.parse(await read_file('data/base/tasks.json'));
	for (const r of tasks) {
		if (r.id >= current_off) {
			current_off = r.id + 1;
		}
		r.id += 0x80100000 + highest_off;
	}
	alias_offsets.tasks = highest_off;
	highest_off += current_off;
	current_off = 0;
	await save_file('data/base/tasks.json', JSON.stringify(tasks));

	const triggers = JSON.parse(await read_file('data/base/triggers.json'));
	for (const arr of triggers) {
		for (const r of arr.entries) {
			if (r.id >= current_off) {
				current_off = r.id + 1;
			}
			r.id += 0x80100000 + highest_off;
		}
		alias_offsets['triggers_' + arr.tag] = highest_off;
		highest_off += current_off;
		current_off = 0;
	}
	await save_file('data/base/triggers.json', JSON.stringify(triggers));

	const spawners = JSON.parse(await read_file('data/base/spawners.json'));
	for (const arr of spawners) {
		let mob_count = undefined;
		for (const r of arr.entries) {
			/* resources always start at id 100k+ and we can't afford to store
			 * them as usual */
			if (r.id >= 100000) {
				if (mob_count === undefined) {
					mob_count = current_off;
				}
				/* we handle resources separately - they always come after mobs
				 * so mob_count stays constant at this point */
				r.id -= 100000 - mob_count - 1;
			}

			if (r.id >= current_off) {
				current_off = r.id + 1;
			}
			r.id += 0x80100000 + highest_off;
		}
		alias_offsets['spawners_' + arr.tag] = highest_off;
		resource_offsets['spawners_' + arr.tag] = mob_count + 1;
		highest_off += current_off;
		current_off = 0;
	}
	await save_file('data/base/spawners.json', JSON.stringify(spawners));

	await save_file('data/base/idmap_meta.json', JSON.stringify({ alias_offsets, resource_offsets }));
} else {
	usage();
}
})();