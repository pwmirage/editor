/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class IDB {
	static async open(table, ver, mode = 'readonly') {
		const db = await new Promise((resolve, reject) => {
			const request = window.indexedDB.open(table, ver);
			request.onerror = reject;

			request.onsuccess = () => {
				resolve(request.result);
			};

			request.onupgradeneeded = (e) => {
				const db = e.target.result;
				db.createObjectStore('entries', { keyPath: 'id' });
				resolve(db);
			}
		});

		return db.transaction(['entries'], mode).objectStore('entries');
	}

	static async get(db, id) {
		return new Promise((resolve, reject) => {
			const request = db.get(id);
			request.onerror = reject;
			request.onsuccess = () => {
				const resp = request.result;
				if (resp) {
					resolve(resp.val);
				} else {
					reject();
				}
			};
		});
	}

	static async set(db, id, val) {
		return new Promise((resolve, reject) => {
			const request = db.add({ id, val });
			request.onerror = reject;
			request.onsuccess = resolve;
		});
	}
}

