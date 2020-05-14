/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

import DB from './DB.mjs';

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
db.register_type('items', g_items);
