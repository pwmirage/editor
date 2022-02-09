/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

class LegendWindow extends Window {
	static _tpl_id = 'window/map.tpl';
	static instance = null;

	static async open(args) {
		if (!LegendWindow.instance) {
			LegendWindow.instance = await super.open(args);
		} else {
			Window.container.append(LegendWindow.instance.dom);
		}

		g_map.shadow.querySelector('#open-legend').style.display = 'none';
		return LegendWindow.instance;
	}

	async init() {
		const data = await this.tpl.run( { win: this });
		this.shadow.append(data);

		await super.init();
		this.move(5, Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight - 125);

		return true;
	}

	tpl_compile_cb(dom) {
		super.tpl_compile_cb(dom);

		dom.querySelectorAll('#filters input').forEach((e) => {
			e.oninput = () => this.filter();
		});

		dom.querySelectorAll('#options input').forEach((e) => {
			e.oninput = () => this.set_opts();
		});

		dom.querySelectorAll('#show-real-bg').forEach((e) => {
			e.oninput = () => {
				g_map.show_real_bg = e.checked;
				g_map.refresh_bg_img();
			};
		});
	}

	collapse(el) {
		el.classList.toggle("active");
		const content = el.nextElementSibling;
		if (content.style.maxHeight){
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = content.scrollHeight + "px";
		}
	}

	filter() {
		const opts = {};

		const inputs = this.shadow.querySelectorAll('#filters input');
		for (const input of inputs) {
			if (input.type == 'checkbox') {
				opts[input.id] = input.checked;
			} else if (input.type == 'number') {
				opts[input.id] = parseInt(input.value);
			} else {
				opts[input.id] = input.value;
			}
		}

		g_map.filter_spawners(opts);
	}

	set_opts() {
		const opts = {};

		const inputs = this.shadow.querySelectorAll('#options input');
		for (const input of inputs) {
			if (input.type == 'checkbox') {
				opts[input.id] = input.checked;
			} else if (input.type == 'number') {
				opts[input.id] = parseInt(input.value);
			} else {
				opts[input.id] = input.value;
			}
		}

		g_map.set_spawner_opts(opts);
	}


	minimize() {
		const minimized = super.minimize();
		this.set_margin(0, minimized ? this.full_bounds.height - this.dom_header.offsetHeight : 0);
	}

	close() {
		g_map.shadow.querySelector('#open-legend').style.display = 'block';
		super.close();
	}
}
