/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

let g_navbar = null;

class Navbar {
	constructor(org_menu_dom) {
		this.org_menu_dom = org_menu_dom;
		this.dom = newElement('<ol class="boxMenu overlayed"></ol>');

		this.org_menu_dom.parentNode.insertBefore(this.dom, this.org_menu_dom);

		const b = this.buttons = {};
		b['editor'] = this.add_button(null, 'Editor');

		let p;
		p = this.add_button(b['editor'], 'Change Map');
		p.onclick = async () => {
			const win = await MapChooserWindow.open({ });
		};

		p = this.add_button(null, 'Parent');
		this.add_button(p, 'Child 1');
		this.add_button(p, 'Child 2');
		const p2 = this.add_button(p, 'Parent 2');
		this.add_button(p2, 'Child 2.1');
		this.add_button(null, 'Test 2');
		g_navbar = this;
	}

	add_button(parent, content) {
		const btn = newElement('<li><a href="javascript:void(0);" class="boxMenuLink"><span class="boxMenuLinkTitle">' + content + '</span></a></li>');
		if (!parent) {
			parent = this.dom;
		} else if (!parent.classList.contains('boxMenuHasChildren')) {
			parent.classList.add('boxMenuHasChildren');
			const depth_regex = parent.parentNode.className.match(/boxMenuDepth([0-9]+)/);
			const depth = depth_regex ? (parseInt(depth_regex[1]) + 1 || 1) : 1;
			const sub_list = newElement('<ol class="boxMenuDepth' + depth + '"></ol>');
			parent.append(sub_list);
			parent = sub_list;
		} else {
			parent = parent.querySelector('ol');
		}
		parent.appendChild(btn);
		return btn;
	}
}
