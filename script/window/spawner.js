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
		const data = await this.tpl.compile( { this: this, spawner: this.spawner });
		shadow.append(...data);

		return await super.init();
	}

	close() {
		g_open_spawners.delete(this.spawner);
		super.close();
	}

	add_group() {
		console.log("add_group");
		this.spawner.groups.push({ type: 0 });
		this.tpl.reload('#groups');
	}
}
