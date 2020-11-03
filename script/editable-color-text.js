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

		const link_wrapper_el = newElement('<div></div>');
		this.link_el = newElement('<span class="input-text">');
		this.link_el.dataset.link = this.link_str;
		this.link_el.style.display = 'none';
		link_wrapper_el.append(this.link_el);
		this.el.append(link_wrapper_el);
		this.win.tpl_compile_cb(link_wrapper_el);

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
		this.code_el.textContent = txt;

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
