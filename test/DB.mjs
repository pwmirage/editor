import DB from '../script/DB.mjs'

const assert = console.assert;

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
