/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

console.log('Editor initializing');

let g_map = null;
let db;

class Editor {
	static loaded = false;
	static navbar = null;
	static map_shadow = null;

	static async load() {
		console.log('Editor loading');

//  const timestamp = 0;
//  const date = new Date (timestamp * 1000);
//  $('#pw-version').text('Version: ' + date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + date.toLocaleTimeString("en-US"));


		await Promise.all([
			load_script(ROOT_URL + 'script/window.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/map.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/navbar.js?v=' + MG_VERSION),
		]);

		await Promise.all([
			load_script(ROOT_URL + 'script/window/chooser.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/rmenu.js?v=' + MG_VERSION),
		]);

		await Promise.all([
			load_script(ROOT_URL + 'script/window/map.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/spawner.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/npc.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/recipe.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/map_chooser.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/item.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/unsupported.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/history.js?v=' + MG_VERSION),
		]);

		const tag_p = Loading.show_tag('Processing item icons');
		/* don't await icon processing */
		Item.gen_all_icons().then(() => {
			Loading.hide_tag(tag_p);
		});

		Editor.map_shadow = await PWMap.add_elements(document.querySelector('#mgeArea'));

		const org_menu = document.querySelector('.mainMenu .boxMenu');
		if (org_menu) {
			Editor.navbar = new Navbar(org_menu);
		}

		window.addEventListener('mousemove', Editor.onmousemove, { passive: false });
		window.addEventListener('mouseup', Editor.onmouseup, { passive: false });
		window.addEventListener('resize', Editor.onresize, { passive: false });
		window.addEventListener('error', Editor.onerror, { passive: false });

		const ret_btn = document.querySelector('#returnToWebsite')
		if (ret_btn) ret_btn.onclick = async () => {
			const minimized = document.body.classList.toggle('mge-background');
			document.querySelector('#returnToWebsite > a').dataset.tooltip =
			minimized ? 'Open the editor' : 'Return to website';
			const page_main = document.querySelector('#main');
			if (page_main) {
				if (minimized) {
					page_main.style.display = '';
				} else {
					setTimeout(() => {
						page_main.style.display = 'none';
					}, 500);
				}
			}
			//await Window.close_all();
			//await this.close();
		};

		PWDB.watch_db();

	}

	static async open(args) {
		document.body.classList.add('mge-fullscreen');
		document.body.classList.remove('mge-background');
		if (!Editor.loaded) {
			await Editor.load();
			Editor.loaded = true;
		}

		const page_main = document.querySelector('#main');
		if (page_main) {
			page_main.style.display = 'none';
		}

		console.log('Editor open');
		if (g_map) {
			g_map.close();
		}

		const date = new Date();
		const version_str = 'Mirage Editor, Version: ' + date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
		Editor.map_shadow.querySelector('#pw-version').textContent = version_str;

		if (navigator.userAgent.indexOf("Chrome") == -1){
			const win = await UnsupportedBrowserWindow.open({ });
			return;
		}

		await Window.close_all();

		/* db is global */
		args.preinit = true;
		db = await PWDB.new_db(args);

		const proj_info_el = Editor.map_shadow.querySelector('#pw-project-info');
		proj_info_el.textContent = 'Project: ' + PROJECT_NAME + ' by ' + db.metadata[1].author;

		const d = new Date(PROJECT_LAST_EDIT * 1000);
		const d_str = d.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + d.toLocaleTimeString("en-US");
		proj_info_el.innerHTML = proj_info_el.textContent + '<br>' + d_str;

		Editor.navbar.reload();
		const win = await MapChooserWindow.open({ });
	}

	static close() {
		document.body.classList.remove('mge-fullscreen');
	}

	static onmousemove(e) {
		let handled = false;
		if (g_map) handled = g_map.onmousemove(e);
		handled = handled || Window.onmousemove(e);
	}

	static onmouseup(e) {
		let handled = false;
		if (g_map) handled = g_map.onmouseup(e);
		handled = handled || Window.onmouseup(e);
	}

	static onresize(e) {
		if (g_map) g_map.onresize(e);
		Window.onresize(e);
	}

	static onerror(err) {
		if (err.error) {
			MessageWindow.open({
				title: "Error!",
				msg: err.error.stack.replaceAll(window.location.origin, "")
			});
			return;
		}

		const source = err.filename.replaceAll(window.location.origin, "");
		const lineno = err.lineno;
		const colno = err.colno;
		const error = err.message;

		MessageWindow.open({
			title: "Error!",
			msg: error + '\nat ' + source + ':' + lineno + ':' + colno
		});
	}
};
