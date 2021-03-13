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
		{ id: 0, name: 'Never' },
		{ id: 6, name: 'Always' },
		{ id: 1, name: 'Once a Day' },
		{ id: 2, name: 'Once a Week' },
		{ id: 3, name: 'Once a Month' },
		{ id: 4, name: 'Once a Minute' },
		{ id: 5, name: 'Once an Hour' },
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
		{ id: 2, name: "A random one" },
		{ id: 3, name: "One by one, first to last" },
	]);

	static dialogue_choice_opts = init_id_array([
		{ id: 0x80000000, "name": "Exit talk" },
		{ id: 0x80000001, "name": "NPC_SELL" },
		{ id: 0x80000002, "name": "NPC_BUY" },
		{ id: 0x80000003, "name": "NPC_REPAIR" },
		{ id: 0x80000004, "name": "NPC_INSTALL" },
		{ id: 0x80000005, "name": "NPC_UNINSTALL" },
		{ id: 0x80000006, "name": "Start quest", param: true },
		{ id: 0x80000007, "name": "Finish quest", param: true },
		/* { id: 0x80000008, "name": "NPC_GIVE_TASK_MATTER" }, unused */
		{ id: 0x80000009, "name": "NPC_SKILL" },
		{ id: 0x8000000a, "name": "NPC_HEAL" },
		{ id: 0x8000000b, "name": "NPC_TRANSMIT" },
		{ id: 0x8000000c, "name": "NPC_TRANSPORT" },
		{ id: 0x8000000d, "name": "NPC_PROXY" },
		{ id: 0x8000000e, "name": "NPC_STORAGE" },
		{ id: 0x8000000f, "name": "NPC_MAKE" },
		{ id: 0x80000010, "name": "NPC_DECOMPOSE" },
		{ id: 0x80000011, "name": "Prev. dialogue" },
		{ id: 0x80000012, "name": "Exit talk" },
		{ id: 0x80000013, "name": "NPC_STORAGE_PASSWORD" },
		{ id: 0x80000014, "name": "NPC_IDENTIFY" },
		{ id: 0x80000015, "name": "Give up quest", param: true },
		{ id: 0x80000016, "name": "NPC_WAR_TOWERBUILD" },
		{ id: 0x80000017, "name": "NPC_RESETPROP" },
		{ id: 0x80000018, "name": "NPC_PETNAME" },
		{ id: 0x80000019, "name": "NPC_PETLEARNSKILL" },
		{ id: 0x8000001a, "name": "NPC_PETFORGETSKILL" },
		{ id: 0x8000001b, "name": "NPC_EQUIPBIND" },
		{ id: 0x8000001c, "name": "NPC_EQUIPDESTROY" },
		{ id: 0x8000001d, "name": "NPC_EQUIPUNDESTROY" },
	]);

	static award_types = init_id_array([
		{ id: 0, name: "Normal" },
		{ id: 1, name: "Dep. on mob/item count" },
		{ id: 2, name: "Dep. on time spent" },
	]);

	static award_item_types = init_id_array([
		{ id: 0, name: "Fixed Items" },
		{ id: 1, name: "Random Items" },
		{ id: 2, name: "Chooser" },
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

		await super.init();

		this.shadow.querySelector('#container .task.root > a').click();

		this.scroll_ctx = { el: null, top: 0, left: 0, x: 0, y: 0 };
		this.mousemove_fn = (e) => this.onmousemove(e);
		this.mouseup_fn = (e) => this.onmouseup(e);
		document.addEventListener('mousemove', this.mousemove_fn);
		document.addEventListener('mouseup', this.mouseup_fn);
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

		const dialogue = dom.className == 'dialogue-diagram' ? dom : dom.querySelector('.dialogue-diagram');
		if (dialogue) {
			dialogue.onmousedown = (e) => {
				this.scroll_ctx.el = dialogue;
				this.scroll_ctx.left = dialogue.scrollLeft;
				this.scroll_ctx.top = dialogue.scrollTop;
				this.scroll_ctx.x = e.clientX;
				this.scroll_ctx.y = e.clientY;

				window.getSelection().empty();
				e.preventDefault();
			};

			for (const span of dialogue.querySelectorAll('li > span')) {
				const node = span.parentNode;
				const type = node.className;
				const id = parseInt(node.dataset.id || 0);
				let d = this.task.dialogue?.[this.sel_opts.dialogue || 'unfinished'];

				span.onmousedown = (e) => e.stopPropagation();

				if (type == 'start') {
					span.onclick = async (e) => {
						if (e.which != 3) {
							return;
						}

						const win = await RMenuWindow.open({
						x: e.clientX - Window.bounds.left, y: e.clientY - Window.bounds.top, bg: false,
						entries: [
							{ id: 1, name: 'Add dialogue', disabled: d?.questions?.filter(q => q.text || q.choices?.filter(c => c.id != 0)?.length)?.length },
						]});
						const sel = await win.wait();
						switch(sel) {
							case 1:
								db.open(this.task);

								const newq = set_obj_field(this.task, [ 'dialogue', this.sel_opts.dialogue, 'questions', 0 ], { });
								newq.id = 1;
								newq.text = ' ';
								newq.parent_id = -1;

								db.commit(this.task);
								this.select_tab('dialogue', this.sel_opts.dialogue);
								break;
						}
					};
					span.oncontextmenu = (e) => { span.onclick(e); return false; };
				} else if (type == 'question') {
					const q = d.questions.find(q => q?.id == id);
					span.oninput = (e) => {
						db.open(this.task);
						q.text = span.innerText;
						db.commit(this.task);
					};
					span.onclick = async (e) => {
						if (e.which != 3) {
							return;
						}

						const win = await RMenuWindow.open({
						x: e.clientX - Window.bounds.left, y: e.clientY - Window.bounds.top, bg: false,
						entries: [
							{ id: 1, name: 'Add choice' },
							{ id: 2, name: 'Remove', disabled: q.choices?.filter(c => c.id != 0)?.length },
						]});
						const sel = await win.wait();
						switch(sel) {
							case 1:
								db.open(this.task);

								if (!q.choices) {
									q.choices = [];
								}
								let c = q.choices.find(c => c.id == 0);
								if (!c) {
									c = { id: 0, text: "", param: 0 };
									q.choices.push(c);
								}
								c.id = -1;

								db.commit(this.task);
								this.select_tab('dialogue', this.sel_opts.dialogue);
								break;
							case 2:
								db.open(this.task);
								if (q.parent_id != -1) {
									const parent_q = d.questions.find(tmpq => tmpq.id == q.parent_id);
									const parent_c = parent_q.choices.find(c => c.id == q.id);
									parent_c.id = 0;
								}
								q.id = 0;
								q.text = "";
								db.commit(this.task);
								this.select_tab('dialogue', this.sel_opts.dialogue);
								break;

						}
					};
					span.oncontextmenu = (e) => { span.onclick(e); return false; };
				} else if (type == 'choice') {
					const q_node = node.parentNode.parentNode; /* li.choice -> ul -> li.question */
					const q_id = parseInt(q_node.dataset.id || 0);
					const q = d.questions.find(q => q?.id == q_id);
					const q_idx = d.questions.findIndex((_q) => _q == q);

					const c_idx = id;
					const c = q.choices[c_idx];

					span.oninput = (e) => {
						db.open(this.task);
						c.text = span.innerText;
						db.commit(this.task);
					};

					span.onclick = async (e) => {
						if (e.which != 3) {
							return;
						}

						if (e.path[0].tagName == 'INPUT') {
							e.path[0].onclick(e);
							return;
						}

						const win = await RMenuWindow.open({
						x: e.clientX - Window.bounds.left, y: e.clientY - Window.bounds.top, bg: false,
						entries: [
							{ id: 1, name: 'Add dialogue', disabled: c.id > 0 && c.id < 0x80000000 },
							{ id: 3, name: 'Set function', disabled: c.id > 0 && c.id < 0x80000000 },
							{ id: 2, name: 'Remove', disabled: c.id > 0 && c.id < 0x80000000 },
						]});
						const b = win.full_bounds;
						const sel = await win.wait();
						switch(sel) {
							case 1:
								db.open(this.task);
								let newq = d.questions.find(q => q.id == 0);
								if (!newq) {
									newq = { id: 0, text: "" };
									d.questions.push(newq);
								}
								newq.id = Math.max(... (d.questions.map(q => q.id) || [0])) + 1;

								/* link the dialogue to the choice (and it's parent dialogue) */
								newq.parent_id = q_id;
								c.id = newq.id;

								db.commit(this.task);
								this.select_tab('dialogue', this.sel_opts.dialogue);
								break;
							case 3:
								let functions;
								if (this.sel_opts.dialogue == 'initial') {
									functions = init_id_array([
										TaskWindow.dialogue_choice_opts[0x80000006], /* start q */
										TaskWindow.dialogue_choice_opts[0x80000011], /* previous dialogue */
										TaskWindow.dialogue_choice_opts[0x80000012], /* exit dialogue */
									]);
								} else if (this.sel_opts.dialogue == 'notqualified' || this.sel_opts.dialogue == 'unfinished') {
									functions = init_id_array([
										TaskWindow.dialogue_choice_opts[0x80000006], /* start q */
										TaskWindow.dialogue_choice_opts[0x80000007], /* finish q */
										TaskWindow.dialogue_choice_opts[0x80000011], /* previous dialogue */
										TaskWindow.dialogue_choice_opts[0x80000000], /* exit dialogue */
									]);
								} else if (this.sel_opts.dialogue == 'ready') {
									functions = init_id_array([
										TaskWindow.dialogue_choice_opts[0x80000006], /* start q */
										TaskWindow.dialogue_choice_opts[0x80000007], /* finish q */
										TaskWindow.dialogue_choice_opts[0x80000011], /* previous dialogue */
										TaskWindow.dialogue_choice_opts[0x80000000], /* exit dialogue */
										TaskWindow.dialogue_choice_opts[0x80000015], /* give up q */
									]);
								}

								const sel_id = await HTMLSugar.show_select({ win: this, around_el: span, around_margin: 5, container: functions });
								c.id = sel_id;
								c.param = this.task.id;
								this.select_tab('dialogue', this.sel_opts.dialogue);
								break;
							case 2:
								db.open(this.task);
								c.id = 0;
								c.text = "";
								db.commit(this.task);
								this.select_tab('dialogue', this.sel_opts.dialogue);
								break;

						}
					};
					span.oncontextmenu = (e) => { span.onclick(e); return false; };

					let input = span.nextSibling?.nextSibling?.firstElementChild;
					if (input?.tagName == 'INPUT') {
						input.oninput = (e) => {
							let id = input.value;
							const parsed_id = parse_db_id(id);
							if (parsed_id != NaN) {
								id = parsed_id;
							}

							/* put either the integer, or an int */
							db.open(this.task);
							c.param = id;
							db.commit(this.task);
						}

						input.onclick = (e) => {
							if (e.which != 3) {
								return;
							}

							HTMLSugar.open_undo_rmenu(e.path[0], this.task, {
								undo_path: [ 'dialogue', this.sel_opts.dialogue, 'questions', q_idx, 'choices', c_idx, 'param' ],
								undo_fn: () => this.select_tab('dialogue', this.sel_opts.dialogue)

							});
							e.stopPropagation();
						}
					}
				}
			}

			const start_b = dialogue.querySelector('.start > span').getBoundingClientRect();
			const dialogue_b = dialogue.getBoundingClientRect();

			dialogue.scrollLeft = (start_b.left - dialogue_b.left) - dialogue_b.width / 2;
		}
	}

	onmousemove(e) {
		if (!this.scroll_ctx.el) {
			return;
		}

		const c = this.scroll_ctx;
		const dx = e.clientX - c.x;
		const dy = e.clientY - c.y;

		c.el.scrollTop = c.top - (e.clientY - c.y);
		c.el.scrollLeft = c.left - (e.clientX - c.x);
	}

	onmouseup(e) {
		this.scroll_ctx.el = null;
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

	add_quest(type) {
		db.open(this.task);
		if (type == 'premise') {
			if (!this.task.premise_quests) {
				this.task.premise_quests = [];
			}
			this.task.premise_quests.push(0);
		} else {
			if (!this.task.mutex_quests) {
				this.task.mutex_quests = [];
			}
			this.task.mutex_quests.push(0);
		}
		db.commit(this.task);

		if (type == 'premise') {
			this.tpl.reload('#premise_quests');
		} else {
			this.tpl.reload('#mutex_quests');
		}
	}

	remove_quest(type, idx) {
		db.open(this.task);
		if (type == 'premise') {
			this.task.premise_quests[idx] = 0;
			cleanup_arr(this.task.premise_quests);
		} else {
			this.task.mutex_quests[idx] = 0;
			cleanup_arr(this.task.mutex_quests);
		}
		db.commit(this.task);

		if (type == 'premise') {
			this.tpl.reload('#premise_quests');
		} else {
			this.tpl.reload('#mutex_quests');
		}
	}

	select_tab(tab_type, id) {
		const tab_headers = this.shadow.querySelector('.tab_menu.' + tab_type);
		if (!tab_headers) {
			return;
		}

		const el = [...tab_headers.children].find(el => el.dataset.id == id);
		const t = this.task;

		for (const active of this.shadow.querySelectorAll('.tab_menu.' + tab_type + ' > .active')) {
			active.classList.remove('active');
			(active.querySelector('input[type="radio"]') || {}).checked = false;
		}

		el.classList.add('active');
		(el.querySelector('input[type="radio"]') || {}).checked = true;
		this.sel_opts[tab_type] = id;

		const tabs = this.shadow.querySelector('.tabs.' + tab_type);
		if (tabs) {
			for (const c of tabs.children) {
				c.classList.remove('active');
			}
			tabs.children[id].classList.add('active');
			tabs.style.display = tabs.children[id].innerText.trim() ? '' : 'none';
		}

		if (tab_type == 'start_by') {
			db.open(t);
			t.start_by = id;
			db.commit(t);
		} else if (tab_type == 'goal') {
			db.open(t);
			t.success_method = id;
			db.commit(t);
		} else if (tab_type == 'dialogue') {
			this.tpl.reload('.dialogue-diagram');
			const npc_id = id == 'ready' ? this.task.finish_npc : this.task.start_npc;
			const npc_name = db.npcs[npc_id || 0]?.name || '(unnamed)';
			this.shadow.querySelector('.dialogue-diagram li.start > span').textContent = npc_id ? (npc_name + ' ' + serialize_db_id(npc_id)) : '(no npc)';
		}
	}

	async select_subquest(e) {
		let el = e.path.find(el => el.classList?.contains('taskbtn'));
		if (!el) {
			/* no particular quest clicked, just the list background */
			return;
		}
		/* navigate back to .task */
		el = el.parentNode;

		const t_id = parseInt(el.dataset.id);
		const t = db.tasks[t_id];

		const sel_active_q = (t) => {
			this.task = t;
			if (this.task.award?.item_groups?.length > 1) {
				this.award_item_type = 2;
			} else if (this.task.award?.item_groups?.[0]?.chosen_randomly) {
				this.award_item_type = 1;
			} else {
				this.award_item_type = 0;
			}

			this.tpl.reload('.header > span', { task: t });
			this.tpl.reload('#container', { task: t });

			this.select_tab('start_by', this.task.start_by || 0);
			this.select_tab('goal', this.task.success_method || 3);
			this.select_tab('sub_quest_activation', this.task.subquest_activate_order || 0);
			this.select_tab('dialogue', !this.task.parent_quest ? 'initial' : (this.task.sub_quests?.length ? 'unfinished' : 'ready'));
		};

		if (e.which == 1) {
			sel_active_q(t);
			e.stopPropagation();
		} else if (e.which == 3) {
			const can_move_up = () => {
				const pt = db.tasks[t.parent_quest];
				if (!pt) {
					return false;
				}

				const t_idx = pt.sub_quests.findIndex(_tid => _tid == t.id);
				return t_idx > 0;
			};

			const can_move_down = () => {
				const pt = db.tasks[t.parent_quest];
				if (!pt) {
					return false;
				}

				const t_idx = pt.sub_quests.findIndex(_tid => _tid == t.id);
				return t_idx != pt.sub_quests.length - 1;
			};

			const win = await RMenuWindow.open({
			around_el: el.firstChild, bg: false,
			entries: [
				{ id: 1, name: 'Add next', disabled: !t.parent_quest },
				{ id: 2, name: 'Add child' },
				{ id: 3, name: 'Move up', disabled: !can_move_up() },
				{ id: 4, name: 'Move down', disabled: !can_move_down() },
				{ id: 5, name: 'Change parent', disabled: !t.parent_quest },
				{ id: 6, name: 'Remove', disabled: !t.parent_quest },
			]});
			const sel = await win.wait();

			if (sel > 0) {
				db.open(t);
				const pt = db.tasks[t.parent_quest];
				if (pt) {
					db.open(pt);
				}
			}

			switch(sel) {
				case 1: { /* add next */
					const nt = db.new('tasks');
					nt.parent_quest = t.parent_quest;

					const pt = db.tasks[t.parent_quest];
					const t_idx = pt.sub_quests.findIndex(_tid => _tid == t.id);
					pt.sub_quests.splice(t_idx + 1, 0, nt.id);
					break;
				}
				case 2: { /* add child */
					const nt = db.new('tasks');
					nt.parent_quest = t.id;

					set_obj_field(t, [ 'sub_quests' ], []).push(nt.id);
					break;
				}
				case 3: { /* move up */
					const pt = db.tasks[t.parent_quest];

					const t_idx = pt.sub_quests.findIndex(_tid => _tid == t.id);
					const prev_id = pt.sub_quests[t_idx - 1];
					pt.sub_quests[t_idx - 1] = t.id;
					pt.sub_quests[t_idx] = prev_id;
					break;
				}
				case 4: { /* move down */
					const pt = db.tasks[t.parent_quest];

					const t_idx = pt.sub_quests.findIndex(_tid => _tid == t.id);
					const next_id = pt.sub_quests[t_idx + 1];
					pt.sub_quests[t_idx + 1] = t.id;
					pt.sub_quests[t_idx] = next_id;
					break;
				}
				case 5: { /* change parent */
					notify('warning', 'Not implemented yed');
					break;
				}
				case 6: { /* remove */
					const pt = db.tasks[t.parent_quest];
					const t_idx = pt.sub_quests.findIndex(_tid => _tid == t.id);
					pt.sub_quests.splice(t_id, 1);
					break;
				}
			}

			if (sel > 0) {
				db.commit(t);
				const pt = db.tasks[t.parent_quest];
				if (pt) {
					db.commit(pt);
				}
				sel_active_q(this.task);
			}
		}
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

	static print_question(d, q_id) {
		let q = d?.questions?.find(q => q?.id == q_id);
		if (!q) {
			return '';
		}

		/* FIXME encode all HTML tags */

		let ret = '<li class="question" data-id="' + q_id + '"><span contentEditable="true">' + q.text + '</span>';
		if (q.choices?.filter(c => c.id != 0)?.length) {
			ret += '<ul>';
			let idx = 0;
			for (const c of q.choices) {
				if (c.id == 0) {
					idx++;
					continue;
				}

				if (c.id < 0x80000000) {
					ret += '<li class="choice" data-id="' + idx + '"><span contentEditable="true">' + c.text + '</span>';
					if (c.id > 0) {
						ret += '<ul>'
						ret += TaskWindow.print_question(d, c.id);
						ret += '</ul>';
					}
					ret += '</li>';
				} else {
					const ctype = TaskWindow.dialogue_choice_opts[c.id];
					ret += '<li class="choice" data-id="' + idx + '"><span data-option="true" contentEditable="true">' + c.text + '</span><br><span>' + ctype.name;
					if (ctype.param) {
						ret += ': &nbsp;<input type="text" value="' + (serialize_db_id(c.param) || c.param) + '">';
					}
					ret += '</span></li>';
				}
				idx++;
			}
			ret += '</ul>';
		}
		ret += '</li>';

		return ret;
	}

	add_req_monster() {
		db.open(this.task);
		if (!this.task.req_monsters) {
			this.task.req_monsters = [];
		}
		this.task.req_monsters.push({});
		db.commit(this.task);
		this.tpl.reload('#kill_monsters');
	}

	remove_req_monster(idx) {
		db.open(this.task);
		this.task.req_monsters[idx] = null;
		cleanup_arr(this.task.req_monsters);
		db.commit(this.task);
		this.tpl.reload('#kill_monsters');
	}

	add_award_item_row() {
		if (this.task.award.item_groups?.length == 5) {
			return;
		}

		db.open(this.task);
		const item_arr = set_obj_field(this.task, [ 'award', 'item_groups' ], []);
		this.task.award.item_groups.push({});
		db.commit(this.task);
		this.tpl.reload('#award_items');
	}

	remove_award_item_row(idx) {
		db.open(this.task);
		this.task.award.item_groups[idx] = null;
		cleanup_arr(this.task.award.item_groups);
		db.commit(this.task);
		this.tpl.reload('#award_items');
	}

	item_add_onclick(type, idx) {
		let item_arr;

		db.open(this.task);
		if (type == 'premise') {
			item_arr = set_obj_field(this.task, [ 'premise_items' ], []);
		} else if (type == 'free_given') {
			item_arr = set_obj_field(this.task, [ 'free_given_items' ], []);
		} else if (type == 'req') {
			item_arr = set_obj_field(this.task, [ 'req_items' ], []);
		} else if (type == 'award') {
			item_arr = set_obj_field(this.task, [ 'award', 'item_groups', 0, 'items' ], []);
		} else if (type == 'failure_award') {
			item_arr = set_obj_field(this.task, [ 'failure_award', 'item_groups', 0, 'items' ], []);
		}

		let f_idx;
		for (f_idx = 0; f_idx < item_arr.length; f_idx++) {
			if (!item_arr[f_idx]?.id) {
				break;
			}
		}
		item_arr[f_idx] = { id: 13188 };
		db.commit(this.task);

		if (type == 'premise') {
			this.tpl.reload('#premise_items');
		} else if (type == 'free_given') {
			this.tpl.reload('#free_given_items');
		} else if (type == 'req') {
			this.tpl.reload('#req_items');
		} else if (type == 'award') {
			this.tpl.reload('#award_items');
		} else if (type == 'failure_award') {
			this.tpl.reload('#failure_award_items');
		}
	}

	cleanup_items(type) {
		let item_arr;

		db.open(this.task);
		if (type == 'premise') {
			item_arr = set_obj_field(this.task, [ 'premise_items' ], []);
		} else if (type == 'free_given') {
			item_arr = set_obj_field(this.task, [ 'free_given_items' ], []);
		} else if (type == 'req') {
			item_arr = set_obj_field(this.task, [ 'req_items' ], []);
		} else if (type == 'award') {
			item_arr = set_obj_field(this.task, [ 'award', 'item_groups', 0, 'items' ], []);
		} else if (type == 'failure_award') {
			item_arr = set_obj_field(this.task, [ 'failure_award', 'item_groups', 0, 'items' ], []);
		}
		cleanup_id_arr(item_arr);
		db.commit(this.task);

		if (type == 'premise') {
			this.tpl.reload('#premise_items');
		} else if (type == 'free_given') {
			this.tpl.reload('#free_given_items');
		} else if (type == 'req') {
			this.tpl.reload('#req_items');
		} else if (type == 'award') {
			this.tpl.reload('#award_items');
		} else if (type == 'failure_award') {
			this.tpl.reload('#failure_award_items');
		}
	}

	select_award_item_type(id, auto) {
		if (id < 0) {
			return;
		}

		const t = this.task;
		db.open(t);

		if (!this.task.award) {
			this.task.award = {};
		}
		if (!this.task.award.item_groups) {
			this.task.award.item_groups = [];
		}
		if (this.task.award.item_groups.length == 0) {
			this.task.award.item_groups.push({});
		}

		this.task.award.item_groups[0].chosen_randomly = id == 1;
		db.commit(t);

		this.award_item_type = id;
		this.tpl.reload('#award_items');
	}

	update_npc(type, el) {
		const prev_id = el._mg_prev_value;
		const new_id = el._mg_value;

		if (type == 'start_npc') {
			/* first validate the new npc can give any more quests */
			const npc = db.npcs[new_id];
			if (npc) {
				let quests_out = db.npc_tasks_out[npc.id_task_out_service];
				if (!quests_out) {
					/* init the quests out list if it's the first quest for that npc */
					quests_out = db.new('npc_tasks_out');
					db.open(npc);
					npc.id_task_out_service = quests_out.id;
					db.commit(npc);
				}

				if (!quests_out.tasks) {
					/* ^ */
					db.open(quests_out);
					quests_out.tasks = [];
					db.commit(quests_out);
				}

				/* find an empty or invalid quest in the list */
				let i;
				for (i = 0; i < 32; i++) {
					const qid = quests_out.tasks[i];
					if (!qid) {
						break;
					}

					const q = db.tasks[qid];
					if (!q) {
						break;
					}

					if (q.parent_quest) {
						break;
					}
				}

				if (i == 32) {
					db.open(this.task);
					this.start_npc = prev_id;
					db.commit(this.task);
					el._mg_update_label(true);

					MessageWindow.open({ 'title': 'Failed to set starting NPC ' + (npc.name || '') + ' ' + serialize_db_id(npc.id), msg: 'This NPC has already reached the max. number of quests it can give (32). Please free some, then try again' });
					return;
				}

				/* add entry to the npc list */
				db.open(quests_out);
				quests_out.tasks[i] = this.task.id;
				db.commit(quests_out);

				/* cleanup the entry for the previous npc */
				const pnpc = db.npcs[prev_id];
				if (pnpc) {
					const pquests_out = db.npc_tasks_out[pnpc.id_task_out_service];
					if (pquests_out) {
						db.open(pquests_out);
						for (let i = 0; i < 32; i++) {
							if (pquests_out.tasks?.[i] == this.task.id) {
								pquests_out.tasks[i] = 0;
							}
						}
						db.commit(pquests_out);
					}
				}
			}

		} else if (type == 'finish_npc') {
			/* first validate the new npc can complete any more quests */
			const npc = db.npcs[new_id];
			if (npc) {
				let quests_in = db.npc_tasks_in[npc.id_task_in_service];
				if (!quests_in) {
					/* init the quests in list if it's the first quest for that npc */
					quests_in = db.new('npc_tasks_in');
					db.open(npc);
					npc.id_task_in_service = quests_in.id;
					db.commit(npc);
				}

				if (!quests_in.tasks) {
					/* ^ */
					db.open(quests_in);
					quests_in.tasks = [];
					db.commit(quests_in);
				}

				/* find an empty or invalid quest in the list */
				let i;
				for (i = 0; i < 32; i++) {
					const qid = quests_in.tasks[i];
					if (!qid) {
						break;
					}

					const q = db.tasks[qid];
					if (!q) {
						break;
					}
				}

				if (i == 32) {
					db.open(this.task);
					this.finish_npc = prev_id;
					db.commit(this.task);
					el._mg_update_label(true);

					MessageWindow.open({ 'title': 'Failed to set finish NPC ' + (npc.name || '') + ' ' + serialize_db_id(npc.id), msg: 'This NPC has already reached the max. number of quests it can complete (32). Please free some, then try again' });
					return;
				}

				/* add entry to the npc list */
				db.open(quests_in);
				quests_in.tasks[i] = this.task.id;
				db.commit(quests_in);

				/* cleanup the entry for the previous npc */
				const pnpc = db.npcs[prev_id];
				if (pnpc) {
					const pquests_in = db.npc_tasks_in[pnpc.id_task_in_service];
					if (pquests_in) {
						db.open(pquests_in);
						for (let i = 0; i < 32; i++) {
							if (pquests_in.tasks?.[i] == this.task.id) {
								pquests_in.tasks[i] = 0;
							}
						}
						db.commit(pquests_in);
					}
				}
			}

		}
	}

	close() {
		g_open_tasks.delete(this.root_task);
		document.removeEventListener('mousemove', this.mousemove_fn);
		document.removeEventListener('mouseup', this.mouseup_fn);
		super.close();
	}
}
