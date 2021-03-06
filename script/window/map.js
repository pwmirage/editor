/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

let g_legend_win = null;

class LegendWindow extends Window {
	static loaded = load_tpl(ROOT_URL + 'tpl/window/map.tpl');

	async init() {
		if (g_legend_win) return false;
		g_legend_win = this;

		await LegendWindow.loaded;
		const shadow = this.dom.shadowRoot;
		this.tpl = new Template('tpl-map-legend');
		this.tpl.compile_cb = (dom) => this.tpl_compile_cb(dom);

		const data = await this.tpl.run( { win: this });
		shadow.append(data);

		shadow.querySelectorAll('input').forEach((e) => {
			e.oninput = () => this.filter();
		});

		let b = shadow.querySelector('#show-real-bg');
		b.onclick = () => {
			g_map.show_real_bg = b.checked;
			g_map.refresh_bg_img();
		};

		await super.init();
		this.move(5, Window.bounds.bottom - Window.bounds.top - this.dom_win.offsetHeight - 125);

		g_map.shadow.querySelector('#open-legend').style.display = 'none';
		this.filter();
		return true;
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

		const inputs = this.shadow.querySelectorAll('input');
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

	minimize() {
		const minimized = super.minimize();
		this.set_margin(0, minimized ? this.full_bounds.height - this.dom_header.offsetHeight : 0);
	}

	close() {
		g_map.shadow.querySelector('#open-legend').style.display = 'block';
		g_legend_win = null;
		super.close();
	}
}
