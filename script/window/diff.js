/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class DiffWindow extends Window {
	static _tpl_id = 'window/diff.tpl';

	async init() {
		this.obj = this.args.obj;
		this.prev = this.args.prev;
		this.prev_gen = this.args.prev_gen;
		this.diff = DB.get_obj_diff(this.obj, this.prev);

		const data = await this.tpl.run({ win: this, obj: this.obj, prev: this.prev, diff: this.diff, prev_gen: this.prev_gen });
		this.shadow.append(data);

		const diff = PWPreview.diff({ db, obj: this.obj, diff: this.diff, prev: this.prev, prev_gen: this.prev_gen });
		diff.style.overflowY = 'auto';
		this.shadow.querySelector('.content').append(diff);
		await super.init();
	}
}
