/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class PWMap {
	static maps = {
		none: { name: '', id: 'none', tag: 0, size: { x: 0, y: 0 } },
		gs01: { name: 'Main World', id: 'gs01', tag: 1, size: { x: 4096, y: 5632 } },

		is05: { name: 'Firecrag Grotto', id: 'is05', tag: 105, size: { x: 512, y: 512 }, img_scale: 2 },
		is06: { name: 'Den of Rabid Wolves', id: 'is06', tag: 106, size: { x: 512, y: 512 }, img_off: { x: 318, y: 62 } },
		is07: { name: 'Cave of the Vicious', id: 'is07', tag: 107, size: { x: 512, y: 512 } },

		is02: { name: 'Secret Passage', id: 'is02', tag: 102, size: { x: 512, y: 512 } },
		is08: { name: 'Hall of Deception', id: 'is08', tag: 108, size: { x: 512, y: 512 } },

		is09: { name: 'Gate of Delirium', id: 'is09', tag: 109, size: { x: 512, y: 512 }, img_off: { x: 300, y: 300 } },
		is10: { name: 'Secret Frostcover Grounds', id: 'is10', tag:110, size: { x: 512, y: 512 }, img_off: { x: 64, y: 64 } },
		is11: { name: 'Valley of Disaster', id: 'is11', tag: 111, size: { x: 512, y: 512 }, img_off: { x: 201, y: 198 } },
		is12: { name: 'Forest Ruins', id: 'is12', tag: 112, size: { x: 512, y: 512 }, img_off: { x: 46, y: 46 } },
		is13: { name: 'Cave of Sadistic Glee', tag: 113, id: 'is13', size: { x: 512, y: 512 } },
		is14: { name: 'Wraithgate', id: 'is14', tag: 114, size: { x: 512, y: 512 } },
		is15: { name: 'Hallucinatory Trench', id: 'is15', tag:115, size: { x: 512, y: 512 }, img_off: { x: 122, y: 122 } },
		is16: { name: 'Eden', id: 'is16', tag: 116, size: { x: 512, y: 512 }, img_off: { x: 191, y: 191 } },
		is17: { name: 'Brimstone Pit', id: 'is17', tag: 117, size: { x: 512, y: 512 }, img_off: { x: 191 , y: 191 } },
		is18: { name: 'Temple of the Dragon', id: 'is18', tag: 118, size: { x: 512, y: 512 } },
		is19: { name: 'Nightscream Island', id: 'is19', tag: 119, size: { x: 512, y: 512 }, img_off: { x: 280, y: 280 } },
		is32: { name: 'Cube of Fate', id: 'is32', tag: 132, size: { x: 1536, y: 1536 } },

		is20: { name: 'Snake Isle', id: 'is20', tag: 120, size: { x: 512, y: 512 }, img_off: { x: 202, y: 281 } },

		is21: { name: 'Lothranis', id: 'is21', tag: 121, size: { x: 1024, y: 1024 }, img_off: { x: 250, y: 250 } },
		is22: { name: 'Momaganon', id: 'is22', tag: 122, size: { x: 1024, y: 1024 }, img_off: { x: 250, y: 250 } },
		is23: { name: 'Seat of Torment', id: 'is23', tag: 123, size: { x: 512, y: 512 }, img_off: { x: 217, y: 217 } },
		is24: { name: 'Abaddon', id: 'is24', tag: 124, size: { x: 512, y: 512 }, img_off: { x: 233, y: 233 } },
		a26b: { name: 'Palace of Nirvana', id: 'a26b', tag: 139, size: { x: 512, y: 512 }, img_off: { x: 68, y: 68 } },
		is27: { name: 'Lunar Glade', id: 'is27', tag: 127, size: { x: 512, y: 512 }, img_off: { x: 233, y: 233 } },
		is28: { name: 'Valley of Reciprocity', id: 'is28', tag: 128, size: { x: 512, y: 512 }, img_off: { x: 228, y: 228 } },
		is29: { name: 'Frostcover City', id: 'is29', tag: 129, size: { x: 512, y: 512 }, img_off: { x: 99, y: 99 } },
		is31: { name: 'Twilight Temple', id: 'is31', tag: 131, size: { x: 512, y: 512 } },

		is33: { name: 'Chrono City', id: 'is33', tag: 133, size: { x: 1024, y: 1024 } },

		is01: { name: 'City of Abominations', id: 'is01', tag: 101, size: { x: 512, y: 512 } },
		is25: { name: 'City of Naught', id: 'is25', tag: 125, size: { x: 512, y: 512 }, img_off: { x: 128, y: 128 } },
		is26: { name: 'Hall of Blasphemy', id: 'is26', tag: 126, size: { x: 512, y: 512 }, img_off: { x: 103, y: 103 } },
	};
	static maps_arr = init_id_array(Object.values(PWMap.maps).map(o => {
		const ret = Object.assign({}, o);
		ret.full_id = ret.id;
		ret.id = ret.tag;
		return ret;
	}));

	constructor() {
		this.maptype = null;
		this.shadow = null;
		this.bg = null;
		this.pos_label = null;
		this.map_bounds = null;
		/* map drag position / scroll */
		this.pos = { scale: 1, offset: { x: 0, y: 0} };

		this.drag = {
			mousedownorigin: { x: 0, y: 0 },
			origin: { x: 0, y: 0 },
			drag_button: -1,
			moved: false,
		};

		this.marker_img = {};
		this.hovered_spawner = null;
		this.focused_spawners = new Set();
		this.selected_spawners = new Set();
		this.hover_lbl = null;
		/* either an eye-candy artwork or real ingame terrain */
		this.show_real_bg = false;
		this.canvas_worker = null;
		this.canvas_msg_id = 1;

		this.mouse_pos = { x: -1, y: -1 };
		this.mouse_spawner_pos = { x: -1, y: -1 };
	}

	async refresh_focused_spawners() {
		await Promise.all([
			this.post_canvas_msg({
				type: 'set_selected_spawners',
				spawners: [...this.selected_spawners],
			})
		]);
		await this.redraw_dyn_overlay();
	}

	refresh_bg_img() {
		this.bg.src = ROOT_URL + 'data/images/map/' + this.maptype.id + (this.show_real_bg ? '_m' : '') + '.webp';
	}

	init() {
		if (this.initialized) {
			return;
		}

		this.shadow = document.querySelector('#pw-map').shadowRoot;
		this.canvas = this.shadow.querySelector('#pw-map-canvas');
		this.bg = this.canvas.querySelector('.bg');
		this.pw_map = this.canvas.querySelector('#pw-map');
		this.rotation_circle = this.shadow.querySelector('#rotate-circle');
		this.rotation_circle_dot = this.rotation_circle.querySelector('.dot');
		this.hover_lbl = this.shadow.querySelector('.label');
		this.pos_label = this.shadow.querySelector('#pw-map-pos-label');

		this.canvas_worker = new Worker(ROOT_URL + 'script/map_worker.js?v=' + MG_VERSION);
		const overlays = this.shadow.querySelectorAll('.dyn-canvas');
		for (let i = 0; i < overlays.length; i++) {
			const overlay = overlays[i];
			const offscreen = overlay.transferControlToOffscreen();
			this.canvas_worker.postMessage({ type: 'set_canvas', id: i, canvas: offscreen }, [offscreen]);
		}

		this.canvas_worker.addEventListener('message', (e) => {
			if (e.data.type == 'redraw') {
				const overlays = this.shadow.querySelectorAll('.dyn-canvas');
				const overlay = overlays[e.data.id];
				const prev_overlay = overlays[1 - e.data.id];

				const w = this.canvas_width = Math.floor(8/6 * this.canvas.offsetWidth);
				const h = this.canvas_height = Math.floor(8/6 * this.canvas.offsetHeight);
				for (const o of overlays) {
					if (o.styledWidth != w || o.styledHeight != h) {
						o.style.left = Math.floor(-1/6 * this.canvas.offsetWidth) + 'px';
						o.style.top = Math.floor(-1/6 * this.canvas.offsetHeight) + 'px';
						o.styledWidth = w;
						o.styledHeight = h;
						o.style.width = w + 'px';
						o.style.height = h + 'px';
					}
				}

				prev_overlay.classList.remove('shown');
				overlay.classList.add('shown');

			} else if (e.data.type == 'mouse') {
				const hovered = e.data.hovered_spawners;
				const spawners = hovered.map(s => db[s._dbtype][s.id]);

				this.hovered_spawners = spawners;
				if (spawners.length) {
					this.hover_lbl.style.left = (this.mouse_pos.x - this.map_bounds.left + 20) + 'px';
					this.hover_lbl.style.top = (this.mouse_pos.y - this.map_bounds.top - 10) + 'px';
				}

				this.hover_lbl.style.display = this.hovered_spawners.length ? 'block' : 'none';
				while (this.hover_lbl.firstChild) {
					this.hover_lbl.firstChild.remove();
				}

				for (const spawner of spawners) {
					if (this.hover_lbl.children.length > 2) {
						const div = document.createElement('div');
						div.style.textAlign = 'right';
						div.textContent = '... + ' + (spawners.length - 3) + ' more';
						this.hover_lbl.append(div);
						break;
					}

					const type = spawner.groups?.[0]?.type;
					const obj = db.npcs[type] || db.monsters[type] ||  db.mines[type];
					const name = spawner.name || obj?.name;

					const div = document.createElement('div');
					div.textContent = name;
					this.hover_lbl.append(div);
				}

				document.body.style.cursor = spawners.length ? 'pointer' : '';
			}
		});

		const last_pos = { x: -1, y: -1 };
		setInterval(() => {
			const pos = this.mouse_spawner_pos;
			if (!this.force_mouse_update && (last_pos.x == pos.x && last_pos.y == pos.y)) {
				return;
			}
			this.force_mouse_update = false;

			this.canvas_worker.postMessage({ type: 'mouse', x: pos.x, y: pos.y });
			last_pos.x = pos.x;
			last_pos.y = pos.y;
		}, 25);

		this.q_canvas = this.shadow.querySelector('#quick-canvas');
		this.select_menu = this.shadow.querySelector('#select-menu');

		this.select_menu.onclick = async (e) => {
			const x = e.clientX - Window.bounds.left;
			const y = e.clientY - Window.bounds.top;
			const b = this.select_menu.getBoundingClientRect();

			const win = await RMenuWindow.open({
			x: b.left - Window.bounds.left, y: b.top - 160 - Window.bounds.top, bg: false,
			entries: [
				{ id: 20, name: 'Edit' },
				{ id: 21, name: 'Move' },
				{ id: 22, name: 'Rotate' },
				{ id: 23, name: 'Unselect' },
				{ id: 24, name: 'Delete' },
			]});
			const sel = await win.wait();
			switch(sel) {
				case 23: {
					this.selected_spawners.clear();
					this.refresh_focused_spawners();
					break;
				}
				case 24: {
					for (const s of this.selected_spawners) {
						db.open(s);
						s._removed = true;
						db.commit(s);
					}
					break;
				}
			}
		};

		this.initialized = true;
	}

	post_canvas_msg(msg, transferable = []) {
		const msg_id = msg.msg_id = this.canvas_msg_id++;
		this.canvas_worker.postMessage(msg, transferable);
		return new Promise((resolve) => {
			const fn = (e) => {
				if (e.data.msg_id == msg_id) {
					this.canvas_worker.removeEventListener('message', fn);
					return resolve(e.data);
				}
			};

			this.canvas_worker.addEventListener('message', fn);
		});
	}

	reload_db() {
		this.modified_db_objs = new Set();

		const changed_objects_el = this.shadow.querySelector('#changed-objects');
		const changed_objects_more_el = this.shadow.querySelector('#more-objects');
		while (changed_objects_el.firstChild) {
			changed_objects_el.firstChild.remove();
		}

		changed_objects_more_el.onclick = () => HistoryWindow.open();

		this.check_overflown_changed_objs = () => {
			const last_button = changed_objects_el.lastChild;
			if (!last_button) {
				changed_objects_more_el.style.display = 'none';
				return;
			}
			const last_bounds = last_button.getBoundingClientRect();
			const objects_bounds = changed_objects_el.getBoundingClientRect();

			changed_objects_more_el.style.display = (last_bounds.y < objects_bounds.y) ? 'block' : 'none';
		};

		const changed_objects_map = PWMap.changed_objects_map = new Map();
		const set_modified_obj = (obj, diff) => {
			if (obj._db.type == 'metadata') {
				return;
			}

			if ((obj._db.type == 'npc_tasks_in' ||
				obj._db.type == 'npc_tasks_out') && obj.npc_id) {
				return;
			}

			if (obj._db.type == 'recipes') {
				/* we quietly integrate recipes into crafts */
				if (!obj.crafts || !db.npc_crafts[obj.crafts]) {
					/* unexpected? */
					return;
				}

				const is_diff = DB.is_obj_diff(obj, obj._db.project_initial_state);
				obj._db.is_diff = is_diff;

				/* modify crafts to show *their* marker instead */
				const crafts = db.npc_crafts[obj.crafts];
				let ref = 0;
				if (is_diff) {
					ref = 1;
				} else {
					for (let p = 0; p < 8; p++) {
						for (let i = 0; i < 32; i++) {
							const recipe_id = crafts?.pages?.[p]?.recipe_id?.[i];

							if (!recipe_id) {
								continue;
							}

							const r = db.recipes[recipe_id];
							if (!r || !r._db.project_initial_state) {
								continue;
							}

							if (r._db.is_diff) {
								ref = 1;
								p = 10;
								break;
							}
						}
					}
				}

				/* when extra_ref drops to 0, there will be no diff in crafts and its
				 * marker will disappear as well */
				db.open(crafts);
				crafts._extra_ref = ref;
				db.commit(crafts);
				return;
			}

			const was_modified = this.modified_db_objs.has(obj);
			if (was_modified && (diff.name !== undefined && was_modified
					|| diff._removed !== undefined)) {
				const mod_el = changed_objects_map.get(obj)
				mod_el.children[1].innerHTML = print_pretty_name(obj, mod_el.dataset.type_name);
			}

			if ((diff.targets !== undefined || diff.icon !== undefined || diff.type !== undefined) && was_modified) {
				const mod_el = changed_objects_map.get(obj)
				mod_el.children[0].src = PWPreview.get_obj_img(db, obj);
			}

			if (!was_modified) {
				const el = document.createElement('div');
				const img = document.createElement('img');
				const span = document.createElement('span');

				let { name, open_fn } = PWPreview.get_obj_type(obj);
				img.src = PWPreview.get_obj_img(db, obj);

				span.innerHTML = print_pretty_name(obj, name);
				el.appendChild(img);
				el.appendChild(span);
				el.onclick = open_fn;
				el.dataset.type_name = name;

				changed_objects_el.append(el);
				changed_objects_map.set(obj, el);

				this.check_overflown_changed_objs();
			}

			this.modified_db_objs.add(obj);
			if ((obj._removed && obj._db.is_allocated && obj._db.changesets[1]?._db?.generation >= db.project_changelog_start_gen) || !DB.is_obj_diff(obj, obj._db.project_initial_state)) {
				this.modified_db_objs.delete(obj);
				const el = changed_objects_map.get(obj);
				el.remove();
				changed_objects_map.delete(obj);
			}
		};

		for (let i = db.project_changelog_start_gen; i < db.changelog.length; i++) {
			for (const c of db.changelog[i]) {
				set_modified_obj(c._db.obj, {});
			}
		}

		if (db._map_commit_registered) {
			return;
		}

		db._map_commit_registered = true;
		db.register_commit_cb((obj, diff, prev_vals) => {
			set_modified_obj(obj, diff);

			if (!obj._db.type.startsWith('spawners_')) {
				return;
			}

			if (obj.type == 'npc') {
				/* always put spawner type in the diff */
				const changesets = obj._db.changesets;
				const last = changesets[changesets.length - 1];
				set_obj_field(last, [ 'groups', 0, 'type' ], obj?.groups?.[0]?.type || 0);
				last.type = obj.type;
			}

			if (obj.type == 'items') {
				/* ^ same with items */
				const changesets = obj._db.changesets;
				const last = changesets[changesets.length - 1];
				last.type = obj.type;
			}

			(async () => {
				if (!obj.type) {
					return;
				}

				const s = obj;
				await this.post_canvas_msg({ type: 'update_obj', obj:
						{ id: s.id, pos: s.pos, dir: s.dir, groups: s.groups,
						type: s.type, _dbtype: s._db.type,
						name: this.get_spawner_name(s)
						}, filtered: this.filter_spawner(s) });
				this.force_mouse_update = true;
				await this.redraw_dyn_overlay();
			})();
		});
	}

	reinit(mapid, keep_offset = false) {
		this.init();

		this.maptype = PWMap.maps[mapid];
		if (!this.maptype) {
			throw new Error('Map ' + mapid + ' doesn\'t exist');
		}

		const project_info = this.shadow.querySelector('#map-name');
		project_info.textContent = this.maptype.name;

		this.canvas.classList.remove('shown');

		let load_tag = null;
		if (this.maptype.id != 'none') {
			load_tag = Loading.show_tag('Loading ' + this.maptype.name + ' image');
		}

		return new Promise((resolve, reject) => {
			this.bg.onload = async () => {
				this.bg.onload = null;
				this.bg.onerror = null;

				this.map_bounds = this.canvas.getBoundingClientRect();

				const img_off = this.maptype.img_off || { x: 0, y: 0 };
				this.bg_scale = (this.bg.width - 2 * img_off.x) / this.maptype.size.x;
				this.bg.style.marginLeft = - img_off.x + 'px';
				this.bg.style.marginTop = - img_off.y + 'px';

				this.canvas.onmousedown = (e) => this.onmousedown(e);
				this.canvas.ondblclick = (e) => this.ondblclick(e);
				this.canvas.oncontextmenu = (e) => false;
				this.canvas.onwheel = (e) => this.onwheel(e);
				this.rotation_circle_dot.onmousedown = (e) => this.oncirclemousedown(e);

				const get_name = (spawner) => {
					let name;
					const type = spawner.groups[0]?.type || 0;

					let obj = null;
					if (spawner.type == 'resource') {
						obj = db.mines[type];
					} else {
						obj = db.npcs[type] || db.monsters[type];
					}

					return (obj?.name ?? "(unknown)") || "(unnamed)";
				}

				await this.post_canvas_msg({
					type: 'set_map',
					map: { size: this.maptype.size, bg_scale: this.bg_scale },
				});

				await this.post_canvas_msg({
					type: 'set_objs', obj_type: 'spawners',
					objs: db['spawners_' + this.maptype.id]?.map(s =>
						({ id: s.id, pos: s.pos, dir: s.dir, groups: s.groups,
						type: s.type, _dbtype: s._db.type, name: this.get_spawner_name(s) })) || []
				});

				const lwin = await LegendWindow.open({});
				lwin.filter();
				lwin.close();

				this.pos.scale = Math.min(
					this.map_bounds.width * 0.75 / (this.bg.width - img_off.x * 2),
					this.map_bounds.height * 0.75 / (this.bg.height - img_off.y * 2)
				);
				this.pos.scale *= this.maptype.img_scale || 1;
				this.pos.offset = {
					x: -(this.canvas.offsetWidth - (this.bg.width - 2 * img_off.x) * this.pos.scale) / 2,
					y: -(this.canvas.offsetHeight -  (this.bg.height - 2 * img_off.y) * this.pos.scale) / 2};

				await this.move_to(this.pos.offset);
				await this.onresize();
				this.canvas.classList.add('shown');

				if (load_tag) {
					Loading.hide_tag(load_tag);
				}
				resolve();
			};
			this.bg.onerror = reject;
			this.refresh_bg_img();
		});
	}

	close(clear_changed = true) {
		this.canvas.classList.remove('shown');

		if (clear_changed) {
			const changed_objects_el = this.shadow.querySelector('#changed-objects');
			const changed_objects_more_el = this.shadow.querySelector('#more-objects');
			while (changed_objects_el.firstChild) {
				changed_objects_el.firstChild.remove();
			}
			changed_objects_more_el.style.display = 'none';
		}
	}

	onmousedown(e) {
		e.preventDefault();
		const path = e.composedPath();
		this.drag.clicked_el = path[0];

		if (this.forced_map_focus && e.which != 2) {
			if (this.forced_map_focus_cb) {
				this.forced_map_focus_cb(e);
			}
			return;
		}

		if (this.drag.drag_button == -1) {
			this.drag.mousedownorigin.x = e.clientX;
			this.drag.mousedownorigin.y = e.clientY;
			this.drag.origin.x = e.clientX;
			this.drag.origin.y = e.clientY;
			this.drag.drag_button = e.which;
			this.drag.moved = false;
		}
	}

	onmousemove(e) {
		if (!this.map_bounds) {
			return;
		}

		if (this.drag.is_circle_drag) {
			const spawner = this.rotation_circle_spawner;
			const map_coords = this.mouse_coords_to_map(e.clientX, e.clientY);
			const spawner_pos = this.map_coords_to_spawner(map_coords.x, map_coords.y);

			const rad = Math.atan2(spawner_pos.y - spawner.pos[2], spawner_pos.x - spawner.pos[0]);
			const shown_rad = -rad + Math.PI / 2;

			this.rotation_circle_dot.style.transform = 'rotate(' + shown_rad + 'rad)';

			if (this.rotation_circle_update_fn) {
				this.rotation_circle_update_fn(rad + Math.PI / 2);
			}

			return true;
		}

		if (this.drag.drag_button) {
			if (e.clientX == this.drag.origin.x &&
					e.clientY == this.drag.origin.y) {
				/* no mouse movement */
				return false;
			}

			const new_offset = {
				x: this.pos.offset.x + (this.drag.origin.x - e.clientX),
				y: this.pos.offset.y + (this.drag.origin.y - e.clientY)
			};

			if (this.drag.drag_button == 2) {
				this.move_to(new_offset);
				this.redraw_dyn_overlay();
				e.preventDefault();
			} else if (this.drag.drag_button == 1) {
				this.redraw_q_canvas(e);
			}

			this.drag.origin.x = e.clientX;
			this.drag.origin.y = e.clientY;
			this.drag.moved = true;
		}

		if (this.canvas.matches('div:hover')) {
			const map_coords = this.mouse_coords_to_map(e.clientX, e.clientY);
			const spawner_pos = this.mouse_spawner_pos = this.map_coords_to_spawner(map_coords.x, map_coords.y);
			this.mouse_pos.x = e.clientX;
			this.mouse_pos.y = e.clientY;

			this.shadow.querySelector('#pw-map-pos-label').textContent = 'X: ' + parseInt(spawner_pos.x) + ', Y: ' + parseInt(spawner_pos.y);
		} else {
			if (this.hovered_spawners?.length) {
				this.hover_lbl.style.display = 'none';
				this.hovered_spawners = [];
				document.body.style.cursor = '';
			}
		}

		return e.defaultPrevented;
	}

	get_spawner_name(spawner) {
		const type = spawner.groups?.[0]?.type;
		const obj = db.npcs[type] || db.monsters[type] || db.mines[type];
		return obj?.name + ' ' + DB.serialize_id(spawner.id);
	};

	async ondblclick(e) {
		const spawners = this.hovered_spawners;
		if (e.which == 1 && spawners.length) {
			if (spawners.length == 1) {
				this.open_spawner(spawners[0], e);
			} else {
				let idx = 1;
				const entries = spawners.map(s => ({ name: this.get_spawner_name(s), id: idx++ }));
				const x = e.clientX - Window.bounds.left;
				const y = e.clientY - Window.bounds.top;
				const win = await RMenuWindow.open({
					x: x, y: y, bg: false, entries
				});
				const sel = await win.wait();
				if (sel > 0) {
					this.open_spawner(spawners[sel - 1], e);

				}
			}
		}
	}

	oncirclemousedown(e) {
		if (e.which != 1) {
			return;
		}

		this.drag.is_circle_drag = true;
		this.onmousedown(e);
	}

	force_map_focus(enable, cb) {
		if (enable) {
			Window.container.classList.add('force-map-focus');
			this.canvas.style.cursor = 'crosshair';
		} else {
			Window.container.classList.remove('force-map-focus');
			this.canvas.style.cursor = '';
		}
		this.forced_map_focus = enable;
		this.forced_map_focus_cb = cb;
	}

	show_rotation_circle(spawner, update_fn) {
		if (spawner) {
			let { x, y } = this.spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);

			this.rotation_circle.style.left = x + 'px';
			this.rotation_circle.style.top = y + 'px';
			this.rotation_circle.style.transform = 'translate(' + (-this.pos.offset.x) + 'px,' + (-this.pos.offset.y) + 'px)';
			const rad = Math.atan2(spawner.dir[2], spawner.dir[0]);
			this.rotation_circle_dot.style.transform = 'rotate(' + (-rad + Math.PI / 2) + 'rad)';
		}

		this.canvas.style.cursor = '';
		this.rotation_circle.style.display = spawner ? '' : 'none';
		this.rotation_circle_update_fn = update_fn;
		this.rotation_circle_spawner = spawner;
	}

	async open_spawner(spawner, e) {
		const win = await SpawnerWindow.open({ obj: spawner });

		win.onfocus = () => {
			this.focused_spawners.add(spawner);
			this.refresh_focused_spawners();
		};
		win.onfocus();
		win.onclose = () => {
			this.focused_spawners.delete(spawner);
			this.refresh_focused_spawners();
		};
	}

	onmouseup(e) {
		const mouse_pos = { x: e.clientX, y: e.clientY };
		const path = e.composedPath();
		if (this.drag.is_circle_drag) {
			this.drag.is_circle_drag = false;
			if (this.rotation_circle_update_fn) {
				this.rotation_circle_update_fn(null);
			}
		} else if (this.drag.drag_button == 3 && path[0] == this.drag.clicked_el) {
			const hovered_spawners = this.hovered_spawners;
			(async () => {
				const x = mouse_pos.x - Window.bounds.left;
				const y = mouse_pos.y - Window.bounds.top;
				const map_coords = this.mouse_coords_to_map(mouse_pos.x, mouse_pos.y);
				const spawner_pos = this.map_coords_to_spawner(map_coords.x, map_coords.y);

				const win = await RMenuWindow.open({
				x: x, y: y, bg: false,
				entries: [
					{ name: 'Spawner', visible: !!hovered_spawners?.length, children: [
						{ id: 10, name: 'Edit' },
						{ id: 11, name: 'Move' },
						{ id: 12, name: 'Rotate' },
						{ id: 13, name: 'Delete' },
					]},
					{ name: this.selected_spawners.size + ' selected', visible: this.selected_spawners.size > 1 || (this.selected_spawners.size == 1 && !hovered_spawners?.length), children: [
						{ id: 20, name: 'Edit' },
						{ id: 21, name: 'Move' },
						{ id: 22, name: 'Rotate' },
						{ id: 23, name: 'Unselect' },
						{ id: 24, name: 'Delete' },
					]},
					{ name: 'New', visible: !hovered_spawners?.length, children: [
						{ id: 31, name: 'NPC' },
						{ id: 32, name: 'Monster' },
						{ id: 33, name: 'Resource' },
					]},
					{ id: 1, name: 'Undo' },
				]});
				const sel = await win.wait();
				switch(sel) {
					case 10: {
						for (const s of hovered_spawners) {
							this.open_spawner(s, e);
						}
						break;
					}
					case 13: {
						for (const s of hovered_spawners) {
							db.open(s);
							s._removed = true;
							db.commit(s);
						}
						break;
					}
					case 23: {
						this.selected_spawners.clear();
						this.refresh_focused_spawners();
						break;
					}
					case 24: {
						for (const s of this.selected_spawners) {
							db.open(s);
							s._removed = true;
							db.commit(s);
						}
						break;
					}
					case 31:
					case 32: {
						const spawner = db.new('spawners_' + this.maptype.id);
						db.open(spawner);
						spawner.pos = [ spawner_pos.x, 0, spawner_pos.y ];
						spawner.type = sel == 31 ? 'npc' : 'monster';
						db.commit(spawner);
						break;
					}
					case 33: {
						const spawner = db.new('spawners_' + this.maptype.id);
						db.open(spawner);
						spawner.pos = [ spawner_pos.x, 0, spawner_pos.y ];
						spawner.type = 'resource';
						db.commit(spawner);
						break;
					}
					case 1: {
						console.log('undo');
						break;
					}
				}
			})();
		} else if (this.drag.drag_button == 2) {
			this.redraw_dyn_overlay();
		} else if (this.drag.drag_button == 1) {
			(async () => {

				const point_a = this.drag.mousedownorigin;
				const point_b = { x: e.clientX, y: e.clientY };

				const point_am = this.mouse_coords_to_map(point_a.x, point_a.y);
				const point_as = this.map_coords_to_spawner(point_am.x, point_am.y);

				const point_bm = this.mouse_coords_to_map(point_b.x, point_b.y);
				const point_bs = this.map_coords_to_spawner(point_bm.x, point_bm.y);

				const point_tl = { x: Math.min(point_as.x, point_bs.x), y: Math.min(point_as.y, point_bs.y) };
				const point_br = { x: Math.max(point_as.x, point_bs.x), y: Math.max(point_as.y, point_bs.y) };

				const mousearea = await this.post_canvas_msg({ type: 'mousearea', tl: point_tl, br: point_br });

				this.selected_spawners.clear();
				for (const s of mousearea.spawners) {
					this.selected_spawners.add(s);
				}

				this.select_menu.querySelector('.count').textContent = this.selected_spawners.size;
				this.select_menu.style.display = this.selected_spawners.size ? 'block' : 'none';

				this.refresh_focused_spawners();
				this.redraw_q_canvas(e);
			})();
		}

		this.drag.clicked_el = null;
		this.drag.drag_button = -1;
		this.drag.moved = false;
	}

	async onresize(e) {
		if (!this.canvas) {
			return;
		}

		if (this.check_overflown_changed_objs) {
			this.check_overflown_changed_objs();
		}

		const q_canvas = this.q_canvas;
		q_canvas.width = this.canvas.offsetWidth;
		q_canvas.height = this.canvas.offsetHeight;
		q_canvas.style.width = q_canvas.width + 'px';
		q_canvas.style.height = q_canvas.height + 'px';
		this.redraw_q_canvas(e);
		await this.post_canvas_msg({ type: 'resize', width: this.canvas.offsetWidth,
				height: this.canvas.offsetHeight });
		return this.redraw_dyn_overlay();

	}

	onwheel(e) {
		const delta = -Math.sign(e.deltaX + e.deltaY + e.deltaZ) / 10.0;
		this.zoom(delta, { x: e.clientX - Window.bounds.left, y: e.clientY - Window.bounds.top });
		e.preventDefault();
	}

	getmarkersize() {
		return Math.min(28, 16 * Math.sqrt(this.pos.scale));
	}

	async redraw_dyn_overlay() {
		if (this.redrawing_dyn_overlay++) {
			return;
		}
		this.redrawing_dyn_overlay = 1;

		const overlay = this.shadow.querySelector('.dyn-canvas:not(.shown)');

		overlay.last_rendered_pos = { offset: {
			x: this.pos.offset.x,
			y: this.pos.offset.y
		}, scale: this.pos.scale };

		overlay.style.transformOrigin = (-this.pos.offset.x + this.canvas.offsetWidth / 6) + 'px ' + (-this.pos.offset.y + this.canvas.offsetHeight / 6) + 'px';
		this.move_dyn_overlay();

		await this.post_canvas_msg({ type: 'redraw', pos: this.pos, marker_size: this.getmarkersize() });

		const fn = () => {
			const prev_ref = this.redrawing_dyn_overlay;
			this.redrawing_dyn_overlay = 0;
			if (prev_ref > 1) {
				this.redraw_dyn_overlay();
			}
		};

		/* let the transition animation finish first */
		setTimeout(fn, 251);
	}

	redraw_q_canvas(e) {
		window.requestAnimationFrame((t0) => {
			const ctx = this.q_canvas.getContext('2d');

			ctx.setTransform(1, 0, 0, 1, 0.5, 0.5);
			ctx.clearRect(-0.5, -0.5, this.q_canvas.width, this.q_canvas.height);
			ctx.setLineDash([6]);
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'white';

			if (this.drag.drag_button == 1) {
				this.drag.origin.x - e.clientX;
				const pos = this.drag.mousedownorigin;
				const endpos = { x: e.clientX, y: e.clientY };
				const size = { w: endpos.x - pos.x, h: endpos.y - pos.y };
				ctx.strokeRect(pos.x - Window.bounds.left, pos.y - Window.bounds.top, size.w, size.h);
			}

		});
	}

	async filter_spawners(opts) {
		this.spawner_opts = opts;
		const opt = (q) => opts[q];

		const filters = { npc: [], resource: [], monster: [] };

		if (!opt('npc-show')) filters.npc.push((s) => false);
		if (!opt('npc-show-auto')) filters.npc.push((s) => s.trigger);
		if (!opt('npc-show-on-trigger')) filters.npc.push((s) => !s.trigger);
		if (!opt('resource-show')) filters.resource.push((s) => false);
		if (!opt('resource-show-auto')) filters.resource.push((s) => s.trigger);
		if (!opt('resource-show-on-trigger')) filters.resource.push((s) => !s.trigger);
		if (!opt('mob-show')) filters.monster.push((s) => false);
		if (!opt('mob-show-auto')) filters.monster.push((s) => s.trigger);
		if (!opt('mob-show-on-trigger')) filters.monster.push((s) => !s.trigger);

		const by_mob = (fn) => {
			return (s) => {
				const type = s.groups[0]?.type || 0;
				const mob = db.monsters[type];
				if (!mob) return true;
				return fn(mob);
			}
		}
		if (!opt('mob-show-ground')) filters.monster.push(by_mob((m) => m.stand_mode == 2 || m.swim_speed));
		if (!opt('mob-show-flying')) filters.monster.push(by_mob((m) => m.stand_mode != 2 || m.swim_speed));
		if (!opt('mob-show-water')) filters.monster.push(by_mob((m) => !m.swim_speed));

		if (!opt('mob-show-boss')) filters.monster.push(by_mob((m) => !m.show_level));
		if (!opt('mob-show-nonboss')) filters.monster.push(by_mob((m) => m.show_level));
		if (!opt('mob-show-aggressive')) filters.monster.push(by_mob((m) => !m.is_aggressive));
		if (!opt('mob-show-nonaggressive')) filters.monster.push(by_mob((m) => m.is_aggressive));

		const minlevel = typeof(opt('mob-show-lvl-min')) == 'number' ? opt('mob-show-lvl-min') : 0;
		const maxlevel = typeof(opt('mob-show-lvl-max')) == 'number' ? opt('mob-show-lvl-max') : 150;
		filters.monster.push(by_mob((m) => m.level >= minlevel && m.level <= maxlevel));

		const map_filters = {};

		for (const type in filters) {
			map_filters[type] = (s) => {
				for (const f of filters[type]) {
					if (!f(s)) {
						return false;
					}
				}
				return true;
			}
		}

		this.spawner_filters = map_filters;

		const search = typeof(opt('search')) == 'string' ? opt('search').toLowerCase() : '';
		this.spawner_opts.search = search;

		const drawn_spawners = { npc: [], monster: [], resource: [] };
		for (const spawner of (db['spawners_' + this.maptype.id] || [])) {
			if (this.filter_spawner(spawner)) {
				drawn_spawners[spawner.type].push(spawner.id);
			}
		}

		await this.post_canvas_msg({ type: 'set_filtered_spawners', spawners: drawn_spawners });
		return this.redraw_dyn_overlay();
	}

	filter_spawner(spawner) {
		const type = spawner.type;
		if (type && (!this.spawner_filters[type] || !this.spawner_filters[type](spawner))) {
			return false;
		}

		if (spawner._removed && !this.spawner_opts['show-removed-spawners']) {
			return false;
		}

		if (this.spawner_opts.search) {
			let match = false;

			const get_name = (spawner, group_idx = 0) => {
				let obj = null;
				const type = spawner.groups[group_idx]?.type;
				if (spawner.type == 'resource') {
					obj = db.mines[type];
				} else {
					obj = db.npcs[type] || db.monsters[type];
				}
				return obj?.name || '';
			};

			for (let i = 0; i < spawner.groups.length; i++) {
				if (get_name(spawner, i)?.toLowerCase()?.includes(this.spawner_opts.search)) {
					match = true;
					break;
				}
			}

			if (!match) {
				return false;
			}
		}

		return true;
	}

	move_dyn_overlay() {
		const overlays = this.shadow.querySelectorAll('.dyn-canvas');
		for (const overlay of overlays) {
			const last_pos = overlay.last_rendered_pos || this.pos;
			const x = this.pos.offset.x - last_pos.offset.x;
			const y = this.pos.offset.y - last_pos.offset.y;
			const scale = this.pos.scale / last_pos.scale;

			overlay.style.transform = 'translate(' + (-x) + 'px,' + (-y) + 'px) scale(' + scale + ')';
		}
	}

	move_to(new_offset) {
		this.pos.offset = new_offset;
	
		return new Promise((resolve) => {
			window.requestAnimationFrame((t0) => {
				this.pw_map.style.transform = 'translate(' + (-this.pos.offset.x) + 'px,' + (-this.pos.offset.y) + 'px) scale(' + this.pos.scale + ')';
				if (this.rotation_circle_spawner) {
					this.rotation_circle.style.transform = 'translate(' + (-this.pos.offset.x) + 'px,' + (-this.pos.offset.y) + 'px)';

				}
				this.move_dyn_overlay();
				setTimeout(async () => {
					await this.redraw_dyn_overlay();
					resolve();
				}, 1);
			});
		});


	}

	zoom(delta, origin) {
		const old_scale = this.pos.scale;
		this.pos.scale = Math.max(0.100, this.pos.scale * (1 + delta));
		const new_pos = {
			x: this.pos.offset.x + ((this.pos.offset.x + origin.x) / old_scale
				      - (this.pos.offset.x + origin.x) / this.pos.scale) * this.pos.scale,
			y: this.pos.offset.y + ((this.pos.offset.y + origin.y) / old_scale
				      - (this.pos.offset.y + origin.y) / this.pos.scale) * this.pos.scale,
		};
		this.move_to(new_pos);
		if (this.rotation_circle_spawner) {
			const spawner = this.rotation_circle_spawner;
			let { x, y } = this.spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);

			this.rotation_circle.style.left = x + 'px';
			this.rotation_circle.style.top = y + 'px';
		}
	}

	map_coords_to_spawner(x, y) {
		return {
			x: 2 * x / this.bg_scale - this.maptype.size.x,
			y: -2 * y  / this.bg_scale + this.maptype.size.y,
		};
	}

	spawner_coords_to_map(x, y) {
		return {
			x: (0.5 * this.maptype.size.x + x / 2) * this.bg_scale * this.pos.scale,
			y: (0.5 * this.maptype.size.y - y / 2) * this.bg_scale * this.pos.scale
		};
	}

	mouse_coords_to_map(mousex, mousey) {
		return {
			x: (mousex - this.map_bounds.left + this.pos.offset.x) / this.pos.scale,
			y: (mousey - this.map_bounds.top + this.pos.offset.y) / this.pos.scale
		};
	}

};
