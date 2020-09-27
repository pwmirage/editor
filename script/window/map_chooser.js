/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class MapChooserWindow extends Window {
	async init() {
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/map_chooser.tpl', 'tpl-map-chooser');
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const maps = this.maps = [];
		maps.push({ name: 'Main World', id: 'gs01' });

		maps.push({ name: 'Firecrag Grotto', id: 'is05' });
		maps.push({ name: 'Den of Rabid Wolves', id: 'is06' });
		maps.push({ name: 'Cave of the Vicious', id: 'is07' });

		maps.push({ name: 'Secret Passage', id: 'is02' });
		maps.push({ name: 'Hall of Deception', id: 'is08' });

		maps.push({ name: 'Gate of Delirium', id: 'is09' });
		maps.push({ name: 'Secret Frostcover Grounds', id: 'is10' });
		maps.push({ name: 'Valley of Disaster', id: 'is11' });
		maps.push({ name: 'Forest Ruins', id: 'is12' });
		maps.push({ name: 'Cave of Sadistic Glee', id: 'is13' });
		maps.push({ name: 'Wraithgate', id: 'is14' });
		maps.push({ name: 'Hallucinatory Trench', id: 'is15' });
		maps.push({ name: 'Eden', id: 'is16' });
		maps.push({ name: 'Brimstone Pit', id: 'is17' });
		maps.push({ name: 'Temple of the Dragon', id: 'is18' });
		maps.push({ name: 'Nightscream Island', id: 'is19' });
		maps.push({ name: 'Snake Isle', id: 'is20' });
		maps.push({ name: 'Lothranis', id: 'is21' });
		maps.push({ name: 'Momaganon', id: 'is22' });
		maps.push({ name: 'Seat of Torment', id: 'is23' });
		maps.push({ name: 'Abaddon', id: 'is24' });
		maps.push({ name: 'Warsong City', id: 'is25' });
		maps.push({ name: 'Palace of Nirvana', id: 'is26' });
		maps.push({ name: 'Lunar Glade', id: 'is27' });
		maps.push({ name: 'Valley of Reciprocity', id: 'is28' });
		maps.push({ name: 'Frostcover City', id: 'is29' });
		maps.push({ name: 'Twilight Temple', id: 'is31' });
		maps.push({ name: 'Cube of Fate', id: 'is32' });
		maps.push({ name: 'Chrono City', id: 'is33' });

		maps.push({ name: 'Etherblade Arena', id: 'arena01' });
		maps.push({ name: 'Lost Arena', id: 'arena02' });
		maps.push({ name: 'Plume Arena', id: 'arena03' });
		maps.push({ name: 'Archosaur Arena', id: 'arena04' });
		maps.push({ name: 'Territory War T-3 PvP', id: 'bg01' });
		maps.push({ name: 'Territory War T-3 PvE', id: 'bg02' });
		maps.push({ name: 'Territory War T-2 PvP', id: 'bg03' });
		maps.push({ name: 'Territory War T-2 PvE', id: 'bg04' });
		maps.push({ name: 'Territory War T-1 PvP', id: 'bg05' });
		maps.push({ name: 'Territory War T-1 PvE', id: 'bg06' });

		maps.push({ name: 'City of Abominations', id: 'is01' });

		maps.push({ name: 'Test 1', id: 'is03' });
		maps.push({ name: 'Test 2', id: 'is04' });

		const data = await this.tpl.compile( { this: this, maps: maps });
		shadow.append(...data);

		const search_el = shadow.querySelector('#search');
		search_el.oninput = (e) => {
			const search = search_el.value.toLowerCase();
			const options = shadow.querySelectorAll('.maps > .map');
			for (const o of options) {
				o.style.display = o.textContent.toLowerCase().includes(search) ? 'block' : 'none';
			}
		};


		super.init();
		this.move((Window.bounds.right - Window.bounds.left - this.dom_win.offsetWidth) / 2,
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight) / 2);
		return true;
	}

	select_map(id) {
		const map = this.maps.filter((m) => m.id == id)[0];
		const prev_selected = this.shadow.querySelector('.maps > .map.selected');
		if (prev_selected) prev_selected.classList.remove('selected');
		this.shadow.querySelector('#map-' + id).classList.add('selected');
		this.selected_map = map;

		const open = this.shadow.querySelector('#open');
		open.classList.remove('disabled');
		open.textContent = 'Open ' + map.name;
	}

	async open_map() {
		console.log('map open: ' + this.selected_map.name);
		if (g_map) await g_map.close();
		g_map = new PWMap();
		await g_map.reinit(this.selected_map.id);

	}
}
