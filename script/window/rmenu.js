/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_rmenu_tpl = load_tpl(ROOT_URL + 'tpl/window/rmenu.tpl');
class RMenuWindow extends Window {
	async init() {
		await g_rmenu_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-rmenu');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const tpl_args = {
			win: this,
			x: this.args.x,
			y: this.args.y,
			entries: this.args.entries,
		};

		const data = this.tpl.run(tpl_args);

		shadow.append(data);
		this.args.x = 0;
		this.args.y = 0;
		super.init();
	}

	select(id) {
		this.selected = id;
		this.close();
	}

	async wait() {
		await new Promise((resolve) => {
			this.onclose = resolve;
		});

		return this.selected ?? -1;

	}
}
