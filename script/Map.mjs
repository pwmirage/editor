/* copyright */
import { get, sleep, ROOT_URL, VERSION } from './Util.mjs';
import { newElement, newArrElements, escape } from './DomUtil.mjs';
import db from './PWDB.mjs';
import Window from './Window.mjs';

export default class Map {
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

	reinit(mapname) {
		return new Promise((resolve, reject) => {
			this.shadow = document.querySelector('#pw-map').shadowRoot;
			const canvas = this.shadow.querySelector('#pw-map-canvas');
			const overlay = this.shadow.querySelector('#pw-map-overlay');
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
					await this.close();
				};

				const marker_img = await new Promise((resolve, reject) => {
					const img = new Image();
					img.onload = () => resolve(img);
					img.onerror = reject;
					img.src = ROOT_URL + 'img/marker.png';
				});

				overlay.width = 10000;
				overlay.height = 10000 * this.bg.height / this.bg.width;
				overlay.style.width = this.bg.width + 'px';
				overlay.style.height = this.bg.height + 'px';
				var ctx = overlay.getContext("2d");
				for (const spawner of db.spawners_world) {
					const x = (0.5 + spawner.pos[0] / 2 / 4096) * overlay.width;
					const y = (0.5 - spawner.pos[2] / 2 / 5632) * overlay.height;
					ctx.drawImage(marker_img, x - 16, y - 16, 32, 32);
				}
				Window.open('welcome');
				resolve();
			};
			this.bg.onerror = reject;
			this.bg.src = ROOT_URL + 'data/images/map/' + mapname + '.jpg';
		});
	}

	init_markers(pos) {
		console.log(this.map_bounds);
		const marker = newElement('<div class="map-marker"></div>');
		marker.style.left = x + '%';
		marker.style.top = y + '%';
		this.pw_map.append(marker);
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
		for (const spawner of db.spawners_world) {
			const x = spawner.pos[0];
			const y = spawner.pos[2];

			if (map_coords.x >= x - marker_size / 2 &&
			    map_coords.y < y + marker_size / 2 &&
			    map_coords.x < x + marker_size / 2 &&
			    map_coords.y >= y - marker_size / 2) {
				hover = true;
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




function map_onmousemove(mousex, mousey)
{
	if (!g_map.mpc_bounds) return;

	if (g_map.drag.is_drag) {
		var new_offset = {
			x: g_map.pos.offset.x + (g_map.drag.origin.x - mousex),
			y: g_map.pos.offset.y + (g_map.drag.origin.y - mousey)
		};

		move_bg_to(new_offset);
	}

	var map_coords = mouse_coords_to_map(mousex, mousey);
	g_map.$pos_label.text('X: ' + parseInt(map_coords.x) + ', Y: ' + parseInt(map_coords.y));

	g_map.drag.origin.x = mousex;
	g_map.drag.origin.y = mousey;
}

function handle(e)
{
	if (e.which == 1 || e.which == 2) {
		g_map.drag.origin.x = e.clientX;
		g_map.drag.origin.y = e.clientY;
		g_map.drag.is_drag= true;
	}

	if (g_map.map_click_cb) {
		g_map.map_click_cb.call(g_map.$bg_img.get(0), e);
	}

	e.stopPropagation();
	return false;
}


function set_scale(new_scale)
{
	if (new_scale < 0.125) {
		return false;
	}

	var old_scale = g_map.pos.scale;
	g_map.pos.scale = new_scale;

	if ((new_scale < 1.0 && old_scale>= 1.0) ||
			(new_scale >= 1.0 && old_scale < 1.0)) {
		refresh_markers();
	}

	g_map.$bg_img.css('width', g_map.bg_img_realsize.w *	g_map.pos.scale+ 'px');
	g_map.$bg_img.css('height', g_map.bg_img_realsize.h *	g_map.pos.scale+ 'px');

	save_cfg();
	return true;
}

function zoom(delta, cursor)
{
	var old_scale = g_map.pos.scale;
	if (!set_scale( g_map.pos.scale* (1 + delta))) {
		return;
	}

	var new_coords = {
		x: g_map.pos.offset.x
			 + ((g_map.pos.offset.x + cursor.x) / old_scale
				 - (g_map.pos.offset.x + cursor.x) / g_map.pos.scale) * g_map.pos.scale,
		y: g_map.pos.offset.y
			 + ((g_map.pos.offset.y + cursor.y) / old_scale
				 - (g_map.pos.offset.y + cursor.y) / g_map.pos.scale) * g_map.pos.scale,
	};

	move_bg_to(new_coords);
}

function zoom_handler(e)
{
	var delta = -Math.sign(e.originalEvent.deltaX + e.originalEvent.deltaY + e.originalEvent.deltaZ) / 10.0;
	zoom(delta, g_map.drag.origin);
	e.preventDefault();
	return false;
}

function map_reset()
{
	const $mpc = $('#mpc');
	move_bg_to({ x: -$mpc.width() * 0.25, y: -$mpc.height() * 0.25 });
	set_scale($mpc.width() / g_map.bg_img_realsize.w * 0.5);
}
