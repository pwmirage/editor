/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class CreateProjectWindow extends Window {
	static is_open = false;
	static loaded = load_tpl(ROOT_URL + 'tpl/window/project.tpl');
	async init() {
		await CreateProjectWindow.loaded;
		if (CreateProjectWindow.is_open) {
			return;
		}
		CreateProjectWindow.is_open = true;
		this.tpl = new Template('tpl-create-project');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run( { win: this, maps: PWMap.maps });
		this.shadow.append(data);

		await super.init();
		this.move((Window.bounds.right - Window.bounds.left - this.dom_win.offsetWidth) / 2,
				(Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight) / 2);
		return true;
	}

	close() {
		CreateProjectWindow.is_open = false;
		super.close();
	}

	oninput(name_el) {
		if (name_el.value.length) {
			this.shadow.querySelector('#submit').classList.remove('disabled');
		} else {
			this.shadow.querySelector('#submit').classList.add('disabled');
		}
	}

	async submit() {
		const name = this.shadow.querySelector('#name').value;
		let req = await post(ROOT_URL + 'project/new', { is_json: 1, data: { name } });
		if (!req.ok) {
			this.shadow.querySelector('#err').textContent = req.data.err || 'Unexpected error occured';
			if (this.err_fade_timeout) {
				clearTimeout(this.err_fade_timeout);
			}
			this.err_fade_timeout = setTimeout(() => {
				this.shadow.querySelector('#err').textContent = '';
			}, 8000);
			return;
		}
		const new_project = req.data[0];

		const cur_project = db.metadata[1];
		const data = db.dump_last(0);
		localStorage.removeItem('pwdb_lchangeset_' + cur_project.pid);

		if (data == '[]') {
			return;
		}

		req = await post(ROOT_URL + 'project/' + new_project.pid + '/save', {
			is_json: 1, data: {
				file: new File([new Blob([data])], 'project.json', { type: 'application/json' }),
			}
		});
		if (!req.ok) {
			Loading.notify('error', 'Project created, but failed to transfer the changes: ' + (req.data.err || 'Unknown error'));
			const dump = db.dump_last(0);
			localStorage.setItem('pwdb_lchangeset_' + project.pid, dump);
			return;
		}

		await notify('info', 'Project created');
		await sleep(2000);
		await Editor.open({ pid: new_project.pid });
	}
}
