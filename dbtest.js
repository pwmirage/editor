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
	console.error('Assertion Failed\n' + lines.join('\n'));

	debugger;
	if (typeof process !== 'undefined') process.exit();
	if (typeof stopExecution !== 'undefined') stopExecution();
}


window._testDBPass = {};
const finish_test = (name) => {
	window._testDBPass[name] = g_pass;
	g_pass = true;
};

const init_id_arr = (arr) => {
	const id_arr = [];
	for (const obj of arr) {
		id_arr[obj.id] = obj;
	}
	return id_arr;
}

const db = new DB();
db.new_id_start = 42;

db.register_type("items", init_id_arr([{ id: 4096, field: "value", field2: "another" }]));
let obj = db.items[4096];
assert(obj);
assert(obj.id == 4096);
assert(obj.field == "value");
assert(!db.items[4095]);

finish_test('register_type');

let called = false;
const cb = db.register_commit_cb((obj, diff, prev) => {
	called = true;
	assert(obj.field == "new_value");
	assert(diff.field == "new_value");
	assert(prev.field == "value");
	assert(!diff.field2);
});

db.open(obj);
obj.field = "new_value";
db.commit(obj);
assert(called);
assert(obj.field == "new_value");
assert(obj._db.changesets[0].field == "value");
assert(obj._db.changesets[1].field == "new_value");
assert(db.changelog.length == 1);

db.unregister_commit_cb(cb);

db.open(obj);
obj.field = "value2";
db.commit(obj);

assert(obj._db.changesets[0].field == "value");
assert(obj._db.changesets[1].field == "value2");
assert(!obj._db.changesets[2]);
assert(db.changelog.length == 1);

db.new_generation();
assert(db.changelog.length == 2);

db.open(obj);
obj.field = "value3";
db.commit(obj);

assert(obj._db.changesets[0].field == "value");
assert(obj._db.changesets[1].field == "value2");
assert(obj._db.changesets[2].field == "value3");
assert(db.changelog.length == 2);

finish_test('basic');

/* Test creating new objects */
{
	let called = 0;
	let cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj.id == 0);
		assert(prev.id == 0);
		assert(!diff.field);
		assert(prev.field == "");
		assert(!diff.field2);
	});
	let obj_commit_cb = cb;

	const obj = db.new('items', (obj, diff, prev) => {
		obj_commit_cb(obj, diff, prev);
	});
	assert(called == 0);
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 1);

	db.open(obj);
	db.commit(obj);
	/* no changes, so the object commit cb isn't called */
	assert(called == 0);
	assert(obj.id > 0);
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 1);

	db.unregister_commit_cb(cb);

	called = 0;
	cb = obj_commit_cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj.id == 42);
		assert(prev.id == 42);
		assert(diff.field == "new_value");
		assert(!prev.field);
		assert(!diff.field2);
	});

	db.new_id_start = 84;
	assert(db.new_id_offset == 1);
	db.open(obj);
	obj.field = "new_value";
	assert(db.new_id_offset == 1);
	db.commit(obj);
	assert(db.new_id_offset == 1);
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 2);

	db.unregister_commit_cb(cb);
	finish_test('new');
}

/* Test save / load */
{
	const dump = db.dump_all();

	const db2 = new DB();
	db2.new_id_start = 7;

	db2.register_type("items", init_id_arr([{ id: 4096, field: "value", field2: "another" }]));

	const db_json = JSON.parse(dump);
	db2.load(db_json);

	assert(db2.changelog.length == 2);
	assert(db2.changelog[1].size == 2);
	assert(db2.new_id_offset == 2);
	finish_test('save/load');
}

/* Test inheritance */
{
	const db = new DB();


	db.register_type("items", init_id_arr([
		{ id: 4096, field: "value", field2: "another" },
		{ id: 4097, field: "value2", field2: "another2" }
	]));

	let obj = db.new('items', (obj, diff, prev) => {
		assert(diff.field == undefined);
		assert(diff.field2 == "yet_another");
		assert(prev.field2 == "another");
	});
	const base = db.items[4096];
	db.rebase(obj, base);
	
	assert(obj.field == "value");

	let called = 0;
	let cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj != base);
		assert(diff.field == undefined);
		assert(diff.field2 == "yet_another");
		assert(prev.field2 == "another");
	});
	db.open(obj);
	obj.field2 = "yet_another";
	db.commit(obj);
	db.unregister_commit_cb(cb);
	assert(called == 1);

	assert(obj.field == "value");
	assert(obj.field2 == "yet_another");
	assert(db.items[4096].field2 == "another");

	called = 0;
	cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj == base);
		assert(diff.field == "base_val");
		assert(prev.field == "value");
		assert(obj.field2 == "another");
		assert(diff.field2 == undefined);
	});
	db.open(base);
	base.field = "base_val";
	db.commit(base);
	db.unregister_commit_cb(cb);
	assert(called == 1);

	assert(obj.field == "base_val");
	assert(obj.field2 == "yet_another");

	finish_test('basic_inheritance');
}

/* Test nested inheritance */
{
	const db = new DB();

	db.register_type("items", init_id_arr([
		{ id: 4096, field: "value", array: [ 40, 41, 42 ] },
		{ id: 4097, field: "value2", array: [ 50, 51, 52 ] },
	]));

	let obj = db.new('items', (obj, diff, prev) => {
		assert(diff.field == undefined);
		assert(diff.array != undefined);
	});
	const base = db.items[4096];
	db.rebase(obj, base);
	
	assert(obj.field == "value");
	assert(obj.array[0] == 40);

	let called = 0;
	let cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj != base);
		assert(diff.array != undefined);
		assert(diff.array[0] == undefined);
		assert(diff.array[1] == 141);
		assert(diff.field == undefined);
	});
	db.open(obj);
	obj.array[1] = 141;
	db.commit(obj);
	db.unregister_commit_cb(cb);
	assert(called == 1);

	assert(obj.array[0] == 40);
	assert(obj.array[1] == 141);
	assert(obj.array[2] == 42);
	assert(base.array[0] == 40);
	assert(base.array[1] == 41);

	called = 0;
	cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj == base);
		assert(diff.array != undefined);
		assert(diff.array[1] == 241);
		assert(prev.array[1] == 41);
		assert(diff.array[2] == 242);
		assert(prev.array[2] == 42);
		assert(diff.array[0] == undefined);
	});
	db.open(base);
	base.array[1] = 241;
	base.array[2] = 242;
	db.commit(base);
	db.unregister_commit_cb(cb);
	assert(called == 1);

	assert(base.array[1] == 241);
	assert(base.array[2] == 242);
	assert(obj.array[0] == 40);
	assert(obj.array[1] == 141);
	assert(obj.array[2] == 242);

	called = 0;
	cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj != base);
		assert(diff.array != undefined);
		assert(diff.array[0] == 340);
		assert(prev.array[0] == 40);
		assert(diff.array[1] == 341);
		assert(prev.array[1] == 141);
		assert(diff.array[2] == undefined);
	});
	db.open(obj);
	obj.array = [];
	obj.array[0] = 340;
	obj.array[1] = 341;
	db.commit(obj);
	db.unregister_commit_cb(cb);
	assert(called == 1);

	assert(base.array[1] == 241);
	assert(base.array[2] == 242);
	assert(obj.array[0] == 340);
	assert(obj.array[1] == 341);
	assert(obj.array[2] == undefined);

	finish_test('nested_inheritance');
}

console.log('DB tests passed');
