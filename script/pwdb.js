/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const db = new DB();
let g_db_cache;
let g_db_promise;

const g_db_meta = {
	id: 0,
	tag: "version",
	base: 0,
	edit_time: 0,
	project: {},
};

class PWDB {
	static async find_usages(obj) {
		const usages = [];

		if (!obj) {
			return usages;
		}

		if (obj._db.type == 'npcs') {
			for (const mapid in PWMap.maps) {
				await db.load_map(mapid);

				const arr = db['spawners_' + mapid];
				for (const i of arr) {
					if (i && i.is_npc && i.groups && i.groups.find(g => g.type == obj.id)) {
						usages.push(i);
					}
				}
			}
		}

		return usages;
	}

	static undo(obj, path) {
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

	static loaded_maps = {};
	static tag_categories = {};
	static tags = {};
}

const pwdb_register_data_type = async (type, tag_category, url) => {
	let resolve = null;

	if (g_db_promise) {
		await g_db_promise;
	} else {
		g_db_promise = new Promise((r) => { resolve = r; });
	}

	if (!tag_category) tag_category = type;
	const show_tag = !PWDB.tag_categories[tag_category];
	const tag = show_tag ? Loading.show_tag('Loading ' + tag_category) : null;
	PWDB.tag_categories[tag_category] = (PWDB.tag_categories[tag_category] || 0) + 1;
	if (tag) PWDB.tags[tag_category] = tag;

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

	if (!cached) {
		if (!url) {
			url = ROOT_URL + 'data/base/' + type + '.json';
		}
		url += '?v=' + MG_VERSION;
		console.log('fetching ' + url);
		g_db[type] = (await get(url, { is_json: 1, headers: {
			"Content-Type": "application/json; charset=UTF-8"
		}})).data;
		const cache = g_db_cache.transaction(['tables'], 'readwrite').objectStore('tables');
		cache.add({ type, arr: g_db[type] });
	}
	db.register_type(type, g_db[type]);

	if (resolve) resolve();
	setTimeout(() => {
		--PWDB.tag_categories[tag_category];
		if (PWDB.tag_categories[tag_category] == 0) {
			Loading.hide_tag(PWDB.tags[tag_category]);
		}
	}, 400);
}

db.new_id_start = 0x80000001;
const g_pwdb_init_promise = Promise.all([
	db.register_type('metadata', [g_db_meta]),
	pwdb_register_data_type('mines'),
	pwdb_register_data_type('recipes'),
	pwdb_register_data_type('npc_sells'),
	pwdb_register_data_type('npc_crafts'),
	pwdb_register_data_type('npcs'),
	pwdb_register_data_type('monsters'),
	pwdb_register_data_type('items'),
	pwdb_register_data_type('weapon_major_types', 'object_types'),
	pwdb_register_data_type('weapon_minor_types', 'object_types'),
	pwdb_register_data_type('armor_major_types', 'object_types'),
	pwdb_register_data_type('armor_minor_types', 'object_types'),
	pwdb_register_data_type('decoration_major_types', 'object_types'),
	pwdb_register_data_type('decoration_minor_types', 'object_types'),
	pwdb_register_data_type('medicine_major_types', 'object_types'),
	pwdb_register_data_type('medicine_minor_types', 'object_types'),
	pwdb_register_data_type('material_major_types', 'object_types'),
	pwdb_register_data_type('material_minor_types', 'object_types'),
	pwdb_register_data_type('projectile_types', 'object_types'),
	pwdb_register_data_type('quiver_types', 'object_types'),
	pwdb_register_data_type('armor_sets', 'object_types'),
	pwdb_register_data_type('equipment_addons'),
]);
//pwdb_register_data_type('quests');

db.register_commit_cb((obj, diff, prev_vals) => {
	obj._db.undo_idx = undefined;
});

db.load_map = async (name) => {
	if (PWDB.loaded_maps[name]) {
		return PWDB.loaded_maps[name];
	}

	 PWDB.loaded_maps[name] = Promise.all([
		pwdb_register_data_type('spawners_' + name, 'spawners', ROOT_URL + 'data/base/map/' + name + '/spawners.json'),
		pwdb_register_data_type('resources_' + name, 'resources', ROOT_URL + 'data/base/map/' + name + '/resources.json'),
		g_pwdb_init_promise
	]);
	return PWDB.loaded_maps[name];
}
