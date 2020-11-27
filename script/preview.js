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
			if (!(c in p)) {
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

	async connectedCallback() {
		if (!this.dataset.project) {
			return;
		}

		const req = await get(ROOT_URL + 'get_preview.php?' + this.dataset.project, { is_json: true });
		if (!req.ok) return;
		this.db = req.data;

		this.tabs = [];
		let count = 0;
		for (const arr_name in this.db) {
			this.db[arr_name] = init_id_array(this.db[arr_name]);
			if (arr_name == 'metadata') {
				continue;
			}

			for (const obj of this.db[arr_name]) {
				this.tabs.push({ obj: obj, type: arr_name });
			}
		}

		await Promise.all([
			this.style_promises,
			load_tpl(ROOT_URL + 'tpl/preview/root.tpl'),
		]);

		const data = await this.tpl.run({ preview: this, db: this.db });
		this.shadow.append(data);

		await this.select_tab(0);

		this.shadow.querySelectorAll('.prev').forEach(p => { p.previousSibling.classList.add('new'); });
		this.shadow.querySelectorAll('.window.loading').forEach(w => {
			w.classList.remove('loading');
		});

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
			case 'npc_goods': {
				win = new PWPreviewNPCSells(this, tab.obj);
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

		await load_tpl(ROOT_URL + 'tpl/preview/sell.tpl');
		const data = await this.tpl.run({ win: this, db: this.db, goods: this.obj });
		this.shadow.append(data);
	}

	is_tab_modified(idx) {
		if (PWPreview.is_modified(this.obj, [ 'tabs', idx ])) {
			return true;
		}

		for (const item_id of (this.obj?.tabs?.[idx]?.items || [])) {
			const item = this.db.items[item_id];
			if (!item) return true;
			if (PWPreview.is_modified(item, [])) {
				return true;
			}
		}

		return false;
	}

	async set_tab(tab_el, idx) {
		const tab = this.obj

	}
}

PWPreview.load_promise = PWPreview.load();
