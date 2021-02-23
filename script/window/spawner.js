/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_open_spawners = new Set();
const g_spawner_tpl = load_tpl(ROOT_URL + 'tpl/window/spawner.tpl');

class SpawnerGroupWindow extends PopupWindow {
	async init() {
		this.spawner = this.args.spawner;
		this.group = this.args.group;

		await g_spawner_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-spawner-group-info');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = this.tpl.run({ win: this, group: this.group, group_idx: this.args.group_idx, spawner: this.spawner });
		shadow.append(data);

		return super.init();
	}
}

class SpawnerPositionWindow extends Window {
	async init() {
		this.spawner = this.args.spawner;

		await g_spawner_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-spawner-position');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = this.tpl.run({ win: this, spawner: this.spawner });
		shadow.append(data);

		this.dom.classList.add('unforce-map-focus');

		await super.init();
		this.move((Window.bounds.right - this.dom_win.offsetWidth - 4),
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight - 4));

		this.select().then(() => {
			this.close();
		});
	}

	close() {
		g_map.force_map_focus(false);
		super.close();
	}

	async select() {
		const click_ev = await new Promise((resolve) => g_map.force_map_focus(true, resolve));
		const map_coords = g_map.mouse_coords_to_map(click_ev.clientX, click_ev.clientY);
		const spawner_pos = this.mouse_spawner_pos = g_map.map_coords_to_spawner(map_coords.x, map_coords.y);

		db.open(this.spawner);
		this.spawner.pos[0] = spawner_pos.x;
		this.spawner.pos[2] = spawner_pos.y;
		db.commit(this.spawner);
		this.tpl.reload('.pos-input');
	}
}

class SpawnerRotationWindow extends Window {
	async init() {
		this.spawner = this.args.spawner;

		await g_spawner_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-spawner-rotation');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = this.tpl.run({ win: this, spawner: this.spawner });
		shadow.append(data);

		this.dom.classList.add('unforce-map-focus');

		await super.init();
		this.move((Window.bounds.right - this.dom_win.offsetWidth - 4),
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight - 4));

		g_map.force_map_focus(true);
		g_map.show_rotation_circle(this.spawner, (rad) => {
			if (rad === null) {
				return;
			}

			this.try_update_rad(rad);
		});
	}

	close() {
		g_map.show_rotation_circle(null);
		g_map.force_map_focus(false);
		super.close();
	}

	try_update_rad(rad) {
		this.shadow.querySelector('#input').value = Math.round((rad - Math.PI / 2) * 10000) / 10000;

		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		this.timeout = setTimeout(() => {
			this.update_dir(rad);
		}, 250);
	}

	update_dir(rad) {
		db.open(this.spawner);
		this.spawner.dir[0] = Math.sin(rad);
		this.spawner.dir[2] = -Math.cos(rad);
		db.commit(this.spawner);
	}
}


class SpawnerWindow extends Window {
	async init() {
		this.spawner = this.args.spawner;
		if (!this.args.debug && g_open_spawners.has(this.spawner)) return false;
		g_open_spawners.add(this.spawner);

		this.normalize_spawner();

		await g_spawner_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-spawner');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, spawner: this.spawner });
		shadow.append(data);

		this.open_groups = [];

		if (this.spawner.type == 'npc') {
			const npc = this.npc_win_npc = db.npcs[this.spawner.groups[0]?.type];
			if (npc) {
				this.npc_win = await NPCWindow.open({ npc, parent_win: this, debug: this.args.debug });
				this.shadow.querySelector('#npc-window').append(this.npc_win.dom);
			}
		}

		return await super.init();
	}

	normalize_spawner() {
		const s = this.spawner;
		let open = null;

		if (!s.groups) {
			open = db.open(s);
			s.groups = [];
		}

		let i = 0;
		/* remove empty groups */
		for (const g of s.groups) {
			if (g.type == 0) {
				open = db.open(s);
				s.groups.splice(i, 1);
			}
			i++;
		}

		if (s.groups.length == 0) {
			s.groups.push({ type: 0 });
		}
	}

	async pos_onclick(el, e) {
		if (e.which == 1) {
			const win = await SpawnerPositionWindow.open({ spawner: this.spawner });
			win.onclose = () => this.tpl.reload('#position');
		} else if (e.which == 3) {
			HTMLSugar.open_undo_rmenu(el, this.spawner, {
				undo_path: [ 'pos' ],
				undo_fn: () => this.tpl.reload('#position'),
				name_fn: (pos) => {
					if (!pos) return '[ 0, 0, 0 ]';
					const sanitize = (p) => p ? Math.round(p * 10000) / 10000 : '-';
					return '[ ' + sanitize(pos[0]) + ', ' + sanitize(pos[1]) + ', ' + sanitize(pos[2]) + ' ]';
				}
			});
		}
		return false;
	}

	async dir_onclick(el, e) {
		if (e.which == 1) {
			const win = await SpawnerRotationWindow.open({ spawner: this.spawner });
			win.onclose = () => this.tpl.reload('#rotation');
		} else if (e.which == 3) {
			HTMLSugar.open_undo_rmenu(el, this.spawner, {
				undo_path: [ 'dir' ],
				undo_fn: () => this.tpl.reload('#rotation'),
				name_fn: (dir) => {
					if (!dir) return '0 rad';
					return Math.round(Math.atan2(dir[2], dir[0]) * 10000) / 10000 + ' rad';
				}
			});
		}
		return false;
	}

	async details(details_el, e) {
		const coords = Window.get_el_coords(details_el);
		const x = coords.left;
		const y = coords.bottom;

		const win = await RMenuWindow.open({
		x, y, bg: false,
		entries: [
			{ name: 'World: ' + this.spawner._db.type.replace('spawners_', '') },
			{ id: 3, name: 'Show project diff', disabled: !this.spawner._db.project_initial_state },
			{ id: 1, name: 'Remove', visible: !this.spawner._removed },
			{ id: 2, name: 'Restore', visible: !!this.spawner._removed },
		]});
		const sel = await win.wait();
		switch (sel) {
			case 1: {
				db.open(this.spawner);
				this.spawner._removed = true;
				db.commit(this.spawner);
				this.dom_header.classList.add('removed');
				break;
			}
			case 2: {
				db.open(this.spawner);
				this.spawner._removed = false;
				db.commit(this.spawner);
				this.dom_header.classList.remove('removed');
				break;
			}
			case 3: {
				DiffWindow.open({ obj: this.spawner, prev: this.spawner._db.project_initial_state });
			}
		}
	}


	async refresh_npc_window() {
		const npc = db.npcs[this.spawner.groups[0]?.type];

		if (npc == this.npc_win_npc) {
			return;
		}
		this.npc_win_npc = npc;

		if (!npc) {
			if (this.npc_win) {
				this.npc_win.close();
				this.npc_win = null;
			}
			this.tpl.reload('#npc-group');
			return;
		}

		const new_win = await NPCWindow.open({ npc, parent_win: this, debug: this.args.debug });
		if (this.npc_win) {
			this.npc_win.close();
		}
		this.tpl.reload('#npc-group');
		this.npc_win = new_win;
		this.shadow.querySelector('#npc-window').append(this.npc_win.dom);
	}

	close() {
		if (this.npc_win) {
			this.npc_win.close();
		}
		this.normalize_spawner();
		g_open_spawners.delete(this.spawner);
		super.close();
	}

	add_group() {
		db.open(this.spawner);
		this.spawner.groups.push({ type: 0 });
		db.commit(this.spawner);
		this.tpl.reload('#groups');
		this.open_groups = [];
	}

	/* TODO remove groups by setting count to 0 */

	info_group(el, idx) {
		if (!el._mg_group) {
			const group = this.spawner.groups[idx];
			el._mg_group = SpawnerGroupWindow.open({ parent: this, spawner: this.spawner, group, group_idx: idx });
			(async () => {
				const win = await el._mg_group;
				win.move(0, 0);
				win.dom.remove();
				win.dom.style.left = '';
				win.dom.style.top = '';
				win.dom.onclick = (e) => e.stopPropagation();
				el.append(win.dom);
			})();
		}
	}

	async open_group(el, idx, e) {
		const group = this.spawner.groups[idx];

		if (e.which == 1) {
			let type;
			let pretty_name;
			if (this.spawner.type == 'resource') {
				type  = 'mines';
				pretty_name = 'Resource';
			} else if (this.spawner.type == 'npc') {
				type = 'npcs';
				pretty_name = 'NPC';
			} else {
				type = 'monsters';
				pretty_name = 'Mob';
			}

			const obj = db[type][group.type];
			HTMLSugar.open_edit_rmenu(el,
				obj, type, {
				pick_win_title: 'Pick new ' + pretty_name + ' for ' + (this.spawner.name || 'Spawner') + ' ' + serialize_db_id(this.spawner.id),
				update_obj_fn: (new_obj) => {
					const s = this.spawner;
					db.open(s);

					group.type = new_obj?.id || 0;
					group.count = group.count || 1;

					db.commit(s);
					this.tpl.reload('#groups');
					this.refresh_npc_window();

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
			HTMLSugar.open_undo_rmenu(el, this.spawner, {
				undo_path: [ 'groups', idx, 'type' ],
				undo_fn: () => { this.tpl.reload('#groups'); this.refresh_npc_window(); },
				name_fn: (id) => id ? ((db.npcs[id]?.name || '(unnamed)') + ' ' + serialize_db_id(id)) : '(none)'
			});
		}
	}

	select_group(group) {
		const els = this.shadow.querySelectorAll('.group-row');
		for (const el of els) {
			if (el != group) {
				el.classList.remove('selected');
			} else {
				const was_selected = !el.classList.toggle('selected');
				if (was_selected) {
					this.shadow.querySelector('#groups').classList.remove('has-selected');
				} else {
					this.shadow.querySelector('#groups').classList.add('has-selected');
				}

			}
		}
	}
}
