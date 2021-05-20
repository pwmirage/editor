/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class GameAdminPage {
	async init(args = {}) {
		await load_tpl(ROOT_URL + 'tpl/page/game_admin.tpl');
		this.tpl = new Template('tpl-page-game_admin');

		this.dom = document.createElement('div');

		this.shadow = this.dom.attachShadow({mode: 'open'});
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		let req;
		req = await post(ROOT_URL + 'project/admin/gamereq', { is_json: 1, data: {
			branch: 2, req: 'status', data: { faction: 1 }
		}});
		this.online_p = req.data;

		const styles = [];
		styles.push(newStyle(ROOT_URL + 'css/window.css'));

		this.style_promises = styles.map((s) => new Promise((resolve) => { s.onload = resolve; }));
		this.shadow.append(...styles);

		const data = await this.tpl.run({ page: this, online_p: this.online_p });
		this.shadow.append(data);

		return this.dom;
	}

	async show_char_info(id) {
		const char_page = new GameAdminCharPage();
		let req = confirm('<div class="loading-spinner"></div>', '', 'Character #' + id);
		await sleep(1);

		const char_page_dom = await char_page.init({ id });

		const content = g_confirm_dom.querySelector('.systemConfirmation > p');
		for (const c of content.children) { c.remove(); }

		content.append(char_page_dom);
		g_confirm_dom.classList.add('big');
		g_confirm_dom.classList.add('noconfirm');
	}
};
g_mg_pages['game_admin'] = new GameAdminPage();

class GameAdminCharPage {
	async init(args = {}) {
		await load_tpl(ROOT_URL + 'tpl/page/game_admin.tpl');
		await PWPreview.load_latest_db();
		this.tpl = new Template('tpl-page-game_admin-char-info');

		this.dom = document.createElement('div');

		this.shadow = this.dom.attachShadow({mode: 'open'});
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		let req;
		req = await post(ROOT_URL + 'project/admin/gamereq', { is_json: 1, data: {
			branch: 2, req: 'getrole', data: { id: args.id || 0 }
		}});
		this.player = req.data;

		const styles = [];

		this.style_promises = styles.map((s) => new Promise((resolve) => { s.onload = resolve; }));
		this.shadow.append(...styles);

		const data = await this.tpl.run({ page: this, p: this.player });
		this.shadow.append(data);

		return this.shadow;
	}

	static parse_date(timestamp) {
		const d = new Date(timestamp * 1000);
		return d.toLocaleDateString("en-US") + ' ' + d.toLocaleTimeString("en-US");
	}

	static parse_time_elapsed(seconds) {
		let ret = '';

		if (seconds >= 3600 * 24) {
			const d = Math.floor(seconds / (3600 * 24));
			ret += d + ' days, ';
			seconds -= d * 3600 * 24;
		}

		if (seconds >= 3600) {
			const h = Math.floor(seconds / 3600);
			ret += h + ' hours, ';
			seconds -= h * 3600;
		}

		if (seconds >= 60) {
			ret += Math.floor(seconds / 60) + ' minutes';
		}

		return ret;
	}

	static print_task_name(name) {
		return name.replace(/\^([0-9a-fA-F]{6})/g, '<span style="color: #$1">');
	}

	close() {
		this.dom.remove();
	}
};
g_mg_pages['game_admin@char-info'] = new GameAdminCharPage();
