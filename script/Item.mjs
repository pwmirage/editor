/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

let g_init_started = false;
let g_iconset_img;
let g_iconset_promise;
let g_icon_canvas;
let g_icon_canvas_ctx;
let g_iconset_cache;

const load_iconset = (url) => {
	return new Promise((resolve, reject) => {
		g_icon_canvas = document.createElement('canvas')
		g_icon_canvas_ctx = g_icon_canvas.getContext("2d");
		g_icon_canvas.width = 32;
		g_icon_canvas.height = 32;

		const img = g_iconset_img = new Image();
		img.crossOrigin = "Anonymous";
		img.onload = resolve;
		img.onerror = reject;
		img.src = url;
	});
}

const get_icon = async (index) => {
	if (Item.icons[index]) {
		return Item.icons[index];
	}

	if (!g_iconset_img) {
		return Item.icons[0];
	}

	let width = g_iconset_img.width / 32;
	let height = g_iconset_img.height / 32;
	let x = index % width;
	let y = parseInt(index / width);

	if (index >= width * height) {
		return Item.icons[0];
	}

	g_icon_canvas_ctx.drawImage(g_iconset_img, x * 32, y * 32, 32, 32, 0, 0, 32, 32);
	Item.icons[index] = await new Promise((resolve) => {
		g_icon_canvas.toBlob((blob) => {
			blob.url = URL.createObjectURL(blob);
			resolve(blob);
		}, 'image/jpeg');
	});
	return Item.icons[index];
}

const gen_all_icons = async () => {
	const width = g_iconset_img.width / 32;
	const height = g_iconset_img.height / 32;
	const icon_count = width * height;
	let index = 0;

	/* generate them in async chunks not to block the main thread */
	while (index < icon_count) {
		await (async () => {
			for (let i = 0; i < 32; i++) {
				await get_icon(index++);
			}
		})();
	}

	if (g_iconset_cache) {
		const cache = g_iconset_cache.transaction(['icons'], 'readwrite').objectStore('icons');
		cache.add({ id: 0, arr: Item.icons });
	}
}

const get_icon_src = (index) => {
	const blob = Item.icons[index];
	if (!blob) return 'img/itemslot.png';
	if (!blob.url) blob.url = URL.createObjectURL(blob);

	return blob.url;
}

export class Item extends HTMLElement {
	static TYPE = {
		MATERIAL: 2,
		CHI_STONE: 12,
		SHARD: 17,
		REFINE: 30,
	};

	static TYPE_NAME = [
		"Weapon",
		"Armor",
		"Material",
		"Jewelery",
		"Potion",
		"Damage Rune",
		"Defense Rune",
		"Skillbook",
		"Flyer",
		"Elf Wings",
		"Town Teleport Item",
		"Passively Used Item",
		"Chi Stone",
		"Quest Item",
		"Throwable Dart",
		"Projectile",
		"Quiver",
		"Shard",
		"Consumable Quest Item",
		"Misc Item",
		"Fashion",
		"Makeover Scroll",
		"Face Change Pill",
		"GM Mob Generator Item",
		"Pet Egg",
		"Pet Food",
		"Pet Face Change Scroll",
		"Fireworks",
		"Catapult Pulling Item",
		"Buff Consumable",
		"Refining Item",
		"Tome",
		"Smiles!",
		"HP Charm",
		"MP Charm",
		"Double XP Scroll",
		"Teleport Stone",
		"Dye"
	];

	static icons = [];

	static async set_iconset(url) {
		if (g_init_started) {
			return;
		}
		g_init_started = true;
		customElements.define('pw-item', Item);

		const cached = await new Promise((resolve, reject) => {
			if (!window.indexedDB) {
				gen_all_icons();
				return resolve(false);
			}

			const request = window.indexedDB.open("item-cache", 1);
			request.onerror = reject;
			let cached = true;

			request.onsuccess = () => {
				g_iconset_cache = request.result;
				resolve(cached);
			};

			request.onupgradeneeded = (event) => {
				cached = false;
				let db = event.target.result;
				db.createObjectStore('icons', { keyPath: 'id' });
			}
		});

		if (cached) {
			g_iconset_promise = new Promise((resolve, reject) => {
				const cache = g_iconset_cache.transaction(['icons'], 'readonly').objectStore('icons');
				const request = cache.get(0);
				request.onerror = reject;
				request.onsuccess = async () => {
					const cache = request.result;
					if (cache) {
						Item.icons = cache.arr;
					} else {
						await load_iconset(url);
						gen_all_icons();
					}
					resolve();
				};
			});

			return;
		} else {
			await load_iconset(url);

			/* ! don't await, just return */
			g_iconset_promise = gen_all_icons();
			return g_iconset_promise;
		}
	}

	constructor() {
		super();
	}

	connectedCallback() {
		this.classList.add('item');

		if (this.dataset.icon == -1) {
			this.style.backgroundImage = 'url(img/itemslot.png)';
		} else {
			this.style.backgroundImage = 'url(img/item-unknown.png)';
			g_iconset_promise.then(() => {
				this.style.backgroundImage = 'url(' + get_icon_src(this.dataset.icon) + ')';
			});
		}
	}
}
