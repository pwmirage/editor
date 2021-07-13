/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Window {
	static container;
	static bounds = { x: 0, y: 0, top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
	static dragged_win;
	static resized_win;
	static focus_win_index = 0;
	static focus_win;

	constructor(args) {
		this.args = args || {};
		this.parent_win = this.args.parent_win;

		this.dom = document.createElement('div');
		this.dom._win = this;
		this.dom.className = 'dom window';
		this.shadow = this.dom.attachShadow({mode: 'open'});

		this.dragOffset = { x: 0, y: 0 };
		this.resizeOffset = { x: 0, y: 0 };
		this.margins = { x: 0, y: 0 };

		const styles = [];
		styles.push(newStyle(ROOT_URL + 'css/window.css'));
		styles.push(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		this.style_promises = styles.map((s) => new Promise((resolve) => { s.onload = resolve; }));
		this.shadow.append(...styles);
	}

	async init() {
		this.dom_win = this.shadow.querySelector('.window');
		this.dom_header = this.shadow.querySelector('.window > .header');
		this.dom_content = this.shadow.querySelector('.window > .content');

		if (!this.dom_win || (!this.dom_content && !this.dom_header)) {
			throw new Error('Incomplete initialization of "' + this.constructor.name + '" window.');
		}

		this.dom.onmousedown = (e) => this.onmousedown(e);

		const queryEl = (name) => this.dom_header?.querySelector(name) || {};
		queryEl('.details').onclick = (e) => this.details(queryEl('.details'), e);
		queryEl('.minimize').onclick = () => this.minimize();
		queryEl('.maximize').onclick = () => this.maximize();
		queryEl('.close').onclick = () => this.close();
		queryEl('.refresh').onclick = () => this.refresh();

		await Promise.all(this.style_promises);

		if (this.parent_win) {
			this.dom.classList.add('child-dom');
			this.dom_win.classList.add('child-dom');
			this.dom_win.classList.remove('resizable');
			this.dom_win.style.width = '';
			this.dom_win.style.height = '';
			this.dom_win.style.maxHeight = '';
			this.dom.style.borderLeft = this.dom.style.borderRight = '1px var(--header-color) solid !important';
			if (this.dom_win.parentNode) {
				this.dom_win.parentNode.style.height = '100%';
			}

			this.full_bounds = this.bounds = this.dom_win.getBoundingClientRect();
		} else {
			if (Window.container) {
				Window.container.append(this.dom);
			}

			this.focus();
			this.full_bounds = this.bounds = this.dom_win.getBoundingClientRect();

			let x, y;
			if (this.args.x !== undefined || this.args.y !== undefined) {
				x = this.args.x ?? 10;
				y = this.args.y ?? 10;
			} else {
				const newpos = Window.find_pos_for(this, this.full_bounds, this.args.around_bounds);
				x = newpos.x;
				y = newpos.y;
			}
			this.move(x, y);

			if (this.full_bounds.height > Window.bounds.height) {
				this.dom_win.style.height = Window.bounds.height - 40 + 'px';
				this.move(20, 20);
			}

			if (this.full_bounds.width > Window.bounds.width) {
				this.dom_win.style.width = Window.bounds.width - 40 + 'px';
				this.move(20, 20);
			}

			this.full_bounds = this.bounds = this.dom_win.getBoundingClientRect();
			this.dom_win.style.maxHeight = this.full_bounds.height + 'px';
		}

		/* remove all text selection */
		window.getSelection().removeAllRanges();

	}

	tpl_compile_cb(dom) {
		HTMLSugar.process(dom, this);
		if (this.dom_header && dom.querySelector('.window > .header')) {
			this.close();
			this.constructor.open(this.args);
		}
	}

	static set_container(container) {
		Window.container = container;
		Window.onresize();

		const fn = () => {
			Window.bounds = Window.container.getBoundingClientRect();
			for (const win_dom of Window.container.children) {
				const win = win_dom._win;
				if (!win) {
					continue;
				}

				let bounds = win.dom_win.getBoundingClientRect();
				if (bounds.left < Window.bounds.left) {
					win.absmove(0, undefined);

				}
				if (bounds.top < Window.bounds.top) {
					win.absmove(undefined, 0);
				}

				bounds = win.dom_win.getBoundingClientRect();
				if (bounds.right > Window.bounds.right) {
					win.absmove(Math.max(0, Window.bounds.right - bounds.width), undefined);

				}
				if (bounds.bottom > Window.bounds.bottom) {
					win.absmove(undefined, Math.max(0, Window.bounds.bottom - bounds.height));
				}

				bounds = win.dom_win.getBoundingClientRect();
				if (bounds.height > Window.bounds.height) {
					win.dom_win.style.height = Window.bounds.height + 'px';
				}
				if (bounds.width > Window.bounds.width) {
					win.dom_win.style.width = Window.bounds.width + 'px';
				}
			}
		};

		const fn2 = async () => {
			await fn();
			setTimeout(fn2, 2000);
		}

		fn2();
	}

	static async open(args) {
		const win_class = this;
		const win = new win_class(args);
		await win.init();
		return win;
	}

	static close_all() {
		if (!Window.container) {
			return;
		}

		const arr = [...Window.container.children];
		for (const win_dom of arr) {
			if (!win_dom._win) {
				continue;
			}

			win_dom._win.close();
		}
	}

	static coords_to_window(x, y) {
		x -= Window.bounds.x;
		y -= Window.bounds.y;
		return [ x, y ];
	}

	static get_el_coords(el) {
		const rbounds = el.getBoundingClientRect();
		const bounds = {};
		bounds.x = rbounds.x - Window.bounds.x;
		bounds.y = rbounds.y - Window.bounds.y;
		bounds.left = rbounds.left - Window.bounds.left;
		bounds.right = rbounds.right -  Window.bounds.left;
		bounds.top = rbounds.top - Window.bounds.top;
		bounds.bottom = rbounds.bottom - Window.bounds.top;
		return bounds;
	}

	static find_pos_for(owner_win, bounds, around_bounds, prefer_right) {
		if (!around_bounds) {
			around_bounds = { left: 0, right: 0, top: 5 + Window.bounds.top, bottom: 5 + Window.bounds.top };
		}
		const ar_b = around_bounds;
		const b = bounds;

		const get_collide = (col_b) => {
			for (let idx = Window.container.children.length - 1; idx >= 0; idx--) {
				const win_dom = Window.container.children[idx];
				const win = win_dom._win;
				if (!win || win == owner_win) {
					continue;
				}

				const win_b = win.full_bounds;
				if (win_b.left < col_b.right && win_b.right > col_b.left &&
					win_b.top < col_b.bottom && win_b.bottom > col_b.top) {
					return win;
				}
			}

			return null;
		};

		/* we'll try to find a place on the screen that's not covered by windows */

		let x, y;
		do {
			/* try to place on the right side */
			x = ar_b.right + 5;
			y = ar_b.top - Window.bounds.top;
			let win_l, win_r;
			if ((prefer_right === undefined || prefer_right) &&
					ar_b.right + b.width < Window.bounds.right) {
				const collision_b = { left: ar_b.right + 72, top: bounds.top };
				collision_b.bottom = bounds.top + (bounds.bottom - bounds.top) / 2;
				collision_b.right = collision_b.left;

				win_r = get_collide(collision_b)
				if (!win_r) {
					break;
				}
			}

			/* try to place on the left side */
			x = ar_b.left - b.width - 5;
			y = ar_b.top - Window.bounds.top;
			if ((prefer_right === undefined || !prefer_right) &&
					ar_b.left - b.width > Window.bounds.left) {
				const collision_b = { left: ar_b.left - 72, top: bounds.top };
				collision_b.bottom = bounds.top + (bounds.bottom - bounds.top) / 2;
				collision_b.right = collision_b.left;

				win_l = get_collide(collision_b)
				if (!win_l) {
					break;
				}
			}

			/* neither side works? try recursively further */
			if (win_r && ar_b.right + b.width < Window.bounds.right) {
				return Window.find_pos_for(owner_win, bounds, win_r.full_bounds, true);
			} else if (win_l) {
				return Window.find_pos_for(owner_win, bounds, win_l.full_bounds, false);
			} else {
				/* no side anywhere? force-place on the right side of the screen */
				x = Window.bounds.right - b.width - 5;
				y = 5;
			}

		} while(0);

		return { x, y };
	}

	static onmouseup(e) {
		Window.dragged_win = null;
		Window.resized_win = null;
	}

	static onmousemove(e)
	{
		if (Window.dragged_win) {
			const mousex = e.clientX - Window.bounds.left;
			const mousey = e.clientY - Window.bounds.top;

			const offset = Window.dragged_win.dragOffset;
			Window.dragged_win.move(mousex - offset.x, mousey - offset.y);
			e.preventDefault();
		} else if (Window.resized_win) {
			const mousex = e.clientX - Window.bounds.left;
			const mousey = e.clientY - Window.bounds.top;

			const win = Window.resized_win;
			const offset = win.resizeOffset;
			let w = Math.max(win.min_height || 250, Math.min(Window.bounds.width, (mousex - offset.x)));
			let h = Math.max(win.min_height || 250, Math.min(Window.bounds.height, (mousey - offset.y)));

			win.dom_win.style.width = w + 'px';
			win.dom_win.style.height = h + 'px';

			const bounds = win.dom_content.getBoundingClientRect();
			if (w < bounds.width - 2 || h - (win.dom_header?.offsetHeight || 0) > bounds.height - 2) {
				win.dom_win.style.width = (bounds.width - 2) + 'px';
				win.dom_win.style.height = (bounds.height + (win.dom_header.offsetHeight || 0) - 2) + 'px';
			}
			e.preventDefault();

			if (win.onresize) {
				win.onresize();
			}
		}
	}

	onmousedown(e) {
		const bounds = this.dom_win.getBoundingClientRect();

		if (Window.focus_win != this) {
			if (Window.focus_win?.onblur) {
				Window.focus_win.onblur();
			}
			this.focus();
		}

		const hbounds = this.dom_header ? this.dom_header.getBoundingClientRect() : {};
		if (e.clientY >= (hbounds.top || 0) && e.clientY < (hbounds.bottom || 0) &&
				e.clientX >= (hbounds.left || 0) && e.clientX < (hbounds.right || 0)) {
			if (this.dom_win.classList.contains('maximized')) {
				return;
			}

			e.stopPropagation();
			Window.dragged_win = this;
			Window.dragged_win.dragOffset.x = e.clientX - bounds.left;
			Window.dragged_win.dragOffset.y = e.clientY - bounds.top;
			this.bounds = this.dom_win.getBoundingClientRect();
		} else if (this.dom_win.classList.contains('resizable') &&
				e.clientX - bounds.left >= bounds.width - 18 &&
				e.clientY - bounds.top >= bounds.height - 18) {
			if (this.parent_win || this.dom_win.classList.contains('minimized')) {
				return;
			}

			e.stopPropagation();
			this.min_height = parseInt(this.dom_win.style.minHeight || 0);
			Window.resized_win = this;
			const height = (this.dom_header?.offsetHeight || 0) + this.dom_content.offsetHeight - 2;
			Window.resized_win.resizeOffset.x = e.clientX - bounds.width - Window.bounds.left;
			Window.resized_win.resizeOffset.y = e.clientY - height - Window.bounds.top;
			this.dom_win.style.maxHeight = '';
		}
	}

	static onresize(e) {
		Window.bounds = Window.container.getBoundingClientRect();
		for (const win_dom of Window.container.children) {
			if (win_dom._win?.onresize) {
				win_dom._win.onresize();
			}
		}
	}

	async details(details_el, e) {
		const coords = Window.get_el_coords(details_el);
		const x = coords.left;
		const y = coords.bottom;

		const win = await RMenuWindow.open({
		x, y, bg: false,
		entries: [
			{ id: 3, name: 'Show project diff', disabled: !this.obj._db.project_initial_state },
			{ id: 4, name: 'Undo all changes', disabled: !this.obj._db.project_initial_state },
			{ id: 1, name: 'Remove', visible: !this.obj._removed },
			{ id: 2, name: 'Restore', visible: !!this.obj._removed },
		]});
		const sel = await win.wait();
		switch (sel) {
			case 1: {
				db.open(this.obj);
				this.obj._removed = true;
				db.commit(this.obj);
				this.dom_header.classList.add('removed');
				break;
			}
			case 2: {
				db.open(this.obj);
				this.obj._removed = false;
				db.commit(this.obj);
				this.dom_header.classList.remove('removed');
				break;
			}
			case 3: {
				DiffWindow.open({ obj: this.obj, prev: this.obj._db.project_initial_state });
				break;
			}
			case 4: {
				db.open(this.obj);
				/* unset all fields, including any added ones */
				for (const f in this.obj) {
					if (f == '_db') continue;
					this.obj[f] = undefined;
				}
				DB.copy_obj_data(this.obj, this.obj._db.project_initial_state);
				db.commit(this.obj);
				break;
			}
		}
	}

	minimize() {
		const minimized = this.dom_win.classList.toggle('minimized');
		if (minimized) {
			this.full_bounds = this.bounds = this.dom_win.getBoundingClientRect();
			this.dom_win.style.overflow = 'hidden';
			this.dom_win.style.maxHeight = this.full_bounds.height + 'px';
			this.dom_win.style.maxHeight = this.dom_header.offsetHeight + 'px';
		} else {
			this.dom_win.style.maxHeight = this.full_bounds.height + 'px';
			setTimeout(() => {
				this.dom_win.style.overflow = 'visible';
			}, 400);
		}
		return minimized;
	}

	maximize() {
		const maximized = this.dom_win.classList.toggle('maximized');
		if (maximized) {
			this.windowed_pos = [ this.dom.style.left, this.dom.style.top ];
			this.was_minimized = this.dom_win.classList.contains('minimized');
			if (this.was_minimized) this.minimize();
			this.dom.style.left = 0;
			this.dom.style.top = 0;
			this.dom_win.style.maxHeight = 'calc(100vh - ' + Window.bounds.top + 'px)';

		} else {
			this.dom.style.left = this.windowed_pos[0];
			this.dom.style.top = this.windowed_pos[1];
			this.dom_win.style.maxHeight = this.full_bounds.height + 'px';
			if (this.was_minimized) {
				this.minimize();
				this.was_minimized = false;
			}
		}
		if (this.onresize) {
			this.onresize();
		}
	}

	async refresh() {
		const obj = this.obj;
		this.close();
		const nwin = await this.constructor.open({ obj });

		/* copy pos and size */
		nwin.dom.style.left = this.dom.style.left;
		nwin.dom.style.top = this.dom.style.top;
		nwin.dom_win.style.width = this.dom_win.style.width;
		nwin.dom_win.style.height = this.dom_win.style.height;
	}

	focus() {
		if (this.parent_win) {
			this.parent_win.focus();
		} else {
			this.dom.style.zIndex = Window.focus_win_index++;
			Window.focus_win = this;
		}
		if (this.onfocus) this.onfocus.call(this);
	}

	move(new_x, new_y) {
		if (!isNaN(new_x)) {
			this.dom.style.left = Math.max(-this.margins.x, Math.min(Window.bounds.width - (this.bounds?.width || 0) - this.margins.x, (new_x - this.margins.x))) + 'px';
		}
		if (!isNaN(new_y)) {
			this.dom.style.top = Math.max(-this.margins.y, Math.min(Window.bounds.height - (this.bounds?.height || 0) - this.margins.y, (new_y - this.margins.y))) + 'px';
		}
	}

	absmove(new_x, new_y) {
		new_x -= Window.bounds.left;
		new_y -= Window.bounds.top;
		this.move(new_x, new_y);
	}

	set_margin(x, y) {
		this.dom.style.marginTop = y + 'px';
		this.dom.style.marginLeft = x + 'px';
		this.margins = { x, y };
	}

	close() {
		if (this.onclose) this.onclose.call(this);
		this.dom.remove();

		/* remove all text selection */
		window.getSelection().removeAllRanges();
	}
}

class SingleInstanceWindow extends Window {
	static instances = {};

	static async open(args) {
		const typename = this.name;

		let arr = SingleInstanceWindow.instances[typename];
		if (!arr) {
			arr = SingleInstanceWindow.instances[typename] = new Map();
		}

		let win = arr.get(args.obj);
		if (win && Window.container.contains(win.dom)) {
			win.focus();
			return win;
		}

		win = await super.open(args);
		arr.set(args.obj, win);
		return win;
	}

	close() {
		const typename = this.constructor.name;
		const arr = SingleInstanceWindow.instances[typename];
		arr.delete(this.obj);
		super.close();
	}
}

class PopupWindow extends Window {
	async init() {
		return super.init();
	}
}

class MessageWindow extends Window {
	async init() {
		const html = `
<div class="window">
<div class="header">
	<span id="title">Error!</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content"><pre id="message"></pre></div>
</div>
</div>
		`;
		this.shadow.append(newElement(html));
		this.shadow.querySelector('#message').textContent = this.args.msg;
		this.shadow.querySelector('#title').textContent = this.args.title || "Message";

		this.args.x = this.args.x ?? (Window.bounds.width - 340) / 2;
		this.args.y = this.args.y ?? (Window.bounds.height - 150) / 2;
		return super.init();
	}
}
