import { newElement, newArrElements, escape } from '../DomUtil.mjs';
import { get, sleep } from '../Util.mjs';
import { Item } from '../Item.mjs';
import db from '../PWDB.mjs';
import { compile_tpl, load_tpl_file } from '../template.mjs';

const newStyle = (url) => {
	const linkElem = document.createElement('link');
	linkElem.setAttribute('rel', 'stylesheet');
	linkElem.setAttribute('href', url);
	return linkElem;
}

const find_by_id = (tbl, id) => {
	for (const obj of tbl) {
		if (obj.id == id) return obj;
	}
	return null;
}

export class RecipeTooltip extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('css/preview/common.css'));

		this.tpl = compile_tpl('recipe-tooltip-tpl');
	}

	connectedCallback() {
		const shadow = this.shadowRoot;
		this.db = this.getRootNode().host.db;
		if (!this.obj) {
			this.obj = find_by_id(this.db.recipes, this.dataset.id);
		}

		this.classList.add('tooltip');
		shadow.append(...newArrElements(this.tpl({ db, recipe: this.obj, Item })));
	}
}

export class RecipeList extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('css/preview/common.css'));

		this.tpl = compile_tpl('recipe-list');
	}

	connectedCallback() {
		const shadow = this.shadowRoot;
		this.db = this.getRootNode().host.db;
		if (!this.obj) {
			this.obj = find_by_id(this.db, this.dataset.id);
		}
		shadow.append(...newArrElements(this.tpl({ db: this.db, npc_recipes: this.obj, find_by_id, Item })));
	}
}

export class Diff extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.append(newStyle('css/preview/common.css'));

		this.tpl = compile_tpl('diff');
	}

	async connectedCallback() {
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
	customElements.define('pw-diff', Diff);
})();
