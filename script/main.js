/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_db = {};

const ROOT_URL = '/editor/';
let MG_VERSION_FULL = {};
let MG_VERSION = '0';
let MG_DEBUG = 0;
let MG_UNSUPPORTED = false;

try {
	/* needs to be in / to fetch requests from origin /, .htaccess to the rescue */
	navigator.serviceWorker.register('/service-worker.js');
} catch (e) {
	console.error(e);
}

const mg_init = async () => {
	/* check authentication first */
	await Promise.all([
		fetch(ROOT_URL + 'version.php', { is_json: 1 }).then(async (r) => {
			MG_VERSION_FULL = await r.json();
			MG_VERSION = MG_VERSION_FULL.mtime;
		}),
	]);

	await load_script(ROOT_URL + 'script/util.js?v=' + MG_VERSION);
	await load_script(ROOT_URL + 'script/loading.js?v=' + MG_VERSION);
	await load_script(ROOT_URL + 'script/maintainer.js?v=' + MG_VERSION);
	await load_script(ROOT_URL + 'script/template.js?v=' + MG_VERSION);
	await load_script(ROOT_URL + 'script/htmlsugar.js?v=' + MG_VERSION);
	await load_script(ROOT_URL + 'script/preview.js?v=' + MG_VERSION);

	document.head.append(newStyle(ROOT_URL + 'css/style.css'));

	try {
		eval("document?.window ?? true");
	} catch (e) {
		MG_UNSUPPORTED = true;
		throw e;
	}

	await PWPreview.load_promise;
};

const load_script = (src) => {
	return new Promise((resolve, reject) => {
		var script = document.createElement('script');
		script.type = "text/javascript";
		script.onload = resolve;
		script.onerror = reject;
		script.charset = "utf-8";
		script.src = src;
		document.head.appendChild(script);
	});
}

const find_tpls = (parent, name, list) => {
	for (const c of parent.children) {
		if (c.mgeTemplate && c.mgeTemplate.name == name) {
			list.push(c);
		}

		if (c.shadowRoot) {
			find_tpls(c.shadowRoot, name, list);
		} else {
			find_tpls(c, name, list);
		}
	}
}

let g_tpl_dom = {};
const load_tpl = async (src) => {
	const file = await get(src + '?v=' + MG_VERSION);
	if (!file.ok) {
		throw new Error('Failed to load template: ' + src);
	}

	const els = newArrElements(file.data);
	for (const el of els) {
		if (el.nodeType != 1 || !el.id) {
			/* a comment, ignore it */
			continue;
		}

		const prev = document.getElementById(el.id);
		if (prev) {
			prev.remove();
		}

		document.head.insertAdjacentElement('beforeend', el);
		Template.tpl_generation[el.id] = (Template.tpl_generation[el.id] + 1) || 1;

		if (MG_DEBUG) {
			const tpl_els = [];
			find_tpls(document.body, el.id, tpl_els);

			for (const el of tpl_els) {
				const t = el.mgeTemplate;

				el.replaceWith(t.run(t.args));

			}
		}
	}
}

const mg_open_editor = async (args) => {
		await g_mg_loaded;

		if (navigator.userAgent.indexOf("Chrome") == -1){
			confirm('Mirage editor currently does not support your browser:<br>' +
				'<b>' + navigator.userAgent + '</b>',
				'<span style="margin-top: 10px;">Only Chrome, Edge, and their derivatives are supported. Sorry!</span>', 'Error');
			await sleep(1);
			g_confirm_dom.classList.add('noconfirm');
			return;
		}

		if (args.pid) {
			await Loading.show_curtain(true);
		}

		if (typeof(Editor) === 'undefined') {
			await load_script(ROOT_URL + 'script/editor.js?v=' + MG_VERSION);
		}

		await Editor.open(args);

		if (args.pid) {
			Loading.hide_curtain();
		}
}

const g_mg_pages = {};
const mg_init_page = async (name, args = {}) => {
	await g_mg_loaded;
	if (!g_mg_pages[name]) {
		await load_script(ROOT_URL + 'script/page/' + name.split('@')[0] + '.js?v=' + MG_VERSION);
	}
	const page = g_mg_pages[name];
	if (!page) {
		return null;
	}

	return await page.init(args);
}

const notify = (type, msg) => {
	return new Promise(resolve => {
		require(["Ui/Notification"], function(UiNotification) {
			UiNotification.show(msg, () => {
				resolve();
			}, type);
		});
	});
}

let g_confirm_dom = null;
const confirm = (msg, html, title = 'Confirmation Required') => {
	return new Promise(resolve => {
		require(["Ui/Confirmation"], function(UiConfirmation) {
			if (g_confirm_dom) {
				g_confirm_dom.classList.remove('big');
				g_confirm_dom.classList.remove('noconfirm');
			}

			UiConfirmation.show({
				confirm: () => { resolve(true); },
				cancel: () => { resolve(false); },
				messageIsHtml: true,
				message: msg,
				template: html,
			});

			g_confirm_dom = document.querySelector('.dialogOverlay .dialogContainer');
			const title_el = g_confirm_dom.querySelector('.dialogTitle');
			if (title_el) {
				title_el.textContent = title;
			}
		});
	});
}

const g_mg_loaded = mg_init();
