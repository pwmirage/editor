/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk
 */

'use strict';

class Template {
	static tpl_map = new WeakMap();
	static tpl_map_idx = 0;
	static tpl_id_map = {};

	constructor(name) {
		this.name = name;
		this.var_map = new Map();
		this.vars = [];
		this.id = Template.tpl_map_idx++;

		/* weak map keys can't be primitives, so use a dummy object */
		const id_obj = Template.tpl_id_map[this.id] = {};
		Template.tpl_map.set(id_obj, this);
	}

	get_var_id(obj) {
		let id = this.var_map.get(obj);
		if (id == undefined) {
			id = this.vars.push(obj) - 1;
			this.var_map.set(obj, id);
		}
		return id;
	}

	static get_by_id(id) {
		const id_obj = Template.tpl_id_map[id];
		return Template.tpl_map.get(id_obj);
	}

	static build(str) {
		const append_s = '\nout += ';
		const content = str
			.replace(/(^\s+|\s+$)/gm, '' /* trim each line (tabs & spaces) */)
			.replace(/\n/g, '' /* don't break `out` with multi-line strings */)
			.replace(/\\"/g, '&quot;' /* escape double quotes */)
			.replace(/"/g, '\\"' /* escape double quotes */)
			.replace(/{\*.*?\*}/g, '' /* remove comments */)
			.replace(/\\{/g, "&#123;").replace(/\\}/g, "&#125;" /* mangle escaped braces so they're not processed below */)
			.replace(/{@@(.*?)@@}/g, (match, content) => { /* raw text block */
				return content
					.replace(/{/g, "&#123;").replace(/}/g, "&#125;" /* mangle braces so they're not processed below */)
			})
			.replace(/{(.*?[^\\])}/g, (match, content) => { /* for each code block */
				return '";\n' + content
					.replace(/\\"/g, '"' /* don't escape double quotes -> they're real strings now */)
					.replace(/(^|[^\\])\$/g, "$1local." /* $ variable access */)
					.replace(/^assign (.*)$/, "local.$1;" /* setup new $ variable */)
					.replace(/^(?:foreach|for) \s*(.*?)\s*=(.*?);(.*?);(.*?)$/, "{const _bckup_name=\"$1\"; const _bckup=local[_bckup_name]; for (let $1 =$2;$3;$4) { local[_bckup_name] = $1;" /* make the local variable available with $variable syntax, so also backup the previous value of local[var_name] */)
					.replace(/^(?:foreach|for) (.*) (of|in) (.*)$/, "{const _bckup_name=\"$1\"; const _bckup=local[_bckup_name]; for (const $1 $2 $3) { local[_bckup_name] = $1;")
					.replace(/^\/(foreach|for)$/g, "}; local[_bckup_name] = _bckup; };" /* restore local[var_name] from before the loop */)
					.replace(/^if (.*)$/g, ";if ($1) {")
					.replace(/^else$/g, "} else {")
					.replace(/^else if (.*)$/g, "} else if ($1) {")
					.replace(/^\/if$/g, "}")
					.replace(/^serialize (.*)$/g, (match, content) => {
						return append_s + '"Template.get_by_id(" + tpl.id + ").vars[" + tpl.get_var_id(' + content + ') + "]"';
					})
					.replace(/^hascontent$/g, "{const _bckup = out; let _has_cntnt = false; {")
					.replace(/^content$/g, "{ const _bckup = out; {")
					.replace(/^\/content$/g, "} _has_cntnt = _bckup != out; }")
					.replace(/^\/hascontent$/g, "} if (!_has_cntnt) out = _bckup; }")
					.replace(/^@(.*)/g, (match, content) => { /* text block */
						return append_s + '(' + content + ');';
					})
				+ append_s + '"';
			})
			.replace(/&#123;/g, '{').replace(/&#125;/g, '}' /* un-mangle braces */)
			.replace(/\\}/g, '}' /* get rid of escaped braces */)
			.replace(/\\\$/g, '$' /* get rid of escaped $ */);
		;
		return '\'use strict\';\nlet out = "' + content + '";\nreturn out;';
	}

	compile() {
		const tpl_script = document.getElementById(this.name);
		if (!tpl_script) {
			throw new Error('Template script  ' + this.name + ' doesn\'t exist');
		}

		const script_text = tpl_script.text
			.replace(/(<[^<{>]*{(.*?)>)/g, (match, tpl_tag) => {
				/* convert code inside a tag into an attribute */
				let count = 0;
				return tpl_tag
					.replace(/{(.*?[^\\])}/g, (match, content) => {
						const c = count++;
						content = content
							.replace(/"/g, '#quot;' /* escape double quotes */)
							.replace(/'/g, '#apos;');
						return ' tpl-data' + c + '=\'' + content + '\' tpl-end-data' + c + ' ';
					})
			})
			.replace(/{/g, '<!--')
			.replace(/}/g, '-->');

		this.raw_data = document.createElement('div');
		this.raw_data.innerHTML = script_text;

		const f_text = Template.build(tpl_script.text);
		this.func = new Function('tpl', 'local', f_text);
	}

	run(args = {}) {
		if (!this.func) {
			this.compile();
		}

		this.args = args || {};
		const html_str = this.func(this, this.args);

		const el = document.createElement('div');
		el.innerHTML = html_str;
		this.data = el;
		if (this.compile_cb) {
			this.compile_cb(this.data);
		}
		return this.data;
	}

	reload(selector, args, tpl_args = {}) {
		const raw = this.raw_data.querySelector(selector);
		const real = tpl_args.el || this.data.querySelector(selector);

		if (!raw || !real) {
			return false;
		}

		const attr_fn = (match, content) => {
			return ' {' + content
				.replace(/#quot;/g, '"' /* escape double quotes */)
				.replace(/#apos;/g, '\'' /* ^ */);
		};

		/* fix outerHTML mangling some (technically invalid) syntax */
		const raw_str = raw.outerHTML
			.replace(/ tpl-data[0-9]+='(.*?)'/g, attr_fn)
			.replace(/ tpl-data[0-9]+="(.*?)"/g, attr_fn)
			.replace(/ tpl-end-data[0-9]+(="")?[ ]?/g, '}')
			.replace(/(<!--|&lt;!--)/g, '{')
			.replace(/(-->|--&gt;)/g, '}')
			.replace(/<img{ }/g, '<img ')
			.replace(/<\/img{>/g, '</img>');

		const new_fn_text = Template.build(raw_str);
		const new_fn = new Function('tpl', 'local', new_fn_text);

		const new_real = document.createElement('template');
		if (args) {
			Object.assign(this.args, args);
		}
		new_real.innerHTML = new_fn(this, this.args);
		const new_els = [...new_real.content.childNodes];
		real.replaceWith(...new_els);

		if (this.compile_cb) {
			for (const dom of new_els) {
				if (!dom.querySelectorAll) {
					/* not an Element */
					continue;
				}
				this.compile_cb(dom);
			}
		}
	}
}
