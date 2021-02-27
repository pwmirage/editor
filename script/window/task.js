/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

const g_open_tasks = new Set();
const g_task_tpl = load_tpl(ROOT_URL + 'tpl/window/task.tpl');

class TaskWindow extends Window {
	async init() {
		this.task = this.args.task;
		if (!this.args.debug && g_open_tasks.has(this.task)) return false;
		g_open_tasks.add(this.task);

		await g_task_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-task');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, task: this.task });
		shadow.append(data);

		await super.init();
	}
}
