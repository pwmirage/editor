/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

const g_open_triggers = new Set();
const g_trigger_tpl = load_tpl(ROOT_URL + 'tpl/window/trigger.tpl');

class TriggerWindow extends Window {
	async init() {
		this.trigger = this.obj = this.args.trigger;
		if (!this.args.debug && g_open_triggers.has(this.triger)) return false;
		g_open_triggers.add(this.trigger);

		await g_trigger_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-trigger');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, trigger: this.trigger });
		shadow.append(data);

		return await super.init();
	}

	print_obj_name(obj) {
		if (obj._db.type == 'tasks') {
			return 'Task: ' + (obj.name || '') + ' ' + DB.serialize_id(obj.id);
		}

		const spawner = obj;
		const type = spawner.groups?.[0]?.type;
		const spawned = db.npcs[type] || db.monsters[type] || db.mines[type];
		return 'Spawner: ' + (spawned?.name || '') + ' ' + DB.serialize_id(spawner.id);
	}
}
