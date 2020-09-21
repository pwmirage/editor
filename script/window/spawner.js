/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_open_spawners = {};

class SpawnerWindow extends Window {

	async init() {
		this.id = this.args.id;
		if (g_open_spawners[this.id]) return false;
		g_open_spawners[this.id] = this;

		const shadow = this.dom.shadowRoot;
		const tpl = await get(ROOT_URL + 'tpl/window/spawner.tpl');
		const els = newArrElements(tpl.data);
		shadow.append(...els);

		shadow.querySelectorAll('input').forEach((e) => {
			e.addEventListener('input', () => this.filter());
		});

		shadow.querySelector('.window > .header > span').textContent = 'Spawner #' + this.id;
		return await super.init();
	}

	close() {
		g_open_spawners[this.id] = null;
		super.close();
	}
}
