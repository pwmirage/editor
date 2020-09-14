/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Window {
	static container;
	static bounds;
	static dragged_win;

	constructor(dom) {
		this.dom = dom;
		this.shadow = dom.shadowRoot;
		this.dom_win = this.shadow.querySelector('.window');
		this.dragOffset = { x: 0, y: 0 };

		dom.onmousedown = (e) => this.onmousedown(e);
	}

	init() { }

	static set_container(container) {
		Window.container = container;
		Window.bounds = container.getBoundingClientRect();
	}

	static async open(win_type, win_id) {
		const dom = document.createElement('div');
		dom.className = 'window ' + win_id;
		const shadow = dom.attachShadow({mode: 'open'});
		const tpl = await get(ROOT_URL + 'tpl/window/' + win_id + '.tpl');
		const els = newArrElements(tpl.data);
		shadow.append(newStyle(ROOT_URL + 'css/window.css'));
		shadow.append(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));
		shadow.append(...els);

		const c = eval(win_type);
		const win = new c(dom);
		await win.init();

		for (const el of shadow.querySelectorAll('[data-onclick]')) {
			const f_str = el.dataset.onclick;
			el.dataset.onclick = '';
			const f = new Function('win', f_str);
			el.onclick = (el) => f.call(el, win);
		}

		const menu = shadow.querySelector('.header > .menu');

		let button;
		button = menu.querySelector('.minimize');
		if (button) button.onclick = () => win.minimize();
		button = menu.querySelector('.maximize');
		if (button) button.onclick = () => win.maximize();
		button = menu.querySelector('.close');
		if (button) button.onclick = () => win.close();

		Window.container.prepend(dom);
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
	}

	static onmousemove(e)
	{
		if (Window.dragged_win == null) {
			return;
		}

		const mousex = e.clientX - Window.bounds.left;
		const mousey = e.clientY - Window.bounds.top;

		const offset = Window.dragged_win.dragOffset;
		Window.dragged_win.move(mousex - offset.x, mousey - offset.y);
	}

	onmousedown(e) {
		const bounds = this.dom.getBoundingClientRect();
		const header = this.shadow.querySelector('.header');

		if (header) {
			if (e.clientY - bounds.top > header.offsetHeight) {
				return;
			}
		}

		if (this.dom_win.classList.contains('maximized')) {
			return;
		}

		e.preventDefault();
		Window.dragged_win = this;
		Window.dragged_win.dragOffset.x = e.clientX - bounds.left;
		Window.dragged_win.dragOffset.y = e.clientY - bounds.top;
	}

	minimize() {
		this.dom_win.classList.toggle('minimized');
	}

	maximize() {
		const maximized = this.dom_win.classList.toggle('maximized');
		if (maximized) {
			this.windowed_pos = [ this.dom.style.left, this.dom.style.top ];
			this.dom.style.left = 0;
			this.dom.style.top = 0;
			this.dom_win.style.paddingBottom = Window.bounds.top + 'px';
		} else {
			this.dom.style.left = this.windowed_pos[0];
			this.dom.style.top = this.windowed_pos[1];
			this.dom_win.style.paddingBottom = 0;
		}
	}

	move(new_x, new_y) {
		this.dom.style.left = new_x + 'px';
		this.dom.style.top = new_y + 'px';
	}

	absmove(new_x, new_y) {
		new_x -= Window.container_bounds.left;
		new_y -= Window.container_bounds.top;
		window_move(new_x, new_y);
	}

	close(win_id) {
		this.dom.remove();
	}
}
