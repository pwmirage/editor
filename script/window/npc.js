/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

let g_open_npc_crafts = new Set();
let g_npc_tpl = load_tpl(ROOT_URL + 'tpl/window/npc.tpl')

class NPCCraftsWindow extends Window {
	async init() {
		await g_npc_tpl;
		this.crafts = this.args.crafts;
		if (!this.args.debug && g_open_npc_crafts.has(this.crafts)) return false;
		g_open_npc_crafts.add(this.crafts);

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-npc-crafts');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, crafts: this.crafts });
		shadow.append(data);

		await super.init();

		this.item_win = new ItemTooltip({ parent_el: this.shadow, db, edit: false });
		const recipe_edit_el = this.shadow.querySelector('#recipe');
		this.recipe_win = await RecipeWindow.open({ recipe: db.recipes.values().next().value, embedded: recipe_edit_el, debug: this.args.debug });

		this.select_tab(0);
		this.shadow.querySelector('#items .recipe').click();

	}

	static get_recipe_icon(recipe_id) {
		if (!recipe_id) {
			return (ROOT_URL + 'img/itemslot.png');
		}

		const recipe = db.recipes[recipe_id];
		const tgt_id = recipe?.targets?.[0]?.id || 0;

		if (!tgt_id) {
			return (ROOT_URL + 'img/itemslot.png');
		}

		return Item.get_icon(db.items[tgt_id]?.icon || 0);
	}

	onmousemove(e) {
		const item = e.path?.find(el => el?.classList?.contains('item'));

		HTMLSugar.show_item_tooltip(this.item_win, item, { db });
	}

	onclick(e) {
		e.preventDefault();
		if (this.selected_tab == undefined) {
			return;
		}

		const recipe_el = e.path?.find(el => el?.classList?.contains('recipe'));
		if (!recipe_el) {
			return;
		}

		const recipe_idx = parseInt(recipe_el.dataset.idx);
		const recipe_id = parseInt(recipe_el.dataset.id);
		if (isNaN(recipe_idx)) {
			return;
		}

		if (e.which == 1) {
			this.select_recipe(recipe_el);
		}

		const obj = db.recipes[recipe_id];
		let page = this.crafts.pages[this.selected_tab];

		(async () => {
			if (e.which == 3) {
				const coords = Window.get_el_coords(recipe_el);
				const x = coords.left;
				const y = coords.bottom;

				HTMLSugar.open_edit_rmenu(x, y, 
					obj, 'recipes', {
					pick_win_title: 'Pick new recipe for ' + (this.crafts.name || 'Crafts') + ' ' + serialize_db_id(this.crafts.id),
					update_obj_fn: (new_obj) => {
						const s = this.crafts;
						db.open(s);

						let page = this.crafts.pages[this.selected_tab];
						if (!page) {
							page = this.crafts.pages[this.selected_tab] = {};
						}

						if (!page.recipe_id) {
							page.recipe_id = [];
						}

						page.recipe_id[recipe_idx] = new_obj?.id || 0;

						db.commit(s);
						this.tpl.reload('#items');

					},
					edit_obj_fn: (new_obj) => {
						RecipeWindow.open({ recipe: new_obj, debug: this.args.debug });
					},
					usage_name_fn: (recipe) => {
						return recipe.name + ': ' + (recipe.name || '') + ' ' + serialize_db_id(recipe.id);
					},
					undo_obj: this.crafts,
					undo_path: [ 'pages', this.selected_tab, 'recipe_id', recipe_idx ],
					undo_fn: () => this.tpl.reload('#items'),
				});
				

			}
		})();

		return false;
	}

	recipe_details_onclick(el, e) {
		const page = this.crafts.pages[this.selected_tab];
		const recipe_id = page.recipe_id[this.selected_recipe];
		const recipe = db.recipes[recipe_id];

		const coords = Window.get_el_coords(el);
		const x = coords.left;
		const y = coords.bottom;

		HTMLSugar.open_details_rmenu(x, y, 
			recipe, 'recipes', {
			update_obj_fn: (new_obj) => {
				const s = this.crafts;
				db.open(s);

				let page = this.crafts.pages[this.selected_tab];
				if (!page) {
					page = this.crafts.pages[this.selected_tab] = {};
				}

				if (!page.recipe_id) {
					page.recipe_id = [];
				}

				page.recipe_id[this.selected_recipe] = new_obj?.id || 0;

				db.commit(s);
				this.tpl.reload('#items');

			},
			edit_obj_fn: (new_obj) => {
				RecipeWindow.open({ recipe: new_obj });
			},
			usage_name_fn: (recipe) => {
				return recipe.name + ': ' + (recipe.name || '') + ' ' + serialize_db_id(recipe.id);
			},
			undo_path: [ 'pages', this.selected_tab, 'recipe_id', this.selected_recipe ],
		});
	}

	close() {
		g_open_npc_crafts.delete(this.crafts);
		super.close();
	}

	select_tab(idx) {
		this.selected_tab = idx;
		for (const tname of this.shadow.querySelectorAll('.tabname')) {
			tname.classList.remove('selected');
		}

		this.shadow.querySelectorAll('.tabname')[idx].classList.add('selected');
		this.tpl.reload('#items');
		this.select_recipe(this.shadow.querySelector('#items .recipe'));
	}

	select_recipe(recipe_el) {
		if (recipe_el.dataset.idx == this.selected_recipe &&
				this.selected_recipe_tab == this.selected_tab) {
			return;
		}

		this.selected_recipe = recipe_el.dataset.idx;
		this.selected_recipe_tab = this.selected_tab;
		const page = this.crafts.pages[this.selected_tab];
		const recipe_id = page?.recipe_id?.[this.selected_recipe];
		const recipe = db.recipes[recipe_id || -1];

		const prev_focused = this.shadow.querySelector('.recipe.focus');
		if (prev_focused) prev_focused.classList.remove('focus');
		recipe_el.classList.add('focus');

		const prev_recipe_el = this.shadow.querySelector('#recipe');
		const container = newElement('<div><div></div></div>');
		this.tpl.reload('#recipe', {}, { el: container.firstChild });
		if (recipe) {
			this.recipe_win.reembed(container.firstChild, recipe).then(() => {
				prev_recipe_el.replaceWith(container.firstChild);
			});
		} else {
			prev_recipe_el.replaceWith(container.firstChild);
		}
	}
}

let g_open_npc_goods = new Set();
class NPCGoodsWindow extends Window {
	async init() {
		await g_npc_tpl;
		this.goods = this.args.goods;
		if (!this.args.debug && g_open_npc_goods.has(this.goods)) return false;
		g_open_npc_goods.add(this.goods);

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-npc-goods');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, goods: this.goods });
		shadow.append(data);

		await super.init();
		this.select(0);

		this.item_win = new ItemTooltip({ parent_el: this.shadow, db, edit: false });
	}

	onmousemove(e) {
		const item = e.path?.find(el => el?.classList?.contains('item'));

		this.hover_el = item;
		HTMLSugar.show_item_tooltip(this.item_win, item, { db });
	}

	onclick(e) {
		if (this.hover_el == undefined || this.selected_tab == undefined) {
			return;
		}

		let page = this.goods.pages[this.selected_tab];
		const item_idx = parseInt(this.hover_el.dataset.idx);

		(async () => {
			if (e.which == 1) {
				const itemid = page?.item_id ? page.item_id[item_idx] : 0;
				const obj = db.items[itemid];
				const coords = Window.get_el_coords(this.hover_el);
				const x = coords.left;
				const y = coords.bottom;

				HTMLSugar.open_edit_rmenu(x, y, 
					obj, 'items', {
					pick_win_title: 'Pick new item for ' + (this.goods.name || 'Goods') + ' ' + serialize_db_id(this.goods.id),
					update_obj_fn: (new_obj) => {
						const s = this.goods;
						db.open(s);

						let page = this.goods.pages[this.selected_tab];
						if (!page) {
							page = this.goods.pages[this.selected_tab] = {};
						}

						if (!page.item_id) {
							page.item_id = [];
						}

						page.item_id[item_idx] = new_obj?.id || 0;

						db.commit(s);
						this.tpl.reload('#items');

					},
					edit_obj_fn: (new_obj) => {
						ItemTooltipWindow.open({ item: new_obj, edit: true, db });
					},
					usage_name_fn: (item) => {
						return item.name + ': ' + (item.name || '') + ' ' + serialize_db_id(item.id);
					}
				});
				

			}
		})();
		e.preventDefault();
		return false;
	}

	close() {
		g_open_npc_goods.delete(this.goods);
		super.close();
	}

	select(idx) {
		this.selected_tab = idx;
		for (const tname of this.shadow.querySelectorAll('.tabname')) {
			tname.classList.remove('selected');
		}

		this.shadow.querySelectorAll('.tabname')[idx].classList.add('selected');
		this.tpl.reload('#items');
	}
}

const g_open_npcs = new Set();
class NPCWindow extends Window {
	static types = init_id_array([
		{ id: 3214, name: 'NPC' },
		{ id: 3216, name: 'Guard' },
	]);

	static models = null;

	async init() {
		this.npc = this.args.npc;
		if (!this.args.debug && g_open_npcs.has(this.npc)) return false;
		g_open_npcs.add(this.npc);

		if (!NPCWindow.models) {
			NPCWindow.models = init_id_array([]);

			const file_set = new Set();
			for (const o of g_db.npcs) {
				if (!o || !o.file_model) {
					continue;
				}

				if (!file_set.has(o.file_model)) {
					file_set.add(o.file_model);
					NPCWindow.models[o.id] = {
						id: o.id,
						name: o.name + ' ' + serialize_db_id(o.id),
						file: o.file_model,
					};
				}
			}
		}

		if (!this.npc.id_type) {
			/* fix to default (just like the game does) */
			const npc = db.npcs[this.npc._db.base] || this.npc;
			db.open(npc);
			npc.id_type = NPCWindow.types.values().next().value.id;
			db.commit(npc);
		}

		await g_npc_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-npc');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, npc: this.npc });
		shadow.append(data);

		this.npc_initialized = true;
		super.init();
	}

	close() {
		g_open_npcs.delete(this.npc);
		super.close();
	}

	async edit(el, what) {
		const coords = Window.get_el_coords(el);
		const x = coords.left;
		const y = coords.bottom;
		let obj;
		const is_craft = what == 'crafts';
		if (!is_craft) {
			obj = db.npc_sells[this.npc.id_sell_service || 0];
		} else {
			obj = db.npc_crafts[this.npc.id_make_service || 0];
		}

		HTMLSugar.open_edit_rmenu(x, y, 
			obj, 'npc_' + what, {
				pick_win_title: 'Pick new ' + (is_craft ? 'Crafts' : 'Goods') + ' for ' + (this.npc.name || 'NPC') + ' ' + serialize_db_id(this.npc.id),
			update_obj_fn: (new_obj) => {
				const n = this.npc;
				db.open(n);
				if (is_craft) {
					n.id_make_service = new_obj?.id || 0;
				} else {
					n.id_sell_service = new_obj?.id || 0;
				}
				db.commit(n);
				this.tpl.reload('#goods');

			},
			edit_obj_fn: (new_obj) => {
				if (is_craft) {
					NPCCraftsWindow.open({ crafts: new_obj });
				} else {
					NPCGoodsWindow.open({ goods: new_obj });
				}
			},
		});


	}
}
