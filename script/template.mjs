// doT.js
// 2011-2014, Laura Doktorova, https://github.com/olado/doT
// Copyright(c) 2020 Darek Stojaczyk
// Licensed under the MIT license.
// Heavily modified for pwmirage.com

import { get } from './Util.mjs';

const doT = {
	name: "doT",
	version: "1.1.1-mirage",
	log: true
};

const encodeHTMLSource = (doNotSkipEncoded) => {
	const encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" };
	const matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
	return (code) => {
		return code ? code.toString().replace(matchHTML, (m) => {return encodeHTMLRules[m] || m;}) : "";
	};
};

const resolveDefs = (c, block, def) => {
	return ((typeof block === "string") ? block : block.toString())
	.replace(c.define || skip, (m, code, assign, value) => {
		if (code.indexOf("def.") === 0) {
			code = code.substring(4);
		}
		if (!(code in def)) {
			if (assign === ":") {
				if (c.defineParams) value.replace(c.defineParams, (m, param, v) => {
					def[code] = {arg: param, text: v};
				});
				if (!(code in def)) def[code]= value;
			} else {
				new Function("def", "def['"+code+"']=" + value)(def);
			}
		}
		return "";
	})
	.replace(c.use || skip, (m, code) => {
		if (c.useParams) code = code.replace(c.useParams, (m, s, d, param) => {
			if (def[d] && def[d].arg && param) {
				var rw = (d+":"+param).replace(/'|\\/g, "_");
				def.__exp = def.__exp || {};
				def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
				return s + "def.__exp['"+rw+"']";
			}
		});
		var v = new Function("def", "return " + code)(def);
		return v ? resolveDefs(c, v, def) : v;
	});
}

const unescape = (code) => {
	return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
}

const loaded_files = [];
export const load_tpl_file = async (filename) => {
	if (loaded_files.includes(filename)) return;

	const file = await get(filename);
	if (!file.ok) {
		throw new Error('Failed to load template: ' + file.url);
	}

	document.querySelector('body').insertAdjacentHTML('beforeend', file.data);
	loaded_files.push(filename);
};

/* 2d map, 1st level key = tpl_id, 2nd level = defines */
const compiled_cache = new Map();
export const compile_tpl = (tpl_id, defines) => {
	const tpl_string = document.getElementById(tpl_id).text;

	let cached_entries = compiled_cache.get(tpl_id);
	if (!cached_entries) {
		cached_entries = new Map();
		compiled_cache.set(tpl_id, cached_entries);
	}

	const cached = cached_entries.get(defines);
	if (cached) return cached;

	const c = {
		use:         /\{\{#([\s\S]+?)\}\}/g,
		useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
		define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
		defineParams:/^\s*([\w$]+):([\s\S]+)/,
		selfcontained: false,
		doNotSkipEncoded: false
	};
	const cse = { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" },
		needhtmlencode, sid = 0, indv,
		str  = (c.use || c.define) ? resolveDefs(c, tpl_string, defines || {}) : tpl_string;

	str = ("var out='" + (str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
				.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""))
		.replace(/'|\\/g, "\\$&")
		.replace(/\{([\s\S]+?)\}/g, (m, code) => {
			code = unescape(code)
				.replace(/^assign (.*)$/, "local.$1;")
				.replace(/\$/g, "local.")
				.replace(/^include id=['"]?([\s\S]+?)['"]?$/g, (m, id) => {
					return ';out+=(' + compile_tpl(id, defines).toString().replace(/\n/g, "") + ')(local);';
				});

			if (code.startsWith('@@')) {
				needhtmlencode = true;
				return cse.startencode + code.substring(2) + cse.end;
			} else if (code.startsWith('@')) {
				return cse.start + code.substring(1) + cse.end;
			}
			return "';" + code + "out+='";
		})
		+ "';return out;")
		.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
		.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
		//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

	if (needhtmlencode) {
		if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = encodeHTMLSource(c.doNotSkipEncoded);
		str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
			+ encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
			+ str;
	}

	const ret = new Function("local", str);
	cached_entries.set(defines, ret);
	return ret;
}
