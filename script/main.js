/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_db = {};

const ROOT_URL = '/editor/';
let MG_VERSION_FULL = {};
let MG_VERSION = '0';
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
	await load_script(ROOT_URL + 'script/preview.js?v=' + MG_VERSION);

	try {
		eval("document?.window ?? true");
		await PWPreview.load_promise;
	} catch (e) {
		MG_UNSUPPORTED = true;
	}
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

let g_last_body_el = null;
const load_tpl = async (src) => {
	const file = await get(src + '?v=' + MG_VERSION);
	if (!file.ok) {
		throw new Error('Failed to load template: ' + src);
	}

	if (!g_last_body_el) {
		g_last_body_el = document.body.lastElementChild;
	}
	g_last_body_el.insertAdjacentHTML('afterend', file.data);
}

let g_mg_editor_open = false;
const mg_open_editor = async (args) => {
	if (g_mg_editor_open) return;

	g_mg_editor_open = true;

	try {
		await g_mg_loaded;

		if (MG_UNSUPPORTED) {
			confirm('Unknown error occured. Is your browser too old?', '<div style="margin-top: 16px;">Click either button to dismiss this dialogue.</div>');
			return;
		}

		try {
			Window.close_all();
		} catch (e) {}
		await Loading.show_curtain(args.no_animation || false);

		if (typeof(Editor) === 'undefined') {
			await load_script(ROOT_URL + 'script/editor.js?v=' + MG_VERSION);
		}
		await Editor.open(args);
		Loading.hide_curtain();
	} finally {
		g_mg_editor_open = false;
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
const confirm = (msg, html, title) => {
	return new Promise(resolve => {
		require(["Ui/Confirmation"], function(UiConfirmation) {
			UiConfirmation.show({
				confirm: () => { resolve(true); },
				cancel: () => { resolve(false); },
				messageIsHtml: true,
				message: msg,
				template: html,
			});
			g_confirm_dom = document.querySelector('.dialogOverlay .dialogContainer');
			if (title) {
				const title_el = g_confirm_dom.querySelector('.dialogTitle');
				if (title_el) {
					title_el.textContent = title;
				}
			}
		});
	});
}

const g_mg_loaded = mg_init();
