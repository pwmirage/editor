/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2021 Darek Stojaczyk for pwmirage.com
 */

class PWDB {
	static async watch_db() {
		const cache_save_fn = () => {
			if (!db || !PWDB.has_unsaved_changes || !PWDB.loaded) {
				return;
			}

			const project = db.metadata[1];
			const dump = db.dump_last(PWDB.last_saved_changeset + 1, { spacing: 0 });
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
			if (!changes || changes.length < 5) {
				return;
			}

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
		PWDB.last_saved_changeset = 0;
		PWDB.type_fields = {};
		PWDB.type_names = {};
		PWDB.db_version = 12;

		/*
		PWDB.type_fields = [
			'string',
			'int',
			'float',
			'bool',
			'object',
			'arr',
			'id_ptr',
			'id_ptr_arr',
			'item_id_ptr',
			'item_id_ptr_arr',
			'pw_class',
		];
		*/

		PWDB.objsets = new Set();
	}

	static init_types() {
		const init_type_arr = (type, typename, arr) => {
			const fields = PWDB.type_fields[type] = {};
			PWDB.type_names[type] = typename;

			fields._removed = _b('_removed', 'Is Removed');
			fields.name = _s('name', 'Name');
			for (const fobj of arr) {
				fields[fobj.id] = fobj;
			}
		}

		const _s = (id, name) => ({ id, name, type: 0 });
		const _i = (id, name) => ({ id, name, type: 1 });
		const _f = (id, name) => ({ id, name, type: 2 });
		const _b = (id, name) => ({ id, name, type: 3 });
		const _obj = (id, name, schema) => ({ id, name, type: 4, schema });
		const _arr = (id, name, schema) => ({ id, name, type: 5, schema });
		const _id = (id, name, arr) => ({ id, name, type: 6, linked_arr: arr });
		const _id_arr = (id, name, arr) => ({ id, name, type: 7, linked_arr: arr });
		const _item = (id, name) => ({ id, name, type: 8, linked_arr: 'items' });
		const _item_arr = (id, name) => ({ id, name, type: 9, linked_arr: 'items' });
		const _pwclass = (id, name) => ({ id, name, type: 10 });

		init_type_arr('spawners_', 'Spawner', [
			_b('auto_respawn', 'Auto Respawn'),
			_b('auto_spawn', 'Auto Spawn'),
			_i('lifetime', 'Time till despawn'),
			_i('max_num', 'Max groups num'),
			_i('mob_type', 'Boss type'),
			_i('trigger', 'Trigger', 'triggers'),
		]);

		init_type_arr('npcs', 'NPC', [
			_s('file_model', 'Model' /* TODO */),
			_s('greeting', 'Greeting'),
			_id('base_monster_id', 'Base Monster', 'monsters' ),
			_i('combined_services', 'Other services'),
			_i('id_buy_service', 'Buy service'),
			_i('id_decompose_service', 'Decompose service'),
			_i('id_install_service', 'Install service'),
			_id('id_make_service', 'Crafts', 'npc_crafts'),
			_i('id_repair_service', 'Repair service'),
			_id('id_sell_service', 'Goods sold', 'npc_sells'),
			_id('id_task_in_service', 'Tasks completed list', 'npc_tasks_in'),
			_id('id_task_out_service', 'Tasks given list', 'npc_tasks_out'),
			_s('id_type', 'NPC Type', NPCWindow.types),
			_i('id_uninstall_service', 'Uninstall service'),
		]);

		init_type_arr('recipes', 'Recipe', [
			_i('duration', 'Craft time'),
			_i('major_type', 'Major type'), /* TODO */
			_i('minor_type', 'Minor type'),
			_i('num_to_make', 'Crafted item count'),
			_i('recipe_level', 'Recipe level'),
			_id('skill_id', 'Req. Crafting Skill', RecipeTooltip.craft_types),
			_i('skill_level', 'Req. Crafting Skill Level'),
			_i('xp', 'XP'),
			_i('sp', 'SP'),
		]);

		init_type_arr('npc_sells', 'Goods', [
			_s('option', 'NPC Option Name'),
		]);

		init_type_arr('npc_crafts', 'Crafts', [
			_s('option', 'NPC Option Name'),
		]);

		init_type_arr('mines', 'Resources', [
			_s('file_model', 'Model'),
			_id('id_type', 'Type', 'mines'),
			_item('item_required', 'Item required'),
			_i('level', 'Lv.'),
			_i('level_required', 'Req. Lv.'),
			_i('exp', 'XP Given'),
			_i('sp', 'SP Given'),
			_i('time_min', 'Min pick time'),
			_i('time_max', 'Max pick time'),
		]);

		const task_award_schema = [
			_i('coins', 'Coins'),
			_i('xp', 'XP'),
			_i('sp', 'SP'),
			_i('rep', 'Rep.'),
			_id('new_quest', 'New Quest', 'tasks'),
			_id('culti', 'Cultivation', TaskWindow.cultivation_levels),
			_i('new_waypoint', 'New waypoint'),
			_i('storage_slots', 'Bank Storage Slots'),
			_i('inventory_slots', 'Inventory Slots'),
			_i('petbag_slots', 'Pet Bag Slots'),
			_i('chi', 'Chi'),
			_obj('tp', 'TP', [
				_i('world', 'World ID'), /* TODO id */
				_f('x', 'X'),
				_f('y', 'Y'),
				_f('z', 'Z'),
			]),
			_i('ai_trigger', 'Trigger', 'triggers'),
			_b('level_dependant_xp', 'Level-dependant XP scaling'),
			_arr('item_groups', 'Item groups', [
					_b('chosen_randomly', 'One Random Item'),
					_arr('items', 'Items', [
						_i('amount', 'Count'),
						_item('id', 'Item'),
						_f('probability', 'Probability'),
					]),
				]),
			];

		init_type_arr('tasks', 'Quest', [
			_id('start_by', 'Start by', TaskWindow.tabs_obtain_ways),
			_id('avail_frequency', 'Repeatable', TaskWindow.avail_frequency_types),
			_id('type', 'Icon', TaskWindow.task_types),
			_i('time_limit_sec', 'Time limit (sec)'),
			_b('date_span_is_cyclic', 'TODO 0'),
			_s('date_types', 'TODO 1'),
			_id('subquest_activate_order', 'Subquest activation order', TaskWindow.tabs_sub_quest_activation),
			_b('on_fail_parent_fail', 'Fail parent on fail'),
			_b('on_success_parent_success', 'Succeed parent on success'),
			_b('can_give_up', 'Can give up'),
			_b('can_retake_after_failure', 'Can retake after failure'),
			_b('cant_retake_after_giving_up', 'Can retake after giving up'),
			_b('fail_on_death', 'Fail on death'),
			_i('simultaneous_player_limit', 'Simultaneous player limit'),
			_s('start_on_enter_world_id', 'TODO 2'),
			_s('start_on_enter_location', 'TODO 3'),
			_b('instant_teleport', 'TODO 4'),
			_i('instant_teleport_point', 'TODO 5'),
			_i('ai_trigger', 'Trigger on start', 'triggers'),
			_b('remove_premise_items', 'Remove premise items'),
			_i('recommended_level', 'TODO 6'),
			_b('no_display_quest_title', 'Don\'t show quest title'),
			_id('start_npc', 'Start NPC', 'npcs'),
			_id('finish_npc', 'Report to NPC', 'npcs'),
			_b('cant_be_found', 'Don\'t shown in "Find quest"'),
			_b('no_show_direction', 'Don\'t show direction arrow'),
			_i('premise_level_min', 'Prereq. level min.'),
			_i('premise_level_max', 'Prereq. level max.'),
			_b('show_without_level_min', 'Show even without level req.'),
			_b('show_without_premise_items', 'Show even without premise items'),
			_i('premise_coins', 'Prereq. coins'),
			_b('show_without_premise_coins', 'Show even without premise coins'),
			_i('premise_reputation_min', 'Prereq. reputation min.'),
			_i('premise_reputation_max', 'Prereq. reputation max.'),
			_b('show_without_premise_reputation', 'Show even without reputation req.'),
			_id_arr('premise_quests', 'Prereq. quests', 'tasks'),
			_b('show_without_premise_quests', 'Show even without premise quests'),
			_id('premise_cultivation', 'Prereq. cultivation', TaskWindow.cultivation_levels),
			_s('show_without_premise_cultivation', 'Show even without cultivation req.'),
			_id('premise_faction_role', 'Prereq. faction role', TaskWindow.faction_ranks),
			_s('show_without_premise_faction_role', 'Show even without faction role req.'),
			_id('premise_gender', 'Gender req.', TaskWindow.genders),
			_b('show_without_premise_gender', 'Show even for the other gender'),
			_pwclass('premise_class', 'Req. Class'),
			_b('show_without_class', 'Show even without req. class'),
			_b('premise_be_married', 'Prereq. be married'),
			_b('show_without_marriage', 'Show even without marriage'),
			_b('premise_be_gm', 'GM only'),
			_id_arr('mutex_quests', 'Mutually exclusive quests', 'tasks'),
			_i('premise_blacksmith_level', 'TODO 7'),
			_i('premise_tailor_level', 'TODO 8'),
			_i('premise_craftsman_level', 'TODO 9'),
			_i('premise_apothecary_level', 'TODO 10'),
			_i('team_recommended', 'TODO 11'),
			_b('recv_in_team_only', 'TODO 12'),
			_b('m_bSharedTask', 'TODO 13'),
			_b('m_bSharedAchieved', 'TODO 14'),
			_b('m_bCheckTeammate', 'TODO 15'),
			_i('m_fTeammateDist', 'TODO 16'),
			_s('m_bAllFail', 'TODO 17'),
			_s('m_bCapFail', 'TODO 18'),
			_s('m_bCapSucc', 'TODO 19'),
			_s('m_fSuccDist', 'TODO 20'),
			_s('m_bDismAsSelfFail', 'TODO 21'),
			_s('m_bRcvChckMem', 'TODO 22'),
			_s('m_fRcvMemDist', 'TODO 23'),
			_s('m_bCntByMemPos', 'TODO 24'),
			_s('m_fCntMemDist', 'TODO 25'),
			_b('show_without_premise_squad', 'Show even without squad req.'),
			_id('success_method', 'Goal', TaskWindow.tabs_goals),
			_i('req_coins', 'Required coins'),
			_i('m_ulNPCToProtect', 'TODO 26'),
			_i('m_ulProtectTimeLen', 'TODO 27'),
			_i('m_ulNPCMoving', 'TODO 28'),
			_i('m_ulNPCDestSite', 'TODO 29'),
			_s('reach_location', 'TODO 30'),
			_s('reach_location_world_id', 'TODO 31'),
			_i('req_wait_time', 'Wait time (sec)'),
			_id('award_type', 'Award type', TaskWindow.award_types),
			_s('date_spans', 'TODO 32'),
			_arr('premise_items', 'Prereq. Items', [
				_i('amount', 'Count'),
				_item('id', 'ID'),
			]),
			_arr('free_given_items', 'Free given items', [
				_i('amount', 'Count'),
				_item('id', 'ID'),
			]),
			_s('premise_squad', 'TODO 35'),
			_arr('req_monsters', 'Monsters to kill', [
				_id('id', 'Type', 'monsters'),
				_i('count', 'Count'),
				_item('drop_item_id', 'Dropped Item'),
				_i('drop_item_cnt', 'Item Count'),
				_f('drop_item_probability', 'Drop Probability'),
				_b('lvl_diff_gt8_doesnt_cnt', 'Don\'t count if mob/player lvl difference is >= 8'),
			]),
			_arr('req_items', 'Items to obtain', [
				_item('id', 'Item'),
				_i('amount', 'Count'),
			]),
			_obj('award', 'Reward', task_award_schema),
			_obj('failure_award', 'Award on failure', task_award_schema),
			_obj('timed_award', 'Timed Award', [
				_arr('time_spent_ratio', 'Time Spent Ratio', [ _i('', '') ]),
				_arr('awards', 'Awards', task_award_schema),
			]),
			_obj('failure_timed_award', 'Timed Award on failure', [
				_arr('time_spent_ratio', 'Time Spent Ratio', [ _i('', '') ]),
				_arr('awards', 'Awards', task_award_schema),
			]),
			_obj('scaled_award', 'Scaled Award'),
			_obj('failure_scaled_award', 'Scaled Award on failure'),
			_s('briefing', 'Description'),
			_s('description', 'Additional description'),
			_arr('dialogue', 'Dialogue',  [
				_s('initial', 'Initial'),
				_s('notqualified', 'Requirements not met'),
				_s('unfinished', 'In progress'),
				_s('ready', 'Ready to finish'),
			]),
			_id_arr('sub_quests', 'Sub quests', 'tasks'),
		]);

		init_type_arr('items', 'Item', [
			_s('file_model', 'Model'),
			_id('type', 'Type', Item.types_arr),
			_i('price', 'Price'),
			_i('shop_price', 'Shop Price'),
			_i('stack_max', 'Stack max.'),
			_i('proc_type', 'Item properties'),
			_s('desc', 'Description'),
			_i('fly_mode', 'Fly Mode (?)'),
			_i('require_level', 'Req. level'),
			_f('speed_increase_min', 'Speed min.'),
			_f('speed_increase_max', 'Speed max.'),
			_f('speed_rush_increase_min', 'Fash Speed min.'),
			_f('speed_rush_increase_max', 'Fash Speed max.'),
			_f('time_increase_per_element', 'Recharge per element'),
			_f('time_max_min', 'Fast Speed duration min.'),
			_f('time_max_max', 'Fast Speed duration max.'),
			_pwclass('character_combo_id', 'Req. Class'),
			_i('mp_launch', 'MP at launch'),
			_i('mp_per_second', 'MP per second'),
			_f('speed_increase', 'Speed'),
		]);
	}

	static get_linked_arr(linked_arr) {
		if (typeof(linked_arr) === 'string') {
			return db[linked_arr];
		} else {
			return linked_arr;
		}
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

	static load_changesets(db, changesets, { join_changesets } = {}) {
		const load_one = (change) => {
			/* convert legacy resource spawner IDs */
			if (change.id >= 100000 && change.id < 0x80000000 && change._db.type.startsWith('spawners_')) {
				change.id -= 100000 - db.type_info[change._db.type].resource_offset;
			}

			/* strip legacy (or sneaked in) ref counts */
			if (change._extra_ref) {
				delete change._extra_ref;
			}

			db.load_one(change);
		}

		if (!Array.isArray(changesets)) {
			return load_one(changesets);
		}

		for (const changeset of changesets) {
			if (!changeset) continue;
			if (!Array.isArray(changeset)) {
				load_one(changeset);
				continue;
			}

			for (const change of changeset) {
				if (!change) continue;
				load_one(change);
			}

			if (!join_changesets && changeset != changesets[changesets.length - 1]) {
				db.new_generation();
			}
		}
	}

	static async new_db(args) {
		PWDB.loaded = false;

		if (!args) {
			args = {};
		}

		if (args.pid == 'latest') {
			args.pid = 99;
			// todo load project/head
		}

		const db = new DB();
		this.db_promise = null;

		if (!PWDB.metadata_types) {
			PWDB.metadata_types = {
				project: 1,
				chooser_recent: 2,
				objset_modified: 3,
			};
		}

		const meta_arr = [
			{
				id: PWDB.metadata_types.project,
				tag: "project",
				pid: args.pid || 0,
				base: 0,
				edit_time: 0,
			},
			{
				id: PWDB.metadata_types.chooser_recent,
				tag: "chooser_recent",
				types: {},
			},
			{
				id: PWDB.metadata_types.objset_modified,
				tag: "objset",
				types: {},
				name: "All Modified",
				entries: {},
			},
		];

		const tag = args.no_tag ? null : Loading.show_tag('Loading PW data');

		const task_init_cb = (obj) => {
			if (!obj.premise_class) {
				obj.premise_class = 255;
			}
		};

		db.register_type('metadata', meta_arr);
		await Promise.all([
			PWDB.register_data_type(db, args, 'equipment_addons'),
			PWDB.register_data_type(db, args, 'monster_addons'),
		]);

		db.objects.clear();

		const idmap_meta_p = PWDB.load_db_file('idmap_meta');
		const spawners_p = PWDB.load_db_file('spawners');
		const triggers_p = PWDB.load_db_file('triggers');
		await Promise.all([
			idmap_meta_p,
			PWDB.register_data_type(db, args, 'mines'),
			PWDB.register_data_type(db, args, 'recipes'),
			PWDB.register_data_type(db, args, 'npc_sells'),
			PWDB.register_data_type(db, args, 'npc_crafts'),
			PWDB.register_data_type(db, args, 'npcs'),
			PWDB.register_data_type(db, args, 'monsters'),
			PWDB.register_data_type(db, args, 'items'),
			spawners_p,
			triggers_p,
			PWDB.register_data_type(db, args, 'weapon_major_types'),
			PWDB.register_data_type(db, args, 'weapon_minor_types'),
			PWDB.register_data_type(db, args, 'armor_major_types'),
			PWDB.register_data_type(db, args, 'armor_minor_types'),
			PWDB.register_data_type(db, args, 'decoration_major_types'),
			PWDB.register_data_type(db, args, 'decoration_minor_types'),
			PWDB.register_data_type(db, args, 'medicine_major_types'),
			PWDB.register_data_type(db, args, 'medicine_minor_types'),
			PWDB.register_data_type(db, args, 'projectile_types'),
			PWDB.register_data_type(db, args, 'quiver_types'),
			PWDB.register_data_type(db, args, 'armor_sets'),
			PWDB.register_data_type(db, args, 'npc_tasks_in'),
			PWDB.register_data_type(db, args, 'npc_tasks_out'),
			PWDB.register_data_type(db, {...args, init_cb: task_init_cb }, 'tasks'),
			PWDB.register_data_type(db, args, 'stone_types'),
			PWDB.register_data_type(db, args, 'monster_types'),
			PWDB.register_data_type(db, args, 'fashion_major_types'),
			PWDB.register_data_type(db, args, 'fashion_sub_types'),
			PWDB.register_data_type(db, args, 'gm_generator_types'),
			PWDB.register_data_type(db, args, 'pet_types'),
		]);

		const triggers = await triggers_p;
		for (const arr of triggers) {
			db.register_type('triggers_' + arr.tag, arr.entries);
		}

		const spawners = await spawners_p;
		for (const arr of spawners) {
			db.register_type('spawners_' + arr.tag, arr.entries);
		}

		const idmap_meta = await idmap_meta_p;
		for (const typename in idmap_meta.alias_offsets) {
			const off = idmap_meta.alias_offsets[typename];

			db.type_info[typename].alias_offset = off;
		}

		for (const typename in idmap_meta.resource_offsets) {
			const off = idmap_meta.resource_offsets[typename];

			db.type_info[typename].resource_offset = off;
		}

		if (tag) {
			Loading.try_cancel_tag(tag);
		}

		const project = db.metadata[PWDB.metadata_types.project];
		PWDB.objsets = new Set();

		for (const meta of db.metadata) {
			if (meta.tag !== 'objset') {
				continue;
			}

			PWDB.objsets.add(meta);
		}

		db.project_changelog_start_gen = 1;
		let project_changeset = null;
		if (!args.new) {
			if (project.pid > 0) {
				try {
					const req = await get(ROOT_URL + 'api/project/' + project.pid + '/load', { is_json: 1 });
					const changesets = req.data;
					const removed_objs = new Set();
					let i;
					for (i = 0; i < changesets.length - 1; i++) {
						const changeset = changesets[i];
						const proj_change = changeset[0][0];
						const pid = proj_change.pid;
						db.new_id_start = 0x80000000 + pid * 0x100000;
						db.new_id_offset = 0;
						PWDB.load_changesets(db, changesets[i], { join_changesets: true });
					}
					db.project_changelog_start_gen = db.changelog.length;

					for (const changeset of db.changelog) {
						for (const c of changeset) {
							const obj = c._db.obj;
							/* permanently clean up removed objects */
							if (obj._removed) {
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

					project_changeset = changesets[i];
				} catch (e) { }
			}

		}

		db.project_modified_objects = new Set();
		db.register_commit_cb((obj, diff, prev_vals) => {
			PWDB.has_unsaved_changes = true;

			if (diff.name && diff.name.includes('\n')) {
				/* no newlines in objects' names */
				obj.name = diff.name = diff.name.replace(/[\n\r]/g, '');
			}

			/* track objsets */
			if (obj._db.type === 'metadata' && obj.tag === 'objset') {
				if (obj._removed) {
					PWDB.objsets.delete(obj);
				} else {
					PWDB.objsets.add(obj);
				}
			}

			/* set project_initial_state */
			if (obj._db.type !== 'metadata' && !obj._db.project_initial_state) {
				if (diff._allocated) {
					PWDB.set_chooser_recent(obj._db.type, obj.id);
				}

				const state = DB.clone_obj(obj._db.changesets[0]);
				for (const c of obj._db.changesets) {
					if (c._db.generation == 0) {
						/* initial object state */
						continue;
					}

					if (c._db.generation >= db.project_changelog_start_gen) {
						break;
					}

					DB.apply_diff(state, c);
				}

				obj._db.project_initial_state = state;
			}

			/* setup undo history */
			const c = obj._db.changesets[obj._db.changesets.length - 1];
			if (c._db.undone) {
				for (const f in diff) {
					c._db.undone[f] = undefined;
				}
			}

			/* always put spawner type in the spawner's diff */
			if (obj._db.type.startsWith('spawners_') && obj.type == 'npc') {
				const changesets = obj._db.changesets;
				const last = changesets[changesets.length - 1];
				set_obj_field(last, [ 'groups', 0, 'type' ], obj?.groups?.[0]?.type || 0);
				last.type = obj.type;
			}

			let is_project_diff = undefined;
			switch (obj._db.type) {
				case 'metadata':
					is_project_diff = false;
					break;
				case 'npc_tasks_in':
				case 'npc_tasks_out': {
					const npc = db.npcs[obj.npc_id || 0];
					if (!npc) {
						break;
					}

					db.open(npc);
					const prevtasks = (obj._db.project_initial_state.tasks || []);
					const prevstate = (npc._db.project_initial_state?.[obj._db.type + '_changed'] || 0);
					const tasks = (obj.tasks || []);
					if (prevtasks.length != tasks.length) {
						npc[obj._db.type + '_changed'] = (parseInt(npc[obj._db.type + '_changed']) || 1) + 1;
					} else {
						const tasks_sorted = tasks.slice().sort();
						const prevtasks_sorted = prevtasks.slice().sort();
						npc[obj._db.type + '_changed'] =
							tasks_sorted.every((value, index) => {
								return value === prevtasks_sorted[index];
						}) ? prevstate : (parseInt(npc[obj._db.type + '_changed']) || 1) + 1;
					}
					db.commit(npc);

					is_project_diff = false;
					break;

				}
				case 'items': {
					/* trim fashion dir name */
					if (diff.realname) {
						const trimmed = obj.realname.trim();
						if (trimmed != obj.realname) {
							db.open(obj);
							obj.realname = trimmed;
							db.commit(obj);
						}
					}
					break;

				}
				case 'recipes': {
					/* we quietly integrate recipes into crafts */
					if (!obj.crafts || !db.npc_crafts[obj.crafts]) {
						/* unexpected? */
						break;
					}

					const is_diff = DB.is_obj_diff(obj, obj._db.project_initial_state);
					obj._db.is_diff = is_diff;

					/* modify crafts to show *their* marker instead */
					const crafts = db.npc_crafts[obj.crafts];
					let ref = 0;
					if (is_diff) {
						ref = 1;
					} else {
						for (let p = 0; p < 8; p++) {
							for (let i = 0; i < 32; i++) {
								const recipe_id = crafts?.pages?.[p]?.recipe_id?.[i];

								if (!recipe_id) {
									continue;
								}

								const r = db.recipes[recipe_id];
								if (!r || !r._db.project_initial_state) {
									continue;
								}

								if (r._db.is_diff) {
									ref = 1;
									p = 10;
									break;
								}
							}
						}
					}

					/* when extra_ref drops to 0, there will be no diff in crafts and its
					 * marker will disappear as well */
					db.open(crafts);
					crafts._extra_ref = ref;
					db.commit(crafts);

					is_project_diff = false;
					break;
				}
			}

			if (is_project_diff === undefined) {
				is_project_diff = DB.is_obj_diff(obj, obj._db.project_initial_state);
			}

			if (is_project_diff) {
				db.project_modified_objects.add(obj);
			} else {
				db.project_modified_objects.delete(obj);
			}
		});

		db.new_id_start = 0x80000000 + (args.pid || 0) * 0x100000;
		db.new_id_offset = 0;

		try {
			PWDB.last_saved_changeset = db.changelog.length - 1;
			if (project_changeset) {
				PWDB.load_changesets(db, project_changeset);

				PWDB.last_saved_changeset = db.changelog.length - 1;
				db.new_generation();

				if (typeof localStorage !== 'undefined') {
					const changeset_str = localStorage.getItem('pwdb_lchangeset_' + project.pid);
					if (changeset_str) {
						const changeset = JSON.parse(changeset_str);
						PWDB.load_changesets(db, changeset);
					}
				}
			} else {
				db.new_generation();
			}
		} catch (e) {
			console.error(e);
		}

		PWDB.sort_chooser_recent(db);
		PWDB.loaded = true;

		return db;
	}

	static async save(db, show_tag = true) {
		if (!PWDB.loaded) {
			return;
		}

		let project = db.metadata[1];
		if (!project || (!Editor.usergroups['maintainer'] && project.author_id != WCF.User.userID)) {
			if (show_tag) {
				Loading.notify('warning', 'Only the project author can save their changes.');
			}
			return false;
		}

		if (Editor.usergroups['maintainer'] && project.author_id != WCF.User.userID) {
			/* as a maintainer we can only browse published project with no place to "append" data
			 * on the go. Just store the changes locally, and send them to the server at the moment
			 * of publish */
			const data = db.dump_last(undefined, { spacing: 0 });
			if (data.length >= 5) {
				db.new_generation();
			}
			if (show_tag) {
				notify('success', 'Saved');
			}
			return true;
		}

		let data = db.dump_last(PWDB.last_saved_changeset + 1, { spacing: 0 });
		localStorage.removeItem('pwdb_lchangeset_' + project.pid);

		/* check if empty. <5 rules out [[]] and such */
		if (data.length < 5) {
			if (show_tag) {
				notify('success', 'Saved');
			}
			return true;
		}

		data = db.dump_last(PWDB.last_saved_changeset + 1, { spacing: 0 });
		const req = await post(ROOT_URL + 'api/project/' + project.pid + '/save', {
			is_json: 1, data: {
				file: new File([new Blob([data])], 'project.json', { type: 'application/json' }),
			}
		});

		if (!req.ok) {
			Loading.notify('error', req.data.err || 'Failed to save: unknown error');
			const dump = db.dump_last(PWDB.last_saved_changeset + 1, { spacing: 0 });
			localStorage.setItem('pwdb_lchangeset_' + project.pid, dump);
			return false;
		}

		PWDB.last_saved_changeset = db.changelog.length - 1;
		db.new_generation();
		if (show_tag) {
			notify('success', 'Saved');
		}

		return true;
	}

	static async publish(db, show_tag = true) {
		if (!PWDB.loaded) {
			return;
		}

		let project = db.metadata[1];
		if (!project || (!Editor.usergroups['maintainer'] && project.author_id != WCF.User.userID)) {
			Loading.notify('warning', 'This project is read-only.');
			return;
		}

		await PWDB.save(db, false);

		let req;
		if (Editor.usergroups['maintainer'] && project.author_id != WCF.User.userID) {
			let data = db.dump_last(PWDB.last_saved_changeset + 1, { spacing: 0 });
			localStorage.removeItem('pwdb_lchangeset_' + project.pid);

			/* check if empty. <5 rules out [[]] and such */
			if (data.length < 5) {
				if (show_tag) {
					notify('warning', 'Nothing to publish (?)');
				}
				return true;
			}

			const last_changeset = PWDB.last_saved_changeset;
			data = db.dump_last(last_changeset + 1, { spacing: 0 });
			PWDB.last_saved_changeset = db.changelog.length - 2;

			req = await post(ROOT_URL + 'api/project/' + project.pid + '/patch', {
				is_json: 1, data: {
					file: new File([new Blob([data])], 'project.json', { type: 'application/json' }),
				}
			});

			if (!req.ok) {
				PWDB.last_saved_changeset = last_changeset;
				const dump = db.dump_last(PWDB.last_saved_changeset + 1, { spacing: 0 });
				localStorage.setItem('pwdb_lchangeset_' + project.pid, dump);
			}
		} else {
			req = await post(ROOT_URL + 'api/project/' + project.pid + '/publish',
				{ is_json: 1 });
		}

		if (!req.ok) {
			Loading.notify('error', req.data.err || 'Failed to publish: unknown error');
			return;
		}

		if (show_tag) {
			notify('success', 'Published');
		}

		await Editor.refresh_project_info();
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
		} else if (obj._db.type == 'recipes') {
			return db.npc_crafts.filter(c => {
				for (const p of c.pages) {
					if (p) for (const rid of (p.recipe_id || [])) {
						if (rid == obj.id) {
							return true;
						}
					}
				}
			});
		} else if (obj._db.type.startsWith('triggers_')) {
			const mapid = obj._db.type.replace('triggers_', '');

			const usages = [];

			const arr = db['spawners_' + mapid];
			for (const i of arr) {
				if (i.trigger == obj.id) {
					usages.push(i);
				}
			}

			for (const t of db.tasks) {
				if (t.ai_trigger || (t.award && t.award.ai_trigger) || (t.failure_award && t.failure_award.ai_trigger)) {
					usages.push(t);
				}
			}

			return usages;
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
			return o;
		};

		const set_val = (o, val) => {
			for (let p_idx = 0; p_idx < path.length - 1; p_idx++) {
				const p = path[p_idx];
				if (typeof(o[p]) !== 'object') {
					o[p] = {};
				} else if (!(p in o)) {
					o[p] = {};
				}
				o = o[p];
			}
			const f = path[path.length - 1];
			if (typeof(o[f]) === 'object') {
				if (val) {
					DB.apply_diff(o[f], val);
				} else {
					o[f] = null;
				}
			} else {
				if (val === null) {
					val = '';
				}
				o[f] = val;
			}
		};

		/* find the changeset with this field (it might not be the last one) */
		let cur_gen = 0;
		let cur_val = undefined;
		for (let i = obj._db.changesets.length - 1; i >= 0; i--) {
			const c = obj._db.changesets[i];

			if (c._db.generation < db.project_changelog_start_gen) {
				break;
			}

			if (get_val(c._db.undone)) {
				continue;
			}

			const val = get_val(c);
			if (val === undefined) {
				/* no change in this changeset, continue looking */
				continue;
			}

			cur_val = val;
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
			if ((prev_val === undefined || prev_val == cur_val) && i > 0) {
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

			if (obj._db.changesets && obj._db.changesets.length) {
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

		if (prev_val === null && typeof(cur_val) === 'number') {
			prev_val = 0;
		}

		return { pval: prev_val, fn: fn };
	}

	static async load_db_file(type, url) {
		const req = await get(ROOT_URL + 'data/base/' + type + '.json', { is_json: 1 });
		return req.data;
	}

	static async register_data_type(db, args, type, url) {
		const data = await PWDB.load_db_file(type, url);
		db.register_type(type, data, args.init_cb);
	}

	static sort_chooser_recent(db, type = undefined) {
		const recent = db.metadata[PWDB.metadata_types.chooser_recent];
		const sort_arr = (type) => {
			const id_arr = recent.types[type];
			const obj_arr = db[type];

			if (!id_arr || !obj_arr) {
				return;
			}

			let idx = 0;
			for (const id of id_arr) {
				if (!obj_arr[id]) {
					continue;
				}

				obj_arr[id]._db.chooser_recent_idx = 1 + idx;
				idx++;
			}
		}

		if (type) {
			sort_arr(type);
		} else {
			for (const type in recent.types) {
				sort_arr(type);
			}
		}
	}

	static set_chooser_recent(type, id) {
		try {
			if (!db) {
				/* called while still loading, but no problem as we'll call
				 * sort_chooser_recent() afterwards */
				return;
			}
		} catch (e) {
			return;
		}

		const recent = db.metadata[PWDB.metadata_types.chooser_recent];

		if (!recent.types[type]) {
			/* no need to commit */
			recent.types[type] = [];
		}

		const arr = recent.types[type];

		const idx = arr.indexOf(id);
		db.open(recent);
		if (idx !== -1) {
			arr.splice(idx, 1);
			PWDB.sort_chooser_recent(db, type);
		} else if (db[type][id]) {
			db[type][id]._db.chooser_recent_idx = 1 + arr.length;
		}
		arr.push(id);
		db.commit(recent);
	}

	static async get_share_opts(obj) {
		const opts = { use_latest_state: 0 };
		let resp;

		const type = obj._db.type.replaceAll('_', '-');
		resp = await PWDB.get_shares({ obj_id: obj.id, obj_type: type });
		if (resp.ok && resp.data.length) {
			opts.share = resp.data[0];
		}

		resp = await get(ROOT_URL + 'latest_db/get/' + obj._db.type + '/' + obj.id, { is_json: 1 });
		let latest_obj = resp.data;
		let is_diff = DB.is_obj_diff(obj, latest_obj);

		const promises = [];
		switch(obj._db.type) {
			case 'npc_crafts':
				for (const p of (obj?.pages || [])) {
					for (const rid of (p?.recipe_id || [])) {
						if (!rid) {
							continue;
						}

						const r  = db.recipes[rid];
						if (!r) {
							continue;
						}

						const promise = get(ROOT_URL + 'latest_db/get/recipes/' + r.id, { is_json: 1 });
						promise.then((resp) => {
							is_diff = is_diff || DB.is_obj_diff(r, resp.data);
						});
						promises.push(promise);
					}
				}
				break;
			case 'npc_sells':
				for (const p of (obj?.pages || [])) {
					for (const rid of (p?.item_id || [])) {
						if (!rid) {
							continue;
						}

						const i  = db.items[rid];
						if (!i) {
							continue;
						}

						const promise = get(ROOT_URL + 'latest_db/get/items/' + i.id, { is_json: 1 });
						promise.then((resp) => {
							is_diff = is_diff || DB.is_obj_diff(i, resp.data);
						});
						promises.push(promise);
					}
				}
				break;
			case 'tasks':
				for (const ig of (obj?.award?.item_groups || [])) {
					for (const ie of (ig?.items || [])) {
						if (!ie.id) {
							continue;
						}

						const i  = db.items[ie.id];
						if (!i) {
							continue;
						}

						const promise = get(ROOT_URL + 'latest_db/get/items/' + i.id, { is_json: 1 });
						promise.then((resp) => {
							is_diff = is_diff || DB.is_obj_diff(i, resp.data);
						});
						promises.push(promise);
					}
				}
				break;
		}

		await Promise.all(promises);

		if (is_diff) {
			opts.use_latest_state = -1;
		}

		opts.exists_in_latest = !!latest_obj?.id;

		return opts;
	}

	static async get_shares({ obj_id, obj_type } = {}) {
		const resp = await post(ROOT_URL + 'api/project/' + Editor.current_project.id + '/getshare', {
			is_json: 1, data: {
				objectType: obj_type,
				objectID: obj_id,
				metadata: 1,
			}
		});
		return resp;
	}

	static async share_obj(obj_org, { force_update = false } = {}) {
		let resp;

		const obj = JSON.parse(DB.dump(obj_org, 0));
		const share = { opts: {}, obj: {}, aux: [] };
		share.obj = obj;

		switch(obj._db.type) {
			case 'npc_crafts':
				for (const p of (obj?.pages || [])) {
					for (const ridx in (p?.recipe_id || {})) {
						const rid = p.recipe_id[ridx];
						if (!rid) {
							continue;
						}

						const r = db.recipes[rid];
						if (!r?.targets?.[0].id) {
							p.recipe_id[ridx] = 0;
							continue;
						}

						share.aux.push(r);

						for (const iobj of [...r.targets, ...r.mats]) {
							if (!iobj?.id) {
								continue;
							}

							const i = db.items[iobj.id];
							share.aux.push(i);
						}
					}
				}
				break;
			case 'npc_sells':
				for (const p of (obj?.pages || [])) {
					for (const iid of (p?.recipe_id || [])) {
						if (!iid) {
							continue;
						}

						const i = db.items[iid];
						share.aux.push(i);
					}
				}
				break;
			case 'tasks':
				for (const ig of (obj_org?.award?.item_groups || [])) {
					for (const ie of (ig?.items || [])) {
						if (!ie.id) {
							continue;
						}

						const i = db.items[ie.id];
						share.aux.push(i);
					}
				}
				break;
			case 'items':
				break;
			default:
				return { data: { err: 'This object type can\'t be shared yet (not implemented)' } };
		}

		const data = DB.dump(share, 0);
		const type = obj._db.type.replaceAll('_', '-');
		resp = await post(ROOT_URL + 'api/project/' + Editor.current_project.id + '/share', {
			is_json: 1, data: {
				forceUpdate: 1,
				objectType: type,
				objectID: obj.id,
				file: new File([new Blob([data])], 'share.json', { type: 'application/json' }),
			}
		});

		return resp;
	}

	static add_objset_entry(objset, obj) {
		const key = obj._db.type + '_' + obj.id;
		if (objset.entries[key]) {
			/* nothing to do */
			return;
		}

		db.open(objset);
		objset.entries[key] = 1;
		db.commit(objset);
	}

	static remove_objset_entry(objset, obj) {
		const key = obj._db.type + '_' + obj.id;
		db.open(objset);
		objset.entries[key] = 0;
		db.commit(objset);
	}
}
