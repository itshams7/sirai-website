(() => {
'use strict';
const page = document.querySelector('.ws-page');
if (!page) return;
const pick = id => document.getElementById(id);
const keys = ['households', 'litres', 'windows', 'start', 'duration', 'spacing', 'tank', 'supply'];
const defaults = { households: '20', litres: '40', windows: '2', start: '07:00', duration: '60', spacing: '180', tank: '1000', supply: '' };
let current = null;
const locale = () => ['en', 'ar', 'fr', 'de'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
const t = k => window.WS_LOCALES?.[locale()]?.[k] ?? window.WS_LOCALES?.en?.[k] ?? k;
const fmt = n => new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(n);
const value = k => (pick('ws-' + k)?.value || '').trim();
const readInt = (k, min, max, optional = false) => {
  const v = value(k);
  if (optional && !v) return null;
  if (!/^[0-9]+$/.test(v)) throw Error(t('invalid') + ': ' + t(k));
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n < min || n > max) throw Error(t('invalid') + ': ' + t(k) + ' (' + fmt(min) + '–' + fmt(max) + ')');
  return n;
};
const parseTime = () => {
  const s = value('start');
  const m = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(s);
  if (!m) throw Error(t('invalidTime'));
  return Number(m[1]) * 60 + Number(m[2]);
};
const clock = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const set = (id, text) => { const n = pick(id); if (n) n.textContent = text; };
const clearOutputs = () => {
  ['daily', 'window-volume', 'group-size', 'tank-ratio', 'supply-ratio'].forEach(id => set('ws-' + id, '—'));
  const body = pick('ws-rows');
  if (body) body.replaceChildren();
  const warnings = pick('ws-warnings');
  if (warnings) warnings.replaceChildren();
  const summary = pick('ws-summary');
  if (summary) { summary.hidden = true; summary.innerHTML = ''; }
  const barFill = pick('ws-tank-bar-fill');
  if (barFill) { barFill.style.width = '0%'; barFill.dataset.kind = ''; }
  const barWrap = pick('ws-tank-bar-wrap');
  if (barWrap) barWrap.hidden = true;
};
function renderLabels() {
  document.querySelectorAll('[data-ws]').forEach(el => {
    if (el.dataset.ws) el.textContent = t(el.dataset.ws);
  });
  const supply = pick('ws-supply');
  if (supply) supply.placeholder = '—';
  calculate();
}
function addWarning(kind, message) {
  const el = document.createElement('div');
  el.className = 'ws-warning ws-warning-' + kind;
  el.textContent = message;
  const box = pick('ws-warnings');
  if (box) box.appendChild(el);
}
function buildSummary(p) {
  let html = '<p><strong>' + t('summaryTitle') + '</strong></p>';
  html += '<p>' + t('summaryIntro').replace('{total}', '<strong>' + fmt(p.total) + ' L</strong>') + '</p>';
  if (p.windows > 1) {
    const avg = Math.round(p.total / p.windows);
    const sameSize = p.rows.every(r => r.count === p.rows[0].count);
    if (sameSize) {
      html += '<p>' + t('summaryEqualGroups').replace('{count}', fmt(p.rows[0].count)).replace('{volume}', fmt(avg)) + '</p>';
    } else {
      html += '<p>' + t('summaryMixedGroups').replace('{windows}', fmt(p.windows)).replace('{volume}', fmt(avg)) + '</p>';
    }
  }
  if (p.tank !== null) {
    const pct = Math.round(p.total / p.tank * 100);
    if (p.total > p.tank) html += '<p class="ws-summary-alert">' + t('summaryTankOver').replace('{pct}', pct) + '</p>';
    else if (pct >= 85) html += '<p class="ws-summary-warn">' + t('summaryTankTight').replace('{pct}', pct) + '</p>';
    else html += '<p>' + t('summaryTankOk').replace('{pct}', pct) + '</p>';
  }
  if (p.supply !== null) {
    const pct = Math.round(p.total / p.supply * 100);
    if (p.total > p.supply) html += '<p class="ws-summary-alert">' + t('summarySupplyOver').replace('{pct}', pct) + '</p>';
    else if (pct >= 90) html += '<p class="ws-summary-warn">' + t('summarySupplyTight').replace('{pct}', pct) + '</p>';
    else html += '<p>' + t('summarySupplyOk').replace('{pct}', pct) + '</p>';
  }
  html += '<p class="ws-summary-advice">' + t('summaryAdvice') + '</p>';
  return html;
}
function updateTankBar(p) {
  const wrap = pick('ws-tank-bar-wrap');
  const fill = pick('ws-tank-bar-fill');
  const label = pick('ws-tank-bar-label');
  if (!wrap || !fill) return;
  if (p.tank === null) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  const pct = Math.min(150, Math.round(p.total / p.tank * 100));
  fill.style.width = Math.min(100, pct) + '%';
  if (p.total > p.tank) fill.dataset.kind = 'alert';
  else if (pct >= 85) fill.dataset.kind = 'amber';
  else fill.dataset.kind = 'ok';
  if (label) label.textContent = t('tankBarLabel').replace('{pct}', Math.round(p.total / p.tank * 100));
}
function calculate() {
  const error = pick('ws-error');
  if (error) { error.hidden = true; error.textContent = ''; }
  try {
    const households = readInt('households', 1, 5000);
    const litres = readInt('litres', 1, 1000);
    const windows = readInt('windows', 1, 12);
    const duration = readInt('duration', 15, 240);
    const spacing = readInt('spacing', 15, 720);
    const tank = readInt('tank', 1, 10000000, true);
    const supply = readInt('supply', 1, 10000000, true);
    const start = parseTime();
    if (windows > households) throw Error(t('tooManyWindows'));
    if (spacing < duration) throw Error(t('overlap'));
    if (start + (windows - 1) * spacing + duration > 1440) throw Error(t('pastMidnight'));
    const total = window.SIRAI_MATH.waterDemand(households, litres);
    const base = Math.floor(households / windows);
    const extra = households % windows;
    const groups = window.SIRAI_MATH.waterGroups(households, windows, litres);
    const rows = [];
    let offset = 0;
    for (let i = 0; i < windows; i++) {
      const count = groups[i].count;
      const from = offset + 1;
      const to = offset + count;
      rows.push({ number: i + 1, count, from, to, volume: count * litres, start: clock(start + i * spacing), end: clock(start + i * spacing + duration) });
      offset += count;
    }
    current = { households, litres, windows, duration, spacing, tank, supply, total, rows };
    set('ws-daily', fmt(total) + ' L');
    set('ws-window-volume', fmt(Math.round(total / windows)) + ' L');
    set('ws-group-size', extra === 0 ? fmt(base) : fmt(base) + '–' + fmt(base + 1));
    set('ws-tank-ratio', tank === null ? t('notEntered') : (total / tank).toFixed(2) + '×');
    set('ws-supply-ratio', supply === null ? t('notEntered') : (total / supply * 100).toFixed(0) + '%');
    const body = pick('ws-rows');
    if (body) {
      body.replaceChildren();
      const idFn = n => 'HH-' + String(n).padStart(3, '0');
      for (const row of rows) {
        const tr = document.createElement('tr');
        [fmt(row.number), row.start + ' – ' + row.end, idFn(row.from) + (row.to > row.from ? ' – ' + idFn(row.to) : ''), fmt(row.count), fmt(row.volume) + ' L'].forEach(item => {
          const td = document.createElement('td');
          td.textContent = item;
          tr.appendChild(td);
        });
        body.appendChild(tr);
      }
    }
    const warnings = pick('ws-warnings');
    if (warnings) warnings.replaceChildren();
    if (tank !== null && total > tank) addWarning('alert', t('tankWarning'));
    if (supply !== null && total > supply) addWarning('alert', t('supplyWarning') + ' ' + fmt(total - supply) + ' L');
    if (tank === null || supply === null) addWarning('info', t('unknownWarning'));
    if (warnings && !warnings.children.length) addWarning('info', t('verifyWarning'));
    const summaryEl = pick('ws-summary');
    if (summaryEl) {
      summaryEl.innerHTML = buildSummary(current);
      summaryEl.hidden = false;
    }
    updateTankBar(current);
    const fairNote = pick('ws-fairness-note');
    const fairYes = pick('ws-fair-yes');
    if (fairNote && fairYes) fairNote.hidden = fairYes.checked;
  } catch (e) {
    current = null;
    clearOutputs();
    if (error) { error.textContent = e.message; error.hidden = false; }
  }
}
function applyWhatIf(type) {
  if (!current) return;
  if (type === 'lower20') {
    pick('ws-litres').value = String(Math.max(1, Math.round(current.litres * 0.8)));
  } else if (type === 'addWindow') {
    pick('ws-windows').value = String(Math.min(12, current.windows + 1));
  } else if (type === 'spreadDays') {
    pick('ws-litres').value = String(Math.max(1, Math.round(current.litres / 2)));
    set('ws-action-message', t('spreadDaysMsg'));
  }
  calculate();
}
function rowsForCSV() {
  const data = [[t('csvWindow'), t('csvTime'), t('csvHousehold'), t('csvLitres'), t('csvCollected'), t('csvNotes')]];
  for (const g of current.rows) {
    for (let i = g.from; i <= g.to; i++) data.push([String(g.number), g.start + '-' + g.end, 'HH-' + String(i).padStart(3, '0'), String(current.litres), '', '']);
  }
  return data;
}
function csvEscape(value) { return '"' + String(value).replaceAll('"', '""') + '"'; }
function download() {
  if (!current) return;
  if (!window.confirm(t('csvConfirm') || 'This CSV includes collection times. Store it privately. Continue?')) return;
  const content = '\uFEFF' + rowsForCSV().map(row => row.map(csvEscape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'SIRAI_WaterShare_Draft_Schedule.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  set('ws-action-message', t('downloaded'));
}
function summaryText() {
  const p = current;
  return ['SIRAI WaterShare | ' + t('summaryDraft'), t('households') + ': ' + p.households, t('litres') + ': ' + p.litres + ' L', t('daily') + ': ' + p.total + ' L', t('windows') + ': ' + p.windows, ...p.rows.map(g => t('window') + ' ' + g.number + ': HH-' + String(g.from).padStart(3, '0') + '–HH-' + String(g.to).padStart(3, '0') + ', ' + g.volume + ' L'), t('summaryCaution')].join('\n');
}
async function copy() {
  if (!current) return;
  try {
    if (!navigator.clipboard?.writeText) throw Error('no clipboard');
    await navigator.clipboard.writeText(summaryText());
    set('ws-action-message', t('copied'));
  } catch (e) { set('ws-action-message', t('copyFailed')); }
}
function printPlan() { if (current) window.print(); }
function reset() {
  for (const k of keys) { const el = pick('ws-' + k); if (el) el.value = defaults[k]; }
  set('ws-action-message', '');
  const fairYes = pick('ws-fair-yes');
  if (fairYes) fairYes.checked = true;
  calculate();
}
for (const k of keys) { const el = pick('ws-' + k); if (el) el.addEventListener('input', calculate); }
pick('ws-reset')?.addEventListener('click', reset);
pick('ws-example')?.addEventListener('click', () => {
  const msgs = { en: 'Replace the current numbers with a fictional example? No real household data is used.', ar: 'هل تريد استبدال الأرقام الحالية بمثال افتراضي؟ لا تُستخدم بيانات أسر حقيقية.', fr: 'Remplacer les valeurs par un exemple fictif ? Aucune donnée réelle.', de: 'Werte durch ein fiktives Beispiel ersetzen? Keine echten Haushaltsdaten.' };
  if (!window.confirm(msgs[locale()] || msgs.en)) return;
  const demo = { households: '24', litres: '35', windows: '3', start: '07:00', duration: '60', spacing: '150', tank: '1000', supply: '900' };
  for (const [k, v] of Object.entries(demo)) { const el = pick('ws-' + k); if (el) el.value = v; }
  calculate();
  const done = { en: 'Fictional example loaded. The schedule requires local agreement and a verified water supply.', ar: 'تم تحميل مثال افتراضي. يتطلب الجدول اتفاق المشاركين والتحقق من مصدر المياه.', fr: 'Exemple fictif chargé. Vérifiez l’approvisionnement et obtenez un accord local.', de: 'Fiktives Beispiel geladen. Versorgung prüfen und vor Ort abstimmen.' };
  set('ws-action-message', done[locale()] || done.en);
});
pick('ws-csv')?.addEventListener('click', download);
pick('ws-copy')?.addEventListener('click', copy);
pick('ws-print')?.addEventListener('click', printPlan);
pick('ws-share')?.addEventListener('click', () => {
  if (!current) return;
  const p = current;
  const lines = ['SIRAI WaterShare | DRAFT / مسودة', 'Households / الأسر: ' + p.households, 'Total daily water / إجمالي المياه يومياً: ' + p.total + ' L', 'Collection groups / مجموعات التوزيع: ' + p.windows, ...p.rows.map(g => 'Group ' + g.number + ' / المجموعة ' + g.number + ': ' + g.count + ' households, ' + g.volume + ' L'), 'Times and locations are deliberately excluded for safety. Agree any details privately, only if safe.'];
  window.SIRAI_SHARE?.share(lines.join('\n'));
});
pick('ws-whatif-lower')?.addEventListener('click', () => applyWhatIf('lower20'));
pick('ws-whatif-window')?.addEventListener('click', () => applyWhatIf('addWindow'));
pick('ws-whatif-days')?.addEventListener('click', () => applyWhatIf('spreadDays'));
pick('ws-fair-yes')?.addEventListener('change', calculate);
pick('ws-fair-no')?.addEventListener('change', calculate);
document.querySelectorAll('[data-lang-select]').forEach(el => el.addEventListener('change', renderLabels));
renderLabels();
})();
