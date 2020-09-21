/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_open_spawners = new Set();

class SpawnerWindow extends Window {

	async init() {
		this.spawner = this.args.spawner;
		if (g_open_spawners.has(this.spawner)) return false;
		g_open_spawners.add(this.spawner);

		const shadow = this.dom.shadowRoot;
		const tpl = await get(ROOT_URL + 'tpl/window/spawner.tpl');
		const els = newArrElements(tpl.data);
		shadow.append(...els);

		shadow.querySelectorAll('input').forEach((e) => {
			e.addEventListener('input', () => this.filter());
		});

		shadow.querySelector('.window > .header > span').textContent = 'Spawner #' + this.spawner.id;
		return await super.init();
	}

	close() {
		g_open_spawners.delete(this.spawner);
		super.close();
	}
}
