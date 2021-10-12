/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

g_mg_pages['objshare'] = new class {
    async init(args = {}) {
        await load_tpl(ROOT_URL + 'tpl/page/objshare.tpl');
        this.tpl = new Template('tpl-page-objshare');

        this.obj = args.obj;
        this.url_generated = false;
        this.current_url = null;

        this.dom = document.createElement('div');
        this.shadow = this.dom.attachShadow({mode: 'open'});

        this.tpl.compile_cb = (dom) => HTMLSugar.process(dom, this);

        this.opts = await PWDB.get_share_opts(this.obj);
        if (this.opts.share) {
            const pid = Editor.current_project.id;
            const type = this.obj._db.type.replaceAll('_', '-');

            this.url = this.current_url = window.location.origin + ROOT_URL + 'preview/' + pid + '/' + type + '/' + DB.serialize_id(this.obj.id).substring(1);
        }

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

        this.tpl.reload('#body', { loading: true });

        const type = this.obj._db.type.replaceAll('_', '-');

        if (this.cur_tab == 'latest' && this.opts.exists_in_latest) {
            const pid = 'latest';
            this.url = window.location.origin + ROOT_URL + 'preview/' + pid + '/' + type + '/' + DB.serialize_id(this.obj.id).substring(1);
        } else {
            this.url = this.current_url ?? null;
        }

        //req = await post(ROOT_URL + 'api/project/list', { is_json: 1, data });
        //this.list = req.data;
        this.tpl.reload('#body', { loading: false });
    }

    async generate_current(el, e) {
        el.classList.add('loading-spinner', 'disabled');
        const resp = await PWDB.share_obj(this.obj, {});

        if (resp.ok) {
            notify('success', 'URL generated');

            const pid = Editor.current_project.id;
            const type = this.obj._db.type.replaceAll('_', '-');

            this.url = this.current_url = window.location.origin + ROOT_URL + 'preview/' + pid + '/' + type + '/' + DB.serialize_id(this.obj.id).substring(1);
            this.url_generated = true;
            this.tpl.reload('#body', { loading: false });
            return;
        } else {
            notify('error', resp.data.err || 'Failed to generate an URL: unknown error');
        }

        el.classList.remove('loading-spinner', 'disabled');
        el.removeAttribute('disabled');
    }
};