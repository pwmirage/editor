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

		let req;
		req = await get(ROOT_URL + 'project/admin/branches', { is_json: 1});
		const branches = this.branches = req.data;

		req = await get(ROOT_URL + 'project/admin/mergable', { is_json: 1});
		const projects = req.data;

		const mergables = req.data.filter(p => !p.deferred);
		const deferred = req.data.filter(p => p.deferred);

		const data = await this.tpl.run({ page: this, branches, mergables, deferred });
		this.dom.append(data);
		return this.dom;
	}

	async defer(id, do_defer) {
		id = parseInt(id);
		do_defer = 0 + do_defer;
		const req = await post(ROOT_URL + 'project/admin/' + id + '/defer', { is_json: 1, data: { defer: do_defer } });

		if (!req.ok) {
			notify('error', req.data.msg || 'Unexpected error, couldn\'t defer');
		} else {
			window.location.reload();
		}
	}

	async merge(id, revision) {
		let ok;

		let tpl = `
<select class="branch" style="margin-top: 8px;">
<option value="0" selected="true">(Select one)</option>
`;
		for (const b of this.branches) {
			tpl += '<option value="' + b.id + '">' + b.name.charAt(0).toUpperCase() + b.name.slice(1) + '</option>';
		}
		tpl += '</select>';

		ok = await confirm('Merge to:', tpl);
		if (!ok) {
			return;
		}

		const branch_id = parseInt(g_confirm_dom.querySelector('.branch').value);
		if (!branch_id) {
			return;
		}

		const branch = this.branches.find(b => b.id == branch_id);
		
		const req = await post(ROOT_URL + 'project/admin/' + id + '/merge', { is_json: 1, data: { revision, branch, branch: branch.name, branch_project_id: branch.project_id} });

		if (!req.ok) {
			notify('error', req.data.msg || 'Unexpected error, couldn\'t merge');
		} else {
			window.location.reload();
		}
	}
};
