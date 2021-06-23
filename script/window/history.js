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

		this.show_removed_only = this.args.show_removed_only || false;

		const data = await this.tpl.run({ win: this });
		shadow.append(data);


		await super.init();
	}

	tpl_compile_cb(dom) {
		const refresh_el = dom.querySelector('.header > .menu > .refresh');
		if (refresh_el) {
			refresh_el.onclick = async () => {
				this.tpl.reload('#changes');
			};
		}
		const changed_objs_dom = dom.querySelector('#changed-objects');
		if (changed_objs_dom) {
			let cur_generation = 0;
			const mod_objects = new Set();

			for (let gen = db.changelog.length - 1; gen >= db.project_changelog_start_gen; gen--) {
				const changeset = db.changelog[gen];
				for (const diff of changeset) {
					mod_objects.add(diff._db.obj);
				}
			}

			for (const obj of mod_objects) {
				if (!obj._db.project_initial_state ||
						obj._db.type == 'metadata' ||
						obj._db.type == 'npc_tasks_in' ||
						obj._db.type == 'npc_tasks_out' ||
						obj._db.type == 'recipes') {
					continue;
				}

				if (obj._removed) {
					if (this.show_removed_only) {
						if (obj._db.changesets[1]._db.generation < db.project_changelog_start_gen) {
							continue;
						}
					} else {
						if (obj._db.changesets[1]._db.generation >= db.project_changelog_start_gen) {
							continue;
						}
					}
				} else if (this.show_removed_only) {
					continue;
				}

				const diff = DB.get_obj_diff(obj, obj._db.project_initial_state);
				if (!diff) {
					continue;
				}

				const type = PWPreview.get_obj_type(obj);

				const change_el = document.createElement('div');
				change_el.onclick = () => type.open_fn();

				const header_el = document.createElement('div');
				header_el.className = 'header';

				const img_el = document.createElement('img');
				img_el.src = PWPreview.get_obj_img(db, obj);
				header_el.append(img_el);

				const span_el = document.createElement('span');
				span_el.textContent = (obj.name || type.name) + ' ' + DB.serialize_id(obj.id);
				header_el.append(span_el);
				change_el.append(header_el);

				const diff_el = PWPreview.diff_tpl.run({ db, obj, diff, prev: obj._db.project_initial_state });
				change_el.append(diff_el);
				changed_objs_dom.append(change_el);

			}
		}

		super.tpl_compile_cb(dom);
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
