/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class UnsupportedBrowserWindow extends Window {
	async init() {
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/unsupported.tpl', 'tpl-unsupported');
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const data = await this.tpl.compile( { });
		shadow.append(...data);

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

