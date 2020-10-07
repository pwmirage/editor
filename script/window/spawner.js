/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_open_spawners = new Set();

class SpawnerGroupWindow extends PopupWindow {
	async init() {
		this.spawner = this.args.spawner;
		this.group = this.args.group;

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/spawner.tpl', 'tpl-spawner-group-info');
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const data = await this.tpl.compile({ this: this, group: this.group, spawner: this.spawner });
		shadow.append(...data);

		return super.init();
	}


}

class SpawnerWindow extends Window {
	async init() {
		this.spawner = this.args.spawner;
		if (!this.args.debug && g_open_spawners.has(this.spawner)) return false;
		g_open_spawners.add(this.spawner);

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/spawner.tpl', 'tpl-spawner');
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const data = await this.tpl.compile({ this: this, spawner: this.spawner });
		shadow.append(...data);

		this.open_groups = [];

		return await super.init();
	}

	close() {
		g_open_spawners.delete(this.spawner);
		super.close();
	}

	add_group() {
		this.spawner.groups.push({ type: 0 });
		this.tpl.reload('#groups');
		this.open_groups = [];
	}

	async info_group(idx, el) {
		const group = this.spawner.groups[idx];

		if (!this.open_groups[idx]) {
			const win = this.open_groups[idx] = await SpawnerGroupWindow.open({ parent: this, spawner: this.spawner, group });
			win.move(0, 0);
			win.dom.remove();
			el.lastChild.style.marginRight = 0;
			el.append(win.dom);
			const bounds = el.getBoundingClientRect();
			win.dom.style.left = '';
			win.dom.style.top = '';
			//win.dom_win.style.left = bounds.width - 2 + 'px';
		}
	}

	select_group(sel_idx) {
		const els = this.shadow.querySelectorAll('.group-row');
		let idx = 0;
		for (const el of els) {
			if (idx != sel_idx) {
				el.classList.remove('selected');
			} else {
				const was_selected = !el.classList.toggle('selected');
				if (was_selected) {
					this.shadow.querySelector('#groups').classList.remove('has-selected');
				} else {
					this.shadow.querySelector('#groups').classList.add('has-selected');
				}

			}
			idx++;
		}
	}

	set_is_npc(is_npc) {
		db.open(this.spawner);
		this.spawner.is_npc = is_npc;
		db.commit(this.spawner);
		g_map.redraw_dyn_overlay();
	}
}
