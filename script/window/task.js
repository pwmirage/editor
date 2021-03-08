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
				let d = this.task.dialogue[this.sel_opts.dialogue || 'unfinished'];

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

								if (!d) {
									d = this.task.dialogue[this.sel_opts.dialogue] = {};
								}

								if (!d.questions) {
									d.questions = [];
								}

								let newq = d.questions[0];
								if (!newq) {
									newq = { id: 0, text: "" };
									d.questions.push(newq);
								}
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
		} else if (tab_type == 'dialogue') {
			this.tpl.reload('.dialogue-diagram');
			const npc_id = id == 'ready' ? this.task.finish_npc : this.task.start_npc;
			const npc_name = db.npcs[npc_id || 0]?.name || '(unnamed)';
			this.shadow.querySelector('.dialogue-diagram li.start > span').textContent = npc_id ? (npc_name + ' ' + serialize_db_id(npc_id)) : '(invalid, set it above)';
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
		this.select_tab('dialogue', !this.task.parent_quest ? 'initial' : (this.task.sub_quests?.length ? 'unfinished' : 'ready'));

		if (this.task.award?.item_groups?.length > 1) {
			this.select_award_item_type(2);
		} else if (this.task.award?.item_groups?.[0]?.chosen_randomly) {
			this.select_award_item_type(1);
		} else {
			this.select_award_item_type(0);
		}

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

	select_award_item_type(id) {
		if (id < 0) {
			return;
		}

		this.award_item_type = id;
		this.tpl.reload('#award_items');
	}

	close() {
		g_open_tasks.delete(this.root_task);
		document.removeEventListener('mousemove', this.mousemove_fn);
		document.removeEventListener('mouseup', this.mouseup_fn);
		super.close();
	}
}
