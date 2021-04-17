/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_chooser_tpl = load_tpl(ROOT_URL + 'tpl/window/chooser.tpl');
class ChooserWindow extends Window {
	async init() {
		await g_chooser_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(this.args.tpl);
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		this.args.width = this.args.width || 100;
		this.args.height = this.args.height || 34;
		this.args.win = this;
		this.args.npc = this.npc;
		this.args.maximized = this.args.maximized ?? true;
		const data = this.tpl.run(this.args);

		shadow.append(data);
		await super.init();

		if (this.args.maximized) {
			this.maximize();
		}

		this.shadow.querySelector('.content').classList.add('loading');
		setTimeout(() => {
			this.recalculate_pager();
			this.tpl.reload('#items');
			this.reload_items();
			this.tpl.reload('#pager');
			this.shadow.querySelector('.content').classList.remove('loading');
			this.shadow.querySelector('#search input').focus();
		}, 50);

	}

	recalculate_pager() {
		const items_el = this.shadow.querySelector('#items');
		const container = items_el.getBoundingClientRect();
		const pager = this.shadow.querySelector('#pager').getBoundingClientRect();
		const bounds = { width: container.width - 24, height: pager.top - container.top - 16 };
		items_el.style.maxHeight = bounds.height + 'px';
		this.max_height = bounds.height;

		this.max_items_per_page = Math.floor(bounds.width /  this.args.width) * Math.floor(bounds.height / this.args.height);
		/* width is constant, but item height might be bigger than this.args.height,
		 * items_per_page might be adjusted later */
	}

	onresize() {
		if (this.resizing) return;
		this.resizing = true;

		setTimeout(() => {
			this.resizing = false;
			this.tpl.reload('#items');
			this.recalculate_pager();
			this.move_pager(0);
		}, 500);
	}

	reload_items() {
		let overflown_items = 0;
		const items_el = this.shadow.querySelector('#items');
		const items_bounds = items_el.getBoundingClientRect();
		const items = items_el.children;
		for (let i = items.length - 1; i >= 0; i--) {
			const item = items[i];
			if (item.style.display == 'none') {
				/* hidden already, no matching this.items[off + i]. continue
				 * until we reach an element that we can get bounds for */
				overflown_items++;
				continue;
			}

			const b = item.getBoundingClientRect();
			if (b.bottom - items_bounds.top > this.max_height) {
				item.style.display = 'none';
				overflown_items++;
			} else {
				break;
			}
		}

		this.items_per_page = this.max_items_per_page - overflown_items;
	}

	filter() {
		/* virtual */
	}

	move_pager(diff) {
		diff = Math.sign(diff) * (this.items_per_page || 0);
		if (this.pager_offset + diff < this.items.length) {
			this.pager_offset = Math.max(0, this.pager_offset + diff);
		}
		this.reload_items();
		this.tpl.reload('#pager');
	}

	close() {
		if (this.onchoose) {
			this.onchoose(null);
		}
		super.close();
	}

	choose(idx) {
		if (this.onchoose) {
			idx = parseInt(idx) + this.pager_offset;
			this.onchoose(this.items[idx]);
			this.onchoose = null;
		}
		this.close();
	}

	click(idx) {
		if (this.onclick) {
			idx = parseInt(idx) + this.pager_offset;
			this.onclick(this.items[idx]);
		}
	}
}

class SimpleChooserWindow extends ChooserWindow {
	async init() {
		this.pager_offset = 0;
		this.items = this.args.items || [];
		this.title = this.args.title || 'Chooser';
		this.tabs = this.args.tabs || [ { name: 'All', filter: (i) => i } ];
		this.name_fn = this.args.name_fn;
		this.search = this.args.search || '';

		if (this.items.values().next().value && this.items.values().next().value._db?.type == 'items') {
			this.name_fn = (item) => {
				return '<span class="icon-container"><span class="item"><img src="' + Item.get_icon(item.icon || 0) + '"></span>' + item.name + ' ' + DB.serialize_id(item.id) + '</span>';
			};
			this.args.width = 175;
		}

		this.args.tpl = 'tpl-simple-chooser';
		await super.init();
		this.select_tab(0);
	}

	reload_items() {
		const els = this.shadow.querySelector('#items').children;
		let count = 0;
		let el_idx = 0;

		let i = 0;
		for (const el of els) {
			const item = this.items[this.pager_offset + i++];
			if (!item) {
				el.style.display = 'none';
				continue;
			}
			el.innerHTML = this.name_fn ? this.name_fn(item) : (item.name + ' ' + DB.serialize_id(item.id));
			el.style.display = '';
		}

		super.reload_items();
	}

	filter(str) {
		this.filter_str = str;
		const items = fuzzysort.go(str, this.all_items);
		this.items = items.map(i => i.obj);
		this.pager_offset = 0;
		this.move_pager(0);
	}

	select_tab(idx) {
		const tab = this.tabs[idx];
		this.selected_tab = idx;
		this.tpl.reload('#search');
		this.all_items = fuzzysort.index(this.args.items.filter(tab.filter), { key: 'name' });
		this.filter(this.filter_str || '');
	}
}

