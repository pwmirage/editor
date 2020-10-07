const g_canvases = [];
let g_canvas_id = 0;

let g_map = null;
let g_opts = null;
let g_objs = {};
let g_pos = null;
let g_marker_size = 0;
let g_window_size = { width: 1, height: 1 };

/* both spawners and resources */
let g_drawn_spawners = null;
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
			break;
		}
		case 'mouse': {
			const x = e.data.x;
			const y = e.data.y;

			resp.hovered_spawner = get_spawner_at(x, y);
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
			let arr = null;
			if (obj._db.type.startsWith('resources_')) {
				arr = g_objs.resources;
			} else if (obj._db.type.startsWith('spawners_')) {
				arr = g_objs.spawners;
			} else if (obj._db.type == 'monsters') {
				arr = g_objs.monsters;
			}

			arr.set(obj.id, obj);
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
	const map = g_objs[type] = new Map();
	for (const obj of arr) {
		map.set(obj.id, obj);
	}
}

const get_spawner_at = (mx, my) => {
	if (!g_drawn_spawners) {
		return null;
	}

	const marker_size = g_marker_size * 1.4 / g_pos.scale / g_map.bg_scale;

	for (const type in g_drawn_spawners) {
		for (const spawner of g_drawn_spawners[type]) {
			const x = spawner.pos[0];
			const y = spawner.pos[2];

			if (mx >= x - marker_size / 2 &&
			    my < y + marker_size / 2 &&
			    mx < x + marker_size / 2 &&
			    my >= y - marker_size / 2) {
				return spawner;
			}
		}
	}

	return null;
}

const get_name = (spawner, group_idx = 0) => {
	let obj = null;
	const type = spawner.groups[group_idx]?.type;
	if (spawner._db.type.startsWith('resources_')) {
		obj = g_objs.mines?.get(type);
	} else {
		obj = g_objs.npcs?.get(type) || g_objs.monsters?.get(type);
	}
	return obj?.name;
};

const get_icon = (type) => {
	if (g_icons[type]) return g_icons[type];

	return (async () => {
		const imgblob = await fetch('/editor/img/marker-' + type + '.png').then(r => r.blob());
		const img = await createImageBitmap(imgblob);
		g_icons[type] = img;
		return img;
	})();
};

const filter_spawners = (canvas) => {
	const opt = (q) => g_opts[q];

	const filters = { npc: [], resource: [], mob: [] };

	if (!opt('npc-show')) filters.npc.push((s) => false);
	if (!opt('npc-show-auto')) filters.npc.push((s) => s.trigger);
	if (!opt('npc-show-on-trigger')) filters.npc.push((s) => !s.trigger);
	if (!opt('resource-show')) filters.resource.push((s) => false);
	if (!opt('resource-show-auto')) filters.resource.push((s) => s.trigger);
	if (!opt('resource-show-on-trigger')) filters.resource.push((s) => !s.trigger);
	if (!opt('mob-show')) filters.mob.push((s) => false);
	if (!opt('mob-show-auto')) filters.mob.push((s) => s.trigger);
	if (!opt('mob-show-on-trigger')) filters.mob.push((s) => !s.trigger);

	const by_mob = (fn) => {
		return (s) => {
			const type = s.groups[0]?.type || 0;
			const mob = g_objs.monsters[type];
			if (!mob) return true;
			return fn(mob);
		}
	}
	if (!opt('mob-show-ground')) filters.mob.push(by_mob((m) => m.stand_mode == 2 || m.swim_speed));
	if (!opt('mob-show-flying')) filters.mob.push(by_mob((m) => m.stand_mode != 2 || m.swim_speed));
	if (!opt('mob-show-water')) filters.mob.push(by_mob((m) => !m.swim_speed));

	if (!opt('mob-show-boss')) filters.mob.push(by_mob((m) => !m.show_level));
	if (!opt('mob-show-nonboss')) filters.mob.push(by_mob((m) => m.show_level));
	if (!opt('mob-show-aggressive')) filters.mob.push(by_mob((m) => !m.is_aggressive));
	if (!opt('mob-show-nonaggressive')) filters.mob.push(by_mob((m) => m.is_aggressive));

	const minlevel = opt('mob-show-lvl-min');
	const maxlevel = opt('mob-show-lvl-max');
	filters.mob.push(by_mob((m) => m.level >= minlevel && m.level <= maxlevel));

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

	const search = opt('search')?.toLowerCase();

	const drawn_spawners = { npc: [], mob: [], resource: [] };
	for (const list of [g_objs.resources, g_objs.spawners]) {
		if (!list) continue;
		for (const spawner of list.values()) {
			let { x, y } = spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);
			x *= g_pos.scale;
			y *= g_pos.scale;

			if (x <= g_pos.offset.x - canvas.width / 8 || x > g_pos.offset.x + canvas.width * 7 / 8 ||
					y <= g_pos.offset.y - canvas.height / 8 || y > g_pos.offset.y + canvas.height * 7 / 8) {
				continue;
			}

			if (search) {
				let match = false;

				if (spawner.name?.toLowerCase()?.includes(search)) {
					match = true;
				}

				for (let i = 0; i < spawner.groups.length; i++) {
					if (get_name(spawner, i)?.toLowerCase()?.includes(search)) {
						match = true;
						break;
					}
				}

				if (!match) {
					continue;
				}
			}

			let type = '';
			if (spawner._db.type.startsWith('resources_')) {
				type = 'resource';
			} else if (spawner.is_npc) {
				type = 'npc';
			} else {
				type = 'mob';
			}

			if (!map_filters[type](spawner)) {
				continue;
			}

			drawn_spawners[type].push(spawner);
		}
	}

	g_drawn_spawners = drawn_spawners;
}

const spawner_coords_to_map = (x, y) => {
	return {
		x: (0.5 * g_map.size.x + x / 2) * g_map.bg_scale + 0,
		y: (0.5 * g_map.size.y - y / 2) * g_map.bg_scale - 0
	};
}

const redraw = () => {
	const t0 = performance.now();

	const pos = g_pos;
	g_canvas_id = (++g_canvas_id) % g_canvases.length;
	const canvas = g_active_canvas = g_canvases[g_canvas_id];
	const ctx = canvas.getContext('2d');

	filter_spawners(canvas);

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
	for (const list in g_drawn_spawners) {
		let marker_img;
		if (list == 'mob') {
			marker_img = get_icon('red');
		} else if (list == 'npc') {
			marker_img = get_icon('yellow');
		} else if (list == 'resource') {
			marker_img = get_icon('green');
		}

		const spawner_list = g_drawn_spawners[list];

		if (g_opts['show-name-labels']) {
			for (const spawner of spawner_list) {
				let { x, y } = spawner_coords_to_map(spawner.pos[0], spawner.pos[2]);
				x *= pos.scale;
				y *= pos.scale;

				if (!g_opts.focused_spawners?.size || g_opts.focused_spawners?.has(spawner)) {
					ctx.globalAlpha = 1.0;
				} else {
					ctx.globalAlpha = 0.3;
				}

				const name = get_name(spawner);
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
			const rad = -Math.atan2(spawner.dir[2], spawner.dir[0]) + Math.PI / 2;
			if (!g_opts.focused_spawners?.size || g_opts.focused_spawners?.has(spawner)) {
				ctx.globalAlpha = 1.0;
			} else {
				ctx.globalAlpha = 0.3;
			}
			drawAt(marker_img, rad, x, y, g_marker_size, g_marker_size);
		}
	}

	const t1 = performance.now();
	console.log('canvas rendering took: ' + (t1 - t0) + 'ms');
};