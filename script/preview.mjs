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
	}
	return false;
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
		if (!this.db) this.db = this.getRootNode().host.db;
	}

	connectedCallback() {
		if (!this.initialized) {
			this.initialized = 1;
			const postInit = async () => {
				await Promise.all(this.load_promises);
				this.shadowRoot.querySelectorAll('.window.loading').forEach(w => {
					w.classList.remove('loading');
				});
				if (this.onload) this.onload();
			};
			if (this.init.constructor.name === 'AsyncFunction') {
				this.init().then(postInit);
			} else {
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

	attributeChangedCallback(name, old_val, val) {
		const shadow = this.shadowRoot;

		switch (name) {
		case 'pw-id': {
			this.obj = find_by_id(this.db.recipes, val);
			shadow.querySelectorAll('*:not(link):not(style)').forEach(i => i.remove());
			shadow.append(...newArrElements(this.tpl({ db: this.db, recipe: this.obj, find_by_id, Item })));

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
			shadow.querySelectorAll('#recipes > pw-recipe').forEach(r => {
				r.setAttribute('pw-id', 0);
			});
		}
	}

	setTab(idx) {
		if (!this.obj.tabs[idx] || is_empty(this.obj.tabs[idx].recipes)) return;
		this.shadowRoot.querySelectorAll('#tabs > .tab').forEach(t => t.classList.remove('selected'));
		this.shadowRoot.querySelector('#tabs > .tab[data-idx=\'' + idx + '\']').classList.add('selected');
		this.shadowRoot.querySelectorAll('#recipes > pw-recipe').forEach(r => {
			r.setAttribute('pw-id', this.obj.tabs[idx].recipes[r.dataset.idx] || 0);
			const prev = this.obj._db.prev;
			if (prev && prev.tabs && prev.tabs[idx] && prev.tabs[idx].recipes && prev.tabs[idx].recipes[r.dataset.idx]) r.classList.add('modified');
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

	attributeChangedCallback(name, old_val, val) {
		const shadow = this.shadowRoot;

		switch (name) {
		case 'pw-id': {
			this.obj = find_by_id(this.db.npcs, val);
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
			if (this.obj._db.prev.tabs[idx].title === undefined && tab.items.every(id => {
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
		this.shadowRoot.querySelectorAll('#items > pw-item').forEach(r => {
			const item_id = this.obj.tabs[idx].items[r.dataset.idx] || 0;
			const item = find_by_id(this.db.items, item_id);
			r.setAttribute('pw-icon', item_id == 0 ? -1 : (item ? item.icon : 0));
			if ((item && item._db.prev) ||
				(this.obj._db.prev.tabs[idx] && this.obj._db.prev.tabs[idx].items && this.obj._db.prev.tabs[idx].items[r.dataset.idx])) {
				r.classList.add(modified);
			}

			r.setAttribute('title', item ? item.name : '(unknown #' + item_id + ')');
			const prev = this.obj._db.prev;
			if (prev && prev.tabs && prev.tabs[idx] && prev.tabs[idx].items && prev.tabs[idx].items[r.dataset.idx]) r.classList.add('modified');
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

		const req = await get(ROOT_URL + '/uploads/preview/' + this.project + ".json", { is_json: true });
		if (!req.ok) return;
		const json = this.db = req.data;

		super.init();

		shadow.append(...newArrElements(this.tpl({ })));

		const el_types = {
			npcs: { type: 'pw-npc', title: 'NPC' },
			npc_recipes: { type: 'pw-recipe-list', title: 'NPC Crafts' },
			npc_goods: { type: 'pw-goods-list', title: 'NPC Goods' },
		};

		let cur_cnt = 0;
		const max_cnt = this.dataset.maxItems || 99999;
		const menu_el = shadow.querySelector('#menu');
		const pw_container = shadow.querySelector('#element');
		for (const arr in this.db) {
			if (arr === 'metadata') continue;
			const el_type = el_types[arr];
			if (!el_type) continue;

			for (const obj of this.db[arr]) {
				cur_cnt++;
				if (cur_cnt > max_cnt) break;

				const tab_el = document.createElement('div')
				const p = document.createElement('p');
				p.textContent = el_type.title;
				tab_el.append(p);

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
						console.log('new element');
						const pw_el = document.createElement(el_type.type);
						pw_el.obj = obj;
						pw_el.db = this.db;
						tab_el.pwElement = pw_el;
					}

					if (prev_el) {
						tab_el.pwElement.style.display = 'none';
						tab_el.pwElement.onload = () => {
							if (prev_el) pw_container.removeChild(prev_el);
							tab_el.pwElement.style.display = 'block';
							tab_el.pwElement.onload = null;
						}
					}
					pw_container.appendChild(tab_el.pwElement);
				};
				if (cur_cnt == 1) p.click();

				menu_el.append(tab_el);
			}
		}
	}
}

(async () => {
	await Promise.all([
		load_tpl_file('/map/tpl/preview.tpl'),
		Item.set_iconset('/map/img/iconlist_ivtrm.png'),
	]);
	customElements.define('pw-npc', NPC);
	customElements.define('pw-recipe-tooltip', RecipeTooltip);
	customElements.define('pw-recipe', Recipe);
	customElements.define('pw-recipe-list', RecipeList);
	customElements.define('pw-goods-list', GoodsList);
	customElements.define('pw-diff', Diff);
})();
