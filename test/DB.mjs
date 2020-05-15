import DB from '../script/DB.mjs'
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
	stopExecution();
}

const db = new DB();
db.new_id_start = 42;

db.register_type("items", [{ id: 4096, field: "value", field2: "another" }]);
let obj = db.items[4096];
assert(obj);
assert(obj.id == 4096);
assert(obj.field == "value");
assert(!db.items[4095]);

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
	/* no changes, so only the object commit cb is called */
	assert(called == 1);
	assert(obj.id == 0);
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 1);

	db.unregister_commit_cb(cb);

	called = 0;
	cb = obj_commit_cb = db.register_commit_cb((obj, diff, prev) => {
		called++;
		assert(obj.id == 84);
		assert(prev.id == 0);
		assert(diff.field == "new_value");
		assert(prev.field == "");
		assert(!diff.field2);
	});

	db.new_id_start = 84;
	assert(db.new_id_offset == 0);
	db.open(obj);
	obj.field = "new_value";
	assert(db.new_id_offset == 0);
	db.commit(obj);
	assert(db.new_id_offset == 1);
	assert(db.changelog.length == 2);
	assert(db.changelog[1].size == 2);

	db.unregister_commit_cb(cb);
}

console.log('DB tests passed');
if (typeof window !== 'undefined') {
	window._testDBPass = g_pass;
}
