/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class JSDebugClient {
	static socket;

	static async init() {
		const url = localStorage.getItem('jsdebug-url');

		if (!url) {
			return;
		}

		const socket = JSDebugClient.socket = new WebSocket(url);

		socket.addEventListener('open', (event) => {
			MG_DEBUG = 1;
			console.log('JSDebugClient connected');
		});

		socket.addEventListener('message', (event) => {
			const path = event.data;

			if (path.endsWith('.tpl')) {
				console.log('Reloading tpl=' + path);
				load_tpl(path);
			} else if (path.startsWith('script/page/')) {
				const file = path.substring('script/page/'.length);
				const prev = document.querySelector('script[src*="' + file + '"]');

				console.log('Reloading page=' + path);
				if (prev) {
					prev.remove();
				}
				load_script(ROOT_URL + path + '?v=' + MG_VERSION);
			}
		})
	}
}
