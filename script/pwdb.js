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
		PWDB.db_version = 6;
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
		];
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
			_i('premise_class', 'Prereq. class'),
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

	static async new_db(args) {
		PWDB.loaded = false;

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

		if (!PWDB.metadata_types) {
			PWDB.metadata_types = {
				project: 1,
				chooser_recent: 2,
			};
		}

		const project = {
			id: PWDB.metadata_types.project,
			tag: "project",
			pid: args.pid || 0,
			base: 0,
			edit_time: 0,
		};

		const chooser_recent = {
			id: PWDB.metadata_types.chooser_recent,
			tag: "chooser_recent",
			types: {},
		};

		let spawner_arrs = null;
		const spawners_tag = args.no_tag ? null : Loading.show_tag('Loading spawners');

		await Promise.all([
			db.register_type('metadata', init_id_array([project, chooser_recent])),
			PWDB.register_data_type(db, args, 'mines'),
			PWDB.register_data_type(db, args, 'recipes'),
			PWDB.register_data_type(db, args, 'npc_sells'),
			PWDB.register_data_type(db, args, 'npc_crafts'),
			PWDB.register_data_type(db, args, 'npcs'),
			PWDB.register_data_type(db, args, 'monsters'),
			PWDB.register_data_type(db, args, 'items'),
			PWDB.load_db_file('spawners'),
			PWDB.load_db_file('triggers'),
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
			PWDB.register_data_type(db, args, 'npc_tasks_in'),
			PWDB.register_data_type(db, args, 'npc_tasks_out'),
			PWDB.register_data_type(db, args, 'tasks'),
		]);

		if (args.preinit) {
			db.metadata.init();
		}

		for (const arr of g_db.spawners) {
			db.register_type('spawners_' + arr.tag, init_id_array(arr.entries));
			if (args.preinit) {
				db['spawners_' + arr.tag].init();
			}
		}

		for (const arr of g_db.triggers) {
			db.register_type('triggers_' + arr.tag, init_id_array(arr.entries));
			if (args.preinit) {
				db['triggers_' + arr.tag].init();
			}
		}

		if (spawners_tag) {
			Loading.try_cancel_tag(spawners_tag);
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
						db.load(changesets[i], { join_changesets: true });
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

		db.register_commit_cb((obj, diff, prev_vals) => {
			if (diff.name && diff.name.includes('\n')) {
				/* no newlines in objects' names */
				obj.name = diff.name = diff.name.replace(/[\n\r]/g, '');
			}

			if (obj._db.type != 'metadata' && !obj._db.project_initial_state) {
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

			const c = obj._db.changesets[obj._db.changesets.length - 1];
			if (c._db.undone) {
				for (const f in diff) {
					c._db.undone[f] = undefined;
				}
			}
			PWDB.has_unsaved_changes = true;

			if (obj._db.type === 'npc_tasks_in' || obj._db.type === 'npc_tasks_out') {
				const npc = db.npcs[obj.npc_id || 0];
				if (npc) {
					db.open(npc);
					const prevtasks = (obj._db.project_initial_state.tasks || []);
					const tasks = (obj.tasks || []);
					if (prevtasks.length != tasks.length) {
						npc[obj._db.type + '_changed'] = true;
					} else {
						const tasks_sorted = tasks.slice().sort();
						const prevtasks_sorted = prevtasks.slice().sort();
						npc[obj._db.type + '_changed'] =
							!tasks_sorted.every((value, index) => {
								return value === prevtasks_sorted[index];
						});
					}
					db.commit(npc);
				}
			}
		});

		db.new_id_start = 0x80000000 + project.pid * 0x100000;

		try {
			if (project_changeset) {
				db.load(project_changeset);
				db.new_generation();

				const changeset_str = localStorage.getItem('pwdb_lchangeset_' + project.pid);
				if (changeset_str) {
					const changeset = JSON.parse(changeset_str);
					db.load(changeset);
				}
			} else {
				db.new_generation();
			}
		} catch (e) {
			console.error(e);
		}

		PWDB.sort_chooser_recent(db);
		PWDB.last_saved_changeset = db.changelog.length - 2;
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

		db.open(project);
		project.edit_time = Math.floor(Date.now() / 1000);
		db.commit(project);

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
					notify('success', 'Saved');
				}
				return true;
			}

			db.open(project);
			project.edit_time = Math.floor(Date.now() / 1000);
			db.commit(project);

			data = db.dump_last(PWDB.last_saved_changeset + 1, { spacing: 0 });
			req = await post(ROOT_URL + 'api/project/' + project.pid + '/patch', {
				is_json: 1, data: {
					file: new File([new Blob([data])], 'project.json', { type: 'application/json' }),
				}
			});

			if (!req.ok) {
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
		let final_resolve = null;

		if (PWDB.g_db_promises[type]) {
			return PWDB.g_db_promises[type];
		}

		PWDB.g_db_promises[type] = new Promise((r) => { final_resolve = r; });

		try {
			const cache = await IDB.open('db-cache', PWDB.db_version);
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
				const cache = await IDB.open('db-cache', PWDB.db_version, 'readwrite');
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

}
