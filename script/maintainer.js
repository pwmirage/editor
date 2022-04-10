/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Maintainer {
	static async approve({ pid, revision }) {
		let ok;

		ok = await confirm('Are you sure you want to approve this project?');
		if (!ok) {
			return;
		}

		const req = await post(ROOT_URL + 'api/project/maintainer/' + parseInt(pid) + '/approved', { is_json: 1, data: { revision } });
		if (req.ok) {
			notify('success', 'Project Approved');
		} else {
			notify('error', 'Error occured! ' + (req.data.msg || ''));
		}
	}

	static async mark_needs_changes({ pid, revision }) {
		let ok;

		ok = await confirm('Are you sure you want to set "Needs changes" on this project?');
		if (!ok) {
			return;
		}

		const req = await post(ROOT_URL + 'api/project/maintainer/' + parseInt(pid) + '/needs_changes', { is_json: 1, data: { revision } });
		if (req.ok) {
			notify('info', 'Project Updated');
		} else {
			notify('error', 'Error occured! ' + (req.data.msg || ''));
		}
	}

	static async show_award_mg_points(username, post_id) {
		const tpl_f = await load_tpl_once('award_mg_points.tpl');
		const tpl = new Template(tpl_f.id);
		tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		let req = confirm('<div class="loading-spinner"></div>', '', 'Award Bounty Points');
		const char_page_dom = await tpl.run({ username, post_id });

		const content = g_confirm_dom.querySelector('.systemConfirmation > p');
		for (const c of content.children) { c.remove(); }

		content.append(char_page_dom);

		if (!(await req)) {
			return;
		}

		const points = parseInt(g_confirm_dom.querySelector('.points').value);
		const msg = g_confirm_dom.querySelector('.message').value;

		loading_wait();
		req = await post(ROOT_URL + 'api/bounty/award', { is_json: 1, data: {
			points,
			msg,
			post: post_id,
		}});
		loading_wait_done();

		if (!req.ok) {
			notify('error', (req.data.err || 'Unexpected error occured. Please try again'));
			return;
		}

		notify('success', 'Points sent!');
	}
}

document.awardMgPoints = (el) => {
	const username = el.dataset.userName;
	const post_id = el.dataset.postId;
	Maintainer.show_award_mg_points(username, post_id);
	return false;
};