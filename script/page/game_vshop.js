/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['game_vshop'] = new class {
	async init(args = {}) {
		await Promise.all([
			load_tpl(ROOT_URL + 'tpl/page/game_vshop.tpl'),
			load_script(ROOT_URL + 'script/game_util.js?v=' + MG_VERSION),
		]);

		this.tpl = new Template('tpl-game-vshop');

		this.dom = document.createElement('div');
		this.shadow = this.dom.attachShadow({mode: 'open'});
		this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

		let req;
		req = await get(ROOT_URL + 'api/game/accounts', { is_json: 1});
		this.accounts = req.data;

		this.vote_points = this.accounts[0]?.vote_points || 0;

		if (MG_DEFBRANCH != 1) {
			this.shop1_raw = JSON.parse('{"_db":{"type":"npc_crafts"},"id":2155872258,"name":"Vote Shop","option":"Manufacture Goods","pages":[{"recipe_id":[2155872259,2155872260,2155872261,2155872262,2155872263,2155872264,2155872265,2155872266,2155872274,2155872273,2155872272,2155872271,2155872270,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2155872286],"title":"Misc"},{"title":"Mounts","recipe_id":[2155872287,2155872288,2155872289,2155872290,2155872291,2155872297,2155872298,null,null,null,null,null,null,null,null,null,2155872300,2155872301,2155872302,2155872303,2155872304,2155872305,2155872306,null,null,null,null,null,null,null,null,2155872299]},{"title":"Fash 1","recipe_id":[2155872307,2155872308,2155872309,null,2155872311,2155872312,2155872318,null,2155872313,2155872314,2155872315,null,2155872316,2155872317,2155872319,2155872320,2155872321,2155872322,2155872323,2155872324,2155872325,2155872326,2155872327,null,2155872329,2155872330,2155872331,2155872332,2155872333,2155872334,2155872335,2155872336]},{"title":"Fash 2","recipe_id":[2155872337,2155872338,2155872339,null,null,null,null,null,2155872340,2155872341,2155872342,2155872343,null,null,null,null,2155872347,2155872346,2155872345,2155872344]}],"_allocated":true}');
		} else {
			req = await get(ROOT_URL + 'latest_db/get/npc_crafts/' + DB.parse_id('8:2'), { is_json: 1 });
			this.shop1_raw = req.data;
		}

		const recipes = [];
		for (const p of this.shop1_raw.pages) {
			for (const rid of p.recipe_id) {
				if (!rid) continue;
				recipes.push(rid);
			}
		}

		if (MG_DEFBRANCH != 1) {
			this.shop1_raw.recipes = init_id_array(JSON.parse('[{"_db":{"type":"recipes"},"id":2155872259,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":15761,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872260,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":15760,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872261,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":11208,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872262,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":12979,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872263,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":26651,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872264,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":12361,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872265,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":12967,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872266,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":19281,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872274,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":18235,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872273,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":19004,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872272,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":19148,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872271,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":18185,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872270,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":17810,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872286,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":18806,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872287,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28108,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872288,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28068,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872289,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27855,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872290,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28232,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872291,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25400,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872297,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":22250,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872298,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27340,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872300,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":16870,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872301,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":16868,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872302,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":13932,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872303,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":16867,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872304,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":12348,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872305,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":12347,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872306,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":13934,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872299,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":10795,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872307,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28008,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872308,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28006,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872309,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28010,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872311,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28666,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872312,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28667,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872318,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28668,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872313,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28007,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872314,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28005,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872315,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28009,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872316,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28661,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872317,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28662,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872319,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28664,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872320,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":28663,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872321,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":13290,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872322,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":26453,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872323,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":26344,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872324,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":26517,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872325,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27554,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872326,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27557,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872327,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27793,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872329,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":26281,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872330,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":26464,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872331,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":24358,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872332,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":24362,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872333,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27552,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872334,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27556,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872335,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27559,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872336,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27562,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872337,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27696,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872338,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27697,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872339,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":27330,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872340,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25066,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872341,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25070,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872342,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25075,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872343,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25072,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872347,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25065,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872346,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25069,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872345,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25074,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258},{"_db":{"type":"recipes"},"id":2155872344,"major_type":0,"minor_type":0,"name":"","recipe_level":0,"skill_id":0,"skill_level":0,"targets":[{"id":25071,"prob":1},{"id":0,"prob":0},{"id":0,"prob":0}],"num_to_make":1,"duration":0,"xp":0,"sp":0,"mats":[{"id":26225,"num":1},{"id":0,"num":0},{"id":0,"num":0}],"_allocated":true,"crafts":2155872258}]'));
		} else {
			req = await get(ROOT_URL + 'latest_db/get/recipes/' + recipes.join(','), { is_json: 1 });
			this.shop1_raw.recipes = init_id_array(req.data);
		}

		req = await get(ROOT_URL + 'latest_db/get/items/' + this.shop1_raw.recipes.map(r => r?.targets?.[0]?.id).filter(id => id).join(','), { is_json: 1 });
		this.shop1_raw.items = init_id_array(req.data);

		this.tabs = { 'All': [] };
		for (const p of this.shop1_raw.pages) {
			if (!p.title) {
				continue;
			}

			if (p.title.endsWith('1') || p.title.endsWith('2')) {
				p.title = p.title.substring(0, p.title.length - 1);
			}

			if (!this.tabs[p.title]) {
				this.tabs[p.title] = [];
			}
			const tp = this.tabs[p.title];
			for (const rid of p.recipe_id) {
				if (!rid) {
					continue;
				}

				const r = this.shop1_raw.recipes[rid];
				if (!r?.targets?.[0]?.id) {
					continue;
				}

				const item = this.shop1_raw.items[r.targets[0].id];
				const o = { id: item.id, name: item.name, icon: item.icon, num: r.num_to_make, cost: r.mats[0].num };
				tp.push(o);
				this.tabs ['All'].push(o);
			}
		}
		
		this.tab_all = this.tabs['All'];
		this.cur_tab = 'All';
		const data = await this.tpl.run({ page: this });

		const s = newStyle(get_wcf_css().href);
		const s_p = new Promise((resolve) => { s.onload = resolve; });
		this.shadow.append(s);
		this.shadow.append(data);

		await s_p;
		return this.dom;
	}

	select_tab(name) {
		this.cur_tab = name;
		this.tpl.reload('#chooser');
		this.tpl.reload('#page');
		this.shadow.querySelector('#search').value = '';
		this.tabs['All'] = this.tab_all;
	}

	onsearch_input(e, el) {
		if (el.value) {
			const search = el.value.toLowerCase();
			this.tabs['All'] = this.tab_all.filter(r => r.name.toLowerCase().includes(search));
		} else {
			this.tabs['All'] = this.tab_all;
		}
		this.cur_tab = 'All';
		this.tpl.reload('#chooser');
		this.tpl.reload('#page');
	}

	onrolesearch_input(e, el) {
		this.role_search_val = el.value.toLowerCase();
		this.tpl.reload('#accounts');
	}

	select_role(el, id) {
		this.selected_role_id = id;
		for (const el of this.shadow.querySelectorAll('.role.selected')) {
			el.classList.remove('selected');
		}
		el.classList.add('selected');
	}

	async buy_item(item_id, cost) {
		if (!this.selected_role_id) {
			let req = confirm('You need to select a character first.', '', 'Error');
			await sleep(1);
			g_confirm_dom.classList.add('noconfirm');
			return;
		}

		const item = this.shop1_raw.items[item_id];
		item.cost = cost;

		if (item.id == 12813 || item.id == 12816) {
			item.req_level = 45;
		}

		if (item.id == 26645 || item.id == 26648) {
			item.req_level = 60;
		}

		if (item.id == 15761 || item.id == 15760) {
			item.req_level = 75;
		}

		const role_id = this.selected_role_id;
		const role = this.accounts.find(a => a.id == (role_id & (~0xf)))
			.roles.find(r => r.id == role_id);

		this.tpl.reload('#buy_dialogue', { item, role });
		let req = confirm(this.shadow.querySelector('#buy_dialogue').innerHTML, '', 'Confirm purchase');
		await sleep(1);
		const amount_el = g_confirm_dom.querySelector('input[name="amount"]');
		let amount = 0;
		let remaining_points = 0;
		amount_el.oninput = (e) => {
			if (!amount_el.value || parseInt(amount_el.value) <= 0) {
				amount_el.value = '1';
			} else if (parseInt(amount_el.value) > 999) {
				amount_el.value = '999';
			}
			amount = parseInt(amount_el.value);
			remaining_points = this.vote_points - item.cost * amount;
			g_confirm_dom.querySelector('.price').textContent = item.cost * amount;
			g_confirm_dom.querySelector('.remaining').innerHTML = remaining_points;

			g_confirm_dom.querySelector('.remaining').innerHTML = 
				remaining_points >= 0 ?
				remaining_points :
				'<span style="color: red;">' + remaining_points + '</span>';

			g_confirm_dom.querySelector('.wrning').innerHTML = 
				remaining_points >= 0 ?
				'The item will be character bound.' :
				'<span style="color: red; font-weight: bold;">You don\'t have enough points.</span>';

			if (remaining_points < 0 || (item.req_level ?? 0) > role.level) {
				g_confirm_dom.querySelector('.buttonPrimary').classList.add('disabled'); 
			} else {
				g_confirm_dom.querySelector('.buttonPrimary').classList.remove('disabled'); 
			}
		};
		amount_el.oninput();
		if (!(await req) || remaining_points < 0) {
			return;
		}

		loading_wait();
		req = await post(ROOT_URL + 'api/game/vshop/buy', { is_json: 1, data: {
			id: item.id,
			amount: amount,
			roleid: role.id,
		}});
		loading_wait_done();
		if (!req.ok) {
			notify('error', (req.data.err || 'Unexpected error occured. Please try again'));
			return;
		}

		notify('success', 'Item sent!');
		this.vote_points = remaining_points;
		this.tpl.reload('#accounts');
	}
}
