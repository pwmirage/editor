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

db.register_type("items", [{ id: 4096, field: "value", field2: "another" }]);
const obj = db.items[4096];
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

db.unregister_commit_cb(cb);

db.open(obj);
obj.field = "value2";
db.commit(obj);

assert(obj._db.changesets[0].field == "value");
assert(obj._db.changesets[1].field == "value2");
assert(!obj._db.changesets[2]);

db.new_generation();

db.open(obj);
obj.field = "value3";
db.commit(obj);

assert(obj._db.changesets[0].field == "value");
assert(obj._db.changesets[1].field == "value2");
assert(obj._db.changesets[2].field == "value3");

console.log('DB tests passed');
if (typeof window !== 'undefined') {
	window._testDBPass = g_pass;
}
