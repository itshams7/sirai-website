/* Independent deterministic arithmetic checks, no DOM or external packages. */
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={};vm.runInNewContext(readFileSync(new URL('../assets/sirai-math.js',import.meta.url),'utf8'),context);
const m=context.SIRAI_MATH;
const near=(actual,expected,epsilon=1e-9)=>assert.ok(Math.abs(actual-expected)<epsilon,'Expected '+expected+', got '+actual);
assert.equal(m.waterDemand(24,35),840);
assert.equal(m.waterDemand(1,1),1);
assert.equal(m.waterDemand(5000,1000),5000000);
assert.throws(()=>m.waterDemand(0,40));assert.throws(()=>m.waterDemand(12,-5));
for(const [h,w] of [[24,3],[25,3],[1,1],[5000,12]]){
 const rows=m.waterGroups(h,w,35);assert.equal(rows.length,w);assert.equal(rows.reduce((sum,g)=>sum+g.count,0),h);assert.equal(rows.reduce((sum,g)=>sum+g.litres,0),h*35);assert.ok(Math.max(...rows.map(g=>g.count))-Math.min(...rows.map(g=>g.count))<=1);
}
assert.throws(()=>m.waterGroups(3,4,40));
const b=m.projectBudget([{qty:10,unit:1500},{qty:2,unit:2500}],10,5000);
near(b.subtotal,20000);near(b.reserve,2000);near(b.total,22000);near(b.gap,17000);
near(m.projectBudget([],0,0).total,0);near(m.projectBudget([{qty:1,unit:100}],0,200).gap,0);
assert.throws(()=>m.projectBudget([{qty:-1,unit:100}],10,0));assert.throws(()=>m.projectBudget([],60,0));
const result=m.energyReport([{watts:9,qty:3,hours:5,essential:true},{watts:55,qty:1,hours:8,essential:true},{watts:10,qty:2,hours:2,essential:false}],{battery:2400,dod:50,eff:80,outage:6,psh:4.5,pr:70});
near(result.daily,615);near(result.connected,102);near(result.essentialW,82);near(result.essentialDaily,575);near(result.usable,960);near(result.runtime,960/82);near(result.required,1230);near(result.pv,615/(4.5*.7));
const zero=m.energyReport([],{battery:2400,dod:50,eff:80,outage:6,psh:4.5,pr:70});near(zero.daily,0);assert.equal(zero.runtime,null);assert.equal(zero.pv,null);
assert.throws(()=>m.energyReport([{watts:10,qty:1,hours:25,essential:true}],{battery:2400,dod:50,eff:80,outage:6,psh:4.5,pr:70}));
for(const file of ['watershare.js','projectstarter.js','taqawise.js'])assert.ok(readFileSync(new URL('../assets/'+file,import.meta.url),'utf8').includes('window.SIRAI_MATH.'),'Tool does not use tested math: '+file);
console.log('Independent SIRAI water, project budget and energy math tests passed.');
