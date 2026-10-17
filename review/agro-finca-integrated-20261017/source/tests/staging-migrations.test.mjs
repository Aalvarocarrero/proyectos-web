import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';

const directory = new URL('../drizzle/',import.meta.url);
const migrations = readdirSync(directory).filter(name=>name.endsWith('.sql')).sort();
const journal = JSON.parse(readFileSync(new URL('meta/_journal.json',directory),'utf8'));
const apply = (db,names) => names.forEach(name=>db.exec(readFileSync(new URL(name,directory),'utf8')));
const tables = db => db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(row=>row.name);

test('staging migration journal contains the exact ordered 0000–0009 chain',()=>{
  assert.equal(migrations.length,10);
  assert.deepEqual(migrations,journal.entries.map(entry=>`${entry.tag}.sql`));
  migrations.forEach((name,index)=>assert.ok(name.startsWith(`${String(index).padStart(4,'0')}_`)));
});

test('all ten migrations apply to an empty local SQLite database',()=>{
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys=ON');
    apply(db,migrations);
    for (const name of ['users','farms','farm_records','companies','auth_identities','auth_sessions','auth_transactions','website_content']) assert.ok(tables(db).includes(name),name);
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
    assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  } finally {db.close();}
});

test('0008 CMS and 0009 auth are additive and preserve existing account, farm, record and ownership data',()=>{
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('PRAGMA foreign_keys=ON');
    apply(db,migrations.slice(0,8));
    db.exec("INSERT INTO users (id,email,display_name,created_at,updated_at) VALUES ('sites-owner','legacy@example.test','Synthetic legacy user','before','before')");
    db.exec("INSERT INTO farms (id,owner_id,name,client_updated_at,server_updated_at) VALUES ('legacy-farm','sites-owner','Synthetic legacy farm','before','before')");
    db.exec("INSERT INTO farm_records (id,owner_id,farm_id,record_type,title,data_json,client_updated_at,server_updated_at) VALUES ('legacy-record','sites-owner','legacy-farm','note','Synthetic legacy note','{\"original\":true}','before','before')");
    const originalTables = tables(db);
    const before = new Map(originalTables.map(name=>[name,db.prepare(`SELECT * FROM "${name}"`).all()]));
    apply(db,migrations.slice(8));
    assert.deepEqual(tables(db).filter(name=>!originalTables.includes(name)),['auth_identities','auth_sessions','auth_transactions','website_content']);
    for (const [name,rows] of before) assert.deepEqual(db.prepare(`SELECT * FROM "${name}"`).all(),rows,name);
    assert.equal(db.prepare('SELECT count(*) AS n FROM auth_identities').get().n,0);
    assert.equal(db.prepare('SELECT count(*) AS n FROM auth_sessions').get().n,0);
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
  } finally {db.close();}
});


test('CMS 0008 and combined 0009 snapshots form an exact additive chain',()=>{
  const cms=JSON.parse(readFileSync(new URL('meta/0008_snapshot.json',directory),'utf8'));
  const combined=JSON.parse(readFileSync(new URL('meta/0009_snapshot.json',directory),'utf8'));
  assert.equal(combined.prevId,cms.id);
  for(const [key,table] of Object.entries(cms.tables)) assert.deepEqual(combined.tables[key],table,key);
  assert.deepEqual(Object.keys(combined.tables).filter(key=>!cms.tables[key]).sort(),['auth_identities','auth_sessions','auth_transactions']);
});

test('auth 0009 preserves existing v127 CMS drafts and published snapshots',()=>{
 const db=new DatabaseSync(':memory:');
 try {
  apply(db,migrations.slice(0,9));
  db.exec("INSERT INTO website_content VALUES ('home','{}','{}','original-revision','before','before')");
  const before=db.prepare('SELECT * FROM website_content').all();
  apply(db,migrations.slice(9));
  assert.deepEqual(db.prepare('SELECT * FROM website_content').all(),before);
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
 }finally{db.close();}
});


test('legacy v125-auth schema can add CMS without replaying auth or altering records (schema-only rehearsal)',()=>{
 const db=new DatabaseSync(':memory:');
 try {
  db.exec('PRAGMA foreign_keys=ON');
  apply(db,migrations.slice(0,8));
  // This is the unchanged SQL of historical 0008 auth, now numbered 0009.
  // It is NOT an instruction to modify any remote migration ledger.
  apply(db,[migrations[9]]);
  db.exec("INSERT INTO users (id,email,display_name,created_at,updated_at) VALUES ('legacy-google','synthetic@example.test','Synthetic Google user','before','before')");
  db.exec("INSERT INTO auth_identities VALUES ('google','synthetic-subject','legacy-google','before')");
  db.exec("INSERT INTO auth_sessions VALUES ('synthetic-token-hash','legacy-google',1,2,3)");
  const originalTables=tables(db);
  const before=new Map(originalTables.map(name=>[name,db.prepare('SELECT * FROM "'+name+'"').all()]));
  apply(db,[migrations[8]]);
  for(const [name,rows] of before)assert.deepEqual(db.prepare('SELECT * FROM "'+name+'"').all(),rows,name);
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
 } finally {db.close();}
});
