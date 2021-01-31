/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class WelcomeWindow extends Window {
	static loaded = load_tpl(ROOT_URL + 'tpl/window/welcome.tpl');
	async init() {
		await WelcomeWindow.loaded;

		this.tpl = new Template('tpl-welcome');
		this.tpl.compile_cb = (el) => this.tpl_compile_cb(el);

		const data = await this.tpl.run( { win: this });
		this.shadow.append(data);

		await super.init();
		this.move((Window.bounds.right - Window.bounds.left - this.dom_win.offsetWidth) / 2,
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight) / 2);
	}
}

