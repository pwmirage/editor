import { newElement, newArrElements, escape } from '../DomUtil.mjs';
import { get, sleep } from '../Util.mjs';
import Item from '../Item.mjs';
import db from '../PWDB.mjs';

class RecipeList extends HTMLElement {
	constructor() {
		super();

		this.diff = JSON.parse(this.dataset.diff);
		const shadow = this.attachShadow({mode: 'open'});
		const linkElem = document.createElement('link');
		linkElem.setAttribute('rel', 'stylesheet');
		linkElem.setAttribute('href', 'css/preview/common.css');
		shadow.append(linkElem);

		const content = document.querySelector('#pw-recipe-list').content.cloneNode(true);
		shadow.append(content);
		const recipes = shadow.querySelector('#recipes');
		for (let i = 0; i < 8 * 4; i++) {
			const item_id = this.diff.tabs[0].items[i];
			const item = db.items[item_id];
			const icon_id = item ? item.icon : -1;
			const item_el = Item.get_icon(icon_id);
			if (item) {
				const tooltip_container = newElement('<span class="tooltip"></span>');
				const tooltip = newElement('<span class="item-tooltip-static"></span>');
				tooltip_container.append(tooltip);
				tooltip.append(newElement('<p class="title">' + escape(item.name) + ' (ID #' + item.id + ')</p>'));
				tooltip.append(newElement('<p class="type">' + Item.TYPE_NAME[item.type] + '</p>'));
				item_el.append(tooltip_container);
			}
			recipes.append(item_el);
		}
	}
}

(async () => {
	await Item.set_iconset('img/iconlist_ivtrm.png');
	customElements.define('pw-recipe-list', RecipeList);
})();

export default RecipeList
