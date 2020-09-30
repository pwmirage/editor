/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class PWMap {
	static maps = {
		gs01: { name: 'Main World', id: 'gs01', size: { x: 4096, y: 5632 } },

		is05: { name: 'Firecrag Grotto', id: 'is05', size: { x: 512, y: 512 } },
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
		/* size of the actual image (unscaled) */
		this.bg_img_realsize = {
			w: 0,
			h: 0,
		};
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

	refresh_bg_img() {
		this.bg.load_tag = Loading.show_tag('Loading ' + this.maptype.name + ' image');
		this.bg.src = ROOT_URL + 'data/images/map/' + this.maptype.id + (this.show_real_bg ? '_m' : '') + '.webp';
	}

	reinit(mapid) {
		this.maptype = PWMap.maps[mapid];
		if (!this.maptype) {
			throw new Error('Map ' + mapid + ' doesn\'t exist');
		}

		return new Promise((resolve, reject) => {
			this.shadow = document.querySelector('#pw-map').shadowRoot;
			const overlay = this.shadow.querySelector('.dyn-canvas.shown');
			if (overlay) overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
			const canvas = this.canvas = this.shadow.querySelector('#pw-map-canvas');
			this.canvas.classList.remove('shown');
			this.bg = canvas.querySelector('.bg');
			this.pw_map = canvas.querySelector('#pw-map');
			this.hover_lbl = this.shadow.querySelector('.label');
			this.bg.onload = async () => {
				this.pos_label = this.shadow.querySelector('#pw-map-pos-label');
				this.map_bounds = canvas.getBoundingClientRect();

				this.bg_img_realsize.w = this.bg.width;
				this.bg_img_realsize.h = this.bg.height;
				const img_off = this.maptype.img_off || { x: 0, y: 0 };
				this.bg_scale = (this.bg.width - 2 * img_off.x) / this.maptype.size.x;
				this.bg.style.marginLeft = - img_off.x + 'px';
				this.bg.style.marginTop = - img_off.y + 'px';

				canvas.onmousedown = (e) => this.onmousedown(e);
				canvas.onwheel = (e) => this.onwheel(e);

				await db.load_map(mapid);
				this.onresize = () => this.redraw_dyn_overlay();
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

		this.drag.origin.x = e.clientX;
		this.drag.origin.y = e.clientY;
		this.drag.is_drag = true;
		this.drag.moved = false;
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
			setTimeout(() => this.redraw_dyn_overlay(), 300);

			e.preventDefault();
			this.drag.origin.x = e.clientX;
			this.drag.origin.y = e.clientY;
			this.drag.moved = true;
		}

		if (this.canvas.querySelector(':hover')) {
			const map_coords = this.mouse_coords_to_map(e.clientX, e.clientY);
			const spawner_pos = this.map_coords_to_spawner(map_coords.x, map_coords.y);

			const spawner = this.get_spawner_at(spawner_pos);

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
				const name = obj?.name;

				this.hover_lbl.style.left = (e.clientX - this.map_bounds.left + 20) + 'px';
				this.hover_lbl.style.top = (e.clientY - this.map_bounds.top - 10) + 'px';
				this.hover_lbl.textContent = name;
			}

			document.body.style.cursor = spawner ? 'pointer' : '';
			this.shadow.querySelector('#pw-map-pos-label').textContent = 'X: ' + parseInt(map_coords.x) + ', Y: ' + parseInt(map_coords.y);
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
		if (this.drag.is_drag) {
			this.redraw_dyn_overlay();
		}
		this.drag.is_drag = false;
		if (!this.drag.moved && this.canvas.querySelector(':hover')) {
			const spawner = this.get_hovered_spawner(e);
			if (spawner) {
				(async () => {
					const win = await SpawnerWindow.open({ x: e.clientX - Window.bounds.left + this.getmarkersize(),
							y: e.clientY - Window.bounds.top - this.getmarkersize() / 2, spawner: spawner });

					win.onfocus = () => {
						this.focused_spawners.add(spawner);
					};
					win.onfocus();
					win.onclose = () => {
						this.focused_spawners.delete(spawner);
						this.redraw_dyn_overlay();
					};
				})();
			}
		}

		this.drag.moved = false;
	}

	onresize(e) {
		this.redraw_dyn_overlay();
	}

	onwheel(e) {
		const delta = -Math.sign(e.deltaX + e.deltaY + e.deltaZ) / 10.0;
		this.zoom(delta, { x: e.clientX, y: e.clientY });
		e.preventDefault();
	}

	getmarkersize() {
		return Math.min(28, 16 * Math.sqrt(this.pos.scale));
	}

	get_hovered_spawner(e) {
		const map_coords = this.mouse_coords_to_map(e.clientX, e.clientY);
		const spawner_coords = this.map_coords_to_spawner(map_coords.x, map_coords.y);

		return this.get_spawner_at(spawner_coords);
	}

	get_spawner_at(map_coords) {
		const marker_size = this.getmarkersize() * 1.4 / this.pos.scale / this.bg_scale;

		for (const type in this.drawn_spawners) {
			for (const spawner of this.drawn_spawners[type]) {
				const x = spawner.pos[0];
				const y = spawner.pos[2];

				if (map_coords.x >= x - marker_size / 2 &&
				    map_coords.y < y + marker_size / 2 &&
				    map_coords.x < x + marker_size / 2 &&
				    map_coords.y >= y - marker_size / 2) {
					return spawner;
				}
			}
		}

		return null;
	}

	async redraw_dyn_overlay() {
		if (this.redrawing_dyn_overlay++) {
			return;
		}
		this.redrawing_dyn_overlay = 1;

		const overlay = this.shadow.querySelector('.dyn-canvas:not(.shown)');
		if (overlay.width != 3 * this.canvas.offsetWidth ||
			overlay.height != 3 * this.canvas.offsetHeight) {
			overlay.width = this.canvas.offsetWidth * 3;
			overlay.height = this.canvas.offsetHeight * 3;
			overlay.style.left = -this.canvas.offsetWidth + 'px';
			overlay.style.top = -this.canvas.offsetHeight + 'px';
			overlay.style.width = overlay.width + 'px';
			overlay.style.height = overlay.height + 'px';
		}

		const pos = overlay.last_rendered_pos = { offset: {
			x: this.pos.offset.x,
			y: this.pos.offset.y
		}, scale: this.pos.scale };

		const get_name = (spawner) => {
			let name;
			const type = spawner.groups[0]?.type || 0;

			if (spawner._db.type.startsWith('resources_')) {
				const res = db.mines[type];
				name = res?.name;
			} else if (spawner.is_npc) {
				const npc = db.npcs[type];
				name = npc?.name;
			} else {
				const mob = db.monsters[type];
				name = mob?.name;
			}

			return (name ?? "(unknown)") || "(unnamed)";
		}

		const search = this.marker_filters?.search?.toLowerCase();
		const drawn_spawners = { npc: [], mob: [], resource: [] };
		for (const list of [db['spawners_' + this.maptype.id], db['resources_' + this.maptype.id]]) {
			for (const spawner of list) {
				let { x, y } = this.spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);
				x *= pos.scale;
				y *= pos.scale;

				if (x > pos.offset.x - overlay.width / 3&& x <= pos.offset.x + overlay.width * 2 / 3 &&
					y > pos.offset.y -  overlay.height / 3 && y <= pos.offset.y + overlay.height * 2 / 3) {

					if (search) {
						const name = get_name(spawner);
						if (!name.toLowerCase().includes(search)) {
							continue;
						}
					}

					if (spawner._db.type.startsWith('resources_')) {
						if (!this.marker_filters|| this.marker_filters.resource(spawner)) {
							drawn_spawners.resource.push(spawner);
						}
					} else if (spawner.is_npc) {
						if (!this.marker_filters || this.marker_filters.npc(spawner)) {
							drawn_spawners.npc.push(spawner);
						}
					} else {
						if (!this.marker_filters || this.marker_filters.mob(spawner)) {
							drawn_spawners.mob.push(spawner);
						}
					}
				}
			}
		}

		const ctx = overlay.getContext("2d");
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, overlay.width, overlay.height);

		overlay.style.transformOrigin = (-pos.offset.x + overlay.width/3) + 'px ' + (-pos.offset.y + overlay.height/3) + 'px';
		this.move_dyn_overlay();

		ctx.translate(-pos.offset.x + overlay.width/3, -pos.offset.y + overlay.height/3);
		const size = this.getmarkersize();

		const get_spawner_icon = (type) => {
			if (this.marker_img[type]) return this.marker_img[type];

			const img = new Image();
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					this.marker_img[type] = img; resolve(img);
				};
				img.onerror = reject;
				if (type.startsWith('data:')) {
					img.src = type;
				} else {
					img.src = ROOT_URL + 'img/marker-' + type + '.png';
				}
			});
		};

		const drawAt = (img, rad, x, y, width, height) => {
			ctx.translate(x, y);
			ctx.rotate(rad);
			ctx.drawImage(img, -width / 2, -height / 2, width, height);
			ctx.rotate(-rad);
			ctx.translate(-x, -y);
		}

		let i;
		for (const list in drawn_spawners) {
			let marker_img;
			if (list == 'mob') {
				marker_img = await get_spawner_icon('red');
			} else if (list == 'npc') {
				marker_img = await get_spawner_icon('yellow');
			} else if (list == 'resource') {
				marker_img = await get_spawner_icon('green');
			}

			const spawner_list = drawn_spawners[list];
			const foreach_spawner = async (fn) => {
				for (i = 0; i < spawner_list.length; i += 500) {
					await new Promise((resolve) => setTimeout(async () => {
						let j;
						for (j = 0; j < 500; j++) {
							if (i + j >= spawner_list.length) break;
							const spawner = spawner_list[i + j];
							if (!spawner) continue;

							fn(spawner);
						}
						resolve();
					}, 1));
				}
			}

			if (this.marker_filters?.show_labels) {
				await foreach_spawner((spawner) => {
					let { x, y } = this.spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);
					x *= pos.scale;
					y *= pos.scale;

					if (this.focused_spawners.size == 0 || this.focused_spawners.has(spawner)) {
						ctx.globalAlpha = 1.0;
					} else {
						ctx.globalAlpha = 0.3;
					}

					const marker_name = get_name(spawner);
					const w = ctx.measureText(marker_name).width;

					ctx.fillStyle = 'black';
					ctx.fillRect(x + size / 2 + 8, y - 11, w + 14, 22);
					ctx.font = '12px Arial';
					ctx.fillStyle = 'white';
					ctx.fillText(marker_name, x + size / 2 + 14, y + 5);
				});
			}

			const t0 = performance.now();
			await foreach_spawner((spawner) => {
				let { x, y } = this.spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);
				x *= pos.scale;
				y *= pos.scale;
				const rad = -Math.atan2(spawner.dir[2], spawner.dir[0]) + Math.PI / 2;
				if (this.focused_spawners.size == 0 || this.focused_spawners.has(spawner)) {
					ctx.globalAlpha = 1.0;
				} else {
					ctx.globalAlpha = 0.3;
				}
				drawAt(marker_img, rad, x, y, size, size);
			});
			const t1 = performance.now();
			console.log('rendering took: ' + (t1 - t0) + 'ms');
		}

		this.move_dyn_overlay();

		let rescaled = pos.scale != overlay.last_rendered_pos.scale;
		const prev_overlay = this.shadow.querySelector('.dyn-canvas.shown');
		prev_overlay.classList.remove('shown');
		overlay.classList.add('shown');
		this.drawn_spawners = drawn_spawners;

		const fn = () => {
			const prev_ref = this.redrawing_dyn_overlay;
			this.redrawing_dyn_overlay = 0;
			if (prev_ref > 1) {
				this.redraw_dyn_overlay();
			}
		};

		if (rescaled) {
			/* let the transition animation finish first */
			setTimeout(fn, 300);
		} else {
			/* redraw moves immediately */
			setTimeout(fn, 300);
		}
	}

	filter_markers(filters) {
		this.marker_filters = filters;
		this.redraw_dyn_overlay();
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
		this.pw_map.style.transform = 'translate(' + (-this.pos.offset.x) + 'px,' + (-this.pos.offset.y) + 'px) scale(' + this.pos.scale + ')';

		this.move_dyn_overlay();
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
		setTimeout(() => this.redraw_dyn_overlay(), 300);
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
