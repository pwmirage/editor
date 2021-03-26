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
			branch: 2, req: 'status'
		}});
		this.online_p = req.data;

		const styles = [];
		styles.push(newStyle(ROOT_URL + 'css/window.css'));
		styles.push(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		this.style_promises = styles.map((s) => new Promise((resolve) => { s.onload = resolve; }));
		this.shadow.append(...styles);

		const data = await this.tpl.run({ page: this, online_p: this.online_p });
		this.shadow.append(data);

		return this.dom;
	}

	async show_char_info(id) {
		const char_page = new GameAdminCharPage();
		const char_page_dom = await char_page.init({ id });

		document.body.append(char_page_dom);

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
		styles.push(newStyle(ROOT_URL + 'css/window.css'));
		styles.push(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		this.style_promises = styles.map((s) => new Promise((resolve) => { s.onload = resolve; }));
		this.shadow.append(...styles);

		const data = await this.tpl.run({ page: this, p: this.player });
		this.shadow.append(data);

		return this.dom;
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
