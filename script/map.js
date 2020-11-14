/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class PWMap {
	static maps = {
		gs01: { name: 'Main World', id: 'gs01', size: { x: 4096, y: 5632 } },

		is05: { name: 'Firecrag Grotto', id: 'is05', size: { x: 512, y: 512 }, img_scale: 2 },
		is06: { name: 'Den of Rabid Wolves', id: 'is06', size: { x: 512, y: 512 }, img_off: { x: 318, y: 62 } },
		is07: { name: 'Cave of the Vicious', id: 'is07', size: { x: 512, y: 512 } },

		is02: { name: 'Secret Passage', id: 'is02', size: { x: 512, y: 512 } },
		is08: { name: 'Hall of Deception', id: 'is08', size: { x: 512, y: 512 } },

		is09: { name: 'Gate of Delirium', id: 'is09', size: { x: 512, y: 512 }, img_off: { x: 300, y: 300 } },
		is10: { name: 'Secret Frostcover Grounds', id: 'is10', size: { x: 512, y: 512 }, img_off: { x: 64, y: 64 } },
		is11: { name: 'Valley of Disaster', id: 'is11', size: { x: 512, y: 512 }, img_off: { x: 201, y: 198 } },
		is12: { name: 'Forest Ruins', id: 'is12', size: { x: 512, y: 512 }, img_off: { x: 46, y: 46 } },
		is13: { name: 'Cave of Sadistic Glee', id: 'is13', size: { x: 512, y: 512 } },
		is14: { name: 'Wraithgate', id: 'is14', size: { x: 512, y: 512 } },
		is15: { name: 'Hallucinatory Trench', id: 'is15', size: { x: 512, y: 512 }, img_off: { x: 122, y: 122 } },
		is16: { name: 'Eden', id: 'is16', size: { x: 512, y: 512 }, img_off: { x: 191, y: 191 } },
		is17: { name: 'Brimstone Pit', id: 'is17', size: { x: 512, y: 512 }, img_off: { x: 191 , y: 191 } },
		is18: { name: 'Temple of the Dragon', id: 'is18', size: { x: 512, y: 512 } },
		is19: { name: 'Nightscream Island', id: 'is19', size: { x: 512, y: 512 }, img_off: { x: 280, y: 280 } },
		is32: { name: 'Cube of Fate', id: 'is32', size: { x: 1536, y: 1536 } },

		is20: { name: 'Snake Isle', id: 'is20', size: { x: 512, y: 512 }, img_off: { x: 202, y: 281 } },

		is21: { name: 'Lothranis', id: 'is21', size: { x: 1024, y: 1024 }, img_off: { x: 250, y: 250 } },
		is22: { name: 'Momaganon', id: 'is22', size: { x: 1024, y: 1024 }, img_off: { x: 250, y: 250 } },
		is23: { name: 'Seat of Torment', id: 'is23', size: { x: 512, y: 512 }, img_off: { x: 217, y: 217 } },
		is24: { name: 'Abaddon', id: 'is24', size: { x: 512, y: 512 }, img_off: { x: 233, y: 233 } },
		a26b: { name: 'Palace of Nirvana', id: 'a26b', size: { x: 512, y: 512 }, img_off: { x: 68, y: 68 } },
		is27: { name: 'Lunar Glade', id: 'is27', size: { x: 512, y: 512 }, img_off: { x: 233, y: 233 } },
		is28: { name: 'Valley of Reciprocity', id: 'is28', size: { x: 512, y: 512 }, img_off: { x: 228, y: 228 } },
		is29: { name: 'Frostcover City', id: 'is29', size: { x: 512, y: 512 }, img_off: { x: 99, y: 99 } },
		is31: { name: 'Twilight Temple', id: 'is31', size: { x: 512, y: 512 } },

		is33: { name: 'Chrono City', id: 'is33', size: { x: 1024, y: 1024 } },

		is01: { name: 'City of Abominations', id: 'is01', size: { x: 512, y: 512 } },
		is25: { name: 'City of Naught', id: 'is25', size: { x: 512, y: 512 }, img_off: { x: 128, y: 128 } },
		is26: { name: 'Hall of Blasphemy', id: 'is26', size: { x: 512, y: 512 }, img_off: { x: 103, y: 103 } },
	};

	constructor() {
		this.maptype = null;
		this.shadow = null;
		this.bg = null;
		this.pos_label = null;
		this.map_bounds = null;
		/* map drag position / scroll */
		this.pos = { scale: 1, offset: { x: 0, y: 0} };

		this.drag = {
			origin: {
				x: 0,
				y: 0
			},
			is_drag: false,
			moved: false,
		};

		this.marker_img = {};
		this.hovered_spawner = null;
		this.focused_spawners = new Set();
		this.hover_lbl = null;
		/* either an eye-candy artwork or real ingame terrain */
		this.show_real_bg = false;
		this.canvas_worker = null;
		this.canvas_msg_id = 1;

		this.mouse_pos = { x: -1, y: -1 };
		this.mouse_spawner_pos = { x: -1, y: -1 };
	}

	static async add_elements(parent) {
		const shadow_el = document.createElement('div');
		shadow_el.id = 'pw-map';
		shadow_el.style.position = 'absolute';
		shadow_el.style.width = '100vw';
		shadow_el.style.height = '100vh';
		shadow_el.style.overflow = 'hidden';
		const shadow = shadow_el.attachShadow({mode: 'open'});
		const tpl = await get(ROOT_URL + 'tpl/editor.tpl');
		const els = newArrElements(tpl.data);
		shadow.append(...els);
		parent.prepend(shadow_el);
		Window.set_container(shadow.querySelector('#pw-windows'));

		shadow.querySelector('#open-legend').onclick = async () => {
			const win = await LegendWindow.open({ });
		};

	}

	async refresh_focused_spawners() {
		await this.post_canvas_msg({
			type: 'set_focused_spawners',
			spawners: [...this.focused_spawners],
		});
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
		this.hover_lbl = this.shadow.querySelector('.label');
		this.pos_label = this.shadow.querySelector('#pw-map-pos-label');

		this.canvas_worker = new Worker(ROOT_URL + 'script/map_worker.js');
		const overlays = this.shadow.querySelectorAll('.dyn-canvas');
		for (let i = 0; i < overlays.length; i++) {
			const overlay = overlays[i];
			const offscreen = overlay.transferControlToOffscreen();
			this.canvas_worker.postMessage({ type: 'set_canvas', id: i, canvas: offscreen }, [offscreen]);
		}

		this.canvas_worker.postMessage({ type: 'set_options', opts: {} });

		this.canvas_worker.addEventListener('message', (e) => {
			if (e.data.type == 'redraw') {
				const overlays = this.shadow.querySelectorAll('.dyn-canvas');
				const overlay = overlays[e.data.id];
				const prev_overlay = overlays[1 - e.data.id];

				for (const o of overlays) {
					if (o.styledWidth != 8/6 * this.canvas.offsetWidth ||
							o.styledHeight != 8/6 * this.canvas.offsetHeight) {
						o.style.left = Math.floor(-1/6 * this.canvas.offsetWidth) + 'px';
						o.style.top = Math.floor(-1/6 * this.canvas.offsetHeight) + 'px';
						o.styledWidth = Math.floor(8/6 * this.canvas.offsetWidth);
						o.styledHeight = Math.floor(8/6 * this.canvas.offsetHeight);
						o.style.width = o.styledWidth + 'px';
						o.style.height = o.styledHeight + 'px';
					}
				}


				prev_overlay.classList.remove('shown');
				overlay.classList.add('shown');

			} else if (e.data.type == 'mouse') {
				const hovered = e.data.hovered_spawner;
				const spawner = hovered ? db[hovered._db.type][hovered.id] : null;

				this.hovered_spawner = spawner;
				this.hover_lbl.style.display = spawner ? 'block' : 'none';
				if (spawner) {
					const type = spawner.groups[0]?.type;
					let obj;
					if (spawner._db.type.startsWith('spawners_')) {
						obj = db.npcs[type] || db.monsters[type];
					} else {
						obj = db.mines[type];
					}
					const name = spawner.name || obj?.name;

					this.hover_lbl.style.left = (this.mouse_pos.x - this.map_bounds.left + 20) + 'px';
					this.hover_lbl.style.top = (this.mouse_pos.y - this.map_bounds.top - 10) + 'px';
					this.hover_lbl.textContent = name;
				}

				document.body.style.cursor = spawner ? 'pointer' : '';
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

		this.post_canvas_msg({
			type: 'set_objs', obj_type: 'monsters',
			objs: [...db.monsters],
		});
		this.post_canvas_msg({
			type: 'set_objs', obj_type: 'npcs',
			objs: [...db.npcs],
		});
		this.post_canvas_msg({
			type: 'set_objs', obj_type: 'mines',
			objs: [...db.mines],
		});

		db.register_commit_cb((obj, diff, prev_vals) => {
			if (!obj._db.type.startsWith('spawners_') && !obj._db.type.startsWith('resources_')) {
				return;
			}

			(async () => {
				await this.post_canvas_msg({ type: 'update_obj', obj: obj });
				this.force_mouse_update = true;
				await this.post_canvas_msg({ type: 'redraw', pos: this.pos, marker_size: this.getmarkersize() });
			})();


		});

		for (const m in PWMap.maps) {
			db.load_map(m);
		}

		this.initialized = true;
	}

	post_canvas_msg(msg, transferable = []) {
		const msg_id = msg.msg_id = this.canvas_msg_id++;
		this.canvas_worker.postMessage(msg, transferable);
		return new Promise((resolve) => {
			const fn = (e) => {
				if (e.data.msg_id == msg_id) {
					this.canvas_worker.removeEventListener('message', fn);
					return resolve();
				}
			};

			this.canvas_worker.addEventListener('message', fn);
		});
	}

	reinit(mapid, keep_offset = false) {
		this.init();

		this.maptype = PWMap.maps[mapid];
		if (!this.maptype) {
			throw new Error('Map ' + mapid + ' doesn\'t exist');
		}

		this.canvas.classList.remove('shown');

		this.bg.load_tag = Loading.show_tag('Loading ' + this.maptype.name + ' image');

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
				this.canvas.oncontextmenu = (e) => false;
				this.canvas.onwheel = (e) => this.onwheel(e);

				await db.load_map(mapid);

				const get_name = (spawner) => {
					let name;
					const type = spawner.groups[0]?.type || 0;

					let obj = null;
					if (spawner._db.type.startsWith('resources_')) {
						obj = db.mines[type];
					} else {
						obj = db.npcs[type] || db.monsters[type];
					}

					return (obj?.name ?? "(unknown)") || "(unnamed)";
				}

				for (const list of [db['spawners_' + this.maptype.id], db['resources_' + this.maptype.id]]) {
					for (const spawner of list) {
						if (!spawner._db.shown_name) {
							spawner._db.shown_name = get_name(spawner);
						}
					}
				}

				await this.post_canvas_msg({
					type: 'set_map',
					map: { size: this.maptype.size, bg_scale: this.bg_scale },
				});

				this.post_canvas_msg({
					type: 'set_objs', obj_type: 'spawners',
					objs: [...db['spawners_' + this.maptype.id]],
				});
				this.post_canvas_msg({
					type: 'set_objs', obj_type: 'resources',
					objs: [...db['resources_' + this.maptype.id]],
				});

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

				await LegendWindow.open();

				Loading.hide_tag(this.bg.load_tag);
				resolve();
			};
			this.bg.onerror = reject;
			this.refresh_bg_img();
		});
	}

	close() {
		this.canvas.classList.remove('shown');
	}

	onmousedown(e) {
		e.preventDefault();
		this.drag.clicked_el = e.path[0];

		if (e.which == 2) {
			this.drag.origin.x = e.clientX;
			this.drag.origin.y = e.clientY;
			this.drag.is_drag = true;
			this.drag.moved = false;
		}
	}

	onmousemove(e) {
		if (this.drag.is_drag) {
			if (e.clientX == this.drag.origin.x &&
					e.clientY == this.drag.origin.y) {
				/* no mouse movement */
				return;
			}

			const new_offset = {
				x: this.pos.offset.x + (this.drag.origin.x - e.clientX),
				y: this.pos.offset.y + (this.drag.origin.y - e.clientY)
			};
			this.move_to(new_offset);
			this.redraw_dyn_overlay();

			e.preventDefault();
			this.drag.origin.x = e.clientX;
			this.drag.origin.y = e.clientY;
			this.drag.moved = true;
		}

		if (this.canvas.querySelector(':hover')) {
			const map_coords = this.mouse_coords_to_map(e.clientX, e.clientY);
			const spawner_pos = this.mouse_spawner_pos = this.map_coords_to_spawner(map_coords.x, map_coords.y);
			this.mouse_pos.x = e.clientX;
			this.mouse_pos.y = e.clientY;

			this.shadow.querySelector('#pw-map-pos-label').textContent = 'X: ' + parseInt(spawner_pos.x) + ', Y: ' + parseInt(spawner_pos.y);
		} else {
			if (this.hovered_spawner) {
				this.hover_lbl.style.display = 'none';
				this.hovered_spawner = null;
				document.body.style.cursor = '';
			}
		}

		return e.defaultPrevented;
	}

	onmouseup(e) {
		const mouse_pos = { x: e.clientX, y: e.clientY };
		if (e.which == 3 && e.path[0] == this.drag.clicked_el) {
			(async () => {
				const x = mouse_pos.x - Window.bounds.left;
				const y = mouse_pos.y - Window.bounds.top;
				const map_coords = this.mouse_coords_to_map(mouse_pos.x, mouse_pos.y);
				const spawner_pos = this.map_coords_to_spawner(map_coords.x, map_coords.y);

				const win = await RMenuWindow.open({
				x: x, y: y,
				entries: [
					{ name: 'Spawn', children: [
						{ id: 1, name: 'NPC' },
						{ id: 2, name: 'Monster' },
						{ id: 3, name: 'Resource' },
					]},
					{ id: 10, name: 'Undo' },
				]});
				const sel = await win.wait();
				switch(sel) {
					case 1: {
						const spawner = db.new('spawners_' + this.maptype.id);
						db.open(spawner);
						spawner.pos = [ spawner_pos.x, 0, spawner_pos.y ];
						spawner.is_npc = true;
						db.commit(spawner);
						console.log('new npc');
						break;
					}
					case 2: {
						console.log('new monster');
						break;
					}
					case 3: {
						console.log('new resource');
						break;
					}
					case 10: {
						console.log('undo');
						break;
					}
				}
			})();
			return false;
		}

		if (this.drag.is_drag) {
			this.redraw_dyn_overlay();
			this.drag.is_drag = false;
		}

		if (!this.drag.moved && this.canvas.querySelector(':hover')) {
			let spawner = this.hovered_spawner;
			if (spawner) {
				spawner = db[spawner._db.type][spawner.id];
				(async () => {
					const win = await SpawnerWindow.open({ x: e.clientX - Window.bounds.left + this.getmarkersize(),
							y: e.clientY - Window.bounds.top - this.getmarkersize() / 2, spawner: spawner });

					win.onfocus = () => {
						this.focused_spawners.add(spawner);
						this.refresh_focused_spawners();
					};
					win.onfocus();
					win.onclose = () => {
						this.focused_spawners.delete(spawner);
						this.refresh_focused_spawners();
					};
				})();
			}
		}

		this.drag.clicked_el = null;
		this.drag.moved = false;
	}

	async onresize(e) {
		await this.post_canvas_msg({ type: 'resize', width: this.canvas.offsetWidth,
				height: this.canvas.offsetHeight });
		return this.redraw_dyn_overlay();

	}

	onwheel(e) {
		const delta = -Math.sign(e.deltaX + e.deltaY + e.deltaZ) / 10.0;
		this.zoom(delta, { x: e.clientX, y: e.clientY });
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

	async filter_spawners(opts) {
		await this.post_canvas_msg({ type: 'set_options', opts: opts });
		return this.redraw_dyn_overlay();
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
			window.requestAnimationFrame(async (t0) => {
				this.pw_map.style.transform = 'translate(' + (-this.pos.offset.x) + 'px,' + (-this.pos.offset.y) + 'px) scale(' + this.pos.scale + ')';
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
	}

	map_coords_to_spawner(x, y) {
		return {
			x: 2 * (x - 0) / this.bg_scale - this.maptype.size.x,
			y: -2 * (y + 0)  / this.bg_scale + this.maptype.size.y,
		};
	}

	spawner_coords_to_map(x, y) {
		return {
			x: (0.5 * this.maptype.size.x + x / 2) * this.bg_scale + 0,
			y: (0.5 * this.maptype.size.y - y / 2) * this.bg_scale - 0
		};
	}

	mouse_coords_to_map(mousex, mousey) {
		return {
			x: (mousex - this.map_bounds.left + this.pos.offset.x) / this.pos.scale,
			y: (mousey - this.map_bounds.top + this.pos.offset.y) / this.pos.scale
		};
	}

};
