/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

let g_open_recipes = new Set();
let g_recipe_tpl = load_tpl(ROOT_URL + 'tpl/window/recipe.tpl')

class RecipeWindow extends Window {
	async init() {
		await g_recipe_tpl;
		this.recipe = this.args.recipe;
		this.embedded = this.args.embedded;
		//if (!this.args.debug && g_open_recipes.has(this.recipe)) return false;
		g_open_recipes.add(this.recipe);

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-recipe');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		this.tpl_data = await this.tpl.run({ win: this, recipe: this.recipe, embedded: this.embedded });
		shadow.append(this.tpl_data);

		await super.init();

		if (this.embedded) {
			this.dom_content.remove();
			this.tpl_data.append(this.dom_content);
			this.dom_win.remove();
			this.dom.remove();
			this.dom.className = '';
			this.dom.onmousedown = null;
		}
	}

	reembed(parent_el, recipe) {
		g_open_recipes.delete(this.recipe);
		this.recipe = recipe;
		g_open_recipes.add(this.recipe);
		const container = newElement('<div><div></div></div>');
		this.tpl.reload('.content', { recipe }, { el: container.firstChild });

		return new Promise((resolve) => setTimeout(() => {
			this.shadow.querySelector('.content').replaceWith(container.firstChild);
			this.dom.remove();
			parent_el.append(this.dom);
			resolve();
		}, 1));
	}

	item_onclick(e, el, type, idx) {
		if (e.which == 3) {
			e.preventDefault();
		}

		if (e.which == 1) {
			const recipe = this.recipe;
			const itemid = recipe[type][idx]?.id || 0;
			const obj = db.items[itemid];

			sleep(150).then(() => {
				HTMLSugar.open_edit_rmenu(el,
					obj, 'items', {
					pick_win_title: 'Pick new item for ' + (recipe.name || 'Recipe') + ' ' + serialize_db_id(recipe.id),
					update_obj_fn: (new_obj) => {
						db.open(recipe);

						if (!recipe[type]) {
							recipe[type] = [];
						}

						if (!recipe[type][idx]) {
							recipe[type][idx] = {};
						}

						recipe[type][idx].id = new_obj?.id;

						db.commit(recipe);
						this.tpl.reload('#' + type);

					},
					edit_obj_fn: (new_obj) => {
						ItemTooltipWindow.open({ item: new_obj, edit: true, db });
					},
					usage_name_fn: (item) => {
						return item.name + ': ' + (item.name || '') + ' ' + serialize_db_id(item.id);
					}
				});
			});
		} else if (e.which == 3) {
			HTMLSugar.open_undo_rmenu(el, this.recipe, {
				undo_path: [ type, idx, 'id' ],
				undo_fn: () => this.tpl.reload('#' + type)
			});
		}
	}

	async item_ondblclick(e, el, type, idx) {
		Item.hide_tooltips();
		RMenuWindow.enable_all(false);
		/* delay to not let the rmenu steal the focus - for some reason we can't get it back programatically */
		await sleep(100);
		const sel_id = await HTMLSugar.show_select({ win: this.parent_win || this, around_el: el, around_margin: 5, container: db.items });
		RMenuWindow.enable_all(true);
		if (!sel_id) {
			return;
		}

		const recipe = this.recipe;
		db.open(recipe);
		if (!recipe[type]) {
			recipe[type] = [];
		}

		if (!recipe[type][idx]) {
			recipe[type][idx] = {};
		}

		recipe[type][idx].id = sel_id;

		db.commit(recipe);
		this.tpl.reload('#' + type);
	}

	close() {
		g_open_recipes.delete(this.recipe);
		super.close();
	}

}
