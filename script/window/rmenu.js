/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_rmenu_tpl = load_tpl(ROOT_URL + 'tpl/window/rmenu.tpl');
class RMenuWindow extends Window {
	static tpl = new Template('tpl-rmenu');
	static last_rmenu = null;
	static enabled = true;
	async init() {
		await g_rmenu_tpl;

		if (!RMenuWindow.enabled) {
			return false;
		}

		if (RMenuWindow.last_rmenu) {
			RMenuWindow.last_rmenu.close();
		}
		RMenuWindow.last_rmenu = this;

		/* keep one cached copy to speed things up. There can be only one RMenu open
		 * at a time */
		this.tpl = RMenuWindow.tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const tpl_args = {
			win: this, bg: this.args.bg ?? true,
			entries: this.args.entries,
		};

		const data = this.tpl.run(tpl_args);

		let x, y;
		x = this.args.x;
		y = this.args.y;
		shadow.append(data);
		this.args.x = 0;
		this.args.y = 0;
		await super.init();

		if (!RMenuWindow.enabled) {
			this.close();
			return false;
		}

		const menu_el = this.shadow.querySelector('.menu');
		if (this.args.around_el) {
			const menu_bounds = menu_el.getBoundingClientRect();
			const around_el = this.args.around_el;
			const bounds = Window.get_el_coords(around_el);
			x = bounds.left + 1;
			y = bounds.bottom + (this.args.around_margin || 0);
		}

		menu_el.style.left = x + 'px';
		menu_el.style.top = y + 'px';

		menu_el.onmouseenter = () => {
			this.activate();
			menu_el.onmouseenter = null;
		};

		setTimeout(() => this.activate(), 400);
	}

	onblur() {
		this.close();
	}

	static enable_all(do_enable) {
		RMenuWindow.enabled = !!do_enable;
		if (!do_enable && RMenuWindow.last_rmenu) {
			RMenuWindow.last_rmenu.close();
		}
	}

	close() {
		super.close();
		RMenuWindow.last_rmenu = null;
	}

	activate() {
		this.activated = true;
		this.shadow.querySelector('#background').classList.add('activated');
	}

	tryclose() {
		setTimeout(() => {
			if (this.activated) {
				this.close();
			}
		}, 1);
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
		/* delay to not let the click event bounce */
		setTimeout(() => {
			this.close();
		}, 1);
	}

	async wait() {
		await new Promise((resolve) => {
			this.onclose = resolve;
		});

		if (this.selected == NaN) {
			return -1;
		}

		return this.selected ?? -1;

	}
}
