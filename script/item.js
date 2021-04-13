/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Item {
	static types = [
		{ id: 0, name: 'Invalid' },
		{ id: 1, name: 'Weapon' },
		{ id: 2, name: 'Armor' },
		{ id: 3, name: 'Jewelery' },
		{ id: 4, name: 'Potion' },
		{ id: 5, name: 'Material' },
		{ id: 6, name: 'Damage Rune' },
		{ id: 7, name: 'Defense Rune' },
		{ id: 8, name: 'Skillbook' },
		{ id: 9, name: 'Flyer' },
		{ id: 10, name: 'Elf Wings' },
		{ id: 11, name: 'Town Teleport Item' },
		{ id: 12, name: 'Passively Used Item' },
		{ id: 13, name: 'Chi Stone' },
		{ id: 14, name: 'Quest Item' },
		{ id: 15, name: 'Throwable Dart' },
		{ id: 16, name: 'Projectile' },
		{ id: 17, name: 'Quiver' },
		{ id: 18, name: 'Shard' },
		{ id: 19, name: 'Consumable Quest Item' },
		{ id: 20, name: 'Misc Item' },
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

	static typeid(name) {
		name = name.toLowerCase();
		return Item.types.find((t) => t.name.toLowerCase().includes(name))?.id || -1;
	}

	static icons = [];
	static iconset_cache;

	static async init(iconset_url) {
		await Promise.all([
			load_tpl(ROOT_URL + 'tpl/item_tooltip.tpl'),
			load_tpl(ROOT_URL + 'tpl/recipe_tooltip.tpl'),
		]);

		let cached = await new Promise((resolve, reject) => {
			if (!window.indexedDB) {
				Item.gen_blank();
				gen_all_icons();
				return resolve(false);
			}

			const request = window.indexedDB.open("item-cache", 1);
			request.onerror = reject;
			let cached = true;

			request.onsuccess = () => {
				Item.iconset_cache = request.result;
				resolve(cached);
			};

			request.onupgradeneeded = (event) => {
				cached = false;
				let db = event.target.result;
				db.createObjectStore('icons', { keyPath: 'id' });
			}
		});

		if (cached) {
			await new Promise((resolve, reject) => {
				const cache = Item.iconset_cache .transaction(['icons'], 'readonly').objectStore('icons');
				const request = cache.get(0);
				request.onerror = reject;
				request.onsuccess = async () => {
					const cache = request.result;
					if (cache && cache.arr?.length > 0) {
						Item.icons = cache.arr;
					} else {
						cached = false;
					}
					resolve();
				};
			});
		}

		if (!cached) {
			await Item.load_iconset(iconset_url);
			await Item.gen_blank();
			/* gen icons in (semi-)background */
			Item.gen_promise = Item.gen_all_icons();
		} else {
			Item.gen_promise = Promise.resolve();
		}
	}

	static get_icon(index) {
		if (Item.icons[index]) {
			return Item.icons[index];
		}

		if (index < 0) {
			/* the blank icon */
			return Item.icons[Item.icons.length - 1];
		}

		if (!Item.icon_canvas_ctx) {
			/* only cached icons */
			return Item.icons[0];
		}

		let width = Item.iconset_img?.width / 32;
		let height = Item.iconset_img?.height / 32;
		let x = index % width;
		let y = Math.floor(index / width) || 0;

		if (index >= (parseInt(width * height) || 0)) {
			return Item.icons[0];
		}

		Item.icon_canvas_ctx.drawImage(Item.iconset_img, x * 32, y * 32, 32, 32, 0, 0, 32, 32);
		Item.icons[index] = Item.icon_canvas.toDataURL('image/jpeg', 0.95);
		return Item.icons[index];
	}

	static get_icon_by_item(db, id) {
		if (!id) {
			return Item.get_icon(-1);
		}

		const item = db.items[id];
		return Item.get_icon(item?.icon || 0);
	}


	static load_iconset(url) {
		Item.icon_canvas = document.createElement('canvas')
		Item.icon_canvas_ctx = Item.icon_canvas.getContext("2d");
		Item.icon_canvas.width = 32;
		Item.icon_canvas.height = 32;

		const img = Item.iconset_img = new Image();
		img.crossOrigin = "Anonymous";

		return new Promise((resolve, reject) => {
			img.onload = resolve;
			img.onerror = reject;
			img.src = url;
		});
	}

	static async gen_blank() {
		const img = new Image();

		await new Promise((resolve, reject) => {
			img.onload = resolve;
			img.onerror = reject;
			img.src = ROOT_URL + 'img/itemslot.png';
		});

		const width = Item.iconset_img.width / 32;
		const height = Item.iconset_img.height / 32;
		const index = width * height;

		Item.icon_canvas_ctx.drawImage(img, 0, 0, 32, 32, 0, 0, 32, 32);
		Item.icons[index] = Item.icon_canvas.toDataURL('image/jpeg', 0.95);
		return Item.icons[index];

	}

	static async gen_all_icons() {
		if (Item.gen_promise) {
			return Item.gen_promise;
		}

		const width = Item.iconset_img.width / 32;
		const height = Item.iconset_img.height / 32;
		const icon_count = width * height;
		let index = 0;

		while (index < icon_count) {
			for (let i = 0; i < 32; i++) {
				Item.get_icon(index++);
			}

			/* don't block the main thread */
			await new Promise((res) => setTimeout(res, 10));
		}

		if (Item.iconset_cache) {
			const cache = Item.iconset_cache.transaction(['icons'], 'readwrite').objectStore('icons');
			cache.add({ id: 0, arr: Item.icons });
		}
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
		this.db = args.db || document.db;
		this.item = args.item || { id: 0, _db: { type: 'items' } };

		this.tpl = new Template('tpl-item-info');
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom);
		const data = this.tpl.run({ win: this, db: this.db, item: this.item, edit: this.edit });

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

			const tooltip = this.shadow.querySelector('#item_info');
			tooltip.remove();
			this.shadow.append(tooltip);

			s_p.then(() => {
				args.parent_el.append(this.dom);
			});
		}
	}

	static last_reloaded = null;
	reload(item, bounds, db) {
		ItemTooltip.last_reloaded = this;

		if (db) {
			this.db = db;
		}

		this.dom.style.zIndex = Number.MAX_SAFE_INTEGER;
		this.item = item;
		const old_tooltip = this.shadow.querySelector('#item_info');
		const newdata = this.tpl.run({ win: this, db: this.db, item: this.item, edit: this.edit });
		old_tooltip.replaceWith(newdata.querySelector('#item_info'));
		this.dom.style.display = 'block';
		this.dom.style.left = bounds.right + 3 + 'px';
		this.dom.style.top = bounds.top + 'px';
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
		this.db = args.db || document.db;
		this.simplified = args.simplified;

		this.tpl = new Template('tpl-recipe-info');
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom);
		const data = this.tpl.run({ win: this, db: this.db, recipe: this.recipe, edit: this.edit, simplified: this.simplified });

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
			const tooltip = this.shadow.querySelector('#recipe_info');
			tooltip.remove();
			this.shadow.append(tooltip);
			args.parent_el.append(this.dom);
		}
	}

	static last_reloaded = null;
	reload(recipe, bounds, db) {
		RecipeTooltip.last_reloaded = this;

		if (db) {
			this.db = db;
		}

		this.dom.style.zIndex = Number.MAX_SAFE_INTEGER;
		this.recipe = recipe;
		const old_tooltip = this.shadow.querySelector('#recipe_info');
		const newdata = this.tpl.run({ win: this, db: this.db, recipe: this.recipe, edit: this.edit, simplified: this.simplified });
		old_tooltip.replaceWith(newdata.querySelector('#recipe_info'));
		this.dom.style.display = 'block';
		this.dom.style.left = bounds.right + 3 + 'px';
		this.dom.style.top = bounds.top + 'px';
	}
}

document.addEventListener('scroll', (e) => {
	/* hide all tooltips (they're position: fixed) */
	Item.hide_tooltips();
}, { passive: true });
