/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class ObjsetWindow extends SingleInstanceWindow {
	static tpl = load_tpl(ROOT_URL + 'tpl/window/objset.tpl');
	async init() {
		this.objset = this.obj = this.args.obj;

		await ObjsetWindow.tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-objset');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, obj: this.obj, objset: this.obj });
		shadow.append(data);

		return await super.init();
	}

	print_obj_name(obj, details) {
		if (obj._db.type.startsWith('spawners_')) {
			const spawner = obj;
			const type = spawner.groups?.[0]?.type;
			const spawned = db.npcs[type] || db.monsters[type] || db.mines[type];
			return 'Spawner: ' + (spawned?.name || '') + ' ' + DB.serialize_id(spawner.id);
		}

		return (obj.name || details.name) + ' ' + DB.serialize_id(obj.id);
	}

	onresize() {
		const width = this.dom_win.offsetWidth;
		if (width < 320) {
			this.dom_win.classList.add('narrow');
		} else {
			this.dom_win.classList.remove('narrow');
		}
	}

	focus_btn(btn) {
		const prev = btn.parentNode.parentNode.querySelector('.focused');
		if (prev) {
			prev.classList.remove('focused');
		}

		btn.classList.add('focused');
	}

	select_btn(btn) {
		btn.classList.toggle('selected');
	}

	remove_obj(type, id) {
		const eobj = db[type][id];

		PWDB.remove_objset_entry(this.obj, eobj);
		this.tpl.reload('#entries');
	}
}
