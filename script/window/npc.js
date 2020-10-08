/*
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

const g_open_npcs = new Set();
let g_open_npc_model = null;

class NPCModelWindow extends Window {
	async init() {
		this.npc_win = this.args.parent;
		this.npc = this.npc_win.npc;
		if (g_open_npc_model) return false;
		g_open_npc_model = this;

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/npc.tpl', 'tpl-npc-model');
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const data = await this.tpl.compile({ this: this, npc: this.npc });
		shadow.append(...data);

		await super.init();
		this.maximize();
	}

	close() {
		g_open_npc_model = null;
		super.close();
	}
}

class NPCWindow extends Window {
	async init() {
		this.npc = this.args.npc;
		if (!this.args.debug && g_open_npcs.has(this.npc)) return false;
		g_open_npcs.add(this.npc);

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template(ROOT_URL + 'tpl/window/npc.tpl', 'tpl-npc');
		this.tpl.compile_cb = (dom_arr) => this.tpl_compile_cb(dom_arr);

		const data = await this.tpl.compile({ this: this, npc: this.npc });
		shadow.append(...data);

		this.save_greeting();
		super.init();
	}

	close() {
		g_open_npcs.delete(this.npc);
		super.close();
	}

	update_caret() {
		this.caret_selection = this.shadow.getSelection();
		try {
			this.caret_range = this.caret_selection.getRangeAt(0);
		} catch (e) {
			this.caret_range = null;
		}
	}

	insert_color() {
		if (!this.caret_range) {
			this.shadow.querySelector('code').focus();
			this.update_caret();
		}

		const selection = this.caret_selection;
		const range = this.caret_range;

		this.shadow.querySelector('code').focus();
		selection.removeAllRanges();
		selection.addRange(range);

		const text = '^ffffff';
		document.execCommand('insertText', false, text)
		this.save_greeting();
	}

	format_greeting() {
		const greeting = this.shadow.querySelector('code');
		const old_inputs = greeting.querySelectorAll('input');
		for (const input of old_inputs) {
			const span = input.previousSibling;
			if (!span) continue;
			span.innerText = '^' + input.value.substring(1);
			if (input.nextSibling?.data?.match(/\^([a-fA-F0-9]{6})/g)) {
				input.nextSibling.remove();
			}
			if (input.nextSibling?.className == 'hidden') {
				input.nextSibling.nextSibling.remove();
				input.nextSibling.remove();
			}
		}

		const newlines = greeting.querySelectorAll('br');
		for (const n of newlines) {
			n.replaceWith(document.createTextNode('\n'));
		}

		db.open(this.npc);
		this.npc.greeting = greeting.textContent;
		db.commit(this.npc);
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
		const greeting = this.shadow.querySelector('code');
		const txt = greeting.textContent;
		const new_txt = txt.replace(/\^([a-fA-F0-9]{6})/g,
					'<span class="hidden">^$1</span><input type="color" value="#$1">');
		greeting.innerHTML = new_txt;

		const inputs = greeting.querySelectorAll('input');
		for (const input of inputs) {
			apply_color(input);
			input.oninput = () => apply_color(input);
		}

		this.format_greeting();
		this.in_greeting_modify = false;
	}
}
