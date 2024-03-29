/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class MapChooserWindow extends SingleInstanceWindow {
	static _tpl_id = 'window/map_chooser.tpl';
	async init() {
		const data = await this.tpl.run( { win: this, maps: PWMap.maps });
		this.shadow.append(data);

		const search_el = this.shadow.querySelector('#search');
		search_el.oninput = (e) => {
			const search = search_el.value.toLowerCase();
			const options = this.shadow.querySelectorAll('.maps > .map');
			for (const o of options) {
				o.style.display = o.textContent.toLowerCase().includes(search) ? 'block' : 'none';
			}
		};

		await super.init();
		this.move((Window.bounds.right - Window.bounds.left - this.dom_win.offsetWidth) / 2,
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight) / 2);

		if (g_map.maptype.id != 'none') {
			this.select_map(g_map.maptype.id);
		}

		search_el.focus();
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
			await g_map.close(false);
		} else {
			g_map = new PWMap();
		}
		await g_map.reinit(this.selected_map.id);
	}
}
