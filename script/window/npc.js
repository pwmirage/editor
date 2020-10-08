/*
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_open_npcs = new Set();
let g_open_npc_model = null;

class NPCModelWindow extends Window {
	async init() {
		this.npc_win = this.args.parent;
		this.npc = this.npc_win.npc;
		if (g_open_npc_model) return false;
		g_open_npc_model = this;

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/npc.tpl', 'tpl-npc-model');
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const data = await this.tpl.compile({ this: this, npc: this.npc });
		shadow.append(...data);

		await super.init();
		this.maximize();
	}

	close() {
		g_open_npc_model = null;
		super.close();
	}
}

class NPCWindow extends Window {
	async init() {
		this.npc = this.args.npc;
		if (!this.args.debug && g_open_npcs.has(this.npc)) return false;
		g_open_spawners.add(this.npc);

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/npc.tpl', 'tpl-npc');
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const data = await this.tpl.compile({ this: this, npc: this.npc });
		shadow.append(...data);

		return await super.init();
	}

	close() {
		g_open_npcs.delete(this.npc);
		super.close();
	}
}
