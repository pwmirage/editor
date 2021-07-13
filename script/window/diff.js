/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

const g_diff_tpl = load_tpl(ROOT_URL + 'tpl/window/diff.tpl');
class DiffWindow extends Window {
	async init() {
		await g_diff_tpl;

		this.obj = this.args.obj;
		this.prev = this.args.prev;
		this.prev_gen = this.args.prev_gen;
		this.diff = DB.get_obj_diff(this.obj, this.prev);

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-diff-window');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, obj: this.obj, prev: this.prev, diff: this.diff, prev_gen: this.prev_gen });
		shadow.append(data);

		const diff = PWPreview.diff({ db, obj: this.obj, diff: this.diff, prev: this.prev, prev_gen: this.prev_gen });
		diff.style.overflowY = 'auto';
		shadow.querySelector('.content').append(diff);
		await super.init();
	}
}
