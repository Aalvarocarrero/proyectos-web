import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../lib/farm-record-search.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const exports={};new Function('exports',js)(exports);
const record={farmId:'private',recordType:'inventory',title:'Maíz de siembra',category:'Semillas',data:{quantity:4,minimum:5,location:'Depósito norte'}};
test('search ignores accents and case, matches words across visible fields, never mutates data',()=>{
 const original=JSON.stringify(record);
 assert.equal(exports.farmRecordMatches(record,' MAIZ  deposito '),true);
 assert.equal(exports.farmRecordMatches(record,'semillas norte'),true);
 assert.equal(exports.farmRecordMatches(record,'maíz sur'),false);
 assert.equal(exports.farmRecordMatches(record,'   '),true);
 assert.equal(exports.farmRecordMatches(record,'private'),false);
 assert.equal(JSON.stringify(record),original);
});
test('animal search finds arete, species and breed; production finds objective',()=>{
 assert.equal(exports.farmRecordMatches({...record,data:{tag:'LM-001',species:'Bovino',breed:'Carora'}},'lm-001 carora'),true);
 assert.equal(exports.farmRecordMatches({...record,data:{objective:'Mejorar reproducción'}},'reproduccion'),true);
});
test('minimum filter includes zero and threshold, ignores absent or invalid values',()=>{
 for(const quantity of [0,4,5])assert.equal(exports.inventoryAtMinimum({...record,data:{quantity,minimum:5}}),true);
 for(const data of [{quantity:6,minimum:5},{quantity:0,minimum:0},{quantity:-1,minimum:5},{quantity:NaN,minimum:5},{quantity:1,minimum:Infinity},{quantity:1},{quantity:'1',minimum:5}])assert.equal(exports.inventoryAtMinimum({...record,data}),false);
});
test('management lists show all categories by default and preserve empty-category records',()=>{
 const dashboard=readFileSync(new URL('../components/farm-dashboard.tsx',import.meta.url),'utf8');
 assert.equal((dashboard.match(/useState<string \| null>\(null\)/g)||[]).length>=2,true);
 assert.match(dashboard,/selectedCategory === null \|\| record.payload.category === selectedCategory/);
 assert.match(dashboard,/label \|\| "Sin categoría"/);
 assert.match(dashboard,/Quitar filtros/);
 assert.match(dashboard,/Módulo de Mi Finca/);
 assert.doesNotMatch(dashboard,/<DialogTrigger asChild><span \/><\/DialogTrigger>/);
});
