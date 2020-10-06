// doT.js
// 2011-2014, Laura Doktorova, https://github.com/olado/doT
// 2020 Darek Stojaczyk
// Licensed under the MIT license.
// Heavily modified for pwmirage.com

const encodeHTML = () => {
	const encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" };
	const matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
	return (code) => {
		return code ? code.toString().replace(matchHTML, (m) => {return encodeHTMLRules[m] || m;}) : "";
	};
};

class Template {
	static debug = false;
	static loaded_files = new Set();
	static last_el = document.body.lastElementChild;
	static compiled_cache = new Map();

	constructor(file, id) {
		this.filename = file;
		this.id = id;
	}

	static async load_file(filename) {
		if (Template.loaded_files.has(filename) && !Template.debug) return;

		const file = await get(filename);
		if (!file.ok) {
			throw new Error('Failed to load template: ' + file.url);
		}

		Template.last_el.insertAdjacentHTML('afterend', file.data);

		for (const script of document.querySelectorAll('script.reload')) {
			const new_script = document.createElement('script');
			new_script.text = script.text;
			script.remove();
			document.head.append(new_script);
		}
		Template.loaded_files.add(filename);
	};

	static build(str) {
		const cse = { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" };

		const unescape = (code) => {
			return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
		};


		const split = str.split('TEMPLATE_END');

		str = split[0];
		str = ("var out=''; out+='" + (str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
					.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""))
			.replace(/'|\\/g, "\\$&")
			.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
			.replace(/([\\]?)\{([\s\S]+?[^\\])\}/g, (m, lbrace_prefix, code) => {
				if (lbrace_prefix === '\\') return m;
				code = unescape(code)
					.replace(/\\\}/g, '}')
					.replace(/^assign (.*)$/, "local.$1;")
					.replace(/^for \s*(.*?)\s*=(.*?);(.*?);(.*?)$/, "{const backup_name=\"$1\"; const backup=local[backup_name]; for (let $1 = $2; $3; $4) { local[backup_name] = $1;")
					.replace(/^foreach(.*) as (.*)$/, "{const backup_name=\"$2\"; const backup=local[backup_name]; for (const $2 of $1) { local[backup_name] = $2;")
					.replace(/^foreach(.*) in (.*)$/, "{const backup_name=\"$1\"; const backup=local[backup_name]; for (const $1 in $2) { local[backup_name] = $1;")
					.replace(/^\/(foreach|for)$/g, "}; local[backup_name] = backup; };")
					.replace(/^if (.*)$/g, ";if ($1) {")
					.replace(/^else$/g, "} else {")
					.replace(/^else if(.*)$/g, "} else if ($1) {")
					.replace(/^\/if$/g, ";}")
					.replace(/^try$/g, ";const backup = out; try {")
					.replace(/^catch$/g, "} catch (e) { out = backup;")
					.replace(/^\/try$/g, ";}")
					.replace(/\$/g, "local.")
					.replace(/^include id=['"]?([\s\S]+?)['"]?$/g, (m, id) => {
						return ';out+=(' + compile_tpl(id).toString().replace(/\n/g, "") + ')(local);\n';
					});

				if (code.startsWith('@@')) {
					return cse.start + '\'' + code.substring(2).replace(/\'/g, '\\\'') + '\'' + cse.end;
				} else if (code.startsWith('@')) {
					return cse.start + code.substring(1) + cse.end;
				}
				return "';" + code + ";\nout+='";
			})
		);

		if (split.length > 1) {
			str += "';\nout += '" + unescape(split[1]).replace(/'/g, '\\\'');
		}

		str += "';return out;";
		str = str.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
			//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

		return new Function("local", str);
	}

	async compile(params) {
		if (this.data) {
			throw new Error('Template already compiled');
		}

		await Template.load_file(this.filename);
		this.params = params;
		if (!this.func) {
			const tpl_string = document.getElementById(this.id).text;

			let cached = Template.compiled_cache.get(this.id);
			if (cached && !Template.debug) {
				this.func = cached;
				this.raw_data = newArrElements(tpl_string.split('TEMPLATE_END')[0]);
				this.data = newArrElements(this.func(params));
				if (this.compile_cb) this.compile_cb(this.data);
				return this.data;
			}

			this.raw_data = newArrElements(tpl_string);
			this.func = Template.build(tpl_string);
			Template.compiled_cache.set(this.id, this.func);
		}

		this.data = newArrElements(this.func(params));
		if (this.compile_cb) this.compile_cb(this.data);
		return this.data;
	}

	reload(selector) {
		const raw = (() => {
			for (const el of this.raw_data) {
				const raw = el.querySelector(selector);
				if (raw) return raw;
			}

			return null;
		})();

		const real = (() => {
			for (const el of this.data) {
				const data = el.querySelector(selector);
				if (data) return data;
			}

			return null;
		})();

		if (!raw || !real) {
			return false;
		}

		const raw_str = unescape(raw.outerHTML)
				.replace(/&amp;/g, '&')
				.replace(/\{if="" /g, '{if ')
				.replace(/\{="" if}=""/g, '{/if}')
		const new_fn = Template.build(raw_str);
		const new_real = newArrElements(new_fn(this.params));
		real.replaceWith(...new_real);
		if (this.compile_cb) this.compile_cb(new_real);
	}
}
