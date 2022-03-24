/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020-2022 Darek Stojaczyk for pwmirage.com
 */

'use strict';

const PRECACHE = 'precache-v3';
const RUNTIME = 'runtime-v3';
const PRECACHE_URLS = [
	 '/editor/data/base/items.json?v=1',
	 '/editor/data/base/tasks.json?v=2',
	 '/editor/data/base/spawners.json?v=2',
	 '/editor/data/base/monsters.json?v=1',
	 '/editor/data/base/recipes.json?v=2',
	 '/editor/data/base/npcs.json?v=1',
	 '/editor/data/base/triggers.json?v=2',
	 '/editor/data/base/mines.json?v=1',
	 '/editor/data/base/npc_tasks_out.json?v=1',
	 '/editor/data/base/npc_tasks_in.json?v=1',
	 '/editor/data/base/npc_crafts.json?v=1',
	 '/editor/data/base/npc_sells.json?v=1',
	 '/editor/data/base/weapon_major_types.json?v=1',
	 '/editor/data/base/weapon_minor_types.json?v=1',
	 '/editor/data/base/armor_major_types.json?v=1',
	 '/editor/data/base/armor_minor_types.json?v=1',
	 '/editor/data/base/decoration_major_types.json?v=1',
	 '/editor/data/base/decoration_minor_types.json?v=1',
	 '/editor/data/base/medicine_major_types.json?v=1',
	 '/editor/data/base/medicine_minor_types.json?v=1',
	 '/editor/data/base/projectile_types.json?v=1',
	 '/editor/data/base/quiver_types.json?v=1',
	 '/editor/data/base/armor_sets.json?v=1',
	 '/editor/data/base/equipment_addons.json?v=1',
	 '/editor/data/base/stone_types.json?v=1',
	 '/editor/data/base/monster_addons.json?v=1',
	 '/editor/data/base/monster_types.json?v=1',
	 '/editor/data/base/fashion_major_types.json?v=1',
	 '/editor/data/base/fashion_sub_types.json?v=1',
	 '/editor/data/base/gm_generator_types.json?v=1',
	 '/editor/data/base/pet_types.json?v=1',
	 '/editor/data/images/iconlist_ivtrm.jpg?v=1',
];

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
let g_init_promise = null;

const load_db = (force = false) => {
	if (g_init_promise && !force) {
		return g_init_promise;
	}

	g_init_promise = new Promise(async (resolve, reject) => {
		try {
			PWDB.init();

			const db = await load_latest_db(MG_BRANCH);
			resolve(db);
		} catch (e) {
			reject(e);
		}
	});

	return g_init_promise;
};

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
			const resp = await caches.match(req);
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

const g_url_tree = Object.create(null);
const g_url_fn_symbol = Symbol();

/**
 * Call function handler for given url.
 *
 * \return handler function or undefined if none found
 */
const match_handler = (req, url, args_arr) => {
	const parts = url.split('/');
	if (parts[parts.length - 1] == '') {
		//todo parts.length--;
	}

	if (parts.length < 2) {
		return undefined;
	}

	let tree = g_url_tree;
	let handler = null;

	for (let i = 1; i < parts.length; i++) {
		let p = parts[i];

		if (tree['*']) {
			args_arr.push(p);
			p = '*';
		}

		if (tree[p]) {
			tree = tree[p];
			if (tree[g_url_fn_symbol]) {
				handler = tree[g_url_fn_symbol];
			}
		} else {
			break;
		}
	}

	return handler;
};

const validate_tree = (t) => {
	if (t['*'] && Object.keys(t).length > 1) {
		return false;
	}

	return true;
};

const register_url = (url, fn) => {
	const parts = url.split('/');

	let tree = g_url_tree;
	for (let i = 1; i < parts.length; i++) {
		const p = parts[i];

		let entry = tree[p];
		if (!entry) {
			entry = Object.create(null);
			tree[p] = entry;
		}
		if (!validate_tree(tree)) {
			throw new Error('Registered conflicting URLs: ' + url);
		}

		tree = entry;
	}

	if (tree[g_url_fn_symbol]) {
		throw new Error('Registered conflicting URLs: ' + url);
	}

	tree[g_url_fn_symbol] = fn;
};

register_url('/editor/icon/*', async (req, args) => {
	let id = parseInt(args[1]);

	if (!id) {
		id = 0;
	}

	const db = await load_db();
	const icon_buf = Icon.get_icon(id);
	return new Response(icon_buf, {
		status: 200, statusText: 'OK', headers: { 'Content-Type': 'image/jpeg' }
	});
});

register_url('/editor/item/*/icon', async (req, args) => {
	let id = parseInt(args[1]);
	if (!id) {
		id = 0;
	}

	const db = await load_db();
	const item = db?.items?.[id];
	const icon = id == 0 ? -1 : (item?.icon || 0);

	const icon_buf = Icon.get_icon(icon);
	return new Response(icon_buf, {
		status: 200, statusText: 'OK', headers: {
			'Content-Type': 'image/jpeg', 'x-pw-icon-id': icon
		}
	});
});

register_url('/editor/recipe/*/icon', async (req, args) => {
	let id = parseInt(args[1]);
	if (!id) {
		id = 0;
	}

	const db = await load_db();
	const r = db?.recipes?.[id];
	const item_id = r?.targets?.[0]?.id || 0;
	const item = db?.items?.[item_id];
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
});

register_url('/editor/latest_db/static', async (req, args) => {
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

	const db = await load_db();

	const data = {};
	for (const t of types) {
		data[t] = [...db[t]];
	}

	const date = new Date();
	return new Response(JSON.stringify(data), { status: 200, statusText: 'OK',
		headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
	});
});

register_url('/editor/latest_db/load', async (req, args) => {
	const params = req.params;
	if (params.head_id !== MG_BRANCH?.head_id) {
		MG_BRANCH = params;
	}

	const db = await load_db();
	const date = new Date();
	return new Response('{}', { status: 200, statusText: 'OK',
		headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
	});
});

register_url('/editor/latest_db/get/*/*', async (req, args) => {
	const db = await load_db();

	const type = args[1];
	const id_str = args[2];

	const ids = id_str.split(',');

	const arr = [];
	for (const id of ids) {
		const obj = db[type]?.[id] || { _db: { type, id: parseInt(id) }};
		arr.push(obj);
	}

	const date = new Date();
	return new Response(dump2(arr.length == 1 ? arr[0] : arr, 0), { status: 200, statusText: 'OK',
		headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
	});
});

register_url('/editor/latest_db/query/*', async (req, args) => {
	const type = query_match[1];
	const params = req.params;

	const fn = new Function('obj', 'return (' + (params.fn || '(obj) => false') + ')(obj)');
	const arr = db[type]?.filter(fn);

	const date = new Date();
	return new Response(dump2(arr, 0), { status: 200, statusText: 'OK',
		headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
	});
});

self.addEventListener('fetch', (event) => {
	const req = event.request;

	/* don't cache cross-origin */
	if (!req.url.startsWith(self.location.origin)) return;

	let url = req.url.substring(self.location.origin.length);

	/* cut out the query (?p=....) */
    url = url.split('?')[0];

	const ret = caches.match(url).then(async (cached) => { try {
		if (cached) {
			return cached;
		}

		const args_arr = [ url ];
		const fn = match_handler(req, url, args_arr);

		if (!fn) {
			return fetch(req);
		}

		req.params = {};
		try {
			if (req.method === 'POST') {
				const form_data = await req.formData();
				for (const e of form_data.entries()) {
					req.params[e[0]] = e[1];
				}
			}
		} catch (e) {}

		return await fn(req, args_arr);
	} catch(e) { console.error(e); }});

	event.respondWith(ret);
});

const load_latest_db = async (branch) => {
	console.log(new Date() + '\n' + 'SW: Loading DB head=' + branch.head_id);
	const db = await PWDB.new_db({ pid: 0, preinit: true, new: true, no_tag: true });

	const resp = await get(ROOT_URL + 'api/project/load/commit@' + branch.head_id,
			{ is_json: 1 });
	if (resp.ok) {
		const changesets = resp.data;
		for (let i = 0; i < changesets.length; i++) {
			const changeset = changesets[i];
			const proj_change = changeset[0][0];
			const pid = proj_change.pid;
			db.new_id_start = 0x80000000 + pid * 0x100000;
			db.new_id_offset = 0;
			db.load(changeset, {join_changesets: true});
		}
	}

	if (!Icon.gen_promise) {
		await Icon.init(ROOT_URL + 'data/images/iconlist_ivtrm.jpg');
	}

	return db;
}

self.importScripts('editor/script/jpeg-encode.js');
self.importScripts('editor/script/jpeg-decode.js');
self.importScripts('editor/script/db.js');
self.importScripts('editor/script/util.js');
self.importScripts('editor/script/pwdb.js');

/* mock */
class Loading {
	static show_tag() {};
	static hide_tag() {};
	static show_error_tag() {};
	static try_cancel_tag() {};
};

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
