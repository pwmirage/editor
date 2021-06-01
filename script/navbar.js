/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

let g_navbar = null;

class Navbar {
	constructor(org_menu_dom) {
		this.org_menu_dom = org_menu_dom;
		this.dom = newElement('<ol class="boxMenu overlayed"></ol>');
		this.dom.onclick = (e) => {
			const par = e.path.find(p => p?.className && p.className.includes('boxMenuDepth'));
			if (!par) {
				return;
			}

			/* hide the menu */
			par.style.display = 'none';
			setTimeout(() => {
				par.style.display = '';
			}, 1);
		}

		this.org_menu_dom.parentNode.insertBefore(this.dom, this.org_menu_dom);

		const b = this.buttons = {};
		let tmp;
		let p;
		p = this.add_button(null, 'Project');

		b['proj_summary'] = this.add_button(p, 'Show summary');
		tmp = this.add_button(p, '');
		tmp.innerHTML = '<hr>';
		b['proj_modify'] = this.add_button(p, 'Modify');
		b['proj_save'] = this.add_button(p, 'Save');
		b['proj_publish'] = this.add_button(p, 'Publish');
		b['proj_rebase'] = this.add_button(p, 'Rebase');
		b['proj_test'] = this.add_button(p, 'Quick Test');

		if (!Editor.usergroups['maintainer']) {
			b['proj_test'].style.display = 'none';
		}

		b['editor'] = this.add_button(null, 'Editor');

		p = this.add_button(b['editor'], 'Change Map');
		p.onclick = async () => {
			const win = await MapChooserWindow.open({ });
		};

		p = this.add_button(b['editor'], 'Browse');
		b['browse'] = {};
		b['browse']['items'] = this.add_button(p, 'Items');
		b['browse']['npc_crafts'] = this.add_button(p, 'NPC Crafts');
		b['browse']['npc_sells'] = this.add_button(p, 'NPC Goods');
		b['browse']['triggers'] = this.add_button(p, 'Triggers');
		b['browse']['npcs'] = this.add_button(p, 'NPCs');
		b['browse']['monsters'] = this.add_button(p, 'Monsters');
		b['browse']['mines'] = this.add_button(p, 'Resources');
		b['browse']['tasks'] = this.add_button(p, 'Quests');

		p = this.add_button(b['editor'], 'New');
		b['new'] = {};
		b['new']['items'] = this.add_button(p, 'Item');
		b['new']['npc_crafts'] = this.add_button(p, 'NPC Crafts');
		b['new']['npc_sells'] = this.add_button(p, 'NPC Goods');
		b['new']['triggers'] = this.add_button(p, 'Trigger');
		b['new']['npcs'] = this.add_button(p, 'NPC');
		b['new']['monsters'] = this.add_button(p, 'Monster');
		b['new']['mines'] = this.add_button(p, 'Resource');
		b['new']['tasks'] = this.add_button(p, 'Quest');

		this.search = newElement('<div style="display: flex; align-items: center; padding-left: 15px;"><i class="fa fa-search" style="color: #fff;"></i><input type="text" style="margin-left: 5px;" placeholder="Quick search"></div>');
		this.dom.append(this.search);

		g_navbar = this;
	}

	add_button(parent, content) {
		const btn = newElement('<li><a href="javascript:void(0);" class="boxMenuLink"><span class="boxMenuLinkTitle">' + content + '</span></a></li>');
		if (!parent) {
			parent = this.dom;
		} else if (!parent.classList.contains('boxMenuHasChildren')) {
			parent.classList.add('boxMenuHasChildren');

			if (parent.parentNode.classList.contains('boxMenu')) {
				/* add a regular wcf expandable submenu at 0-depth */
				const sub_list = newElement('<ol class="boxMenuDepth1"></ol>');
				parent.append(sub_list);
				parent = sub_list;
			} else {
				/* add our custom submenu */
				parent.classList.add('mgSubmenu');
				const sub_list = newElement('<ol class="boxMenuDepth1"></ol>');
				parent.append(sub_list);
				let timeout = 0;
				parent.onmouseenter = (e) => {
					if (timeout) {
						clearTimeout(timeout);
						timeout = 0;
					}

					if (Navbar.last_hovered) {
						Navbar.last_hovered.classList.remove('hovered');
					}
					Navbar.last_hovered = parent;
					parent.classList.add('hovered');
				}
				parent.onmouseleave = (e) => {
					timeout = setTimeout(() => {
						if (!parent.matches('ol:hover')) {
							parent.classList.remove('hovered');
						}
					}, 500);
				}
				parent = sub_list;
			}
		} else {
			parent = parent.querySelector('ol');
		}
		parent.appendChild(btn);
		return btn;
	}

	reload() {
		const b = this.buttons;
		const is_author = Editor.current_project?.author_id == WCF.User.userID;
		const has_proj = !!db?.metadata[1]?.pid;

		b.proj_modify.onclick = () => Projects.instance.open_project_modify(Editor.current_project);
		b.proj_summary.onclick = async () => {
			const win = await HistoryWindow.open();
			win.maximize();
		}
		b.proj_save.onclick = () => PWDB.save(db, true);
		b.proj_rebase.onclick = () => Projects.instance.open_project_rebase(Editor.current_project);
		b.proj_publish.onclick = async () => {
			Editor.tpl.reload('#publish_project_dialogue', { project: Editor.current_project });
			const ok = await confirm(Editor.map_shadow.querySelector('#publish_project_dialogue').innerHTML, '', 'Publish project: ' + Editor.current_project.name);

			if (!ok) {
				return;
			}

			await PWDB.publish(db);
			const req = await get(ROOT_URL + 'api/project/' + Editor.current_project.id + '/info', { is_json: 1 });
			const req_log = await get(ROOT_URL + 'api/project/' + Editor.current_project.id + '/log', { is_json: 1 });
			if (!req.ok || !req_log.ok) {
				notify('error', 'Unexpected error while refreshing the project status. ' + (req.data.err || ''));
				return;
			}
			Editor.current_project = req.data;
			Editor.current_project.log = req_log.data;
			Editor.tpl.reload('#project-info', { project: Editor.current_project });
			Editor.map_shadow.querySelector('#project-info').classList.remove('collapsed');
		}

		b.proj_test.onclick = async () => {
			const ok = await PWDB.save(db, false);
			if (!ok) {
				return;
			}

			const pinfo = await PWDB.get_proj_info(db.metadata[1].pid);
			if (!pinfo.ok) {
				notify('error', 'Couldn\'t retrieve project data');
			}

			if (!pinfo.data.is_merged) {
				await PWDB.publish(db, false);
				await post(ROOT_URL + 'api/project/admin/' + pinfo.data.id + '/merge', { is_json: 1, data: { branch: 2 } }); /* test1 branch */
			} else {
				await post(ROOT_URL + 'api/project/admin/' + pinfo.data.id + '/quickmerge', { is_json: 1, data: { branch: 2 } }); /* test1 branch */

			}

			const req = await post(ROOT_URL + 'api/project/admin/publish', { is_json: 1, data: { branch: 2 } });
			if (req.ok) {
				notify('success', 'Changes applied, server restarted');

			} else {
				notify('error', req.data.msg || 'Unexpected error, couldn\'t restart the server');
			}
		}

		const set_enabled = (btn, enabled) => {
			if (enabled) {
				btn.classList.remove('disabled');
			} else {
				btn.classList.add('disabled');
				btn.onclick = null;
			}
		};

		set_enabled(b['proj_modify'], has_proj && (is_author || Editor.usergroups['maintainer']));
		set_enabled(b['proj_save'], has_proj && (is_author || Editor.usergroups['maintainer']));
		set_enabled(b['proj_publish'], has_proj && (is_author || Editor.usergroups['maintainer']));
		set_enabled(b['proj_rebase'], has_proj && (is_author || Editor.usergroups['maintainer']));

		for (const type in b['new']) {
			const btn = b['new'][type];

			btn.onclick = () => {
				const obj = db.new(type);
				const type_details = PWPreview.get_obj_type(obj);
				type_details.open_fn();
			};
		}

		b['new']['triggers'].onclick = () => {
			if (g_map.maptype.id == 'none') {
				MessageWindow.open({ title: 'Error', msg: 'You need to open a map first' });
				return;
			}

			const obj = db.new('triggers_' + g_map.maptype.id);
			const type_details = PWPreview.get_obj_type(obj);
			type_details.open_fn();
		};

		b['new']['items'].onclick = async () => {
			const win = await ItemTypeChooserWindow.open();
			const type = await win.wait();

			if (type == 0) {
				return;
			}

			const obj = db.new('items');
			db.open(obj);
			obj.type = type.id;
			db.commit(obj);

			const type_details = PWPreview.get_obj_type(obj);
			type_details.open_fn();
		};


		for (const type in b['browse']) {
			const btn = b['browse'][type];

			btn.onclick = async () => {
				const type_details = PWPreview.get_obj_type(db[type].values().next().value);
				const win = await SimpleChooserWindow.open({ title: type_details.name, items: db[type], maximized: false });
				win.onclick = (obj) => {
					const type_details = PWPreview.get_obj_type(obj);
					type_details.open_fn();
				};
			};
		}

		b['browse']['triggers'].onclick = async () => {
			if (g_map.maptype.id == 'none') {
				MessageWindow.open({ title: 'Error', msg: 'You need to open a map first' });
				return;
			}

			const win = await SimpleChooserWindow.open({ title: 'Triggers ' + g_map.maptype.name, items: db['triggers_' + g_map.maptype.id], maximized: false });
			win.onclick = (obj) => {
				const type_details = PWPreview.get_obj_type(obj);
				type_details.open_fn();
			};
		};
	}
}
