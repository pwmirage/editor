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
	const linkElem = document.createElement('link');
	linkElem.setAttribute('rel', 'stylesheet');
	linkElem.setAttribute('type', 'text/css');
	if (url) linkElem.setAttribute('href', url);
	return linkElem;
}

/* onclick callback for collapsible html elements */
function collapsible_toggle(el) {
	el.classList.toggle("active");
	const content = el.nextElementSibling;
	if (content.style.maxHeight){
		content.style.maxHeight = null;
	} else {
		content.style.maxHeight = content.scrollHeight + "px";
	}
}
