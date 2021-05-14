/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['branches'] = new class {
	async init(args = {}) {
		await load_tpl(ROOT_URL + 'tpl/page/branches.tpl');
		this.tpl = new Template('tpl-page-branches');

		this.dom = document.createElement('div');
		/* hack for the HTMLSugar */
		this.shadow = document;
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		this.branch_colors = [];
		this.branch_colors[1] = 'orange';
		this.branch_colors[2] = 'lightgreen';
		this.branch_colors[3] = 'cornflowerblue';
		this.branch_colors[4] = 'indianred';

		let req;
		req = await get(ROOT_URL + 'project/admin/branches', { is_json: 1});
		this.branches = req.data;

		const data = await this.tpl.run({ page: this, branches: this.branches });

		this.dom.append(data);
		return this.dom;
	}
};
