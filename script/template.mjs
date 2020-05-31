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

const getRoot = (el) => (el.shadowRoot ? el.shadowRoot : el.getRootNode()).host;

const _globals = (0,eval)("this");
_globals.encodeHTML = encodeHTMLSource;
_globals.getRoot = getRoot;

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
	for (const script of document.querySelectorAll('script.reload')) {
		const new_script = document.createElement('script');
		new_script.text = script.text;
		script.remove();
		document.head.append(new_script);
	}
	loaded_files.push(filename);
};

const compiled_cache = new Map();
export const compile_tpl = (tpl_id) => {
	const tpl_string = document.getElementById(tpl_id).text;

	let cached = compiled_cache.get(tpl_id);
	if (cached) return cached;

	const c = {
		selfcontained: false,
		doNotSkipEncoded: false
	};
	const cse = { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" };
	let str = tpl_string;

	str = ("var out=''; out+='" + (str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
				.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""))
		.replace(/'|\\/g, "\\$&")
		.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
		.replace(/([\\]?)\{([\s\S]+?[^\\])\}/g, (m, lbrace_prefix, code) => {
			if (lbrace_prefix === '\\') return m;
			code = unescape(code)
				.replace(/\\\}/g, '}')
				.replace(/\$this/g, "getRoot(this)")
				.replace(/^assign (.*)$/, "local.$1;")
				.replace(/^for \s*(.*?)\s*=(.*?);(.*?);(.*?)$/, "{const backup_name=\"$1\"; const backup=local[backup_name]; for (let $1 = $2; $3; $4) { local[backup_name] = $1;")
				.replace(/^foreach(.*) as (.*)$/, "{const backup_name=\"$2\"; const backup=local[backup_name]; for (const $2 of $1) { local[backup_name] = $2;")
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
		+ "';return out;")
		.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
		//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

	console.log(str);
	const ret = new Function("local", str);
	compiled_cache.set(tpl_id, ret);
	return ret;
}
