/*
 * Copyright(c) 2020 Darek Stojaczyk for pwmirage.com
 */

let g_open_npc_goods = new Set();
let g_npc_tpl = load_tpl(ROOT_URL + 'tpl/window/npc.tpl')

class NPCGoodsWindow extends Window {
	async init() {
		await g_npc_tpl;
		this.goods = this.args.goods;
		if (!this.args.debug && g_open_npc_goods.has(this.goods)) return false;
		g_open_npc_goods.add(this.goods);

		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-npc-goods');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, goods: this.goods });
		shadow.append(data);

		await super.init();
		this.select(0);
	}

	close() {
		g_open_npc_goods.delete(this.goods);
		super.close();
	}

	select(idx) {
		this.selected_tab = idx;
		for (const tname of this.shadow.querySelectorAll('.tabname')) {
			tname.classList.remove('selected');
		}

		this.shadow.querySelectorAll('.tabname')[idx].classList.add('selected');
		this.tpl.reload('#items');
	}
}

const g_open_npcs = new Set();
class NPCWindow extends Window {
	static types = init_id_array([
		{ id: 3214, name: 'NPC' },
		{ id: 3216, name: 'Guard' },
	]);

	static models = null;

	async init() {
		this.npc = this.args.npc;
		if (!this.args.debug && g_open_npcs.has(this.npc)) return false;
		g_open_npcs.add(this.npc);

		if (!NPCWindow.models) {
			NPCWindow.models = init_id_array([]);

			const file_set = new Set();
			for (const o of g_db.npcs) {
				if (!o || !o.file_model) {
					continue;
				}

				if (!file_set.has(o.file_model)) {
					file_set.add(o.file_model);
					NPCWindow.models[o.id] = {
						id: o.id,
						name: o.name + ' ' + serialize_db_id(o.id),
						file: o.file_model,
					};
				}
			}
		}

		if (!this.npc.id_type) {
			/* fix to default (just like the game does) */
			const npc = db.npcs[this.npc._db.base] || this.npc;
			db.open(npc);
			npc.id_type = NPCWindow.types[0].id;
			db.commit(npc);
		}

		await g_npc_tpl;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-npc');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run({ win: this, npc: this.npc });
		shadow.append(data);

		this.save_greeting();
		this.npc_initialized = true;
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
		const hiddens = greeting.querySelectorAll('span.hidden');
		for (const hidden of hiddens) {
			if (!hidden.nextSibling || hidden.nextSibling?.type != 'color') {
				const text_el = hidden.nextSibling;
				if (text_el && text_el.style.color) {
					text_el.replaceWith(document.createTextNode(text_el.textContent));
				}
				hidden.remove();
			}
		}

		const newlines = greeting.querySelectorAll('br');
		for (const n of newlines) {
			n.replaceWith(document.createTextNode('\n'));
		}

		if (this.npc_initialized) {
			db.open(this.npc);
			this.npc.greeting = greeting.textContent;
			db.commit(this.npc);
		}
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

	async edit(el, what) {
		const coords = Window.get_el_coords(el);
		const x = coords.left;
		const y = coords.bottom;
		const obj = db.npc_sells[this.npc.id_sell_service || 0];
		HTMLSugar.open_edit_rmenu(x, y, 
			obj, 'npc_sells', {
			pick_win_title: 'Pick new Goods for ' + (this.npc.name || 'NPC') + ' ' + serialize_db_id(this.npc.id),
			update_obj_fn: (new_obj) => {
				const n = this.npc;
				db.open(n);
				n.id_sell_service = new_obj?.id || 0;
				db.commit(n);
				this.tpl.reload('#goods');

			},
			edit_obj_fn: (new_obj) => {
				NPCGoodsWindow.open({ goods: new_obj });
			},
		});


	}
}
