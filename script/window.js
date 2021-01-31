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

			this.full_bounds = this.dom_win.getBoundingClientRect();
		} else {
			this.focus();
			this.move(this.args.x ?? 10, this.args.y ?? 10);

			Window.container.append(this.dom);

			this.full_bounds = this.dom_win.getBoundingClientRect();
			if (this.full_bounds.height > Window.bounds.height) {
				this.dom_win.style.height = Window.bounds.height - 40 + 'px';
				this.move(20, 20);
			}

			if (this.full_bounds.width > Window.bounds.width) {
				this.dom_win.style.width = Window.bounds.width - 40 + 'px';
				this.move(20, 20);
			}

			this.full_bounds = this.dom_win.getBoundingClientRect();
			this.dom_win.style.maxHeight = this.full_bounds.height + 'px';
		}

		/* remove all text selection */
		window.getSelection().removeAllRanges();
	}

	tpl_compile_cb(dom) {
		HTMLSugar.process(dom, this);
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
			let w = Math.max(250, Math.min(Window.bounds.width, (mousex - offset.x)));
			let h = Math.max(250, Math.min(Window.bounds.height, (mousey - offset.y)));

			win.dom_win.style.width = w + 'px';
			win.dom_win.style.height = h + 'px';

			const bounds = win.dom_content.getBoundingClientRect();
			if (w < bounds.width - 2 || h - (win.dom_header?.offsetHeight || 0) > bounds.height - 2) {
				win.dom_win.style.width = (bounds.width - 2) + 'px';
				win.dom_win.style.height = (bounds.height + (win.dom_header.offsetHeight || 0) - 2) + 'px';
			}
			e.preventDefault();
		}
	}

	onmousedown(e) {
		const bounds = this.dom_win.getBoundingClientRect();

		if (Window.focus_win != this) {
			this.focus();
		}

		if (e.clientY - bounds.top <= this.dom_header?.offsetHeight || 0) {
			if (this.dom_win.classList.contains('maximized')) {
				return;
			}

			e.preventDefault();
			Window.dragged_win = this;
			Window.dragged_win.dragOffset.x = e.clientX - bounds.left;
			Window.dragged_win.dragOffset.y = e.clientY - bounds.top;
			this.bounds = this.dom_win.getBoundingClientRect();
		} else if (this.dom_win.classList.contains('resizable') &&
				e.clientX - bounds.left >= bounds.width - 18 &&
				e.clientY - bounds.top >= bounds.height - 18) {
			if (this.dom_win.classList.contains('minimized')) {
				return;
			}

			e.preventDefault();
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
		/* to be inherited */
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
