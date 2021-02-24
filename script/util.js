/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const _fetch = async (url, { params, is_json }) => {
	const resp = await fetch(url, params);

	if (!is_json) {
		resp.data = '';
		if (!resp.ok) {
			return resp;
		}
		resp.data = await resp.text();
	} else {
		try {
			resp.data = await resp.json();
			if (!resp.ok) {
				return resp;
			}

			return resp;
		} catch (e) {
			console.error(e);
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
	for (field in data) {
		form_data.append(field, data[field]);
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

const serialize_db_id = (id) => {
	const p = id < 0x80000000 ? 0 : Math.floor((id - 0x80000000) / 0x100000);
	const i = id % 0x100000;

	return '#' + p + ':' + i;
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

	for (const obj of arr) {
		if (!obj) continue;
		obj_map.set(obj.id.toString(), obj);
	}

	return ret;
}
