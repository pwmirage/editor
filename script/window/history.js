/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_history_tpl = load_tpl(ROOT_URL + 'tpl/window/history.tpl');
class HistoryWindow extends Window {
	async init() {
		await g_history_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-history');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this });
		shadow.append(data);

		await super.init();

		this.select_tab(1);
	}

	tpl_compile_cb(dom) {
		super.tpl_compile_cb(dom);
	}

	select_tab(idx) {
		for (const c of this.shadow.querySelectorAll('.tabs > .active')) {
			c.classList.remove('active');
		}

		this.shadow.querySelector('.tabs').children[idx].classList.add('active');

		for (const c of this.shadow.querySelectorAll('.tabcontents > .active')) {
			c.classList.remove('active');
		}
		this.shadow.querySelector('.tabcontents').children[idx].classList.add('active');
	}

	used_by(obj) {
		let usages = PWDB.find_usages(db, obj);
		let ret = '';

		if (usages.length > 0) {
			ret += '(used by ' + (usages[0].name || 'NPC') + ' ' + DB.serialize_id(usages[0].id);
			if (usages.length > 1) {
				ret += ' and ' + (usages.length - 1) + ' more';
			}
			ret += ')';
		}
		return ret;
	}

	get_project(changeset) {
		for (const c of changeset) {
			if (c.id == 1 && c._db.type == 'metadata') {
				return c;
			}
		}
		return undefined;
	}

	find_previous(diff, fn) {
		const obj = diff._db.obj;
		const changelog = obj._db.changesets;


		for (let i = changelog.length - 1; i > 0; i--) {
			const d = changelog[i];
			if (d._db.generation < diff._db.generation && fn(d)) {
				return d;
			}
		}

		return changelog[0];
	}

	filter_previous(diff, fn) {
		const obj = diff._db.obj;
		const changelog = obj._db.changesets;
		const ret = [];

		for (let i = changelog.length - 1; i > 0; i--) {
			const d = changelog[i];
			if (d._db.generation < diff._db.generation && fn(d)) {
				ret.push(d);
			}
		}

		if (ret.length == 0) {
			ret.push(changelog[0]);
		}
		return ret;
	}


	collapse(el) {
		el.classList.toggle("active");
		const content = el.nextElementSibling;
		if (content.style.maxHeight){
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = content.scrollHeight + "px";
		}
	}

}
