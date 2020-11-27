import { newElement, newArrElements, newStyle, escape } from './DomUtil.mjs';
import { get, sleep, ROOT_URL, VERSION, on_version_ready } from './Util.mjs';
import { Item } from './Item.mjs';
import db from './PWDB.mjs';
import { compile_tpl, load_tpl_file } from './template.mjs';
import { show_loading_tag, hide_loading_tag } from './loading.mjs';

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

/*
class RecipeTooltip {
	async init() {
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
		this.addStyle(ROOT_URL + 'css/preview/list.css?v=' + VERSION);
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
/*
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
/*
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
		this.addStyle(ROOT_URL + 'css/preview/pw-npc.css?v=' + VERSION);
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
*/

class PWPreviewGoods extends ShadowElement {
	constructor(db, goods) {
		super(db);
		this.goods = goods;
		this.tpl = new Template('tpl-preview-goods');
	}

	init() {
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

/*
class ItemList extends PreviewElement {
	constructor() {
		super('pw-item-list');
		this.addStyle(ROOT_URL + 'css/preview/list.css?v=' + VERSION);
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
*/

/* TODO */
(async () => {
	await Promise.all([
		((async () => {
			const tag = show_loading_tag('Fetching preview scheme');
			await load_tpl_file(ROOT_URL + 'tpl/preview.tpl?v=' + VERSION)
			hide_loading_tag(tag);
		})()),
		((async () => {
			const tag = show_loading_tag('Loading item icons');
			await Item.set_iconset(ROOT_URL + 'img/iconlist_ivtrm.png?v=' + VERSION),
			hide_loading_tag(tag);
		})()),
	]);
	customElements.define('pw-diff', PWPreviewElement);
})();
