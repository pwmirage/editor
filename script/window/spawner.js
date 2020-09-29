/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_open_spawners = new Set();

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

		return await super.init();
	}

	close() {
		g_open_spawners.delete(this.spawner);
		super.close();
	}

	add_group() {
		this.spawner.groups.push({ type: 0 });
		this.tpl.reload('#groups');
	}

	set_is_npc(is_npc) {
		this.spawner.is_npc = is_npc;
		g_map.redraw_dyn_overlay();
	}
}
