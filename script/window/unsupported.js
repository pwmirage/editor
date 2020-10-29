/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class UnsupportedBrowserWindow extends Window {
	static loaded = load_tpl(ROOT_URL + 'tpl/window/unsupported.tpl');
	async init() {
		await UnsupportedBrowserWindow.loaded;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-unsupported');
		this.tpl.compile_cb = (el) => this.tpl_compile_cb(el);

		const data = await this.tpl.run( { win: this });
		shadow.append(data);

		const b = shadow.querySelector('#close_btn');
		b.onclick = () => this.close();

		await super.init();
		this.move((Window.bounds.right - Window.bounds.left - this.dom_win.offsetWidth) / 2,
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight) / 2);
		return true;
	}

	close() {
		Editor.close();
		return super.close();
	}
}

