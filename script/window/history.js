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

		this.item_win = await ItemTooltipWindow.open({ parent_el: this.shadow, edit: false });
	}

	onmousemove(e) {
		const item = e.path?.find(el => el?.classList?.contains('item'));

		HTMLSugar.show_item_tooltip(this.item_win, item);
	}

	demo() {
		let goods = db.npc_sells[2241];
		if (goods.name == "Better Goods") {
			return;
		}

		db.open(goods)
		goods.name = "Better Goods";
		goods.pages[0].title = "B Sword";
		goods.pages[0].item_id[6] = 40;
		goods.pages[2].item_id[12] = 177;
		db.commit(goods);

		goods = db.npc_sells[2242];
		db.open(goods)
		goods.name = "Another Goods";
		db.commit(goods);

		db.new_generation();
	}

	used_by(obj) {
		let usages = [];
		let ret = '';
		if (obj._db.type == 'npc_sells') {
			usages = PWDB.find_usages(obj);
		}

		if (usages.length > 0) {
			ret += '(used by ' + (usages[0].name || 'NPC') + serialize_db_id(usages[0].id);
			if (usages.length > 1) {
				ret += 'and ' + (usages.length - 1) + ' more';
			}
			ret += ')';
		}
		return ret;
	}

	find_previous(diff, fn) {
		const obj = diff._db.obj;
		const changelog = obj._db.changesets;

		for (let i = changelog.length - 1; i > 0; i--) {
			const d = changelog[i];
			if (d.generation < diff._db.generation && fn(d)) {
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
			if (d.generation < diff._db.generation && fn(d)) {
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
