/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020-2022 Darek Stojaczyk for pwmirage.com
 */

'use strict';

const PRECACHE = 'precache-v3';
const RUNTIME = 'runtime-v3';
const PRECACHE_URLS = [];

self.addEventListener('message', e => {
	if (!e.data) {
		return;
	} else if (e.data === 'skipWaiting') {
		skipWaiting();
	}
});

const module = {};
const MG_VERSION = 1;
let MG_BRANCH = null;
const ROOT_URL = '/editor/';
const g_db = {};
let g_latest_db;
let g_latest_db_load_fn = null;
let g_latest_db_promise = new Promise((resolve) => { g_latest_db_load_fn = resolve; });
let g_init_promise_resolve_fn = null;
let g_init_promise = new Promise((resolve) => { g_init_promise_resolve_fn = resolve; });

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(PRECACHE)
			.then(cache => cache.addAll(PRECACHE_URLS))
	);
});

self.addEventListener('activate', (event) => {
	const cur_cache_names = [PRECACHE, RUNTIME];
	event.waitUntil((async () => {
		/* clean up old cache revisions */
		const cache_names = await caches.keys();
		for (const name of cache_names) {
			if (cur_cache_names.includes(name)) {
				/* still exists, nothing to do */
				continue;
			}

			caches.delete(name);
		}

		const cache = await caches.open(RUNTIME);
		const reqs = await cache.keys();
		for (const req of reqs) {
			const resp = await caches.match(req, { ignoreSearch: true });
			if (is_resp_expired(resp)) {
				cache.delete(req);
			}
		}

		return self.clients.claim();
	})());
});

const dump2 = (data, spacing = 1) => {
	return JSON.stringify(data, function(k, v) {
		/* dont include any nulls, undefined results in no output at all */
		if (v === null) return undefined;
		if (k === '_db') return { type: v.type };
		return v;
	}, spacing);
};

self.addEventListener('fetch', (event) => {
	const req = event.request;

	/* don't cache cross-origin */
	if (!req.url.startsWith(self.location.origin)) return;
	
	const url = req.url.substring(self.location.origin.length);

	const ret = caches.match(req, { ignoreSearch: true }).then(async (cached) => { try {
		const date = new Date();

		if (url.match(/^\/editor\/icon\/.*/)) {
			let id = parseInt(url.substring('/editor/icon/'.length) || 0);

			if (!id) {
				id = 0;
			}

			await g_latest_db_promise;
			const icon_buf = Icon.get_icon(id);
			return new Response(icon_buf, {
				status: 200, statusText: 'OK', headers: { 'Content-Type': 'image/jpeg' }
			});
		}

		const item_icon_match = url.match(/^\/editor\/item\/([0-9]+)\/icon/);
		if (item_icon_match) {
			let id = item_icon_match[1];
			if (!id) {
				id = 0;
			}

			await g_latest_db_promise;
			const item = g_latest_db?.items?.[id];
			const icon = id == 0 ? -1 : (item?.icon || 0);

			const icon_buf = Icon.get_icon(icon);
			return new Response(icon_buf, {
				status: 200, statusText: 'OK', headers: {
					'Content-Type': 'image/jpeg', 'x-pw-icon-id': icon
				}
			});
		}

		const recipe_icon_match = url.match(/^\/editor\/recipe\/([0-9]+)\/icon/);
		if (recipe_icon_match) {
			let id = recipe_icon_match[1];
			if (!id) {
				id = 0;
			}

			await g_latest_db_promise;
			const r = g_latest_db?.recipes?.[id];
			const item_id = r?.targets?.[0]?.id || 0;
			const item = g_latest_db?.items?.[item_id];
			let icon = parseInt(id) == 0 ? -1 : (item?.icon || 0);

			if (item_id == 0 && !r?.targets?.filter(i => i?.id)?.length) {
				/* nothing to craft in this recipe */
				icon = -1;
			}

			const icon_buf = Icon.get_icon(icon);
			return new Response(icon_buf, {
				status: 200, statusText: 'OK', headers: {
					'Content-Type': 'image/jpeg', 'x-pw-icon-id': icon
				}
			});
		}

		if (url === '/editor/latest_db/static') {
			const types = [
				'weapon_major_types',
				'weapon_minor_types',
				'armor_major_types',
				'armor_minor_types',
				'decoration_major_types',
				'decoration_minor_types',
				'medicine_major_types',
				'medicine_minor_types',
				'projectile_types',
				'quiver_types',
				'armor_sets',
				'equipment_addons',
				'stone_types',
				'monster_addons',
				'monster_types',
				'fashion_major_types',
				'fashion_sub_types',
				'gm_generator_types',
				'pet_types',
			];

			await g_latest_db_promise;

			const data = {};
			for (const t of types) {
				data[t] = [...g_latest_db[t]];
			}

			return new Response(JSON.stringify(data), { status: 200, statusText: 'OK',
				headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
			});
		}

		if (url.match(/^\/editor\/latest_db\/.*/)) {
			const url_simplified = url.substring('/editor/latest_db/'.length);

			const get_body = async (req) => {
				const body = await req.formData();
				const ret = {};
				for (const e of body.entries()) {
					ret[e[0]] = e[1];
				}
				return ret;
			}

			if (url === '/editor/latest_db/load') {
				await g_init_promise;

				const params = await get_body(req);
				if (params.head_id !== MG_BRANCH?.head_id) {
					MG_BRANCH = params;
					const idb = await IDB.open('swdata', 1, 'readwrite');
					IDB.set(idb, 'branch', MG_BRANCH);
					await load_latest_db(MG_BRANCH);
				}
				await g_latest_db_promise;
				return new Response('{}', { status: 200, statusText: 'OK',
					headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
				});
			}

			await g_latest_db_promise;

			const get_match = url_simplified.match(/^get\/([a-zA-Z0-9_]+)\/([0-9,]+)[\/]?$/);
			if (get_match) {
				const type = get_match[1];
				const id_str = get_match[2];

				const ids = id_str.split(',');

				await g_latest_db_promise;

				const arr = [];
				for (const id of ids) {
					const obj = g_latest_db[type]?.[id] || { _db: { type, id: parseInt(id) }};
					arr.push(obj);
				}

				return new Response(dump2(arr.length == 1 ? arr[0] : arr, 0), { status: 200, statusText: 'OK',
					headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
				});
			} 

			const query_match = url_simplified.match(/^query\/([a-zA-Z0-9_]+)[\/]?$/);
			if (query_match) {
				const type = query_match[1];
				const params = await get_body(req);

				await g_latest_db_promise;

				const fn = new Function('obj', 'return (' + (params.fn || '(obj) => false') + ')(obj)');
				const arr = g_latest_db[type]?.filter(fn);
				return new Response(dump2(arr, 0), { status: 200, statusText: 'OK',
					headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
				});
			}

			return new Response('', { status: 405, statusText: 'ERR',
				headers: { 'Content-Type': 'text/plain', 'Date': date.toGMTString() }
			});
		}


		return fetch(req);
	} catch(e) { console.error(e); }});

	event.respondWith(ret);
});

const load_latest_db = async (branch) => {
	let load_fn = g_latest_db_load_fn;
	if (!load_fn) {
		await g_latest_db_promise;
	}

	g_latest_db_load_fn = null;
	g_latest_db_promise = new Promise(async (resolve) => { try {
		console.log(new Date() + '\n' + 'SW: Loading DB head=' + branch.head_id);
		g_latest_db = await PWDB.new_db({ pid: 0, preinit: true, new: true, no_tag: true });

		const resp = await get(ROOT_URL + 'api/project/load/commit@' + branch.head_id,
				{ is_json: 1 });
		if (resp.ok) {
			const changesets = resp.data;
			for (let i = 0; i < changesets.length; i++) {
				const changeset = changesets[i];
				const proj_change = changeset[0][0];
				const pid = proj_change.pid;
				g_latest_db.new_id_start = 0x80000000 + pid * 0x100000;
				g_latest_db.new_id_offset = 0;
				g_latest_db.load(changeset, {join_changesets: true});
			}
		}

		if (load_fn) {
			load_fn();
		}

		resolve();
	} catch (e) { console.error(e); }});
}


self.importScripts('editor/script/jpeg-encode.js');
self.importScripts('editor/script/jpeg-decode.js');
self.importScripts('editor/script/db.js');
self.importScripts('editor/script/idb.js');
self.importScripts('editor/script/util.js');
self.importScripts('editor/script/pwdb.js');

(async () => { try {
	const idb = await IDB.open('swdata', 1, 'readonly');
	const oldbranch = await IDB.get(idb, 'branch');

	if (MG_BRANCH) {
		return;
	}

	MG_BRANCH = oldbranch;
	if (!g_latest_db && MG_BRANCH?.head_id) {
		await load_latest_db(MG_BRANCH);
	}
} catch (e) { console.log(e); } })();


/* mock */
class Loading {
	static show_tag() {};
	static hide_tag() {};
	static show_error_tag() {};
	static try_cancel_tag() {};
};

PWDB.init();

class Icon {
	static icons = [];
	static iconset_cache = null;
	static atlas_width = 4096;
	static atlas_height = 2048;

	static async init(iconset_url) {
		await Icon.gen_blank();
		await Icon.load_iconset(iconset_url);
		/* gen icons in (semi-)background */
		Icon.gen_promise = Icon.gen_all_icons();
	}

	static get_icon(index) {
		if (Icon.icons[index]) {
			return Icon.icons[index];
		}

		if (index < 0) {
			/* the blank icon */
			return Icon.icons[Icon.icons.length - 1];
		}

		let width = Icon.atlas_width / 32;
		let height = Icon.atlas_height / 32;
		let x = index % width;
		let y = Math.floor(index / width) || 0;

		if (index >= width * height) {
			return Icon.icons[0];
		}

		const arr8_data = new Uint8ClampedArray(32 * 32 * 4);
		for (let y_off = 0; y_off < 32; y_off++) {
			for (let x_off = 0; x_off < 32; x_off++) {
				const doff = y_off * 32 + x_off;
				const soff = (y * 32 + y_off) * Icon.atlas_width + x * 32 + x_off;
				arr8_data[doff * 4 + 0] = Icon.atlas_data[soff * 3 + 0];
				arr8_data[doff * 4 + 1] = Icon.atlas_data[soff * 3 + 1];
				arr8_data[doff * 4 + 2] = Icon.atlas_data[soff * 3 + 2];
				arr8_data[doff * 4 + 3] = 1;
			}
		}

		const img_data = new ImageData(arr8_data, 32, 32);
		Icon.icons[index] = encode(img_data, 95).data;
		return Icon.icons[index];
	}

	static async gen_blank() {
		const resp = await fetch(ROOT_URL + 'img/itemslot.png');
		const buf = await resp.arrayBuffer();

		const width = Icon.atlas_width / 32;
		const height = Icon.atlas_height / 32;
		const index = width * height;

		Icon.icons[index] = buf;
		return Icon.icons[index];
	}

	static async load_iconset(url) {
		const resp = await fetch(url);
		const arr_data = await resp.arrayBuffer();
		const arr8_data = new Uint8Array(arr_data);

		const parser = new JpegDecoder();
		parser.parse(arr8_data);
		Icon.atlas_data = parser.getData(Icon.atlas_width, Icon.atlas_height);
	}


	static async gen_all_icons() {
		return Promise.resolve();
		if (Icon.gen_promise) {
			return Icon.gen_promise;
		}

		const width = Icon.atlas_width / 32;
		const height = Icon.atlas_height / 32;
		const icon_count = width * height;
		let index = 0;

		while (index < icon_count) {
			for (let i = 0; i < 32; i++) {
				Icon.get_icon(index++);
			}

			/* don't block the main thread */
			await new Promise((res) => setTimeout(res, 1));
		}
	}
}

Icon.init(ROOT_URL + 'data/images/iconlist_ivtrm.jpg?v=' + MG_VERSION);
g_init_promise_resolve_fn();
