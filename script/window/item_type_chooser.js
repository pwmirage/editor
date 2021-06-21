/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2021 Darek Stojaczyk for pwmirage.com
 */

class ItemTypeChooserWindow extends Window {
	static is_open = false;
	static loaded = load_tpl(ROOT_URL + 'tpl/window/item_type_chooser.tpl');
	async init() {
		await ItemTypeChooserWindow.loaded;

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-item-type-chooser');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run( { win: this });
		shadow.append(data);

		const search_el = shadow.querySelector('#search');
		search_el.oninput = (e) => {
			const search = search_el.value.toLowerCase();
			const options = shadow.querySelectorAll('.types > .type');
			for (const o of options) {
				o.style.display = o.textContent.toLowerCase().includes(search) ? 'block' : 'none';
			}
		};

		await super.init();
		this.move((Window.bounds.right - Window.bounds.left - this.dom_win.offsetWidth) / 2,
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight) / 2);

		search_el.focus();
		return true;
	}

	select_type(id) {
		const type = Item.types_arr[id];
		const prev_selected = this.shadow.querySelector('.types > .type.selected');
		if (prev_selected) prev_selected.classList.remove('selected');
		this.shadow.querySelector('#type-' + id).classList.add('selected');
		this.selected_type = type;

		const open = this.shadow.querySelector('#open');
		open.classList.remove('disabled');
	}

	async next() {
		this.ret = this.selected_type;
		this.close();
	}

	async wait() {
		await new Promise((resolve) => {
			this.onclose = resolve;
		});

		return this.ret || Item.types_arr[0];
	}
}
