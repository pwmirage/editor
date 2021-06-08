/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['files'] = new class {
	async init(args = {}) {
		await load_tpl(ROOT_URL + 'tpl/page/files.tpl');
		this.tpl = new Template('tpl-page-files');

		this.dom = document.createElement('div');
		this.pid = parseInt(args.pid);

		this.shadow = this.dom.attachShadow({ mode: 'open' });
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		this.DateUtil = await new Promise((resolve) => {
			require(['DateUtil'], (DateUtil) => {
				resolve(DateUtil);
			});
		});

		let req;
		req = await get(ROOT_URL + 'api/game/admin/files', { is_json: 1});
		this.files = req.data;

		req = await get(ROOT_URL + 'api/project/admin/branches', { is_json: 1});
		this.branches = req.data;

		for (const b of this.branches) {
			b.files = JSON.parse(b.files || []);
		}

		this.selected_branch = this.branches.find(b => b.name == 'test1');

		const data = await this.tpl.run({ page: this });
		const s = newStyle(get_wcf_css().href);
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.shadow.append(s);
		this.shadow.append(data);

		return this.dom;
	}

	tpl_compile_cb(dom) {
		HTMLSugar.process(dom, this);
		/* force reload all time tags */
		if (dom.id == 'files' || dom.querySelector('#files')) {
			require(['WoltLabSuite/Core/Date/Time/Relative', 'Dom/ChangeListener'], (TimeRelative, DomChangeListener) => {
				if (TimeRelative.setElements) {
					TimeRelative.setElements(dom.querySelectorAll('time'));
				}
				DomChangeListener.trigger();
			});
		}
	}

	async refresh_files() {
		let req;
		req = await get(ROOT_URL + 'api/game/admin/files', { is_json: 1});
		this.files = req.data;

		this.tpl.reload('#files');
	}

	async update_file(id) {
		id = parseInt(id);
		const file = this.files.find(f => f.id == id);

		this.tpl.reload('#file_upload_dialogue', { patchfile: file, file: null });
		let req = confirm(this.shadow.querySelector('#file_upload_dialogue').innerHTML, '', 'Update file: ' + file.name);
		if (!(await req)) {
			return;
		}

		if (!this.file) {
			notify('error', 'No file selected');
			return;
		}

		const url = g_confirm_dom.querySelector('input[name="url"]').value;

		req = await post(ROOT_URL + 'api/game/admin/update_file', { is_json: 1, data: {
			id, url, file: this.file
		}});
		if (req.ok) {
			notify('success', file.name + ' updated.');
			this.refresh_files();
		} else {
			notify('error', 'Error. ' + (req.data.err || ''));
		}
	}

	select_file() {
		const f = g_confirm_dom.querySelector('input[type="file"]');
		f.oninput = () => {
			this.file = f.files[0];
			this.tpl.reload('#file_upload_dialogue .file_drop', { file: this.file }, { el: g_confirm_dom.querySelector('.file_drop') });
		}
		f.click();
	}

	on_file_clear() {
		this.tpl.reload('#file_upload_dialogue .file_drop', { file: null }, { el: g_confirm_dom.querySelector('.file_drop') });
	}

	on_file_drop(e) {
		e.preventDefault();

		const file = (() => {
			if (e.dataTransfer.items) {
				for (let i = 0; i < e.dataTransfer.items.length; i++) {
					/* If dropped items aren't files, reject them */
					if (e.dataTransfer.items[i].kind === 'file') {
						return e.dataTransfer.items[i].getAsFile();
					}
				}
			}

			return e.dataTransfer.files[0];
		})();

		this.file = file;
		this.tpl.reload('#file_upload_dialogue.file_drop', { file }, { el: g_confirm_dom.querySelector('.file_drop') });
	}

	async select_branch(id) {
		id = parseInt(id);
		const branch = this.branches.find(b => b.id == id);

		this.selected_branch = branch;
		this.tpl.reload('#branch');
	}

	async update_branch_file(id) {
		id = parseInt(id);
		const file = this.files.find(f => f.id == id);
		const bfile = this.selected_branch.files.find(f => f.name == file.name);

		bfile.sha256 = file.sha256;
		bfile.url = file.url;
		this.tpl.reload('#branch');
	}

	async save() {
		const branch = this.selected_branch;

		const req = await post(ROOT_URL + 'api/game/admin/files', { is_json: 1, data: { branch: branch.id, files: JSON.stringify(branch.files) }});
		if (req.ok) {
			notify('success', branch.name + ' saved.');
		} else {
			notify('error', 'Error. ' + (req.data.err || ''));
		}



	}

};
