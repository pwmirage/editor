/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

import DB from './DB.mjs';
import { ROOT_URL } from './Util.mjs';

const db = new DB();
export default db;

const db_meta = {
	id: 0,
	tag: "version",
	base: 0,
	edit_time: 0,
	project: {},
};

db.register_type('metadata', [db_meta]);
db.register_type('items', g_db.items);
db.register_type('recipes', g_db.recipes);
db.register_type('npc_goods', g_db.npc_goods);
db.register_type('npc_recipes', g_db.npc_recipes);
db.register_type('npcs', g_db.npcs);
db.register_type('quests', g_db.quests);

db.load_map = (name) => {
	return new Promise((resolve, reject) => {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = resolve;
		script.onerror = reject;
		script.charset = "utf-8";
		script.src = ROOT_URL + 'data/base/map/world/spawners.js';
		document.head.appendChild(script);

	}).then(() => {
		db.register_type('spawners_world', g_db['spawners_' + name]);
	});
};
