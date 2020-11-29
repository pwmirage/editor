class Loading {
	static labels = null;
	static tpl = null;
	static shadow = null;
	static next_cleanup_time = 0;

	static async init() {
		Loading.tpl = await get(ROOT_URL + 'tpl/loading.tpl');

		const el = newElement('<div class="loading"></div>');
		const shadow = el.attachShadow({mode: 'open'});
		shadow.append(...newArrElements(Loading.tpl.data));
		document.querySelector('#mgeArea').append(el);

		Loading.shadow = shadow;
	}

	static show_curtain() {
		document.body.classList.add('mge-loading-fullscreen');
		const curtains = Loading.shadow.querySelector('#curtain');
		curtains.className = 'showCurtain';
	}

	static hide_curtain() {
		const curtains = Loading.shadow.querySelector('#curtain');
		curtains.className = 'showCurtain hideCurtain';
		setTimeout(() => {
			curtains.className = '';
			document.body.classList.remove('mge-loading-fullscreen');
		}, 500);
	}

	static cleanup_scheduled = false;
	static cleanup_tags() {
		if (Loading.cleanup_scheduled) {
			return;
		}

		const now = Date.now();
		const labels = Loading.shadow.querySelectorAll('#labels > .done:not(.removing)');
		if (labels.length == 0) {
			return;
		}

		for (const label of labels) {
			if (label.cleanup_time > now) {
				continue;
			}

			label.classList.add('removing');
			setTimeout(() => label.remove(), 500);
			break;
		}

		Loading.cleanup_scheduled = true;
		setTimeout(() => { Loading.cleanup_scheduled = false; Loading.cleanup_tags(); }, 200);
	}

	static show_tag(name) {
		const p = newElement('<div><p>' + escape(name) + '</p></div>');
		p._mg_timeout = setTimeout(() => {
			p._mg_shown = true;
			Loading.shadow.querySelector('#labels').append(p);
			setTimeout(() => { p.classList.add('appear'); }, 1);
		}, 100);
		return p;
	}

	static show_error_tag(name) {
		const p = Loading.show_tag(name);
		p.classList.add('error');
		setTimeout(() => {
			Loading.hide_tag(p);
		}, 8000);
		return p;
	}

	static hide_tag(tag) {
		setTimeout(() => {
			tag.classList.add('done');
			tag.cleanup_time = Date.now() + 800;
			Loading.cleanup_tags();
		 }, 1);
	}

	static try_cancel_tag(tag) {
		if (!tag._mg_shown) {
			clearTimeout(tag._mg_timeout);
		}
	}
};

Loading.init();
