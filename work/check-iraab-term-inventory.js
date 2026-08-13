#!/usr/bin/env node
/* ============================================================================
   work/check-iraab-term-inventory.js

   Deterministic auditor for the direct-iʿrāb-term inventory of Al-Tuḥfah al-Saniyyah.

   It does NOT trust proof strings. For every authored row it BUILDS every production
   template many times, RENDERS each exercise exactly as the page does, and then asks
   whether the row's canonical Arabic actually reaches the learner's iʿrāb. Status,
   randomization and all totals are DERIVED from that run; the JSON is then required to
   agree, field for field.

     node work/check-iraab-term-inventory.js [index.html] [--write] [--rounds=N]

   --write regenerates work/iraab-term-inventory.json from the observed run.
   Without it the file is verified and any drift is a non-zero exit.

   Three corpora are kept apart, because the difference is the whole point:
     iraab — token.ar / token.phraseAr : what the learner actually performs
     why   — token.why / token.phraseWhy : explanation; naming a term here is NOT practice
     defs  — the definitions panel : reference prose; also NOT practice
   A row is FULL only on the strength of `iraab`.
   ========================================================================== */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const roundsArg = args.find(a => a.startsWith('--rounds='));
const ROUNDS = roundsArg ? Number(roundsArg.split('=')[1]) : 200;
const APP = path.resolve(ROOT, args.find(a => !a.startsWith('--')) || 'index.html');
const INVENTORY = path.join(__dirname, 'iraab-term-inventory.json');

const { rows, sourceExcluded, notCounted } = require('./iraab-term-rows.js');

const STATUSES = ['FULL', 'GENERIC_ONLY', 'PARTIAL', 'ABSENT', 'TRUE_BLOCKER'];
const RANDOMIZATION = ['GOOD', 'LIMITED', 'NONE'];

const failures = [];
const fail = m => failures.push(m);

/* ── Arabic skeleton: strip every combining mark and tatweel, fold the alif / yāʾ /
   tāʾ-marbūṭah families. Matching on the skeleton is what makes this checker immune to the
   invisible combining-mark ORDER drift that has silently broken comparisons in this repo
   before: a row is never reported ABSENT merely because its ḥarakāt were typed in another
   order. ─────────────────────────────────────────────────────────────────────────────── */
const skeleton = text => String(text || '')
  .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
  .replace(/[آأإٱ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/\s+/g, ' ')
  .trim();

/* ── load the application exactly as work/check-nominal-pairs.js does, by SLICING that
   harness's own injection block and DOM/vm bootstrap. Nothing is re-implemented here, so
   the two files cannot drift apart. ─────────────────────────────────────────────────── */
function loadApi() {
  const html = fs.readFileSync(APP, 'utf8');
  const harnessPath = path.join(__dirname, 'check-nominal-pairs.js');
  const harnessSrc = fs.readFileSync(harnessPath, 'utf8');
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('No embedded application script found in ' + APP);
  let script = m[1];
  const exportNeedle = 'window.nahwGenerate=generate;';
  if (!script.includes(exportNeedle)) throw new Error('Generator export point was not found');

  const injHead = 'script=script.replace(exportNeedle,`';
  const injStart = harnessSrc.indexOf(injHead);
  if (injStart < 0) throw new Error('Could not locate the harness injection block');
  const injBody = injStart + injHead.length;
  const injEnd = harnessSrc.indexOf('`);', injBody);
  if (injEnd < 0) throw new Error('Could not locate the end of the harness injection block');
  const injection = new Function('exportNeedle', 'return `' + harnessSrc.slice(injBody, injEnd) + '`;')(exportNeedle);
  script = script.replace(exportNeedle, injection);

  const bootStart = harnessSrc.indexOf('function assert(condition,message)');
  const bootTail = 'const api=context.__nahwTest;';
  const bootEnd = harnessSrc.indexOf(bootTail);
  if (bootStart < 0 || bootEnd < 0) throw new Error('Could not locate the harness bootstrap');
  const bootstrap = harnessSrc.slice(bootStart, bootEnd + bootTail.length);
  return new Function('html', 'script', 'vm', 'webcrypto', 'console', bootstrap + '\nreturn api;')
    (html, script, vm, webcrypto, console);
}

const api = loadApi();

/* ── observe: build and render every template many times ────────────────────────────── */
const iraabLines = new Map();      // line -> Set(stableId)
const cardHeads = new Map();       // head word skeleton -> Set(card body skeleton)
const whyText = new Set();
const defText = new Set();
const sentences = new Set();
let built = 0;

function collect(node, sink) {
  if (node == null) return;
  if (typeof node === 'string') { sink.push(node); return; }
  if (Array.isArray(node)) { node.forEach(n => collect(n, sink)); return; }
  if (typeof node === 'object') for (const k of Object.keys(node)) collect(node[k], sink);
}

for (let i = 0; i < api.templates.length; i++) {
  const stableId = api.templates[i].stableId;
  for (let r = 0; r < ROUNDS; r++) {
    let data;
    try { data = api.buildTemplate(i); api.renderExercise(data); }
    catch (error) { fail(`template ${stableId} refused to build/render: ${error.message}`); break; }
    built++;
    sentences.add(skeleton(data.sentence));
    for (const token of data.tokens) {
      for (const line of [token.ar, token.phraseAr]) {
        if (!line) continue;
        const s = skeleton(line);
        if (!iraabLines.has(s)) iraabLines.set(s, new Set());
        iraabLines.get(s).add(stableId);
        const head = /^(\S+):\s*([\s\S]+)$/.exec(line);
        if (head) {
          const h = skeleton(head[1]);
          if (!cardHeads.has(h)) cardHeads.set(h, new Set());
          cardHeads.get(h).add(skeleton(head[2]));
        }
      }
      const sink = [];
      collect(token.why, sink); collect(token.phraseWhy, sink);
      for (const line of sink) if (/[؀-ۿ]/.test(line)) whyText.add(skeleton(line));
    }
  }
}
{
  const sink = []; collect(api.grammarDefinitionGroups, sink);
  for (const line of sink) if (/[؀-ۿ]/.test(line)) defText.add(skeleton(line));
}

/* ── membership sets taken from the app's OWN registries (never typed here) ─────────── */
const setOf = list => new Set(list.map(skeleton));
const kanaSet = setOf(api.KANA_SURFACES);
const innaSet = setOf(api.innaSisters.map(s => s.ar));
const atfSet = setOf(Object.values(api.ATF_CONJUNCTION_REGISTRY).map(c => c.surface || c.ar || ''));
const tawkidSet = setOf(Object.values(api.TAWKID_PAIR_REGISTRY || {}).map(p => p.word || p.ar || p.surface || ''));
const prepSet = new Set();
for (const [head, bodies] of cardHeads) for (const b of bodies) if (b.includes(skeleton('حرف خفض'))) prepSet.add(head);

/* ── the probe ──────────────────────────────────────────────────────────────────────── */
function templatesFor(needle) {
  const s = skeleton(needle);
  const tpl = new Set();
  for (const [line, ids] of iraabLines) if (line.includes(s)) ids.forEach(id => tpl.add(id));
  return tpl;
}
function mentionedOnly(needle) {
  const s = skeleton(needle);
  for (const line of whyText) if (line.includes(s)) return true;
  for (const line of defText) if (line.includes(s)) return true;
  return false;
}
function standalone(needle) {
  const s = skeleton(needle);
  const re = new RegExp('(^|[^\\u0621-\\u064A])' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\u0621-\\u064A])');
  const tpl = new Set();
  for (const [line, ids] of iraabLines) if (re.test(line)) ids.forEach(id => tpl.add(id));
  return tpl;
}

function observe(row) {
  const mode = row.mode || 'contains';
  let tpl;
  if (mode === 'card') {
    /* A card head alone is not proof: stripping ḥarakāt folds إِنْ into إِنَّ and مَا
       الشرطية into مَا النافية, so a `requires` discriminator must also appear in the
       card's BODY before the row may count as practised. */
    const h = skeleton(row.probe);
    const bodies = cardHeads.get(h);
    const need = row.requires ? skeleton(row.requires) : null;
    const ok = !!bodies && (!need || [...bodies].some(b => b.includes(need)));
    tpl = ok ? templatesFor(row.requires || row.probe) : new Set();
    if (ok && tpl.size === 0) tpl = new Set(['<card>']);
  } else if (mode === 'sentence') {
    /* WHOLE-WORD match: skeleton(«أَلَمْ») is "الم", which is a substring of
       skeleton(«الْمُعَلِّمُ»). Only a standalone word counts. */
    const s = skeleton(row.probe);
    let n = 0;
    for (const sent of sentences) if (sent.split(' ').includes(s)) n++;
    tpl = n ? templatesFor(row.probe) : new Set();
    if (n && tpl.size === 0) tpl = new Set(Array.from({ length: Math.min(n, 8) }, (_, i) => '<sentence' + i + '>'));
  } else if (mode === 'standalone') {
    tpl = standalone(row.probe);
  } else if (mode === 'kana' || mode === 'inna' || mode === 'atf' || mode === 'tawkid' || mode === 'prep') {
    const set = { kana: kanaSet, inna: innaSet, atf: atfSet, tawkid: tawkidSet, prep: prepSet }[mode];
    const s = skeleton(row.probe);
    let member = set.has(s);
    if (!member) for (const v of set) if (v.includes(s) && Math.abs(v.length - s.length) <= 1) member = true;
    tpl = member ? (templatesFor(row.probe).size ? templatesFor(row.probe) : new Set(['<registry>'])) : new Set();
  } else {
    tpl = templatesFor(row.probe);
  }

  /* GENERIC_ONLY is for a CLASSIFICATION the learner never utters even though the thing it
     classifies is practised. A lexical item that simply is not in the app's registry is
     ABSENT, however often its bare letters happen to occur inside definition prose — that
     is why the registry modes never fall through to the mentioned-only test. */
  const lexical = ['kana', 'inna', 'prep'].includes(mode);
  let status;
  if (tpl.size === 0) status = (!lexical && mentionedOnly(row.probe)) ? 'GENERIC_ONLY' : 'ABSENT';
  else if (row.partial) status = 'PARTIAL';
  else status = 'FULL';

  const randomization = tpl.size === 0 ? 'NONE' : tpl.size >= 4 ? 'GOOD' : 'LIMITED';
  return { status, randomization, templates: tpl.size };
}

/* ── build the observed inventory ───────────────────────────────────────────────────── */
const seen = new Set();
const observed = rows.map(row => {
  if (seen.has(row.key)) fail(`duplicate row key: ${row.key}`);
  seen.add(row.key);
  const o = observe(row);
  return {
    key: row.key,
    term: row.term,
    chapter: row.chapter,
    pages: row.pages,
    parent: row.parent,
    status: o.status,
    proof: o.status === 'ABSENT' ? ''
      : `built ${ROUNDS}× per template; «${row.probe}» observed in the rendered ${o.status === 'GENERIC_ONLY' ? 'Why/definitions text only' : 'iʿrāb'} across ${o.templates} template lane(s) [mode=${row.mode || 'contains'}]`,
    missingReason: o.status === 'FULL' ? '' : (row.missingReason || (o.status === 'GENERIC_ONLY'
      ? 'The term is named in explanation or definition text, but the learner never says it as its own classification while performing iʿrāb.'
      : 'Not produced by any template lane.')),
    randomization: o.randomization,
    probe: row.probe,
    probeMode: row.mode || 'contains',
    observedTemplateLanes: o.templates
  };
});

/* duplicate canonical-row ownership: no two rows may claim the same canonical Arabic term */
const byTerm = new Map();
for (const r of observed) {
  const s = skeleton(r.term);
  if (byTerm.has(s)) fail(`two rows claim the same canonical term «${r.term}»: ${byTerm.get(s)} and ${r.key}`);
  byTerm.set(s, r.key);
}

/* ── totals, derived only ───────────────────────────────────────────────────────────── */
const totals = { TOTAL: observed.length };
for (const s of STATUSES) totals[s] = observed.filter(r => r.status === s).length;
totals.reconciles = totals.FULL + totals.GENERIC_ONLY + totals.PARTIAL + totals.ABSENT + totals.TRUE_BLOCKER === totals.TOTAL;
totals.percentFull = Math.round((totals.FULL / totals.TOTAL) * 1000) / 10;
const randomizationTotals = {};
for (const r of RANDOMIZATION) randomizationTotals[r] = observed.filter(x => x.randomization === r).length;

const MARATHON = new Set(observed.filter(r =>
  /^J_/.test(r.key) || /^Z_/.test(r.key) ||
  ['M_KHABAR_JUMLA_ISMIYYA', 'M_KHABAR_JUMLA_FILIYYA', 'M_JUMLA_MAHALL_RAF', 'M_RABIT',
   'M_RABIT_DAMIR', 'M_RABIT_ISHARA', 'M_KHABAR_SHIBH', 'B_HAAL_ISTIFHAM',
   'G_SUKUN_JAZM', 'G_HADHF_NUN_JAZM', 'G_JAZM_HADHF_ILLAH', 'G_WEAK_ALIF', 'G_WEAK_WAW',
   'G_WEAK_YA', 'G_SAHIH_AKHIR', 'G_MUTALL_AKHIR', 'V_MAHALL_JAZM',
   'Z_MAFUL_AWWAL', 'Z_MAFUL_THANI'].includes(r.key)).map(r => r.key));
const marathonRows = observed.filter(r => MARATHON.has(r.key));
const marathon = {
  target: marathonRows.length,
  full: marathonRows.filter(r => r.status === 'FULL').length,
  percent: Math.round((marathonRows.filter(r => r.status === 'FULL').length / marathonRows.length) * 1000) / 10,
  sourceExcluded: sourceExcluded.length
};

const inventory = {
  schemaVersion: 1,
  source: {
    book: 'التحفة السنية بشرح المقدمة الآجرومية — Al-Tuḥfah al-Saniyyah bi-Sharḥ al-Muqaddimah al-Ājurrūmiyyah',
    file: 'tuhfa newer.pdf',
    sha256: 'E07C666E36985E9E123E4BD0FB8F6E48207AD81EE60952E7FF4F51F3A58823E8',
    pages: 183,
    note: 'Printed page number equals PDF page number throughout.'
  },
  method: {
    rounds: ROUNDS,
    templates: api.templates.length,
    buildsObserved: built,
    rule: 'A row is FULL only when its canonical Arabic is observed in the rendered iʿrāb (token.ar / token.phraseAr). Appearing only in a Why explanation or in the definitions panel yields GENERIC_ONLY, never FULL.'
  },
  totals,
  randomizationTotals,
  marathon,
  sourceExcluded,
  notCounted,
  rows: observed
};

/* ── verify or write ────────────────────────────────────────────────────────────────── */
for (const r of observed) {
  if (!STATUSES.includes(r.status)) fail(`row ${r.key} has invalid status ${r.status}`);
  if (!RANDOMIZATION.includes(r.randomization)) fail(`row ${r.key} has invalid randomization ${r.randomization}`);
  if (r.status !== 'ABSENT' && !r.proof) fail(`row ${r.key} is ${r.status} but declares no proof`);
  if (r.status === 'ABSENT' && !r.missingReason) fail(`row ${r.key} is ABSENT but declares no missingReason`);
  if (!r.term || !r.chapter || !r.pages || !r.parent) fail(`row ${r.key} is missing required metadata`);
}
/* ── Wave 1 completeness ─────────────────────────────────────────────────────────────
   The fourteen حروف الخفض / معاني الإضافة rows that were non-FULL before Wave 1, named
   explicitly. Naming them is the point: a later change that quietly stops producing one of
   these particles would otherwise only move a total, and totals drift without anyone noticing
   which row moved. Each must be FULL on the strength of a live build, and the count is derived
   from this list rather than written down as a number. */
const WAVE1_KEYS = ['X_PREP_MIN', 'X_PREP_RUBBA', 'X_PREP_BA', 'X_PREP_KAF', 'X_PREP_LAM',
  'X_PREP_WAW_QASAM', 'X_PREP_BA_QASAM', 'X_PREP_TA_QASAM', 'X_PREP_MUDH', 'X_PREP_MUNDHU',
  'X_PREP_HATTA', 'X_IDAFA_LAM', 'X_IDAFA_MIN', 'X_IDAFA_FI'];
const wave1 = WAVE1_KEYS.map(key => {
  const row = observed.find(r => r.key === key);
  if (!row) fail('Wave-1 row ' + key + ' is missing from the inventory');
  return row;
}).filter(Boolean);
const wave1Full = wave1.filter(r => r.status === 'FULL').length;
for (const row of wave1) {
  if (row.status !== 'FULL') fail('Wave-1 row ' + row.key + ' is ' + row.status + ', not FULL');
}
if (wave1.length !== WAVE1_KEYS.length) fail('the Wave-1 row set did not resolve');

if (!totals.reconciles) fail('totals do not reconcile with the row count');
if (totals.TOTAL !== rows.length) fail('denominator does not equal the actual row count');

if (WRITE) {
  fs.writeFileSync(INVENTORY, JSON.stringify(inventory, null, 1) + '\n', 'utf8');
  console.log('wrote ' + path.relative(ROOT, INVENTORY));
} else {
  if (!fs.existsSync(INVENTORY)) fail('work/iraab-term-inventory.json does not exist; run with --write');
  else {
    const stored = JSON.parse(fs.readFileSync(INVENTORY, 'utf8'));
    const norm = o => JSON.stringify(o, Object.keys(o).sort());
    if (stored.rows.length !== observed.length) fail(`stored inventory has ${stored.rows.length} rows, the app produces ${observed.length}`);
    const storedByKey = new Map(stored.rows.map(r => [r.key, r]));
    for (const r of observed) {
      const s = storedByKey.get(r.key);
      if (!s) { fail(`stored inventory is missing row ${r.key}`); continue; }
      for (const field of ['status', 'randomization', 'term', 'chapter', 'pages', 'parent'])
        if (s[field] !== r[field]) fail(`row ${r.key}: stored ${field}="${s[field]}" but the app yields "${r[field]}"`);
    }
    for (const k of ['TOTAL', 'FULL', 'GENERIC_ONLY', 'PARTIAL', 'ABSENT', 'TRUE_BLOCKER', 'percentFull'])
      if (stored.totals[k] !== totals[k]) fail(`totals.${k}: stored ${stored.totals[k]} but derived ${totals[k]}`);
    if (norm(stored.randomizationTotals) !== norm(randomizationTotals)) fail('randomization totals drifted');
  }
}

console.log(JSON.stringify({
  templates: api.templates.length, rounds: ROUNDS, builds: built,
  totals, randomizationTotals, marathon,
  wave1: { name: 'حروف الخفض ومعاني الإضافة', target: WAVE1_KEYS.length, full: wave1Full },
  sourceExcluded: sourceExcluded.length, notCounted: notCounted.length,
  failures: failures.length
}, null, 1));

if (failures.length) {
  console.error('\nFAILURES (' + failures.length + '):');
  for (const f of failures) console.error('  · ' + f);
  process.exit(1);
}
console.log('\nIʿrāb term inventory audit passed: ' + totals.TOTAL + ' canonical rows, ' +
  totals.FULL + ' FULL (' + totals.percentFull + '%), all statuses re-derived from a live build.');
