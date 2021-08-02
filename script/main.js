/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const g_db = {};

const ROOT_URL = '/editor/';
let MG_DEBUG = 0;
let MG_UNSUPPORTED = false;

const mg_init = async () => {
	await load_script(ROOT_URL + 'script/util.js?v=' + MG_VERSION);

	document.head.append(newStyle(ROOT_URL + 'css/style.css'));

	await Promise.all([
		load_script(ROOT_URL + 'script/loading.js?v=' + MG_VERSION),
		load_script(ROOT_URL + 'script/template.js?v=' + MG_VERSION),
		load_script(ROOT_URL + 'script/htmlsugar.js?v=' + MG_VERSION),
	]);

	await Promise.all([
		load_script(ROOT_URL + 'script/sw_manager.js?v=' + MG_VERSION),
		load_script(ROOT_URL + 'script/maintainer.js?v=' + MG_VERSION),
		load_script(ROOT_URL + 'script/preview.js?v=' + MG_VERSION),
		load_script(ROOT_URL + 'script/debug_client.js?v=' + MG_VERSION),
	]);

	try {
		eval("document?.window ?? true");
	} catch (e) {
		MG_UNSUPPORTED = true;
		throw e;
	}

	await PWPreview.load_promise;
	await JSDebugClient.init();
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

const g_mg_loaded = mg_init();
