/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const _fetch = async (url, { params, is_json }) => {
	const resp = await fetch(url, params);

	if (!is_json) {
		resp.data = await resp.text();
		if (!resp.ok) {
			return resp;
		}
	} else {
		try {
			resp.data = await resp.json();
			if (!resp.ok) {
				return resp;
			}

			return resp;
		} catch (e) {
			console.error(e);
			console.error(resp.data);
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

	form_data.append('t', g_security_key);
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
