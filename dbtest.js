if (typeof window === 'undefined') {
	global.DB = require('./script/db.js');
}
let g_pass = true;

const assert = (cond) => {
	if (cond) return;

	g_pass = false;
	const stack = (new Error()).stack.toString();
	const lines = stack.split('\n');
	/* cut the first frame (assert) from the stacktrace */
	lines.splice(0, 2);

	const msg = 'Assertion Failed\n' + lines.join('\n');

	debugger;
	if (typeof process !== 'undefined') process.exit();
	throw new Error(msg);
}

const g_testresults = [];
const testcase = (name, fn) => {
	try {
		fn();
		g_testresults[name] = 0;
	} catch (e) {
		console.error(e);
		g_testresults[name] = e;
	}
};

const init_id_arr = (arr) => {
	const id_arr = [];
	for (const obj of arr) {
		id_arr[obj.id] = obj;
	}
	return id_arr;
}

testcase('get', () => {
	const db = new DB();

	db.register_type("items", init_id_arr([{ id: 4096, field: "value", field2: "another" }]));

	/* make sure the object can be retrieved */
	const obj = db.items[4096];
	assert(obj);
	assert(obj.id == 4096);
	assert(obj.field == "value");

	/* validate no other objects are there */
	assert(!db.items[4095]);
	const count = [...db.items].length;
	assert(count == 1);
});

const new_test_db1 = () => {
	const db = new DB();
	db.register_type("items", init_id_arr([{ id: 4096, field: "value", field2: "another" }]));
	return db;
}

testcase('empty_commit', () => {
	const db = new_test_db1();
	const obj = db.items[4096];

	db.open(obj);
	db.commit(obj);

	/* verify there are no changes */
	assert(obj.field == "value");
	assert(obj.field2 == "another");
	assert(db.changelog.length == 0 || db.changelog[0].size == 0);
	assert(!obj._db.changesets || obj._db.changesets.length == 0);
});

testcase('commit', () => {
	const db = new_test_db1();
	const obj = db.items[4096];

	db.open(obj);
	obj.field = "new_value";
	db.commit(obj);

	/* there must be a single change stored */
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 1);

	/* 2 = original copy + diff */
	assert(obj._db.changesets.length == 2)

	assert(obj.field == "new_value");
	assert(obj._db.changesets[0].field == "value");
	assert(obj._db.changesets[1].field == "new_value");
	assert(!obj._db.changesets[1].field2);

	/* also make sure there's just one diff even if commit twice */
	/* (there's no db.new_generation() called, so there must be exactly
	 * 1 diff) */
	db.open(obj);
	obj.field = "new_value2";
	db.commit(obj);

	assert(obj.field == "new_value2");
	assert(obj._db.changesets.length == 2)
	assert(obj._db.changesets[0].field == "value");
	assert(obj._db.changesets[1].field == "new_value2");
	assert(!obj._db.changesets[1].field2);

	/* for completness, make sure modifying another field won't generate
	 * a separate diff either */
	db.open(obj);
	obj.field2 = "field2_value2";
	db.commit(obj);

	assert(obj.field == "new_value2");
	assert(obj._db.changesets.length == 2)
	assert(obj._db.changesets[0].field == "value");
	assert(obj._db.changesets[0].field2 == "another");
	assert(obj._db.changesets[1].field == "new_value2");
	assert(obj._db.changesets[1].field2 == "field2_value2");
});

testcase('commit_cb', () => {
	const db = new_test_db1();
	const obj = db.items[4096];

	/* commit_cb must be called at every commit */
	let called = 0;
	const cb = db.register_commit_cb((obj, diff, prev) => {
		called++;

		if (called == 1) {
			assert(obj.field == "new_value");
			assert(diff.field == "new_value");
			assert(prev.field == "value");
			assert(!diff.field2);
		} else if (called == 2) {
			assert(obj.field == "new_value2");
			assert(diff.field == "new_value2");
			assert(prev.field == "new_value");
			assert(!diff.field2);
		}
	});

	/* don't change anything, cb must not be called */
	db.open(obj);
	obj.field = "value";
	db.commit(obj);
	assert(called == 0);

	/* make changes */
	db.open(obj);
	obj.field = "new_value";
	db.commit(obj);
	assert(called == 1);

	db.open(obj);
	obj.field = "new_value2";
	db.commit(obj);
	assert(called == 2);
});

testcase('unregister_commit_cb', () => {
	const db = new_test_db1();
	const obj = db.items[4096];

	let called = 0;
	const cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
	});

	db.open(obj);
	obj.field = "new_value";
	db.commit(obj);
	assert(called == 1);

	db.unregister_commit_cb(cb);

	db.open(obj);
	obj.field = "new_value2";
	db.commit(obj);

	/* must not have been called */
	assert(called == 1);
});

testcase('commit_multiple_generations', () => {
	const db = new_test_db1();
	const obj = db.items[4096];

	db.open(obj);
	obj.field = "new_value";
	db.commit(obj);

	/* there must be a single change stored */
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 1);

	/* 2 = original copy + diff */
	assert(obj._db.changesets.length == 2)

	assert(obj.field == "new_value");
	assert(obj._db.changesets[0].field == "value");
	assert(obj._db.changesets[1].field == "new_value");
	assert(!obj._db.changesets[1].field2);

	/* bump the gen counter, then commit again -> another diff should
	 * be created */
	db.new_generation();
	db.open(obj);
	obj.field = "new_value2";
	db.commit(obj);

	assert(db.changelog.length == 3);
	assert(db.changelog[1].size == 1);
	assert(obj.field == "new_value2");

	/* the first diff should be unchanged */
	assert(obj._db.changesets[0].field == "value");
	assert(obj._db.changesets[1].field == "new_value");
	assert(!obj._db.changesets[1].field2);

	assert(obj._db.changesets[2].field == "new_value2");
	assert(!obj._db.changesets[2].field2);
});

testcase('create_obj', () => {
	const db = new_test_db1();
	db.new_id_start = 10;

	/* create an object, make sure the commit cb is called immediately on creation */
	let called = 0;
	let cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj.id == 10);
		/* it must be changed from 0, always */
		assert(prev.id == 0);
		assert(!diff.field);
		assert(!prev.field);
		assert(!diff.field2);
	});

	assert(db.new_id_offset == 0);

	const obj = db.new('items', (obj, diff, prev) => {
		cb(obj, diff, prev);
	});

	assert(db.new_id_offset == 1);
	assert(called == 2);
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 1);

	db.open(obj);
	db.commit(obj);
	assert(called == 2);
	assert(obj.id > 0);
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 1);

	db.unregister_commit_cb(cb);

	called = 0;
	cb = obj_commit_cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj.id == 10);
		assert(!diff.id);
		assert(diff.field == "new_value");
		assert(!prev.field);
		assert(!diff.field2);
	});

	assert(db.new_id_offset == 1);
	db.new_id_start = 84;
	db.open(obj);
	obj.field = "new_value";
	assert(db.new_id_offset == 1);
	db.commit(obj);
	assert(db.new_id_offset == 1);
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 1);
});

testcase('clone_obj', () => {
	const db = new_test_db1();
	const obj = db.items[4096];
	db.new_id_start = 10;

	/* create an object, make sure the commit cb is called immediately on creation */
	let called = 0;
	let cb = db.register_commit_cb((obj, diff, prev) => {
		called++;

		if (called == 1) {
			assert(obj.id == 10);
		} else if (called == 1) {
			assert(obj.id == 11);
		}
	});

	assert(db.new_id_offset == 0);
	const clone1 = db.clone(obj);
	assert(clone1.id == 10);
	assert(db.new_id_offset == 1);
	assert(called == 1);

	const clone2 = db.clone(obj);
	assert(clone2.id == 11);
	assert(db.new_id_offset == 2);
	assert(called == 2);
});

testcase('arr_cleanup', () => {
	const db = new_test_db1();
	const obj = db.items[4096];
	db.new_id_start = 10;
	let diff;

	db.open(obj);
	obj.arr = [ 1, 2, 3 ];
	diff = db.commit(obj);

	assert(JSON.stringify(diff.arr) === '{"0":1,"1":2,"2":3}');

	db.open(obj);
	obj.arr = [ 3 ];
	diff = db.commit(obj);

	const dump = db.dump_last();
	const db2 = new_test_db1();
	db2.load(JSON.parse(dump));

	const obj_loaded = db2.items[4096];
	assert(obj_loaded.arr.length == 1);
	assert(obj_loaded.arr[0] == 3);
});

console.log('DB tests passed');
