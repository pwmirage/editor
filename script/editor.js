/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

console.log('Editor initializing');

let g_map = null;

class Editor {
	static loaded = false;

	static async load() {
		console.log('Editor loading');

//  const timestamp = 0;
//  const date = new Date (timestamp * 1000);
//  $('#pw-version').text('Version: ' + date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + date.toLocaleTimeString("en-US"));

		document.body.classList.add('mge-fullscreen');

		await Promise.all([
			load_script(ROOT_URL + 'script/db.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/item.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/map.js?v=' + MG_VERSION),
		]);

		await load_script(ROOT_URL + 'script/pwdb.js?v=' + MG_VERSION),
		await Item.set_iconset(ROOT_URL + 'img/iconlist_ivtrm.png?v=' + MG_VERSION)

		await PWMap.add_elements(document.querySelector('#mgeArea'));
	}

	static async open({id}) {
		start_loading();
		const tag = show_loading_tag('Opening ' + escape(id));

		try {
			if (!Editor.loaded) {
				await Editor.load();
				Editor.loaded = true;
			}

			console.log('Editor open');
			if (g_map) {
				g_map.close();
			}
			g_map = new PWMap();
			await g_map.reinit('world');
		} catch (e) {
			console.error(e);
			show_error_tag(e.message);
		}

		await sleep(500);
		hide_loading_tag(tag);
		stop_loading();
	}
};
