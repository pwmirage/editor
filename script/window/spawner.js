/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_open_spawners = {};

class SpawnerWindow extends Window {
	static TPL_PATH = 'spawner.tpl';

	init() {
		this.id = this.args.id;
		if (g_open_spawners[this.id]) return false;
		g_open_spawners[this.id] = this;

		const shadow = this.dom.shadowRoot;
		shadow.querySelectorAll('input').forEach((e) => {
			e.addEventListener('input', () => this.filter());
		});

		this.dom_header.querySelector('span').textContent = 'Spawner #' + this.id;
		return true;
	}

	close() {
		g_open_spawners[this.id] = null;
		super.close();
	}
}
