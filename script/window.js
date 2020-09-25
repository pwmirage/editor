/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Window {
	static container;
	static bounds;
	static dragged_win;
	static resized_win;
	static focus_win_index = 0;
	static focus_win;

	constructor(args) {
		this.args = args || {};

		this.dom = document.createElement('div');
		this.dom.className = 'window';
		this.shadow = this.dom.attachShadow({mode: 'open'});

		this.dragOffset = { x: 0, y: 0 };
		this.resizeOffset = { x: 0, y: 0 };
		this.margins = { x: 0, y: 0 };
	}

	init() {
		this.shadow.append(newStyle(ROOT_URL + 'css/window.css'));
		this.shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		this.dom_win = this.shadow.querySelector('.window');
		this.dom_header = this.shadow.querySelector('.window > .header');
		this.dom_content = this.shadow.querySelector('.window > .content');

		if (!this.dom_win || !this.dom_header || !this.dom_content) {
			throw new Error('Incomplete initialization of "' + this.constructor.name + '" window.');
		}

		this.dom.onmousedown = (e) => this.onmousedown(e);

		const menu = this.shadow.querySelector('.header > .menu');
		const queryEl = (name) => menu.querySelector(name) || {};
		queryEl('.minimize').onclick = () => this.minimize();
		queryEl('.maximize').onclick = () => this.maximize();
		queryEl('.close').onclick = () => this.close();

		this.move(this.args.x ?? 10, this.args.y ?? 10);
		Window.container.append(this.dom);
		this.full_bounds = this.dom_win.getBoundingClientRect();
		this.dom_win.style.maxHeight = this.full_bounds.height + 'px';
	}

	tpl_compile_cb(dom_arr) {
		const callbacks = [ 'onclick', 'oninput' ];

		for (const dom of dom_arr) {
			if (!dom.querySelectorAll) {
				/* not an Element */
				continue;
			}

			for (const c of callbacks) {
				for (const el of dom.querySelectorAll('[data-' + c + ']')) {
					const f_str = el.dataset[c];
					el.dataset[c] = '';
					const f = new Function('win', f_str);
					el[c] = (el) => f.call(el, this);
				}
			}
		}
	}

	static set_container(container) {
		Window.container = container;
		Window.bounds = container.getBoundingClientRect();
	}

	static async open(args) {
		const win_class = this;
		const win = new win_class(args);
		await win.init();
		return win;
	}

	static close_all() {
		for (const win_dom of Window.container.children) {
			Window.container.remove(win_dom);
		}
	}

	static coords_to_window(x, y) {
		x -= Window.container_bounds.x;
		y -= Window.container_bounds.y;
		return [ x, y ];
	}

	static get_el_coords(el) {
		var bounds = el.getBoundingClientRect();
		bounds.x -= Window.container_bounds.x;
		bounds.y -= Window.container_bounds.y;
		bounds.left -= Window.container_bounds.left;
		bounds.right -= Window.container_bounds.right;
		bounds.top -= Window.container_bounds.top;
		bounds.bottom -= Window.container_bounds.bottom;
		return bounds;
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
			let w = Math.max(250, (mousex - offset.x));
			let h = Math.max(300, (mousey - offset.y));

			win.dom_win.style.width = w + 'px';
			win.dom_win.style.height = h + 'px';

			const bounds = win.dom_content.getBoundingClientRect();
			if (w < parseInt(bounds.width) || h - win.dom_header.offsetHeight > parseInt(bounds.height)) {
				win.dom_win.style.width = bounds.width + 'px';
				win.dom_win.style.height = (bounds.height + win.dom_header.offsetHeight) + 'px';
			}
			e.preventDefault();
		}
	}

	onmousedown(e) {
		const bounds = this.dom_win.getBoundingClientRect();

		if (Window.focus_win != this) {
			this.dom.style.zIndex = Window.focus_win_index++;
			Window.focus_win = this;
			if (this.onfocus) this.onfocus.call(this);
		}

		if (e.clientY - bounds.top <= this.dom_header.offsetHeight) {
			if (this.dom_win.classList.contains('maximized')) {
				return;
			}

			e.preventDefault();
			Window.dragged_win = this;
			Window.dragged_win.dragOffset.x = e.clientX - bounds.left;
			Window.dragged_win.dragOffset.y = e.clientY - bounds.top;
		} else if (this.dom_win.classList.contains('resizable') &&
				e.clientX - bounds.left >= bounds.width - 18 &&
				e.clientY - bounds.top >= bounds.height - 18) {
			if (this.dom_win.classList.contains('minimized')) {
				return;
			}

			e.preventDefault();
			Window.resized_win = this;
			const height = this.dom_header.offsetHeight + this.dom_content.offsetHeight;
			Window.resized_win.resizeOffset.x = e.clientX - bounds.width - Window.bounds.left;
			Window.resized_win.resizeOffset.y = e.clientY - height - Window.bounds.top;
			this.dom_win.style.maxHeight = '';
		}
	}

	minimize() {
		const minimized = this.dom_win.classList.toggle('minimized');
		if (minimized) {
			this.full_bounds = this.dom_win.getBoundingClientRect();
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
			this.dom_win.style.paddingBottom = Window.bounds.top + 'px';
			this.dom_win.style.maxHeight = '100vh';

		} else {
			this.dom.style.left = this.windowed_pos[0];
			this.dom.style.top = this.windowed_pos[1];
			this.dom_win.style.paddingBottom = 0;
			this.dom_win.style.maxHeight = this.full_bounds.height + 'px';
			if (this.was_minimized) {
				this.minimize();
				this.was_minimized = false;
			}
		}
	}

	move(new_x, new_y) {
		this.dom.style.left = (new_x - this.margins.x) + 'px';
		this.dom.style.top = (new_y - this.margins.y) + 'px';
	}

	absmove(new_x, new_y) {
		new_x -= Window.container_bounds.left;
		new_y -= Window.container_bounds.top;
		window_move(new_x, new_y);
	}

	set_margin(x, y) {
		this.dom.style.marginTop = y + 'px';
		this.dom.style.marginLeft = x + 'px';
		this.margins = { x, y };
	}

	close() {
		if (this.onclose) this.onclose.call(this);
		this.dom.remove();
	}
}
