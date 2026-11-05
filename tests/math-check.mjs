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

// Deterministic edge-case/property checks: no sampling of real households.
for(let households=1;households<=120;households+=7){
 for(let windows=1;windows<=Math.min(12,households);windows++){
  const groups=m.waterGroups(households,windows,37);
  assert.equal(groups.reduce((n,g)=>n+g.count,0),households);
  assert.equal(groups.reduce((n,g)=>n+g.litres,0),m.waterDemand(households,37));
  assert.ok(groups.every(g=>g.count>=1));
 }
}
for(const rate of [0,5,10,25,50]){
 const result=m.projectBudget([{qty:3,unit:1200},{qty:7,unit:350}],rate,1000);
 near(result.total,result.subtotal*(1+rate/100));
 near(result.gap,Math.max(0,result.total-1000));
}
for(const dod of [20,40,50,80,100]){
 const base={battery:2400,dod,eff:80,outage:6,psh:4.5,pr:70};
 const report=m.energyReport([{watts:60,qty:1,hours:5,essential:true}],base);
 near(report.usable,2400*dod/100*.8);
 near(report.runtime,report.usable/60);
 near(report.required,60*6/(dod/100*.8));
}
assert.throws(()=>m.energyReport([{watts:-2,qty:1,hours:2,essential:true}],{battery:2400,dod:50,eff:80,outage:6,psh:4.5,pr:70}));
assert.throws(()=>m.energyReport([], {battery:2400,dod:0,eff:80,outage:6,psh:4.5,pr:70}));
console.log('Deterministic boundary and conservation checks passed.');
