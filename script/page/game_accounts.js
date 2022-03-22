/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['game_accounts'] = new class {
	static tpl = load_tpl_once('page/game_accounts.tpl');

	async init(args = {}) {
		await Promise.all([
			this.constructor.tpl,
			load_script(ROOT_URL + 'script/game_util.js?v=' + MG_VERSION),
		]);

		const tpl_f = await this.constructor.tpl;
		this.tpl = new Template(tpl_f.id);

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

		this.vote_points = this.accounts[0]?.vote_points || 0;

		this.gender_change_price = 1000;
		this.name_change_price = 1000;
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

	async open_character(id) {
		id = parseInt(id);
		const acc_id = id & ~0xF;
		const acc = this.accounts.find(a => a.id == acc_id);
		const role = acc.roles.find(r => r.id == id);

		this.tpl.reload('#character_dialogue', { account: acc, role });
		confirm(this.shadow.querySelector('#character_dialogue').innerHTML, '', 'Character: ' + role.name);
		g_confirm_dom.classList.add('noconfirm');
	}

	async change_gender(id) {
		id = parseInt(id);
		const acc_id = id & ~0xF;

		const acc = this.accounts.find(a => a.id == acc_id);
		const role = acc.roles.find(r => r.id == id);

		g_confirm_dom.querySelector('.dialogCloseButton').click();

		this.tpl.reload('#change_gender', { account: acc, role });
		let req = confirm(this.shadow.querySelector('#change_gender').innerHTML, '', 'Changing gender: ' + role.name);

		if (this.vote_points < this.gender_change_price) {
			g_confirm_dom.querySelector('.buttonPrimary').classList.add('disabled');
		} else {
			g_confirm_dom.querySelector('.buttonPrimary').classList.remove('disabled');
		}

		if (!(await req)) {
			return;
		}

		loading_wait();
		req = await post(ROOT_URL + 'api/game/vshop/buy', { is_json: 1, data: {
			id: 'change_gender',
			roleid: role.id,
		}});
		loading_wait_done();
		if (!req.ok) {
			notify('error', (req.data.err || 'Unexpected error occured. Please try again'));
			return;
		}

		notify('success', 'Gender changed!');
		this.vote_points -= this.gender_change_price;
		window.location.reload();
	}

	async change_name(id) {
		id = parseInt(id);
		const acc_id = id & ~0xF;

		const acc = this.accounts.find(a => a.id == acc_id);
		const role = acc.roles.find(r => r.id == id);

		g_confirm_dom.querySelector('.dialogCloseButton').click();

		let prevname = '';
		let errmsg = null;
		while (true) {
			this.tpl.reload('#change_name', { account: acc, role, errmsg, prevname });
			let req = confirm(this.shadow.querySelector('#change_name').innerHTML, '', 'Changing name: ' + role.name);

			if (this.vote_points < this.gender_change_price) {
				g_confirm_dom.querySelector('.buttonPrimary').classList.add('disabled');
			} else {
				g_confirm_dom.querySelector('.buttonPrimary').classList.remove('disabled');
			}

			if (!(await req)) {
				return;
			}

			const newname = g_confirm_dom.querySelector('input[name="name"]').value;

			loading_wait();
			req = await post(ROOT_URL + 'api/game/vshop/buy', { is_json: 1, data: {
				id: 'change_name',
				value: newname,
				roleid: role.id,
			}});
			loading_wait_done();
			if (req.ok) {
				notify('success', 'Name changed!');
				this.vote_points -= this.name_change_price;
				window.location.reload();
				return;
			}

			prevname = newname;
			errmsg = req.data.err || 'Unexpected error occured. Please try again';
		}
	}
}
