/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const _fetch = async (url, { params, is_json }) => {
	let resp;

	try {
		resp = await fetch(url, params);
		if (!resp.ok) {
			resp.data = is_json ? {} : '';
		}
	} catch (e) {
		return { ok: false, data: is_json ? {} : '' };
	}

	if (!is_json) {
		try {
			resp.data = await resp.text();
		} catch (e) {
			console.error(url, e);
			resp.data = '';
		}
	} else {
		try {
			const txt = await resp.text();
			if (txt) {
				resp.data = JSON.parse(txt);
			} else {
				resp.data = {};
			}
		} catch (e) {
			console.error(url, e);
			resp.data = {};
		}
	}
	return resp;
}

const get = async (url, { is_json, headers } = {}) => {
	return _fetch(url, { is_json, params: { method: 'GET', headers: headers || {} }});
}

const post = async (url, { data, is_json } = {}) => {
	const form_data = new FormData();

	form_data.append('t', SECURITY_TOKEN);
	for (const field in data) {
		if (typeof(data[field]) == 'object' && !(data[field] instanceof File)) {
			Object.entries(data[field]).forEach((v, k) => form_data.append(`${field}[${v[0]}]`, v[1]));
		} else {
			form_data.append(field, data[field]);
		}
	}

	return _fetch(url, { is_json, params: { method: 'POST', body: form_data }});
}

const sleep = (msec) => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), msec);
	});
}

const newElement = (html_str) => {
	const template = document.createElement('template');
	template.innerHTML = html_str.trim();
	return template.content.firstChild;
}

const newArrElements = (html_str) => {
	const template = document.createElement('template');
	template.innerHTML = html_str.trim();
	return [...template.content.childNodes];
}

const escape = (html_str) => {
	const template = document.createElement('span');
	template.textContent = html_str;
	return template.innerHTML;
}

const newStyle = (url) => {
	const style = document.createElement('style');
	const req = get(url);
	req.then((r) => {
		style.textContent = r.data;
		if (style.onload) {
			style.onload();
			style.onload = null;
		}
	});

	return style;
}

const g_util_task_queues = new Set();
const queueTask = (id, fn) => {
	let p = g_util_task_queues[id];
	if (!p) {
		p = g_util_task_queues[id] = Promise.resolve();
	}

	const new_p = async () => {
		await p;
		await fn();
	};

	g_util_task_queues[id] = new_p();
}

/* by Masih Jahangiri; taken from https://stackoverflow.com/a/59440528 */
const calculate_middle_color = (color1 = 'FF0000', color2 = '00FF00', ratio = 0) => {
	const hex = (color) => {
		const colorString = color.toString(16);
		return colorString.length === 1 ? `0${colorString}` : colorString;
	};

	const r = Math.ceil(
		parseInt(color2.substring(0, 2), 16) * ratio
		+ parseInt(color1.substring(0, 2), 16) * (1 - ratio),
	);
	const g = Math.ceil(
		parseInt(color2.substring(2, 4), 16) * ratio
		+ parseInt(color1.substring(2, 4), 16) * (1 - ratio),
	);
	const b = Math.ceil(
		parseInt(color2.substring(4, 6), 16) * ratio
		+ parseInt(color1.substring(4, 6), 16) * (1 - ratio),
	);

	return hex(r) + hex(g) + hex(b);
};

const align_dom = (elements, interval) => {
	let min_left = 99999;
	const sets = [];

	for (const el of elements) {
		const bounds = el.getBoundingClientRect();
		el._mg_left = bounds.left;
	}

	const sorted = [...elements].sort((a, b) => {
		if (a._mg_left == b._mg_left) return 0;
		return a._mg_left < b._mg_left ? 1 : -1;
	});

	let align_to = null;

	for (const el of sorted) {
		if (el.classList.contains('noalign')) {
			continue;
		}

		if (!align_to) {
			align_to = el;
			continue;
		}

		const diff = align_to._mg_left - el._mg_left;
		if (diff <= interval) {
			el.style.marginLeft = diff + (parseInt(el.style.marginLeft) || 0) + 'px';
		} else {
			align_to = el;
			const corr = interval - diff % interval;
			el._mg_left += corr;
			el.style.marginLeft = corr + (parseInt(el.style.marginLeft) || 0) + 'px';
		}
	}
}

const init_id_array = (arr, fallback) => {
	const obj_map = new Map();
	const ret = new Proxy(obj_map, {
		set(map, k, v) {
			if (v === undefined) {
				map.delete(k);
			} else {
				map.set(k, v);
			}
			return true;
		},
		get(map, k) {
			if (k === 'filter') {
				return function(fn) {
					let ret = [];
					for (const obj of map.values()) {
						if (fn(obj)) ret.push(obj);
					}
					return ret;
				}
			}
			if (k === 'map') {
				return function(fn) {
					let ret = [];
					for (const obj of map.values()) {
						ret.push(fn(obj));
					}
					return ret;
				}
			}
			if (k === 'find') {
				return function(fn) {
					for (const obj of map.values()) {
						if (fn(obj)) return obj;
					}
					return null;
				}
			}
			if (k === 'size') return map.size;
			if (k === Symbol.iterator) {
				return function *() {
					for (const obj of map.values()) yield obj;
				}
			}
			if (typeof map[k] === 'function') {
				return (...args) => Reflect.apply(map[k], map, args);
			}

			if (!map.has(k) && fallback) {
				return fallback[k];
			}
			return map.get(k);
		}
	});

	for (const obj of (arr || [])) {
		if (!obj) continue;
		obj_map.set(obj.id.toString(), obj);
	}

	return ret;
}

const get_obj_field = (o, path) => {
	for (const p of path) {
		if (typeof(o) !== 'object') {
			return undefined;
		}
		if (!(p in o)) {
			return undefined;
		}
		o = o[p];
	}
	return o;
}

const set_obj_field = (o, path, val) => {
	for (let p_idx = 0; p_idx < path.length - 1; p_idx++) {
		const p = path[p_idx];
		if (typeof(o[p]) !== 'object') {
			o[p] = isNaN(path[p_idx + 1]) ? {} : [];
		}
		o = o[p];
	}
	const f = path[path.length - 1];
	if (typeof(o[f]) === 'object') {
		if (val) {
			DB.apply_diff(o[f], val);
		} else {
			o[f] = null;
		}
	} else {
		if (val === null) {
			val = '';
		}
		o[f] = val;
	}

	return o[f];
}

const cleanup_arr = (arr) => {
	for (let i = arr.length - 1; i >= 0; i--) {
		if (!arr[i]) {
			arr.splice(i, 1);
		}

	}
}

const cleanup_id_arr = (arr) => {
	for (let i = arr.length - 1; i >= 0; i--) {
		if (!arr[i]?.id) {
			arr.splice(i, 1);
		}

	}
}

const print_pretty_name = (obj, altname) => {
	if (!obj) {
		return '(invalid)';
	}

	const name = escape(obj.name) || altname || '(unnamed)';

	/* pass the object through a dummy element to close all <span> tags */
	const valid_obj = document.createElement('span');
	valid_obj.innerHTML = name.replace(/\^([0-9a-fA-F]{6})/g, '<span style="color: #$1">') + ' ' + DB.serialize_id(obj.id);
	if (obj._removed) {
		valid_obj.style.textDecoration = 'line-through';
	}
	return valid_obj.outerHTML;
};

const get_wcf_css = () => {
	const styles = document.querySelectorAll('head > link[rel="stylesheet"]');
	for (const s of styles) {
		if (s.href.includes('style')) {
			return s;
		}
	}
	/* we shouldn't get here, but just in case */
	return styles[0];
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
				g_confirm_dom.classList.remove('nopadding');
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

let g_loading_wait;
const loading_wait = () => {
	if (g_loading_wait) {
		return;
	}

	g_loading_wait = newElement('<div class="spinner" style="visibility:visible; opacity:1;"><span class="icon icon48 fa-spinner"></span><span>Loading …</span></div>');
	document.body.append(g_loading_wait);
}

const loading_wait_done = () => {
	if (g_loading_wait) {
		g_loading_wait.remove();
		g_loading_wait = null;
	}
}
