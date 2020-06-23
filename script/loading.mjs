import { newElement, newArrElements, escape } from './DomUtil.mjs';
import { get, sleep, ROOT_URL, VERSION, on_version_ready } from './Util.mjs';

const labels = newElement('<div id="loading-labels"></div>');
document.body.append(labels);

const page_init = new Promise((resolve) => setTimeout(resolve, 1000));

export const show_loading_tag = (name) => {
	const p = newElement('<div><p>' + escape(name) + '</p></div>');
	labels.append(p);
	setTimeout(() => { page_init.then(() => { p.classList.add('appear'); }) }, 100);
	return p;
}

export const hide_loading_tag = async (tag) => {
	setTimeout(() => {
		tag.classList.add('removing');
		setTimeout(() => { tag.remove(); }, 800);
	}, 100);
}

export const show_error_tag = (name) => {
	const p = show_loading_tag(name);
	p.classList.add('error-tag');
	setTimeout(() => {
		page_init.then(setTimeout(() => { hide_loading_tag(p); }, 8000));
	}, 100);
	return p;
}

document.mgeLoad = async ({ id, fadeIn }) => {
	let loading_el = document.querySelector('#mgeArea > .loading');

	if (!loading_el) {
		loading_el = newElement('<div class="loading"></div>');
		document.querySelector('#mgeArea').append(loading_el);
		const shadow = loading_el.attachShadow({mode: 'open'});
		const loadingTpl = await get(ROOT_URL + 'tpl/loading.tpl');
		const loading = newArrElements(loadingTpl.data);
		shadow.append(...loading);
	}

	const tag = show_loading_tag('Opening ' + escape(id));
	document.body.classList.add('mge-loading-fullscreen');
	const shadow = loading_el.shadowRoot;
	const curtains = shadow.querySelector('#curtain');
	curtains.className = 'showCurtain';

        await new Promise((resolve, reject) => {
		if (document.querySelector('#mge-editor-mjs')) {
			return resolve();
		}

                var script = document.createElement('script');
		script.id = 'mge-editor-mjs';
                script.type = 'module';
                script.onload = resolve;
                script.onerror = reject;
                script.charset = "utf-8";
                script.src = ROOT_URL + 'script/editor.mjs';
                document.head.appendChild(script);
        });

	await sleep(500);

	try {
		await document.mgeEdit({id});
	} catch (e) {
		show_error_tag(e.message);
	}

	hide_loading_tag(tag);
	curtains.className = 'showCurtain hideCurtain';
	await sleep(900);
	curtains.className = '';
	document.body.classList.remove('mge-loading-fullscreen');
};
