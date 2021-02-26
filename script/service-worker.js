/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const PRECACHE = 'precache-v2';
const RUNTIME = 'runtime-v2';

const PRECACHE_URLS = [];

const module = {};
const MG_VERSION = 1;
const ROOT_URL = '/editor/';
const g_db = {};

self.importScripts('editor/script/db.js');
self.importScripts('editor/script/util.js');
self.importScripts('editor/script/pwdb.js');

/* mocks */
class Loading {
	static show_tag() {};
	static hide_tag() {};
	static show_error_tag() {};
	static try_cancel_tag() {};
};

class IDB {
	static async open() { };
	static async get() { return undefined; };
	static async set() { };
};

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(PRECACHE)
			.then(cache => cache.addAll(PRECACHE_URLS))
			.then(self.skipWaiting())
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

function dump2(data, spacing = 1) {
	return JSON.stringify(data, function(k, v) {
		/* dont include any nulls, undefined results in no output at all */
		if (v === null) return undefined;
		if (typeof v === 'object' && is_empty(v)) {
			return Array.isArray(v) ? [] : undefined;
		}
		return v;
	}, spacing);
}

const gen_proj_preview = async (url, pid, edit_time) => {
	const db = await PWDB.new_db({ pid: 0, new: true });

	const load = await get(ROOT_URL + 'project/' + pid + '/load', { is_json: 1 });
	const changesets = load.data;

	/* load all changesets but last */
	for (let i = 0; i < changesets.length - 1; i++) {
		db.load(changesets[i], { join_changesets: true });
	}

	/* seperate previous changes from the last one (the one we're generating for) */
	db.new_generation();

	db.register_commit_cb((obj) => {
		if (obj._db.type == 'metadata' && obj.id != 0) return;
		if (!obj._db.diff_original) {
			obj._db.diff_original = DB.clone_obj(obj._db.latest_state);
		}
	});

	db.load(changesets[changesets.length - 1], { join_changesets: true });

	const preview_data = [];
	for (const diff of db.changelog[db.changelog.length - 1]) {
		const org = diff._db.obj._db.diff_original;
		if (!org) continue;
		diff._db = { type: diff._db.obj._db.type, org: org };
		preview_data.push(diff);
	}

	const dump_str = JSON.stringify(preview_data, 0);

	const date = new Date();
	const resp = new Response(dump_str, { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json', 'Date': date.toGMTString(), 'Last-Modified': edit_time } });

	const cache = await caches.open(RUNTIME);
	const req = new Request(url.split('?')[0]);
	await cache.put(req, resp.clone());
	return resp;
}

const is_resp_expired = (cached) => {
	const date_header = cached.headers.get('date');
	const date = new Date(date_header);
	const timestamp = date.getTime();

	if (isNaN(timestamp)) {
		return true;
	}

	const expire_timestamp = timestamp + 7 * 24 * 3600 * 1000;
	const now = Date.now();
	return (expire_timestamp < now);
}

self.addEventListener('fetch', (event) => {
	const req = event.request;

	/* don't cache cross-origin */
	if (!req.url.startsWith(self.location.origin)) return;
	if (req.method !== 'GET') return;
	
	const url = req.url.substring(self.location.origin.length);

	const ret = caches.match(req, { ignoreSearch: true }).then(async (cached) => {
		const proj_match = url.match(/.*\/project\/preview\/local\/([0-9]+)(?:\?t=)?([0-9]+)?/);
		if (proj_match) {
			const pid = proj_match[1];
			const last_edit = proj_match[2] || 0;

			if (cached) {
				const cached_last_edit = cached.headers.get('last-modified') || 0;

				if (parseInt(cached_last_edit) < parseInt(last_edit) || is_resp_expired(cached)) {
					const ret = await gen_proj_preview(url, pid, last_edit);
					return ret;
				}

				return cached;
			}

			const ret = await gen_proj_preview(url, pid, last_edit)
			return ret;
		}


		return fetch(req);
	});

	event.respondWith(ret);
});
