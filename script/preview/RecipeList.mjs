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
		if (!this.diff) {
			this.diff = this.dataset.diff ? JSON.parse(this.dataset.diff) : {};
		}

		this.classList.add('tooltip');

		const recipe = JSON.parse('{"id":2069,"name":"N/A","major_type":1,"minor_type":2050,"craft_level":6,"craft_id":158,"bind":0,"targets":[{"id":16076,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0},{"id":0,"prob":0},{"id":0,"prob":0},{"id":0,"prob":0},{"id":0,"prob":0},{"id":0,"prob":0}],"fail_prob":0,"num_to_make":1,"coins":0,"duration":15,"xp":100,"sp":50,"mats":[{"id":16654,"num":1},{"id":3372,"num":2000},{"id":16467,"num":2},{"id":16468,"num":1},{"id":16545,"num":25},{"id":0,"num":0},{"id":0,"num":0},{"id":0,"num":0}],"_db":{"__type":"recipes"}}');
		shadow.append(...newArrElements(this.tpl({ db, recipe, Item })));
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
		if (!this.obj) this.obj = this.dataset.obj ? JSON.parse(this.dataset.obj) : {};
		if (!this.db) this.db = this.dataset.db ? JSON.parse(this.dataset.db) : {};
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
		const json = req.data;
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
