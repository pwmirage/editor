/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

const db = new DB();

const g_db_meta = {
	id: 0,
	tag: "version",
	base: 0,
	edit_time: 0,
	project: {},
};

db.register_type('metadata', [g_db_meta]);
db.register_type('items', g_db.items);
db.register_type('recipes', g_db.recipes);
db.register_type('npc_goods', g_db.npc_goods);
db.register_type('npc_recipes', g_db.npc_recipes);
db.register_type('npcs', g_db.npcs);
db.register_type('quests', g_db.quests);

db.load_map = async (name) => {
	await load_script(ROOT_URL + 'data/base/map/' + name + '/spawners.js?v=' + MG_VERSION);
	db.register_type('spawners_' + name, g_db['spawners_' + name]);
};
