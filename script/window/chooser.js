/*
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

class ChooserWindow extends Window {
	async init() {
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/chooser.tpl', this.args.tpl);
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const args = Object.assign({ this: this, win: this, npc: this.npc }, this.args);
		const data = await this.tpl.compile(args);

		shadow.append(...data);
		await super.init();
		this.maximize();
		this.recalculate_pager();
		this.tpl.reload('#items');
		this.reload_items();
	}

	recalculate_pager() {
		const container = this.shadow.querySelector('#items').getBoundingClientRect();
		const pager = this.shadow.querySelector('#pager').getBoundingClientRect();
		const bounds = { width: container.width, height: pager.top - container.top - 16 };

		this.items_per_page = Math.floor(bounds.width /  36) * Math.floor(bounds.height / 36);
		this.tpl.reload('#pager');
	}

	onresize() {
		if (this.resizing) return;
		this.resizing = true;

		setTimeout(() => {
			this.resizing = false;
			move_pager(0);
		}, 500);
	}

	reload_items() {
		/* virtual */
	}

	filter() {
		/* virtual */
	}

	move_pager(diff) {
		if (this.pager_offset + diff < this.items.length) {
			this.pager_offset = Math.max(0, this.pager_offset + diff);
		}
		this.recalculate_pager();
		this.reload_items();
	}

	close() {
		if (this.onchoose) {
			this.onchoose(null);
		}
		g_open_npc_model = null;
		super.close();
	}

	select(type) {
		const prev = this.shadow.querySelector('.selected');
		if (prev) {
			prev.classList.remove('selected');
		}

		const n = this.shadow.querySelector('*[data-type="' + type + '"]');
		n.classList.add('selected');
		this.selected = type;
	}

	choose(type) {
		if (this.onchoose) {
			this.onchoose(type);
			this.onchoose = null;
		}
		this.close();
	}
}
