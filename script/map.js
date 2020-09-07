/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class PWMap {
	constructor() {
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
		this.pos = {
			scale: 1,
			offset: {
				x: 0,
				y: 0
			},
		};

		this.drag = {
			origin: {
				x: 0,
				y: 0
			},
			is_drag: false,
		};
	}

	static async add_elements(parent) {
		const shadow_el = document.createElement('div');
		shadow_el.id = 'pw-map';
		const shadow = shadow_el.attachShadow({mode: 'open'});
		const tpl = await get(ROOT_URL + 'tpl/editor.tpl');
		const els = newArrElements(tpl.data);
		shadow.append(...els);
		parent.prepend(shadow_el);
		Window.set_container(shadow.querySelector('#pw-windows'));
		await db.load_map('world');
	}

	async redraw_overlay(filters) {
		const org_overlay = this.shadow.querySelector('#pw-map-overlay');
		const overlay = org_overlay.cloneNode();
		var ctx = overlay.getContext("2d");
		ctx.clearRect(0, 0, overlay.width, overlay.height);
		const size = 32;

		const org_overlay_dots = this.shadow.querySelector('#pw-map-overlay-dots');
		const overlay_dots = org_overlay_dots.cloneNode();
		var ctx_dots = overlay_dots.getContext("2d");
		ctx_dots.clearRect(0, 0, overlay_dots.width, overlay_dots.height);
		ctx_dots.fillStyle = 'red';

		const icons = {};
		const get_spawner_icon = (type) => {
			if (icons[type]) return icons[type];

			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => { icons[type] = img; resolve(img); };
				img.onerror = reject;
				if (type.startsWith('data:')) {
					img.src = type;
				} else {
					img.src = ROOT_URL + 'img/spawner-' + type + '.png';
				}
			});
		};

		for (const spawner of db.spawners_world) {
			let marker_img;

			if (filters[spawner.is_npc ? 'npc' : 'mob'](spawner)) {
				continue;
			}

			if (spawner.groups.length == 0) {
				marker_img = await get_spawner_icon('unknown');
			} else {
				if (spawner.is_npc) {
					marker_img = await get_spawner_icon('npc');
				} else {
					marker_img = await get_spawner_icon('mob');
				}
				//marker_img = await get_spawner_icon(Item.get_icon(group.type));
			}

			const pcx = 0.5 + spawner.pos[0] / 2 / 4096;
			const pcy = 0.5 - spawner.pos[2] / 2 / 5632;
			const x = parseInt(pcx * overlay.width);
			const y = parseInt(pcy * overlay.height);
			ctx.drawImage(marker_img, x - size/2, y - size/2, size, size);
			ctx_dots.fillRect(x, y, 1, 1);
			//ctx.beginPath();
			//ctx.strokeStyle = 'greenyellow';
			//ctx.rect(x - size/2, y - size/2, size, size);
			//ctx.stroke();
		}

		for (const spawner of db.resources_world) {
			let marker_img;

			if (spawner.groups.length == 0) {
				marker_img = await get_spawner_icon('unknown');
			} else {
				const res_id = spawner.groups[0].type;
				const res = db.mines[res_id];
				const mat_item = res.mat_item.find((it) => it && it.id > 0);
				const item = db.items[mat_item ? mat_item.id : 0]; 
				marker_img = await get_spawner_icon(item ? Item.get_icon(item.icon) : 'unknown');
			}

			const pcx = 0.5 + spawner.pos[0] / 2 / 4096;
			const pcy = 0.5 - spawner.pos[2] / 2 / 5632;
			const x = parseInt(pcx * overlay.width);
			const y = parseInt(pcy * overlay.height);
			ctx.drawImage(marker_img, x - size/2, y - size/2, size, size);
			ctx_dots.fillRect(x, y, 1, 1);
		}

		org_overlay.replaceWith(overlay);
		org_overlay_dots.replaceWith(overlay_dots);
	}

	reinit(mapname) {
		return new Promise((resolve, reject) => {
			this.shadow = document.querySelector('#pw-map').shadowRoot;
			const canvas = this.shadow.querySelector('#pw-map-canvas');
			this.bg = canvas.querySelector('.bg');
			this.pw_map = canvas.querySelector('#pw-map');
			canvas.style.display = 'initial';
			this.bg.onload = async () => {
				this.pos_label = this.shadow.querySelector('#pw-map-pos-label');
				this.map_bounds = canvas.getBoundingClientRect();

				this.bg_img_realsize.w = this.bg.width;
				this.bg_img_realsize.h = this.bg.height;

				canvas.onmousedown = (e) => this.onmousedown(e);
				canvas.onwheel = (e) => this.onwheel(e);
				this.onmousemove_fn = (e) => this.onmousemove(e);
				this.onmouseup_fn = (e) => this.onmouseup(e);

				window.addEventListener('mousemove', this.onmousemove_fn, { passive: false });
				window.addEventListener('mouseup', this.onmouseup_fn, { passive: false });

				document.querySelector('#returnToWebsite').onclick = async () => {
					await Window.close_all();
					await this.close();
				};

				const overlay_icons = this.shadow.querySelector('#pw-map-overlay');
				const overlay_dots = this.shadow.querySelector('#pw-map-overlay-dots');
				for (const overlay of [overlay_icons, overlay_dots]) {
					overlay.width = 10000;
					overlay.height = 10000 * this.bg.height / this.bg.width;
					overlay.style.width = this.bg.width + 'px';
					overlay.style.height = this.bg.height + 'px';
				}
				await this.redraw_overlay({ npc: () => false, mob: () => false });
				//Window.open('welcome');
				await open_map_legend_window();
				resolve();
			};
			this.bg.onerror = reject;
			this.bg.src = ROOT_URL + 'data/images/map/' + mapname + '.jpg';
		});
	}

	close() {
		const pw_map = this.shadow.querySelector('#pw-map-canvas');
		window.removeEventListener('mousemove', this.onmousemove_fn);
		window.removeEventListener('mouseup', this.onmouseup_fn);
		pw_map.style.display = 'none';
		document.body.classList.remove('mge-fullscreen');
	}

	onmousedown(e) {
		e.preventDefault();

		this.drag.origin.x = e.clientX;
		this.drag.origin.y = e.clientY;
		this.drag.is_drag = true;
	}

	onmousemove(e) {
		e.preventDefault();

		if (this.drag.is_drag) {
			const new_offset = {
				x: this.pos.offset.x + (this.drag.origin.x - e.clientX),
				y: this.pos.offset.y + (this.drag.origin.y - e.clientY)
			};
			this.move_to(new_offset);

			this.drag.origin.x = e.clientX;
			this.drag.origin.y = e.clientY;
		}

		const map_coords = this.mouse_coords_to_map(e.clientX, e.clientY);
		map_coords.x = map_coords.x * 2 - this.bg_img_realsize.w;
		map_coords.y = - map_coords.y * 2 + this.bg_img_realsize.h;

		const marker_size = 64 * this.bg_img_realsize.w / 10000;

		let hover = false;
		for (const spawners_group of [db.spawners_world, db.resources_world]) {
			for (const spawner of spawners_group) {
				const x = spawner.pos[0];
				const y = spawner.pos[2];

				if (map_coords.x >= x - marker_size / 2 &&
				    map_coords.y < y + marker_size / 2 &&
				    map_coords.x < x + marker_size / 2 &&
				    map_coords.y >= y - marker_size / 2) {
					hover = true;
				}
			}
		}

		document.body.style.cursor = hover ? 'pointer' : '';
		this.shadow.querySelector('#pw-map-pos-label').textContent = 'X: ' + parseInt(map_coords.x) + ', Y: ' + parseInt(map_coords.y);
		Window.onmousemove(e);
	}

	onmouseup(e) {
		this.drag.is_drag = false;
		Window.onmouseup(e);
	}

	onwheel(e) {
		const delta = -Math.sign(e.deltaX + e.deltaY + e.deltaZ) / 10.0;
		this.zoom(delta, { x: e.clientX, y: e.clientY });
		e.preventDefault();
	}

	move_to(new_offset) {
		this.pos.offset = new_offset;
		this.pw_map.style.transform = 'translate(' + (-this.pos.offset.x) + 'px,' + (-this.pos.offset.y) + 'px) scale(' + this.pos.scale + ')';
	}

	zoom(delta, origin) {
		const old_scale = this.pos.scale;
		this.pos.scale = Math.max(0.100, this.pos.scale * (1 + delta));
		const overlay = this.shadow.querySelector('#pw-map-overlay');
		overlay.style.opacity = 1.0 / this.pos.scale;
		const new_pos = {
			x: this.pos.offset.x + ((this.pos.offset.x + origin.x) / old_scale
				      - (this.pos.offset.x + origin.x) / this.pos.scale) * this.pos.scale,
			y: this.pos.offset.y + ((this.pos.offset.y + origin.y) / old_scale
				      - (this.pos.offset.y + origin.y) / this.pos.scale) * this.pos.scale,
		};
		this.move_to(new_pos);

	}

	mouse_coords_to_map(mousex, mousey) {
		return {
			x: (mousex - this.map_bounds.left + this.pos.offset.x) / this.pos.scale,
			y: (mousey - this.map_bounds.top + this.pos.offset.y) / this.pos.scale
		};
	}

};
