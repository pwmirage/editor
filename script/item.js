/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Item {
	static types = [
		{ id: 0, name: 'Invalid' },
		{ id: 1, name: 'Weapon' },
		{ id: 2, name: 'Armor' },
		{ id: 3, name: 'Material' },
		{ id: 4, name: 'Jewelery' },
		{ id: 5, name: 'Potion' },
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
		let cached = await new Promise((resolve, reject) => {
			if (!window.indexedDB) {
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
			/* gen icons in (semi-)background */
			Item.gen_promise = Item.gen_all_icons();
		} else {
			Item.gen_promise = Promise.resolve();
		}

		customElements.define('pw-item', HTMLPWItem);
	}

	static get_icon(index) {
		if (Item.icons[index]) {
			return Item.icons[index];
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

	static async gen_all_icons() {
		if (Item.gen_promise) {
			return Item.gen_promise;
		}

		const width = Item.iconset_img.width / 32;
		const height = Item.iconset_img.height / 32;
		const icon_count = width * height;
		let index = 0;

		/* generate them in async chunks not to block the main thread */
		while (index < icon_count) {
			await new Promise((resolve) => setTimeout(() => {
				for (let i = 0; i < 32; i++) {
					Item.get_icon(index++);
				}
				resolve();
			}, 10));
		}

		if (Item.iconset_cache) {
			const cache = Item.iconset_cache.transaction(['icons'], 'readwrite').objectStore('icons');
			cache.add({ id: 0, arr: Item.icons });
		}
	}
}

class HTMLPWItem extends HTMLElement {
	constructor() {
		super();
	}

	static get observedAttributes() { return ['pw-icon']; }

	attributeChangedCallback(name, old_val, val) {
		switch (name) {
			case 'pw-icon': {
				if (val == -1) {
					this.style.backgroundImage = '';
					const prev = this.querySelector('img');
					if (prev) prev.remove();
					return;
				}

				const prev = this.querySelector('img');
				const img = document.createElement('img');
				this.appendChild(img);
				img.onload = () => {
					img.style.opacity = 1;
					if (prev) prev.remove();
				};

				img.src = Item.get_icon(val);
			}
		}
	}
	connectedCallback() {
		this.classList.add('pwitem');
	}
}

