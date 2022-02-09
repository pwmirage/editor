/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2021 Darek Stojaczyk for pwmirage.com
 */

console.log('Editor initializing');

let g_map = null;

class Editor {
	static loaded = false;
	static navbar = null;
	static map_shadow = null;
	static current_project = null;
	static usergroups = {};

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
			get(ROOT_URL + 'api/project/t', { is_json: 1 }).then(req => {
				Editor.usergroups = req.ok ? req.data : {};
			})
		]);
	}

	static add_elements(parent) {
		const shadow_el = document.createElement('div');
		shadow_el.id = 'pw-map';
		shadow_el.style.position = 'relative';
		shadow_el.style.width = '100vw';
		shadow_el.style.height = '100vh';
		shadow_el.style.overflow = 'hidden';

		const shadow = Editor.map_shadow = shadow_el.attachShadow({ mode: 'open' });
		const tpl = Editor.tpl = new Template('editor.tpl');
		tpl.compile_cb = (dom) => { HTMLSugar.process(dom, this); Editor.reload_times(); };

		Editor.project_info = { cur_tab: 'discussion' };

		const data = tpl.run({ project_info: Editor.project_info });
		shadow.append(data);
		shadow.append(newStyle(ROOT_URL + 'css/style.css'));
		shadow.append(newStyle(get_wcf_css().href));
		parent.prepend(shadow_el);
		Window.set_container(shadow.querySelector('#pw-windows'));

		shadow.querySelector('#open-legend').onclick = async () => {
			if (!g_map) {
				return;
			}

			const win = await LegendWindow.open({ });
		};
	}

	static async load() {
		console.log('Editor loading');

//  const timestamp = 0;
//  const date = new Date (timestamp * 1000);
//  $('#pw-version').text('Version: ' + date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + date.toLocaleTimeString("en-US"));

		await PWPreview.load_latest_db();

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
			load_script(ROOT_URL + 'script/window/objset.js?v=' + MG_VERSION),
			load_script(ROOT_URL + 'script/fuzzysort.js?v=' + MG_VERSION),
			load_tpl_once('editor.tpl'),
		]);

		PWDB.init_types();

		const editor_dom = document.createElement('div');
		editor_dom.id = 'mgeArea';
		editor_dom.style.position = 'absolute';
		editor_dom.style.top = '50px';
		document.querySelector('#pageContainer').append(editor_dom);
		Editor.add_elements(editor_dom);

		const date = new Date(MG_VERSION * 1000);
		const version_str = 'Mirage Editor, Version: ' + date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
		Editor.map_shadow.querySelector('#pw-version').textContent = version_str;

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

		const tag_p = Loading.show_tag('Processing item icons');
		/* don't await icon processing */
		Item.preload_all_icons().then(() => {
			Loading.hide_tag(tag_p);
		});
	}

	static reload_times() {
		if (!Editor.map_shadow) {
			return;
		}

		/* force reload all time tags */
		DateTime.setElements(Editor.map_shadow.querySelectorAll('time'));
	}

	static async reload_project_info() {
		if (!Editor.map_shadow) {
			return;
		}

		const collapsed = Editor.map_shadow.querySelector('#project_info')?.className;
		const text = Editor.map_shadow.querySelector('#post_comment textarea')?.value || '';
		const comments_classlist = Editor.map_shadow.querySelector('#post_comment')?.className;

		const project = Editor.current_project;
		Editor.tpl.reload('#project-info', { project });

		if (comments_classlist != undefined) {
			const comment_txt_el = Editor.map_shadow.querySelector('#post_comment textarea');
			if (comment_txt_el) {
				comment_txt_el.value = text;
			}
			Editor.map_shadow.querySelector('#project-info').className = collapsed;
			Editor.map_shadow.querySelector('#post_comment').className = comments_classlist;
			Editor.map_shadow.querySelector('#post_comment').classList.remove('loading-spinner');
		}
	}

	static async select_project_tab(name) {
		if (name === 'sets' && Editor.project_info.cur_tab !== name) {
			Editor.tpl.reload('#project-info .tab-sets', {});
		}

		Editor.project_info.cur_tab = name;
		Editor.tpl.reload('#projects-tabs', {});
		Editor.map_shadow.querySelector('#project-info .scroll > .active').classList.remove('active');
		Editor.map_shadow.querySelector('#project-info .scroll > .tab-' + name).classList.add('active');
	}

	static create_new_set() {
		const set = db.new('metadata');
		db.open(set);
		set.tag = 'objset';
		set.entries = [];
		db.commit(set);

		const win = ObjsetWindow.open({ obj: set });
	}

	static async collapse_project_tab() {
		const collapsed = Editor.map_shadow.querySelector('#project-info').classList.toggle('collapsed');

		Editor.project_info.collapsed = collapsed;
		if (!collapsed && Editor.project_info.cur_tab == 'sets') {
			Editor.tpl.reload('#project-info .tab-sets');
		}
	}

	static async open_project(pid) {
		pid = parseInt(pid);
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
						Projects.instance.reload_times();
					} else {
						history.pushState({}, '', ret_btn.mgState);
						Editor.reload_times();
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

		const req_p = get(ROOT_URL + 'api/project/' + pid + '/info', { is_json: 1 });
		const req_log_p = get(ROOT_URL + 'api/project/' + pid + '/log', { is_json: 1 });

		Editor.map_shadow.querySelector('#pw-loading').style.display = 'block';
		document.body.classList.remove('mge-background');
		Editor.map_shadow.querySelector('#pw-project-info').innerHTML = '';
		await sleep(650);

		const req = await req_p;
		const req_log = await req_log_p;
		if (!req.ok || !req_log.ok) {
			Loading.hide_tag(tag_p);
			confirm('Error occured while loading this project. Are you sure this project exists and you have access to it?', '', 'Error');
			await sleep(1);
			g_confirm_dom.classList.add('noconfirm');
			return;
		}

		Editor.current_project = req.data;
		Editor.current_project.log = req_log.data;
		await Editor.reload_project_info();

		/*const date = new Date();
		const version_str = 'Mirage Editor, Version: ' + date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
		Editor.map_shadow.querySelector('#pw-version').textContent = version_str;*/

		/* db is global */
		db = await PWDB.new_db({ preinit: true, pid: pid });

		db.register_commit_cb((obj, diff, prev_vals) => {
			if (obj._db.type === 'metadata' && obj.tag === 'objset') {
				if (Editor.project_info.collapsed) {
					return;
				}

				if (('_removed' in diff) || ('name' in diff) || diff.tag) {
					Editor.tpl.reload('#project-info .tab-sets', {});
				}
			}
		});

		await g_map.reinit('none');
		await g_map.reload_db();

		Editor.navbar.reload()
		Editor.tpl.reload('#project-info .tab-sets', {});

		Editor.map_shadow.querySelector('#pw-loading').style.display = 'none';
		Loading.hide_tag(tag_p);

		if (curtain_shown) {
			await Loading.hide_curtain();
		}

		new Promise(async (resolve) => {
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

	static async refresh_project_info() {
		const req = await get(ROOT_URL + 'api/project/' + Editor.current_project.id + '/info', { is_json: 1 });
		const req_log = await get(ROOT_URL + 'api/project/' + Editor.current_project.id + '/log', { is_json: 1 });
		if (!req.ok || !req_log.ok) {
			notify('error', 'Unexpected error while refreshing the project status. ' + (req.data.err || ''));
			return false;
		}

		Editor.current_project = req.data;
		Editor.current_project.log = req_log.data;
		await Editor.reload_project_info();

		return true;
	}

	static async add_comment() {
		const post_comment_el = Editor.map_shadow.querySelector('#project-info #post_comment');
		post_comment_el.classList.toggle('loading-spinner');

		const text_el = Editor.map_shadow.querySelector('#post_comment textarea');
		const text = text_el.value;
		const vote = parseInt(Editor.map_shadow.querySelector('input[name="vote"]:checked')?.value || 0);

		let req = await post(ROOT_URL + 'api/project/' + Editor.current_project.id + '/log/new', { is_json: 1, data: { text, vote }});
		if (!req.ok) {
			notify('error', req.data.err || 'Unexpected error occurred');
			post_comment_el.classList.toggle('loading-spinner');
			return;
		}

		if (req.ok) {
			Editor.map_shadow.querySelector('#post_comment textarea').value = '';
		}

		const ok = await Editor.refresh_project_info();
		const scroll_el = Editor.map_shadow.querySelector('#project-info .scroll');
		scroll_el.scrollTop = scroll_el.scrollHeight - scroll_el.clientHeight;
		if (ok) {
			notify('success', 'Comment posted');
		}
	}

	static hide_previous_comments(do_hide) {
		localStorage.setItem('project_hide_previous_comments', do_hide);
		const comment_els = Editor.map_shadow.querySelectorAll('#project-info .log');

		let first_hidden = null;
		if (do_hide) {
			let publish_found = false;
			for (let idx = comment_els.length - 1; idx >= 0; idx--) {
				const c = comment_els[idx];
				if (publish_found) {
					if (!first_hidden) {
						first_hidden = c;
						/* show one extra comment before
						 * the last publish */
						continue;
					}
					c.style.display = 'none';
				} else if (c.dataset.type != 0) {
					publish_found = true;
				}
			}
		} else {
			for (const c of comment_els) {
				c.style.display = 'initial';
			}
		}
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
