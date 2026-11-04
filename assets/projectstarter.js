(() => {
'use strict';
const page=document.querySelector('.ps');
if(!page)return;
const $=id=>document.getElementById(id);
const STEP_COUNT=5, MAX_ROWS=30, MAX_FILE=300000;
const FIELD_KEYS=['name','category','area','problem','people','action','success','voice','currency','funding','contingency','fundingNotes','consult','inclusion'];
const LIMITS={name:100,area:100,problem:700,people:450,action:650,success:500,voice:500,fundingNotes:450,consult:600,inclusion:600};
const defaultState=()=>({name:'',category:'education',area:'',problem:'',people:'',action:'',success:'',voice:'',currency:'SDG',funding:'0',contingency:'10',fundingNotes:'',consult:'',inclusion:'',costs:[{item:'',qty:'1',unit:'0'}],roles:[{role:'',responsibility:''}],milestones:[{task:'',when:'',owner:''}],risks:[{risk:'',response:'',level:'medium'}]});
let state=defaultState(),step=0;
const lang=()=>['en','ar','fr','de'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const T=k=>window.PS_LOCALES?.[lang()]?.[k]??window.PS_LOCALES?.en?.[k]??k;
const money=n=>new Intl.NumberFormat(lang(),{maximumFractionDigits:2,minimumFractionDigits:0}).format(n)+' '+(state.currency==='OTHER'?'':state.currency);
const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value??'';if(className)el.className=className;return el};
const field=(holder,label,value,change,type='text',options=null)=>{
 const wrap=text('div','','ps-repeat-field'),lab=text('label',T(label));wrap.appendChild(lab);
 const el=options?document.createElement('select'):type==='textarea'?document.createElement('textarea'):document.createElement('input');
 if(options){for(const [val,key] of options){const op=document.createElement('option');op.value=val;op.textContent=T(key);el.appendChild(op)}}
 if(type!=='textarea'&&!options)el.type=type;
 if(type==='number'){el.min='0';el.max='1000000000000';el.step='0.01';el.inputMode='decimal'}
 if(type==='textarea')el.rows=2;
 el.value=value??'';el.setAttribute('aria-label',T(label));
 el.addEventListener('input',()=>change(el.value));
 el.addEventListener('change',()=>change(el.value));
 wrap.appendChild(el);holder.appendChild(wrap);return wrap;
};
const safeString=(v,max=250)=>typeof v==='string'?v.slice(0,max):'';
const limitNumber=(s,max)=>{const n=Number(s);return Number.isFinite(n)&&n>=0&&n<=max?n:NaN};
function totals(){
 let subtotal=0,invalid=false;
 for(const c of state.costs){if(!(c.item||'').trim())continue;const q=limitNumber(c.qty,1000000),u=limitNumber(c.unit,1e12);if(!Number.isFinite(q)||!Number.isFinite(u)){invalid=true;continue}subtotal+=q*u;}
 const contingency=limitNumber(state.contingency,50),funding=limitNumber(state.funding,1e15);
 if(!Number.isFinite(contingency)||!Number.isFinite(funding)||subtotal>1e15)invalid=true;
 const reserve=subtotal*(Number.isFinite(contingency)?contingency:0)/100,grand=subtotal+reserve;
 return {subtotal,reserve,grand,funding:Number.isFinite(funding)?funding:0,gap:Math.max(0,grand-(Number.isFinite(funding)?funding:0)),invalid};
}
const filled=value=>String(value||'').trim().length>0;
function checks(){
 const c=state.costs.some(x=>filled(x.item)&&Number.isFinite(limitNumber(x.qty,1e6))&&Number.isFinite(limitNumber(x.unit,1e12)));
 const r=state.roles.some(x=>filled(x.role)&&filled(x.responsibility));
 const m=state.milestones.some(x=>filled(x.task)&&filled(x.when));
 const risk=state.risks.some(x=>filled(x.risk)&&filled(x.response));
 return [
 ['checkProblem',filled(state.problem)&&filled(state.people)],
 ['checkAction',filled(state.action)&&filled(state.success)],
 ['checkVoice',filled(state.voice)&&filled(state.inclusion)],
 ['checkCosts',c&&!totals().invalid],
 ['checkRoles',r&&filled(state.consult)],
 ['checkMilestones',m],
 ['checkRisks',risk],
 ['checkFunding',!totals().invalid&&state.costs.some(x=>filled(x.item))&&(totals().gap===0||filled(state.fundingNotes))]
 ];
}
function renderProgress(){
 const items=checks(),done=items.filter(x=>x[1]).length,pct=Math.round(done/items.length*100);
 $('ps-progress-value').textContent=pct+'%';$('ps-progress-bar').style.width=pct+'%';
}
function recalc(){
 const v=totals();
 for(const [id,n] of [['ps-subtotal',v.subtotal],['ps-reserve',v.reserve],['ps-total',v.grand],['ps-gap',v.gap]])$(id).textContent=v.invalid?'—':money(n);
 renderProgress();
 if(step===4)renderPreview();
}
function repeat(kind,elementId,headingKey,properties){
 const host=$(elementId);host.replaceChildren();
 if(!state[kind].length){host.appendChild(text('p',T('emptyRows'),'ps-empty'));return}
 state[kind].forEach((entry,index)=>{
   const row=text('div','','ps-repeat'),head=text('div','','ps-repeat-head');
   head.appendChild(text('strong',T(headingKey)+' '+(index+1)));
   const remove=text('button',T('remove'),'ps-remove');remove.type='button';remove.setAttribute('aria-label',T('remove')+' '+(index+1));
   remove.addEventListener('click',()=>{state[kind].splice(index,1);renderRepeat(kind);recalc()});head.appendChild(remove);row.appendChild(head);
   const grid=text('div','','ps-repeat-grid');row.appendChild(grid);
   for(const p of properties){
     const box=field(grid,p.label,entry[p.key],v=>{entry[p.key]=safeString(v,p.limit||250);recalc()},p.type||'text',p.options);
     if(p.full)box.classList.add('full');
   }
   host.appendChild(row);
 });
}
function renderRepeat(kind){
 if(kind==='costs')repeat('costs','ps-cost-list','itemN',[{key:'item',label:'costDescription',full:true,limit:140},{key:'qty',label:'quantity',type:'number'},{key:'unit',label:'unitCost',type:'number'}]);
 if(kind==='roles')repeat('roles','ps-role-list','roleN',[{key:'role',label:'roleName',limit:120},{key:'responsibility',label:'roleDuty',limit:250,type:'textarea',full:true}]);
 if(kind==='milestones')repeat('milestones','ps-milestone-list','milestoneN',[{key:'task',label:'milestoneName',limit:180,full:true},{key:'when',label:'milestoneWhen',limit:90},{key:'owner',label:'milestoneOwner',limit:100}]);
 if(kind==='risks')repeat('risks','ps-risk-list','riskN',[{key:'risk',label:'riskName',limit:170,full:true},{key:'level',label:'riskLevel',options:[['low','riskLow'],['medium','riskMedium'],['high','riskHigh']]},{key:'response',label:'riskResponse',limit:350,type:'textarea',full:true}]);
}
function add(kind,template){if(state[kind].length>=MAX_ROWS){message(T('rowLimit'));return}state[kind].push({...template});renderRepeat(kind);recalc()}
function message(msg){$('ps-message').textContent=msg||''}
function setStep(next){
 step=Math.max(0,Math.min(STEP_COUNT-1,next));
 document.querySelectorAll('[data-panel]').forEach((el,i)=>{el.hidden=i!==step});
 document.querySelectorAll('[data-step]').forEach((el,i)=>{el.classList.toggle('active',i===step);if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current')});
 $('ps-prev').disabled=step===0;
 $('ps-next').hidden=step===STEP_COUNT-1;
 if(step===4)renderPreview();
 renderProgress();message('');
 const section=$('workspace');if(section&&window.matchMedia&&window.matchMedia('(max-width: 850px)').matches)section.scrollIntoView({block:'start',behavior:'smooth'});
}
function addBlock(host,heading,value){
 const box=text('section','','ps-proposal-block');box.appendChild(text('h5',T(heading)));box.appendChild(text('p',filled(value)?String(value):T('unspecified')));host.appendChild(box);
}
function makeTable(columns,rows){
 const table=text('table','','ps-proposal-table'),thead=document.createElement('thead'),tr=document.createElement('tr');
 for(const col of columns)tr.appendChild(text('th',T(col)));
 thead.appendChild(tr);table.appendChild(thead);const tbody=document.createElement('tbody');
 for(const row of rows){const r=document.createElement('tr');for(const cell of row)r.appendChild(text('td',String(cell??'')));tbody.appendChild(r)}
 table.appendChild(tbody);return table;
}
function proposal(){
 const host=$('ps-proposal');host.replaceChildren();
 const header=text('div','','ps-proposal-header'),first=document.createElement('div');
 first.appendChild(text('small','SIRAI / PROJECTSTARTER 002'));
 first.appendChild(text('h4',state.name.trim()||T('untitled')));
 if(filled(state.area))first.appendChild(text('p',state.area,'ps-proposal-area'));
 header.appendChild(first);header.appendChild(text('span',T('draft'),'ps-draft-mark'));host.appendChild(header);
 const block=text('div','','ps-proposal-info');
 addBlock(block,'problemLabel',state.problem);addBlock(block,'peopleLabel',state.people);addBlock(block,'actionLabel',state.action);addBlock(block,'successLabel',state.success);addBlock(block,'voiceLabel',state.voice);
 addBlock(block,'consultLabel',state.consult);addBlock(block,'inclusionLabel',state.inclusion);host.appendChild(block);
 const budgetSection=text('section','','ps-proposal-block');budgetSection.appendChild(text('h5',T('itemsTitle')));
 const budgetRows=state.costs.filter(x=>filled(x.item)).map(x=>[x.item,x.qty,x.unit,money(Number(x.qty)*Number(x.unit))]);
 if(budgetRows.length)budgetSection.appendChild(makeTable(['costDescription','quantity','unitCost','lineTotal'],budgetRows));
 else budgetSection.appendChild(text('p',T('unspecified')));
 const b=totals();budgetSection.appendChild(text('p',T('total')+': '+(b.invalid?'—':money(b.grand))+'   |   '+T('gap')+': '+(b.invalid?'—':money(b.gap)),'ps-budget-caption'));host.appendChild(budgetSection);addBlock(host,'fundingNotesLabel',state.fundingNotes);
 const roleRows=state.roles.filter(x=>filled(x.role)||filled(x.responsibility)).map(x=>[x.role,x.responsibility]);
 const milestoneRows=state.milestones.filter(x=>filled(x.task)||filled(x.when)||filled(x.owner)).map(x=>[x.task,x.when,x.owner]);
 const riskRows=state.risks.filter(x=>filled(x.risk)||filled(x.response)).map(x=>[x.risk,T('risk'+(x.level||'medium').charAt(0).toUpperCase()+(x.level||'medium').slice(1)),x.response]);
 for(const [key,columns,rows] of [['rolesTitle',['roleName','roleDuty'],roleRows],['milestonesTitle',['milestoneName','milestoneWhen','milestoneOwner'],milestoneRows],['risksTitle',['riskName','riskLevel','riskResponse'],riskRows]]){
  const section=text('section','','ps-proposal-block');section.appendChild(text('h5',T(key)));section.appendChild(rows.length?makeTable(columns,rows):text('p',T('unspecified')));host.appendChild(section);
 }
 host.appendChild(text('p',T('proposalDisclaimer'),'ps-proposal-note'));
}
function renderPreview(){
 const host=$('ps-checklist');host.replaceChildren();
 for(const [k,ok] of checks()){
  const item=text('div','','ps-quality-item'+(ok?'':' missing'));
  item.appendChild(text('span',ok?'✓':'○'));item.appendChild(text('div',T(k)));host.appendChild(item);
 }
 proposal();
}
function renderLanguage(){
 document.querySelectorAll('[data-ps]').forEach(el=>{el.textContent=T(el.dataset.ps)});
 for(const x of document.querySelectorAll('[data-field]')){
   if(x.tagName==='SELECT'){
    x.querySelectorAll('[data-ps]').forEach(opt=>{opt.textContent=T(opt.dataset.ps)});
   }
 }
 renderRepeat('costs');renderRepeat('roles');renderRepeat('milestones');renderRepeat('risks');
 $('ps-prev').textContent=T('previous');
 $('ps-next').textContent=T('next');
 recalc();if(step===4)renderPreview();
}
function validateDraft(raw){
 if(!raw||typeof raw!=='object'||raw.format!=='SIRAI-ProjectStarter-v1'||!raw.project||typeof raw.project!=='object')throw Error(T('badFile'));
 const src=raw.project,target=defaultState();
 for(const k of FIELD_KEYS){if(k==='category')target[k]=['education','environment','community','energy','livelihood','other'].includes(src[k])?src[k]:'other';
 else if(k==='currency')target[k]=['SDG','USD','EUR','OTHER'].includes(src[k])?src[k]:'OTHER';
 else target[k]=safeString(src[k],LIMITS[k]||35)}
 const schemas={costs:{item:140,qty:30,unit:30},roles:{role:120,responsibility:250},milestones:{task:180,when:90,owner:100},risks:{risk:170,response:350,level:10}};
 for(const [k,schema] of Object.entries(schemas)){
  if(!Array.isArray(src[k]))continue;
  target[k]=src[k].slice(0,MAX_ROWS).filter(x=>x&&typeof x==='object').map(x=>{
   const obj={};for(const [prop,limit] of Object.entries(schema))obj[prop]=safeString(x[prop],limit);
   if(k==='risks'&&!['low','medium','high'].includes(obj.level))obj.level='medium';
   return obj;
  });
 }
 return target;
}
function download(){
 const data=JSON.stringify({format:'SIRAI-ProjectStarter-v1',project:state},null,2);
 const blob=new Blob([data],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='SIRAI_ProjectStarter_Draft.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
 message(T('downloaded'));
}
function summary(){
 const b=totals();return [
 'SIRAI / PROJECTSTARTER',T('draft'),state.name||T('untitled'),
 T('areaLabel')+': '+state.area,T('problemLabel')+': '+state.problem,T('peopleLabel')+': '+state.people,
 T('actionLabel')+': '+state.action,T('successLabel')+': '+state.success,T('voiceLabel')+': '+state.voice,
 T('total')+': '+(b.invalid?'—':money(b.grand)),T('gap')+': '+(b.invalid?'—':money(b.gap)),
 T('proposalDisclaimer')].join('\n\n');
}
function bind(){
 document.querySelectorAll('[data-field]').forEach(el=>{
  const key=el.dataset.field;
  el.addEventListener('input',()=>{state[key]=el.value;recalc()});
  el.addEventListener('change',()=>{state[key]=el.value;recalc()});
 });
 document.querySelectorAll('[data-step]').forEach(el=>el.addEventListener('click',()=>setStep(Number(el.dataset.step))));
 $('ps-next').addEventListener('click',()=>setStep(step+1));$('ps-prev').addEventListener('click',()=>setStep(step-1));
 $('ps-add-cost').addEventListener('click',()=>add('costs',{item:'',qty:'1',unit:'0'}));
 $('ps-add-role').addEventListener('click',()=>add('roles',{role:'',responsibility:''}));
 $('ps-add-milestone').addEventListener('click',()=>add('milestones',{task:'',when:'',owner:''}));
 $('ps-add-risk').addEventListener('click',()=>add('risks',{risk:'',level:'medium',response:''}));
 $('ps-save').addEventListener('click',()=>{
  try{localStorage.setItem('sirai-projectstarter-draft',JSON.stringify({format:'SIRAI-ProjectStarter-v1',project:state}));message(T('saved'))}
  catch(e){message(T('saveFailed'))}
 });
 $('ps-load').addEventListener('click',()=>{
  try{
    const saved=localStorage.getItem('sirai-projectstarter-draft');
    if(!saved){message(T('noSaved'));return}
    if(!confirm(T('confirmLoad')))return;
    state=validateDraft(JSON.parse(saved));syncFields();renderLanguage();message(T('loaded'));
  }catch(e){message(T('badFile'))}
 });
 $('ps-import').addEventListener('click',()=>$('ps-import-file').click());
 $('ps-import-file').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{if(file.size>MAX_FILE)throw Error(T('tooLarge'));const data=JSON.parse(await file.text());state=validateDraft(data);syncFields();renderLanguage();message(T('imported'))}
  catch(err){message(err.message||T('badFile'))}
  finally{e.target.value=''}
 });
 $('ps-clear').addEventListener('click',()=>{
  if(!confirm(T('confirmClear')))return;state=defaultState();
  try{localStorage.removeItem('sirai-projectstarter-draft')}catch(e){}
  syncFields();renderLanguage();setStep(0);message(T('cleared'));
 });
 $('ps-download').addEventListener('click',download);
 $('ps-print').addEventListener('click',()=>{renderPreview();window.print()});
 $('ps-share').addEventListener('click',()=>{
  const b=totals();
  const draft=[
   'SIRAI ProjectStarter | DRAFT / مسودة',
   'Community project / مشروع مجتمعي: '+(state.name||'Untitled'),
   'Planned activity / النشاط المخطط: '+state.action,
   'Expected result / النتيجة المتوقعة: '+state.success,
   'Estimated cost / التكلفة التقديرية: '+(b.invalid?'Needs checking':money(b.grand)),
   'Review with local participants. No funding or SIRAI endorsement is implied.',
   'Remove all identifying or sensitive details before sharing.'
  ].join('\n');
  window.SIRAI_SHARE?.share(draft);
 });
 $('ps-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary());message(T('copied'))}catch(e){message(T('copyFailed'))}});
 document.querySelectorAll('[data-lang-select]').forEach(el=>el.addEventListener('change',renderLanguage));
 window.addEventListener('beforeprint',renderPreview);
}
function syncFields(){document.querySelectorAll('[data-field]').forEach(el=>{el.value=state[el.dataset.field]??''})}
bind();renderLanguage();setStep(0);
})();
