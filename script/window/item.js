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
		this.all_items = this.args.items || db.items;
		this.items = [];
		this.tabs = [];

		const add_type_tab = (name, type) => {
			this.tabs.push({ name: name, filter: (i) => i && i.type == type })
		};

		this.tabs.push({ name: 'Icons + Items', filter: (i) => i });
		this.tabs.push({ name: 'Items', filter: (i) => !i.is_icon });
		this.tabs.push({ name: 'Icons', filter: (i) => i.is_icon });
		add_type_tab('Weapons', Item.typeid('Weapon'));
		add_type_tab('Armors', Item.typeid('Armor'));
		add_type_tab('Fashion', Item.typeid('Fashion'));
		add_type_tab('Misc', Item.typeid('Misc Item'));
		add_type_tab('Quest Item', Item.typeid('Quest Item'));
		add_type_tab('Consumable', Item.typeid('Consumable Quest Item'));

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
					el.dataset.id = item.is_icon ? 0 : item.id;
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

	filter(str) {
		let items;

		items = fuzzysort.go(str, this.items_index);
		this.items = items.map(i => i.obj);
		this.pager_offset = 0;
		this.move_pager(0);
	}

	select_tab(idx) {
		const tab = this.tabs[idx];
		this.selected_tab = idx;
		this.tpl.reload('#search');
		this.items_index = fuzzysort.index(this.all_items.filter(tab.filter), { key: 'name' });
		this.filter(this.filter_str || '');
	}
}

class ItemTooltipWindow extends Window {
	async init() {
		this.item = this.obj = this.args.item || db.items.entries().next().value[1];
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

	static icons_db;
	async select_icon() {
		if (!ItemTooltipWindow.icons_db) {
			const icons_db = ItemTooltipWindow.icons_db = [...db.items];
			const start_len = icons_db.length;
			icons_db.length += Item.icons.length;
			for (let i = 0; i < Item.icons.length; i++) {
				icons_db[start_len + i] = { id: i, name: ' ', icon: i, is_icon: 1 };
			}
		}

		const win = await ItemChooserWindow.open({ items: ItemTooltipWindow.icons_db });
		win.onchoose = (new_item) => {
			if (!new_item) {
				return;
			}

			db.open(this.item);
			this.item.icon = new_item.icon;
			db.commit(this.item);
			this.tpl.reload('.item.icon');
		}
	}

	icon_onclick(e, el) {
		if (e.which != 3) {
			return;
		}

		return HTMLSugar.open_undo_rmenu(el, this.item, {
			undo_path: 'icon',
			undo_fn: () => {
				this.tpl.reload('.item.icon');
			},
			name_fn: (val) => 'Icon: ' + val
		});
	}

	set_proc(proc_id, el) {
		db.open(this.item);
		if (!this.item.proc_type) {
			this.item.proc_type = 0;
		}

		const proc = Item.proc_types[parseInt(proc_id)];
		this.item.proc_type &= ~proc.mask;

		if (proc.mask & 0xf0000000) {
			const exp = parseInt(el.textContent);
			this.item.proc_type |= ((exp / 300) << 20);
		} else if (el.checked) {
			this.item.proc_type |= proc.mask;
		}

		db.commit(this.item);
	}
}
