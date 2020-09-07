/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class Window {
	static container;
	static bounds;
	static dragged_win;
	static style_el = newStyle(ROOT_URL + 'css/window.css');

	constructor(dom) {
		this.dom = dom;
		this.shadow = dom.shadowRoot;
		this.dragOffset = { x: 0, y: 0 };

		dom.onmousedown = (e) => this.onmousedown(e);
	}

	static set_container(container) {
		Window.container = container;
		Window.bounds = container.getBoundingClientRect();
	}

	static async open(win_id, { prev_win } = {}) {
		const win = document.createElement('div');
		win.className = 'window ' + win_id;
		const shadow = win.attachShadow({mode: 'open'});
		const tpl = await get(ROOT_URL + 'tpl/window/' + win_id + '.tpl');
		const els = newArrElements(tpl.data);
		shadow.append(Window.style_el.cloneNode());
		shadow.append(...els);
		Window.container.prepend(win);
		return new Window(win);
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

		e.preventDefault();
		Window.dragged_win = this;
		Window.dragged_win.dragOffset.x = e.clientX - bounds.left;
		Window.dragged_win.dragOffset.y = e.clientY - bounds.top;
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
