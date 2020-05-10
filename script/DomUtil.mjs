/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const newElement = (html_str) => {
	const template = document.createElement('template');
	template.innerHTML = html_str.trim();
	return template.content.firstChild;
}

const newArrElements = (html_str) => {
	const template = document.createElement('template');
	template.innerHTML = html_str.trim();
	return template.content.childNodes;
}

const escape = (html_str) => {
	const template = document.createElement('span');
	template.textContent = html_str;
	return template.innerHTML;
}

export {
	newElement, newArrElements,
	escape,
};
