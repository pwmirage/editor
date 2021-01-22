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
		this.branches = req.data;

		this.selected_branch = this.branches[0];

		for (const b of this.branches) {
			for (const p of b.mergables) {
				p.can_be_merged = !!b.history.find(c => c.id == p.base_project_id);
			}
		}

		const data = await this.tpl.run({ page: this, branches: this.branches, mergables: [], deferred: [] });

		this.dom.append(data);
		await this.on_merge_branch_change(this.selected_branch.id);

		this.select_tab(0);
		return this.dom;
	}

	select_tab(idx) {
		for (const t of this.dom.querySelectorAll('.tab')) {
			t.style.display = 'none';
		}
		for (const t of this.dom.querySelectorAll('.tabMenu > ul > *')) {
			t.className = ''
		}

		this.dom.querySelectorAll('.tab')[idx].style.display = '';
		this.dom.querySelectorAll('.tabMenu > ul > *')[idx].className = 'active ui-state-active';
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
		this.projects = this.selected_branch.mergables;
		const mergables = this.projects.filter(p => !p.deferred);
		const deferred = this.projects.filter(p => p.deferred);

		this.tpl.reload('.mgContent', { mergables, deferred });
		this.select_tab(0);
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
		const req = await post(ROOT_URL + 'project/admin/' + id + '/merge', { is_json: 1, data: { revision, branch: b.id} });

		if (!req.ok) {
			notify('error', req.data.msg || 'Unexpected error, couldn\'t merge');
		} else {
			window.location.reload();
		}
	}

	async unmerge(id) {
		const project = this.selected_branch.history.find(p => p.id == id);
		let ok;

		const branch_name = this.selected_branch.name.charAt(0).toUpperCase() + this.selected_branch.name.substring(1);
		ok = await confirm('Are you sure you want to undo merging <b>' + project.name + '</b> from <b>' + branch_name + '</b>?');
		if (!ok) {
			return;
		}
		
		const b = this.selected_branch;
		const req = await post(ROOT_URL + 'project/admin/' + id + '/unmerge', { is_json: 1, data: { branch: b.id} });

		if (!req.ok) {
			notify('error', req.data.msg || 'Unexpected error, couldn\'t merge');
		} else {
			window.location.reload();
		}
	}


	async sync_branches(source_id, dest_id) {
		const source = this.branches.find(b => b.id == source_id);
		const dest = this.branches.find(b => b.id == dest_id);

		if (source.history?.[0]?.commit_id != source.head_id) {
			notify('warning', '<b>' + dest.name + '</b> contains non published changes!');
			return;
		}

		const projects = [];
		const project_htmls = [];
		for (const p of source.history) {
			if (dest.history.find(dp => dp.id == p.id)) {
				break;
			}

			if (!p.id || p.is_removed) {
				continue;
			}

			projects.push(p);
			project_htmls.push('<li><b>' + p.name + '</b> #' + p.id + '</li>');
		}

		if (projects.length == 0) {
			notify('warning', 'No projects to pull from "' + dest.name + '"');
			return;
		}

		const combined_html = '<ol style="list-style: decimal; margin-left: 20px;">' + project_htmls.reverse().reduce((combined, val) => combined + val) + '</ol>';
		const branch_name = dest.name.charAt(0).toUpperCase() + dest.name.substring(1);
		const ok = await confirm('Are you sure you want to merge following projects to <b>' + branch_name + '</b>?',combined_html);
		if (!ok) {
			return;
		}

		for (const p of projects.reverse()) {
			const req = await post(ROOT_URL + 'project/admin/' + p.id + '/merge', { is_json: 1, data: { revision: p.revision, branch: dest.id } });

			if (!req.ok) {
				notify('error', req.data.msg || 'Unexpected error, couldn\'t merge ' + p.id);
				return;
			}
		}

		window.location.reload();
	}

	async set_motd() {
		const motd = this.dom.querySelector('#motd').value;
		const req = await post(ROOT_URL + 'project/admin/motd', { is_json: 1, data: { branch: this.selected_branch.id, motd } });
	}

	async publish() {
		let ok;

		const branch_name = this.selected_branch.name.charAt(0).toUpperCase() + this.selected_branch.name.substring(1);
		ok = await confirm('Are you sure you want to publish <b>'+ branch_name + '</b>?');
		if (!ok) {
			return;
		}

		const b = this.selected_branch;
		const req = await post(ROOT_URL + 'project/admin/publish', { is_json: 1, data: { branch: b.id } });

		if (!req.ok) {
			notify('error', req.data.msg || 'Unexpected error, couldn\'t publish');
		} else {
			window.location.reload();
		}
	}

};
