/* SPDX-License-Identifier: MIT
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_canvases = [];
let g_canvas_id = 0;

let g_map = null;
let g_opts = null;
let g_spawners = new Map();
let g_pos = null;
let g_marker_size = 0;
let g_window_size = { width: 1, height: 1 };
let g_selected_spawners = new Set();
let g_hovered_spawners = null;

/* both spawners and resources */
let g_filtered_spawners = {};
const g_icons = {};

// Waiting to receive the OffScreenCanvas
self.onmessage = async (e) => {
	const type = e.data.type;
	const resp = { msg_id: e.data.msg_id, type: e.data.type };

	switch (type) {
		case 'set_canvas': {
			const id = e.data.id;
			const canvas = e.data.canvas;
			g_canvases[id] = canvas;

			get_icon('red');
			get_icon('yellow');
			get_icon('green');
			get_icon('crossed');
			get_icon('select');
			break;
		}
		case 'mouse': {
			const x = e.data.x;
			const y = e.data.y;

			resp.hovered_spawners = g_hovered_spawners = get_spawners_at(x, y);
			break;
		}
		case 'mousearea': {
			const tl = e.data.tl;
			const br = e.data.br;

			let selected_spawners = [];
			const area = (br.x - tl.x) * (br.y - tl.y);
			if (area <= 4 && g_hovered_spawners.length) {
				/* this spawner was simply left-clicked */
				selected_spawners = g_hovered_spawners;
			} else {
				const filter = (s) => {
					return s.pos[0] >= tl.x && s.pos[0] <= br.x &&
						s.pos[2] >= tl.y && s.pos[2] <= br.y;
				};

				for (const type in g_filtered_spawners) {
					for (const s of g_filtered_spawners[type]) {
						if (filter(s)) {
							selected_spawners.push(s);
						}
					}
				}
			}

			resp.spawners = selected_spawners;
			break;
		}
		case 'set_map': {
			const map = e.data.map;
			g_map = map;
			break;
		}
		case 'set_objs': {
			const obj_type = e.data.obj_type;
			const objs = e.data.objs;
			init_objs(obj_type, objs);
			break;
		}
		case 'update_obj': {
			const obj = e.data.obj;
			g_spawners.set(obj.id, obj);
			if (e.data.filtered) {
				g_filtered_spawners[obj.type].set(obj.id, obj);
			} else {
				g_filtered_spawners[obj.type].delete(obj.id);
			}
			break;
		}
		case 'set_options': {
			const opts = e.data.opts;
			g_opts = opts;
			break;
		}
		case 'resize': {
			const vw = e.data.width;
			const vh = e.data.height;
			for (const canvas of g_canvases) {
				canvas.width = vw * 8/6;
				canvas.height = vh * 8/6;
			}
			break;
		}
		case 'set_filtered_spawners': {
			const spawners = e.data.spawners;

			for (const t in spawners) {
				const arr = spawners[t];
				g_filtered_spawners[t] = new Set(arr.map(sid => g_spawners.get(sid)));
			}
			break;
		}
		case 'set_selected_spawners': {
			const spawners = e.data.spawners;

			g_selected_spawners.clear();
			for (const s of spawners) {
				g_selected_spawners.add(s.id);
			}
			break;
		}
		case 'redraw': {
			const pos = e.data.pos;
			const marker_size = e.data.marker_size;
			g_window_size.width = e.data.width;
			g_window_size.height = e.data.height;
			g_pos = pos;
			g_marker_size = marker_size;
			await new Promise((resolve) => {
				requestAnimationFrame((t0) => {
					redraw();
					resolve();
				});
			});
			resp.id = g_canvas_id;
			break;
		}
	}

	self.postMessage(resp);
};

const init_objs = (type, arr) => {
	for (const obj of arr) {
		g_spawners.set(obj.id, obj);
	}
}

const get_spawners_at = (mx, my) => {
	if (!g_filtered_spawners) {
		return [];
	}

	const marker_size = g_marker_size * 1.4 / g_pos.scale / g_map.bg_scale;

	const spawners = [];
	for (const type in g_filtered_spawners) {
		for (const spawner of g_filtered_spawners[type]) {
			const x = spawner.pos[0];
			const y = spawner.pos[2];

			if (mx >= x - marker_size / 2 &&
			    my < y + marker_size / 2 &&
			    mx < x + marker_size / 2 &&
			    my >= y - marker_size / 2) {
				spawners.push(spawner);
			}
		}
	}

	return spawners;
}

const get_icon = (type) => {
	if (g_icons[type]) return g_icons[type];

	return (async () => {
		const imgblob = await fetch('/editor/img/marker-' + type + '.png').then(r => r.blob());
		const img = await createImageBitmap(imgblob);
		g_icons[type] = img;
		return img;
	})();
};

const spawner_coords_to_map = (x, y) => {
	return {
		x: (0.5 * g_map.size.x + x / 2) * g_map.bg_scale + 0,
		y: (0.5 * g_map.size.y - y / 2) * g_map.bg_scale - 0
	};
}

const redraw = () => {
	const pos = g_pos;
	g_canvas_id = (++g_canvas_id) % g_canvases.length;
	const canvas = g_active_canvas = g_canvases[g_canvas_id];
	const ctx = canvas.getContext('2d');

	const drawn_spawners = {};
	for (const t in g_filtered_spawners) {
		drawn_spawners[t] = [];
		for (const spawner of (g_filtered_spawners[t] || [])) {
			let { x, y } = spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);
			x *= g_pos.scale;
			y *= g_pos.scale;

			if (x <= g_pos.offset.x - canvas.width / 8 || x > g_pos.offset.x + canvas.width * 7 / 8 ||
				y <= g_pos.offset.y - canvas.height / 8 || y > g_pos.offset.y + canvas.height * 7 / 8) {
				continue;
			}

			drawn_spawners[t].push(spawner);
		}
	}

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.translate(-pos.offset.x + canvas.width/8, -pos.offset.y + canvas.height/8);

	const drawAt = (img, rad, x, y, width, height) => {
		ctx.translate(x, y);
		ctx.rotate(rad);
		ctx.drawImage(img, -width / 2, -height / 2, width, height);
		ctx.rotate(-rad);
		ctx.translate(-x, -y);
	}

	let i;
	const select_img = get_icon('select');
	for (const list in drawn_spawners) {
		let marker_img;
		if (list == 'monster') {
			marker_img = get_icon('red');
		} else if (list == 'npc') {
			marker_img = get_icon('yellow');
		} else if (list == 'resource') {
			marker_img = get_icon('green');
		}

		const spawner_list = drawn_spawners[list];

		if (g_opts?.['show-name-labels']) {
			for (const spawner of spawner_list) {
				let { x, y } = spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);
				x *= pos.scale;
				y *= pos.scale;

				const name = spawner.name;
				const w = ctx.measureText(name).width;

				ctx.fillStyle = 'black';
				ctx.fillRect(x + g_marker_size / 2 + 8, y - 11, w + 14, 22);
				ctx.font = '12px Arial';
				ctx.fillStyle = 'white';
				ctx.fillText(name, x + g_marker_size / 2 + 14, y + 5);
			}
		}

		for (const spawner of spawner_list) {
			let { x, y } = spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);
			x *= pos.scale;
			y *= pos.scale;
			const rad = spawner.dir ? (-Math.atan2(spawner.dir[2], spawner.dir[0]) + Math.PI / 2) : 0;

			let _marker_img = marker_img;
			if (!spawner?.groups?.length ||
				!spawner.groups?.find(g => g.type) ||
				spawner._removed) {
				_marker_img = get_icon('crossed');
			}
			drawAt(_marker_img, rad, x, y, g_marker_size, g_marker_size);
			if (g_selected_spawners.has(spawner.id)) {
				ctx.drawImage(select_img, x - g_marker_size / 2, y - g_marker_size / 2, g_marker_size, g_marker_size);
			}
		}
	}
};
