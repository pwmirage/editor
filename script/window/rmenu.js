/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_rmenu_tpl = load_tpl(ROOT_URL + 'tpl/window/rmenu.tpl');
class RMenuWindow extends Window {
	static tpl = new Template('tpl-rmenu');
	async init() {
		await g_rmenu_tpl;
		/* keep one cached copy to speed things up. There can be only one RMenu open
		 * at a time */
		this.tpl = RMenuWindow.tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const tpl_args = {
			win: this,
			x: this.args.x,
			y: this.args.y,
			bg: this.args.bg ?? true,
			entries: this.args.entries,
		};

		const data = this.tpl.run(tpl_args);

		shadow.append(data);
		this.args.x = 0;
		this.args.y = 0;
		super.init();
	}

	hover_entry(el) {
		const entries = this.shadow.querySelectorAll('.entry.hovered');
		for (const e of entries) {
			e.classList.remove('hovered');
		}

		el.classList.add('hovered');
		const p = el.parentNode?.parentNode;
		if (p && p.classList.contains('entry')) {
			p.classList.add('hovered');
		}
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