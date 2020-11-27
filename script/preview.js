/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

class PWPreview {
	static async load() {
		await Loading.init();
		console.log('PWPreview loading');

		await Promise.all([
			load_script(ROOT_URL + 'script/db.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/item.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/template.js?v=' + MG_VERSION),
		]);

		await Item.init(ROOT_URL + 'img/iconlist_ivtrm.png?v=' + MG_VERSION);

		customElements.define('pw-diff', PWPreviewElement);
	}

	static load_promise;
}

class ShadowElement {
	constructor(db) {
		this.db = db;
		this.dom = document.createElement('div');
		this.dom._el = this;
		this.shadow = this.dom.attachShadow({mode: 'open'});

		this.styles = [];
		this.styles.push(newStyle(ROOT_URL + 'css/window.css'));
		this.styles.push(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		this.shadow.append(...this.styles);
	}

	load_styles() {
		return Promise.all(this.styles.map((s) => new Promise((resolve) => { s.onload = resolve; })));
	}
}

class PWPreviewElement extends HTMLElement {
	constructor(element_name) {
		super();

		this.shadow = this.attachShadow({mode: 'open'});

		const styles = [];
		styles.push(newStyle(ROOT_URL + 'css/window.css'));
		styles.push(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		this.style_promises = styles.map((s) => new Promise((resolve) => { s.onload = resolve; }));
		this.shadow.append(...styles);

		this.tpl = new Template('pw-diff-preview');
	}

	async connectedCallback() {

		const el_types = {
			npcs: { type: 'pw-npc', title: 'NPC' },
			npc_spawns: { type: 'pw-npc-spawn', title: 'NPC Spawner' },
			npc_recipes: { type: 'pw-recipe-list', title: 'NPC Crafts' },
			npc_goods: { type: 'pw-goods-list', title: 'NPC Goods' },
			items: { type: 'pw-item-list', title: 'Items' },
		};

		let cur_cnt = 0;
		const max_cnt = this.dataset.maxItems || 99999;
		const menu_el = shadow.querySelector('#menu');
		const pw_container = shadow.querySelector('#element');

		let items_queued = [];
		let items_tab = null;
		let parent_container = menu_el;
		for (const arr in this.db) {
			if (arr === 'metadata') continue;
			const el_type = el_types[arr];
			if (!el_type) continue;
			for (const obj of this.db[arr]) {
				if (arr == 'items') {
					if (!obj._db.prev) continue;
					if (items_queued.length < 32) {
						items_queued.push(obj);
						if (items_tab) {
							continue;
						}
					}
				}

				if (cur_cnt == max_cnt) {
					const tab_el = document.createElement('div')
					tab_el.className = 'disabled more';

					menu_el.append(tab_el);
					parent_container = tab_el;
				}
				cur_cnt++;

				const tab_el = document.createElement('div');
				const p = document.createElement('p');
				p.textContent = cur_cnt + '. ' + el_type.title;
				tab_el.append(p);

				if (arr == 'items') {
					items_tab = tab_el;
					if (items_queued.length == 32) {
						items_queued = [obj];
					}
					tab_el.items = items_queued;
				}

				p.onclick = () => {
					const selected = menu_el.querySelector('.selected');
					if (selected == tab_el) {
						/* nothing to do */
						return;
					}

					const prev_el = pw_container.children[0];
					if (selected) selected.classList.remove('selected');
					tab_el.classList.add('selected');

					if (!tab_el.pwElement) {
						const pw_el = document.createElement(el_type.type);
						if (tab_el.items) pw_el.items = tab_el.items;
						pw_el.obj = obj;
						pw_el.db = this.db;
						tab_el.pwElement = pw_el;
					}

					if (prev_el) {
						tab_el.pwElement.style.display = 'none';
						const reload_tab = () => {
							try {
								pw_container.removeChild(prev_el);
								tab_el.pwElement.style.display = 'block';
								tab_el.pwElement.onload = null;
							} catch (e) {
								setTimeout(reload_tab, 20);
							}
						};
						tab_el.pwElement.onload = reload_tab;
					}
					pw_container.appendChild(tab_el.pwElement);
				};

				parent_container.append(tab_el);
			}
		}
	}

	async connectedCallback() {
		if (!this.dataset.project) {
			return;
		}

		const req = await get(ROOT_URL + 'get_preview.php?' + this.dataset.project, { is_json: true });
		if (!req.ok) return;
		this.db = req.data;

		const tabtypes = {
			npcs: 'NPC',
			spawners: 'Spawner',
			npc_recipes: 'NPC Recipes',
			npc_goods: 'NPC Goods',
			recipes: 'Recipes',
			items: 'Items',
		};

		this.tabs = [];
		let count = 0;
		for (const arr_name in this.db) {
			const arr_type = tabtypes[arr_name];
			if (!arr_type) {
				continue;
			}

			for (const obj of this.db[arr_name]) {
				this.tabs.push({ id: arr_type, name: ++count + '. ' + arr_type });
			}
		}
		
		await Promise.all([
			this.style_promises,
			load_tpl(ROOT_URL + 'tpl/preview/root.tpl'),
		]);

		const data = await this.tpl.run({ preview: this, db: this.db });
		this.shadow.append(data);

	//	this.shadow.querySelector('#menu > div').click();

		this.shadow.querySelectorAll('.prev').forEach(p => { p.previousSibling.classList.add('new'); });
		this.shadow.querySelectorAll('.window.loading').forEach(w => {
			w.classList.remove('loading');
		});

		this.classList.add('loaded');
	}
}

PWPreview.load_promise = PWPreview.load();
