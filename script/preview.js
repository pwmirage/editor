/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

let g_latest_db = {};
let g_latest_db_promise;
let db;

class PWPreview {
	static async load() {
		await Loading.init();
		console.log('PWPreview loading');

		await Promise.all([
			load_script(ROOT_URL + 'script/db.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/idb.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/item.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/pwdb.js?v=' + MG_VERSION),
			load_tpl(ROOT_URL + 'tpl/preview/diff.tpl'),
		]);

		PWDB.init();
		PWPreview.diff_tpl = new Template('tpl-diff');
		PWPreview.diff_entry_tpl = new Template('tpl-diff-entry');

		await Item.init();

		customElements.define('pw-preview', MiragePreviewElement);

		const db_ok = await PWPreview.load_latest_db();
		if (!db_ok) {
			let msg = 'Can\'t load latest game data. Are you running an old browser?';
			if (!navigator.serviceWorker) {
				msg += '<br>Note that Firefox Private Mode is not supported.';
			}
			confirm(msg, '', 'Error');
			await sleep(1);
			g_confirm_dom.classList.add('noconfirm');
		}
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

	static get_obj_type(obj) {
		let name = obj._db.type;
		let open_fn = () => {};

		switch (obj._db.type) {
			case 'npcs':
				name = 'NPC';
				open_fn = () => NPCWindow.open({ obj: obj });
				break;
			case 'monsters':
				name = 'Monster';
				open_fn; /* TODO */
				break;
			case 'npc_crafts':
				name = 'Crafts';
				open_fn = () => NPCCraftsWindow.open({ obj: obj });
				break;
			case 'npc_sells':
				name = 'Goods';
				open_fn = () => NPCGoodsWindow.open({ obj: obj });
				break;
			case 'recipes':
				name = 'Recipe';
				open_fn = () => RecipeWindow.open({ obj: obj });
				break;
			case 'items':
				name = 'Item';
				open_fn = () => ItemTooltipWindow.open({ obj: obj, edit: true, db });
				break;
			case 'mines':
				name = 'Resource';
				open_fn; /* TODO */
				break;
			case 'tasks':
				name = 'Quest';
				open_fn = () => TaskWindow.open({ obj: obj });
				break;
			default:
				break;
		}

		if (obj._db.type.startsWith('spawners_')) {
			name = 'Spawner';
			open_fn = () => SpawnerWindow.open({ obj: obj });
		}

		if (obj._db.type.startsWith('triggers_')) {
			name = 'Trigger';
			open_fn = () => TriggerWindow.open({ obj: obj });
		}

		return { name, open_fn };
	}

	static get_obj_img(db, obj) {
		let file = 'item-unknown.png';
		let src = null;

		if (['npc_crafts', 'npc_sells', 'monsters', 'npcs', 'mines', 'tasks'].includes(obj._db.type)) {
			file = 'icon_' + obj._db.type + '.jpg';
		} else if (obj._db.type.startsWith('spawners_')) {
			if (obj.type == 'npc') {
				file = 'icon_spawner_yellow.jpg';
			} else if (obj.type == 'monster') {
				file = 'icon_spawner_red.jpg';
			} else {
				file = 'icon_spawner_green.jpg';
			}
		} else if (obj._db.type == 'items') {
			src = Item.get_icon(obj.icon);
		} else if (obj._db.type == 'recipes') {
			src = Item.get_icon_by_item(db, obj.targets?.[0]?.id || -1);
		}

		return src || (ROOT_URL + '/img/' + file);
	}

	static diff(args) {
		return PWPreview.diff_tpl.run(args);
	}

	static get_item_icon(db, itemid) {
		const item = db.items[itemid];
		return item ? Item.get_icon(item.icon || 0) : (ROOT_URL + 'img/itemslot.png');

	}

	static async load_latest_db() {
		if (!g_latest_db_promise) {
			g_latest_db_promise = new Promise(async (resolve) => {

				const mgeArea = document.querySelector('#mgeArea');
				PWPreview.item_win = new ItemTooltip({ parent_el: document.body, edit: false });
				PWPreview.recipe_win = new RecipeTooltip({ parent_el: document.body, edit: false });

				if (typeof(MG_IS_EDITOR) === 'undefined') {
					const resp = await get(ROOT_URL + 'latest_db/static', { is_json: 1 });
					if (!resp.ok) {
						resolve(false);
						return;
					}

					for (const t in resp.data) {
						g_latest_db[t] = init_id_array(resp.data[t]);
					}
				}


				for (const parent of [PWPreview.item_win, PWPreview.recipe_win]) {
					const s = newStyle(ROOT_URL + 'css/preview.css');
					await new Promise((resolve) => { s.onload = resolve; });
					parent.shadow.prepend(s);
				}

				let prev_el = null;
				document.addEventListener('mousemove', (e) => {
					const path = e.composedPath();
					const el = path?.find(el => el?.classList?.contains('item') || el?.classList?.contains('recipe'));

					if (el === prev_el) {
						return;
					}
					prev_el = el;

					const item = el?.classList.contains('item') ? el : null;
					const recipe = el?.classList.contains('recipe') ? el : null;

					HTMLSugar.show_item_tooltip(PWPreview.item_win, item, { db });
					HTMLSugar.show_recipe_tooltip(PWPreview.recipe_win, recipe, { db });
				}, { passive: true });

				document.addEventListener('mousedown', (e) => {
					if (!PWPreview.recipe_win.hover_el || PWPreview.recipe_win.hover_el.tabIndex != -1) {
						return true;
					}

					e.stopPropagation();
					PWPreview.recipe_win.toggle_pin(e);
					return false;
				}, { passive: true });

				resolve(true);
			});
		}
		return g_latest_db_promise;
	}

	static get_state_before_gen(obj, generation) {
		const state = DB.clone_obj(obj._db.changesets[0]);
		for (const c of obj._db.changesets) {
			if (c._db.generation == 0) {
				/* initial object state */
				continue;
			}

			if (c._db.generation >= generation) {
				break;
			}

			DB.apply_diff(state, c);
		}

		return state;
	}

	static render_diff_entry(entry, data, prev) {
		const entry_tpl = PWPreview.diff_entry_tpl;
		if (!entry_tpl.func || Template.tpl_generation['diff-entry-tpl'] != entry_tpl.generation) {
			entry_tpl.compile();
		}

		return entry_tpl.func(entry_tpl, { f: entry, val: data, prev });
	}

	static is_recipe_modified(obj, initial_state) {
		if (!obj) {
			return false;
		}

		if (initial_state === undefined) {
			initial_state = obj._db.project_initial_state;
		}

		if (!initial_state) {
			return false;
		}

		const diff = DB.get_obj_diff(obj, initial_state);

		for (const field in diff) {
			/* don't count 'crafts' as change */
			if (field != 'crafts' &&
					field != 'id' &&
					field != '_allocated') {
				return true;
			}
		}

		return false;
	}

	static load_promise;
}

class MiragePreviewElement extends HTMLElement {
	static tpls = {};
	constructor() {
		super();

		this.dom = this;
		this.shadow = this.dom.attachShadow({mode: 'open'});
		this.dom.style.display = 'inline-block';

		this.project_id = this.getAttribute('data-pid');
		this.type = this.getAttribute('data-type').replaceAll('-', '_');
		this.id_str = this.getAttribute('data-id');
		this.id = DB.parse_id(this.id_str);

		if (this.project_id && this.type && this.id_str) {
			this.init();
		}
	}

	async init(args = {}) {
		if (!MiragePreviewElement.tpls[this.type]) {
			const tpl_els = await load_tpl(ROOT_URL + 'tpl/preview/' + this.type + '.tpl');
			MiragePreviewElement.tpls[this.type] = tpl_els[0];
		}
		const tplname = MiragePreviewElement.tpls[this.type].id;
		this.tpl = new Template(tplname);
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		let resp;

		if (!(/[a-zA-Z0-9_]+$/.test(this.type))) {
			return;
		}

		if (!this.share) {
			this.share = { opts: {}, obj: {}, aux: [] };
			resp = await get(ROOT_URL + 'latest_db/get/' + this.type + '/' + this.id, { is_json: 1 });
			this.share.obj = resp.data;
		}

		this.db = {};
		for (const o of this.share.aux) {
			const type = o._db.type;
			if (!db[type]) {
				db[type] = init_id_array([]);
			}

			db[type][o.id] = o;
		}

		this.selected_tab = 0;
		const data = await this.tpl.run({ page: this, obj: this.share.obj, db: this.db, loading: true });

		const s = newStyle(ROOT_URL + 'css/window.css');
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.shadow.append(s);

		await s_p;

		this.shadow.append(data);

		return this.dom;
	}

	select_tab(idx) {
		if (idx == this.selected_tab) {
			return;
		}

		this.selected_tab = idx;
		this.tpl.reload('.content');
	}
}

PWPreview.load_promise = PWPreview.load();
