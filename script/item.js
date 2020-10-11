/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Item {
	static types = {
		0: { name: 'Weapon' },
		1: { name: 'Armor' },
		2: { name: 'Material' },
		3: { name: 'Jewelery' },
		4: { name: 'Potion' },
		5: { name: 'Damage Rune' },
		6: { name: 'Defense Rune' },
		7: { name: 'Skillbook' },
		8: { name: 'Flyer' },
		9: { name: 'Elf Wings' },
		10: { name: 'Town Teleport Item' },
		11: { name: 'Passively Used Item' },
		12: { name: 'Chi Stone' },
		13: { name: 'Quest Item' },
		14: { name: 'Throwable Dart' },
		15: { name: 'Projectile' },
		16: { name: 'Quiver' },
		17: { name: 'Shard' },
		18: { name: 'Consumable Quest Item' },
		19: { name: 'Misc Item' },
		20: { name: 'Fashion' },
		21: { name: 'Makeover Scroll' },
		22: { name: 'Face Change Pill' },
		23: { name: 'GM Mob Generator Item' },
		24: { name: 'Pet Egg' },
		25: { name: 'Pet Food' },
		26: { name: 'Pet Face Change Scroll' },
		27: { name: 'Fireworks' },
		28: { name: 'Catapult Pulling Item' },
		29: { name: 'Buff Consumable' },
		30: { name: 'Refining Item' },
		31: { name: 'Tome' },
		32: { name: 'Smiles!' },
		33: { name: 'HP Charm' },
		34: { name: 'MP Charm' },
		35: { name: 'Double XP Scroll' },
		36: { name: 'Teleport Stone' },
		37: { name: 'Dye' }
	};

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

