/* SPDX-License-Identifier: MIT
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
		this.filter_gen = 0;
		this.all_items = this.args.items || db.items;
		this.items = [];
		this.tabs = [];

		const add_type_tab = (name, type) => {
			this.tabs.push({ name: name, filter: (i) => i && !i._removed && i.type == type })
		};

		this.tabs.push({ name: 'Icons + Items', filter: (i) => i && !i._removed });
		this.tabs.push({ name: 'Items', filter: (i) => i && !i._removed && !i.is_icon });
		this.tabs.push({ name: 'Icons', filter: (i) => i && !i._removed && i.is_icon });
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
	}

	reload_items() {
		const gen = ++this.items_gen;
		const els_container = this.shadow.querySelector('#items');
		let count = 0;
		let el_idx = 0;

		this.items_per_page = this.max_items_per_page;

		(async () => {
			let i = 0;
			let el = els_container.firstChild;
			while (el) {
				const item = this.items[this.pager_offset + i++];

				if (!el.firstElementChild) {
					el.remove();
					el = el.nextSibling;
					continue;
				}

				if (item) {
					el.firstElementChild.src = Item.get_icon(item.icon || 0);
					el.dataset.id = item.is_icon ? 0 : item.id;
				} else {
					els_container.insertBefore(newElement('<div style="width: 100%; height: 9999px;">&nbsp;</div>'), el.nextSibling);
					return;
				}

				if (i % 64 == 0) {
					await new Promise((resolve) => setTimeout(resolve, 1));
				}

				if (gen != this.items_gen) {
					return;
				}

				el = el.nextSibling;
			}
		})();
	}

	filter(str) {
		this.filter_gen++;
		this.filter_str = str;
		const gen = this.filter_gen;
		setTimeout(() => {
			if (gen !== this.filter_gen) {
				return;
			}

			const items = fuzzysort.go(this.filter_str, this.items_index);
			this.items = items.map(i => i.obj);
			this.pager_offset = 0;
			this.move_pager(0);
		}, 100);
	}

	select_tab(idx) {
		const tab = this.tabs[idx];
		this.selected_tab = idx;
		this.tpl.reload('#search');
		this.items_index = fuzzysort.index(this.all_items.filter(tab.filter), { key: 'name' });
		this.filter(this.filter_str || '');
	}
}

class ItemTooltipWindow extends SingleInstanceWindow {
	async init() {
		this.item = this.obj = this.args.obj || db.items.entries().next().value[1];
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

	static icons_db;
	async select_icon() {
		if (!ItemTooltipWindow.icons_db) {
			const icons_db = ItemTooltipWindow.icons_db = [];
			const start_len = icons_db.length;
			icons_db.length += Item.icon_cache.length;
			for (let i = 0; i < Item.icon_cache.length; i++) {
				icons_db[start_len + i] = { id: i, name: ' ', icon: i, is_icon: 1, _db: {} };
			}
		}

		const win = await ItemChooserWindow.open({ items: [...db.items, ...ItemTooltipWindow.icons_db ] });
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
