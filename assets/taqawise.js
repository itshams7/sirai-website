(() => {
'use strict';
if(!document.querySelector('.tq'))return;
const $=id=>document.getElementById(id);
const MAX_ROWS=40,MAX_FILE=180000;
const template={
 led:{key:'pLed',name:'LED light',watts:9,qty:3,hours:5,essential:true},
 fan:{key:'pFan',name:'Fan',watts:55,qty:1,hours:8,essential:true},
 fridge:{key:'pFridge',name:'Refrigerator',watts:120,qty:1,hours:8,essential:true},
 router:{key:'pRouter',name:'Internet router',watts:12,qty:1,hours:12,essential:true},
 phone:{key:'pPhone',name:'Phone charger',watts:10,qty:2,hours:2,essential:true},
 laptop:{key:'pLaptop',name:'Laptop',watts:65,qty:1,hours:5,essential:false},
 tv:{key:'pTv',name:'Television',watts:80,qty:1,hours:4,essential:false},
 pump:{key:'pPump',name:'Water pump',watts:600,qty:1,hours:1,essential:false},
 custom:{key:'pCustom',name:'Custom appliance',watts:60,qty:1,hours:3,essential:false}
};
const fresh=()=>({items:[{...template.led,id:1},{...template.fan,id:2},{...template.router,id:3},{...template.tv,id:4}],settings:{battery:'2000',dod:'80',eff:'85',outage:'6',psh:'4.5',pr:'75'}});
let model=fresh(),step=0,nextId=5;
const locale=()=>['en','ar','fr','de'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const T=k=>window.TQ_LOCALES?.[locale()]?.[k]??window.TQ_LOCALES?.en?.[k]??k;
const number=(x,maxDecimals=1)=>new Intl.NumberFormat(locale(),{maximumFractionDigits:maxDecimals}).format(x);
const kilowatt=x=>number(x/1000,2)+' kWh';
const watt=x=>number(x,0)+' W';
const wh=x=>number(x,0)+' Wh';
const hours=x=>number(x,1)+' h';
function numeric(raw,min,max){if(typeof raw!=='string'&&!Number.isFinite(raw))return null;const n=Number(raw);if(String(raw).trim()===''||!Number.isFinite(n)||n<min||n>max)return null;return n}
const el=(tag,textValue,className)=>{const n=document.createElement(tag);if(textValue!==undefined)n.textContent=String(textValue);if(className)n.className=className;return n};
const showMessage=x=>{$('tq-message').textContent=x||''};
function getData(){
 let valid=true;
 let connected=0,daily=0,essentialW=0,essentialDaily=0,any=0;
 const rows=[];
 for(const item of model.items){
  const watts=numeric(item.watts,0,25000),qty=numeric(item.qty,1,100),time=numeric(item.hours,0,24);
  if(watts===null||qty===null||time===null||!Number.isInteger(qty)||!String(item.name||'').trim()){valid=false;continue}
  const power=watts*qty,energy=power*time;
  if(power>1e7){valid=false;continue}
  connected+=power;daily+=energy;
  if(item.essential){essentialW+=power;essentialDaily+=energy}
  rows.push({...item,watts,qty,hours:time,power,energy});any++;
 }
 const settings={};for(const [k,min,max] of [['battery',100,1000000],['dod',10,100],['eff',40,100],['outage',.5,72],['psh',1,9],['pr',40,95]]){settings[k]=numeric(model.settings[k],min,max);if(settings[k]===null)valid=false}
 if(connected>1e8||daily>1e9)valid=false;
 const factor=settings.dod!==null&&settings.eff!==null?(settings.dod/100)*(settings.eff/100):null;
 const usable=factor===null||settings.battery===null?null:settings.battery*factor;
 const runtime=essentialW>0&&usable!==null?usable/essentialW:null;
 const required=essentialW>0&&factor>0&&settings.outage!==null?(essentialW*settings.outage/factor):null;
 const pv=daily>0&&settings.psh>0&&settings.pr>0?daily/(settings.psh*settings.pr/100):null;
 return {valid,rows,connected,daily,essentialW,essentialDaily,usable,runtime,required,pv,settings,any};
}
function renderItems(){
 const host=$('tq-load-list');host.replaceChildren();
 if(!model.items.length){host.appendChild(el('p',T('empty'),'tq-empty'));return}
 model.items.forEach((item,index)=>{
  const card=el('article',undefined,'tq-load-row'),head=el('div',undefined,'tq-load-top');
  head.appendChild(el('strong',T('appliance')+' '+(index+1)));
  const remove=el('button',T('remove'),'tq-remove');remove.type='button';remove.setAttribute('aria-label',T('remove')+' '+(index+1));
  remove.addEventListener('click',()=>{model.items=model.items.filter(v=>v.id!==item.id);renderItems();refresh()});head.appendChild(remove);card.appendChild(head);
  const cols=el('div',undefined,'tq-load-fields');
  for(const [key,label,type] of [['name','name','text'],['watts','watts','number'],['qty','qty','number'],['hours','dailyHours','number']]){
   const block=el('div',undefined,'tq-load-field');const lab=el('label',T(label));const input=el('input');
   const id='tq-item-'+item.id+'-'+key;input.id=id;lab.htmlFor=id;
   input.type=type;input.value=String(item[key]);if(key==='name')input.maxLength=80;
   if(type==='number'){input.min=key==='qty'?'1':'0';input.max=key==='watts'?'25000':key==='qty'?'100':'24';input.step=key==='hours'?'0.25':'1';input.inputMode='decimal'}
   input.addEventListener('input',()=>{item[key]=input.value;refresh()});
   block.appendChild(lab);block.appendChild(input);cols.appendChild(block);
  }
  card.appendChild(cols);
  const check=el('label',undefined,'tq-essential-check'),input=el('input');input.type='checkbox';input.checked=!!item.essential;
  input.addEventListener('change',()=>{item.essential=input.checked;refresh()});
  check.appendChild(input);check.appendChild(el('span',T('essential')));card.appendChild(check);host.appendChild(card);
 });
}
function addItem(){
 if(model.items.length>=MAX_ROWS){showMessage(T('limit'));return}
 const preset=template[$('tq-preset').value]||template.custom;
 model.items.push({...preset,id:nextId++,name:T(preset.key).split(' · ')[0]});
 renderItems();refresh();showMessage('');
}
function renderBreakdown(data){
 const host=$('tq-breakdown-bars');host.replaceChildren();
 if(!data.valid||!data.rows.length||data.daily<=0){host.appendChild(el('p',T('noLoads'),'tq-breakdown-empty'));return}
 const ranked=[...data.rows].sort((a,b)=>b.energy-a.energy).slice(0,6);
 for(const row of ranked){
  const item=el('div',undefined,'tq-breakdown-row'),top=el('div',undefined,'tq-breakdown-top');
  top.appendChild(el('span',row.name));top.appendChild(el('strong',number(row.energy/data.daily*100,0)+'% · '+wh(row.energy)));
  item.appendChild(top);
  const track=el('div',undefined,'tq-breakdown-track'),fill=el('span');
  fill.style.width=Math.max(0,Math.min(100,row.energy/data.daily*100))+'%';
  track.appendChild(fill);item.appendChild(track);host.appendChild(item);
 }
}
function calculateText(data){
 $('tq-daily').textContent=data.valid?kilowatt(data.daily):'—';
 $('tq-connected').textContent=data.valid?watt(data.connected):'—';
 $('tq-essential-w').textContent=data.valid?watt(data.essentialW):'—';
 $('tq-essential-day').textContent=data.valid?kilowatt(data.essentialDaily):'—';
 $('tq-runtime').textContent=data.valid&&data.runtime!==null?hours(data.runtime):'—';
 $('tq-needed').textContent=data.valid&&data.required!==null?wh(data.required):'—';
 $('tq-all-runtime').textContent=data.valid&&data.usable!==null&&data.connected>0?hours(data.usable/data.connected):'—';
 $('tq-priority-runtime').textContent=data.valid&&data.runtime!==null?hours(data.runtime):'—';
 $('tq-solar-energy').textContent=data.valid?kilowatt(data.daily):'—';
 $('tq-pv').textContent=data.valid&&data.pv!==null?watt(data.pv):'—';
 $('tq-pv-margin').textContent=data.valid&&data.pv!==null?watt(data.pv*1.25):'—';
 const note=$('tq-backup-note');note.classList.remove('warning');
 if(!data.valid){note.textContent=T('invalid');note.classList.add('warning')}
 else if(!data.rows.length){note.textContent=T('noLoads')}
 else if(data.essentialW===0){note.textContent=T('noEssentials')}
 else if(data.runtime!==null&&data.runtime<data.settings.outage){note.textContent=T('shortfall');note.classList.add('warning')}
 else note.textContent=T('backupCaution');
}
function table(headers,records){
 const t=el('table',undefined,'tq-report-table'),head=document.createElement('thead'),tr=document.createElement('tr');
 for(const h of headers)tr.appendChild(el('th',T(h)));head.appendChild(tr);t.appendChild(head);
 const body=document.createElement('tbody');
 for(const line of records){const row=document.createElement('tr');for(const value of line)row.appendChild(el('td',value));body.appendChild(row)}
 t.appendChild(body);return t;
}
function report(data){
 const host=$('tq-report');host.replaceChildren();
 host.appendChild(el('h4','TaqaWise / '+T('draftTitle')));
 host.appendChild(el('p',T('reportStatus'),'tq-report-lead'));
 const grid=el('div',undefined,'tq-report-stats');
 for(const [key,value] of [['daily',kilowatt(data.daily)],['connected',watt(data.connected)],['essLoad',watt(data.essentialW)],['runtime',data.runtime!==null?hours(data.runtime):'—'],['needed',data.required!==null?wh(data.required):'—'],['pvEstimate',data.pv!==null?watt(data.pv):'—']]){
  const card=el('div',undefined,'tq-report-stat');card.appendChild(el('span',T(key)));card.appendChild(el('strong',value));grid.appendChild(card)
 }
 host.appendChild(grid);
 host.appendChild(el('h5',T('appliancesHeading')));
 host.appendChild(table(['name','watts','qty','dailyHours','energy','essential'],data.rows.map(r=>[r.name,watt(r.watts),number(r.qty,0),hours(r.hours),wh(r.energy),r.essential?T('yes'):T('no')])));
 host.appendChild(el('h5',T('assumptionsHeading')));
 host.appendChild(table(['parameter','setting'],[
  [T('battery'),wh(data.settings.battery)],[T('dod'),number(data.settings.dod,0)+'%'],[T('eff'),number(data.settings.eff,0)+'%'],
  [T('outage'),hours(data.settings.outage)],[T('psh'),hours(data.settings.psh)],[T('pr'),number(data.settings.pr,0)+'%']
 ]));
 host.appendChild(el('p',T('reportLimit'),'tq-report-notes'));
}
function refresh(){
 const data=getData();calculateText(data);renderBreakdown(data);if(step===3){if(data.valid)report(data);else $('tq-report').replaceChildren(el('p',T('invalid')))}
}
function go(n){
 step=Math.min(3,Math.max(0,n));
 document.querySelectorAll('[data-panel]').forEach((p,i)=>{p.hidden=i!==step});
 document.querySelectorAll('[data-step]').forEach((s,i)=>{s.classList.toggle('active',i===step);if(i===step)s.setAttribute('aria-current','step');else s.removeAttribute('aria-current')});
 $('tq-prev').disabled=step===0;$('tq-next').hidden=step===3;
 refresh();showMessage('');
 if(window.matchMedia&&window.matchMedia('(max-width:840px)').matches)$('tq-planner').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderLanguage(){
 document.querySelectorAll('[data-tq]').forEach(n=>{n.textContent=T(n.dataset.tq)});
 renderItems();refresh();
}
function downloadFile(name,data,mime){
 const blob=new Blob([data],{type:mime});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
}
const csvField=x=>{let s=String(x);if(/^[\\s]*[=+@\\-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
function exportCsv(){
 const d=getData();if(!d.valid||!d.rows.length){showMessage(T('invalid'));return}
 const rows=[[T('name'),T('watts'),T('qty'),T('dailyHours'),T('energy')+' (Wh)',T('essential')],...d.rows.map(r=>[r.name,r.watts,r.qty,r.hours,r.energy,r.essential?T('yes'):T('no')])];
 downloadFile('SIRAI_TaqaWise_Appliances.csv','\uFEFF'+rows.map(row=>row.map(csvField).join(',')).join('\r\n'),'text/csv;charset=utf-8');showMessage(T('exported'));
}
function exportJson(){const d=getData();if(!d.valid){showMessage(T('invalid'));return}downloadFile('SIRAI_TaqaWise_Draft.json',JSON.stringify({format:'SIRAI-TaqaWise-v1',items:model.items,settings:model.settings},null,2),'application/json;charset=utf-8');showMessage(T('exported'))}
function safeImport(doc){
 if(!doc||doc.format!=='SIRAI-TaqaWise-v1'||!Array.isArray(doc.items)||!doc.settings||typeof doc.settings!=='object'||doc.items.length>MAX_ROWS)throw Error(T('badFile'));
 const items=doc.items.map((r,i)=>{if(!r||typeof r!=='object')throw Error(T('badFile'));
  const name=typeof r.name==='string'?r.name.slice(0,80):'';
  const watts=String(r.watts??''),qty=String(r.qty??''),hour=String(r.hours??'');
  if(!name.trim()||numeric(watts,0,25000)===null||numeric(qty,1,100)===null||!Number.isInteger(Number(qty))||numeric(hour,0,24)===null)throw Error(T('badFile'));
  return {id:i+1,key:'pCustom',name,watts,qty,hours:hour,essential:r.essential===true};
 });
 const settings={};for(const [key,min,max] of [['battery',100,1000000],['dod',10,100],['eff',40,100],['outage',.5,72],['psh',1,9],['pr',40,95]]){const value=String(doc.settings[key]??'');if(numeric(value,min,max)===null)throw Error(T('badFile'));settings[key]=value}
 return {items,settings}
}
function reset(){if(!confirm(T('confirmReset')))return;model=fresh();nextId=5;for(const input of document.querySelectorAll('[data-setting]'))input.value=model.settings[input.dataset.setting];renderLanguage();go(0);showMessage(T('resetDone'))}
for(const s of document.querySelectorAll('[data-setting]'))s.addEventListener('input',()=>{model.settings[s.dataset.setting]=s.value;refresh()});
$('tq-add').addEventListener('click',addItem);
$('tq-example')?.addEventListener('click',()=>{
 const ask={en:'Replace the current plan with fictional household example values?',ar:'هل تريد استبدال الخطة الحالية بقيم افتراضية لمنزل؟',fr:'Remplacer le plan par un exemple fictif de foyer ?',de:'Aktuellen Plan durch fiktives Haushaltsbeispiel ersetzen?'};
 if(!window.confirm(ask[locale()]))return;
 model={items:[{...template.led,id:1},{...template.fan,id:2},{...template.phone,id:3},{...template.fridge,id:4},{...template.tv,id:5}],settings:{battery:'2400',dod:'50',eff:'80',outage:'6',psh:'4.5',pr:'70'}};nextId=6;
 for(const input of document.querySelectorAll('[data-setting]'))input.value=model.settings[input.dataset.setting];
 renderLanguage();go(0);
 showMessage(({en:'Fictional example loaded. These are teaching assumptions, not appliance measurements or equipment recommendations.',ar:'تم تحميل مثال افتراضي. الأرقام تعليمية وليست قياسات لأجهزة أو توصيات شراء.',fr:'Exemple fictif chargé. Les valeurs ne sont ni des mesures réelles ni des recommandations d’équipement.',de:'Fiktives Beispiel geladen. Diese Werte sind keine Messungen oder Kaufempfehlungen.'})[locale()]);
});
document.querySelectorAll('[data-step]').forEach(s=>s.addEventListener('click',()=>go(Number(s.dataset.step))));
$('tq-prev').addEventListener('click',()=>go(step-1));$('tq-next').addEventListener('click',()=>go(step+1));
$('tq-reset').addEventListener('click',reset);
$('tq-print').addEventListener('click',()=>{const d=getData();if(!d.valid){showMessage(T('invalid'));return}report(d);window.print()});
$('tq-share').addEventListener('click',()=>{
 const d=getData();if(!d.valid){showMessage(T('invalid'));return}
 const lines=[
  'SIRAI TaqaWise | DRAFT / مسودة',
  'Daily demand / الاستهلاك اليومي: '+number(d.daily,0)+' Wh',
  'Essential load / الأحمال الأساسية: '+number(d.essentialW,0)+' W',
  'Battery nominal / سعة البطارية الاسمية: '+number(d.settings.battery,0)+' Wh',
  'Estimated backup runtime / التشغيل التقديري: '+(d.runtime===null?'—':number(d.runtime,1)+' h'),
  'Preliminary PV estimate / تقدير الطاقة الشمسية: '+(d.pv===null?'—':number(d.pv,0)+' W'),
  'Not a solar installation design. Verify real battery health, inverter, heat, shading and local safety.'
 ];
 window.SIRAI_SHARE?.share(lines.join('\n'));
});
const batteryPresets={
 gel12:{battery:'2400',dod:'50',eff:'80',pr:'65'},
 gel24:{battery:'4800',dod:'50',eff:'80',pr:'65'},
 lithium48:{battery:'4800',dod:'80',eff:'85',pr:'70'}
};
$('sirai-battery-preset')?.addEventListener('change',event=>{
 const preset=batteryPresets[event.target.value];if(!preset)return;
 for(const [key,value] of Object.entries(preset)){
  model.settings[key]=value;
  const input=document.querySelector('[data-setting="'+key+'"]');
  if(input)input.value=value;
 }
 refresh();
 showMessage('Example assumptions applied. Verify voltage, battery condition, chemistry and heat losses before purchasing.');
});
$('tq-csv').addEventListener('click',exportCsv);$('tq-json').addEventListener('click',exportJson);
$('tq-import').addEventListener('click',()=>$('tq-import-file').click());
$('tq-import-file').addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file)return;
 try{if(file.size>MAX_FILE)throw Error(T('tooLarge'));const imported=safeImport(JSON.parse(await file.text()));model=imported;nextId=imported.items.length+1;
 for(const input of document.querySelectorAll('[data-setting]'))input.value=model.settings[input.dataset.setting];
 renderLanguage();go(0);showMessage(T('imported'))
 }catch(e){showMessage(e.message||T('badFile'))}finally{event.target.value=''}
});
document.querySelectorAll('[data-lang-select]').forEach(s=>s.addEventListener('change',renderLanguage));
window.addEventListener('beforeprint',()=>{const d=getData();if(d.valid)report(d)});
renderLanguage();go(0);
})();