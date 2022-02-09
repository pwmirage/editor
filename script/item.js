/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Item {
	static types = [
		{ id: 0, name: 'Invalid' },
		{ id: 20, name: 'Normal Item' },
		{ id: 5, name: 'Normal Item (Decomposable)' },
		{ id: 14, name: 'Quest Item' },
		{ id: 19, name: 'Consumable' },
		{ id: 1, name: 'Weapon' },
		{ id: 2, name: 'Armor' },
		{ id: 3, name: 'Jewelery' },
		{ id: 4, name: 'Potion' },
		{ id: 6, name: 'Damage Rune' },
		{ id: 7, name: 'Defense Rune' },
		{ id: 8, name: 'Skillbook' },
		{ id: 9, name: 'Flyer' },
		{ id: 10, name: 'Elf Wings' },
		{ id: 11, name: 'Town Teleport Item' },
		{ id: 12, name: 'Pickaxe / Res. scroll' },
		{ id: 13, name: 'Chi Stone' },
		{ id: 15, name: 'Throwable Dart' },
		{ id: 16, name: 'Projectile' },
		{ id: 17, name: 'Projectile Pack' },
		{ id: 18, name: 'Shard' },
		{ id: 21, name: 'Fashion' },
		{ id: 22, name: 'Makeover Scroll' },
		{ id: 23, name: 'Face Change Pill' },
		{ id: 24, name: 'GM Mob Generator Item' },
		{ id: 25, name: 'Pet Egg' },
		{ id: 26, name: 'Pet Food' },
		{ id: 27, name: 'Pet Face Change Scroll' },
		{ id: 28, name: 'Fireworks' },
		{ id: 29, name: 'Catapult Pulling Item' },
		{ id: 30, name: 'Buff Consumable' },
		{ id: 31, name: 'Refining Item' },
		{ id: 32, name: 'Tome' },
		{ id: 33, name: 'Smiles!' },
		{ id: 34, name: 'HP Charm' },
		{ id: 35, name: 'MP Charm' },
		{ id: 36, name: 'Double XP Scroll' },
		{ id: 37, name: 'Teleport Stone' },
		{ id: 38, name: 'Dye' }
	];

	static types_arr = init_id_array(Item.types);

	static proc_types = [
		{ id: 0, name: 'Doesn\'t drop on death', mask: 0x0001 },
		{ id: 1, name: 'Unable to drop', mask: 0x0002 },
		{ id: 2, name: 'Unable to sell', mask: 0x0004 },
		{ id: 3, name: 'Log excessively', mask: 0x0008 },
		{ id: 4, name: 'Unable to trade', mask: 0x0010 },
		{ id: 5, name: 'Bound on equip', mask: 0x0040 },
		{ id: 6, name: 'Unable to destroy', mask: 0x0080 },
		{ id: 7, name: 'Disappear on map change', mask: 0x0100 },
		{ id: 8, name: 'Use automatically', mask: 0x0200 },
		{ id: 9, name: 'Disappear on death', mask: 0x0400 },
		{ id: 10, name: 'Unrepairable', mask: 0x1000 },
		{ id: 11, name: 'Expiration time', mask: 0xfff00000 },
	]

	static typeid(name) {
		name = name.toLowerCase();
		return Item.types.find((t) => t.name.toLowerCase().includes(name))?.id || -1;
	}

	static genders = [
		{ id: 0, name: 'Male' },
		{ id: 1, name: 'Female' },
	];

	static genders_arr = init_id_array(Item.genders);

	static equip_location = [
		{ id: 1, name: 'Body' },
		{ id: 2, name: 'Hands' },
		{ id: 3, name: 'Lower Body' },
		{ id: 4, name: 'Feet' },
		{ id: 5, name: 'Full Dress' },
	];

	static equip_location_arr = init_id_array(Item.equip_location);

	static async init() {
		Item.tmp_icon_canvas = document.createElement('canvas');
		Item.tmp_icon_canvas.width = Item.tmp_icon_canvas.height = 32;
		Item.tmp_icon_canvas_ctx = Item.tmp_icon_canvas.getContext('2d');
		Item.icon_cache = [];
		Item.item_icon_cache = [];
		Item.cache_loaded = false;

		await Promise.all([
			load_tpl_once('item_tooltip.tpl'),
			load_tpl_once('recipe_tooltip.tpl'),
		]);
	}

	static async preload_all_icons() {
		const ICON_CACHE_IDB_VER = 1;

		let idb = await IDB.open('icon-cache', ICON_CACHE_IDB_VER);
		if (!idb) {
			return;
		}

		const arr = await IDB.get(idb, 0);
		if (arr) {
			Item.icon_cache = arr;
			Item.cache_loaded = true;
			return;
		}

		for (let i = 0; i < 8192; i++) {
			await Item.preload_icon(i);
		}

		/* save everything at once */
		idb = await IDB.open('icon-cache', ICON_CACHE_IDB_VER, 'readwrite');
		IDB.set(idb, 0, Item.icon_cache);
	}

	static preload_icon(id) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = (e) => {
				Item.tmp_icon_canvas_ctx.drawImage(img, 0, 0);
				Item.icon_cache[id] = Item.tmp_icon_canvas.toDataURL('image/jpeg', 0.95);
				resolve();
			}
			img.onerror = reject;
			img.src = ROOT_URL + 'icon/' + id;
		});
	}

	static get_icon(id) {
		if (Item.icon_cache[id]) {
			return Item.icon_cache[id];
		}

		Item.preload_icon(id);
		return ROOT_URL + 'icon/' + id;
	}

	static async preload_icon_by_item(id) {
		const resp = await fetch(ROOT_URL + 'item/' + id + '/icon');
		const blob = await resp.blob();

		const icon_id = parseInt([...resp.headers.entries()].find(e => e[0] === 'x-pw-icon-id')[1]);
		const reader = new FileReader();
		reader.readAsDataURL(blob); 
		reader.onloadend = () => {
			Item.icon_cache[icon_id] = reader.result;
			Item.item_icon_cache[id] = icon_id;
		}
	}

	static get_icon_by_item(db, id) {
		if (!id || id === -1) {
			return Item.get_icon(-1);
		}

		if (!db?.items?.[id]) {
			if (Item.item_icon_cache[id]) {
				return Item.get_icon(Item.item_icon_cache[id]);
			}

			Item.preload_icon_by_item(id);
			return ROOT_URL + 'item/' + id + '/icon';
		}

		const item = db.items[id];
		return Item.get_icon(item?.icon || 0);
	}

	static get_color_by_name(name) {
		if (name.startsWith('★')) {
			return 'gold';
		} else if (name.startsWith('☆☆☆')) {
			return 'purple';
		} else if (name.startsWith('☆')) {
			return 'blue';
		}
	}

	static hide_tooltips() {
		if (ItemTooltip.last_reloaded) {
			ItemTooltip.last_reloaded.dom.style.display = 'none';
			ItemTooltip.last_reloaded.scroll_hidden = true;
		}
		if (RecipeTooltip.last_reloaded) {
			RecipeTooltip.last_reloaded.dom.style.display = 'none';
			RecipeTooltip.last_reloaded.scroll_hidden = true;
		}
	}
}

class ItemTooltip {
	constructor(args) {
		this.edit = args.edit || false;
		const tpl_db = args.db || g_latest_db;
		this.item = args.item || { id: 0, _db: { type: 'items' } };

		this.tpl = new Template('item_tooltip.tpl');
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom);
		const data = this.tpl.run({ win: this, db: tpl_db, item: this.item, edit: this.edit });

		this.dom = document.createElement('div');
		this.dom.className = 'window';
		this.shadow = this.dom.attachShadow({mode: 'open'});
		this.shadow.append(data);

		align_dom(this.shadow.querySelectorAll('.input'), 25);

		if (!this.edit) {
			this.dom.style.border = 'none';
			this.dom.style.display = 'none';
			this.dom.style.position = 'fixed';
			this.dom.style.backgroundColor = 'transparent';
			this.dom.style.color = '#fff';
			this.dom.onmouseenter = (e) => { this.dom.style.display = 'none'; };

			const s = newStyle(ROOT_URL + 'css/preview.css');
			const s_p = new Promise((resolve) => { s.onload = resolve; });
			this.shadow.prepend(s);

			s_p.then(() => {
				args.parent_el.append(this.dom);
			});
		}
	}

	static last_reloaded = null;
	reload(item, prev, bounds, db) {
		ItemTooltip.last_reloaded = this;
		this.scroll_hidden = false;

		const tpl_db = this.db || db || g_latest_db;
		this.dom.style.zIndex = Number.MAX_SAFE_INTEGER;
		this.item = item;
		const newdata = this.tpl.run({ win: this, db: tpl_db, item: this.item, edit: this.edit });
		newdata.style.visibility = 'hidden';
		this.shadow.querySelector('div').replaceWith(newdata);
		this.dom.style.display = 'block';
		const tooltip_bounds = newdata.getBoundingClientRect();
		if (bounds.right + 3 + tooltip_bounds.width < (Window.bounds?.right || window.innerWidth)) {
			this.dom.style.left = bounds.right + 3 + 'px';
		} else {
			this.dom.style.left = bounds.left - 8 - tooltip_bounds.width + 'px';
		}

		if (bounds.top + tooltip_bounds.height < (Window.bounds?.bottom || window.innerHeight)) {
			this.dom.style.top = bounds.top + 'px';
		} else {
			this.dom.style.top = bounds.bottom - tooltip_bounds.height + 'px';
		}
		newdata.style.visibility = 'visible';
	}

}

class RecipeTooltip {
	static craft_types = init_id_array([
		{ id: 0, name: 'None' },
		{ id: 158, name: 'Blacksmith' },
		{ id: 159, name: 'Tailor' },
		{ id: 160, name: 'Craftsman' },
		{ id: 161, name: 'Apothecary' },
	]);

	constructor(args) {
		this.recipe = args.recipe || { id: 0 }
		const tpl_db = args.db || g_latest_db;
		this.simplified = args.simplified;

		this.tpl = new Template('recipe_tooltip.tpl');
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom);
		const data = this.tpl.run({ win: this, db: tpl_db, recipe: this.recipe, prev: { id: 0 }, edit: this.edit, simplified: this.simplified });

		this.dom = document.createElement('div');
		this.dom.className = 'window';
		this.shadow = this.dom.attachShadow({mode: 'open'});
		this.shadow.append(data);

		align_dom(this.shadow.querySelectorAll('.input'), 25);

		if (!this.edit) {
			this.dom.style.border = 'none';
			this.dom.style.display = 'none';
			this.dom.style.position = 'fixed';
			this.dom.style.backgroundColor = 'transparent';
			this.dom.style.color = '#fff';
			this.dom.onmouseenter = (e) => { if (!this.pinned) this.dom.style.display = 'none'; };
			args.parent_el.append(this.dom);
		}
	}

	static last_reloaded = null;
	reload(recipe, prev, bounds, db) {
		RecipeTooltip.last_reloaded = this;

		const tpl_db = this.db || db || g_latest_db;
		this.dom.style.zIndex = Number.MAX_SAFE_INTEGER;
		this.recipe = recipe;
		const newdata = this.tpl.run({ win: this, db: tpl_db, recipe: this.recipe, prev: prev || { id: 0 }, edit: this.edit, simplified: this.simplified });
		newdata.style.visibility = 'hidden';
		this.shadow.querySelector('div').replaceWith(newdata);
		this.dom.style.display = 'block';
		const tooltip_bounds = newdata.getBoundingClientRect();
		if (bounds.right + 3 + tooltip_bounds.width < (Window.bounds?.right || window.innerWidth)) {
			this.dom.style.left = bounds.right + 3 + 'px';
		} else {
			this.dom.style.left = bounds.left - 8 - tooltip_bounds.width + 'px';
		}

		if (bounds.top + tooltip_bounds.height < (Window.bounds?.bottom || window.innerHeight)) {
			this.dom.style.top = bounds.top + 'px';
		} else {
			this.dom.style.top = bounds.bottom - tooltip_bounds.height + 'px';
		}
		newdata.style.visibility = 'visible';
	}

	toggle_pin(e) {
		this.pinned = this.shadow.querySelector('#recipe_info').classList.toggle('pinned');
		if (this.pinned) {
			return;
		}

		Item.hide_tooltips();
	}
}

document.addEventListener('scroll', (e) => {
	/* hide all tooltips (they're position: fixed) */
	Item.hide_tooltips();
}, { passive: true });

document.addEventListener('wheel', (e) => {
	/* hide all tooltips (they're position: fixed) */
	Item.hide_tooltips();
}, { passive: true });
