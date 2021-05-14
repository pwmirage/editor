/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['pck_patches'] = new class {
	async init(args = {}) {
		await load_tpl(ROOT_URL + 'tpl/page/pck_patches.tpl');
		this.tpl = new Template('tpl-pck-patches');

		this.dom = document.createElement('div');
		this.cur_branch_id = parseInt(args.branch || 1);

		this.shadow = this.dom.attachShadow({ mode: 'open' });
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		let req;
		req = await get(ROOT_URL + 'project/admin/pck_patches', { is_json: 1});
		this.patches = req.data;

		req = await get(ROOT_URL + 'project/admin/branches', { is_json: 1});
		this.branches = req.data;

		this.branch_colors = [];
		this.branch_colors[1] = 'orange';
		this.branch_colors[2] = 'lightgreen';
		this.branch_colors[3] = 'cornflowerblue';
		this.branch_colors[4] = 'indianred';

		this.pck_filenames = [];
		this.pck_filenames[0] = 'shaders';
		this.pck_filenames[1] = 'models';
		this.pck_filenames[2] = 'trees';
		this.pck_filenames[3] = 'configs';
		this.pck_filenames[4] = 'surfaces';
		this.pck_filenames[5] = 'script';
		this.pck_filenames[6] = 'textures';
		this.pck_filenames[7] = 'sfx';
		this.pck_filenames[8] = 'loddata';
		this.pck_filenames[9] = 'litmodels';
		this.pck_filenames[10] = 'grasses';
		this.pck_filenames[11] = 'interfaces';
		this.pck_filenames[12] = 'gfx';
		this.pck_filenames[13] = 'facedata';
		this.pck_filenames[14] = 'fonts';
		this.pck_filenames[15] = 'building';

		const data = await this.tpl.run({ page: this, branches: this.branches, patches: this.patches });
		const s = newStyle(get_wcf_css().href);
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.shadow.append(s);
		this.shadow.append(data);

		await s_p;
		return this.dom;
	}

	print_size(bytes) {
		const kb = Math.floor(bytes / 1024);
		const mb = Math.floor(kb / 1024);

		if (mb) {
			return mb + 'MB';
		} else if (kb) {
			return kb + 'KB';
		} else {
			return bytes + 'B';
		}
	}

	async update_branch_head(id) {
		const req = await post(ROOT_URL + 'project/admin/files', { is_json: 1, data: { branch: branch.id, files: JSON.stringify(json) }});
		if (req.ok) {
			notify('success', branch.name + ' saved.');
		} else {
			notify('error', 'Error. ' + (req.data.err || ''));
		}
	}

	async new_patch() {
		this.tpl.reload('#new_patch_dialogue .file_drop', { file: null });
		let req = confirm(this.shadow.querySelector('#new_patch_dialogue').innerHTML, '', 'Upload new patch');
		if (!(await req)) {
			return;
		}

		if (!this.file) {
			notify('error', 'Missing file');
			return;
		}

		const pck = g_confirm_dom.querySelector('select[name="pck"]').value;
		const name = g_confirm_dom.querySelector('input[name="name"]').value;
		const description = g_confirm_dom.querySelector('textarea[name="description"]').value;

		if (!pck || !name) {
			notify('error', 'Fill in all fields');
			return;
		}

		req = await post(ROOT_URL + 'project/admin/new_pck_patch', { is_json: 1, data: {
			file: this.file, pck, name, description
		}});
		if (req.ok) {
			notify('success', 'Patch added.');
		} else {
			notify('error', 'Error. ' + (req.data.err || ''));
		}

		req = await get(ROOT_URL + 'project/admin/pck_patches', { is_json: 1});
		this.patches = req.data;
		this.tpl.reload('#patches', { patches: this.patches });
	}

	async remove_patch(id) {
		id = parseInt(id);
		const patch = this.patches.find(p => p.ID == id);
		let ok = await confirm('Are you sure you want to remove <b>' + patch.name + '</b>?');
		if (!ok) {
			return;
		}

		let req;

		req = await post(ROOT_URL + 'project/admin/find_pck_patch', { is_json: 1, data: {
			patch: id
		}});
		if (!req.ok) {
			notify('error', 'Error. ' + (req.data.err || ''));
			return;
		}

		if (req.data?.length) {
			const branches = req.data.map(id => this.branches.find(b => b.id == id));

			let msg = 'Patch <b>' + patch.name + '</b> is still used by following branches:<br><ul style="list-style: inside; text-transform: capitalize; font-weight: bold;">';

			for (const b of branches) {
				msg += '<li>' + b.name + '</li>';
			}

			msg += '</ul><br>Are you sure you want to continue?';
			ok = await confirm(msg);
			if (!ok) {
				return;
			}
		}

		req = await post(ROOT_URL + 'project/admin/remove_pck_patch', { is_json: 1, data: {
			patch: id
		}});
		if (req.ok) {
			notify('success', 'Patch removed.');
		} else {
			notify('error', 'Error. ' + (req.data.err || ''));
		}

		req = await get(ROOT_URL + 'project/admin/pck_patches', { is_json: 1});
		this.patches = req.data;
		this.tpl.reload('#patches', { patches: this.patches });
	}

	select_file() {
		const f = g_confirm_dom.querySelector('input[type="file"]');
		f.oninput = () => {
			this.file = f.files[0];
			this.tpl.reload('#new_patch_dialogue .file_drop', { file: this.file }, { el: g_confirm_dom.querySelector('.file_drop') });
		}
		f.click();
	}

	on_file_clear() {
		this.tpl.reload('#new_patch_dialogue .file_drop', { file: null }, { el: g_confirm_dom.querySelector('.file_drop') });
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
		this.tpl.reload('#new_patch_dialogue .file_drop', { file }, { el: g_confirm_dom.querySelector('.file_drop') });
	}

	on_file_drag(e) {
		e.preventDefault();
	}
};
