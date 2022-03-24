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

	await g_sw_promise;
	post(ROOT_URL + 'latest_db/load', { is_json: 1, data: {
		...MG_BRANCHES.find(b => b.id == MG_DEFBRANCH)
	}});

	await PWPreview.load();
	await JSDebugClient.init();

	/* try to keep the service worker alive; no guarantees though */
	setInterval(() => {
		post(ROOT_URL + 'latest_db/ping', { is_json: 1 });
	}, 20 * 1000);
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

const load_tpl = async (src) => {
	const file = await get(ROOT_URL + 'tpl/' + src + '?v=' + MG_VERSION);
	if (!file.ok) {
		throw new Error('Failed to load template: ' + src);
	}

	const prev = document.getElementById(src);
	if (prev) {
		prev.remove();
	}

	const script_el = document.createElement('script');
	script_el.type = 'text/x-jstemplate';
	script_el.innerHTML = file.data;
	const id = src;
	script_el.id = id;

	document.head.insertAdjacentElement('beforeend', script_el);
	Template.tpl_generation[id] = (Template.tpl_generation[id] + 1) || 1;

	if (MG_DEBUG) {
		const tpl_els = [];
		find_tpls(document.body, id, tpl_els);

		for (const el of tpl_els) {
			const t = el.mgeTemplate;

			el.replaceWith(t.run(t.args));

		}
	}

	return script_el;
}

const load_tpl_once = (src) => {
	if (!Template.tpl_generation[src]) {
		return load_tpl(src);
	}

	return document.getElementById(src);
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
