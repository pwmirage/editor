/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

'use strict';

const PRECACHE = 'precache-v3';
const RUNTIME = 'runtime-v3';
const PRECACHE_URLS = [];

const module = {};
const MG_VERSION = 1;
let MG_BRANCH = null;
const ROOT_URL = '/editor/';
const g_db = {};
let g_latest_db;

/* mock */
class Loading {
	static show_tag() {};
	static hide_tag() {};
	static show_error_tag() {};
	static try_cancel_tag() {};
};

self.importScripts('editor/script/db.js');
self.importScripts('editor/script/idb.js');
self.importScripts('editor/script/util.js');
self.importScripts('editor/script/pwdb.js');

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
}

self.addEventListener('fetch', (event) => {
	const req = event.request;



	/* don't cache cross-origin */
	if (!req.url.startsWith(self.location.origin)) return;
	
	const url = req.url.substring(self.location.origin.length);

	const ret = caches.match(req, { ignoreSearch: true }).then(async (cached) => {
		const date = new Date();

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


			const get_match = url_simplified.match(/^get\/([a-zA-Z0-9_]+)\/([0-9]+)[\/]?$/);
			if (get_match) {
				const type = get_match[1];
				const id = get_match[2];

				const obj = g_latest_db[type]?.[id] || { _db: { type }};

				return new Response(dump2(obj, 0), { status: 200, statusText: 'OK',
					headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString() }
				});
			} 

			const query_match = url_simplified.match(/^query\/([a-zA-Z0-9_]+)[\/]?$/);
			if (query_match) {
				const type = query_match[1];
				const params = await get_body(req);

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
	});

	event.respondWith(ret);
});

const load_latest_db = async (pid) => {
	g_latest_db = await PWDB.new_db({ pid, preinit: true, new: false, no_tag: true });
}

self.addEventListener('message', e => {
	if (!e.data) {
		return;
	} else if (e.data === 'skipWaiting') {
		skipWaiting();
	} else if (e.data.type === 'setbranch') {
		if (e.data.data.head_id === MG_BRANCH?.head_id) {
			return;
		}

		MG_BRANCH = e.data.data;
		load_latest_db(MG_BRANCH.head_id);
	}
});
