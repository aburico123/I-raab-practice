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
      /* The rendered iʿrāb has THREE surfaces, not two. Besides the whole-word card
         (token.ar) and the combined-analysis card (token.phraseAr), every internal component
         renders its OWN iʿrāb line: `<div class="component-iraab" lang="ar">` at the single
         answers-panel render site, sitting between the whole-word iʿrāb and the Why block.
         That div is iʿrāb the learner performs, not explanation about it, so a term that
         reaches it IS practised. Omitting it silently under-counted every word-internal
         term: وَاوُ الْجَمَاعَةِ scored FULL only by the accident of also being named in a
         rābiṭ phrase sentence, while its own component card — the one place a learner ever
         parses that wāw — did not count at all. The why/definition corpora are untouched, so
         the distinction this file exists to enforce (performing a term vs. being told it) is
         unchanged. Component lines are `«letter» name: body`, which the card-head regex
         below cannot match, so `cardHeads` and the particle sets derived from it are
         unaffected. */
      const componentIraab = (token.components || []).map(component => component.ar);
      for (const line of [token.ar, token.phraseAr, ...componentIraab]) {
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
const KANA_VERB_SET = setOf(api.KANA_VERB_SURFACES || []);
const innaSet = setOf(api.innaSisters.map(s => s.ar));
const atfSet = setOf(Object.values(api.ATF_CONJUNCTION_REGISTRY).map(c => c.surface || c.ar || ''));
const tawkidSet = setOf(Object.values(api.TAWKID_PAIR_REGISTRY || {}).map(p => p.word || p.ar || p.surface || ''));
const prepSet = new Set();
for (const [head, bodies] of cardHeads) for (const b of bodies) if (b.includes(skeleton('حرف خفض'))) prepSet.add(head);

/* ── the probe ──────────────────────────────────────────────────────────────────────── */
/* Wave 4 STRENGTHENS the plain `contains` probe with the same discriminator `card` mode already
   had, and for the same reason: a short term can sit inside a line that is about something else.
   «اسْمُ إِشَارَةٍ» is one — the demonstrative باب النعت now produces as a mubtadaʾ is NOT the
   demonstrative standing as a rābiṭ between a mubtadaʾ and its sentence khabar, and without a
   discriminator the first would have scored the second FULL. When a row declares `requires`, the
   SAME rendered line must carry both strings; a row that declares none behaves exactly as before. */
function templatesFor(needle, requires) {
  const s = skeleton(needle);
  const need = requires ? skeleton(requires) : '';
  const tpl = new Set();
  for (const [line, ids] of iraabLines) {
    if (!line.includes(s)) continue;
    if (need && !line.includes(need)) continue;
    ids.forEach(id => tpl.add(id));
  }
  return tpl;
}
function mentionedOnly(needle, requires) {
  const s = skeleton(needle);
  const need = requires ? skeleton(requires) : '';
  for (const line of whyText) if (line.includes(s) && (!need || line.includes(need))) return true;
  for (const line of defText) if (line.includes(s) && (!need || line.includes(need))) return true;
  return false;
}
function standalone(needle) {
  const s = skeleton(needle);
  const re = new RegExp('(^|[^\\u0621-\\u064A])' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\u0621-\\u064A])');
  const tpl = new Set();
  for (const [line, ids] of iraabLines) if (re.test(line)) ids.forEach(id => tpl.add(id));
  return tpl;
}
/* Does this needle ever occur as a WORD, rather than as letters buried inside a longer one?
   skeleton() strips every ḥarakah, so a short probe can be swallowed whole: «إِيَّا» reduces to
   "ايا", which is a substring of «أَيَّانَ» — and that coincidence alone once scored the attached
   object-pronoun row FULL even though no إيا pronoun exists anywhere in the app. Used by the
   probe-integrity invariant below, which is what turns that class of silent false positive into
   a loud failure. */
/* The left boundary may be a one-letter proclitic — وَ/فَ/لَ/بِ/كَ are written joined to the word
   that follows, so «وَنَعْتٌ حَقِيقِيٌّ» really is the term نَعْتٌ حَقِيقِيٌّ and must not be read
   as a coincidence. The RIGHT boundary admits no such licence: every false positive this check
   exists to catch is a probe continuing into a different word (كِلَا→كَلَام, إِيَّا/أَيَا→أَيَّانَ). */
const PROCLITIC = '[\\u0648\\u0641\\u0644\\u0628\\u0643]?';
function probeOccurrence(needle) {
  const s = skeleton(needle);
  if (!s) return { standalone: false, swallowedBy: '' };
  const re = new RegExp('(^|[^\\u0621-\\u064A])' + PROCLITIC + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\u0621-\\u064A])');
  let swallowedBy = '';
  for (const line of iraabLines.keys()) {
    if (re.test(line)) return { standalone: true, swallowedBy: '' };
    if (!swallowedBy) {
      const at = line.indexOf(s);
      if (at >= 0) {
        let start = at, end = at + s.length;
        while (start > 0 && line[start - 1] !== ' ') start--;
        while (end < line.length && line[end] !== ' ') end++;
        swallowedBy = line.slice(start, end);
      }
    }
  }
  return { standalone: false, swallowedBy };
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
    /* Wave 3 STRENGTHENS this. It used to read: membership in the app's registry, and if the term
       never actually reached an iʿrāb line, a <registry> sentinel stood in for one — so a row could
       be FULL on the strength of being LISTED. That is exactly the proof the completion standard
       rejects: a registry entry is not something a learner can encounter. Membership is now a
       PRECONDITION, and the observed iʿrāb lanes are the proof. A registered term nothing produces
       is ABSENT, and says so.
       Removing the sentinel changed no existing row: every lexical row that was FULL already had
       real lanes. It is here so that the next one cannot slip through. */
    tpl = member ? templatesFor(row.probe) : new Set();
  } else {
    tpl = templatesFor(row.probe, row.requires);
  }

  /* GENERIC_ONLY is for a CLASSIFICATION the learner never utters even though the thing it
     classifies is practised. A lexical item that simply is not in the app's registry is
     ABSENT, however often its bare letters happen to occur inside definition prose — that
     is why the registry modes never fall through to the mentioned-only test. */
  const lexical = ['kana', 'inna', 'prep'].includes(mode);
  let status;
  if (tpl.size === 0) {
    /* TRUE_BLOCKER is the one status a row may ASK for, and it is granted only when the term is
       genuinely not produced — a declaration can never mask a row that does reach the learner,
       because this branch is unreachable once anything is observed. It outranks GENERIC_ONLY on
       purpose: "the source cannot support this" is a stronger and more useful statement than
       "the term appears in explanation text". The declaration must carry its written proof, and
       the assertions below reject a short or missing one. */
    status = row.trueBlocker ? 'TRUE_BLOCKER'
      /* The discriminator is deliberately NOT applied here. It exists to stop one reading of a term
         from crediting another with PRACTICE; being MENTIONED is a weaker claim, and the Why/defs
         corpora word the same fact differently («مِنْ رَابِطٍ» rather than «الرَّابِطُ»), so applying
         it here would only turn an honest GENERIC_ONLY into a misleading ABSENT. */
      : (!lexical && mentionedOnly(row.probe)) ? 'GENERIC_ONLY' : 'ABSENT';
  }
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
    proof: ['ABSENT', 'TRUE_BLOCKER'].includes(o.status) ? ''
      : `built ${ROUNDS}× per template; «${row.probe}» observed in the rendered ${o.status === 'GENERIC_ONLY' ? 'Why/definitions text only' : 'iʿrāb'} across ${o.templates} template lane(s) [mode=${row.mode || 'contains'}]`,
    missingReason: o.status === 'FULL' ? '' : (o.status === 'TRUE_BLOCKER' ? row.trueBlocker : row.missingReason || (o.status === 'GENERIC_ONLY'
      ? 'The term is named in explanation or definition text, but the learner never says it as its own classification while performing iʿrāb.'
      : 'Not produced by any template lane.')),
    randomization: o.randomization,
    probe: row.probe,
    probeMode: row.mode || 'contains',
    probeRequires: row.requires || '',
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
  if (!['ABSENT', 'TRUE_BLOCKER'].includes(r.status) && !r.proof) fail(`row ${r.key} is ${r.status} but declares no proof`);
  if (r.status === 'ABSENT' && !r.missingReason) fail(`row ${r.key} is ABSENT but declares no missingReason`);
  /* A blocker is a CLAIM, so it must be argued, not asserted: the row has to carry a written proof
     long enough to name the source pages it checked and the architectural rule it hit. And a row
     that declares a blocker while actually being produced is a stale declaration, not a blocker. */
  if (r.status === 'TRUE_BLOCKER' && (r.missingReason || '').length < 200) {
    fail(`row ${r.key} is TRUE_BLOCKER but its proof is missing or too short to be a proof`);
  }
  const authored = rows.find(x => x.key === r.key);
  if (authored && authored.trueBlocker && r.status !== 'TRUE_BLOCKER') {
    fail(`row ${r.key} declares a true blocker but the app yields ${r.status}; the declaration is stale and must be removed`);
  }
  if (!r.term || !r.chapter || !r.pages || !r.parent) fail(`row ${r.key} is missing required metadata`);
}
/* ── probe integrity ────────────────────────────────────────────────────────────────────
   A bare `contains` probe that is credited as practised must occur at least once as its own
   word. Without this, any probe short enough to hide inside an unrelated word scores itself
   FULL forever and nobody can see why: that is exactly how «إِيَّا» rode along inside «أَيَّانَ».
   A row that genuinely needs different matching says so with an explicit mode — which is the
   fix this check forces, rather than silently loosening what FULL means. */
for (const r of observed) {
  /* Only a row CREDITED with practice has something to prove here. ABSENT and GENERIC_ONLY both
     mean the iʿrāb corpus matched nothing at all, so there is no occurrence to classify. */
  /* Wave 3 widens this from the "contains" mode alone to every mode whose evidence is a SUBSTRING
     match. The registry modes end in templatesFor(), which is that same substring test, so «كَانَ»
     buried inside «الْمَكَانِ» would have credited the row exactly as «إِيَّا» inside «أَيَّانَ» once
     did. The five two-word sisters make the risk concrete: their probes are long enough to look
     unmistakable and are matched just as loosely. The "standalone" mode already enforces this by
     construction, and "card" and "sentence" carry their own whole-word tests. */
  const SUBSTRING_MODES = ['contains', 'kana', 'inna', 'atf', 'tawkid', 'prep'];
  if (!SUBSTRING_MODES.includes(r.probeMode) || !['FULL', 'PARTIAL'].includes(r.status)) continue;
  const occurrence = probeOccurrence(r.probe);
  if (!occurrence.standalone)
    fail(`row ${r.key} is ${r.status} but «${r.probe}» never occurs as a standalone term: every match ` +
      `is letters inside a longer word (e.g. «${occurrence.swallowedBy}»), so the status is a false ` +
      `positive. Give the row an explicit mode rather than loosening what FULL means.`);
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

/* ── Wave 2 completeness ─────────────────────────────────────────────────────────────
   The nine باب الفاعل / pronoun rows that were non-FULL before Wave 2, named for the same reason
   Wave 1's are named. Eight had to become FULL on the strength of a live build. The ninth,
   ضَمِيرٌ مُنْفَصِلٌ, is a proved source blocker and is REQUIRED to stay TRUE_BLOCKER: counting it
   as done would be a lie, and quietly letting it become FULL would mean someone had invented the
   bināʾ the source withholds — so this pin fails in BOTH directions. Every row is accounted for,
   and target == full + blocked is asserted rather than written down. */
const WAVE2_KEYS = ['M_TAA_FAIL_1S', 'M_TAA_FAIL_2MS', 'M_TAA_FAIL_2FS', 'M_NAA_FAILIN',
  'M_YAA_MUKHATABA', 'M_TAA_TANIITH', 'M_ALIF_FARIQA', 'M_NUUN_WIQAYA', 'M_DAMIR_MUNFASIL'];
const WAVE2_BLOCKED = ['M_DAMIR_MUNFASIL'];
const wave2 = WAVE2_KEYS.map(key => {
  const row = observed.find(r => r.key === key);
  if (!row) fail('Wave-2 row ' + key + ' is missing from the inventory');
  return row;
}).filter(Boolean);
for (const row of wave2) {
  const mustBlock = WAVE2_BLOCKED.includes(row.key);
  const expected = mustBlock ? 'TRUE_BLOCKER' : 'FULL';
  if (row.status !== expected) {
    fail('Wave-2 row ' + row.key + ' is ' + row.status + ', not ' + expected +
      (mustBlock ? ' — a blocked row that changes status needs its proof re-examined, not its pin edited' : ''));
  }
}
const wave2Full = wave2.filter(r => r.status === 'FULL').length;
const wave2Blocked = wave2.filter(r => r.status === 'TRUE_BLOCKER').length;
if (wave2.length !== WAVE2_KEYS.length) fail('the Wave-2 row set did not resolve');
if (wave2Full + wave2Blocked !== WAVE2_KEYS.length) fail('Wave-2 rows are not all either FULL or blocked');
/* Every Wave-2 row lives in the chapter this wave was scoped to, so a later edit cannot quietly
   move an unrelated row into the pin to make the count come out. */
for (const row of wave2) {
  if (!/^(باب الفاعل|المقدمات)/.test(row.chapter) && row.parent !== 'علامات الفعل') {
    fail('Wave-2 row ' + row.key + ' is not in the wave\'s scope: ' + row.chapter);
  }
}

/* ── Wave 3 completeness ─────────────────────────────────────────────────────────────
   The seven كان وأخواتها rows that were non-FULL before Wave 3, named for the same reason Waves 1
   and 2 name theirs: a later change that quietly stops producing one of these would otherwise only
   move a total. All seven had to become FULL on a live build, and NONE of them is permitted to be a
   blocker — the source produces every member of this family, so a blocker here would mean something
   was withdrawn rather than proved. Two properties are asserted beyond the status, because they are
   what makes these rows honest rather than merely present:
     · every row is in this wave's own chapter, so an unrelated row cannot be moved into the pin;
     · the five CONDITIONAL sisters must still be conditional in the app's own registry, so the
       count of unconditional operators can never grow by relabelling one of them. */
const WAVE3_KEYS = ['K_AMSA', 'K_ADHA', 'K_MA_ZALA', 'K_MA_INFAKKA', 'K_MA_FATIA', 'K_MA_BARIHA', 'K_MA_DAMA'];
const wave3 = WAVE3_KEYS.map(key => {
  const row = observed.find(r => r.key === key);
  if (!row) fail('Wave-3 row ' + key + ' is missing from the inventory');
  return row;
}).filter(Boolean);
for (const row of wave3) {
  if (row.status !== 'FULL') fail('Wave-3 row ' + row.key + ' is ' + row.status + ', not FULL');
  if (!/^باب العوامل الداخلة على المبتدأ والخبر/.test(row.chapter)) {
    fail('Wave-3 row ' + row.key + ' is not in the wave\'s scope: ' + row.chapter);
  }
  if (row.parent !== 'كان وأخواتها') fail('Wave-3 row ' + row.key + ' left the كان family: ' + row.parent);
}
const wave3Full = wave3.filter(r => r.status === 'FULL').length;
if (wave3.length !== WAVE3_KEYS.length) fail('the Wave-3 row set did not resolve');
if (wave3Full !== WAVE3_KEYS.length) fail('Wave-3 is not complete: ' + wave3Full + ' of ' + WAVE3_KEYS.length);
/* p. 108's own division, read back out of the app: 8 unconditional + 4 نفي-conditional + 1
   مَا المصدرية الظرفية = the 13 the matn enumerates. Asserted here as well as at load time because
   this is the property that would break silently if a conditional sister were ever produced bare. */
{
  const sisters = api.kanaSisters || [];
  const conditional = sisters.filter(s => s.condition);
  if (sisters.length !== 13) fail('the kāna family holds ' + sisters.length + ' sisters, not the matn\'s 13');
  if (conditional.length !== 5) fail('the kāna family holds ' + conditional.length + ' conditional sisters, not 5');
  if (conditional.filter(s => s.condition === 'maNafiyaKana').length !== 4) fail('p. 108\'s نفي قسم is not four verbs');
  if (conditional.filter(s => s.condition === 'maMasdariyyaZarfiyya').length !== 1) fail('p. 108\'s مَا المصدرية قسم is not one verb');
  for (const s of conditional) {
    if (!KANA_VERB_SET.has(skeleton(s.verbAr))) fail('a conditional sister lost its verb surface: ' + s.ar);
  }
}

/* ── Wave 4 completeness ─────────────────────────────────────────────────────────────
   The six باب النعت rows that were non-FULL before Wave 4. Five are produced; the sixth is a
   declared blocker and is pinned BOTH ways — it must still be unproduced (the declaration would be
   stale otherwise, which the loop above already fails on) and it must still be exactly one, so a
   later change cannot quietly retire a second row into the blocker column to keep a total looking
   right. Three further properties are asserted, because they are what makes these rows honest:
     · every row is in باب النعت, so an unrelated row cannot be moved into the pin;
     · the app must still hold BOTH أقسام of naʿt, and the سببي one must still be a separate
       structure with its own source rule rather than a second label on the true one;
     · every produced maʿrifah kind must still be one the app can derive from a word's own bytes,
       and the relative noun must still derive from nothing at all. */
const WAVE4_KEYS = ['T_NAAT_SABABI', 'T_MARIFA_DAMIR', 'T_MARIFA_ALAM', 'T_MARIFA_ISHARA',
  'T_MARIFA_MAWSUL', 'T_MARIFA_AL'];
const wave4 = WAVE4_KEYS.map(key => {
  const row = observed.find(r => r.key === key);
  if (!row) fail('Wave-4 row ' + key + ' is missing from the inventory');
  return row;
}).filter(Boolean);
for (const row of wave4) {
  if (!/^باب النعت/.test(row.chapter)) {
    fail('Wave-4 row ' + row.key + ' is not in the wave\'s scope: ' + row.chapter);
  }
  if (!['FULL', 'TRUE_BLOCKER'].includes(row.status)) {
    fail('Wave-4 row ' + row.key + ' is ' + row.status + ', neither FULL nor a proved blocker');
  }
}
const wave4Full = wave4.filter(r => r.status === 'FULL').length;
const wave4Blocked = wave4.filter(r => r.status === 'TRUE_BLOCKER').length;
if (wave4.length !== WAVE4_KEYS.length) fail('the Wave-4 row set did not resolve');
if (wave4Full + wave4Blocked !== WAVE4_KEYS.length) fail('Wave-4 rows are not all either FULL or blocked');
if (wave4Blocked !== 1) fail('Wave-4 holds ' + wave4Blocked + ' blockers, not the one that was proved');
if (observed.find(r => r.key === 'T_MARIFA_MAWSUL').status !== 'TRUE_BLOCKER') {
  fail('the relative noun is no longer the Wave-4 blocker; if it became producible the proof must be retired deliberately');
}
/* The two أقسام, read back out of the app rather than out of the rows table. A سببي naʿt that
   could cite the true naʿt's rule, or a maʿrifah kind that could be claimed rather than derived,
   would leave every row above FULL while making the distinction meaningless. */
{
  const labels = api.NAAT_SUBTYPE_LABELS || {};
  const kinds = Object.keys(labels);
  if (kinds.length !== 2) fail('the naʿt subtypes are ' + kinds.length + ', not the source\'s two');
  const rules = new Set(kinds.map(k => labels[k].ruleId));
  if (rules.size !== 2) fail('the two naʿt subtypes share one source rule');
  const frames = api.SABABI_FRAME_REGISTRY || {};
  if (!Object.keys(frames).length) fail('no sababi frame is registered');
  for (const [key, frame] of Object.entries(frames)) {
    const marfu = (api.SABABI_MARFU_LEXEMES || {})[frame.marfuKey];
    if (!marfu) fail('sababi frame ' + key + ' names an unregistered raised noun');
    else if (frame.naat.gender !== marfu.gender) {
      fail('sababi frame ' + key + ' no longer takes its gender from the noun it raises');
    }
  }
  const produced = Object.entries(api.MARIFA_KIND_LABELS || {}).filter(([, v]) => v.produced).map(([k]) => k);
  if (produced.length !== 4) fail('the produced maʿrifah kinds are ' + produced.length + ', not four');
  if (api.deriveMarifaKind && api.deriveMarifaKind('الَّذِي')) {
    fail('a relative noun now derives a maʿrifah kind, which the blocker proof says it cannot');
  }
}

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
  wave2: { name: 'باب الفاعل والضمائر', target: WAVE2_KEYS.length, full: wave2Full, trueBlocker: wave2Blocked },
  wave3: { name: 'كان وأخواتها', target: WAVE3_KEYS.length, full: wave3Full },
  wave4: { name: 'باب النعت', target: WAVE4_KEYS.length, full: wave4Full, trueBlocker: wave4Blocked },
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
