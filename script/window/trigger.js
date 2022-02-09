/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class TriggerWindow extends SingleInstanceWindow {
	static _tpl_id = 'window/trigger.tpl';

	async init() {
		this.trigger = this.obj = this.args.obj;

		await g_trigger_tpl;
		const shadow = this.dom.shadowRoot;
		const tpl_f = await this.constructor.tpl;
		this.tpl = new Template(tpl_f.id);
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
