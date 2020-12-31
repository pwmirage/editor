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

		let d = obj._db.diff;
		for (const c of path) {
			if (!d) {
				return false;
			}
			d = d[c];
		}

		return !!d;
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
		if (!this.item_win || !this.recipe_win) {
			/* not initialized yet */
			return;
		}

		const el = e.path?.find(el => el?.classList?.contains('item') || el?.classList?.contains('recipe'));
		const item = el?.classList.contains('item') ? el : null;
		const recipe = el?.classList.contains('recipe') ? el : null;

		HTMLSugar.show_item_tooltip(this.item_win, item, { db: this.db });
		HTMLSugar.show_recipe_tooltip(this.recipe_win, recipe, { db: this.db });
	}

	async connectedCallback() {
		if (!g_latest_db_promise) {
			g_latest_db_promise = new Promise(async (resolve) => {
				g_latest_db = await PWDB.new_db({ pid: 'latest', new: true, no_tag: true });
				resolve();
			});
		}
		await g_latest_db_promise;

		let preview_db;
		if (this.dataset.hash) {
			/* fetch from the server */
			const req = await get(ROOT_URL + 'project/preview/' + this.dataset.hash, { is_json: true });
			if (!req.ok) return;
			preview_db = req.data;
		} else {
			/* fetch from the local service worker (cache API) */
			const req = await get(ROOT_URL + 'project/preview/local/' + this.dataset.pid + '?t=' + this.dataset.lastEdit, { is_json: true });
			if (!req.ok) return;
			preview_db = req.data;
		}

		this.db = {};

		this.tabs = [];
		let count = 0;
		for (const arr_name in g_latest_db) {
			this.db[arr_name] = init_id_array([], g_latest_db[arr_name]);
		}

		for (const obj of preview_db) {
			/* XXX: don't just put everything to tabs -> smarter filtering, spawners/npcs first, then crafts/goods, then recipes and items */

			this.db[obj._db.type][obj.id] = obj;
			this.tabs.push({ obj: obj, type: obj._db.type });
		}

		await Promise.all([
			this.style_promises,
			load_tpl(ROOT_URL + 'tpl/preview/root.tpl'),
		]);

		const has_local_changes = !!this.dataset.hash && !!this.dataset.edits;
		const data = await this.tpl.run({ preview: this, db: this.db, has_local_changes });
		this.shadow.append(data);

		await this.select_tab(0);

		this.item_win = new ItemTooltip({ parent_el: this.shadow, db: this.db, edit: false });
		this.recipe_win = new RecipeTooltip({ parent_el: this.shadow, db: this.db, edit: false });
		for (const shadow of [ this.recipe_win.shadow, this.item_win.shadow ]) {
			const s = newStyle(ROOT_URL + 'css/preview.css');
			const s_p = new Promise((resolve) => { s.onload = resolve; });
			shadow.prepend(s);
			await s_p;
		}

		data.onmousemove = (e) => this.onmousemove(e);
		this.classList.add('loaded');
	}

	select_tab(id) {
		const tab = this.tabs[id];
		if (!tab) {
			/* XXX: show some dummy window here? */
			return;
		}

		const el = this.shadow.querySelector('#element');
		while (el.firstChild) {
			el.firstChild.remove();
		}

		let win;
		switch(tab?.obj?._db?.type) {
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
		this.selected_tab = 0;

		await load_tpl(ROOT_URL + 'tpl/preview/sell.tpl');
		const data = await this.tpl.run({ preview: this.root, win: this, db: this.db, goods: this.obj });
		this.shadow.append(data);
	}

	is_tab_modified(idx) {
		if (PWPreview.is_modified(this.obj, [ 'pages', idx ])) {
			return true;
		}

		for (const item_id of (this.obj?.pages?.[idx]?.item_id || [])) {
			const item = this.db.items[item_id];
			if (!item) return !!item_id;
			if (PWPreview.is_modified(item, [])) {
				return true;
			}
		}

		return false;
	}

	is_item_modified(idx) {
		if (PWPreview.is_modified(this.obj, [ 'pages', this.selected_tab, 'item_id', idx ])) {
			return true;
		}

		const diff = this.obj._db.diff;
		const new_item_id = diff?.pages?.[this.selected_tab]?.item_id?.[idx];
		const item_id = new_item_id ?? this.obj.pages?.[this.selected_tab]?.item_id?.[idx];
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
