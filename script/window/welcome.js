/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class WelcomeWindow extends Window {
	static _tpl_id = 'window/welcome.tpl';
	async init() {
		const data = await this.tpl.run( { win: this });
		this.shadow.append(data);

		await super.init();
		this.move((Window.bounds.right - Window.bounds.left - this.dom_win.offsetWidth) / 2,
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight) / 2);
	}
}

