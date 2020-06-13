import { newElement, newArrElements, newStyle, escape } from './DomUtil.mjs';
import { get, sleep, ROOT_URL } from './Util.mjs';
import { Item } from './Item.mjs';
import db from './PWDB.mjs';
import { compile_tpl, load_tpl_file } from './template.mjs';

const find_by_id = (tbl, id) => {
	for (const obj of tbl) {
		if (obj.id == id) return obj;
	}
	return null;
}

const query_mod_fields = (root) => {
	return root.querySelector('.prev') ||
		root.querySelector('.diff-plus') ||
		root.querySelector('.modified');
};

const is_empty = (obj) => {
	if (!obj) return true;
	if (typeof obj === 'object' && Array.isArray(obj)) {
		if (obj.length == 0) return true;
		if (obj.every(i => i === null)) return true;
		return false;
	}
	return Object.keys(obj).length == 0;
}

const css_essentials = `
.window {
	position: relative;
	vertical-align: top;
	border: 1px solid #e0e0e0;
	display: inline-block;
	background-color: #f1ecec;
}

.window.loading {
	width: 280px;
	height: 261px;
	overflow: hidden;
}
.window.loading > * {
	visibility: hidden;
}

@keyframes spinner {
	to { transform: rotate(360deg); }
}

.window.loading:before {
	content: '';
	visibility: visible;
	box-sizing: border-box;
	position: absolute;
	top: 50%;
	left: 50%;
	width: 20px;
	height: 20px;
	margin-top: -10px;
	margin-left: -10px;
	border-radius: 50%;
	border-top: 2px solid #07d;
	border-right: 2px solid transparent;
	animation: spinner .6s linear infinite;
}
`;

class PreviewElement extends HTMLElement {
	constructor(element_name) {
		super();
		const shadow = this.attachShadow({mode: 'open'});
		const link = newStyle();
		const style = document.createElement('style');
		style.textContent = css_essentials;
		shadow.append(style);
		shadow.append(newStyle(ROOT_URL + 'css/preview/common.css'));
		shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));
		this.tpl = compile_tpl(element_name);
	}

	load_promises = [];

	addStyle(url) {
		const promise = new Promise((resolve) => {
			const style = newStyle();
			style.onload = resolve;
			style.setAttribute('href', url);
			this.shadowRoot.append(style);
		});
		this.load_promises.push(promise);
		return promise;
	}

	async init() {
		let parent = this;
		while (!this.db) {
			parent = parent.getRootNode().host;
			if (!parent) break;
			this.db = parent.db;
		}
	}

	connectedCallback() {
		if (!this.initialized) {
			this.initialized = 1;
			const postInit = async () => {
				await Promise.all(this.load_promises);
				this.shadowRoot.querySelectorAll('.window.loading').forEach(w => {
					w.classList.remove('loading');
				});
				setTimeout(() => {
					if (this.onload) this.onload();
				}, 10);
			};
			if (this.init.constructor.name === 'AsyncFunction') {
				this.initPromise = this.init();
				this.initPromise.then(postInit);
			} else {
				this.initPromise = Promise.resolve();
				this.init();
				postInit();
			}
		} else {
			setTimeout(() => {
				if (this.onload) this.onload();
			}, 10);
		}
	}
}

class RecipeTooltip extends PreviewElement {
	constructor() {
		super('pw-recipe-tooltip');
		this.addStyle(ROOT_URL + 'css/preview/pw-recipe-tooltip.css');
	}

	init() {
		super.init();
		const shadow = this.shadowRoot;
		if (!this.obj) {
			this.obj = find_by_id(this.db.recipes, this.dataset.id);
		}

		this.classList.add('tooltip');
		shadow.append(...newArrElements(this.tpl({ db: this.db, recipe: this.obj, find_by_id, Item })));

		if (query_mod_fields(shadow)) {
			this.classList.add('modified');
		} else {
			this.classList.remove('modified');
		}
	}
}

class Recipe extends PreviewElement {
	constructor() {
		super('pw-recipe');
	}

	static get observedAttributes() { return ['pw-id']; }

	async attributeChangedCallback(name, old_val, val) {
		const shadow = this.shadowRoot;
		await this.initPromise;

		switch (name) {
		case 'pw-id': {
			this.obj = find_by_id(this.db.recipes, val);
			shadow.querySelectorAll(':scope > .templated').forEach(i => i.remove());
			const elements = newArrElements(this.tpl({ db: this.db, recipe: this.obj, find_by_id, Item }));
			elements.forEach(e => e.classList.add('templated'));
			shadow.append(...elements);

			if (query_mod_fields(shadow)) {
				this.classList.add('modified');
			} else {
				this.classList.remove('modified');
			}
			break;
		}
		}
	}

}

class RecipeList extends PreviewElement {
	constructor() {
		super('pw-recipe-list');
		this.addStyle(ROOT_URL + 'css/preview/list.css');
		this.tpl = compile_tpl('pw-recipe-list');
	}

	static get observedAttributes() { return ['tab']; }

	init() {
		super.init();
		const shadow = this.shadowRoot;
		if (!this.obj) {
			this.obj = find_by_id(this.db.npc_recipes, this.dataset.id);
		}
		/* clean up some tabs so they don't appear as clickable */
		for (let idx = 0; idx < 8; idx++) {
			if (this.obj.tabs[idx] && !this.obj.tabs[idx].title && is_empty(this.obj.tabs[idx].recipes)) {
				this.obj.tabs[idx] = null;
			}
		}
		shadow.append(...newArrElements(this.tpl({ db: this.db, npc_recipes: this.obj, find_by_id, Item })));

		const tab_els = shadow.querySelectorAll('#tabs > .tab');
		let idx = 0;
		for (; idx < 8; idx++) {
			const tab = this.obj.tabs[idx];
			if (!tab) continue;
			if (this.obj._db.prev && this.obj._db.prev.tabs && !this.obj._db.prev.tabs[idx]) continue;
			if (tab.recipes.every(rid => {
				const r = find_by_id(this.db.recipes, rid);
				if (!r) return true;
				return !r._db.prev;
			})) continue;
			tab_els[idx].classList.add('modified');
		}

		const t = shadow.querySelector('#tabs .modified');
		if (t) {
			this.setTab(t.dataset.idx);
		} else {
			shadow.querySelectorAll('#recipes > div > pw-recipe').forEach(r => {
				r.setAttribute('pw-id', 0);
			});
		}
	}

	setTab(idx) {
		if (!this.obj.tabs[idx] || is_empty(this.obj.tabs[idx].recipes)) return;
		this.shadowRoot.querySelectorAll('#tabs > .tab').forEach(t => t.classList.remove('selected'));
		this.shadowRoot.querySelector('#tabs > .tab[data-idx=\'' + idx + '\']').classList.add('selected');
		this.shadowRoot.querySelectorAll('#recipes > div > pw-recipe:first-child').forEach(r => {
			r.setAttribute('pw-id', this.obj.tabs[idx].recipes[r.dataset.idx] || 0);
			const prev = this.obj._db.prev;
			if (prev && prev.tabs && prev.tabs[idx] && prev.tabs[idx].recipes && prev.tabs[idx].recipes[r.dataset.idx]) r.classList.add('modified');
		});

		this.shadowRoot.querySelectorAll('#recipes > div > pw-recipe:last-child').forEach(r => {
			const prev = this.obj._db.prev;
			if (!prev || ((!prev.tabs || !prev.tabs[idx]) && prev.id != -1)) {
				r.setAttribute('pw-id', 0);
				r.classList.remove('force-visible');
				return;
			}

			if (prev.id == -1 || is_empty(prev.tabs[idx]) || !prev.tabs[idx].recipes) {
				/* this is a brand new tab */
				if (this.obj.tabs[idx].recipes[r.dataset.idx]) {
					r.setAttribute('pw-id', 0);
					r.classList.add('force-visible');
					return;
				} else {
					r.setAttribute('pw-id', 0);
					r.classList.remove('force-visible');
					return;
				}
			}

			if (prev.tabs[idx].recipes[r.dataset.idx] === 0) {
				r.classList.add('force-visible');
			} else {
				r.classList.remove('force-visible');
			}


			r.setAttribute('pw-id', prev.tabs[idx].recipes[r.dataset.idx] || 0);
			const prev_recipe = find_by_id(this.db.recipes, prev.tabs[idx].recipes[r.dataset.idx]);
			if (prev_recipe && prev_recipe._db.prev) r.classList.add('modified');
		});
	}
}

class NPC extends PreviewElement {
	constructor() {
		super('pw-npc');
		this.addStyle(ROOT_URL + 'css/preview/pw-npc.css');
		this.tpl = compile_tpl('pw-npc');
	}

	static get observedAttributes() { return ['pw-id']; }

	init() {
		super.init();
		const shadow = this.shadowRoot;
		shadow.querySelectorAll('*:not(link):not(style)').forEach(i => i.remove());
		shadow.append(...newArrElements(this.tpl({ db: this.db, npc: this.obj, find_by_id })));

		if (query_mod_fields(shadow)) {
			this.classList.add('modified');
		} else {
			this.classList.remove('modified');
		}
	}

	async attributeChangedCallback(name, old_val, val) {
		const shadow = this.shadowRoot;
		await this.initPromise;

		switch (name) {
		case 'pw-id': {
			this.obj = find_by_id(this.db.npcs, val);
			this.init();
			break;
		}
		}
	}
}

class NPCSpawn extends PreviewElement {
	constructor() {
		super('pw-npc-spawn');
		this.tpl = compile_tpl('pw-npc-spawn');
	}

	static get observedAttributes() { return ['pw-id']; }

	init() {
		super.init();
		const shadow = this.shadowRoot;
		shadow.querySelectorAll('*:not(link):not(style)').forEach(i => i.remove());
		shadow.append(...newArrElements(this.tpl({ db: this.db, npc_spawn: this.obj, find_by_id })));

		if (query_mod_fields(shadow)) {
			this.classList.add('modified');
		} else {
			this.classList.remove('modified');
		}
	}

	async attributeChangedCallback(name, old_val, val) {
		const shadow = this.shadowRoot;
		await this.initPromise;

		switch (name) {
		case 'pw-id': {
			this.obj = find_by_id(this.db.npc_spawns, val);
			this.init();
			break;
		}
		}
	}
}


class GoodsList extends PreviewElement {
	constructor() {
		super('pw-goods-list');
		this.addStyle(ROOT_URL + 'css/preview/list.css');
		this.tpl = compile_tpl('pw-goods-list');
	}

	static get observedAttributes() { return ['tab']; }

	init() {
		super.init();
		const shadow = this.shadowRoot;
		if (!this.obj) {
			this.obj = find_by_id(this.db.npc_goods, this.dataset.id);
		}
		/* clean up some tabs so they don't appear as clickable */
		for (let idx = 0; idx < 8; idx++) {
			if (this.obj.tabs[idx] && !this.obj.tabs[idx].title && is_empty(this.obj.tabs[idx].items)) {
				this.obj.tabs[idx] = null;
			}
		}
		shadow.append(...newArrElements(this.tpl({ db: this.db, npc_goods: this.obj, find_by_id, Item })));

		const tab_els = shadow.querySelectorAll('#tabs > .tab');
		let idx = 0;
		for (; idx < 8; idx++) {
			const tab = this.obj.tabs[idx];
			if (!tab) continue;
			if (this.obj._db.prev && this.obj._db.prev.tabs && !this.obj._db.prev.tabs[idx]) continue;
			if (this.obj._db.prev.tabs && this.obj._db.prev.tabs[idx].title === undefined && tab.items.every(id => {
				const r = find_by_id(this.db.items, id);
				if (!r) return true;
				return !r._db.prev;
			})) continue;
			tab_els[idx].classList.add('modified');
		}

		const t = shadow.querySelector('#tabs .modified');
		if (t) {
			this.setTab(t.dataset.idx);
		} else {
			shadow.querySelectorAll('#items > pw-item').forEach(r => {
				r.setAttribute('pw-icon', 0);
			});
		}
	}

	setTab(idx) {
		if (!this.obj.tabs[idx] || is_empty(this.obj.tabs[idx].items)) return;
		this.shadowRoot.querySelectorAll('#tabs > .tab').forEach(t => t.classList.remove('selected'));
		this.shadowRoot.querySelector('#tabs > .tab[data-idx=\'' + idx + '\']').classList.add('selected');
		this.shadowRoot.querySelectorAll('#items > div > pw-item:first-child').forEach(r => {
			const item_id = this.obj.tabs[idx].items[r.dataset.idx] || 0;
			const item = find_by_id(this.db.items, item_id);
			r.setAttribute('pw-icon', item_id == 0 ? -1 : (item ? item.icon : 0));
			if ((item && item._db.prev) || this.obj._db.prev.id == -1 ||
				(this.obj._db.prev.tabs && this.obj._db.prev.tabs[idx] && this.obj._db.prev.tabs[idx].items && this.obj._db.prev.tabs[idx].items[r.dataset.idx])) {
				r.classList.add('modified');
			}

			r.setAttribute('title', item ? item.name : '(unknown #' + item_id + ')');
			const prev = this.obj._db.prev;
			if (prev && prev.tabs && prev.tabs[idx] && prev.tabs[idx].items && prev.tabs[idx].items[r.dataset.idx]) r.classList.add('modified');
		});

		this.shadowRoot.querySelectorAll('#items> div > pw-item:last-child').forEach(r => {
			const prev = this.obj._db.prev;
			if (!prev || ((!prev.tabs || !prev.tabs[idx]) && prev.id != -1)) {
				r.setAttribute('pw-id', 0);
				r.classList.remove('force-visible');
				return;
			}

			if (prev.id == -1 || is_empty(prev.tabs[idx]) || !prev.tabs[idx].items) {
				/* this is a brand new tab */
				if (this.obj.tabs[idx].items[r.dataset.idx]) {
					r.setAttribute('pw-id', 0);
					r.classList.add('force-visible');
					return;
				} else {
					r.setAttribute('pw-id', 0);
					r.classList.remove('force-visible');
					return;
				}
			}

			if (prev.tabs[idx].items[r.dataset.idx] === 0) {
				r.classList.add('force-visible');
			} else {
				r.classList.remove('force-visible');
			}


			r.setAttribute('pw-id', prev.tabs[idx].items[r.dataset.idx] || 0);
			const prev_item = find_by_id(this.db.items, prev.tabs[idx].items[r.dataset.idx]);
			if (prev_item && prev_item._db.prev) r.classList.add('modified');
		});
	}
}

class ItemList extends PreviewElement {
	constructor() {
		super('pw-item-list');
		this.addStyle(ROOT_URL + 'css/preview/list.css');
		this.tpl = compile_tpl('pw-item-list');
	}

	init() {
		super.init();
		const shadow = this.shadowRoot;
		shadow.append(...newArrElements(this.tpl({ items: this.items, find_by_id, Item })));

		let item_idx = this.dataset.itemIdx || 0;
		shadow.querySelectorAll('#items > pw-item').forEach(r => {
			let item;
			while (item_idx < this.items.length) {
				item = this.items[item_idx];
				item_idx++;
				if (item._db.prev) break;
			}

			if (item_idx >= this.items.length) {
				r.setAttribute('pw-icon', -1);
				return;
			}

			r.setAttribute('pw-icon', item.icon);
			r.classList.add('modified');
			r.setAttribute('title', item.name);
		});
	}
}


class Diff extends PreviewElement {
	constructor() {
		super('pw-diff');
		this.addStyle(ROOT_URL + 'css/preview/pw-diff.css');
		this.tpl = compile_tpl('pw-diff');
	}

	async init() {
		const shadow = this.shadowRoot;
		if (!this.project) {
			this.project = this.dataset.project || "";
		}

		const req = await get(ROOT_URL + 'get_preview.php?' + this.project, { is_json: true });
		if (!req.ok) return;
		const json = this.db = req.data;

		super.init();

		shadow.append(...newArrElements(this.tpl({ })));

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

		if (menu_el.children.length > 0) {
			menu_el.children[0].children[0].click();
		}

		if (cur_cnt > max_cnt) {
			const p = document.createElement('p');
			p.textContent = '+ ' + (cur_cnt - max_cnt) + ' more';
			p.onclick = () => {
				if (parent_container.classList.toggle('expanded')) {
					p.textContent = '^ ' + (cur_cnt - max_cnt) + ' less';
				} else {
					p.textContent = '+ ' + (cur_cnt - max_cnt) + ' more';
				}
			};
			parent_container.append(p);
		}

		this.classList.add('loaded');
	}
}

(async () => {
	await Promise.all([
		load_tpl_file(ROOT_URL + 'tpl/preview.tpl'),
		Item.set_iconset(ROOT_URL + 'img/iconlist_ivtrm.png'),
	]);
	customElements.define('pw-npc', NPC);
	customElements.define('pw-npc-spawn', NPCSpawn);
	customElements.define('pw-recipe-tooltip', RecipeTooltip);
	customElements.define('pw-recipe', Recipe);
	customElements.define('pw-recipe-list', RecipeList);
	customElements.define('pw-goods-list', GoodsList);
	customElements.define('pw-item-list', ItemList);
	customElements.define('pw-diff', Diff);
})();
