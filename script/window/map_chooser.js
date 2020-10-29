/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class MapChooserWindow extends Window {
	static loaded = load_tpl(ROOT_URL + 'tpl/window/map_chooser.tpl');
	async init() {
		await MapChooserWindow.loaded;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-map-chooser');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run( { win: this, maps: PWMap.maps });
		shadow.append(data);

		const search_el = shadow.querySelector('#search');
		search_el.oninput = (e) => {
			const search = search_el.value.toLowerCase();
			const options = shadow.querySelectorAll('.maps > .map');
			for (const o of options) {
				o.style.display = o.textContent.toLowerCase().includes(search) ? 'block' : 'none';
			}
		};

		await super.init();
		this.move((Window.bounds.right - Window.bounds.left - this.dom_win.offsetWidth) / 2,
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight) / 2);
		return true;
	}

	select_map(id) {
		const map = PWMap.maps[id];
		const prev_selected = this.shadow.querySelector('.maps > .map.selected');
		if (prev_selected) prev_selected.classList.remove('selected');
		this.shadow.querySelector('#map-' + id).classList.add('selected');
		this.selected_map = map;

		const open = this.shadow.querySelector('#open');
		open.classList.remove('disabled');
		open.textContent = 'Open ' + map.name;
	}

	async open_map() {
		this.close();
		if (g_map) {
			await g_map.close();
		} else {
			g_map = new PWMap();
		}
		await g_map.reinit(this.selected_map.id);
	}
}
