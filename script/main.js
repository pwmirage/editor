/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_db = {};
let g_security_key = null;

const ROOT_URL = '/editor/';
let MG_VERSION_FULL = {};
let MG_VERSION = '0';

let g_last_body_el = null;

let g_main_initialized = false;
const mg_init = async () => {
	if (g_main_initialized) return;
	g_main_initialized = true;

	/* check authentication first */
	await Promise.all([
		fetch(ROOT_URL + 'version.php', { is_json: 1 }).then(async (r) => {
			MG_VERSION_FULL = await r.json();
			MG_VERSION = MG_VERSION_FULL.mtime;
		}),
	]);

	await load_script(ROOT_URL + 'script/util.js?v=' + MG_VERSION);

	await Promise.all([
		load_script(ROOT_URL + 'script/loading.js?v=' + MG_VERSION),
		load_script(ROOT_URL + 'script/editor.js?v=' + MG_VERSION)
	]);
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

const load_tpl = async (src) => {
	const file = await get(src);
	if (!file.ok) {
		throw new Error('Failed to load template: ' + src);
	}

	if (!g_last_body_el) {
		g_last_body_el = document.body.lastElementChild;
	}
	g_last_body_el.insertAdjacentHTML('afterend', file.data);
}


const g_loaded = mg_init();
