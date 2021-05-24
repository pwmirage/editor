/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2021 Darek Stojaczyk for pwmirage.com
 */

console.log('Editor initializing');

let g_map = null;
let db;

class Editor {
	static loaded = false;
	static navbar = null;
	static map_shadow = null;

	static async init() {
		await Promise.all([
			load_script(ROOT_URL + 'script/window.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/map.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/navbar.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/projects.js?v=' + MG_VERSION),
		]);

		await Promise.all([
			load_script(ROOT_URL + 'script/window/chooser.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/rmenu.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/debug_client.js?v=' + MG_VERSION),
		]);

		await JSDebugClient.init();
	}

	static async load() {
		console.log('Editor loading');

//  const timestamp = 0;
//  const date = new Date (timestamp * 1000);
//  $('#pw-version').text('Version: ' + date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + date.toLocaleTimeString("en-US"));


		await Promise.all([
			load_script(ROOT_URL + 'script/window/welcome.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/map.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/spawner.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/npc.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/recipe.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/map_chooser.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/item.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/history.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/project.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/task.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/trigger.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/item_type_chooser.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/window/diff.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/fuzzysort.js?v=' + MG_VERSION),
		]);


		const editor_dom = document.createElement('div');
		editor_dom.id = 'mgeArea';
		document.querySelector('#pageContainer').append(editor_dom);
		Editor.map_shadow = await PWMap.add_elements(editor_dom);

		const org_menu = document.querySelector('.mainMenu .boxMenu');
		if (org_menu) {
			Editor.navbar = new Navbar(org_menu);
		}

		window.addEventListener('mousemove', Editor.onmousemove, { passive: false });
		window.addEventListener('mouseup', Editor.onmouseup, { passive: false });
		window.addEventListener('resize', Editor.onresize, { passive: false });
		window.addEventListener('error', Editor.onerror, { passive: false });

		PWDB.watch_db();

		g_map = new PWMap();
	}

	static async open(args) {
		await Editor.init();

		const tag_p = Loading.show_tag('Processing item icons');
		/* don't await icon processing */
		Item.gen_all_icons().then(() => {
			Loading.hide_tag(tag_p);
		});

		await Projects.load();
		document.querySelector('#pageContainer').append(Projects.instance.dom);

		const page_main = document.querySelector('#main');
		if (page_main) {
			/* put the fullscreen dialog container outside */
			const dialog_overlay = document.querySelector('.dialogOverlay');
			if (dialog_overlay) {
				dialog_overlay.remove();
				document.body.append(dialog_overlay);
			}

			document.querySelector('#pageFooter').remove();
			document.querySelector('.pageNavigation').remove();
			document.querySelector('#pageHeaderLogo').remove();
			page_main.remove();
		}

		document.body.classList.add('mge-fullscreen');
		document.body.classList.remove('mge-startfullscreen');
		document.body.classList.remove('mge-startpreloaded');

		if (args.pid) {
			await Editor.open_project(args.pid);
		}

	}

	static async open_project(pid) {
		let curtain_shown = false;
		history.pushState({ pid }, '', '?id=' + pid)

		if (!Editor.opened) {
			Editor.opened = true;
			if (!Loading.curtain_shown) {
				await Loading.show_curtain();
				curtain_shown = true;
			}

			await Editor.load();

			const ret_btn = document.querySelector('#returnToWebsite')
			if (ret_btn) {
				ret_btn.style.display = 'block';
				ret_btn.onclick = async () => {
					const minimized = document.body.classList.toggle('mge-background');
					document.querySelector('#returnToWebsite > a').dataset.tooltip =
					minimized ? 'Open the editor' : 'Return to projects list';
					if (minimized) {
						ret_btn.mgState = window.location.search;
						history.pushState({}, '', ROOT_URL);
					} else {
						history.pushState({}, '', ret_btn.mgState);
					}
				};
			}
		}

		try {
			Window.close_all();
			g_map.close();
		} catch (e) {
		}

		const tag_p = Loading.show_tag('Loading project');

		Editor.map_shadow.querySelector('#pw-loading').style.display = 'block';
		document.body.classList.remove('mge-background');
		await sleep(650);

		/*const date = new Date();
		const version_str = 'Mirage Editor, Version: ' + date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
		Editor.map_shadow.querySelector('#pw-version').textContent = version_str;*/

		/* db is global */
		db = await PWDB.new_db({ preinit: true, pid: pid });

		/*
		const proj_info_el = Editor.map_shadow.querySelector('#pw-project-info');
		if (args.pid) {
			proj_info_el.textContent = 'Project: ' + PROJECT_NAME + ' by ' + db.metadata[1].author;

			const d = new Date(PROJECT_LAST_EDIT * 1000);
			const d_str = d.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + d.toLocaleTimeString("en-US");
			proj_info_el.innerHTML = proj_info_el.textContent + '<br>' + d_str;
		} else {
			proj_info_el.innerHTML = 'Create a project to store<br>your changes on the server';
		}
		*/

		await g_map.reinit('none');
		await g_map.reload_db();

		Editor.navbar.reload()

		Editor.map_shadow.querySelector('#pw-loading').style.display = 'none';
		Loading.hide_tag(tag_p);

		await new Promise(async (resolve) => {
			if (localStorage.getItem('mg_welcome_closed')) {
				resolve();
			} else {
				const win = await WelcomeWindow.open();
				win.onclose = resolve;
			}
		}).then(async () => {
			localStorage.setItem('mg_welcome_closed', 1);

			//const win = await CreateProjectWindow.open();
			const win = await MapChooserWindow.open({ });
		});

		if (curtain_shown) {
			await Loading.hide_curtain();
		}
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
			if (err.error.stack.includes('WoltLabSuite')) {
				/* not out fault :) */
				return;
			}
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
