import { newElement, newArrElements, escape } from './DomUtil.mjs';
import { get, sleep, ROOT_URL, VERSION, on_version_ready } from './Util.mjs';

const labels = newElement('<div id="loading-labels"></div>');
document.body.append(labels);

export const show_loading_tag = (name) => {
	const p = newElement('<div><p>' + escape(name) + '</p></div>');
	labels.append(p);
	setTimeout(() => { p.classList.add('appear'); }, 1000);
	return p;
}

export const hide_loading_tag = async (tag) => {
	setTimeout(() => {
		tag.classList.add('removing');
		setTimeout(() => { tag.remove(); }, 800);
	}, 300);
}
