import { newElement, newArrElements, newStyle, escape } from '../DomUtil.mjs';
import { get, sleep, ROOT_URL } from '../Util.mjs';
import { Item } from '../Item.mjs';
import db from '../PWDB.mjs';
import { compile_tpl, load_tpl_file } from '../template.mjs';

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

class RecipeTooltip extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle(ROOT_URL + 'css/preview/common.css'));
		shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));
		shadow.append(newStyle(ROOT_URL + 'css/preview/pw-recipe-tooltip.css'));
		this.tpl = compile_tpl('pw-recipe-tooltip');
	}

	connectedCallback() {
		if (this.initialized) return;
		this.initialized = 1;

		const shadow = this.shadowRoot;
		this.db = this.getRootNode().host.db;
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

class Recipe extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));
		shadow.append(newStyle(ROOT_URL + 'css/preview/common.css'));
		this.tpl = compile_tpl('pw-recipe');
	}

	static get observedAttributes() { return ['pw-id']; }

	connectedCallback() {
		if (this.initialized) return;
		this.initialized = 1;

		const shadow = this.shadowRoot;
		this.db = this.getRootNode().host.db;
	}

	attributeChangedCallback(name, old_val, val) {
		const shadow = this.shadowRoot;

		switch (name) {
		case 'pw-id': {
			this.obj = find_by_id(this.db.recipes, val);
			shadow.querySelectorAll('*:not(link)').forEach(i => i.remove());
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

class RecipeList extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle(ROOT_URL + 'css/preview/common.css'));
		shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));
		shadow.append(newStyle(ROOT_URL + 'css/preview/list.css'));

		this.tpl = compile_tpl('pw-recipe-list');
	}

	static get observedAttributes() { return ['tab']; }

	connectedCallback() {
		if (this.initialized) return;
		this.initialized = 1;
		const shadow = this.shadowRoot;
		this.db = this.getRootNode().host.db;
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

class NPC extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));
		shadow.append(newStyle(ROOT_URL + 'css/preview/common.css'));
		shadow.append(newStyle(ROOT_URL + 'css/preview/npc.css'));
		this.tpl = compile_tpl('pw-npc');
	}

	static get observedAttributes() { return ['pw-id']; }

	connectedCallback() {
		if (this.initialized) return;
		this.initialized = 1;

		this.db = this.getRootNode().host.db;
		if (this.obj) this.reinit();
	}

	reinit() {
		const shadow = this.shadowRoot;
		shadow.querySelectorAll('*:not(link)').forEach(i => i.remove());
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
			this.reinit();
			break;
		}
		}
	}
}

class GoodsList extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));
		shadow.append(newStyle(ROOT_URL + 'css/preview/common.css'));
		shadow.append(newStyle(ROOT_URL + 'css/preview/list.css'));

		this.tpl = compile_tpl('pw-goods-list');
	}

	static get observedAttributes() { return ['tab']; }

	connectedCallback() {
		if (this.initialized) return;
		this.initialized = 1;
		const shadow = this.shadowRoot;
		this.db = this.getRootNode().host.db;
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

class Diff extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));
		shadow.append(newStyle(ROOT_URL + 'css/preview/common.css'));

		this.tpl = compile_tpl('pw-diff');
	}

	async connectedCallback() {
		if (this.initialized) return;
		this.initialized = 1;
		const shadow = this.shadowRoot;
		if (!this.project) {
			this.project = this.dataset.project || "";
		}

		const req = await get(ROOT_URL + '/uploads/preview/' + this.project + ".json", { is_json: true });
		if (!req.ok) return;
		const json = this.db = req.data;

		let cur_cnt = 0;
		const max_cnt = this.dataset.maxItems || 99999;
		for (const obj of json.npcs) {
			cur_cnt++;
			if (cur_cnt > max_cnt) break;
			const el = document.createElement('pw-npc');
			el.db = json;
			el.obj = obj;
			shadow.append(el);
		}

		for (const obj of json.npc_recipes) {
			cur_cnt++;
			if (cur_cnt > max_cnt) break;
			const list = document.createElement('pw-recipe-list');
			list.db = json;
			list.obj = obj;
			shadow.append(list);
		}

		for (const obj of json.npc_goods) {
			cur_cnt++;
			if (cur_cnt > max_cnt) break;
			const list = document.createElement('pw-goods-list');
			list.db = json;
			list.obj = obj;
			shadow.append(list);
		}

		shadow.append(...newArrElements(this.tpl({ })));
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
