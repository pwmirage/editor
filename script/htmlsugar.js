/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

document.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		if (e.path && e.path[0].classList.contains('input-text')) {
			/* bail */
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
		this.code_el.onkeydown = (e) => this.last_key = e.key;
		this.code_el.onkeyup = () => this.update_caret();
		this.code_el.onmouseup = () => this.update_caret();
		this.code_el.onmousemove = () => this.update_caret();
		this.code_el.onpaste = () => setTimeout(() => this.format(), 1);
		this.code_el.oninput = () => this.format();

		this.link_el = newElement('<span class="input-text">');
		this.link_el.dataset.link = this.link_str;
		this.link_el.style.display = 'none';
		this.el.append(this.link_el);
		HTMLSugar.link_el(this.link_el);

		this.code_el.textContent = this.link_el.textContent;
		this.format();
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
				const o = Math.max(r2.toString().length - 1, 0);
				if (o) {
					this.caret_off = o;
				}
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
		this.format();
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
		const prev_len = this.link_el.textContent.length;

		/* normalize newlines from user input */
		const newlines = this.code_el.querySelectorAll('br');
		for (const n of newlines) {
			n.replaceWith(document.createTextNode('\n'));
		}

		/* if color chooser is not in front of a hidden span, it must have
		 * been copy&pasted (and the hidden span was obviously not selected).
		 * add that span now */
		const inputs = this.code_el.querySelectorAll('input');
		for (const input of inputs) {
			if (input.previousElementSibling?.className != 'hidden') {
				input.parentNode.insertBefore(newElement('<span class="hidden">^' + input.value.substring(1) + '</span>'), input);
			}
		}

		/* if there's a hidden span without a color chooser in front, the color
		 * chooser must have been removed -> remove the hidden span too */
		const hiddens = this.code_el.querySelectorAll('.hidden');
		for (const h of hiddens) {
			if (h.nextElementSibling?.nodeName != 'INPUT') {
				h.remove();
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
			}
		}

		/* normalize any html inputs into clear text */
		const txt = this.code_el.textContent;
		this.code_el.textContent = '';
		/* also collapse sibling color choosers and leave only the last one */
		this.code_el.textContent = txt.replace(/(?:\^[a-fA-F0-9]{6})+(\^[a-fA-F0-9]{6})/g, '$1');

		/* the raw text is ready so save it */
		this.link_el.textContent = this.code_el.textContent;
		this.link_el.oninput();

		const new_len = this.link_el.textContent.length;
		return new_len - prev_len;
	}

	format() {
		if (this.in_format) {
			return;
		}

		this.in_format = true;
		let off = this.caret_off;

		/* normalize to ensure we get clear, raw text inside code_el without any
		 * html elements */
		const diff = this.normalize();

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

		if (this.caret_selection && off) {
			try {
				console.log(off);
				this.caret_selection.removeAllRanges();
				if (diff == 1) {
					this.caret_off += 1;
					const r2 = this.create_range(off + 2);
					this.caret_selection.addRange(r2);
				} else if (diff == -1) {
					if (this.last_key == 'Delete') {
						off += 1;
					} else {
						this.caret_off -= 1;
					}
					const r2 = this.create_range(off);
					this.caret_selection.addRange(r2);
				}
			} catch (e) { }
		}
		this.in_format = false;
	}
}

class HTMLSugar {
	static process(dom) {
		for (const el of dom.querySelectorAll('[data-onload]')) {
			const f_str = el.dataset.onload;
			el.removeAttribute('data-onload');
			const f = new Function(f_str);
			f.call(el);
		}

		for (const el of dom.querySelectorAll('[data-select]')) {
			HTMLSugar.init_select(el);
		}

		for (const el of dom.querySelectorAll('[data-editable-color-text]')) {
			el.removeAttribute('data-editable-color-text');
			const link_str = el.dataset.link;
			el.removeAttribute('data-link');

			const text_el = new EditableColorText(el, link_str, this);
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
		const f_str = el.dataset.link.split('=>');
		el.removeAttribute('data-link');

		const obj = new Function('return ' + f_str[0])();
		let path = f_str[1].split(',').map((s) => s.trim().replace(/['"]/g, ""));

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

		el._mg_set_val = (val) => {
			db.open(obj);
			get_obj()[p] = val;
			db.commit(obj);
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
					num = parseFloat(el.textContent.replace(/\,/g, '.')) || 0;
				} else {
					num = parseInt(el.textContent) || 0;
				}
				el._mg_set_val(num);
			}
		};
	}

	static init_select(el) {
		const f_str = el.dataset.select;
		el.removeAttribute('data-select');
		const link_str = el.dataset.link;
		el.removeAttribute('data-link');
		const title_str = el.dataset.title;

		const select_arr = new Function('return ' + f_str)();
		el._mg_select = select_arr;

		const edit_el = newElement('<span class="edit"></span>');
		edit_el.classList.add('input-text');
		edit_el.contentEditable = "true";
		el.append(edit_el);

		const link_el = newElement('<span class="input-number"></span>');
		link_el.dataset.link = link_str;
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

		const select = (id, text) => {
			if (!id) {
				el.classList.remove('selected');
				edit_el.title = '';
				link_el.textContent = '';
				link_el.oninput();
				return;
			}

			edit_el.focus();
			edit_el.dataset.text = edit_el.title = edit_el.textContent = text;
			el.classList.add('selected');
			link_el.textContent = id;
			link_el.oninput();
		}

		close_el.onclick = () => {
			select(0, "");
			edit_el.textContent = '';
			edit_el.focus();
			edit_el.oninput();
		}

		const hints_el = newElement('<div class="hints"></div>');
		el.append(hints_el);

		edit_el.onclick = () => {
			select(0, "");
			edit_el.focus();
			edit_el.oninput();
		}

		edit_el.onblur = () => {
			if (el.querySelector(':hover') != hints_el) {
				hints_el.style.display = 'none';
				if (hints_el.children.length == 1 && edit_el.dataset.text == hints_el.children[0].textContent) {
					select(hints_el.children[0]._mg_id, hints_el.children[0].textContent);
				}
			}
		}

		edit_el.oninput = () => {
			const search = edit_el.textContent.toLowerCase();
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
				const pos = t.name.toLowerCase().indexOf(search);
				div.innerHTML = t.name.substring(0, pos) + '<b>' + t.name.substring(pos, pos + search.length) + '</b>' + t.name.substring(pos + search.length);
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
			hints_el.style.display = '';
		};

		if (link_el.textContent && link_el.textContent != '0') {
			const type = select_arr[link_el.textContent];
			if (type?.name) {
				edit_el.dataset.text = edit_el.title = edit_el.textContent = type.name;
				el.classList.add('selected');
			}
		}
	}

}