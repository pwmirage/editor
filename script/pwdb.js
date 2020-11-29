/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

let g_db_cache = null;
let g_db_promises = {};

const g_db_meta = {
	id: 0,
	tag: "version",
	base: 0,
	edit_time: 0,
	project: {},
};

class PWDB {
	static async new_db(args = {}) {
		const db = new DB();
		this.db_promise = null;
		db.new_id_start = 0x80000001;

		db.register_commit_cb((obj, diff, prev_vals) => {
			obj._db.undo_idx = undefined;
		});

		await Promise.all([
			db.register_type('metadata', [g_db_meta]),
			PWDB.register_data_type(db, args, 'mines'),
			PWDB.register_data_type(db, args, 'recipes'),
			PWDB.register_data_type(db, args, 'npc_sells'),
			PWDB.register_data_type(db, args, 'npc_crafts'),
			PWDB.register_data_type(db, args, 'npcs'),
			PWDB.register_data_type(db, args, 'monsters'),
			PWDB.register_data_type(db, args, 'items'),
			PWDB.register_data_type(db, args, 'weapon_major_types', 'object_types'),
			PWDB.register_data_type(db, args, 'weapon_minor_types', 'object_types'),
			PWDB.register_data_type(db, args, 'armor_major_types', 'object_types'),
			PWDB.register_data_type(db, args, 'armor_minor_types', 'object_types'),
			PWDB.register_data_type(db, args, 'decoration_major_types', 'object_types'),
			PWDB.register_data_type(db, args, 'decoration_minor_types', 'object_types'),
			PWDB.register_data_type(db, args, 'medicine_major_types', 'object_types'),
			PWDB.register_data_type(db, args, 'medicine_minor_types', 'object_types'),
			PWDB.register_data_type(db, args, 'material_major_types', 'object_types'),
			PWDB.register_data_type(db, args, 'material_minor_types', 'object_types'),
			PWDB.register_data_type(db, args, 'projectile_types', 'object_types'),
			PWDB.register_data_type(db, args, 'quiver_types', 'object_types'),
			PWDB.register_data_type(db, args, 'armor_sets', 'object_types'),
			PWDB.register_data_type(db, args, 'equipment_addons'),
		]);

		return db;
	}

	static load_db_map(db, name) {
		if (g_db_promises[name]) {
			return g_db_promises[name];
		}

		 g_db_promises[name] = Promise.all([
			PWDB.register_data_type(db, 'spawners_' + name, 'spawners', ROOT_URL + 'data/base/map/' + name + '/spawners.json'),
			PWDB.register_data_type(db, 'resources_' + name, 'resources', ROOT_URL + 'data/base/map/' + name + '/resources.json'),
		]);
		return g_db_promises[name];
	}

	static async find_usages(db, obj) {
		let usages = [];

		if (!obj) {
			return usages;
		}

		if (obj._db.type == 'npcs') {
			for (const mapid in PWMap.maps) {
				await PWDB.load_db_map(db, mapid);

				const arr = db['spawners_' + mapid];
				for (const i of arr) {
					if (i && i.is_npc && i.groups && i.groups.find(g => g.type == obj.id)) {
						usages.push(i);
					}
				}
			}
		} else if (obj._db.type == 'npc_sells') {
			usages = db.npcs.filter(n => n.id_sell_service == obj.id);
		}

		return usages;
	}

	static undo(db, obj, path) {
		if (typeof path === 'string') {
			path = [ path ];
		}

		if (!obj._db.changesets || obj._db.changesets.length < 2) {
			/* never opened or never committed */
			return false;
		}

		const get_val = (o) => {
			for (const p of path) {
				if (!(p in o)) {
					return undefined;
				}
				o = o[p];
			}
			return o ?? null;
		};

		const set_val = (o, val) => {
			for (let p_idx = 0; p_idx < path.length - 1; p_idx++) {
				const p = path[p_idx];
				if (!(p in o)) {
					Loading.show_error_tag('Trying to undo a field which doesn\'t exist now');
					return;
				}
				o = o[p];
			}
			const f = path[path.length - 1];
			o[f] = val;
		};

		let prev_val;
		for (let i = obj._db.changesets.length - 2; i >= 0; i--) {
			const c = obj._db.changesets[i];

			if (c._db.undone) {
				continue;
			}

			const prev_val = get_val(c);
			if (prev_val == undefined && i > 0) {
				/* no change in this changeset, continue looking */
				/* TODO don't undo changes from other projects */
				/* maybe save project id in changesets? */
				continue;
			}

			db.open(obj);
			/* update obj */
			set_val(obj, prev_val);
			db.commit(obj);

			/* mark all subsequent changes as non undo-able, otherwise
			 * undo will just always make a cycle */
			for (let j = Math.max(1, i); j < obj._db.changesets.length - 1; j++) {
				const c = obj._db.changesets[j];
				c._db.undone = true;
			}

			db.new_generation();
			break;
		}

	}

	static async load_db_file(type, url) {
		let final_resolve = null;

		if (g_db_promises[type]) {
			return g_db_promises[type];
		}

		g_db_promises[type] = new Promise((r) => { final_resolve = r; });

		/* is the cache db in place? */
		let cached = await new Promise((resolve, reject) => {
			if (g_db_cache) return resolve(true);
			if (!window.indexedDB) return resolve(false);

			const request = window.indexedDB.open("db-cache", 1);
			request.onerror = reject;
			let cached = true;

			request.onsuccess = () => {
				g_db_cache = request.result;
				resolve(cached);
			};

			request.onupgradeneeded = (event) => {
				cached = false;
				let db = event.target.result;
				db.createObjectStore('tables', { keyPath: 'type' });
			}
		});

		/* try to retrieve this arr from cached db */
		if (cached) {
			await new Promise((resolve, reject) => {
				const cache = g_db_cache.transaction(['tables'], 'readonly').objectStore('tables');
				const request = cache.get(type);
				request.onerror = reject;
				request.onsuccess = () => {
					const cache = request.result;
					if (cache) {
						g_db[type] = cache.arr;
					} else {
						cached = false;
					}
					resolve();
				};
			});
		}

		/* fallback to loading the file */
		if (!cached) {
			if (!url) {
				url = ROOT_URL + 'data/base/' + type + '.json';
			}
			url += '?v=' + MG_VERSION;
			console.log('fetching ' + url);
			g_db[type] = (await get(url, { is_json: 1, headers: {
				"Content-Type": "application/json; charset=UTF-8"
			}})).data;

			/* save to cache */
			const cache = g_db_cache.transaction(['tables'], 'readwrite').objectStore('tables');
			cache.add({ type, arr: g_db[type] });
		}

		final_resolve();
	}

	static tag_categories = {};
	static tags = {};

	static async register_data_type(db, args, type, tag_category, url) {
		let tag;
		if (!args.no_tag) {
			if (!tag_category) tag_category = type;
			const show_tag = !PWDB.tag_categories[tag_category];
			tag = show_tag ? Loading.show_tag('Loading ' + tag_category) : null;
			PWDB.tag_categories[tag_category] = (PWDB.tag_categories[tag_category] || 0) + 1;
			if (tag) PWDB.tags[tag_category] = tag;
		}

		await PWDB.load_db_file(type, url);
		db.register_type(type, g_db[type]);

		if (tag) Loading.try_cancel_tag(tag);

		if (!args.no_tag) {
			setTimeout(() => {
				--PWDB.tag_categories[tag_category];
				if (PWDB.tag_categories[tag_category] == 0) {
					Loading.hide_tag(PWDB.tags[tag_category]);
				}
			}, 400);
		}
	}

}

