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
		b['proj_new'] = this.add_button(p, 'Create new');
		b['proj_save'] = this.add_button(p, 'Save');
		b['proj_publish'] = this.add_button(p, 'Publish');
		b['proj_rebase'] = this.add_button(p, 'Rebase');
		b['proj_share'] = this.add_button(p, 'Share');
		b['proj_test'] = this.add_button(p, 'Quick Test');

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
		const has_proj = !!db?.metadata[1]?.pid;

		b.proj_new.onclick = () => CreateProjectWindow.open();
		b.proj_summary.onclick = () => HistoryWindow.open();
		b.proj_save.onclick = () => PWDB.save(db, true);
		b.proj_publish.onclick = () => PWDB.publish(db);
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
				await post(ROOT_URL + 'project/admin/' + pinfo.data.id + '/merge', { is_json: 1, data: { branch: 2 } }); /* test1 branch */
			} else {
				await post(ROOT_URL + 'project/admin/' + pinfo.data.id + '/quickmerge', { is_json: 1, data: { branch: 2 } }); /* test1 branch */

			}

			const req = await post(ROOT_URL + 'project/admin/publish', { is_json: 1, data: { branch: 2 } });
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

		set_enabled(b['proj_save'], has_proj);
		set_enabled(b['proj_publish'], has_proj);
		set_enabled(b['proj_rebase'], has_proj);
		set_enabled(b['proj_share'], has_proj);

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
	}
}
