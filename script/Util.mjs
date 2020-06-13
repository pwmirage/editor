/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

export const get = async (url, { is_json } = {}) => {
	const resp = await fetch(url, { method: 'GET', headers: {} });
	if (!resp.ok) {
		resp.data = {};
		return resp;
	}

	const data_txt = await resp.text();
	resp.data = data_txt;

	if (is_json) {
		try {
			resp.data = JSON.parse(data_txt);
			return resp;
		} catch (e) {
			console.error(e);
			console.error(data_txt);
			resp.data = {};
		}
	}
	return resp;
}

export const sleep = (msec) => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), msec);
	});
}

export const ROOT_URL = '/editor/';
export let VERSION = '0';

export const on_version_ready = get(ROOT_URL + 'version.php', { is_json: 1 }).then(r => {
	VERSION = r.data.mtime;
});
