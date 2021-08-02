/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

let g_npc_tpl = load_tpl(ROOT_URL + 'tpl/window/npc.tpl')

class NPCCraftsWindow extends SingleInstanceWindow {
	static saved_empty_recipe;
	static reference_empty_recipe;

	async init() {
		await g_npc_tpl;
		this.crafts = this.obj = this.args.obj;

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-npc-crafts');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, crafts: this.crafts });
		shadow.append(data);

		await super.init();

		const recipe_edit_el = this.shadow.querySelector('#recipe');
		this.recipe_win = await RecipeWindow.open({ parent_win: this, obj: db.recipes.values().next().value, embedded: recipe_edit_el, debug: this.args.debug });

		const prev_compile_cb = this.recipe_win.tpl_compile_cb;
		this.recipe_win.tpl_compile_cb = (dom) => {
			prev_compile_cb.call(this, dom);
			if (dom.id == 'targets') {
				this.tpl.reload('#items');
			}
		}

		this.select_tab(0);
		this.shadow.querySelector('#items .recipe').click();

	}

	static get_recipe_icon(recipe_id) {
		const icon_id = NPCCraftsWindow.get_recipe_icon_id(recipe_id);
		return Item.get_icon(icon_id);
	}

	static get_recipe_icon_id(recipe_id) {
		if (!recipe_id) {
			return -1;
		}

		const recipe = db.recipes[recipe_id];
		const tgt_id = recipe?.targets?.[0]?.id;
		if (tgt_id === 0) {
			return -1;
		}

		return db.items[tgt_id]?.icon || 0;
	}

	onclick(e) {
		e.preventDefault();
		if (this.selected_tab == undefined) {
			return;
		}

		const path = e.composedPath();
		const recipe_el = path.find(el => el?.classList?.contains('recipe'));
		if (!recipe_el) {
			return;
		}

		const recipe_idx = parseInt(recipe_el.dataset.idx);
		const recipe_id = parseInt(recipe_el.dataset.id);
		if (isNaN(recipe_idx)) {
			return;
		}

		let was_selected = (recipe_el.dataset.idx == this.selected_recipe &&
		 		this.selected_recipe_tab == this.selected_tab);
		if (e.which == 1) {
			was_selected = !this.select_recipe(recipe_el);
		}

		return false;
	}

	recipe_details_onclick(el, e) {
		const page = this.crafts.pages[this.selected_tab];
		const recipe_id = page.recipe_id[this.selected_recipe];
		const recipe = db.recipes[recipe_id];

		HTMLSugar.open_edit_rmenu(el,
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
				RecipeWindow.open({ obj: new_obj });
			},
			usage_name_fn: (recipe) => {
				return recipe.name + ': ' + (recipe.name || '') + ' ' + DB.serialize_id(recipe.id);
			},
		});
	}

	focus() {
		super.focus();
		if (this.selected_recipe !== undefined) {
			/* force select it again to create another empty recipe if needed */
			/* FIXME this makes the window flash on rmenu showup */
			//const sel = this.selected_recipe;
			//this.selected_recipe = -1;
			//this.select_recipe(this.shadow.querySelectorAll('#items .recipe')[sel]);
		}
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
			return false;
		}

		this.selected_recipe = recipe_el.dataset.idx;
		this.selected_recipe_tab = this.selected_tab;
		const page = this.crafts.pages[this.selected_tab];
		const recipe_id = page?.recipe_id?.[this.selected_recipe];
		let recipe = db.recipes[recipe_id || -1];

		if (!recipe) {
			const new_empty = () => {
				const empty = NPCCraftsWindow.empty_recipe = db.new('recipes');
				empty._db.commit_cb = (obj) => {
					obj._db.commit_cb = null;

					db.open(this.crafts);
					const recipe_arr = set_obj_field(this.crafts, [ 'pages', this.selected_tab, 'recipe_id'], []);
					recipe_arr[this.selected_recipe] = obj.id;
					db.commit(this.crafts);

					db.open(obj);
					obj.crafts = this.crafts.id;
					db.commit(obj);
				};
			};

			if (!NPCCraftsWindow.reference_empty_recipe) {
				new_empty();
				recipe = NPCCraftsWindow.empty_recipe;
				const ref = NPCCraftsWindow.reference_empty_recipe = {};
				DB.copy_obj_data(ref, recipe);
			} else {
				NPCCraftsWindow.reference_empty_recipe.id = NPCCraftsWindow.empty_recipe.id;
				NPCCraftsWindow.reference_empty_recipe.crafts = NPCCraftsWindow.empty_recipe.crafts;
				if (DB.is_obj_diff(NPCCraftsWindow.empty_recipe,
						NPCCraftsWindow.reference_empty_recipe)) {
					/* empty_recipe could have been modified, in which case we need a new one */
					new_empty();
				}
				recipe = NPCCraftsWindow.empty_recipe;
			}
		} else if (!recipe.crafts) {
			const crafts_arr = PWDB.find_usages(db, recipe);

			db.open(recipe);
			recipe.crafts = this.crafts.id;
			db.commit(recipe);

			if (crafts_arr.length > 1) {
				/* make sure we don't edit any other recipe, but this one
				 * right here only */
				const new_recipe = db.clone(recipe);
				db.open(this.crafts);
				this.crafts.pages[this.selected_tab].recipe_id[this.selected_recipe] = new_recipe.id;
				db.commit(this.crafts);

				recipe = new_recipe;
			}
		}

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
		return true;
	}
}

class NPCGoodsWindow extends SingleInstanceWindow {
	async init() {
		await g_npc_tpl;
		this.goods = this.obj = this.args.obj;

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-npc-goods');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, goods: this.goods });
		shadow.append(data);

		await super.init();
		this.select(0);
	}

	onclick(e) {
		const path = e.composedPath();
		const hover_el = path?.find(el => el?.classList?.contains('item'));
		if (hover_el == undefined || this.selected_tab == undefined) {
			return;
		}

		let page = this.goods.pages[this.selected_tab];
		const item_idx = parseInt(hover_el.dataset.idx);

		(async () => {
			if (e.which == 1) {
				const itemid = page?.item_id ? page.item_id[item_idx] : 0;
				const obj = db.items[itemid];

				HTMLSugar.open_edit_rmenu(hover_el,
					obj, 'items', {
					pick_win_title: 'Pick new item for ' + (this.goods.name || 'Goods') + ' ' + DB.serialize_id(this.goods.id),
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
						ItemTooltipWindow.open({ obj: new_obj, edit: true, db });
					},
					usage_name_fn: (item) => {
						return item.name + ': ' + (item.name || '') + ' ' + DB.serialize_id(item.id);
					},
				});
			} else if (e.which == 3) {
				HTMLSugar.open_undo_rmenu(hover_el, this.goods, {
					undo_path: [ 'pages', this.selected_tab, 'item_id', item_idx ],
					undo_fn: () => this.tpl.reload('#items')
				});
			}
		})();
		e.preventDefault();
		return false;
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

class NPCWindow extends SingleInstanceWindow {
	static types = init_id_array([
		{ id: 3214, name: 'NPC' },
		{ id: 3216, name: 'Guard' },
	]);

	async init() {
		this.npc = this.obj = this.args.obj;

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

	async edit(el, what, e) {
		let obj;
		const is_craft = what == 'crafts';
		if (!is_craft) {
			obj = db.npc_sells[this.npc.id_sell_service || 0];
		} else {
			obj = db.npc_crafts[this.npc.id_make_service || 0];
		}

		if (e.which == 1) {
			HTMLSugar.open_edit_rmenu(el,
				obj, 'npc_' + what, {
					pick_win_title: 'Pick new ' + (is_craft ? 'Crafts' : 'Goods') + ' for ' + (this.npc.name || 'NPC') + ' ' + DB.serialize_id(this.npc.id),
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
						NPCCraftsWindow.open({ obj: new_obj });
					} else {
						NPCGoodsWindow.open({ obj: new_obj });
					}
				},
			});
		} else if (e.which == 3) {
			HTMLSugar.open_undo_rmenu(el, this.npc, {
				undo_path: [ is_craft ? 'id_make_service' : 'id_sell_service' ],
				undo_fn: () => this.tpl.reload('#goods'),
			});
		}


	}

	find_related_quests() {
		TasksByNPCWindow.open({ obj: this.npc });
	}
}
