/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

document.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		const path = e.composedPath();
		if (!path) {
			/* unexpected? do the default */
			return;
		}

		if (path[0].classList.contains('input-text')) {
			/* bail */
		} else if (path[0].classList.contains('redactor-in')) {
			/* do the default */
			return;
		} else {
			document.execCommand('insertLineBreak');
		}
		e.preventDefault();
	}
})

class EditableColorText {
	constructor(el, link_str, win) {
		this.el = el;
		this.link_str = link_str;
		this.win = win;
	}

	open() {
		this.code_el = newElement('<code></code>');
		this.el.append(this.code_el);

		this.color_el = newElement('<div class="color" title="Add color"></div>');
		this.color_el.append(newElement('<i class="fa fa-adjust"></i>'));
		this.color_el.onclick = () => this.insert_color();
		this.el.append(this.color_el);

		this.code_el.contentEditable = true;
		this.code_el.onkeyup = () => this.update_caret();
		this.code_el.onmouseup = () => this.update_caret();
		this.code_el.onmousemove = () => this.update_caret();
		this.code_el.oninput = () => this.normalize();

		this.link_el = newElement('<span class="input-text">');
		this.link_el.dataset.link = this.link_str;
		this.link_el.style.display = 'none';
		this.el.append(this.link_el);
		HTMLSugar.link_el(this.link_el);

		this.code_el.textContent = this.link_el.textContent;
		this.reformat();
		this.initialized = true;
	}

	update_caret() {
		try {
			const s = this.win.shadow.getSelection();
			if (s) {
				this.caret_selection = s;
			}
			const r = this.caret_selection.getRangeAt(0);
			if (r) {
				this.caret_range = r;
			}

			const r2 = this.caret_selection.getRangeAt(0);
			if (r2) {
				r2.setStart(this.code_el, 0);
				const o = Math.max(r2.toString().length, 0);
				this.caret_off = o;
			}

		} catch (e) { }

		/* select inputs */
		const inputs = this.code_el.querySelectorAll('input');
		for (const i of inputs) {
			if (this.caret_range && this.caret_range.intersectsNode(i)) {
				i.classList.add('selected');
			} else {
				i.classList.remove('selected');
			}
		}
	}

	insert_color() {
		if (!this.caret_range) {
			this.code_el.focus();
			this.update_caret();
		}

		const selection = this.caret_selection;
		const range = this.caret_range;

		this.code_el.focus();
		selection.removeAllRanges();
		selection.addRange(range);

		const text = '^ffffff';
		document.execCommand('insertText', false, text)
		this.reformat();
		this.normalize();
	}

	create_range(index) {
		const tree_walker = document.createTreeWalker(this.code_el, NodeFilter.SHOW_TEXT, (elem) => {
			if(index > elem.textContent.length){
				index -= elem.textContent.length;
				return NodeFilter.FILTER_REJECT
			}
			return NodeFilter.FILTER_ACCEPT;
		});

		const c = tree_walker.nextNode();
		const r = new Range();
		r.setStart(c || this.code_el, index);
		return r;
	};

	normalize() {
		let is_modified = false;

		/* normalize newlines from user input */
		const newlines = this.code_el.querySelectorAll('br');
		for (const n of newlines) {
			n.replaceWith(document.createTextNode('\n'));
			is_modified = true;
		}

		/* if color chooser is not in front of a hidden span, it must have
		 * been copy&pasted (and the hidden span was obviously not selected).
		 * add that span now */
		const inputs = this.code_el.querySelectorAll('input');
		for (const input of inputs) {
			if (input.previousElementSibling?.className != 'hidden') {
				input.parentNode.insertBefore(newElement('<span class="hidden">^' + input.value.substring(1) + '</span>'), input);
				is_modified = true;
			}
		}

		const hiddens = this.code_el.querySelectorAll('.hidden');
		for (const h of hiddens) {
			/* if there's a hidden span without a color chooser in front, the color
			 * chooser must have been removed -> remove the hidden span too */
			if (h.nextElementSibling?.nodeName != 'INPUT') {
				h.remove();
				is_modified = true;
				continue;
			}

			/* if there's text after the hidden span and before the
			 * color chooser, the user must have tried to write just before
			 * the color chooser. just put that text before the hidden span
			 */
			if (h.nextElementSibling != h.nextSibling) {
				const text = h.nextSibling;
				text.remove();
				h.parentNode.insertBefore(text, h);
				is_modified = true;
			}
		}

		/* also collapse sibling color choosers and leave only the last one */
		const txt = this.code_el.textContent;
		const normalized_txt = txt.replace(/(?:\^[a-fA-F0-9]{6})+(\^[a-fA-F0-9]{6})/g, '$1');
		if (normalized_txt != txt) {
			this.code_el.textContent = normalized_txt;
			is_modified = true;
		}

		if (is_modified) {
			this.reformat();
		}

		if (this.initialized) {
			this.link_el.textContent = this.code_el.textContent;
			this.link_el.oninput();
		}
	}

	reformat() {
		if (this.in_format) {
			return;
		}

		this.in_format = true;

		const apply_color = (input) => {
			const prev_in_format = this.in_format;
			this.in_format = true;
			const hidden = input.previousSibling;
			hidden.innerText = '^' + input.value.substring(1);

			const next_el = input.nextSibling;

			if (next_el?.style?.color) {
				next_el.style.color = input.value;
			} else if (next_el) {
				const txt = next_el?.textContent;
				next_el.replaceWith(newElement('<span style="color:' + input.value + '">' + txt + '</span>'));
			}

			input.setAttribute('value', input.value);
			if (!prev_in_format) {
				setTimeout(() => {
					this.in_format = false;
				}, 1);
			}
		};

		/* insert color chooser at ^RRGGBB, put the original ^RRGGBB text in a hidden span */
		const txt = this.code_el.textContent;
		const new_txt = txt.replace(/\^([a-fA-F0-9]{6})/g,
					'<span class="hidden">^$1</span><input type="color" value="#$1">');
		this.code_el.innerHTML = new_txt;

		/* apply the color to proceeding text */
		const inputs = this.code_el.querySelectorAll('input');
		for (const input of inputs) {
			apply_color(input);
			input.oninput = () => apply_color(input);
		}

		if (this.caret_selection) {
			try {
				this.caret_selection.removeAllRanges();
				this.caret_off = Math.min(new_len, this.caret_off + diff);
				const r2 = this.create_range(this.caret_off);
				this.caret_selection.addRange(r2);
			} catch (e) { }
		}

		/* normalize again */
		this.normalize();

		this.in_format = false;
	}
}

class HTMLSugar {
	static process(dom, win) {
		for (const el of dom.querySelectorAll('[data-onload]')) {
			const f_str = el.dataset.onload;
			el.removeAttribute('data-onload');
			const f = new Function(f_str);
			f.call(el);
		}

		for (const el of dom.querySelectorAll('[data-link-item]')) {
			HTMLSugar.init_link_item(el);
		}

		for (const el of dom.querySelectorAll('[data-link-button]')) {
			HTMLSugar.init_link_button(el);
		}

		for (const el of dom.querySelectorAll('[data-select]')) {
			HTMLSugar.init_select(el);
		}

		for (const el of dom.querySelectorAll('[data-editable-color-text]')) {
			el.removeAttribute('data-editable-color-text');
			const link_str = el.dataset.link;
			el.removeAttribute('data-link');

			const text_el = new EditableColorText(el, link_str, win);
			text_el.open();
		}

		for (const el of dom.querySelectorAll('[data-input]')) {
			el.removeAttribute('data-input');

			if (el.hasAttribute('data-preview')) {
				el.classList.remove('input-number');
				continue;
			}

			el.contentEditable = true;
			el.classList.add('input');
			if (el.classList.contains('input-number')) {
				el.classList.add('input-number');
			} else {
				el.classList.add('input-text');
			}
		}

		for (const el of dom.querySelectorAll('[data-link]')) {
			HTMLSugar.link_el(el);
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

	static link_el(el) {
		const f_str = el.dataset.link?.split('=>');
		el.removeAttribute('data-link');

		let obj;
		let path;

		if (f_str) {
			obj = new Function('return ' + f_str[0])();
			path = f_str[1].split(',').map((s) => s.trim().replace(/['"]/g, ""));
		} else {
			obj = {};
			path = [];
		}

		const get_val_obj = (populate = false) => {
			let o = obj;
			for (let i = 0; i < path.length - 1; i++) {
				if (!o || !(path[i] in o)) {
					if (populate) {
						o[path[i]] = isNaN(path[i]) ? {} : [];
					} else {
						return undefined;
					}
				}
				o = o[path[i]];
			}
			return o;
		};
		const p = path[path.length - 1];
		const val_obj = get_val_obj() || {};
		const val = val_obj[p] || "";

		const is_float = el.classList.contains('is_float');
		let is_number = false;
		const set_el_val = (val) => {
			if (f_str && obj?._db?.base && !val_obj.hasOwnProperty(p)) {
				el.classList.add('forked');
			} else {
				el.classList.remove('forked');
			}

			el.checked = !!val;
			if (el.type == 'number' || (el.nodeName != 'INPUT' && (el.classList.contains('input-number') || is_float))) {
				is_number = true;
				if (is_float) {
					el.value = (Math.round((val || 0) * 1000) / 1000);
				} else {
					el.value = parseInt(val) || "0";
				}
			} else {
				el.value = val ?? "";
			}

			if (el.nodeName != 'INPUT') {
				el.textContent = el.value;
				el.value = null;
			}
		};

		set_el_val(val);

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

		el._mg_set_val = (val) => {
			if (!f_str) {
				return;
			}

			db.open(obj);
			const val_obj = get_val_obj(true);
			val_obj[p] = val;
			db.commit(obj);

			if (obj._db.base && !val_obj.hasOwnProperty(p)) {
				el.classList.add('forked');
			} else {
				el.classList.remove('forked');
			}
		}

		el.oninput = (e) => {
			if (prev_oninput) {
				prev_oninput.call(el, e);
			}

			if (el.type == 'checkbox') {
				el._mg_set_val(el.checked ?? 0);
			} else if (el.type == 'number') {
				el._mg_set_val(parseInt(el.value) || 0);
			} else if (el.type == 'text') {
				el._mg_set_val(el.value || "");
			} else if (el.nodeName != 'INPUT' && el.classList.contains('input-text')) {
				el._mg_set_val(el.textContent || "");
			} else if (el.nodeName != 'INPUT' && el.classList.contains('input-number')) {
				const numberText = el.textContent.replace(/[^0-9\-\.\,]+/g, '');
				if (numberText !== el.textContent) {
					el.focus();

					/* for debug purposes check window selection as well */
					const selection = [el.getRootNode().getSelection(), window.getSelection()].find(s => s.rangeCount > 0);
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
					num = parseFloat(el.textContent.replace(/\,/g, '.')) || 0;
				} else {
					num = parseInt(el.textContent) || 0;
				}
				el._mg_set_val(num);
			}
		};

		if (f_str && !el.hasAttribute('data-preview')) {
			el.oncontextmenu = (e) => {
				e.preventDefault();
				return HTMLSugar.open_undo_rmenu(el.mg_rmenu_around_el || el, obj, {
					undo_path: path,
					undo_fn: () => {
						const o = get_val_obj();
						set_el_val(o ? o[p] : "");
					},
					name_fn: el.mg_rmenu_name_fn
				});

			};
		}

		return { obj, path };
	}

	static show_select({ win, around_el, around_margin, container }) {
		return new Promise((resolve) => {
			const el = newElement('<span></span>');
			el._mg_select = container;

			const coords = Window.get_el_coords(around_el);
			let x, y;
			y = coords.top + 2;
			if (coords.right + 215 > Window.bounds.right) {
				x = coords.left - 200 - (around_margin || 0);
			} else {
				x = coords.right + (around_margin || 0);
			}

			el.className = 'absolute';
			el.style.position = 'fixed';
			el.style.left = x + 'px';
			el.style.top = (y + 28) + 'px';
			el.style.zIndex = 11 + Window.focus_win_index;

			if (!win) {
				win = Window.focus_win;
			}
			win.shadow.append(el);
			HTMLSugar._init_select(el, win);
			const edit_el = el.querySelector('.edit');
			const hints_el = el.querySelector('.hints');
			const link_el = el.querySelector('.link');

			let hidden = false;
			const try_hide = () => setTimeout(() => {
				if (hidden) {
					return;
				}

				if (hints_el.style.display !== 'none') {
					try_hide();
					return;
				}

				el.remove();
				resolve(parseInt(link_el.textContent));
				hidden = true;
			}, 10);

			const prev_select_fn = el._mg_select;
			el._mg_select = (id, text) => {
				prev_select_fn(id, text);
				try_hide();
			};

			const prev_onblur = edit_el.onblur;
			edit_el.onblur = (e) => {
				prev_onblur(e);
				try_hide();
			}
			edit_el.oninput();
			edit_el.focus();
		});
	}

	static init_select(el) {
		const f_str = el.dataset.select;
		el.removeAttribute('data-select');

		el._mg_select = new Function('return ' + f_str)();
		HTMLSugar._init_select(el);
	}


	static _init_select(el) {
		const link_str = el.dataset.link;
		el.removeAttribute('data-link');
		const field_name = el.dataset.selectField;
		el.removeAttribute('data-select-field');
		const chooser_no_show_id = el.dataset.selectNoShowID;
		el.removeAttribute('data-select-no-show-id');
		const title_str = el.dataset.title;

		const select_arr = el._mg_select;

		const edit_el = newElement('<span class="edit" tabindex="0"></span>');
		edit_el.classList.add('input-text');
		edit_el.contentEditable = "true";
		el.append(edit_el);

		const link_el = newElement('<span class="link"></span>');
		if (!field_name) {
			link_el.classList.add('input-number');
		} else {
			link_el.classList.add('input-text');
		}
		if (link_str) {
			link_el.dataset.link = link_str;
		}
		link_el.style.display = 'none';
		el.append(link_el);
		HTMLSugar.link_el(link_el);

		if (el.hasAttribute('data-preview')) {
			const obj = select_arr[link_el.textContent];
			if (obj) {
				el.textContent = obj.name || ('(unnamed #' + link_el.textContent + ')');
			} else {
				el.textContent = '(none)';
			}
			return;
		}

		el.classList.add('input');
		el.classList.add('input-select');

		const close_el = newElement('<div class="close"></div>');
		el.append(close_el);

		const onselect_fn = new Function('id', el.dataset.onselect);
		el._mg_select = (id, text) => {
			if (el.dataset.selected) {
				edit_el.dataset.text = edit_el.title = edit_el.textContent = text;
				edit_el.focus();
				el.classList.add('selected');
				return;
			}

			onselect_fn(id);
			if (id == -1) {
				el.classList.remove('selected');
				edit_el.title = '';
				link_el.textContent = '';
				link_el.oninput();
				return;
			}

			edit_el.dataset.text = edit_el.title = edit_el.textContent = text;
			edit_el.focus();
			el.classList.add('selected');
			link_el.textContent = field_name ? select_arr[id][field_name] : id;
			link_el.oninput();

			if (link_el.classList.contains('forked')) {
				el.classList.add('forked');
			} else {
				el.classList.remove('forked');
			}
			hints_el.style.display = 'none';
			HTMLSugar.open_hints_el = null;
		}

		const select = (id, text) => el._mg_select(id, text);

		close_el.onclick = () => {
			select(-1, "");
			edit_el.textContent = '';
			edit_el.focus();
			edit_el.oninput();
		}

		const hints_el = newElement('<div class="hints" style="display: none;"></div>');
		el.append(hints_el);

		let select_arr_cp = null;
		edit_el.onclick = () => {
			select(-1, "");
			edit_el.focus();
			edit_el.oninput();
		}

		edit_el.onblur = () => {
			if (!hints_el.matches('div:hover') && hints_el.style.display != 'none') {
				hints_el.style.display = 'none';
				HTMLSugar.open_hints_el = null;
				if (hints_el.children.length == 1 && edit_el.dataset.text == hints_el.children[0].textContent) {
					select(hints_el.children[0]._mg_id, hints_el.children[0].textContent);
				}
			}
			select_arr_cp = null;
		}

		let chooser_name_fn = null;
		if (chooser_no_show_id) {
			chooser_name_fn = (obj) => {
				return obj.name;
			};
		}

		edit_el.oninput = () => {
			const search = edit_el.textContent;
			let hints;

			if (!select_arr_cp) {
				select_arr_cp = fuzzysort.index(select_arr, { key: 'name' });
			}

			hints = fuzzysort.go(search, select_arr_cp);
			hints = hints.map(i => i.obj);
			if (hints.length > 10) {
				hints.length = 10;
			}

			let n = 0;
			const hint_els = [];
			for (const t of hints) {
				if (n > 8) {
					const div = document.createElement('span');
					div.className = 'text';
					div.textContent = '...';
					hint_els.push(div);

					div.onclick = async () => {
						let win;
						win = await SimpleChooserWindow.open({ title: title_str, search: edit_el.textContent, items: select_arr, name_fn: chooser_name_fn });

						win.onchoose = (type) => {
							if (type) {
								select(type.id, type.name);
							} else {
								edit_el.focus();
								edit_el.oninput();
							}
						};
					};

					break;
				}
				const div = document.createElement('span');
				n++;
				const id = t.id;
				div._mg_id = id;
				if (t.icon) {
					const img = document.createElement('img');
					img.src = Item.get_icon(t.icon);

					const span = document.createElement('span');
					span.innerHTML = t.name;

					div.append(img, span);
				} else {
					div.innerHTML = t.name;
				}
				div.onclick = () => {
					select(id, div.textContent);
				};
				hint_els.push(div);
			}

			let c = null;
			while ((c = hints_el.firstChild)) {
				c.remove();
			}
			hints_el.append(...hint_els);

			if (hints_el.style.display === 'none') {
				hints_el.style.visibility = 'hidden';
				hints_el.style.position = 'absolute';
				hints_el.style.left = '';
				hints_el.style.top = '';
				el.classList.remove('hints-on-top');
				hints_el.style.display = '';
				const bounds = hints_el.getBoundingClientRect();

				if (bounds.bottom + 15 > Window.bounds.bottom) {
					el.classList.add('hints-on-top');
				}

				hints_el.style.left = bounds.left + 'px';
				hints_el.style.top = bounds.top - 1 + 'px';
				hints_el.style.position = 'fixed';
				hints_el.style.visibility = '';
				HTMLSugar.open_hints_el = hints_el;
			}
		};

		const get_linked_obj = (val) => {
			let type;

			if (field_name) {
				/* escape all special characters */
				type = [...select_arr.values()].find((a) => a[field_name] == val);
			} else {
				type = select_arr[val];
			}

			return type;
		}

		const update_el = (link_val) => {
			let type = get_linked_obj(link_val);

			edit_el.dataset.text = edit_el.title = edit_el.textContent = type?.name || "";
			if (type?.name) {
				el.classList.add('selected');
			}
		}

		if (link_el.textContent && link_el.textContent != '0') {
			update_el(link_el.textContent);
		} else if (select_arr[0]) {
			update_el('0');
		}

		if (link_el.classList.contains('forked')) {
			el.classList.add('forked');
		}

		if (!el.hasAttribute('data-preview')) {
			if (link_el.oncontextmenu) {
				link_el.mg_rmenu_name_fn = (val) => get_linked_obj(val)?.name || "";
				link_el.mg_rmenu_around_el = el;
				el.oncontextmenu = (e) => {
					link_el.oncontextmenu(e).then(() => {
						update_el(link_el.textContent);
					});
				};
			} else {
				el.oncontextmenu = (e) => {
					e.preventDefault();
				};
			}
		}

		if (el.dataset.selected) {
			const id = parseInt(el.dataset.selected) || 0;

			el._mg_select(id, select_arr[id].name);

			el.removeAttribute('data-selected');
		}
	}

	static init_link_item(el) {
		const link_str = el.dataset.linkItem;
		el.removeAttribute('data-link-item');

		const f_str = el.dataset.filter;
		el.removeAttribute('data-filter');

		const default_id = parseInt(el.dataset.defaultId);
		el.removeAttribute('data-default-id');

		const img = newElement('<img>');
		el.append(img);

		const link_el = newElement('<span class="link input-number"></span>');
		if (link_str) {
			link_el.dataset.link = link_str;
		}

		link_el.style.display = 'none';
		el.append(link_el);
		const link = HTMLSugar.link_el(link_el);

		const update_icon = (auto = false) => {
			const id = get_obj_field(link.obj, link.path);
			el.dataset.id = id;

			if (default_id) {
				img.src = Item.get_icon_by_item(db, id || default_id);
			} else {
				img.src = Item.get_icon_by_item(db, id);
			}

			if (!auto && el.oninput) {
				el._mg_value = id;
				el.oninput();
			}
		};
		update_icon(true);

		el.oncontextmenu = (e) => { el.onclick(e); return false; };
		el.onclick = (e) => {
			if (e.which == 1) {
				const id = get_obj_field(link.obj, link.path);
				const obj = db.items[id || 0];
				HTMLSugar.open_edit_rmenu(el,
					obj, 'items', {
					pick_win_title: 'Pick new Item for ' + (link.obj.name || link.obj._db.type) + ' ' + DB.serialize_id(link.obj.id),
					update_obj_fn: (new_obj) => {
						db.open(link.obj);
						set_obj_field(link.obj, link.path, new_obj?.id || 0);
						db.commit(link.obj);
						update_icon();
					},
					edit_obj_fn: (new_obj) => {
						ItemTooltipWindow.open({ obj: new_obj, edit: true, db });
					},
					usage_name_fn: (obj) => {
						return (obj.name || '') + ' ' + DB.serialize_id(obj.id);
					}
				});
			} else if (e.which == 3) {
				HTMLSugar.open_undo_rmenu(el, link.obj, {
					undo_path: link.path,
					undo_fn: () => update_icon()
				});
			}
		}
	}

	static init_link_button(el) {
		const link_str = el.dataset.linkButton;
		el.removeAttribute('data-link-button');

		const f_str = el.dataset.select;
		el.removeAttribute('data-select');

		el._mg_select = new Function('return ' + f_str)();

		const link_el = newElement('<span class="link input-number"></span>');
		if (link_str) {
			link_el.dataset.link = link_str;
		}

		link_el.style.display = 'none';
		el.append(link_el);
		const link = HTMLSugar.link_el(link_el);

		let dummy_obj = el._mg_select.values().next().value;
		if (!dummy_obj && f_str.startsWith('db.')) {
			dummy_obj = { _db: { type: f_str.substring(3).trim() } };
		}

		let type = dummy_obj._db.type;
		const obj_details = PWPreview.get_obj_type(dummy_obj);

		const update_label = (auto = false) => {
			const id = get_obj_field(link.obj, link.path);
			const obj = db[type][id];
			if (obj) {
				el.innerHTML = print_pretty_name(obj);
			} else {
				el.textContent = '(none)';
			}
			if (!auto && el.oninput) {
				el._mg_value = id;
				el.oninput();
			}
		};
		el._mg_update_label = update_label;
		update_label(true);

		el.oncontextmenu = (e) => { el.onclick(e); return false; };
		el.onclick = (e) => {
			if (e.which == 1) {
				const id = get_obj_field(link.obj, link.path);
				const obj = db[type][id || 0];
				HTMLSugar.open_edit_rmenu(el,
					obj, type, {
					pick_win_title: 'Pick new ' + obj_details.name + ' for ' + (link.obj.name || link.obj._db.type) + ' ' + DB.serialize_id(link.obj.id),
					update_obj_fn: (new_obj) => {
						el._mg_prev_value = get_obj_field(link.obj, link.path);
						db.open(link.obj);
						set_obj_field(link.obj, link.path, new_obj?.id || 0);
						db.commit(link.obj);
						update_label();
					},
					edit_obj_fn: (new_obj) => {
						const obj_details = PWPreview.get_obj_type(new_obj);
						obj_details.open_fn();
					},
					usage_name_fn: (obj) => {
						return (obj.name || '') + ' ' + DB.serialize_id(obj.id);
					}
				});
			} else if (e.which == 3) {
				HTMLSugar.open_undo_rmenu(el, link.obj, {
					undo_path: link.path,
					undo_fn: () => update_label
				});
			}
		}
	}

	static async open_edit_rmenu(around_el, obj, obj_type, { pick_win_title, update_obj_fn, edit_obj_fn, usage_name_fn = null }) {
		const base = obj ? (db[obj._db.type][obj._db.base]) : null;

		const win = await RMenuWindow.open({
		around_el, bg: false,
		entries: [
			{ id: 1, name: 'Edit directly', disabled: !obj },
			{ id: 2, name: 'Pick' },
			{ id: 3, name: obj ? 'Replace with new' : 'Create new' },
			{ id: 4, name: 'Clone & Edit', disabled: !obj },
			{ id: 5, name: 'Find usages (...)', disabled: !obj },
			{ id: 25, name: 'Clear', disabled: !obj},
			{ name: '...', visible: false, children: [
				{ name: 'Base: ' + (base ? (base.name + ' ' + DB.serialize_id(base.id)) : '(none)') },
				{ id: 21, name: 'Rebase', disabled: !obj },
				{ id: 22, name: 'Fork & Edit', disabled: !obj },
				{ id: 23, name: 'Detach from base', disabled: !base },
				{ id: 24, name: 'Apply to base', disabled: !base },
				{ id: 25, name: 'Clear', disabled: !obj},
			]},
		]});

		const usages = new Promise(resolve => setTimeout(() => {
			const u = PWDB.find_usages(db, obj);
			win.shadow.querySelector('#entry-5 > span').textContent = 'Find usages (' + u.length + ')';
			resolve(u);
		}), 1);

		const sel = await win.wait();
		switch(sel) {
			case 1: { /* edit directly */
				edit_obj_fn(obj);
				break;
			}
			case 2: { /* pick */
				let items = db[obj_type];

				/* TODO make a 'new' entry inside? */
				let win;
				const name_fn = (obj) => {
					const ret = (obj.name || '(unnamed)') + ' ' + DB.serialize_id(obj.id);
					if (obj_type == 'recipes') {
						return '<div style="overflow: auto;"><img style="float: left; margin-right: 2px; width:32px; height: 32px;" src="' + NPCCraftsWindow.get_recipe_icon(obj.id) + '"><span>' + ret + '</span></div>';
					}
					return ret;
				};
				win = await SimpleChooserWindow.open({ title: pick_win_title, items, width: 176, name_fn  });

				win.onchoose = (type) => {
					if (type) {
						const obj = items[type.id];
						update_obj_fn(obj);
					}
				};
				break;
			}
			case 3: { /* create new */
				let obj;

				if (obj_type === 'items') {
					const win = await ItemTypeChooserWindow.open();
					const type = await win.wait();

					if (!type?.id) {
						break;
					}

					obj = db.new('items');
					db.open(obj);
					obj.type = type.id;
					db.commit(obj);
				} else {
					obj = db.new(obj_type);
				}

				update_obj_fn(obj);
				edit_obj_fn(obj);
				break;
			}
			case 4: { /* clone & edit */
				const clone = db.clone(obj);
				db.open(clone);
				clone.name += ' (clone)';
				db.commit(clone);
				update_obj_fn(clone);
				edit_obj_fn(clone);
				break;
			}
			case 5: { /* find usages */
				const win = await SimpleChooserWindow.open({ title: 'Usages of ' + obj.name + ' ' + DB.serialize_id(obj.id), items: await usages, width: 176, name_fn: usage_name_fn });

				break;
			}
			case 21: { /* rebase */
				break;
			}
			case 22: { /* fork & edit */
				const fork = db.new(obj_type);

				db.open(fork);
				db.rebase(fork, obj);
				db.commit(fork);

				update_obj_fn(fork);
				edit_obj_fn(fork);
				break;
			}
			case 23: { /* detach from base */
				break;
			}
			case 24: { /* apply to base */
				break;
			}
			case 25: { /* clear */
				update_obj_fn(null);
				break;
			}
		}
	}

	static async open_undo_rmenu(around_el, obj, { undo_path, undo_fn, name_fn }) {
		const base = obj ? (db[obj._db.type][obj._db.base]) : null;
		let undo_res = {};

		if (undo_path) {
			undo_res = PWDB.undo(db, obj, undo_path);
		}

		if (!name_fn) {
			name_fn = (val) => val;
		}

		const win = await RMenuWindow.open({
		around_el, bg: false,
		entries: [
			{ id: 1, name: 'Undo: ' + (undo_res.pval === undefined ? '(none)' : name_fn(undo_res.pval)), visible: !!undo_path, disabled: undo_res.pval === undefined },
			{ id: 7, name: 'Restore org', visible: false },
		]});
		const sel = await win.wait();
		switch(sel) {
			case 1: { /* undo */
				undo_res.fn();
				undo_fn();
				break;
			}
		}
	}

	static show_tooltip(win, type, el, params) {
		params = params || {};
		const info = win?.dom;
		if (!info) {
			/* still loading */
			return;
		}

		if (el == win.hover_el) {
			if (!el || !win.scroll_hidden) {
				/* no change */
				return;
			}
		}

		if (!el && win.pinned) {
			return;
		}

		win.hover_el = el;
		if (!el) {
			info.style.display = 'none';
			return;
		}

		const id = parseInt(el.dataset.id);
		const nopreview = parseInt(el.dataset.nopreview);
		if (!id || nopreview) {
			info.style.display = 'none';
			return;
		}

		const prev_id = parseInt(el.dataset.prev);

		params.db = params.db || document.db;
		let obj;
		let prev_obj;

		if (params.db) {
			obj = params.db[type][id] || { id };
			if (!prev_id) {
				prev_obj = obj;
			} else if (prev_id < 0) {
				prev_obj = obj._db?.project_initial_state;
			} else {
				const o = params.db[type][prev_id] || { id: prev_id };
				prev_obj = o?._db?.project_initial_state || o;
			}

			const bounds = el.getBoundingClientRect();
			win.reload(obj, prev_obj, bounds, params.db);
			return;
		}

		return new Promise(async (resolve) => {
			const resp = await get(ROOT_URL + 'latest_db/get/' + type + '/' + id, { is_json: 1 });
			obj = resp.data;

			if (win.hover_el != el) {
				/* something else was hovered while we were async */
				return;
			}

			/* TODO disabled for now */
			prev_obj = { id: -1 };

			const bounds = el.getBoundingClientRect();
			win.reload(obj, prev_obj, bounds, null);
			resolve();
		});

	}

	static show_item_tooltip(item_win, el, params) {
		return HTMLSugar.show_tooltip(item_win, 'items', el, params);
	}

	static show_recipe_tooltip(recipe_win, el, params) {
		return HTMLSugar.show_tooltip(recipe_win, 'recipes', el, params);
	}

	static collapse_el(el) {
		el.classList.toggle("active");
		const content = el.nextElementSibling;
		if (content.style.maxHeight){
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = content.scrollHeight - 10 + "px";
		}
	}

	static onscroll(e) {
		/* hide all selects (they're position: fixed) */
		if (HTMLSugar.open_hints_el) {
			HTMLSugar.open_hints_el.style.display = 'none';
			HTMLSugar.open_hints_el = null;

		}
	}
}
