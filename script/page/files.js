/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['files'] = new class {
	async init(args = {}) {
		await load_tpl(ROOT_URL + 'tpl/page/files.tpl');
		this.tpl = new Template('tpl-page-files');

		this.dom = document.createElement('div');
		this.pid = parseInt(args.pid);

		/* hack for the HTMLSugar */
		this.shadow = document;
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		let req;
		req = await get(ROOT_URL + 'project/admin/files', { is_json: 1});
		this.files = req.data;

		req = await get(ROOT_URL + 'project/admin/branches', { is_json: 1});
		this.branches = req.data;

		const data = await this.tpl.run({ page: this, branches: this.branches, files: this.files });
		this.dom.append(data);

		this.select_tab(0);
		return this.dom;
	}

	select_tab(idx) {
		this.selected_idx = idx;
		for (const c of this.dom.querySelectorAll('.tabs > .active')) {
			c.classList.remove('active');
		}

		this.dom.querySelector('.tabs').children[idx].classList.add('active');

		for (const c of this.dom.querySelectorAll('.tabcontents > .active')) {
			c.classList.remove('active');
		}
		this.dom.querySelector('.tabcontents').children[idx].classList.add('active');
	}

	async save() {
		const branch = this.branches[this.selected_idx];
		const text = this.dom.querySelector('.tabcontents').children[this.selected_idx].querySelector('textarea').value;
		let json;

		try {
			json = JSON.parse(text);
		} catch (e) {
			notify('error', 'Not valid json! ' + e);
			return;
		}

		const req = await post(ROOT_URL + 'project/admin/files', { is_json: 1, data: { branch: branch.id, files: JSON.stringify(json) }});
		if (req.ok) {
			notify('success', branch.name + ' saved.');
		} else {
			notify('error', 'Error. ' + (req.data.err || ''));
		}



	}

};
