/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

let g_latest_db;
let g_latest_db_promise;

class PWPreview {
	static async load() {
		await Loading.init();
		console.log('PWPreview loading');

		await Promise.all([
			load_script(ROOT_URL + 'script/db.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/idb.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/item.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/template.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/htmlsugar.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/pwdb.js?v=' + MG_VERSION),
		]);

		await Item.init(ROOT_URL + 'img/iconlist_ivtrm.png?v=' + MG_VERSION);
		customElements.define('pw-diff', PWPreviewElement);
	}

	static is_empty(obj) {
		if (!obj) return true;
		if (typeof obj === 'object' && Array.isArray(obj)) {
			if (obj.length == 0) return true;
			if (obj.every(i => i === null)) return true;
			return false;
		}
		return Object.keys(obj).length == 0;
	}

	static is_modified(obj, path) {
		if (typeof(path) == 'string') {
			path = [ path ];
		}

		if (!obj._db.prev) {
			return false;
		}

		let p = obj._db.prev;
		for (const c of path) {
			if (!p || !(c in p)) {
				return false;
			}
			p = p[c];
		}

		return p !== null;
	}

	static load_promise;
}

class PWPreviewShadowElement {
	constructor(root) {
		this.root = root;
		this.db = this.root.db;
		this.dom = document.createElement('div');
		this.dom._el = this;
		this.shadow = this.dom.attachShadow({mode: 'open'});

		const styles = [];
		styles.push(newStyle(ROOT_URL + 'css/preview.css'));
		styles.push(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		this.style_promises = Promise.all(styles.map((s) => new Promise((resolve) => { s.onload = resolve; })));
		this.shadow.append(...styles);
	}
}

class PWPreviewElement extends HTMLElement {
	constructor() {
		super();

		this.shadow = this.attachShadow({mode: 'open'});

		const styles = [];
		styles.push(newStyle(ROOT_URL + 'css/preview.css'));
		styles.push(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		this.style_promises = styles.map((s) => new Promise((resolve) => { s.onload = resolve; }));
		this.shadow.append(...styles);

		this.tpl = new Template('pw-preview-root');
	}

	onmousemove(e) {
		const item = e.path?.find(el => el?.classList?.contains('item'));
		if (!this.item_win) {
			/* not initialized yet */
			return;
		}

		HTMLSugar.show_item_tooltip(this.item_win, item, { db: this.db });
	}

	async connectedCallback() {
		if (!this.dataset.project) {
			return;
		}

		if (!g_latest_db_promise) {
			g_latest_db_promise = new Promise(async (resolve) => {
				g_latest_db = await PWDB.new_db({ /* XXX */ no_tag: true });
				resolve();
			});
		}
		await g_latest_db_promise;

		const req = await get(ROOT_URL + 'get_preview.php?' + this.dataset.project, { is_json: true });
		if (!req.ok) return;
		this.db = req.data;

		this.tabs = [];
		let count = 0;
		for (const arr_name in this.db) {
			if (arr_name == 'metadata') {
				continue;
			}

			this.db[arr_name] = init_id_array(this.db[arr_name], g_latest_db[arr_name]);
			for (const obj of this.db[arr_name]) {
				this.tabs.push({ obj: obj, type: arr_name });
			}
		}
		/* fill in other arrays */
		Object.setPrototypeOf(this.db, g_latest_db);

		await Promise.all([
			this.style_promises,
			load_tpl(ROOT_URL + 'tpl/preview/root.tpl'),
		]);

		const data = await this.tpl.run({ preview: this, db: this.db });
		this.shadow.append(data);

		await this.select_tab(0);

		this.shadow.querySelectorAll('.prev').forEach(p => { p.previousSibling.classList.add('new'); });

		this.item_win = new ItemTooltip({ parent_el: this.shadow, db: this.db, edit: false });
		const s = newStyle(ROOT_URL + 'css/preview.css');
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.item_win.shadow.append(s);
		await s_p;

		data.onmousemove = (e) => this.onmousemove(e);
		this.classList.add('loaded');
	}

	select_tab(id) {
		const tab = this.tabs[id];

		const el = this.shadow.querySelector('#element');
		while (el.firstChild) {
			el.firstChild.remove();
		}

		let win;
		switch(tab.obj._db.type) {
			case 'npc_sells': {
				win = new PWPreviewNPCSells(this, tab.obj);
				break;
			}
			case 'npc_crafts': {
				win = new PWPreviewNPCCrafts(this, tab.obj);
				break;
			}
			default:
				break;
		}

		if (win) {
			el.append(win.dom);
			return new Promise(async (resolve) => {
				await win.init();
				win.shadow.querySelector('.window').classList.remove('loading');
				resolve();
			});
		}
	}

	get_item_icon(itemid) {
		if (!itemid) {
			return (ROOT_URL + 'img/itemslot.png');
		}

		return Item.get_icon(this.db.items[itemid]?.icon || 0);
	}
}

class PWPreviewNPCSells extends PWPreviewShadowElement {
	constructor(root, obj) {
		super(root);
		this.obj = obj;
		this.tpl = new Template('pw-preview-sells');
	}

	async init() {
		/* clean up some tabs so they don't appear as clickable */
		for (let idx = 0; idx < 8; idx++) {
			if (this.obj.tabs[idx] && !this.obj.tabs[idx].title && PWPreview.is_empty(this.obj.tabs[idx].items)) {
				this.obj.tabs[idx] = null;
			}
		}

		this.selected_tab = 0;

		await load_tpl(ROOT_URL + 'tpl/preview/sell.tpl');
		const data = await this.tpl.run({ preview: this.root, win: this, db: this.db, goods: this.obj });
		this.shadow.append(data);
	}

	is_tab_modified(idx) {
		if (PWPreview.is_modified(this.obj, [ 'tabs', idx ])) {
			return true;
		}

		for (const item_id of (this.obj?.tabs?.[idx]?.items || [])) {
			const item = this.db.items[item_id];
			if (!item) return !!item_id;
			if (PWPreview.is_modified(item, [])) {
				return true;
			}
		}

		return false;
	}

	is_item_modified(idx) {
		if (PWPreview.is_modified(this.obj, [ 'tabs', this.selected_tab, 'items', idx ])) {
			return true;
		}

		const item_id = this.obj?.tabs?.[this.selected_tab]?.items?.[idx];
		const item = this.db.items[item_id];
		if (!item) return !!item_id;
		return PWPreview.is_modified(item, []);
	}

	async select_tab(tab_el, idx) {
		const tab = this.obj
		this.selected_tab = idx;
		this.tpl.reload('#items');

		const prev_tab = this.shadow.querySelector('.tab.selected');
		if (prev_tab) {
			prev_tab.classList.remove('selected');
		}

		tab_el.classList.add('selected');
	}
}

class PWPreviewNPCCrafts extends PWPreviewShadowElement {
	constructor(root, obj) {
		super(root);
		this.obj = obj;
		this.tpl = new Template('pw-preview-crafts');
	}

	async init() {
		/* clean up some tabs so they don't appear as clickable */
		for (let idx = 0; idx < 8; idx++) {
			if (this.obj.tabs[idx] && !this.obj.tabs[idx].title && PWPreview.is_empty(this.obj.tabs[idx].recipes)) {
				this.obj.tabs[idx] = null;
			}
		}

		this.selected_tab = 0;

		await load_tpl(ROOT_URL + 'tpl/preview/craft.tpl');
		const data = await this.tpl.run({ preview: this.root, win: this, db: this.db, crafts: this.obj });
		this.shadow.append(data);
	}

	is_tab_modified(idx) {
		if (PWPreview.is_modified(this.obj, [ 'tabs', idx ])) {
			return true;
		}

		for (const recipe_id of (this.obj?.tabs?.[idx]?.recipes || [])) {
			const recipe = this.db.recipes[recipe_id];
			if (!recipe) return !!recipe_id;
			if (PWPreview.is_modified(recipe, [])) {
				return true;
			}
		}

		return false;
	}

	async select_tab(tab_el, idx) {
		const tab = this.obj
		this.selected_tab = idx;
		this.tpl.reload('#recipes');

		const prev_tab = this.shadow.querySelector('.tab.selected');
		if (prev_tab) {
			prev_tab.classList.remove('selected');
		}

		tab_el.classList.add('selected');
	}

	get_recipe_icon(recipe_id) {
		if (!recipe_id) {
			return (ROOT_URL + 'img/itemslot.png');
		}

		const recipe = this.db.recipes[recipe_id];
		return this.root.get_item_icon(recipe?.targets?.[0]?.id || -1);
	}

	is_recipe_modified(idx) {
		if (PWPreview.is_modified(this.obj, [ 'tabs', this.selected_tab, 'recipes', idx ])) {
			return true;
		}

		const recipe_id = this.obj?.tabs?.[this.selected_tab]?.recipes?.[idx];
		const recipe = this.db.recipes[recipe_id];
		if (!recipe) return !!recipe_id;
		return PWPreview.is_modified(recipe, []);
	}

}


PWPreview.load_promise = PWPreview.load();
