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
}
