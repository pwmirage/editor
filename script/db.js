/* SPDX-License-Identifier: MIT
 * Copyright(c) 2019-2020 Darek Stojaczyk for pwmirage.com
 */

function init_obj_data(obj, base) {
	for (const f in base) {
		if (f === '_db') continue;
		if (typeof(base[f]) === 'object') {
			obj[f] = Array.isArray(base[f]) ? [] : {};
			init_obj_data(obj[f], base[f]);
		} else {
			if (typeof(base[f]) == 'string') {
				obj[f] = '';
			} else {
				obj[f] = 0;
			}
		}
	}
}

function get_obj_diff(obj, prev) {
	const diff = {};

	for (const f in obj) {
		if (!obj.hasOwnProperty(f)) continue;
		if (f === '_db') {
			if (obj._db?.base != prev._db?.base) {
				diff[f] = { base: obj._db.base };
			} else if (diff[f]) {
				diff[f] = undefined;
			}
		} else if (typeof(prev[f]) === 'object') {
			const nested_diff = get_obj_diff(obj[f], prev[f]);
			/* we want to avoid iterable undefined fields in diff[f],
			 * set it only if needed */
			if (nested_diff || diff[f]) {
				diff[f] = nested_diff;
			}
		} else {
			/* check if there's a difference (excluding any mix of 0s, empty strings, nulls, undefines) */
			if ((!obj[f] && !!obj[f] != !!prev[f]) || (obj[f] != prev[f])) {
				diff[f] = obj[f];
			} else if (diff[f]) {
				/* delete is super slow, just set to undefined */
				diff[f] = undefined;
			}
		}
	}

	/* just check if it has any fields, return null otherwise */
	for (const field in diff) {
		return diff;
	}
	return undefined;
}

/* Use diffB as a mask for diffA -> set undefined where diffA is set, but diffB is not */
const join_diff = (diffA, diffB) => {
	const diff = {};
	let is_empty = true;
	for (const f in diffA) {
		if (!diffA[f] || !diffB[f]) {
			diff[f] = undefined;
		} else if (typeof(diffA[f]) === 'object') {
			diff[f] = join_diff(diffA[f], diffB[f]);
			if (diff[f]) {
				is_empty = false;
			}
		} else {
			diff[f] = diffA[f];
			is_empty = false;
		}

	}

	return is_empty ? undefined : diff;
};

function is_empty(obj) {
	for (const f in obj) {
		const v = obj[f];
		if (v == 0 || v == '' || f == '_db') continue;
		if (typeof(v) === 'object') {
			return is_empty(v);
		}
		return false;
	}

	return true;
}

function dump(data, spacing = 1, custom_fn) {
	return JSON.stringify(data, function(k, v) {
		if (custom_fn) {
			const ret = custom_fn(k, v);
			if (ret !== undefined) {
				return ret;
			}
		}
		/* keep the _db at its minimum */
		if (k === '_db') return { type: v.obj._db.type };
		/* dont include any nulls, undefined results in no output at all */
		if (v === null) return undefined;
		/* stringify javascript sets */
		if (typeof v === 'object' && v instanceof Set) {
			return [...v];
		}
		if (typeof v === 'object' && !Array.isArray(v)) {
			if (is_empty(v)) return undefined;
		}
		return v;
	}, spacing);
}

class DB {
	constructor() {
		/* assoc array:
		 *  array name => array metadata
		 */
		this.type_info = {};

		/* 2d array of changesets. First level is the changeset generation, second level is just
		 * a collection. This is stored specifically for dumping the changes to JSON easily. */
		this.changelog = [
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
		if (!objects) objects = [{ id: 0 }];

		if (this[name]) throw new Error(`Trying to use reserved type name (${name})`);
		const type = this.type_info[name] = {};
		type.obj_init_cb = obj_init_cb;

		const obj_map = new Map();
		const static_map = objects;
		const db = this;
		this[name] = new Proxy(obj_map, {
			set(map, k, v) {
				if (v === undefined) {
					map.delete(k);
				} else {
					map.set(k, v);
				}
				return true;
			},
			get(map, k) {
				if (k === 'filter') {
					return function(fn) {
						let ret = [];
						for (const obj of map.values()) {
							if (fn(obj)) ret.push(obj);
						}
						return ret;
					}
				}
				if (k === 'size') return map.size;
				if (k === Symbol.iterator) {
					return function *() {
						for (const obj of map.values()) yield obj;
					}
				}
				if (typeof map[k] === 'function') {
					return (...args) => Reflect.apply(map[k], map, args);
				}

				if (k === 'init') {
					return () => {
						for (const obj of static_map) {
							/* trigger lazy initialization */
							const o = db[name][obj.id];
						}
					};
				}

				let obj = map.get(k);
				if (obj) {
					return obj;
				}

				obj = static_map[k];
				if (!obj) {
					return undefined;
				}

				const clone = DB.clone_obj(obj);
				db.init(name, clone);
				map.set(k, clone);
				return clone;
			}
		});
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
		if (!this[type]) throw new Error(`Unknown db type (${type})`);

		obj._db = {};
		obj._db.type = type;

		const type_info = this.type_info[type];
		if (!type_info) throw new Error(`Invalid db type (${type})`);
		if (type_info.obj_init_cb) {
			return type_info.obj_init_cb(obj);
		}
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

		obj._db.latest_state = DB.clone_obj(obj);

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
		console.assert(obj._db.latest_state);
		console.assert(obj._db.changesets);

		const last_changelog = this.changelog[this.changelog.length - 1];
		let changeset = obj._db.changesets[obj._db.changesets.length - 1];

		/* gather modified fields */
		const diff = get_obj_diff(obj, obj._db.latest_state);
		let changeset_diff = null;

		if (diff) {
			/* lazy initialization */
			if (changeset._db.generation < this.changelog.length) {
				/* first change since new generation */

				/* promote diff object to a changeset */
				diff.id = obj.id;
				if (!diff._db) {
					diff._db = {};
				}
				/* generation 0 is the orig. copy, so always start the real generation at 1+ */
				diff._db.generation = this.changelog.length;
				diff._db.obj = obj;

				obj._db.changesets.push(diff);
				last_changelog.add(diff);
				changeset = changeset_diff = diff;

				/* if this a newly allocated object it will be now appended to the array */
				if (obj._db.is_allocated && obj.id == 0) {
					obj.id = this.new_id_start + this.new_id_offset;
					this.new_id_offset++;
					diff.id = obj.id;
					this[obj._db.type][obj.id] = obj;
				}
			} else {
				/* there were changes before */

				/* fields might have been changed back and forth with no diff at the end,
				 * in such case no changeset should be created - it would be empty otherwise */
				const prev_state = obj._db.changesets[obj._db.changesets.length - 2];
				const changeset_diff_abs = get_obj_diff(diff, prev_state) || {};
				/* strip diff from fields with val == prev changeset */
				changeset_diff = join_diff(diff, changeset_diff_abs);
				if (changeset_diff) {
					DB.apply_diff(changeset, changeset_diff);
				} else {
					last_changelog.delete(changeset);
					obj._db.changesets.pop();
				}
			}

			if (changeset_diff) {
				/* add to global changelog, duplicates will be ignored */
				last_changelog.add(changeset);
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

		if (!diff || !changeset_diff) {
			if (obj._db.changesets.length == 1) {
				/* no changes and no history, just delete the original copy */
				obj._db.latest_state = undefined;
				obj._db.changesets = undefined;
			}
		} else {
			DB.apply_diff(obj._db.latest_state, diff);
		}

		return diff;
	}

	clone(obj, commit_cb) {
		let copy = {};
		DB.copy_obj_data(copy, obj);
		copy.id = 0;
		copy._db = { type: obj._db.type, is_allocated: true, commit_cb: commit_cb };
		return copy;
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

		const obj = { id: 0 }
		this.init(type, obj);
		obj._db.is_allocated = true;
		obj._db.commit_cb = commit_cb;
		return obj;
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
	dump_last(spacing = 1, custom_fn) {
		return dump(this.changelog[this.changelog.length - 1], spacing, custom_fn);
	}

	/* dump all changesets to JSON as 2d array */
	dump_all() {
		return dump(this.changelog);
	}

	/* initiate a new chapter in changelog */
	new_generation() {
		const last_changelog = this.changelog[this.changelog.length - 1];
		for (const change of last_changelog) {
			const obj = change._db.obj;
			/* close the object, a new state will be generated on open() */
			obj._db.latest_state = null;
		}

		this.changelog.push(new Set());
	}

	/**
	* Load the specified list of changes. All objects will be immediately
	* committed to set their modified state.
	*/
	load(changesets, { join_changesets } = {}) {
		const load_change = (change) => {
			let org = this[change._db.type][change.id];
			if (!org) {
				org = this.new(change._db.type);
				this.new_id_offset++;
			}

			this.open(org);
			DB.copy_obj_data(org, change);
			if (org.id !== undefined) {
				/* we've copied the id over, now it's time to fill the db entry */
				this[org._db.type][org.id] = org;
			}
			this.commit(org);

			/* call the init_cb again */
			let type = this.type_info[change._db.type];
			if (type.obj_init_cb) {
				type.obj_init_cb(org);
			}
		}

		if (!Array.isArray(changesets)) {
			return load_change(changesets);
		}

		for (const changeset of changesets) {
			if (!changeset) continue;
			if (!Array.isArray(changeset)) {
				load_change(changeset);
				continue;
			}

			for (const change of changeset) {
				if (!change) continue;
				load_change(change);

			}

			if (!join_changesets && changeset != changesets[changesets.length - 1]) {
				this.new_generation();
			}
		}
	}

	static apply_diff(obj, diff) {
		const has_numeric_keys = (obj) => {
			for (const f in obj) {
				if (isNaN(f)) {
					return false;
				}
			}

			return true;
		}

		for (const f in diff) {
			if (f === '_db') continue;
			if (typeof(diff[f]) === 'object') {
				if (!obj.hasOwnProperty(f)) {
					/* diff is always an object, so can't use Array.isArray() */
					obj[f] = has_numeric_keys(diff[f]) ? [] : {};
				}
				DB.copy_obj_data(obj[f], diff[f]);
			} else {
				obj[f] = diff[f];
			}
		}
	}

	static copy_obj_data(obj, org) {
		for (const f in org) {
			if (!(f in org)) continue;
			if (f === '_db') continue;
			if (typeof(org[f]) === 'object') {
				if (!(f in obj)) {
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

}

if (typeof window === 'undefined') {
	module.exports = DB;
}
