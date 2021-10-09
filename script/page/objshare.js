/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['objshare'] = new class {
    async init(args = {}) {
        await load_tpl(ROOT_URL + 'tpl/page/objshare.tpl');
        this.tpl = new Template('tpl-page-objshare');

        this.obj = args.obj;

        this.dom = document.createElement('div');
        this.shadow = this.dom.attachShadow({mode: 'open'});

        this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

        this.opts = await PWDB.get_share_opts(this.obj);

        const data = await this.tpl.run({ page: this, loading: true, obj: this.obj, opts: this.opts });

        const s = newStyle(get_wcf_css().href);
        const s_p = new Promise((resolve) => { s.onload = resolve; });
        this.shadow.append(s);
        this.shadow.append(data);

        await s_p;

        this.select_tab('current');

        return this.dom;
    }

    async select_tab(name) {
        this.cur_tab = name;
        const data = {};
        let req;

        data.type = name;
        this.search_str = '';

        this.tpl.reload('.categories');
        this.tpl.reload('#body', { loading: true });

        let pid;
        if (name == 'current') {
            pid = Editor.current_project.id;
        } else {
            pid = 'latest';
        }

        const type = this.obj._db.type.replaceAll('_', '-');
        this.url = window.location.origin + ROOT_URL + 'preview/' + pid + '/' + type + '/' + DB.serialize_id(this.obj.id).substring(1);

        //req = await post(ROOT_URL + 'api/project/list', { is_json: 1, data });
        //this.list = req.data;
        this.tpl.reload('#body', { loading: false });
    }
};
