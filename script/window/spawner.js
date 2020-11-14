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

		const data = await this.tpl.run({ win: this, group: this.group, spawner: this.spawner });
		shadow.append(data);

		return super.init();
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

	close() {
		this.normalize_spawner();
		g_open_spawners.delete(this.spawner);
		super.close();
	}

	add_group() {
		this.spawner.groups.push({ type: 0 });
		this.tpl.reload('#groups');
		this.open_groups = [];
	}

	info_group(el, idx) {
		if (!el._mg_group) {
			const group = this.spawner.groups[idx];
			el._mg_group = SpawnerGroupWindow.open({ parent: this, spawner: this.spawner, group });
			(async () => {
				const win = await el._mg_group;
				win.move(0, 0);
				win.dom.remove();
				win.dom.style.left = '';
				win.dom.style.top = '';
				el.append(win.dom);
			})();
		}
	}

	async open_group(el, idx, e) {
		const group = this.spawner.groups[idx];
		if (e.which == 1) {
			if (this.spawner._db.type.startsWith("resources_")) {
				MessageWindow.open({ msg: 'Not implemented yet' });
			} else {
				if (this.spawner.is_npc) {
					const base = db.npcs[group.type];

					let npcwin = null;
					/* TODO don't fork when only 1 usage */
					const npc = db.new('npcs', (npc, diff, prev) => {
						const s = this.spawner;
						db.open(s);

						if (!s.groups) {
							s.groups = [];
						}

						/* there can be only 1 group for NPCs, so always
						 * use the first one */
						if (s.groups.length == 0) {
							s.groups.push({});
						}

						s.groups[0].type = npc.id;
						db.commit(s);
						this.tpl.reload('#groups');
						npcwin.tpl.reload('.header > span');
					});
					if (base) {
						db.rebase(npc, base);
					}

					npcwin = await NPCWindow.open({ npc: npc });
				} else {
					MessageWindow.open({ msg: 'Not implemented yet' });
				}
			}
		} else if (e.which == 3) {
			const base = this.spawner._db._base;
			let spawner_name = '';
			if (this.spawner._db.type.startsWith("resources_")) {
				spawner_name = 'Resource';
			} else if (this.spawner.is_npc) {
				spawner_name = 'NPC';
			} else {
				spawner_name = 'Mob';
			}

			const coords = Window.get_el_coords(el);
			const x = coords.left;
			const y = coords.bottom;
			const win = await RMenuWindow.open({
			x: x, y: y, bg: false,
			entries: [
				{ id: 1, name: 'Edit' },
				{ name: 'Base' + (base ? '' : ' (none)'), disabled: !base, children: [
					{ name: base ? (base?.name + ' ' + serialize_db_id(base.id)) : '(none)' },
					{ id: 10, name: 'Open' },
					{ id: 11, name: 'Show usages' },
				]},
				{ name: spawner_name, children: [
					{ id: 20, name: 'Open' },
					{ id: 21, name: 'Show usages' },
					{ id: 22, name: 'Detach from base' },
					{ id: 23, name: 'Apply to base' },
					{ id: 24, name: 'Rebase' },
				]},
			]});
			const sel = await win.wait();
			switch(sel) {
				case 0: {
					const spawner = db.new('spawners_' + this.maptype.id);
					db.open(spawner);
					spawner.pos = [ spawner_pos.x, 0, spawner_pos.y ];
					spawner.is_npc = true;
					db.commit(spawner);
					console.log('new npc');
					break;
				}
				case 1: {
					console.log('new monster');
					break;
				}
				case 2: {
					console.log('new resource');
					break;
				}
				case 10: {
					console.log('undo');
					break;
				}
			}
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

	set_is_npc(is_npc) {
		db.open(this.spawner);
		this.spawner.is_npc = is_npc;
		db.commit(this.spawner);
		g_map.redraw_dyn_overlay();
	}
}
