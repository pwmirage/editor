/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2021 Darek Stojaczyk for pwmirage.com
 */

class PWDB {
	static async watch_db() {
		const cache_save_fn = () => {
			if (!db || !PWDB.has_unsaved_changes) {
				return;
			}

			const project = db.metadata[1];
			const dump = db.dump_last(0);
			PWDB.has_unsaved_changes = false;
			localStorage.setItem('pwdb_lchangeset_' + project.pid, dump);
		};
		const cache_save_fn2 = () => {
			cache_save_fn();
			setTimeout(() => {
				cache_save_fn2();
			}, 1000 * 5);
		}
		cache_save_fn2();

		const save_fn = async () => {
			if (!db) {
				return;
			}

			const project = db.metadata[1];
			if (project.pid == 0) {
				return;
			}

			const changes = localStorage.getItem('pwdb_lchangeset_' + project.pid);
			if (!changes || changes == '[]') {
				return;
			}

			db.open(project);
			project.edit_time = Math.floor(Date.now() / 1000);
			db.commit(project);
			await PWDB.save(db, false);
		};
		const save_fn2 = () => {
			save_fn();
			setTimeout(() => {
				save_fn2();
			}, 1000 * 60 * 5);
		}
		save_fn2();
	}

	static init() {
		PWDB.g_db_promises = {};
		PWDB.has_unsaved_changes = false;
		/* which idx from db.changelog[] points to the first change directly from this project
		 * (and not its dependencies) */
		PWDB.tag_categories = {};
		PWDB.tags = {};

		PWDB.type_fields = {};
		PWDB.type_names = {};
		const init_type_arr = (type, typename, arr) => {
			const fields = PWDB.type_fields[type] = {};
			PWDB.type_names[type] = typename;

			for (const fobj of arr) {
				const id = fobj[0];
				const name = fobj[1];
				const linked_map_fn = fobj[2];

				fields[id] = { id, name, linked_map_fn };
			}
		}

		init_type_arr('spawners_', 'Spawner', [
			[ 'name', 'Name', ],
			[ 'auto_respawn', 'Auto Respawn', ],
			[ 'auto_spawn', 'Auto Spawn', ],
			[ 'lifetime', 'Time till despawn', ],
			[ 'max_num', 'Max groups num', ],
			[ 'mob_type', 'Boss type' ],
			[ 'trigger', 'Trigger', /* TODO */ ],
		]);

		init_type_arr('npcs', 'NPC', [
			[ 'name', 'Name', ],
			[ 'file_model', 'Model' ],
			[ 'greeting', 'Greeting' ],
			[ 'base_monster_id', 'Base Monster', (db) => db.monsters ],
			[ 'combined_services', 'Other services' ],
			[ 'id_buy_service', 'Buy service' ],
			[ 'id_decompose_service', 'Decompose service' ],
			[ 'id_install_service', 'Install service' ],
			[ 'id_make_service', 'Crafts' ],
			[ 'id_repair_service', 'Repair service' ],
			[ 'id_sell_service', 'Goods' ],
			[ 'id_task_in_service', 'Task in ID' ],
			[ 'id_task_out_service', 'Task out ID' ],
			[ 'id_type', 'NPC Type' ],
			[ 'id_uninstall_service', 'Uninstall type' ],
		]);

		init_type_arr('recipes', 'Recipe', [
			[ 'name', 'Name', ],
			[ 'duration', 'Craft time' ],
			[ 'major_type', 'Major type' ],
			[ 'minor_type', 'Minor type' ],
			[ 'name', 'Name' ],
			[ 'num_to_make', 'Crafted item count' ],
			[ 'recipe_level', 'Recipe level' ],
			[ 'skill_id', 'Req. Crafting Skill', () => RecipeTooltip.craft_types ],
			[ 'skill_level', 'Req. Crafting Skill Level' ],
			[ 'xp', 'XP' ],
			[ 'sp', 'SP' ],
		]);

		init_type_arr('npc_sells', 'Goods', [
			[ 'name', 'Name' ],
			[ 'option', 'NPC Option' ],
		]);

		init_type_arr('npc_crafts', 'Crafts', [
			[ 'name', 'Name' ],
			[ 'option', 'NPC Option' ],
		]);

		init_type_arr('mines', 'Resources', [
			[ 'exp', 'XP' ],
			[ 'file_model', 'Model' ],
			[ 'id_type', 'Type' /* TODO db.mine_type */ ],
			[ 'item_required', 'Item required', (db) => db.items ],
			[ 'level', 'Lv.' ],
			[ 'level_required', 'Req. Lv.' ],
			[ 'name', 'Name' ],
			[ 'sp', 'SP' ],
			[ 'time_max', 'Max pick time' ],
			[ 'time_min', 'Min pick time' ],
		]);

	}

	static get_type_fields(type) {
		if (type.startsWith('spawners_')) {
			type = 'spawners_';
		}
		return PWDB.type_fields[type];
	}

	static get_type_name(type) {
		if (type.startsWith('spawners_')) {
			type = 'spawners_';
		}
		return PWDB.type_names[type];
	}

	static async new_db(args) {
		if (!PWDB.g_db_promises) {
			PWDB.init();
		}

		if (!args) {
			args = {};
		}

		if (args.pid == 'latest') {
			args.pid = 99;
			// todo load project/head
		}

		const db = new DB();
		this.db_promise = null;

		const project = {
			id: 1,
			tag: "project",
			pid: args.pid || 0,
			base: 0,
			edit_time: 0,
		};
		db.new_id_start = 0x80000000 + project.pid * 0x100000;

		let spawner_arrs = null;

		await Promise.all([
			db.register_type('metadata', init_id_array([project])),
			PWDB.register_data_type(db, args, 'mines'),
			PWDB.register_data_type(db, args, 'recipes'),
			PWDB.register_data_type(db, args, 'npc_sells'),
			PWDB.register_data_type(db, args, 'npc_crafts'),
			PWDB.register_data_type(db, args, 'npcs'),
			PWDB.register_data_type(db, args, 'monsters'),
			PWDB.register_data_type(db, args, 'items'),
			get(ROOT_URL + 'data/base/spawners.json', { is_json: 1 }).then((req) => {
				spawner_arrs = req.data;
			}),
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

		if (args.preinit) {
			db.metadata.init();
		}

		for (const arr of spawner_arrs) {
			db.register_type('spawners_' + arr.tag, init_id_array(arr.entries));
			if (args.preinit) {
				db['spawners_' + arr.tag].init();
			}
		}

		db.project_changelog_start_gen = 0;
		if (!args.new) {
			if (project.pid > 0) {
				try {
					const req = await get(ROOT_URL + 'project/' + project.pid + '/load', { is_json: 1 });
					const changesets = req.data;
					const removed_objs = new Set();
					let i;
					for (i = 0; i < changesets.length - 1; i++) {
						db.load(changesets[i], { join_changesets: true });
					}
					db.project_changelog_start_gen = db.changelog.length;

					for (const changeset of db.changelog) {
						for (const c of changeset) {
							/* permanently clean up removed objects */
							if (c._removed) {
								const obj = c._db.obj;
								if (removed_objs.has(obj)) {
									continue;
								}

								changeset.delete(c);
								db[obj._db.type][obj.id] = undefined;
								removed_objs.add(obj);
							}
						}
					}
					db.new_generation();
					db.load(changesets[i]);
					db.new_generation();
				} catch (e) { }
			}

			const changeset_str = localStorage.getItem('pwdb_lchangeset_' + project.pid);
			if (changeset_str) {
				const changeset = JSON.parse(changeset_str);
				db.load(changeset);
			}
		}

		db.register_commit_cb((obj, diff, prev_vals) => {
			const c = obj._db.changesets[obj._db.changesets.length - 1];
			if (c._db.undone) {
				for (const f in diff) {
					c._db.undone[f] = undefined;
				}
			}
			PWDB.has_unsaved_changes = true;
		});

		return db;
	}

	static async save(db, show_tag = true) {
		let project = db.metadata[1];
		if (!project || project.read_only) {
			Loading.notify('warning', 'This project is read-only.');
			return;
		}

		const data = db.dump_last(0);
		localStorage.removeItem('pwdb_lchangeset_' + project.pid);

		if (data == '[]') {
			if (show_tag) {
				notify('success', 'Saved');
			}
			return;
		}

		const req = await post(ROOT_URL + 'project/' + project.pid + '/save', {
			is_json: 1, data: {
				file: new File([new Blob([data])], 'project.json', { type: 'application/json' }),
			}
		});

		if (!req.ok) {
			Loading.notify('error', req.data.err || 'Failed to save: unknown error');
			const dump = db.dump_last(0);
			localStorage.setItem('pwdb_lchangeset_' + project.pid, dump);
			return;
		}

		db.new_generation();
		if (show_tag) {
			notify('success', 'Saved');
		}
	}

	static async publish(db) {
		let project = db.metadata[1];
		if (!project || project.read_only) {
			Loading.notify('warning', 'This project is read-only.');
			return;
		}

		await PWDB.save(db, false);

		const req = await post(ROOT_URL + 'project/' + project.pid + '/publish', { is_json: 1 });

		if (!req.ok) {
			Loading.notify('error', req.data.err || 'Failed to publish: unknown error');
			return;
		}

		notify('success', 'Published');
		await sleep(2000);
		window.location.href = '/forum/thread/' + project.thread_id;
	}

	static find_usages(db, obj) {
		if (!obj) {
			return [];
		}

		if (obj._db.type == 'npcs') {
			const usages = [];
			for (const mapid in PWMap.maps) {
				if (mapid == 'none') {
					continue;
				}

				const arr = db['spawners_' + mapid];
				for (const i of arr) {
					if (i && i.type == 'npc' && i.groups && i.groups.find(g => g.type == obj.id)) {
						usages.push(i);
					}
				}
			}
			return usages;
		} else if (obj._db.type == 'npc_sells') {
			return db.npcs.filter(n => n.id_sell_service == obj.id);
		}

		return [];
	}

	static undo(db, obj, path) {
		if (typeof path === 'string') {
			path = [ path ];
		}

		if (!obj._db.changesets || obj._db.changesets.length < 2) {
			/* never opened or never committed */
			return { pval: undefined, fn: () => {} };
		}

		const get_val = (o) => {
			for (const p of path) {
				if (typeof(o) !== 'object') {
					return undefined;
				}
				if (!(p in o)) {
					return undefined;
				}
				o = o[p];
			}
			return o ? o : null;
		};

		const set_val = (o, val) => {
			for (let p_idx = 0; p_idx < path.length - 1; p_idx++) {
				const p = path[p_idx];
				if (!(p in o) || typeof(o) !== 'object') {
					o[p] = {};
				}
				o = o[p];
			}
			const f = path[path.length - 1];
			if (typeof(o[f]) === 'object') {
				DB.apply_diff(o[f], val);
			} else {
				if (val === undefined || val === null) {
					val = '';
				}
				o[f] = val;
			}
		};

		/* find the changeset with this field (it might not be the last one) */
		let cur_gen = 0;
		for (let i = obj._db.changesets.length - 1; i >= db.project_changelog_start_gen; i--) {
			const c = obj._db.changesets[i];

			if (get_val(c._db.undone)) {
				continue;
			}

			const prev_val = get_val(c);
			if (prev_val === undefined) {
				/* no change in this changeset, continue looking */
				continue;
			}

			cur_gen = i;
			break;
		}

		/* find an even earlier changeset to undo to */
		let prev_val = undefined;
		let i;
		for (i = cur_gen - 1; i >= 0; i--) {
			const c = obj._db.changesets[i];

			if (get_val(c._db.undone)) {
				continue;
			}

			prev_val = get_val(c);
			if (prev_val === undefined && i > 0) {
				/* no change in this changeset, continue looking */
				continue;
			}

			if (prev_val === undefined) {
				/* undefined means un-undoable, and this was just unset before */
				prev_val = null;
			}
			break;
		}

		const fn = () => {
			db.open(obj);
			/* update obj */
			set_val(obj, prev_val);
			db.commit(obj);

			if (obj._db.changesets?.length) {
				/* mark all subsequent changes as non undo-able, otherwise
				 * undo will just always make a cycle */
				for (let j = Math.max(1, i + 1); j < obj._db.changesets.length; j++) {
					const c = obj._db.changesets[j];
					if (!c._db.undone) {
						c._db.undone = {};
					}
					set_val(c._db.undone, true);
				}
			}

		};

		if (prev_val === undefined && cur_gen > 0) {
			prev_val = null;
		}

		return { pval: prev_val, fn: fn };
	}

	static async load_db_file(type, url) {
		let final_resolve = null;

		if (PWDB.g_db_promises[type]) {
			return PWDB.g_db_promises[type];
		}

		PWDB.g_db_promises[type] = new Promise((r) => { final_resolve = r; });

		try {
			const cache = await IDB.open('db-cache', 1);
			g_db[type] = await IDB.get(cache, type);
		} catch (e) { }

		if (!g_db[type]) {
			/* fallback to loading the file */
			if (!url) {
				url = ROOT_URL + 'data/base/' + type + '.json';
			}
			url += '?v=' + MG_VERSION;
			console.log('fetching ' + url);
			const req = await get(url, { is_json: 1, headers: {
				"Content-Type": "application/json; charset=UTF-8"
			}});
			g_db[type] = req.data;

			/* save to cache */
			try {
				const cache = await IDB.open('db-cache', 1, 'readwrite');
				await IDB.set(cache, type, g_db[type]);
			} catch (e) { }
		}
		g_db[type] = init_id_array(g_db[type]);

		final_resolve();
	}

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
		if (args.preinit) {
			db[type].init();
		}

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
