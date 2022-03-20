/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['rebase'] = new class {
	async init(args = {}) {
		await load_tpl('page/rebase.tpl');
		this.tpl = new Template('page/rebase.tpl');

		this.dom = document.createElement('div');
		if (!args.project) {
			this.dom.innerHTML = '<span>You need to create a project first</span>';
			return this.dom;
		}

		/* hack for the HTMLSugar */
		this.shadow = document;
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		this.project = args.project;

		let req;
		req = await get(ROOT_URL + 'api/project/branches', { is_json: 1});
		this.branches = req.data;

		req = await post(ROOT_URL + 'api/project/list', { is_json: 1, data: { type: 'published' }});
		this.projects = req.ok ? req.data : [];

		const data = await this.tpl.run({ page: this, project: this.project, branches: this.branches, projects: this.projects });
		this.dom.append(data);

		return this.dom;
	}

	onsearch(val) {
		this.search_val = val;
		if (this.search_timeout) {
			clearTimeout(this.search_interval);
		}
		this.search_timeout = setTimeout(async () => {
			if (this.search_val != val) {
				return;
			}

			const req = await post(ROOT_URL + 'api/project/list', { is_json: 1, data: { name: val, type: 'published' }});

			if (this.search_val != val) {
				return;
			}
			this.projects = req.data;
			this.tpl.reload('.search-projects', { projects: this.projects });
			const pid = this.dom.querySelector('input[name="base"]:checked');
			if (pid) {
				this.dom.querySelector('.buttonPrimary').classList.remove('disabled');
			} else {
				this.dom.querySelector('.buttonPrimary').classList.add('disabled');
			}
		}, 1500);
	}

	onradio(sel_radio) {
		this.sel_radio = sel_radio;
		if (sel_radio.checked && sel_radio.value != 'current') {
			this.dom.querySelector('.buttonPrimary').classList.remove('disabled');
		} else {
			this.dom.querySelector('.buttonPrimary').classList.add('disabled');
		}
	}

	async rebase() {
		const base = this.sel_radio;

		g_confirm_dom.querySelector('.dialogCloseButton').click();
		await new Promise(resolve => setTimeout(resolve, 1));

		const ok = await confirm('Do you want to rebase \"' + this.project.name + '" on "' + this.sel_radio.dataset.fname + '"?');
		if (!ok) {
			return;
		}

		const req = await post(ROOT_URL + 'api/project/' + this.project.id + '/rebase', { is_json: 1, data: { base: base.value }});
		if (req.ok) {
			await notify('Rebased');
			window.location.reload();
		} else {
			await notify('error', req.data.err || 'Unexpected error occured');
		}
	}
};
