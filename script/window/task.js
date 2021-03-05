/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

const g_open_npc_tasks = new Set();
const g_task_tpl = load_tpl(ROOT_URL + 'tpl/window/task.tpl');

class TasksByNPCWindow extends Window {
	async init() {
		this.npc = this.args.npc;
		if (!this.args.debug && g_open_npc_tasks.has(this.npc)) return false;
		g_open_npc_tasks.add(this.npc);

		this.tasks_in = db.npc_tasks_in[this.npc.id_task_in_service || 0];
		this.tasks_out = db.npc_tasks_out[this.npc.id_task_out_service || 0];

		await g_task_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-tasks-by-npc');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, npc: this.npc, tasks_in: this.tasks_in, tasks_out: this.tasks_out });
		shadow.append(data);

		await super.init();
	}

	close() {
		g_open_npc_tasks.delete(this.npc);
		super.close();
	}

	print_task_by_id(tid) {
		const task = db.tasks[tid];
		if (!task) {
			return '(invalid) ' + serialize_db_id(tid);
		}

		const name = task?.name || '(unnamed)';
		return name.replace(/\^([0-9a-fA-F]{6})/g, '<span style="color: #$1">') + ' ' + serialize_db_id(tid);
	}
}

const g_open_tasks = new Set();
class TaskWindow extends Window {
	static task_types = init_id_array([
		{ id: 0, name: 'Normal' },
		{ id: 1, name: 'Cycle' },
		{ id: 2, name: 'Spiritual Cultivation' },
		{ id: 3, name: 'Hero' },
		{ id: 4, name: 'Challenge' },
		{ id: 5, name: 'Adventure' },
		{ id: 6, name: 'Errand' },
		{ id: 7, name: 'Legendary' },
		{ id: 8, name: 'Battle' },
		{ id: 9, name: 'Public' },
		{ id: 11, name: 'Faction' },
		{ id: 12, name: 'Daily' },
		{ id: 13, name: 'Event' },
		/* TODO add new types for repeatable quests like teleports, pack opening, etc */
	]);

	static date_span_types = init_id_array([
		{ id: 0, name: 'Date' },
		{ id: 1, name: 'Month' },
		{ id: 2, name: 'Week' },
		{ id: 3, name: 'Day' },
	]);

	static avail_frequency_types = init_id_array([
		{ id: 0, name: 'Once' }, /* XXX: only when "need record" is 1 */
		{ id: 1, name: 'Once a Day' },
		{ id: 2, name: 'Once a Week' },
		{ id: 3, name: 'Once a Month' },
		{ id: 4, name: 'Once a Minute' },
		{ id: 5, name: 'Once an Hour' },
		{ id: 6, name: 'Always' }, /* XXX set to 0, then set "need record" to 0 */
	]);

	static cultivation_levels = init_id_array([
		{ id: 0, name: "None" },
		{ id: 1, name: "(9) Spiritual Adept" },
		{ id: 2, name: "(19) Aware of Principle" },
		{ id: 3, name: "(29) Aware of Harmony" },
		{ id: 4, name: "(39) Aware of Discord" },
		{ id: 5, name: "(49) Aware of Coalescence" },
		{ id: 6, name: "(59) Transcendant" },
		{ id: 7, name: "(69) Enlightened One" },
		{ id: 8, name: "(79) Aware of Vacuity" },
		{ id: 20, name: "(89) Aware of Myriad" },
		{ id: 30, name: "(89) Aware of the Void" },
		{ id: 21, name: "(99) Master of Harmony" },
		{ id: 31, name: "(99) Master of Discord" },
		{ id: 22, name: "(100) Celestial Sage" },
		{ id: 32, name: "(100) Celestial Demon" },
	]);

	static faction_ranks = init_id_array([
		{ id: 0, name: "None" },
		{ id: 2, name: "Leader" },
		{ id: 2, name: "Leader" },
		{ id: 3, name: "Director" },
		{ id: 4, name: "Marshal" },
		{ id: 5, name: "Executor" },
		{ id: 6, name: "Comissioner" },
	]);

	static genders = init_id_array([
		{ id: 0, name: "Any" },
		{ id: 1, name: "Male" },
		{ id: 2, name: "Female" },
	]);

	static classes = init_id_array([
		{ id: 0, name: "Blademaster" },
		{ id: 1, name: "Wizard" },
		{ id: 3, name: "Venomancer" },
		{ id: 4, name: "Barbarian" },
		{ id: 6, name: "Archer" },
		{ id: 7, name: "Cleric" },
	]);

	static tabs_obtain_ways = init_id_array([
		{ id: 0, name: "By parent" },
		{ id: 1, name: "Auto" },
		{ id: 2, name: "Talk to NPC" },
		{ id: 3, name: "Reach Location" },
		{ id: 4, name: "By Death" },
	]);

	static tabs_goals = init_id_array([
		{ id: 3, name: "None" },
		{ id: 5, name: "Wait" },
		{ id: 2, name: "Obtain Regular Items" },
		{ id: 1, name: "Kill Monsters" },
		{ id: 4, name: "Reach Location" },
	]);

	static tabs_sub_quest_activation = init_id_array([
		{ id: 0, name: "All at once" },
		{ id: 1, name: "As specified" },
		{ id: 2, name: "Randomly" },
		{ id: 3, name: "One by one, first to last" },
	]);

	async init() {
		let task = this.args.task;

		while (task?.parent_quest) {
			task = db.tasks[task.parent_quest];
		}

		if (!task) {
			throw new Error('Task without a valid parent: ' + task.id);
		}

		this.root_task = task;
		this.task = this.args.task;
		if (!this.args.debug && g_open_tasks.has(this.root_task)) return false;
		g_open_tasks.add(this.root_task);

		this.selected_task = this.args.task;
		this.next_tasks = db.tasks.filter(t => t.premise_quests?.includes(this.task.id));
		this.sel_opts = {};

		await g_task_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-tasks');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, task, root_task: this.root_task });
		shadow.append(data);

		this.shadow.querySelector('#container .task.root > a').click();

		await super.init();
	}

	tpl_compile_cb(dom) {
		super.tpl_compile_cb(dom);
		for (const task of dom.querySelectorAll('.task')) {
			const id = parseInt(task.dataset.id);
			if (id == this.task.id) {
				task.classList.add('focused');
				/* XXX: for some reason the above CSS rule doesn't apply to child */
				task.firstChild.classList.add('focused');
				break;
			}
		}
	}

	static print_task_name(name) {
		return name.replace(/\^([0-9a-fA-F]{6})/g, '<span style="color: #$1">');
	}

	static print_task_by_id(tid) {
		const task = db.tasks[tid];
		if (!task) {
			return '(invalid) ' + serialize_db_id(tid);
		}

		const name = task?.name || '(unnamed)';
		return name.replace(/\^([0-9a-fA-F]{6})/g, '<span style="color: #$1">') + ' ' + serialize_db_id(tid);
	}

	select_tab(tab_type, id) {
		const tabs = this.shadow.querySelector('.tab_menu.' + tab_type);
		if (!tabs) {
			return;
		}

		const el = [...tabs.children].find(el => el.dataset.id == id);
		const t = this.task;

		for (const active of this.shadow.querySelectorAll('.tab_menu.' + tab_type + ' > .active')) {
			active.classList.remove('active');
			(active.querySelector('input[type="radio"]') || {}).checked = false;
		}

		el.classList.add('active');
		(el.querySelector('input[type="radio"]') || {}).checked = true;
		this.sel_opts[tab_type] = id;

		if (tab_type == 'start_by') {
			const btn = this.shadow.querySelector('#start_by_btn');
			if (id == 0 || id == 1) {
				btn.style.visibility = 'hidden';
			} else if (id == 2) {
				btn.style.visibility = 'visible';
				btn.textContent = 'NPC: ' + (db.npcs[this.task.start_npc || 0]?.name || '(none)');
			} else if (id == 3) {
				btn.style.visibility = 'visible';
				btn.textContent = 'Reach: (not implemented yet!)'
			} else if (id == 4) {
				btn.style.visibility = 'hidden';
			}
			db.open(t);
			t._start_by = id;
			db.commit(t);
		} else if (tab_type == 'goal') {
			const tabs = this.shadow.querySelector('.tabs.goal');
			for (const c of tabs.children) {
				c.classList.remove('active');
			}
			tabs.children[id].classList.add('active');

			db.open(t);
			t.success_method = id;
			db.commit(t);
		}
	}

	onclick_start_by(el, e) {
		const opt = this.sel_opts.start_by || 0;

		if (opt == 2) {
			if (e.which == 1) {
				const npc = db.npcs[this.task.start_npc];
				HTMLSugar.open_edit_rmenu(el,
					npc, 'npcs', {
					pick_win_title: 'Pick new start NPC for quest ' + (this.task.name || '') + ' ' + serialize_db_id(this.task.id),
					update_obj_fn: (new_obj) => {
						const s = this.task;
						db.open(s);

						s.start_npc = new_obj?.id || 0;

						db.commit(s);
						this.select_tab('start_by', opt);

					},
					edit_obj_fn: (new_obj) => {
						NPCWindow.open({ npc: new_obj });
					},
					usage_name_fn: (spawner) => {
						const mapid = spawner._db.type.substring('spawners_'.length);
						const mapname = PWMap.maps[mapid]?.name || '(unknown?)';
						return mapname + ': ' + (spawner.name ? (spawner.name + ' ') : '') + serialize_db_id(spawner.id);
					}
				});
			} else if (e.which == 3) {
				HTMLSugar.open_undo_rmenu(el, this.task, {
					undo_path: [ 'start_npc' ],
					undo_fn: () => this.select_tab('start_by', opt)
				});
			}
		}
	}

	select_subquest(e) {
		for (const active of this.shadow.querySelectorAll('#container .active')) {
			active.classList.remove('active');
		}

		let el = e.path.find(el => el.classList?.contains('taskbtn'));
		if (!el) {
			/* no particular quest clicked, just the list background */
			return;
		}
		/* navigate back to .task */
		el = el.parentNode;

		let t = this.root_task;
		let indices = [];

		while (el.id != 'root_task') {
			indices.push(parseInt(el.dataset.idx));

			el = el.parentNode; /* ul */
			el = el.parentNode; /* task */
		}

		for (const idx of indices.reverse()) {
			const t_id = t.sub_quests[idx];
			t = db.tasks[t_id];
		}

		this.task = t;
		this.tpl.reload('.header > span', { task: t });
		this.tpl.reload('#container', { task: t });

		this.select_tab('start_by', this.task._start_by || 0);
		this.select_tab('goal', this.task.success_method || 0);
		this.select_tab('sub_quest_activation', this.task.subquest_activate_order || 0);

		e.stopPropagation();
	}

	static print_subquests(parent) {
		if (!parent.sub_quests?.length) {
			return '';
		}

		let ret = '<ul>';
		let idx = 0;
		for (const sub_id of (parent.sub_quests || [])) {
			const sub = db.tasks[sub_id];
			ret += '<li class="task" data-id="' + sub_id + '" data-idx="' + idx + '">';
			ret += '<a class="taskbtn">' + TaskWindow.print_task_name(sub.name) + ' ' + serialize_db_id(sub.id) + '</a>'
			ret += TaskWindow.print_subquests(sub);
			ret += '</li>';
			idx++;
		}
		ret += '</ul>';

		return ret;
	}

	item_onclick(type, idx, e) {
		const item = this.task.premise_items?.[idx];
		const el = e.path[0];

		if (e.which == 1) {
			const obj = db.items[item?.id || 0];

			HTMLSugar.open_edit_rmenu(el,
				obj, 'items', {
				pick_win_title: 'Pick new item for ' + (this.task.name || 'Task') + ' ' + serialize_db_id(this.task.id),
				update_obj_fn: (new_obj) => {
					const t = this.task;
					db.open(t);

					if (!t.premise_items) {
						t.premise_items = [];
					}

					if (!t.premise_items[idx]) {
						t.premise_items[idx] = {};
					}

					t.premise_items[idx].id = new_obj?.id || 0;

					db.commit(t);
					this.tpl.reload('#premise_items');
				},
				edit_obj_fn: (new_obj) => {
					ItemTooltipWindow.open({ item: new_obj, edit: true, db });
				},
				usage_name_fn: (item) => {
					return (item.name || '') + ' ' + serialize_db_id(item.id);
				},
			});
		} else if (e.which == 3) {
			HTMLSugar.open_undo_rmenu(el, this.task, {
				undo_path: [ 'premise_items', idx, 'id' ],
				undo_fn: () => this.tpl.reload('#premise_items')
			});
		}
	}

	async item_ondblclick(type, idx, e) {
		const el = e.path[0];

		Item.hide_tooltips();
		RMenuWindow.enable_all(false);
		/* delay to not let the rmenu steal the focus - for some reason we can't get it back programatically */
		await sleep(100);
		const sel_id = await HTMLSugar.show_select({ win: this, around_el: el, around_margin: 5, container: db.items });
		RMenuWindow.enable_all(true);
		if (!sel_id) {
			return;
		}

		const t = this.task;
		db.open(t);
		if (!t.premise_items) {
			t.premise_items = [];
		}

		if (!t.premise_items[idx]) {
			t.premise_items[idx] = {};
		}

		t.premise_items[idx].id = sel_id;

		db.commit(t);
		this.tpl.reload('#premise_items');
	}

	item_add_onclick(type, idx) {
		const item_arr = this.task.premise_items;

		let f_idx;
		for (f_idx = 0; f_idx < item_arr.length; f_idx++) {
			if (!item_arr[f_idx]?.id) {
				break;
			}
		}

		item_arr[f_idx] = { id: 13188 };
		this.tpl.reload('#premise_items');
	}

	close() {
		g_open_tasks.delete(this.root_task);
		super.close();
	}
}
