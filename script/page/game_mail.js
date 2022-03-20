/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['game_mail'] = new class {
	async init(args = {}) {
		await load_tpl(ROOT_URL + 'tpl/page/game_mail.tpl');
		this.tpl = new Template('tpl-page-game_mail');

		this.dom = document.createElement('div');
		this.shadow = this.dom.attachShadow({ mode: 'open' });
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		this.cur_branch_id = parseInt(args.id || 1);

		let req;
		req = await get(ROOT_URL + 'api/game/admin/pck_patches', { is_json: 1});
		this.patches = req.data;

		req = await get(ROOT_URL + 'api/project/admin/branches', { is_json: 1});
		this.branches = req.data;

		this.selected_branch = this.branches.find(b => b.id == this.cur_branch_id);
		this.projects = this.selected_branch.mergables;
		const mergables = this.projects.filter(p => !p.deferred);
		const deferred = this.projects.filter(p => p.deferred);

		for (const p of this.selected_branch.mergables) {
			p.can_be_merged = !!this.selected_branch.history.find(c => c.id == p.base_project_id);
		}

		for (const p of this.patches) {
			p.can_be_merged = !this.selected_branch.history.find(c => c.pck_patch_id == p.ID);
		}

		const data = await this.tpl.run({ page: this, branches: this.branches, patches: this.patches, mergables, deferred });

		const s = newStyle(get_wcf_css().href);
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.shadow.append(s);
		this.shadow.append(data);

		return this.dom;
	}

	async publish() {
		let ok;

		const branch_name = this.selected_branch.name.charAt(0).toUpperCase() + this.selected_branch.name.substring(1);
		ok = await confirm('Are you sure you want to publish <b>'+ branch_name + '</b>?');
		if (!ok) {
			return;
		}

		const b = this.selected_branch;
		const req = await post(ROOT_URL + 'api/project/admin/publish', { is_json: 1, data: { branch: b.id } });

		if (!req.ok) {
			notify('error', req.data.msg || 'Unexpected error, couldn\'t publish');
		} else {
			await this.set_motd();
			await sleep(1000);
			window.location.reload();
		}
	}

};
