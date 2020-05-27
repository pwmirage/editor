import { newElement, newArrElements, newStyle, escape } from '../DomUtil.mjs';
import { get, sleep } from '../Util.mjs';
import { Item } from '../Item.mjs';
import db from '../PWDB.mjs';
import { compile_tpl, load_tpl_file } from '../template.mjs';

const find_by_id = (tbl, id) => {
	for (const obj of tbl) {
		if (obj.id == id) return obj;
	}
	return null;
}

class RecipeTooltip extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('css/preview/common.css'));
		shadow.append(newStyle('css/preview/pw-recipe-tooltip.css'));
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
	}
}

class Recipe extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('css/preview/common.css'));
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
			break;
		}
		}
	}

}

class RecipeList extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('css/preview/common.css'));
		shadow.append(newStyle('css/preview/list.css'));

		this.tpl = compile_tpl('pw-recipe-list');
	}

	static get observedAttributes() { return ['tab']; }

	connectedCallback() {
		if (this.initialized) return;
		this.initialized = 1;
		const shadow = this.shadowRoot;
		this.db = this.getRootNode().host.db;
		if (!this.obj) {
			this.obj = find_by_id(this.db, this.dataset.id);
		}
		shadow.append(...newArrElements(this.tpl({ db: this.db, npc_recipes: this.obj, find_by_id, Item })));

		let idx = 0;
		for (; idx < 8; idx++) {
			const tab = this.obj.tabs[idx];
			if (!tab) continue;
			this.setTab(idx);
			break;
		}

		if (idx == 8) {
			this.shadowRoot.querySelectorAll('#recipes > pw-recipe').forEach(r => {
				r.setAttribute('pw-id', 0);
			});
		}
	}

	setTab(idx) {
		if (!this.obj.tabs[idx]) return;
		this.shadowRoot.querySelectorAll('#tabs > .tab').forEach(t => t.classList.remove('selected'));
		this.shadowRoot.querySelector('#tabs > .tab[data-idx=\'' + idx + '\']').classList.add('selected');
		this.shadowRoot.querySelectorAll('#recipes > pw-recipe').forEach(r => {
			r.setAttribute('pw-id', this.obj.tabs[idx].recipes[r.dataset.idx] || 0);
		});
	}
}

class Diff extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('css/preview/common.css'));

		this.tpl = compile_tpl('pw-diff');
	}

	async connectedCallback() {
		if (this.initialized) return;
		this.initialized = 1;
		const shadow = this.shadowRoot;
		if (!this.project) {
			this.project = this.dataset.project || "";
		}

		const req = await get("uploads/preview/" + this.project + ".json", { is_json: true });
		if (!req.ok) return;
		const json = this.db = req.data;
		for (const obj of json.npc_recipes) {
			const list = document.createElement('pw-recipe-list');
			list.db = json;
			list.obj = obj;
			shadow.append(list);
		}

		shadow.append(...newArrElements(this.tpl({ })));
	}
}

(async () => {
	await Promise.all([
		load_tpl_file('tpl/preview.tpl'),
		Item.set_iconset('img/iconlist_ivtrm.png'),
	]);
	customElements.define('pw-recipe-tooltip', RecipeTooltip);
	customElements.define('pw-recipe-list', RecipeList);
	customElements.define('pw-recipe', Recipe);
	customElements.define('pw-diff', Diff);
})();
