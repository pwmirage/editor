/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class Projects {
	static instance;

	static type = [
		{ id: 0, name: 'Enhancement', color: 'brown' },
		{ id: 1, name: 'Fix', color: 'purple' },
	];

	static status = [
		{ id: 0, name: 'New', color: 'black' },
		{ id: 1, name: 'Awaiting Review', color: 'black' },
		{ id: 2, name: 'Ready For Testing', color: 'green' },
		{ id: 3, name: 'Merged', color: 'blue' },
		{ id: 4, name: 'Needs Changes', color: 'red' },
		{ id: 5, name: 'Abandoned', color: 'black' },
	];

	static async load() {
		const p = Projects.instance = new Projects();
		await p.load();
		return p;
	}

	tpl_compile_cb(dom) {
		HTMLSugar.process(dom, this);

		const spinner = dom.querySelector('.spinner');
		if (spinner) {
			setTimeout(() => {
				spinner.classList.add('active');
			}, 200);
		}

		/* force reload all time tags */
		require(['WoltLabSuite/Core/Date/Time/Relative', 'Dom/ChangeListener'], (TimeRelative, DomChangeListener) => {
			if (TimeRelative.setElements) {
				TimeRelative.setElements(this.shadow.querySelectorAll('time'));
			}
			DomChangeListener.trigger();
		});
	}

	async load() {
		await load_tpl(ROOT_URL + 'tpl/projects.tpl');
		this.tpl = new Template('tpl-projects');

		this.dom = document.createElement('div');

		this.shadow = this.dom.attachShadow({ mode: 'open' });
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		this.list = [];
		let req;

		req = await post(ROOT_URL + 'api/project/list', { is_json: 1, data: { type: 'recent' }});
		this.recent = req.data;

		Projects.DateUtil = await new Promise((resolve) => {
			require(['DateUtil'], (DateUtil) => {
				resolve(DateUtil);
			});
		});

		const data = await this.tpl.run({ projects: this });
		const s = newStyle(get_wcf_css().href);
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.shadow.append(s);
		this.shadow.append(data);

		await s_p;

		this.shadow.append(data);

		const tabname = localStorage.getItem('projects_list_tab') || 'my';
		this.select_tab(tabname);
	}

	async select_tab(name) {
		this.cur_tab = name;
		const data = {};
		let req;

		data.type = name;

		this.tpl.reload('.categories');
		this.tpl.reload('.loading', { loading: true });
		req = await post(ROOT_URL + 'api/project/list', { is_json: 1, data });
		this.list = req.data;

		localStorage.setItem('projects_list_tab', name);
		this.tpl.reload('.projects-container', { loading: false });
	}

	async new_project() {
		let req = await post(ROOT_URL + 'api/project/new', { is_json: 1 });

		if (!req.ok) {
			notify('error', 'Couldn\'t create the project: ' + (req.data.err || ''));
			return;
		}

		return Editor.open_project(req.data.id);
	}

	async refresh_projects() {
		await this.select_tab(this.cur_tab);
	}

	async onclick_project_dots(el, e, pid) {
		const project = this.list.find(p => p.id == pid);

		const b = el.getBoundingClientRect();
		const win = await RMenuWindow.open({
		x: b.left - 40, y: b.bottom - 5, bg: false,
		entries: [
			{ id: 1, name: 'Modify', visible: this.cur_tab != 'trashed' },
			{ id: 2, name: 'Open in new tab' },
			{ id: 3, name: 'Move to trash', visible: this.cur_tab != 'trashed' },
			{ id: 4, name: 'Restore', visible: this.cur_tab == 'trashed' },
		]});
		win.dom.remove();
		document.querySelector('#pageContainer').append(win.dom);
		const sel = await win.wait();
		switch (sel) {
			case 1: {
				this.tpl.reload('#modify_project_dialogue', { project });
				const ok = await confirm(this.shadow.querySelector('#modify_project_dialogue').innerHTML, '', 'Modify project: ' + project.name);

				if (!ok) {
					break;
				}

				const name = g_confirm_dom.querySelector('input[name="name"]').value;
				const type = parseInt(document.querySelector('input[name="type"]:checked')?.value || 0);

				if (project.name == name && project.type == type) {
					/* no changes */
					break;
				}

				const req = await post(ROOT_URL + 'api/project/' + project.id + '/rename', { is_json: 1, data: { name, type }});
				if (!req.ok) {
					notify('error', req.data.err || 'Unexpected error occurred');
					break;
				}
				project.name = name;
				project.type = type;
				project.last_edit_time = Math.floor(Date.now() / 1000);
				this.tpl.reload('.projects');
				break;
			}
			case 2: {
				const popup  = window.open("about:blank", "_blank");
				popup.location = ROOT_URL + '?id=' + project.id;
				break;
			}
			case 3: {
				const ok = await confirm('Are you sure you want to move project <b>"' + escape(project.name) + '"</b> to trash?', '');
				if (!ok) {
					break;
				}

				const req = await post(ROOT_URL + 'api/project/' + project.id + '/trash', { is_json: 1, data: { trash: 1 }});
				if (!req.ok) {
					notify('error', req.data.err || 'Unexpected error occurred');
					break;
				}

				await this.refresh_projects();
				break;
			}
			case 4: {
				const req = await post(ROOT_URL + 'api/project/' + project.id + '/trash', { is_json: 1, data: { trash: 0 }});
				if (!req.ok) {
					notify('error', req.data.err || 'Unexpected error occurred');
					break;
				}

				await this.refresh_projects();
				break;
			}
		}
	}
}
