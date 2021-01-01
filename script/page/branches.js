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

		this.selected_branch = branches[0];

		req = await get(ROOT_URL + 'project/admin/mergable', { is_json: 1});
		const projects = this.projects = req.data;

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

	async on_merge_branch_change(branch_id) {
		this.selected_branch = this.branches.find(b => b.id == branch_id);

		this.tpl.reload('.mgContent');
	}

	async merge(id, revision) {
		const project = this.projects.find(p => p.id == id);
		let ok;

		const branch_name = this.selected_branch.name.charAt(0).toUpperCase() + this.selected_branch.name.substring(1);
		ok = await confirm('Are you sure you want to merge <b>' + project.name + '</b> to <b>' + branch_name + '</b>?');
		if (!ok) {
			return;
		}
		
		const b = this.selected_branch;
		const req = await post(ROOT_URL + 'project/admin/' + id + '/merge', { is_json: 1, data: { revision, branch: b.name, branch_project_id: b.project_id} });

		if (!req.ok) {
			notify('error', req.data.msg || 'Unexpected error, couldn\'t merge');
		} else {
			window.location.reload();
		}
	}
};
