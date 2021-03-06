/*
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_item_tpl = load_tpl(ROOT_URL + 'tpl/item_tooltip.tpl');
class ItemChooserWindow extends ChooserWindow {
	async init() {
		this.args.tpl = 'tpl-item-chooser';
		this.args.width = 36;
		this.args.height = 36;
		this.pager_offset = 0;
		this.items_gen = 0;
		this.items = [];
		this.tabs = [];

		const add_type_tab = (name, type) => {
			this.tabs.push({ name: name, filter: (i) => i && i.type == type })
		};

		this.tabs.push({ name: 'All', filter: (i) => i });
		add_type_tab('Weapons', Item.typeid('Weapon'));
		add_type_tab('Armors', Item.typeid('Armor'));

		await super.init();
		this.select_tab(0);
		if (this.args.itemname) {
			this.shadow.querySelector('#search > input').value = this.args.itemname;
			this.filter(this.args.itemname);
		}

		this.item_win = new ItemTooltip({ parent_el: this.shadow, db, edit: false });
	}

	reload_items() {
		const gen = ++this.items_gen;
		const els = this.shadow.querySelector('#items').children;
		let count = 0;
		let el_idx = 0;

		(async () => {
			let i = 0;
			for (const el of els) {
				const item = this.items[this.pager_offset + i++];

				if (item) {
					el.firstElementChild.src = Item.get_icon(item.icon || 0);
					el.dataset.id = item.id;
					el.style.display = '';
				} else {
					el.style.display = 'none';
				}

				if (i % 64 == 0) {
					await new Promise((resolve) => setTimeout(resolve, 1));
				}

				if (gen != this.items_gen) {
					return;
				}
			}
		})();

		super.reload_items();
	}

	hover_item(el) {
		HTMLSugar.show_item_tooltip(this.item_win, el, { db });
	}

	filter(str) {
		let items;

		if (!str) {
			const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
			this.items = this.all_items.sort((a, b) => collator.compare(a.name, b.name));
		} else {
			items = fuzzysort.go(str, this.all_items, { key: 'name', allowTypo: true });
			this.items = items.map(i => i.obj);
		}
		this.pager_offset = 0;
		this.move_pager(0);
	}

	select_tab(idx) {
		const tab = this.tabs[idx];
		this.selected_tab = idx;
		this.tpl.reload('#search');
		this.all_items = db.items.filter(tab.filter);
		this.filter(this.filter_str || '');
	}
}

class ItemTooltipWindow extends Window {
	async init() {
		this.item = this.args.item || db.items.entries().next().value[1];
		this.edit = this.args.edit || false;
		this.db = this.args.db;

		await g_item_tpl;
		this.tpl = new Template('tpl-item-info');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);
		const data = this.tpl.run({ win: this, item: this.item, edit: this.edit, db: this.db });

		this.shadow.append(data);
		await super.init();

		align_dom(this.shadow.querySelectorAll('.input'), 25);

		if (!this.edit) {
			this.dom.style.border = 'none';
			this.dom.style.display = 'none';
			this.dom.style.position = 'fixed';
			this.dom.style.color = '#fff';
			const tooltip = this.shadow.querySelector('#item_info');
			tooltip.remove();
			this.shadow.append(tooltip);
			this.args.parent_el.append(this.dom);
		}
	}

	tooltip_over(item, bounds) {
		this.focus();
		this.item = item;
		const old_tooltip = this.shadow.querySelector('#item_info');
		const newdata = this.tpl.run({ win: this, item: this.item, edit: this.edit });
		old_tooltip.replaceWith(newdata.querySelector('#item_info'));
		this.dom.style.display = 'block';
		this.dom.style.left = bounds.right + 3 + 'px';
		this.dom.style.top = bounds.top + 'px';
	}

	add_addon(type) {
		if (type == 'drop') {
			type = 'addons';
		} else if (type == 'uniques') {
			type = 'uniques';
		} else {
			type = 'rands';
		}
		this.item[type].push({ id: 0, prob: 0});
		this.tpl.reload('#' + type);
	}

	recycle_addons(type) {
		if (type == 'drop') {
			type = 'addons';
		} else if (type == 'uniques') {
			type = 'uniques';
		} else {
			type = 'rands';
		}

		this.item[type] = this.item[type]?.filter(a => a?.prob > 0 || a?.id > 0);
		this.tpl.reload('#' + type);
	}

	async select_decomp() {
		const prev_item = db.items[this.item.element_id || 0];
		const win = await ItemChooserWindow.open({ itemname: prev_item?.name });
		win.onchoose = (new_item) => {
			if (!new_item) {
				return;
			}

			db.open(this.item);
			this.item.element_id = new_item.id;
			db.commit(this.item);
			this.tpl.reload('#decompose');
		}
	}

}
