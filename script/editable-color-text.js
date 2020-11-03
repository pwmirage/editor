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
		this.code_el.onkeyup = () => this.update_caret();
		this.code_el.onmouseup = () => this.update_caret();
		this.code_el.onpaste = () => setTimeout(() => this.save_greeting(), 1);
		this.code_el.oninput = () => this.format_greeting();

		const link_wrapper_el = newElement('<div></div>');
		this.link_el = newElement('<span class="input-text">');
		this.link_el.dataset.link = this.link_str;
		this.link_el.style.display = 'none';
		link_wrapper_el.append(this.link_el);
		this.el.append(link_wrapper_el);
		this.win.tpl_compile_cb(link_wrapper_el);

		this.code_el.textContent = this.link_el.textContent;
		this.save_greeting();
	}

	update_caret() {
		this.caret_selection = this.win.shadow.getSelection();
		try {
			this.caret_range = this.caret_selection.getRangeAt(0);
		} catch (e) {
			this.caret_range = null;
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
		this.save_greeting();
	}

	format_greeting() {
		const old_inputs = this.code_el.querySelectorAll('input');
		for (const input of old_inputs) {
			const span = input.previousSibling;
			if (!span) continue;
			if (span.nodeType == 3) {
				/* plain text */
				span.remove();
			} else {
				span.innerText = '^' + input.value.substring(1);
			}

			if (input.nextSibling?.data?.match(/\^([a-fA-F0-9]{6})/g)) {
				input.nextSibling.remove();
			}
			if (input.nextSibling?.className == 'hidden') {
				input.nextSibling.nextSibling.remove();
				input.nextSibling.remove();
			}
		}
		const hiddens = this.code_el.querySelectorAll('span.hidden');
		for (const hidden of hiddens) {
			if (!hidden.nextSibling || hidden.nextSibling?.type != 'color') {
				const text_el = hidden.nextSibling;
				if (text_el && text_el.style.color) {
					text_el.replaceWith(document.createTextNode(text_el.textContent));
				}
				hidden.remove();
			}
		}

		const newlines = this.code_el.querySelectorAll('br');
		for (const n of newlines) {
			n.replaceWith(document.createTextNode('\n'));
		}

		this.link_el.textContent = this.code_el.textContent;
		this.link_el.oninput();
	}

	save_greeting() {
		if (this.in_greeting_modify) {
			return;
		}
		this.in_greeting_modify = true;

		const apply_color = (input) => {
			const next_el = input.nextSibling;
			const txt = next_el?.textContent;
			if (!txt) {
				this.in_greeting_modify = false;
				return;
			}

			const span = input.previousSibling;
			span.innerText = '^' + input.value.substring(1);
			next_el.replaceWith(newElement('<span style="color:' + input.value + '">' + txt + '</span>'));
			input.setAttribute('value', input.value);
		};

		this.format_greeting();
		const txt = this.code_el.textContent;
		const new_txt = txt.replace(/\^([a-fA-F0-9]{6})/g,
					'<span class="hidden">^$1</span><input type="color" value="#$1">');
		this.code_el.innerHTML = new_txt;

		const inputs = this.code_el.querySelectorAll('input');
		for (const input of inputs) {
			apply_color(input);
			input.oninput = () => apply_color(input);
		}

		this.format_greeting();
		this.in_greeting_modify = false;
	}
}
