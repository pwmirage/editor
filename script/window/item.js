/*
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

class ItemChooserWindow extends ChooserWindow {
	async init() {
		this.args.tpl = 'tpl-item-chooser';
		this.pager_offset = 0;
		this.items = db.items.filter((i) => i);
		this.items_gen = 0;
		await super.init();
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

				el.src = item ? Item.get_icon(item.icon || 0) : 'data:,';
				if (i % 64 == 0) {
					await new Promise((resolve) => setTimeout(resolve, 1));
				}

				if (gen != this.items_gen) {
					return;
				}
			}
		})();
	}
}
