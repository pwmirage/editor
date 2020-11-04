/*
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_item_tpl = load_tpl(ROOT_URL + 'tpl/window/item.tpl');
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

		await g_item_tpl;
		this.item_win = await ItemTooltipWindow.open({ item: db.items.entries().next().value[1], edit: false });
		this.shadow.querySelector('#item_info').replaceWith(this.item_win.dom);
		this.item_win.dom.style.display = 'none';
		this.item_win.dom.style.position = 'fixed';
		this.item_win.dom.style.color = '#fff';
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
		const info = this.item_win?.dom;
		if (!info) {
			/* still loading */
			return;
		}

		if (!el) {
			info.style.display = 'none';
			return;
		}

		const idx = parseInt(el.dataset.type);
		const item = this.items[this.pager_offset + idx];

		this.item_win.tpl.reload('#item_info', { item });
		info.style.display = 'block';

		const item_el = this.shadow.querySelector('#items').children[idx].getBoundingClientRect();
		info.style.left = item_el.right + 3 + 'px';
		info.style.top = item_el.top + 'px';
	}

	_filter(f) {
		this.items = db.items.filter(f).sort((a, b) => {
			if (!a.name) {
				return 1;
			} else if (!b.name) {
				return -1;
			} else {
				return a.name.localeCompare(b.name);
			}
		});
		this.pager_offset = 0;
		this.move_pager(0);
	}

	filter(str) {
		const lstr = str?.toLowerCase() || '';
		return this._filter((i) => i && i.name.toLowerCase().includes(lstr));
	}

	select_tab(idx) {
		const tab = this.tabs[idx];
		this.selected_tab = idx;
		this.tpl.reload('#search');
		return this._filter(tab.filter);
	}
}

class ItemTooltipWindow extends Window {
	async init() {
		this.item = this.args.item;
		this.edit = this.args.edit || false;
		
		await g_item_tpl;
		this.tpl = new Template('tpl-item-info');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);
		const data = await this.tpl.run({ win: this, item: this.item, edit: this.edit });

		this.shadow.append(data);
		await super.init();

		align_dom(this.shadow.querySelectorAll('.input'), 25);
		const info = this.shadow.querySelector('#item_info');
		const last_c = info.lastElementChild;
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
