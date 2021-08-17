/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['game_accounts'] = new class {
	async init(args = {}) {
		await Promise.all([
			load_tpl(ROOT_URL + 'tpl/page/game_accounts.tpl'),
			load_script(ROOT_URL + 'script/game_util.js?v=' + MG_VERSION),
		]);

		this.tpl = new Template('tpl-game-accounts');

		this.dom = document.createElement('div');
		this.shadow = this.dom.attachShadow({mode: 'open'});
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		this.branch_colors = [];
		this.branch_colors[1] = 'orange';
		this.branch_colors[2] = 'lightgreen';
		this.branch_colors[3] = 'cornflowerblue';
		this.branch_colors[4] = 'indianred';

		let req;
		req = await get(ROOT_URL + 'api/game/accounts', { is_json: 1});
		this.accounts = req.data;

		const data = await this.tpl.run({ page: this });

		const s = newStyle(get_wcf_css().href);
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.shadow.append(s);
		this.shadow.append(data);

		await s_p;
		return this.dom;
	}

	async register_acc() {
		let req = confirm(this.shadow.querySelector('#register_acc_dialogue').innerHTML, '', 'Register new in-game account');
		if (!(await req)) {
			return;
		}

		const name = g_confirm_dom.querySelector('input[name="name"]').value;
		const pass1 = g_confirm_dom.querySelector('input[name="pass"]').value;
		const pass2 = g_confirm_dom.querySelector('input[name="pass2"]').value;

		if (!name || !pass1 || !pass2) {
			notify('error', 'All fields must be filled in');
			return;
		}

		if (pass1 != pass2) {
			notify('error', 'Passwords don\'t match');
			return;
		}

		req = await post(ROOT_URL + 'api/game/accounts/new', { is_json: 1, data: {
			name, pass: pass1
		}});
		if (!req.ok) {
			notify('error', (req.data.err || 'Unexpected error occured. Please try again'));
			return;
		}

		notify('success', 'Account registered');

		req = await get(ROOT_URL + 'api/game/accounts', { is_json: 1});
		this.accounts = req.data;
		this.tpl.reload('#accounts');
	}

	async change_pass(acc_id) {
		acc_id = parseInt(acc_id);
		const acc = this.accounts.find(a => a.id == acc_id);

		this.tpl.reload('#change_pass_dialogue', { account: acc });
		let req = confirm(this.shadow.querySelector('#change_pass_dialogue').innerHTML, '', 'Change password for acc: ' + escape(acc.name));
		if (!(await req)) {
			return;
		}

		const pass1 = g_confirm_dom.querySelector('input[name="pass"]').value;
		const pass2 = g_confirm_dom.querySelector('input[name="pass2"]').value;

		if (!pass1 || !pass2) {
			notify('error', 'All fields must be filled in');
			return;
		}

		if (pass1 != pass2) {
			notify('error', 'Passwords don\'t match');
			return;
		}


		req = await post(ROOT_URL + 'api/game/accounts/' + acc.id + '/editpass', { is_json: 1, data: {
			pass: pass1
		}});
		if (!req.ok) {
			notify('error', (req.data.err || 'Unexpected error occured. Please try again'));
			return;
		}

		notify('success', 'Password changed');
	}
}
