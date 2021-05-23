/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class Projects {
	static instance;

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
}
