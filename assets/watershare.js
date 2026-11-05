(() => {
'use strict';
const page=document.querySelector('.ws-page');
if(!page)return;
const pick=id=>document.getElementById(id);
const keys=['households','litres','windows','start','duration','spacing','tank','supply'];
const defaults={households:'20',litres:'40',windows:'2',start:'07:00',duration:'60',spacing:'180',tank:'1000',supply:''};
let current=null;
const locale=()=>['en','ar','fr','de'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const t=k=>window.WS_LOCALES?.[locale()]?.[k]??window.WS_LOCALES?.en?.[k]??k;
const fmt=n=>new Intl.NumberFormat(locale(),{maximumFractionDigits:0}).format(n);
const value=k=>pick('ws-'+k).value.trim();
const readInt=(k,min,max,optional=false)=>{
 const v=value(k);
 if(optional&&!v)return null;
 if(!/^[0-9]+$/.test(v))throw Error(t('invalid')+': '+t(k));
 const n=Number(v);
 if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(t('invalid')+': '+t(k)+' ('+fmt(min)+'–'+fmt(max)+')');
 return n;
};
const parseTime=()=>{
 const s=value('start'),m=/^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(s);
 if(!m)throw Error(t('invalidTime'));
 return Number(m[1])*60+Number(m[2]);
};
const clock=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const set=(id,text)=>{const n=pick(id);if(n)n.textContent=text;};
const clearOutputs=()=>{['daily','window-volume','group-size','tank-ratio','supply-ratio'].forEach(id=>set('ws-'+id,'—'));pick('ws-rows').replaceChildren();pick('ws-warnings').replaceChildren()};
function renderLabels(){
 document.querySelectorAll('[data-ws]').forEach(el=>{el.textContent=t(el.dataset.ws)});
 pick('ws-supply').placeholder='—';
 calculate();
}
function addWarning(kind,message){
 const el=document.createElement('div');el.className='ws-warning ws-warning-'+kind;el.textContent=message;pick('ws-warnings').appendChild(el);
}
function calculate(){
 const error=pick('ws-error');error.hidden=true;error.textContent='';
 try{
 const households=readInt('households',1,5000),litres=readInt('litres',1,1000);
 const windows=readInt('windows',1,12),duration=readInt('duration',15,240);
 const spacing=readInt('spacing',15,720),tank=readInt('tank',1,10000000,true);
 const supply=readInt('supply',1,10000000,true),start=parseTime();
 if(windows>households)throw Error(t('tooManyWindows'));
 if(spacing<duration)throw Error(t('overlap'));
 if(start+(windows-1)*spacing+duration>1440)throw Error(t('pastMidnight'));
 const total=window.SIRAI_MATH.waterDemand(households,litres),base=Math.floor(households/windows),extra=households%windows;
 const rows=[];let offset=0;
 for(let i=0;i<windows;i++){
   const count=base+(i<extra?1:0);
   const from=offset+1,to=offset+count;
   rows.push({number:i+1,count,from,to,volume:count*litres,start:clock(start+i*spacing),end:clock(start+i*spacing+duration)});
   offset+=count;
 }
 current={households,litres,windows,duration,spacing,tank,supply,total,rows};
 set('ws-daily',fmt(total)+' L');
 set('ws-window-volume',fmt(Math.round(total/windows))+' L');
 set('ws-group-size',base===base+Number(extra>0)?fmt(base):fmt(base)+'–'+fmt(base+1));
 set('ws-tank-ratio',tank===null?t('notEntered'):(total/tank).toFixed(2)+'×');
 set('ws-supply-ratio',supply===null?t('notEntered'):(total/supply*100).toFixed(0)+'%');
 const body=pick('ws-rows');body.replaceChildren();
 const id=n=>'HH-'+String(n).padStart(3,'0');
 for(const row of rows){
   const tr=document.createElement('tr');
   const cells=[fmt(row.number),row.start+' – '+row.end,id(row.from)+(row.to>row.from?' – '+id(row.to):''),fmt(row.count),fmt(row.volume)+' L'];
   for(const item of cells){const td=document.createElement('td');td.textContent=item;tr.appendChild(td)}
   body.appendChild(tr);
 }
 pick('ws-warnings').replaceChildren();
 if(tank!==null&&total>tank)addWarning('alert',t('tankWarning'));
 if(supply!==null&&total>supply)addWarning('alert',t('supplyWarning')+' '+fmt(total-supply)+' L');
 if(tank===null||supply===null)addWarning('info',t('unknownWarning'));
 if(!pick('ws-warnings').children.length)addWarning('info',t('verifyWarning'));
 }catch(e){current=null;clearOutputs();error.textContent=e.message;error.hidden=false}
}
function rowsForCSV(){
 const data=[ [t('csvWindow'),t('csvTime'),t('csvHousehold'),t('csvLitres'),t('csvCollected'),t('csvNotes')] ];
 for(const g of current.rows){
  for(let i=g.from;i<=g.to;i++)data.push([String(g.number),g.start+'-'+g.end,'HH-'+String(i).padStart(3,'0'),String(current.litres),'','']);
 }
 return data;
}
function csvEscape(value){return '"'+String(value).replaceAll('"','""')+'"'}
function download(){
 if(!current)return;
 if(!window.confirm('This CSV includes collection times. Store it privately and only share with participants when safe. Continue? / يحتوي الجدول على أوقات الجمع. احتفظ به بشكل خاص. هل تريد المتابعة؟'))return;
 const content='\uFEFF'+rowsForCSV().map(row=>row.map(csvEscape).join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='SIRAI_WaterShare_Draft_Schedule.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
 set('ws-action-message',t('downloaded'));
}
function summary(){
 const p=current;return [
 'SIRAI WaterShare | '+t('summaryDraft'),
 t('households')+': '+p.households,t('litres')+': '+p.litres+' L',
 t('daily')+': '+p.total+' L',t('windows')+': '+p.windows,
 ...p.rows.map(g=>t('window')+' '+g.number+': HH-'+String(g.from).padStart(3,'0')+'–HH-'+String(g.to).padStart(3,'0')+', '+g.volume+' L'),
 t('summaryCaution')].join('\n');
}
async function copy(){
 if(!current)return;
 try{if(!navigator.clipboard?.writeText)throw Error('no clipboard');await navigator.clipboard.writeText(summary());set('ws-action-message',t('copied'))}
 catch(e){set('ws-action-message',t('copyFailed'))}
}
function printPlan(){if(!current)return;window.print()}
function reset(){for(const k of keys)pick('ws-'+k).value=defaults[k];set('ws-action-message','');calculate()}
for(const k of keys)pick('ws-'+k).addEventListener('input',calculate);
pick('ws-reset').addEventListener('click',reset);
pick('ws-example')?.addEventListener('click',()=>{
 if(!window.confirm(({en:'Replace the current numbers with a fictional example? No real household data is used.',ar:'هل تريد استبدال الأرقام الحالية بمثال افتراضي؟ لا تُستخدم بيانات أسر حقيقية.',fr:'Remplacer les valeurs par un exemple fictif ? Aucune donnée réelle.',de:'Werte durch ein fiktives Beispiel ersetzen? Keine echten Haushaltsdaten.'})[locale()]))return;
 const demo={households:'24',litres:'35',windows:'3',start:'07:00',duration:'60',spacing:'150',tank:'1000',supply:'900'};
 for(const [k,v] of Object.entries(demo))pick('ws-'+k).value=v;
 calculate();set('ws-action-message',({en:'Fictional example loaded. The schedule requires local agreement and a verified water supply.',ar:'تم تحميل مثال افتراضي. يتطلب الجدول اتفاق المشاركين والتحقق من مصدر المياه.',fr:'Exemple fictif chargé. Vérifiez l’approvisionnement et obtenez un accord local.',de:'Fiktives Beispiel geladen. Versorgung prüfen und vor Ort abstimmen.'})[locale()]);
});
pick('ws-csv').addEventListener('click',download);
pick('ws-copy').addEventListener('click',copy);
pick('ws-share').addEventListener('click',()=>{
 if(!current)return;
 const p=current;
 const lines=[
 'SIRAI WaterShare | DRAFT / مسودة',
 'Households / الأسر: '+p.households,
 'Total daily water / إجمالي المياه يومياً: '+p.total+' L',
 'Collection groups / مجموعات التوزيع: '+p.windows,
 ...p.rows.map(g=>'Group '+g.number+' / المجموعة '+g.number+': '+g.count+' households, '+g.volume+' L'),
 'Times and locations are deliberately excluded for safety. Agree any details privately, only if safe.'
 ];
 window.SIRAI_SHARE?.share(lines.join('\n'));
});
pick('ws-print').addEventListener('click',printPlan);
document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',renderLabels));
renderLabels();
})();
