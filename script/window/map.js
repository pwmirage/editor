/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

let g_legend_win = null;

class LegendWindow extends Window {
	async init() {
		if (g_legend_win) return false;
		g_legend_win = this;

		const shadow = this.dom.shadowRoot;
		const tpl = await get(ROOT_URL + 'tpl/window/map_legend.tpl');
		const els = newArrElements(tpl.data);
		shadow.append(...els);

		shadow.querySelectorAll('input').forEach((e) => {
			e.addEventListener('input', () => this.filter());
		});

		return super.init();
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
		const filters = { npc: [], resource: [], mob: [] };
		const query_sel = (q) => this.shadow.querySelector('#' + q);

		if (!query_sel('npc-show').checked) filters.npc.push((s) => false);
		if (!query_sel('npc-show-auto').checked) filters.npc.push((s) => s.trigger);
		if (!query_sel('npc-show-on-trigger').checked) filters.npc.push((s) => !s.trigger);
		if (!query_sel('resource-show').checked) filters.resource.push((s) => false);
		if (!query_sel('resource-show-auto').checked) filters.resource.push((s) => s.trigger);
		if (!query_sel('resource-show-on-trigger').checked) filters.resource.push((s) => !s.trigger);
		if (!query_sel('mob-show').checked) filters.mob.push((s) => false);
		if (!query_sel('mob-show-auto').checked) filters.mob.push((s) => s.trigger);
		if (!query_sel('mob-show-on-trigger').checked) filters.mob.push((s) => !s.trigger);

		const by_mob = (fn) => {
			return (s) => {
				const type = s.groups[0]?.type || 0;
				const mob = db.monsters[type];
				if (!mob) return true;
				return fn(mob);
			}
		}
		if (!query_sel('mob-show-ground').checked) filters.mob.push(by_mob((m) => m.fly_speed || m.swim_speed));
		if (!query_sel('mob-show-flying').checked) filters.mob.push(by_mob((m) => !m.fly_speed));
		if (!query_sel('mob-show-water').checked) filters.mob.push(by_mob((m) => !m.swim_speed));

		if (!query_sel('mob-show-boss').checked) filters.mob.push(by_mob((m) => !m.show_level));
		if (!query_sel('mob-show-nonboss').checked) filters.mob.push(by_mob((m) => m.show_level));
		if (!query_sel('mob-show-aggressive').checked) filters.mob.push(by_mob((m) => !m.is_aggressive));
		if (!query_sel('mob-show-nonaggressive').checked) filters.mob.push(by_mob((m) => m.is_aggressive));

		const minlevel = parseInt(query_sel('mob-show-lvl-min').value);
		const maxlevel = parseInt(query_sel('mob-show-lvl-max').value);
		filters.mob.push(by_mob((m) => m.level >= minlevel && m.level <= maxlevel));

		const map_filters = {};

		for (const type in filters) {
			map_filters[type] = (s) => {
				for (const f of filters[type]) {
					if (!f(s)) {
						return false;
					}
				}
				return true;
			}
		}

		map_filters.show_labels = query_sel('show-name-labels').checked;
		map_filters.search = query_sel('search').value;
		g_map.filter_markers(map_filters);
	}
}
