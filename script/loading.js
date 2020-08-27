const g_loading = {
	labels: null,
	page_init: new Promise((resolve) => setTimeout(resolve, 1000)),
};

let mg_loading_initialized = false;
const mg_loading_init = () => {
	if (mg_loading_initialized) return;
	mg_loading_initialized = true;

	g_loading.labels = document.createElement('div');
	g_loading.labels.id = 'loading-labels';
	document.body.append(g_loading.labels);
}

const show_loading_tag = (name) => {
	mg_loading_init();
	const p = newElement('<div><p>' + escape(name) + '</p></div>');
	g_loading.labels.append(p);
	setTimeout(() => { g_loading.page_init.then(() => { p.classList.add('appear'); }) }, 100);
	return p;
}

const hide_loading_tag = async (tag) => {
	setTimeout(() => {
		tag.classList.add('removing');
		setTimeout(() => { tag.remove(); }, 800);
	}, 100);
}

const show_error_tag = (name) => {
	mg_loading_init();
	const p = show_loading_tag(name);
	p.classList.add('error-tag');
	setTimeout(() => {
		g_loading.page_init.then(setTimeout(() => { hide_loading_tag(p); }, 8000));
	}, 100);
	return p;
}

const start_loading = async () => {
	mg_loading_init();
	let loading_el = document.querySelector('#mgeArea > .loading');

	if (!loading_el) {
		loading_el = newElement('<div class="loading"></div>');
		document.querySelector('#mgeArea').append(loading_el);
		const shadow = loading_el.attachShadow({mode: 'open'});
		const loadingTpl = await get(ROOT_URL + 'tpl/loading.tpl');
		const loading = newArrElements(loadingTpl.data);
		shadow.append(...loading);
	}

	document.body.classList.add('mge-loading-fullscreen');
	const shadow = loading_el.shadowRoot;
	const curtains = shadow.querySelector('#curtain');
	curtains.className = 'showCurtain';
}

const stop_loading = async () => {
	let loading_el = document.querySelector('#mgeArea > .loading');
	const shadow = loading_el.shadowRoot;
	const curtains = shadow.querySelector('#curtain');

	curtains.className = 'showCurtain hideCurtain';
	await sleep(900);
	curtains.className = '';
	document.body.classList.remove('mge-loading-fullscreen');
};
