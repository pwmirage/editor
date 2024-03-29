/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

'use strict';

class DB {
	constructor() {
		/* assoc array:
		 *  array name => array metadata
		 */
		this.type_info = {};

		this.objects = new Map();

		if (!DB.force_null) {
			DB.force_null = Symbol();
		}

		/* 2d array of changesets. First level is the changeset generation, second level is just
		 * a collection. This is stored specifically for dumping the changes to JSON easily.
		 * The first changelog entry is always empty for convenience. Generation 0 is always the
		 * initial object version, generation 1 is the first diff, and with this dummy changeset
		 * at index 0, the generation 1 will be at index 1.*/
		this.changelog = [
			new Set(),
			new Set(),
		];

		/* callbacks to be called on commit() */
		this.commit_cbs = new Set();
		/* static offset for new IDs in this DB */
		this.new_id_start = 0;
		/* increment-only offset for new IDs in this DB. Increments with every new obj */
		this.new_id_offset = 0;
	}

	/**
	 * Make `objects` a new DB array. obj_init_cb will be called on all `objects`,
	 * as well as on any additional objects created at runtime. The parameters are
	 * just (obj). `objects` and `obj_init_cb` can be NULL.
	 */
	register_type(name, objects, obj_init_cb) {
		if (this.type_info[name]) {
			throw new Error(`DB type (${name}) already registered`);
		}

		/* at least one object there - as a template for new_obj() */
		if (!objects?.length) objects = [{ id: 0 }];

		if (this[name]) throw new Error(`Trying to use reserved type name (${name})`);
		const type = this.type_info[name] = {};
		type.obj_init_cb = obj_init_cb;
		type.alias_offset = undefined;

		const db = this;
		const obj_map = new Map();
		this[name] = new Proxy(obj_map, {
			set(map, k, v) {
				const id = DB.parse_id(k);
				if (v === undefined) {
					map.set(id, null);
				} else {
					map.set(id, v);
				}
				return true;
			},
			get(map, k) {
				if (k === 'filter') {
					return function(fn) {
						let ret = [];
						for (const obj of map.values()) {
							if (obj && fn(obj)) ret.push(obj);
						}
						return ret;
					}
				}
				if (k === 'map') {
					return function(fn) {
						let ret = [];
						for (const obj of map.values()) {
							if (obj) {
								ret.push(fn(obj));
							}
						}
						return ret;
					}
				}
				if (k === 'find') {
					return function(fn) {
						for (const obj of map.values()) {
							if (obj && fn(obj)) return obj;
						}
						return null;
					}
				}
				if (k === 'size') return map.size;
				if (k === Symbol.iterator) {
					return function *() {
						for (const obj of map.values()) {
							if (obj) {
								yield obj;
							}
						}
					}
				}
				if (typeof map[k] === 'function') {
					return (...args) => Reflect.apply(map[k], map, args);
				}

				if (k == DB.force_null) {
					return undefined;
				}

				let int_k = DB.parse_id(k);
				if (type.alias_offset !== undefined &&
						int_k < 0x80100000 + type.alias_offset) {
					int_k = int_k + 0x80100000 + type.alias_offset;
				}

				return map.get(int_k);
			}
		});

		for (const obj of objects) {
			if (!obj) continue;
			db.init(name, obj);
			obj_map.set(obj.id, obj);
		}
	}

	/**
	 * Register a function to be called on each db_commit() call with the
	 * following params: (obj, diff, prev_vals).
	 *  obj - modified object (with updated fields)
	 *  diff - same as obj, but just new/updated fields
	 *  prev_vals - previous values for fields in `diff`
	 */
	register_commit_cb(cb) {
		this.commit_cbs.add(cb);
		return cb;
	}

	/** Undo a register_commit_cb() */
	unregister_commit_cb(cb) {
		this.commit_cbs.delete(cb);
	}

	/**
	 * Initialize an object that was inserted to the db array.
	 * This is required for any object that you want to call
	 * db_open() and db_commit() on.
	 */
	init(type, obj) {
		obj._db = {};
		obj._db.type = type;

		const type_info = this.type_info[type];
		if (type_info.obj_init_cb) {
			type_info.obj_init_cb(obj);
		}

		if (obj.id > 0 && this.objects.has(obj.id)) {
			throw new Error(`Duplicate ID ${obj.id}`);
		}
		this.objects.set(obj.id, obj);
	}

	/**
	 * Open a database object for writing and return it to the user.
	 * This may create a copy of that object and store it locally.
	 * It would be later reused to detect any custom changes made.
	 *
	 * This function can be called multiple times on the same object,
	 * but will always keep up to one copy.
	 */
	open(obj) {
		if (!obj._db) {
			throw new Error('Missing _db field');
		}

		if (obj._db.latest_state) {
			/* already open */
			return obj;
		}

		/* we'll need two states:
		 * - the latest one to detect changes
		 *   between any two commits() (which are cassed to the callback)
		 * - the generation initial one to detect when fields are changed
		 *   back and forth and shouldn't be included in the changelog
		 */
		obj._db.latest_state = DB.clone_obj(obj);
		obj._db.initial_gen_state = DB.clone_obj(obj);

		/* first time open */
		if (!obj._db.changesets) {
			/* first changeset is always the full, original object */
			let org_obj = DB.clone_obj(obj);
			org_obj._db = { type: obj._db.type, obj: obj, generation: 0 };
			obj._db.changesets = [ org_obj ];
		}
		return obj;
	}

	/**
	 * Try to save an opened object.
	 *
	 * It doesn't need to be called on every change (as changes are
	 * technically saved immediately) but should be always called
	 * at least when an open object is no longer being modified (e.g.
	 * when the editing window gets closed)
	 */
	commit(obj) {
		console.assert(obj._db);
		console.assert(obj._db.latest_state && obj._db.initial_gen_state);
		console.assert(obj._db.changesets);

		const last_changelog = this.changelog[this.changelog.length - 1];
		let changeset = obj._db.changesets[obj._db.changesets.length - 1];

		/* gather modified fields */
		const diff = DB.get_obj_diff(obj, obj._db.latest_state);
		let changeset_empty = true;

		if (diff) {
			/* lazy initialization */
			if (changeset._db.generation < this.changelog.length - 1) {
				/* first change since new generation */

				/* promote diff object to a changeset */
				diff.id = obj.id;
				if (!diff._db) {
					diff._db = {};
				}
				/* generation 0 is the orig. copy, so always start the real generation at 1+ */
				diff._db.generation = this.changelog.length - 1;
				diff._db.obj = obj;

				obj._db.changesets.push(diff);
				last_changelog.add(diff);
				changeset = diff;
				changeset_empty = false;

				/* add to global changelog */
				last_changelog.add(changeset);
			} else {
				/* there were changes before */

				/* fields might have been changed back and forth with no diff at the end,
				 * in such case no changeset should be created - it would be empty otherwise */
				DB.apply_diff(changeset, diff, false);
				const diff_and_clean = (obj, org) => {
					let is_diff = false;
					for (const f in obj) {
						if (f === '_db') continue;
						if (typeof(obj[f]) === 'object') {
							if (diff_and_clean(obj[f], org ? org[f] : undefined)) {
								is_diff = true;
							} else {
								obj[f] = undefined;
							}
						} else {
							/* check if there's a difference (excluding any mix
							 * of 0s, empty strings, nulls, undefines) */
							const v = obj[f] != DB.force_null ? (obj[f] || 0) : 0;
							const prev = org && org[f] != DB.force_null ? (org[f] || 0) : 0;
							/* match (!org) as well -> there may be a value at
							 * earlier changeset different than 0 and we do want
							 * to diff it then */
							if (!org || v != prev) {
								is_diff = true;
							} else {
								obj[f] = undefined;
							}
						}
					}

					return is_diff;
				}

				changeset_empty = !diff_and_clean(changeset, obj._db.initial_gen_state);
				changeset.id = obj.id;

				if (changeset_empty) {
					last_changelog.delete(changeset);
					obj._db.changesets.pop();
				}
			}
		}

		if (diff) {
			for (const cb of this.commit_cbs) {
				cb(obj, diff, obj._db.latest_state);
			}
			if (obj._db.commit_cb) {
				obj._db.commit_cb(obj, diff, obj._db.latest_state);
				obj._db.commit_cb = null;
			}
		}

		if ((!diff || changeset_empty) && obj._db.changesets.length == 1) {
			/* no changes and no history, just delete the original copy */
			obj._db.latest_state = undefined;
			obj._db.initial_gen_state = undefined;
			obj._db.changesets = undefined;
		} else if (diff) {
			DB.apply_diff(obj._db.latest_state, diff, true);
		}

		return diff || {};
	}

	clone(obj, commit_cb) {
		const copy = this._new(obj._db.type, obj, commit_cb, false);
		const id = copy.id;

		DB.copy_obj_data(copy, obj);
		copy.id = id;
		this.commit(copy);

		return copy;
	}

	_new(type, base, commit_cb, do_commit = true) {
		const obj = {};

		obj._db = { type, is_allocated: true, commit_cb: commit_cb };
		obj.id = 0;
		const id = this.new_id_start + this.new_id_offset;
		this.new_id_offset++;
		this[obj._db.type][id] = obj;

		DB.init_obj_data(obj, base);
		obj.id = id;
		const typeinfo = this.type_info[obj._db.type];
		if (typeinfo.obj_init_cb) {
			typeinfo.obj_init_cb(obj);
		}
		obj.id = 0;

		/* create a dummy change to have this object stored in changelog.
		 * Otherwise it could be lost if there are no changes to it - even
		 * if it's referenced somewhere */
		this.open(obj);
		obj.id = id;
		obj._allocated = true;

		if (do_commit) {
			this.commit(obj);
		}
		return obj;
	}

	/* Create a new object with a specific ID */
	new_by_id(type, id) {
		const obj = {};

		if (this[type][id]) {
			throw new Error(`Can't create a new object. ID already occupied! (${type})`);
		}

		obj._db = { type, is_allocated: true };
		obj.id = id;

		if (obj.id >= this.new_id_start + this.new_id_offset) {
			this.new_id_offset = obj.id - this.new_id_start + 1;
		}

		this[obj._db.type][obj.id] = obj;

		const base = this[type].values().next().value;
		DB.init_obj_data(obj, base);
		obj.id = id;

		const typeinfo = this.type_info[obj._db.type];
		if (typeinfo.obj_init_cb) {
			typeinfo.obj_init_cb(obj);
		}

		/* create a dummy change to have this object stored in changelog */
		this.open(obj);
		obj._allocated = true;
		this.commit(obj);
		return obj;
	}

	/**
	 * Create a new object of given type. The object won't have any id
	 * assigned so far (it will be visible as 0) - it will be assigned
	 * after any changes are committed. That's when commit_cb will be
	 * called. The parameters are same as in register_commit_cb().
	 * commit_cb is entirely optional.
	 */
	new(type, commit_cb) {
		const arr = this[type];
		if (!arr) throw new Error(`Unknown db type (${type})`);

		const base = arr.values().next().value;
		return this._new(type, base, commit_cb);
	}

	rebase(obj, base) {
		obj._db.base = base ? base.id : 0;

		Object.setPrototypeOf(obj, base || {});
		if (base) {
			/* TODO detach previous base */
			DB.inherit_obj(obj, base);
		} else {
			/* TODO pull base into obj */
		}
	}

	is_obj_equal(obj, org) {
		for (const f in obj) {
			if (obj[f] === obj._db) continue;
			if (typeof(org[f]) === 'object') {
				if (!this.is_obj_equal(org[f], obj[f])) return false;
			}
			if (obj[f] !== org[f]) return false;
		}

		return true;
	}

	/* dump changesets from the latest generation to JSON -> array of changesets */
	dump_last(dump_start_gen, { spacing = 1, incomplete_arr = 0, custom_fn } = {}) {
		let ret = '';

		if (!incomplete_arr) {
			ret += '[';
		}

		if (dump_start_gen === undefined) {
			dump_start_gen = this.changelog.length - 1;
		}

		for (let i = dump_start_gen; i < this.changelog.length; i++) {
			ret += DB.dump(this.changelog[i], spacing, custom_fn);
			if (i != this.changelog.length - 1) {
				ret += ',';
			}
		}

		if (!incomplete_arr) {
			ret += ']';
		}
		return ret;
	}

	/* initiate a new chapter in changelog */
	new_generation() {
		const last_changelog = this.changelog[this.changelog.length - 1];
		for (const change of last_changelog) {
			const obj = change._db.obj;
			/* close the object, a new state will be generated on open() */
			obj._db.latest_state = null;
			obj._db.initial_gen_state = null;
		}

		this.changelog.push(new Set());
	}

	load_one(change) {
		let org = this[change._db.type][change.id];
		if (!org) {
			org = this.new_by_id(change._db.type, change.id);
		}

		const prev_change_id = change.id;
		change.id = org.id;

		this.open(org);
		DB.apply_diff(org, change, false);
		this.commit(org);

		change.id = prev_change_id;

		/* call the init_cb again */
		let type = this.type_info[change._db.type];
		if (type.obj_init_cb) {
			type.obj_init_cb(org);
		}
	}

	/**
	* Load the specified list of changes. All objects will be immediately
	* committed to set their modified state.
	*/
	load(changesets, { join_changesets } = {}) {
		if (!Array.isArray(changesets)) {
			return this.load_one(changesets);
		}

		for (const changeset of changesets) {
			if (!changeset) continue;
			if (!Array.isArray(changeset)) {
				this.load_one(changeset);
				continue;
			}

			for (const change of changeset) {
				if (!change) continue;
				this.load_one(change);
			}

			if (!join_changesets && changeset != changesets[changesets.length - 1]) {
				this.new_generation();
			}
		}
	}

	static serialize_id(id) {
		const p = id < 0x80000000 ? 0 : Math.floor((id - 0x80000000) / 0x100000);
		const i = id % 0x100000;

		return '#' + p + ':' + i;
	}

	static parse_id(id) {
		const id_parts = id.split(':');
		let ret;

		if (id_parts.length == 1) {
			ret = parseInt(id_parts[0]);
		} else {
			const pid = parseInt(id_parts[0].charAt(0) == '#' ? id_parts[0].substring(1) : id_parts[0]);
			const off = parseInt(id_parts[1]);
			ret = (pid > 0 ? 0x80000000 : 0) + 0x100000 * pid + off;
		}

		return ret;
	}

	static apply_diff(obj, diff, do_delete = true) {
		const has_numeric_keys = (obj) => {
			for (const f in obj) {
				if (isNaN(f)) {
					return false;
				}
			}

			return true;
		}

		let deleted = false;
		for (const f in diff) {
			if (f === '_db') continue;
			if (typeof(diff[f]) === 'object' || diff[f] === DB.force_null) {
				if (diff[f] === DB.force_null) {
					if (do_delete) {
						delete obj[f];
					} else {
						obj[f] = diff[f];
					}
					deleted = true;
					continue;
				} else if (diff[f] == null) {
					if (do_delete) {
						delete obj[f];
					} else {
						obj[f] = undefined;
					}
					deleted = true;
					continue;
				} else if ((!obj.hasOwnProperty(f) || !obj[f] || obj[f] === DB.force_null)) {
					/* diff is always an object, so can't use Array.isArray() */
					obj[f] = has_numeric_keys(diff[f]) ? [] : {};
				}

				DB.apply_diff(obj[f], diff[f], do_delete);
			} else {
				obj[f] = diff[f];

			}
		}

		if (deleted && Array.isArray(obj)) {
			/* deleting from array leaves out an "empty" entry, clean it up */
			while (obj.length && obj[obj.length - 1] === undefined) {
				obj.length--;
			}
		}
	}

	static copy_obj_data(obj, org) {
		for (const f in org) {
			if (!(f in org)) continue;
			if (f === '_db') continue;
			if (typeof(org[f]) === 'object') {
				if (typeof (obj[f]) !== 'object') {
					obj[f] = Array.isArray(org[f]) ? [] : {};
				}
				DB.copy_obj_data(obj[f], org[f]);
			} else {
				obj[f] = org[f];
			}
		}
	}

	static clone_obj(obj) {
		let copy = {};
		DB.copy_obj_data(copy, obj);
		return copy;
	}

	static proxy_array(src) {
		const dst = [];
		return new Proxy(src, {
			set(src, k, v) {
				dst[k] = v;
				return true;
			},
			get(src, k) {
				if (k == "setvalues") {
					return dst;
				}

				const int_k = parseInt(k);
				if (Number.isInteger(int_k) && dst[k] !== undefined) {
					return dst[k];
				}

				return src[k];
			}
		});
	}

	static inherit_obj(obj, base) {
		for (const f in base) {
			if (f === '_db') continue;
			if (typeof(base[f]) !== 'object') continue;
			if (Array.isArray(base[f])) {
				const prev = obj[f];
				obj[f] = DB.proxy_array(base[f]);
				/* copy previous overriden values, if any */
				if (prev && prev.setvalues) {
					const dst = prev.setvalues;
					for (const f in dst.length) {
						if (dst[f] != prev[f]) {
							obj[f] = dst[f];
						}
					}
				}
			} else {
				if (!obj[f]) obj[f] = {};
				obj[f] = Object.setPrototypeOf(obj[f], base[f]);
			}
			DB.inherit_obj(obj[f], base[f]);
		}
	}

	static init_obj_data(obj, base) {
		for (const f in base) {
			if (f === '_db') continue;
			if (typeof(base[f]) === 'object') {
				obj[f] = Array.isArray(base[f]) ? [] : {};
				DB.init_obj_data(obj[f], base[f]);
			} else {
				if (typeof(base[f]) == 'string') {
					obj[f] = '';
				} else {
					obj[f] = 0;
				}
			}
		}
	}

	static cmp(a, b) {
		if (typeof(a) !== 'object' || typeof(b) !== 'object') {
			a = a || 0;
			b = b || 0;
			return a != b ? 1 : 0;
		}

		return DB.is_obj_diff(a, b);
	}

	static is_obj_nonempty(obj) {
		for (const f in obj) {
			if (typeof(obj[f]) === 'object') {
				if (DB.is_obj_nonempty(obj[f])) {
					return true;
				}
				continue;
			}

			if (obj[f]) {
				return true;
			}
		}

		return false;
	}

	static is_obj_diff(obj, org) {
		for (const f in obj) {
			if (f === '_db') continue;
			if (typeof(obj[f]) === 'object') {
				if (typeof(org) !== 'object' || DB.is_obj_diff(obj[f], org[f])) {
					return true;
				}
			} else {
				/* check if there's a difference (excluding any mix of 0s, empty strings, nulls, undefines) */
				const v = obj[f] != DB.force_null ? (obj[f] || 0) : 0;
				const prev = org && org[f] != DB.force_null ? (org[f] || 0) : 0;
				if (v != prev) {
					return true;
				}
			}
		}

		if (Array.isArray(obj) && Array.isArray(org) && obj.length < org.length) {
			return true;
		}
		return false;
	}

	static get_obj_diff(obj, prev) {
		const diff = {};

		for (const f in obj) {
			if (!obj.hasOwnProperty(f)) continue;

			if (f === '_db') {
				if ((!!obj._db.base && (!prev || !prev._db || !prev._db.base || prev._db.base != obj._db.base)) || (!obj._db.base && !!prev && !!prev._db && !!prev._db.base)) {
					diff[f] = { base: obj._db.base };
				} else if (diff[f]) {
					diff[f] = undefined;
				}
			} else if (typeof(obj[f]) === 'object') {
				const nested_diff = DB.get_obj_diff(obj[f], prev ? prev[f] : undefined);
				/* we want to avoid iterable undefined fields in diff[f],
				 * set it only if needed */
				if (nested_diff || diff[f]) {
					diff[f] = nested_diff;
				}
			} else {
				/* check if there's a difference (excluding any mix of 0s, empty strings, nulls, undefines) */
				const v = obj[f] != DB.force_null ? (obj[f] || 0) : 0;
				const p = prev && prev[f] != DB.force_null ? (prev[f] || 0) : 0;
				if (v != p) {
					if (obj[f] == null || obj[f] == undefined) {
						diff[f] = DB.force_null;
					} else {
						diff[f] = obj[f];
					}
				} else if (diff[f]) {
					/* delete is super slow, just set to undefined */
					diff[f] = undefined;
				}
			}
		}

		if (Array.isArray(obj) && Array.isArray(prev) && obj.length < prev.length) {
			/* include removed array entries */
			for (let i = obj.length; i < prev.length; i++) {
				diff[i] = DB.force_null;
			}
		}

		/* just check if it has any fields, return null otherwise */
		for (const field in diff) {
			return diff;
		}
		return undefined;
	}

	static dump(data, spacing = 1, custom_fn) {
		let force_array = true;
		return JSON.stringify(data, function(k, v) {
			if (custom_fn) {
				const ret = custom_fn(k, v);
				if (ret !== undefined) {
					return ret;
				}
			}
			/* keep the _db at its minimum */
			if (k === '_db') return { type: v.obj ? v.obj._db.type : v.type };
			if (k[0] === '_' && k !== '_removed' && k !== '_allocated') {
				return undefined;
			}
			/* dont include any nulls, undefined results in no output at all */
			if (v === null) return undefined;
			if (v === DB.force_null) return null;
			/* stringify javascript sets */
			if (typeof v === 'object' && v instanceof Set) {
				force_array = false;
				return [...v];
			}
			if (typeof v === 'object') {
				if (Array.isArray(v)) {
					if (force_array) {
						force_array = false;
						return v;
					}

					/* convert to "associative array" e.g. when it was set explicitly in an obj */
					const o = {};
					for (const k in v) {
						o[k] = v[k];
					}
					return o;
				}
			}
			return v;
		}, spacing);
	}
}

if (typeof window === 'undefined') {
	module.exports = DB;
}
