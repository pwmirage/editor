/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['game_vshop'] = new class {
	async init(args = {}) {
		await Promise.all([
			load_tpl(ROOT_URL + 'tpl/page/game_vshop.tpl'),
			load_script(ROOT_URL + 'script/game_util.js?v=' + MG_VERSION),
		]);

		this.tpl = new Template('tpl-game-vshop');

		this.dom = document.createElement('div');
		this.shadow = this.dom.attachShadow({mode: 'open'});
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		let req;
		req = await get(ROOT_URL + 'api/game/accounts', { is_json: 1});
		this.accounts = req.data;

		this.vote_points = this.accounts[0]?.vote_points || 0;

		req = await get(ROOT_URL + 'project/cache/public/vshop.json?v=' + MG_VERSION, { is_json: 1 });
		this.tabs = { 'All': [] };

		for (const t of req.data) {
			this.tabs[t.title] = t.items;
			this.tabs['All'].push(...t.items);
		}

		req = await get(ROOT_URL + 'latest_db/get/items/' + this.tabs['All'].filter(i => i.id > 0).map(i => i.id).join(','), { is_json: 1 });
		this.all_items = init_id_array(req.data);

		for (const i of this.tabs['All']) {
			if (i.id <= 0) {
				continue;
			}
			i.icon = this.all_items[i.id].icon;
		}

		this.tab_all = this.tabs['All'];
		this.cur_tab = 'All';
		const data = await this.tpl.run({ page: this });

		const s = newStyle(get_wcf_css().href);
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.shadow.append(s);
		this.shadow.append(data);

		await s_p;
		return this.dom;
	}

	select_tab(name) {
		this.cur_tab = name;
		this.tpl.reload('#chooser');
		this.tpl.reload('#page');
		this.shadow.querySelector('#search').value = '';
		this.tabs['All'] = this.tab_all;
	}

	onsearch_input(e, el) {
		if (el.value) {
			const search = el.value.toLowerCase();
			this.tabs['All'] = this.tab_all.filter(r => r.name.toLowerCase().includes(search));
		} else {
			this.tabs['All'] = this.tab_all;
		}
		this.cur_tab = 'All';
		this.tpl.reload('#chooser');
		this.tpl.reload('#page');
	}

	onrolesearch_input(e, el) {
		this.role_search_val = el.value.toLowerCase();
		this.tpl.reload('#accounts');
	}

	select_role(el, id) {
		this.selected_role_id = id;
		for (const el of this.shadow.querySelectorAll('.role.selected')) {
			el.classList.remove('selected');
		}
		el.classList.add('selected');
	}

	async buy_item(item_id, cost) {
		if (!this.selected_role_id) {
			let req = confirm('You need to select a character first.', '', 'Error');
			await sleep(1);
			g_confirm_dom.classList.add('noconfirm');
			return;
		}

		const item = this.tabs['All'].find(i => i.id == item_id);
		item.cost = cost;

		const role_id = this.selected_role_id;
		const role = this.accounts.find(a => a.id == (role_id & (~0xf)))
			.roles.find(r => r.id == role_id);

		this.tpl.reload('#buy_dialogue', { item, role });
		let req = confirm(this.shadow.querySelector('#buy_dialogue').innerHTML, '', 'Confirm purchase');
		await sleep(1);
		const amount_el = g_confirm_dom.querySelector('input[name="amount"]');
		let amount = 0;
		let remaining_points = 0;
		amount_el.oninput = (e) => {
			if (!amount_el.value || parseInt(amount_el.value) <= 0) {
				amount_el.value = '1';
			} else if (parseInt(amount_el.value) > 999) {
				amount_el.value = '999';
			}
			amount = parseInt(amount_el.value);
			remaining_points = this.vote_points - item.cost * amount;
			g_confirm_dom.querySelector('.price').textContent = item.cost * amount;
			g_confirm_dom.querySelector('.remaining').innerHTML = remaining_points;

			g_confirm_dom.querySelector('.remaining').innerHTML = 
				remaining_points >= 0 ?
				remaining_points :
				'<span style="color: red;">' + remaining_points + '</span>';

			g_confirm_dom.querySelector('.wrning').innerHTML = 
				remaining_points >= 0 ?
				'The item will be character bound.' :
				'<span style="color: red; font-weight: bold;">You don\'t have enough points.</span>';

			if (remaining_points < 0 || (item.minlevel ?? 0) > role.level) {
				g_confirm_dom.querySelector('.buttonPrimary').classList.add('disabled'); 
			} else {
				g_confirm_dom.querySelector('.buttonPrimary').classList.remove('disabled'); 
			}
		};
		amount_el.oninput();
		if (!(await req) || remaining_points < 0) {
			return;
		}

		loading_wait();
		req = await post(ROOT_URL + 'api/game/vshop/buy', { is_json: 1, data: {
			id: item.id,
			amount: amount,
			roleid: role.id,
		}});
		loading_wait_done();
		if (!req.ok) {
			notify('error', (req.data.err || 'Unexpected error occured. Please try again'));
			return;
		}

		notify('success', 'Item sent!');
		this.vote_points = remaining_points;
		this.tpl.reload('#account-balance');
	}
}
