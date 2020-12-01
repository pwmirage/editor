/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

const PRECACHE_URLS = [
	'./',
];

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(PRECACHE)
			.then(cache => cache.addAll(PRECACHE_URLS))
			.then(self.skipWaiting())
	);
});

/* cleaning up old caches */
self.addEventListener('activate', event => {
	console.log('activating...');
	const currentCaches = [PRECACHE, RUNTIME];
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
		}).then(cachesToDelete => {
			return Promise.all(cachesToDelete.map((c) => {
				return caches.delete(c);
			}));
		}).then(() => { self.clients.claim(); console.log('activated!'); })
	);
});

const cache_db = async () => {
	const arrays = [ 
		'mines',
		'recipes',
		'npc_sells',
		'npc_crafts',
		'npcs',
		'monsters',
		'items',
		'weapon_major_types',
		'weapon_minor_types',
		'armor_major_types',
		'armor_minor_types',
		'decoration_major_types',
		'decoration_minor_types',
		'medicine_major_types',
		'medicine_minor_types',
		'material_major_types',
		'material_minor_types',
		'projectile_types',
		'quiver_types',
		'armor_sets',
		'equipment_addons',
	];

	const db = {};
	const promises = [];
	for (const arr of arrays) {
		const p = fetch(self.location.origin + '/editor/data/base/' + arr + '.json').then((r) => {
			return r.json().then((json) => {
				db[arr] = json;
				return db[arr];
			});
		});
		promises.push(p);
	}

	await Promise.all(promises);

	console.log('generated fake db');
	return db;

}

self.addEventListener('fetch', (event) => {
	const req = event.request;

	/* don't cache cross-origin */
	if (!req.url.startsWith(self.location.origin)) return;
	if (req.method !== 'GET') return;
	
	const url = req.url.substring(self.location.origin.length);

	const ret = caches.match(req).then((cached) => {
		if (cached) {
			return cached;
		}

		if (url.endsWith('/cache_db.json')) {
			console.log('fake db hook!');
			return cache_db().then((db) => {
				return caches.open(RUNTIME).then(cache => {
					const str = JSON.stringify(db);
					const resp = new Response(str, { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } });
					return cache.put(req, resp.clone()).then(() => {
						return resp;
					});
				});
			});
		}

		return fetch(req);

		return caches.open(RUNTIME).then(cache => {
			return fetch(req).then(response => {
				// Put a copy of the response in the runtime cache.
				return cache.put(req, response.clone()).then(() => {
					return response;
				});
			});
		});
	});

	event.respondWith(ret);
});
