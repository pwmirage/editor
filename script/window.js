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
		this.dom._win = this;
		this.dom.className = 'window';
		this.shadow = this.dom.attachShadow({mode: 'open'});

		this.dragOffset = { x: 0, y: 0 };
		this.resizeOffset = { x: 0, y: 0 };
		this.margins = { x: 0, y: 0 };
	}

	async init() {

		this.dom_win = this.shadow.querySelector('.window');
		this.dom_header = this.shadow.querySelector('.window > .header');
		this.dom_content = this.shadow.querySelector('.window > .content');

		if (!this.dom_win || (!this.dom_content && !this.dom_header)) {
			throw new Error('Incomplete initialization of "' + this.constructor.name + '" window.');
		}

		this.dom.onmousedown = (e) => this.onmousedown(e);

		const menu = this.shadow.querySelector('.header > .menu');
		const queryEl = (name) => menu?.querySelector(name) || {};
		queryEl('.minimize').onclick = () => this.minimize();
		queryEl('.maximize').onclick = () => this.maximize();
		queryEl('.close').onclick = () => this.close();

		const styles = [];
		styles.push(newStyle(ROOT_URL + 'css/window.css'));
		styles.push(newStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'));

		const style_promises = styles.map((s) => new Promise((resolve) => { s.onload = resolve; }));
		await Promise.all(style_promises);

		this.shadow.append(...styles);
		this.focus();
		this.move(this.args.x ?? 10, this.args.y ?? 10);

		Window.container.append(this.dom);

		this.full_bounds = this.dom_win.getBoundingClientRect();
		this.dom_win.style.maxHeight = this.full_bounds.height + 'px';

		/* remove all text selection */
		window.getSelection().removeAllRanges();
	}

	tpl_compile_cb(dom) {
		for (const el of dom.querySelectorAll('[data-onload]')) {
			const f_str = el.dataset.onload;
			el.removeAttribute('data-onload');
			const f = new Function(f_str);
			f.call(el);
		}

		for (const el of dom.querySelectorAll('[data-select]')) {
			const f_str = el.dataset.select;
			el.removeAttribute('data-select');
			const link_str = el.dataset.link;
			el.removeAttribute('data-link');
			const title_str = el.dataset.title;

			el.classList.add('input');
			el.classList.add('input-select');

			const select_arr = new Function('return ' + f_str)(this.tpl, this);
			el._mg_select = select_arr;

			const edit_el = newElement('<span class="edit"></span>');
			edit_el.classList.add('input-text');
			edit_el.contentEditable = "true";
			el.append(edit_el);

			const link_wrapper_el = newElement('<div></div>');
			const link_el = newElement('<span class="input-number"></span>');
			link_el.dataset.link = link_str;
			link_el.style.display = 'none';
			link_wrapper_el.append(link_el);
			el.append(link_wrapper_el);
			this.tpl_compile_cb(link_wrapper_el);

			const close_el = newElement('<div class="close"></div>');
			el.append(close_el);
			
			close_el.onclick = () => {
				el.classList.remove('selected');
				edit_el.focus();
				edit_el.textContent = '';
				edit_el.oninput();
			}

			const hints_el = newElement('<div class="hints"></div>');
			el.append(hints_el);

			edit_el.onclick = () => {
				el.classList.remove('selected');
				edit_el.oninput();
			}

			edit_el.onblur = () => {
				if (el.querySelector(':hover') != hints_el) {
					hints_el.style.display = 'none';
					if (hints_el.children.length == 1 && edit_el.dataset.text == hints_el.children[0].textContent) {
						el.classList.add('selected');
					}
				}
			}

			edit_el.oninput = () => {
				const search = edit_el.textContent.toLowerCase();
				console.log(search);
				let n = 0;
				const hints = [];
				for (const o of select_arr) {
					if (o.name?.toLowerCase()?.includes(search)) {
						hints[n++] = o;
						if (n > 9) {
							break;
						}
					}
				}

				n = 0;
				const hint_els = [];
				for (const t of hints) {
					if (n > 8) {
						const div = document.createElement('span');
						div.className = 'text';
						div.textContent = '...';
						hint_els.push(div);

						div.onclick = async () => {
							const win = await SimpleChooserWindow.open({ title: title_str, search: edit_el.textContent, items: select_arr });
							win.onchoose = (type) => {
								if (type) {
									edit_el.dataset.text = edit_el.title = edit_el.textContent = type.name;
									link_el.textContent = type.id;
									link_el.oninput();
									el.classList.add('selected');
								} else {
									edit_el.focus();
								}
							};
						};

						break;
					}
					const div = document.createElement('span');
					n++;
					const id = t.id;
					const pos = t.name.toLowerCase().indexOf(search);
					div.innerHTML = t.name.substring(0, pos) + '<b>' + t.name.substring(pos, pos + search.length) + '</b>' + t.name.substring(pos + search.length);
					div.onclick = () => {
						edit_el.dataset.text = edit_el.title = edit_el.textContent = div.textContent;
						link_el.textContent = id;
						link_el.oninput();
						el.classList.add('selected');
					};
					hint_els.push(div);
				}

				let c = null;
				while ((c = hints_el.firstChild)) {
					c.remove();
				}
				hints_el.append(...hint_els);
				hints_el.style.display = '';
			};

			if (link_el.textContent && link_el.textContent != '0') {
				const type = select_arr[link_el.textContent] || select_arr[0];
				edit_el.dataset.text = edit_el.title = edit_el.textContent = type?.name || '(unknown)';
				link_el.textContent = type?.id ?? 0;
				link_el.oninput();
				el.classList.add('selected');
			}
		}

		for (const el of dom.querySelectorAll('[data-input]')) {
			el.removeAttribute('data-input');

			el.contentEditable = true;
			el.classList.add('input');
			if (el.classList.contains('input-number')) {
				el.classList.add('input-number');
			} else {
				el.classList.add('input-text');
			}
		}

		for (const el of dom.querySelectorAll('[data-link]')) {
			const f_str = el.dataset.link.split('=>');
			el.removeAttribute('data-link');

			const obj = new Function('return ' + f_str[0])(this.tpl, this);
			const path = f_str[1].split(',').map((s) => s.trim().replace(/['"]/g, ""));
			this.link_el(el, obj, path);
		}

		for (const el of dom.querySelectorAll('[data-onhover]')) {
			const f_str = el.dataset['onhover'];
			el.removeAttribute('data-onhover');
			const f = new Function('is_hover', f_str);

			el.onmouseenter = (e) => {
				f.call(el, true);
			};

			el.onmouseleave = (e) => {
				f.call(el, false);
			};
		}
	}

	link_el(el, obj, path) {
		if (typeof path === 'string') {
			path = [ path ];
		}

		const get_obj = () => {
			let o = obj;
			for (let i = 0; i < path.length - 1; i++) {
				o = o[path[i]];
			}
			return o;
		};
		const p = path[path.length - 1];
		const val = get_obj()[p];

		const is_float = el.classList.contains('is_float');
		el.checked = !!val;
		if (el.type == 'number' || (el.nodeName != 'INPUT' && el.classList.contains('input-number'))) {
			if (is_float) {
				el.value = (Math.round((val || 0) * 1000) / 1000);
			} else {
				el.value = val || "0";
			}
		} else {
			el.value = val ?? "";
		}

		if (el.nodeName != 'INPUT') {
			el.textContent = el.value;
			el.value = null;
		}

		const create_range = (root, index) => {
			const tree_walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, (elem) => {
				if(index > elem.textContent.length){
					index -= elem.textContent.length;
					return NodeFilter.FILTER_REJECT
				}
				return NodeFilter.FILTER_ACCEPT;
			});

			const c = tree_walker.nextNode();
			const r = new Range();
			r.setStart(c || root, index);
			return r;
		};

		const prev_oninput = el.oninput;
		/* the original oninput wasn't called when we set intiial val, so call it manually now */
		if (prev_oninput) {
			prev_oninput.call(el, {});
		}

		el.oninput = (e) => {
			if (prev_oninput) {
				prev_oninput.call(el, e);
			}

			const set = (val) => {
				get_obj()[p] = val;
			};

			db.open(obj);
			if (el.type == 'checkbox') {
				set(el.checked ?? 0);
			} else if (el.type == 'number') {
				set(parseInt(el.value) || 0);
			} else if (el.type == 'text') {
				set(el.value || "");
			} else if (el.nodeName != 'INPUT' && el.classList.contains('input-text')) {
				set(el.textContent || "");
			} else if (el.nodeName != 'INPUT' && el.classList.contains('input-number')) {
				const numberText = el.textContent.replace(/[^0-9\-\.\,]+/g, '');
				if (numberText !== el.textContent) {
					el.focus();
					/* for debug purposes check window selection as well */
					const selection = [this.shadow.getSelection(), window.getSelection()].find(s => s.rangeCount > 0);
					const r1 = selection.getRangeAt(0);
					r1.setStart(el, 0);
					const off = Math.max(r1.toString().length - 1, 0);

					el.textContent = numberText;

					selection.removeAllRanges();
					const r2 = create_range(el, off);
					selection.addRange(r2);
				}

				let num;
				if (is_float) {
					num = parseFloat(el.textContent.replace(/\,/g, '.'));
				} else {
					num = parseInt(el.textContent);
				}
				set(num);
			}
			db.commit(obj);
		};
	}

	static set_container(container) {
		Window.container = container;
		Window.onresize();
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
		x -= Window.bounds.x;
		y -= Window.bounds.y;
		return [ x, y ];
	}

	static get_el_coords(el) {
		const bounds = Object.assign({}, el.getBoundingClientRect());
		bounds.x -= Window.bounds.x;
		bounds.y -= Window.bounds.y;
		bounds.left -= Window.bounds.left;
		bounds.right -= Window.bounds.right;
		bounds.top -= Window.bounds.top;
		bounds.bottom -= Window.bounds.bottom;
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
		this.dom.style.zIndex = Window.focus_win_index++;
		Window.focus_win = this;
		if (this.onfocus) this.onfocus.call(this);
	}

	move(new_x, new_y) {
		this.dom.style.left = (new_x - this.margins.x) + 'px';
		this.dom.style.top = (new_y - this.margins.y) + 'px';
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
