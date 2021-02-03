/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_history_tpl = load_tpl(ROOT_URL + 'tpl/window/history.tpl');
class HistoryWindow extends Window {
	async init() {
		if (this.args.debug) {
			this.demo();
		}

		await g_history_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-history');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this });
		shadow.append(data);

		await super.init();

		this.item_win = new ItemTooltip({ parent_el: this.shadow, db, edit: false });
		this.recipe_win = new RecipeTooltip({ parent_el: this.shadow, db, edit: false });
		
		const s = newStyle(ROOT_URL + 'css/preview.css');
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.recipe_win.shadow.prepend(s);

		this.select_tab(1);
	}

	tpl_compile_cb(dom) {
		super.tpl_compile_cb(dom);
		for (const c of dom.querySelectorAll('#base:not(.loaded)')) {
			mg_init_page('rebase', { pid: db.metadata[1].pid }).then(
				(content_el) => {
					c.appendChild(content_el);
					c.classList.add('loaded');
				});

		}
	}

	select_tab(idx) {
		for (const c of this.shadow.querySelectorAll('.tabs > .active')) {
			c.classList.remove('active');
		}

		this.shadow.querySelector('.tabs').children[idx].classList.add('active');

		for (const c of this.shadow.querySelectorAll('.tabcontents > .active')) {
			c.classList.remove('active');
		}
		this.shadow.querySelector('.tabcontents').children[idx].classList.add('active');
	}

	onmousemove(e) {
		if (!this.item_win || !this.recipe_win) {
			/* not initialized yet */
			return;
		}

		const el = e.path?.find(el => el?.classList?.contains('item') || el?.classList?.contains('recipe'));
		const item = el?.classList.contains('item') ? el : null;
		const recipe = el?.classList.contains('recipe') ? el : null;

		HTMLSugar.show_item_tooltip(this.item_win, item, { db });
		HTMLSugar.show_recipe_tooltip(this.recipe_win, recipe, { db: db });
	}

	demo() {
		let goods = db.npc_sells[2241];
		if (goods.name == "First gen") {
			return;
		}

		db.open(goods)
		goods.name = "First gen";
		goods.pages[0].title = "B Sword";
		goods.pages[0].item_id[3] = 0;
		goods.pages[0].item_id[6] = 40;
		goods.pages[2].item_id[12] = 177;
		db.commit(goods);

		goods = db.npc_sells[2242];
		db.open(goods)
		goods.name = "Another Goods";
		db.commit(goods);

		db.new_generation();

		goods = db.npc_sells[2672];
		db.open(goods)
		goods.name = "Second gen";
		db.commit(goods);

		let crafts = db.npc_crafts[2902];
		db.open(crafts)
		crafts.name = "Crafts change";
		crafts.pages[0].recipe_id[0] = 0;
		crafts.pages[0].recipe_id[1] = 60;
		db.commit(crafts);

		let diff = JSON.parse('[{ "id": 2147483648, "pos": { "0": 1727.4746105389604, "2": 980.131307875321 }, "groups": { "0": { "type": 11608, "count": 1 } }, "type": "npc", "_db": { "type": "spawners_gs01" } }]');
		db.load(diff);
	}

	used_by(obj) {
		let usages = PWDB.find_usages(db, obj);
		let ret = '';

		if (usages.length > 0) {
			ret += '(used by ' + (usages[0].name || 'NPC') + ' ' + serialize_db_id(usages[0].id);
			if (usages.length > 1) {
				ret += ' and ' + (usages.length - 1) + ' more';
			}
			ret += ')';
		}
		return ret;
	}

	get_project(changeset) {
		for (const c of changeset) {
			if (c.id == 1 && c._db.type == 'metadata') {
				return c;
			}
		}
		return undefined;
	}

	find_previous(diff, fn) {
		const obj = diff._db.obj;
		const changelog = obj._db.changesets;


		for (let i = changelog.length - 1; i > 0; i--) {
			const d = changelog[i];
			if (d._db.generation < diff._db.generation && fn(d)) {
				return d;
			}
		}

		return changelog[0];
	}

	filter_previous(diff, fn) {
		const obj = diff._db.obj;
		const changelog = obj._db.changesets;
		const ret = [];

		for (let i = changelog.length - 1; i > 0; i--) {
			const d = changelog[i];
			if (d._db.generation < diff._db.generation && fn(d)) {
				ret.push(d);
			}
		}

		if (ret.length == 0) {
			ret.push(changelog[0]);
		}
		return ret;
	}


	collapse(el) {
		el.classList.toggle("active");
		const content = el.nextElementSibling;
		if (content.style.maxHeight){
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = content.scrollHeight + "px";
		}
	}

	get_item(itemid) {
		const item = db.items[itemid];
		return item ? Item.get_icon(item.icon || 0) : (ROOT_URL + 'img/itemslot.png');

	}
}
