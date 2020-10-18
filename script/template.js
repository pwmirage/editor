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
			.replace(/"/g, '\\"' /* escape double quotes */)
			.replace(/{@@(.*?)@@}/g, (match, content) => { /* raw text block */
				return content
					.replace(/{/g, "&#123;").replace(/}/g, "&#125;" /* mangle braces so they're not processed below */)
			})
			.replace(/{(.*?[^\\])}/g, (match, content) => { /* for each code block */
				return '";\n' + content
					.replace(/\\"/g, '"' /* don't escape double quotes -> they're real strings now */)
					.replace(/\$/g, "local." /* $ variable access */)
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
			.replace(/\\}/g, '}' /* get rid of escaped braces */);
		;
		return '\'use strict\';\nlet out = "' + content + '";\nreturn out;';
	}

	compile() {
		const tpl_script = document.getElementById(this.name);
		if (!tpl_script) {
			throw new Error('Template script  ' + this.name + ' doesn\'t exist');
		}

		const script_text = tpl_script.text;

		this.raw_data = document.createElement('div');
		const el = document.createElement('template');
		el.innerHTML = script_text;
		this.raw_data.append(...el.content.childNodes);

		const f_text = Template.build(script_text);
		this.func = new Function('tpl', 'local', f_text);
	}

	run(args = {}) {
		if (!this.func) {
			this.compile();
		}

		this.args = args;
		const html_str = this.func(this, args);

		const el = document.createElement('template');
		el.innerHTML = html_str;
		this.data = [...el.content.childNodes];
		if (this.compile_cb) {
			for (const dom of this.data) {
				if (!dom.querySelectorAll) {
					/* not an Element */
					continue;
				}
				this.compile_cb(dom);
			}
		}
		return this.data;
	}

	reload(selector, args = this.args) {
		const raw = this.raw_data.querySelector(selector);

		const real = (() => {
			for (const el of this.data) {
				if (!el.querySelector) continue;
				const data = (el.parentElement || el).querySelector(selector);
				if (data) return data;
			}

			return null;
		})();

		if (!raw || !real) {
			return false;
		}

		/* fix outerHTML mangling some (technically invalid) syntax */
		const raw_str = raw.outerHTML
				.replace(/&amp;/g, '&')
				.replace(/\{if="" /g, '{if ')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
		;
		const new_fn_text = Template.build(raw_str);
		const new_fn = new Function('tpl', 'local', new_fn_text);

		const new_real = document.createElement('template');
		new_real.innerHTML = new_fn(this, args);
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
