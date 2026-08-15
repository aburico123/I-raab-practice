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

/* ── Wave 5 — بَابُ التَّوْكِيدِ, pp. 131–134 ──────────────────────────────────────────────
   The wave started with six non-FULL rows in this chapter. Four were implementable and are pinned
   FULL here; two — كِلَا/كِلْتَا and عَامَّة — turned out not to be taught by this source at all and
   moved to `sourceExcluded`, which is this inventory's standing answer to a term the book does not
   contain (a TRUE_BLOCKER means "taught but unbuildable", which these are not).

   The exclusion is pinned BIDIRECTIONALLY, because "we deleted the row" is not a proof:
     · neither term may reappear as a counted row, and
     · both must be named in sourceExcluded with a reason, and
     · the app must not produce either surface anywhere in its iʿrāb — so if a later wave ever does
       build one, this fails loudly instead of leaving a silently-dropped target.

   The four FULL rows are further required to be structurally dependent, not merely present: p. 133
   makes أَجْمَع follow كُلّ and makes its three توابع follow أَجْمَع, so every one of them must carry a
   `chainAfter` in the app's own registry. A future refactor that let أَكْتَعُونَ stand alone would keep
   all four rows FULL while destroying what the chapter teaches; this catches that. */
const WAVE5_KEYS = ['T_TAWKID_AJMA', 'T_TAWKID_AKTA', 'T_TAWKID_ABTA', 'T_TAWKID_ABSA'];
const WAVE5_SOURCE_EXCLUDED = ['كِلَا وَكِلْتَا', 'عَامَّةٌ'];
/* The individual SURFACES to watch, not just the row terms: a later wave that started producing
   these would spell «كِلَا» on its own, never the dictionary phrase «كِلَا وَكِلْتَا», so watching only
   the phrase would let the exclusion be violated without anything noticing. */
const WAVE5_EXCLUDED_SURFACES = ['كِلَا', 'كِلْتَا', 'عَامَّةٌ', 'عَامَّتُهُمْ'];
const wave5 = WAVE5_KEYS.map(key => {
  const row = observed.find(r => r.key === key);
  if (!row) fail('Wave-5 row ' + key + ' is missing from the inventory');
  return row;
}).filter(Boolean);
for (const row of wave5) {
  if (!/^باب التوكيد/.test(row.chapter)) {
    fail('Wave-5 row ' + row.key + ' is not in the wave\'s scope: ' + row.chapter);
  }
  if (row.status !== 'FULL') fail('Wave-5 row ' + row.key + ' is ' + row.status + ', not FULL');
}
const wave5Full = wave5.filter(r => r.status === 'FULL').length;
if (wave5.length !== WAVE5_KEYS.length) fail('the Wave-5 row set did not resolve');
{
  const excludedTerms = new Set(sourceExcluded.map(item => skeleton(item.term)));
  const rowTerms = new Set(rows.map(r => skeleton(r.term)));
  for (const term of WAVE5_SOURCE_EXCLUDED) {
    const s = skeleton(term);
    if (!excludedTerms.has(s)) fail('«' + term + '» is not pinned in sourceExcluded');
    if (rowTerms.has(s)) fail('«' + term + '» came back as a counted row after being source-excluded');
  }
  for (const surface of WAVE5_EXCLUDED_SURFACES) {
    if (standalone(surface).size) {
      fail('«' + surface + '» is source-excluded but the app now produces it in the iʿrāb; ' +
        'if this source does teach it, the exclusion must be retired deliberately');
    }
  }
  /* The dependency of p. 133, read out of the app rather than out of this file. */
  const pairs = api.TAWKID_PAIR_REGISTRY || {};
  const dependent = Object.values(pairs).filter(p => p.chainAfter);
  if (dependent.length < 4) {
    fail('the app holds ' + dependent.length + ' dependent emphasis words, fewer than أجمع + its three توابع');
  }
  const bySemantic = new Map(Object.values(pairs).map(p => [p.semanticKey, p]));
  for (const [semantic, after] of [['ajma', 'kull'], ['akta', 'ajma'], ['abta', 'akta'], ['absa', 'abta']]) {
    const found = Object.values(pairs).filter(p => p.semanticKey === semantic);
    if (!found.length) fail('the app registers no «' + semantic + '» emphasis word');
    else if (!found.some(p => p.chainAfter === after)) {
      fail('«' + semantic + '» no longer has to follow «' + after + '», which p. 133 requires of it');
    }
    if (found.some(p => p.pronounId)) {
      fail('«' + semantic + '» acquired an attached pronoun; p. 134 parses it with a sign and no مضاف إليه');
    }
  }
  if (!bySemantic.has('kull') || !bySemantic.get('kull')) fail('كُلّ is no longer registered to license أجمع');
}

/* ── Wave 6 — بَابُ الِاسْتِثْنَاءِ, pp. 162–165 ─────────────────────────────────────────────
   The wave started with SIX non-FULL rows in this chapter. Five were implementable and are pinned
   FULL here; one — الِاسْتِثْنَاءُ الْمُنْقَطِعُ — turned out not to be taught by this source at all and
   moved to `sourceExcluded`, on the same standing rule Wave 5 established.

   ONE of the five is pinned under a NEW key, and the rename is itself part of the proof. The row
   authored as «الِاسْتِثْنَاءُ الْمُفَرَّغُ» named a regime this book teaches in full but a WORD it never
   uses. Renaming it to the source's own «كَلَامٍ نَاقِصٍ» is a terminology correction, not a new
   target, so both directions are pinned: the source's term must be a counted FULL row, and the
   imported one must never come back as a row or as rendered iʿrāb.

   Beyond status, the wave's content is pinned STRUCTURALLY, because five FULL rows can be produced
   by an engine that has understood none of the chapter:
     · all three of p. 163's أحوال must be reachable, and each must render a DIFFERENT regime label
       — otherwise تام موجب and تام منفي have collapsed into one lesson;
     · the second ḥāl must be reachable in BOTH readings p. 164 leaves open, and they must differ in
       the state they give the excepted word (naṣb vs rafʿ), or the جواز has become a وجوب;
     · the third ḥāl must NEVER give its noun the مستثنى role — that is the entire content of
       p. 164's third case, and the easiest thing in this chapter to get wrong;
     · all four of p. 162's اسم أدوات must be produced, and the two مقصور ones must carry an
       estimated sign rather than a visible one;
     · خلا/عدا/حاشا must be reachable in both of p. 165's readings AND after «ما» المصدرية. */
const WAVE6_KEYS = ['B_GHAYR', 'B_ISTITHNA_TAMM_MANFI', 'B_ISTITHNA_NAQIS',
  'B_ISTITHNA_SIWA', 'B_ISTITHNA_KHALA'];
const WAVE6_SOURCE_EXCLUDED = ['الِاسْتِثْنَاءُ الْمُنْقَطِعُ'];
/* The imported term and its bare head word: a later wave that started using it would write
   «مُفَرَّغٌ» on its own, never the dictionary phrase, so watching only the phrase would let the
   correction be quietly undone. «مُنْقَطِعٌ» is watched for the same reason. */
const WAVE6_EXCLUDED_SURFACES = ['الْمُفَرَّغُ', 'مُفَرَّغٌ', 'الْمُنْقَطِعُ', 'مُنْقَطِعٌ'];
const wave6 = WAVE6_KEYS.map(key => {
  const row = observed.find(r => r.key === key);
  if (!row) fail('Wave-6 row ' + key + ' is missing from the inventory');
  return row;
}).filter(Boolean);
for (const row of wave6) {
  if (!/^باب الاستثناء/.test(row.chapter)) {
    fail('Wave-6 row ' + row.key + ' is not in the wave scope: ' + row.chapter);
  }
  if (row.status !== 'FULL') fail('Wave-6 row ' + row.key + ' is ' + row.status + ', not FULL');
}
if (wave6.length !== WAVE6_KEYS.length) fail('the Wave-6 row set did not resolve');
{
  const excludedTerms = new Set(sourceExcluded.map(item => skeleton(item.term)));
  const rowTerms = new Set(rows.map(r => skeleton(r.term)));
  for (const term of WAVE6_SOURCE_EXCLUDED) {
    const t = skeleton(term);
    if (!excludedTerms.has(t)) fail('«' + term + '» is not pinned in sourceExcluded');
    if (rowTerms.has(t)) fail('«' + term + '» came back as a counted row after being source-excluded');
  }
  for (const surface of WAVE6_EXCLUDED_SURFACES) {
    if (standalone(surface).size) {
      fail('«' + surface + '» is not this source term but the app now renders it in the iʿrāb; ' +
        'if the book does use it, the correction must be retired deliberately');
    }
  }
  /* The whole chapter must be a counted, FULL block — no row of باب الاستثناء may be left behind. */
  const chapterRows = rows.filter(r => /^باب الاستثناء/.test(r.chapter));
  const chapterObserved = observed.filter(r => /^باب الاستثناء/.test(r.chapter));
  if (chapterRows.length !== 7) fail('باب الاستثناء holds ' + chapterRows.length + ' rows, not the seven it should');
  const notFull = chapterObserved.filter(r => r.status !== 'FULL');
  if (notFull.length) fail('باب الاستثناء still has non-FULL rows: ' + notFull.map(r => r.key).join(', '));

  /* ── Structure, read out of the app rather than out of this file ──────────────────────── */
  const regimes = api.ISTITHNA_REGIMES || {};
  const regimeLabels = api.ISTITHNA_REGIME_LABELS || {};
  if (Object.keys(regimes).length !== 3) {
    fail('p. 163 gives the noun after «إلا» three أحوال; the app models ' + Object.keys(regimes).length);
  }
  {
    const seen = new Set(Object.keys(regimes).map(k => skeleton(regimeLabels[k] && regimeLabels[k].ar)));
    if (seen.size !== 3) fail('two of the three أحوال render the same label, so a learner cannot tell them apart');
  }
  const pairs = Object.values(api.MUSTATHNA_PAIR_REGISTRY || {});
  for (const [regime, option, page] of [['tammMujab', 'nasb', '163'], ['tammManfi', 'nasb', '164'], ['tammManfi', 'badal', '164']]) {
    if (!pairs.some(pr => pr.regime === regime && pr.option === option)) {
      fail('no istithnāʾ frame produces ' + regime + '/' + option + ', which p. ' + page + ' teaches');
    }
  }
  /* The two readings of the second ḥāl must genuinely differ in the state they give the word. */
  {
    const states = new Set(pairs.filter(pr => pr.regime === 'tammManfi').map(pr => pr.option));
    if (states.size !== 2) fail('p. 164 leaves two readings open; the app produces ' + states.size);
    const optionLabels = api.ISTITHNA_OPTION_LABELS || {};
    if (!optionLabels.nasb || !optionLabels.badal
      || skeleton(optionLabels.nasb.ar) === skeleton(optionLabels.badal.ar)) {
      fail('the two readings of p. 164 are not named apart');
    }
  }
  /* The third ḥāl: all three ʿāmil readings present, and none of them a مستثنى. */
  const naqis = Object.values(api.ISTITHNA_NAQIS_REGISTRY || {});
  for (const role of (api.ISTITHNA_NAQIS_ROLES || [])) {
    if (!naqis.some(f => f.role === role)) fail('the third ḥāl never produces its ' + role + ' reading');
  }
  if (!naqis.length) fail('the third ḥāl has no registered frames at all');
  if (naqis.some(f => f.role === api.MUSTATHNA_ROLE)) {
    fail('a nāqiṣ frame gives its noun the مستثنى role, which is exactly what p. 164 denies');
  }
  /* p. 162's second نوع, all four, and the two مقصور ones carrying an estimated sign. */
  const nounTools = api.ISTITHNA_NOUN_TOOLS || [];
  if (nounTools.length !== 4) fail('p. 162 makes four أدوات «اسماً دائماً»; the app registers ' + nounTools.length);
  const maqsur = nounTools.filter(t => t.inflection === 'maqsur');
  if (maqsur.length !== 2) fail('سِوَى and سُوَى are the two مقصور أدوات; the app marks ' + maqsur.length);
  {
    const cell = (api.GRAMMAR_RULES.nounInflection.maqsur || {}).nasb;
    if (!cell || cell[0] !== 'fathaMuqaddaraTaadhdhur') fail('the مقصور أدوات no longer take p. 21 estimated sign');
  }
  for (const tool of nounTools) {
    if (!pairs.some(pr => pr.toolKey === tool.key)) fail('the اسم أداة «' + tool.acc + '» is registered but never produced');
  }
  /* p. 162's third نوع, in both readings and after «ما» المصدرية. */
  const dualTools = api.ISTITHNA_DUAL_TOOLS || [];
  if (dualTools.length !== 3) fail('p. 162 makes three أدوات both حرف and فعل; the app registers ' + dualTools.length);
  const khala = Object.values(api.ISTITHNA_KHALA_REGISTRY || {});
  for (const tool of dualTools) {
    for (const reading of Object.values(api.ISTITHNA_KHALA_READINGS || {})) {
      if (!khala.some(f => f.toolKey === tool.key && f.reading === reading && !f.masdariyya)) {
        fail('«' + tool.surface + '» is never produced in its ' + reading + ' reading, which p. 165 gives it');
      }
    }
    if (!khala.some(f => f.toolKey === tool.key && f.masdariyya)) {
      fail('«' + tool.surface + '» never appears after «ما» المصدرية, which p. 165 makes decisive');
    }
  }
  if (khala.some(f => f.masdariyya && f.reading !== 'fil')) {
    fail('a «ما» المصدرية frame keeps the ḥarf reading, which p. 165 closes');
  }
}

/* ── WAVE 7 — بَابُ الْمُنَادَى, pp. 168–170 ──────────────────────────────────────────────────
   The wave started with SIX non-FULL rows and every one of them turned out to be taught outright:
   two bināʾ markers p. 169 gives the built munādā besides the ḍammah, and the four sisters of «يا»
   p. 168 names with an example each. Nothing in this chapter was excluded and nothing blocked, so
   all six are pinned FULL and the whole bāb is pinned complete.

   Status alone would not prove the chapter, because six FULL rows are reachable by an engine that
   has printed the right words in the wrong grammar. The structure below is therefore pinned too,
   and every value it compares against is READ OUT OF THE APP's registries:
     · five أدوات, each with its own bytes, type, source rule and naming clause, and each actually
       reaching the rendered iʿrāb — a sister that exists only in a registry is not practised;
     · three bināʾ markers, one per declension, each reaching a rendered «مُنَادًى ... فِي مَحَلِّ
       نَصْبٍ» line — the ruling of p. 169 is that the marker FOLLOWS the declension, so a chapter
       that produced all three on singulars would have taught the opposite of the source;
     · bināʾ and iʿrāb kept apart on the SAME line: no built munādā line may also say «مَنْصُوبٌ»
       or carry an iʿrāb sign clause, which is the one confusion this bāb exists to prevent;
     · all five أقسام of p. 168 registered and productive. */
const WAVE7_KEYS = ['B_MUNADA_MABNI_ALIF', 'B_MUNADA_MABNI_WAW',
  'B_NIDA_HAMZA', 'B_NIDA_AY', 'B_NIDA_AYA', 'B_NIDA_HAYA'];
{
  for (const key of WAVE7_KEYS) {
    const row = observed.find(r => r.key === key);
    if (!row) { fail('Wave-7 row ' + key + ' is missing from the inventory'); continue; }
    if (!/^باب المنادى/.test(row.chapter)) fail('Wave-7 row ' + key + ' is not in the wave scope: ' + row.chapter);
    if (row.status !== 'FULL') fail('Wave-7 row ' + key + ' is ' + row.status + ', not FULL');
  }
  const chapterRows = rows.filter(r => /^باب المنادى/.test(r.chapter));
  const chapterObserved = observed.filter(r => /^باب المنادى/.test(r.chapter));
  if (chapterRows.length !== 14) fail('باب المنادى holds ' + chapterRows.length + ' rows, not the fourteen it should');
  const notFull = chapterObserved.filter(r => r.status !== 'FULL');
  if (notFull.length) fail('باب المنادى still has non-FULL rows: ' + notFull.map(r => r.key).join(', '));

  /* ── أدوات النداء, p. 168 ───────────────────────────────────────────────────────────── */
  const particles = Object.values(api.NIDA_PARTICLES || {});
  if (particles.length !== 5) {
    fail('p. 168 names «يا» and four sisters; the app registers ' + particles.length + ' أدوات نداء');
  }
  for (const field of ['surface', 'particleType', 'ruleId', 'iraabAr']) {
    if (new Set(particles.map(p => p[field])).size !== particles.length) {
      fail('two أدوات نداء share a ' + field + ', so a learner cannot tell them apart');
    }
  }
  for (const particle of particles) {
    if (!templatesFor(particle.nameAr, 'حَرْفُ نِدَاءٍ').size) {
      fail('the أداة «' + particle.surface + '» never names itself in a rendered iʿrāb line');
    }
    /* Written joined or not, each أداة is still its OWN token with its own card — which is how
       p. 168's «أَزَيْدُ» is parsed as two words rather than one. */
    if (!cardHeads.has(skeleton(particle.surface))) {
      fail('the أداة «' + particle.surface + '» has no iʿrāb card of its own');
    }
  }
  if (particles.filter(p => p.proclitic).length !== 1) {
    fail('exactly one أداة نداء — the hamzah of «أَزَيْدُ» — is written joined to what it calls');
  }

  /* ── بناء المنادى, p. 169: one marker per declension ─────────────────────────────────── */
  const markers = api.MUNADA_BINAA_SIGNS || {};
  for (const id of ['damma', 'alif', 'waw']) {
    if (!markers[id]) { fail('p. 169 gives the built munādā the ' + id + ' marker; the app has none'); continue; }
    if (!templatesFor('مَبْنِيٌّ عَلَى ' + markers[id].ar, 'فِي مَحَلِّ ' + api.MUNADA_MAHALL.ar).size) {
      fail('the built munādā is never rendered on the ' + id + ' marker in the position of naṣb');
    }
  }
  {
    const pairs = Object.values(api.MUNADA_PAIR_REGISTRY || {});
    const builtPairs = pairs.filter(p => api.MUNADA_SUBTYPE_LABELS[p.subtype].binaa);
    const expected = { singular: 'damma', dual: 'alif', smp: 'waw' };
    for (const pair of builtPairs) {
      const declension = api.munadaHeadInflection(pair);
      if (pair.binaaSignId !== expected[declension]) {
        fail('a built munādā of the ' + declension + ' is built on ' + pair.binaaSignId
          + ', not on what p. 169 says raises it');
      }
    }
    if (new Set(builtPairs.map(p => api.munadaHeadInflection(p))).size !== 3) {
      fail('the built munādā is not produced in all three declensions p. 169 rules on');
    }
    if (Object.keys(api.MUNADA_SUBTYPES).length !== 5) {
      fail('p. 168 divides the munādā into five أنواع; the app models '
        + Object.keys(api.MUNADA_SUBTYPES).length);
    }
    for (const subtype of Object.keys(api.MUNADA_SUBTYPES)) {
      if (!pairs.some(p => p.subtype === subtype)) fail('the نوع ' + subtype + ' is registered but never produced');
    }
    /* The proper-name claim is the WORD's, not the label's: «يا زيدُ» and «يا رجلُ» are both built
       on a ḍammah and only the lexical record separates the علم from the نكرة مقصودة. */
    for (const pair of pairs) {
      const properName = api.munadaHeadLexeme(pair).properName === true;
      if ((pair.subtype === api.MUNADA_SUBTYPES.mufradAlam) !== properName) {
        fail('a munādā pair types its head as ' + pair.subtype + ' against its own proper-name identity');
      }
    }
  }

  /* ── bināʾ is not iʿrāb, on the same rendered line ───────────────────────────────────── */
  for (const [line] of iraabLines) {
    if (!line.includes(skeleton('مُنَادًى مَبْنِيٌّ'))) continue;
    if (line.includes(skeleton('مَنْصُوبٌ')) || line.includes(skeleton('مَرْفُوعٌ'))
      || line.includes(skeleton('وَعَلَامَةُ'))) {
      fail('a built munādā line also states an iʿrāb: ' + line);
    }
  }
}

/* ── WAVE 8 — بَابُ التَّمْيِيزِ, pp. 157–161 ─────────────────────────────────────────────────
   The wave started with FIVE non-FULL rows and split three-to-two.

   THREE were implementable outright. p. 159 divides تمييز النسبة into «ضربان؛ الأول مُحَوَّلٌ،
   والثاني غير محوَّل» and then divides the first into three أنواع, giving each its own worked
   derivation; p. 161's own model iʿrāb utters one of them verbatim — «نفساً: تمييز نسبة محوَّل عن
   المبتدأ منصوب وعلامة نصبه الفتحة الظاهرة». They are pinned FULL.

   TWO left the denominator, and the reason is the COUNTING RULE, not the source. تَمْيِيزُ الْعَدَدِ
   and تَمْيِيزُ الْمِسَاحَاتِ are two members of the single enumeration p. 158 gives for what a تمييز
   ذات may FOLLOW — «ويكون بعد العَدَد … أو بعد المقادير، من الموزونات … أو المَكِيلَاتِ … أو
   المساحات» — and the other two members were already in `notCounted` for exactly that reason.
   The decisive evidence is on p. 161, where the book parses these very constructions as «ذراعاً:
   تمييز لعشرين» and «حريراً: تمييز لذراع»: it names the MUMAYYAZ, never the category. This is
   therefore a `notCounted` correction and NOT a `sourceExclude`: the source does teach all four.

   Both halves are pinned in both directions. The three أنواع must be produced AND must each be
   derived from a different promoted role; the four positional categories must be taught in the
   Why corpus and must never reach the iʿrāb corpus, which is the whole basis for removing them. */
const WAVE8_KEYS = ['B_TAMYIZ_MUHAWWAL_FAIL', 'B_TAMYIZ_MUHAWWAL_MAFUL', 'B_TAMYIZ_MUHAWWAL_MUBTADA'];
const WAVE8_NOT_COUNTED = ['تَمْيِيزُ الْعَدَدِ', 'تَمْيِيزُ الْمِسَاحَاتِ'];
{
  for (const key of WAVE8_KEYS) {
    const row = observed.find(r => r.key === key);
    if (!row) { fail('Wave-8 row ' + key + ' is missing from the inventory'); continue; }
    if (!/^باب التمييز/.test(row.chapter)) fail('Wave-8 row ' + key + ' is not in the wave scope: ' + row.chapter);
    if (row.status !== 'FULL') fail('Wave-8 row ' + key + ' is ' + row.status + ', not FULL');
  }
  const chapterRows = rows.filter(r => /^باب التمييز/.test(r.chapter));
  const chapterObserved = observed.filter(r => /^باب التمييز/.test(r.chapter));
  if (chapterRows.length !== 6) fail('باب التمييز holds ' + chapterRows.length + ' rows, not the six it should');
  const notFull = chapterObserved.filter(r => r.status !== 'FULL');
  if (notFull.length) fail('باب التمييز still has non-FULL rows: ' + notFull.map(r => r.key).join(', '));

  /* The removal, both ways. The two terms must be recorded as not-counted, must not have come
     back as rows, and must never be uttered on an iʿrāb card — the claim that justified it. */
  {
    const notCountedText = notCounted.map(item => skeleton(item.term)).join(' | ');
    const rowTerms = new Set(rows.map(r => skeleton(r.term)));
    for (const term of WAVE8_NOT_COUNTED) {
      const t = skeleton(term);
      if (!notCountedText.includes(skeleton(term.replace(/^تَمْيِيزُ /, '')))) {
        fail('«' + term + '» is not recorded in notCounted');
      }
      if (rowTerms.has(t)) fail('«' + term + '» came back as a counted row after the counting-rule correction');
      if (templatesFor(term).size) {
        fail('«' + term + '» is not an iʿrāb term but the app now prints it on a card; ' +
          'if the book does parse one that way, the correction must be retired deliberately');
      }
    }
  }
  /* …and the categories themselves stay TAUGHT. Removing a row must not remove a lesson: every
     مقدار p. 158 names is still explained in the Why corpus, and none of them on a card. */
  for (const kind of Object.values(api.TAMYIZ_MEASURE_KINDS || {})) {
    if (!mentionedOnly(kind.ar)) fail('the مقدار «' + kind.ar + '» is no longer taught anywhere');
    if (templatesFor(kind.ar).size) fail('the مقدار «' + kind.ar + '» reached the iʿrāb corpus');
  }

  /* ── Structure, read out of the app ─────────────────────────────────────────────────────── */
  const pairs = Object.values(api.TAMYIZ_PAIR_REGISTRY || {});
  if (Object.keys(api.TAMYIZ_MEASURE_KINDS || {}).length !== 3) {
    fail('p. 158 names three مقادير; the app registers ' + Object.keys(api.TAMYIZ_MEASURE_KINDS || {}).length);
  }
  for (const kind of Object.keys(api.TAMYIZ_MEASURE_KINDS || {})) {
    if (!pairs.some(p => (api.TAMYIZ_MEASURE_LEXEMES[p.measureKey] || {}).measureKind === kind)) {
      fail('the مقدار ' + kind + ' is registered but never produced');
    }
  }
  if (Object.keys(api.TAMYIZ_TRANSFORMS || {}).length !== 3) {
    fail('p. 159 divides المحوَّل into three; the app models ' + Object.keys(api.TAMYIZ_TRANSFORMS || {}).length);
  }
  for (const transform of Object.keys(api.TAMYIZ_TRANSFORMS || {})) {
    if (!pairs.some(p => p.transform === transform)) fail('the نوع ' + transform + ' is registered but never produced');
    const label = api.TAMYIZ_TRANSFORM_LABELS[transform];
    /* Each نوع must actually be rendered, and rendered as a تمييز نسبة — the division it belongs
       to. A clause without that discriminator would be a label floating free of its ضرب. */
    if (!templatesFor('مُحَوَّلٌ عَنِ ' + label.hostAr, api.TAMYIZ_SUBTYPE_LABELS.nisbah.ar).size) {
      fail('the نوع «' + label.ar + '» never reaches a rendered تمييز نسبة card');
    }
  }
  {
    /* The three أنواع are three different PROMOTED ROLES; two sharing one would collapse p. 159's
       division into a naming convention. */
    const roles = new Set(Object.values(api.TAMYIZ_TRANSFORM_LABELS || {}).map(l => l.hostRole));
    if (roles.size !== 3) fail('two of the three أنواع of p. 159 claim the same promoted role');
    const framed = new Set(pairs.filter(p => p.transform).map(p => api.TAMYIZ_FRAMES[p.frame].hostAt));
    if (!framed.size) fail('no transformed frame promotes a word at all');
  }
  /* «وهو ضربان» — the untransformed kind has to survive alongside the transformed ones, or the
     division p. 158 states has quietly become a single kind. */
  if (!pairs.some(p => p.subtype === api.TAMYIZ_SUBTYPES.nisbah && !p.transform)) {
    fail('the ضرب غير المحوَّل of p. 159 is no longer produced');
  }
  if (!templatesFor(api.TAMYIZ_SUBTYPE_LABELS.nisbah.ar + ' مُحَوَّلٌ').size) {
    fail('no card carries the transformed division in the source’s own wording');
  }
}

/* ── Wave 9 — باب الحال, pp. 153–157 ───────────────────────────────────────────────────────────
   Four non-FULL rows resolved: two produced, two removed as counting-rule corrections.

   Pinned in both directions, because each half can rot independently. The two aqsām must be
   produced AND must be produced as two DIFFERENT labels off two different صاحب roles — one label
   reaching both lanes would satisfy a naive «is it printed» check while destroying the division
   p. 154 draws. The two removals must stay out of the rows, stay recorded, and — the claim that
   justified removing them — must never appear on an iʿrāb card. الفضلة additionally has to stay
   TAUGHT: it is a real qayd of the source's definition, and removing a row must not remove a
   lesson. And p. 155's built ḥāl must keep its bare «في محل نصب حال»: the source gives the
   interrogative no قسم, so a قسم leaking onto that lane would be an invented term. */
const WAVE9_KEYS = ['B_HAAL_FAIL', 'B_HAAL_MAFUL'];
const WAVE9_NOT_COUNTED = ['الْفَضْلَةُ', 'الِاسْمُ الْمُؤَوَّلُ بِالصَّرِيحِ'];
{
  for (const key of WAVE9_KEYS) {
    const row = observed.find(r => r.key === key);
    if (!row) { fail('Wave-9 row ' + key + ' is missing from the inventory'); continue; }
    if (!/^باب الحال/.test(row.chapter)) fail('Wave-9 row ' + key + ' is not in the wave scope: ' + row.chapter);
    if (row.status !== 'FULL') fail('Wave-9 row ' + key + ' is ' + row.status + ', not FULL');
  }
  const chapterRows = rows.filter(r => /^باب الحال/.test(r.chapter));
  const chapterObserved = observed.filter(r => /^باب الحال/.test(r.chapter));
  if (chapterRows.length !== 4) fail('باب الحال holds ' + chapterRows.length + ' rows, not the four it should');
  const notFull = chapterObserved.filter(r => r.status !== 'FULL');
  if (notFull.length) fail('باب الحال still has non-FULL rows: ' + notFull.map(r => r.key).join(', '));

  /* The division is real: two distinct labels, each on its own lane, neither on the other's. */
  {
    const labels = Object.values(api.HAAL_HOST_LABELS || {});
    if (labels.length !== 2) fail('p. 154 divides the ḥāl in two; the app registers ' + labels.length);
    if (new Set(labels.map(l => l.ar)).size !== labels.length) fail('the two aqsām of p. 154 share one label');
    for (const label of labels) {
      const lanes = templatesFor(label.ar);
      if (!lanes.size) fail('the قسم «' + label.ar + '» never reaches a rendered card');
      for (const other of labels) {
        if (other.ar !== label.ar && templatesFor(label.ar, other.ar).size) {
          fail('one card carries both aqsām of p. 154 at once');
        }
      }
    }
    /* p. 155 parses كَيْفَ as «في محل نصب حال من علي» and gives it no قسم. Discriminated by
       «اسم استفهام», which only the built lane prints — NOT by HAAL_MAHALL.ar, whose skeleton
       «نصب» is also a substring of the ordinary lane's own «وعلامة نصبه». */
    for (const label of labels) {
      if (templatesFor(label.ar, api.HAAL_ISTIFHAM.nameAr).size) {
        fail('the built ḥāl of p. 155 borrowed the p. 157 قسم, which the source does not give it');
      }
    }
  }

  /* The two removals, both ways. */
  {
    const notCountedText = notCounted.map(item => skeleton(item.term)).join(' | ');
    const rowTerms = new Set(rows.map(r => skeleton(r.term)));
    for (const term of WAVE9_NOT_COUNTED) {
      const t = skeleton(term);
      if (!notCountedText.includes(t)) fail('«' + term + '» is not recorded in notCounted');
      if (rowTerms.has(t)) fail('«' + term + '» came back as a counted row after the counting-rule correction');
      if (templatesFor(term).size) {
        fail('«' + term + '» is not an iʿrāb term but the app now prints it on a card; ' +
          'if the book does parse one that way, the correction must be retired deliberately');
      }
    }
    /* الفضلة stays taught. المؤول بالصريح does not have to be: it is the one term this chapter
       explains in order to describe a construction the app deliberately does not generate. */
    if (!mentionedOnly('الْفَضْلَةُ') && !mentionedOnly('فَضْلَةٌ')) {
      fail('«الفضلة» is a qayd of the source’s own definition and is no longer taught anywhere');
    }
  }
}

/* ── WAVE 10 — باب «لا» النافية للجنس, pp. 166–167 ────────────────────────────────────────────
   Four rows opened the wave. Three are produced and one was a counting error, and the pin covers
   all four in both directions.

   The chapter's whole content is a DIVISION with two regimes: p. 166 splits اسم لا into المفرد,
   المضاف and الشبيه بالمضاف, and then p. 166–167 makes the first مبني «على ما يُنصب به» while the
   other two stay مُعرب منصوب. So the pin's centre of gravity is that the two regimes never print
   each other's analysis — «مبني على الفتح في محل نصب» is not «منصوب وعلامة نصبه الفتحة», and
   printing the second where the source says the first is exactly the error this bāb exists to
   prevent. Both directions are checked on real rendered cards.

   The counting correction is تكرار «لا» — the fourth of p. 166's four شروط. It follows the rule
   Wave 8 introduced and Wave 9 sharpened: the book teaches it, and never utters it in a parse. But
   like الفضلة before it, a notCounted term can still owe a lesson, so the pin also requires that
   it stays TAUGHT. */
const WAVE10_KEYS = ['B_ISM_LA_MUFRAD', 'B_ISM_LA_SHABIH', 'B_LA_ILGHA'];
const WAVE10_NOT_COUNTED = ['تَكْرَارُ «لَا»'];
{
  for (const key of WAVE10_KEYS) {
    const row = observed.find(r => r.key === key);
    if (!row) { fail('Wave-10 row ' + key + ' is missing from the inventory'); continue; }
    if (!/^باب «لا»/.test(row.chapter)) fail('Wave-10 row ' + key + ' is not in the wave scope: ' + row.chapter);
    if (row.status !== 'FULL') fail('Wave-10 row ' + key + ' is ' + row.status + ', not FULL');
  }
  const chapterRows = rows.filter(r => /^باب «لا»/.test(r.chapter));
  const chapterObserved = observed.filter(r => /^باب «لا»/.test(r.chapter));
  if (chapterRows.length !== 6) fail('باب «لا» holds ' + chapterRows.length + ' rows, not the six it should');
  const notFull = chapterObserved.filter(r => r.status !== 'FULL');
  if (notFull.length) fail('باب «لا» still has non-FULL rows: ' + notFull.map(r => r.key).join(', '));

  /* The rename, not a deletion — the Wave-6 shape. The row keeps its key and its regime; only its
     NAME moved from the rule («إلغاء») to what p. 167 actually puts in an iʿrāb («نافية مهملة»). */
  {
    const ilgha = observed.find(r => r.key === 'B_LA_ILGHA');
    if (ilgha && /إلغاء/.test(skeleton(ilgha.term))) {
      fail('B_LA_ILGHA is still named after the rule rather than after the parse');
    }
    if (!templatesFor('مُهْمَلَةٌ').size) fail('«نافية مهملة» never reaches a rendered card');
  }

  /* The three أنواع of p. 166, each on a card, and the two regimes kept strictly apart. */
  {
    const labels = api.LA_JINS_SUBTYPE_LABELS || {};
    if (Object.keys(labels).length !== 3) {
      fail('p. 166 divides اسم لا in three; the app registers ' + Object.keys(labels).length);
    }
    for (const [key, label] of Object.entries(labels)) {
      if (!templatesFor(label.ar, 'لِلْجِنْسِ').size) {
        fail('the نوع «' + label.ar + '» never reaches a rendered card inside this bāb');
      }
      if (!key) fail('a نوع of اسم لا has no key');
    }
    /* Built vs muʿrab, checked on the LINE that states the regime — the اسم's own card — because
       the نوع label lives in the combined block and the sign lives on the card, and a two-needle
       search is per line. Both regimes must be produced, and neither line may carry the other's
       analysis: «مبني على الفتح في محل نصب» must never acquire a naṣb sign, and «منصوب وعلامة
       نصبه» must never acquire a maḥall. That confusion is the one p. 167 is written to stop. */
    {
      const builtLine = 'لِلْجِنْسِ مَبْنِيٌّ', nasbLine = 'لِلْجِنْسِ مَنْصُوبٌ';
      if (!templatesFor(builtLine, 'فِي مَحَلِّ').size) {
        fail('no اسم لا card carries p. 167’s bināʾ + maḥall analysis');
      }
      if (!templatesFor(nasbLine, 'وَعَلَامَةُ نَصْبِهِ').size) {
        fail('no اسم لا card carries the muʿrab naṣb analysis');
      }
      if (templatesFor(builtLine, 'وَعَلَامَةُ نَصْبِهِ').size) {
        fail('a built اسم لا card prints a naṣb sign the source denies it');
      }
      if (templatesFor(nasbLine, 'فِي مَحَلِّ').size) {
        fail('a muʿrab اسم لا card prints a maḥall the source denies it');
      }
    }
    /* «يُبْنى على ما يُنصب به» is a DERIVATION, so every marker p. 167 names must actually be
       produced — otherwise a declension is being taught by rule and never shown. */
    for (const marker of Object.values(api.LA_JINS_BINAA_SIGNS || {})) {
      if (!templatesFor(marker.ar, 'لِلْجِنْسِ').size) {
        fail('the bināʾ marker «' + marker.ar + '» of p. 167 never reaches a card');
      }
    }
  }

  /* The counting correction, both ways — and the lesson it still owes. */
  {
    const notCountedText = notCounted.map(item => skeleton(item.term)).join(' | ');
    const rowTerms = new Set(rows.map(r => skeleton(r.term)));
    for (const term of WAVE10_NOT_COUNTED) {
      const t = skeleton(term);
      if (!notCountedText.includes(t)) fail('«' + term + '» is not recorded in notCounted');
      if (rowTerms.has(t)) fail('«' + term + '» came back as a counted row after the counting-rule correction');
      if (templatesFor(term).size) {
        fail('«' + term + '» is not an iʿrāb term but the app now prints it on a card; ' +
          'if the book does parse one that way, the correction must be retired deliberately');
      }
    }
    /* It stays taught: p. 167 makes the repetition obligatory in the same breath as the
       cancellation, so a learner who never meets the word has not been told the rule. */
    if (!mentionedOnly('تَكْرَارُهَا') && !mentionedOnly('تَكْرَارُ')) {
      fail('«تكرار لا» is a شرط of p. 166 and is no longer taught anywhere');
    }
  }
}

/* ── Wave 11 — بَابُ الْعَطْفِ (pp. 124–130) ─────────────────────────────────────────────
   Two of this wave's three rows were resolved by correcting the INVENTORY, not the app, so the
   pin has to hold the corrections down from both ends: the terms must stay produced, and the
   wrong wording must stay out. The third is a blocker, and a blocker is only honest while the
   thing really is unproduced — so that is asserted too, not assumed. */
const WAVE11_FULL_KEYS = ['T_ATF_WAW', 'T_ATF_FA'];
const WAVE11_BLOCKED_KEYS = ['T_ATF_BAYAN'];
{
  for (const key of [...WAVE11_FULL_KEYS, ...WAVE11_BLOCKED_KEYS]) {
    const row = observed.find(r => r.key === key);
    if (!row) { fail('Wave-11 row ' + key + ' is missing from the inventory'); continue; }
    if (!/^باب العطف/.test(row.chapter)) fail('Wave-11 row ' + key + ' is not in the wave scope: ' + row.chapter);
  }
  for (const key of WAVE11_FULL_KEYS) {
    const row = observed.find(r => r.key === key);
    if (row && row.status !== 'FULL') fail('Wave-11 row ' + key + ' is ' + row.status + ', not FULL');
  }
  for (const key of WAVE11_BLOCKED_KEYS) {
    const row = observed.find(r => r.key === key);
    if (row && row.status !== 'TRUE_BLOCKER') fail('Wave-11 row ' + key + ' is ' + row.status + ', not TRUE_BLOCKER');
  }

  /* بَابُ الْعَطْفِ holds thirteen rows: the maʿṭūf itself, the ten ḥurūf of p. 124, عطف البيان, and
     هَمْزَةُ الِاسْتِفْهَامِ — which is filed here, not with the particles, because p. 126 introduces it
     only as the context «أَمْ» requires. Twelve are FULL and exactly one — the blocker — is not. */
  const chapterRows = rows.filter(r => /^باب العطف/.test(r.chapter));
  const chapterObserved = observed.filter(r => /^باب العطف/.test(r.chapter));
  if (chapterRows.length !== 13) fail('باب العطف holds ' + chapterRows.length + ' rows, not the thirteen it should');
  const notResolved = chapterObserved.filter(r => !['FULL', 'TRUE_BLOCKER'].includes(r.status));
  if (notResolved.length) fail('باب العطف still has unresolved rows: ' + notResolved.map(r => r.key).join(', '));

  /* All TEN conjunctions of p. 124 get their own card — the claim the two corrected rows'
     old missingReason denied. The registry is the source of the list, so a conjunction cannot be
     dropped from the app and quietly keep its row. */
  {
    const registry = api.ATF_CONJUNCTION_REGISTRY || {};
    if (Object.keys(registry).length !== 10) {
      fail('p. 124 names ten ḥurūf ʿaṭf; the app registers ' + Object.keys(registry).length);
    }
    for (const [key, record] of Object.entries(registry)) {
      const bodies = cardHeads.get(skeleton(record.surface));
      const named = bodies && [...bodies].some(b => b.includes(skeleton(record.nameAr)));
      if (!named) { fail('the conjunction «' + key + '» has no iʿrāb card of its own headed by its surface'); continue; }
      const withHarf = [...bodies].some(b =>
        b.includes(skeleton(record.nameAr)) && b.includes(skeleton('حَرْفُ عَطْفٍ')));
      if (!withHarf) fail('the card of «' + key + '» does not carry the source\'s own «حَرْفُ عَطْفٍ» (pp. 129–130)');
      /* p. 124 lists them as ḥurūf, and a ḥarf is mabnī with no place in iʿrāb. */
      const noMahall = [...bodies].some(b =>
        b.includes(skeleton(record.nameAr)) && b.includes(skeleton('لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ')));
      if (!noMahall) fail('the card of «' + key + '» does not state its bināʾ / lack of maḥall');
    }
  }

  /* The wording the corrected probes REPLACED must not come back. Neither the source nor the app
     calls these two «الْوَاوُ الْعَاطِفَةُ» / «الْفَاءُ الْعَاطِفَةُ»; if a future change starts printing
     them, that is a second name for a card that already exists and this wave's decision is void. */
  for (const wrong of ['الْوَاوُ الْعَاطِفَةُ', 'الْفَاءُ الْعَاطِفَةُ']) {
    if (templatesFor(wrong).size) {
      fail('«' + wrong + '» is now printed on a card; Wave 11 corrected the probe precisely because ' +
        'neither Al-Tuḥfah nor the app uses that wording for these two particles');
    }
  }
  /* …while «عَاطِفَةٌ» itself stays legitimate for the other eight, on p. 127's authority. */
  if (!templatesFor('الْعَاطِفَةُ').size) {
    fail('no conjunction card uses «الْعَاطِفَةُ» any more; p. 127 licenses it and eight rows probe it');
  }

  /* The blocker, held honest from the other side: عطف البيان must remain genuinely unproduced.
     The moment any card says it, the TRUE_BLOCKER declaration is a lie and must be retired. */
  for (const key of WAVE11_BLOCKED_KEYS) {
    const authored = rows.find(r => r.key === key);
    if (authored && templatesFor(authored.probe).size) {
      fail('«' + authored.term + '» now reaches a rendered card; its TRUE_BLOCKER declaration must be ' +
        'retired deliberately rather than left standing');
    }
  }
  /* NOT asserted here: that عطف البيان is TAUGHT somewhere. It currently is not — it reaches
     neither the Why corpus nor the definitions panel, so the app produces عطف النسق without ever
     telling the learner it is only ONE of the two أقسام p. 125 divides العطف into. That is a real
     gap, but it is a CONTENT gap and not an inventory one: this row is TRUE_BLOCKER because the
     term cannot be PARSED from this source, which is a separate claim from whether it is
     mentioned. Requiring the mention here would force new learner-facing prose through a wave
     whose mandate was inventory truth; asserting its ABSENCE would freeze the gap in place. So
     neither is pinned, and the gap is carried in the row's own blocker text instead. */

  /* Directional authority, asserted on the rendered text rather than on the engine: the FOLLOWER
     is المعطوف and the HEAD is المعطوف عليه. Wave 10 found a follower chapter that had these
     backwards on a learner-facing card, so this is checked here and not only in the focused suite. */
  if (!templatesFor('مَعْطُوفٌ', 'عَلَى مَعْطُوفٍ عَلَيْهِ').size) {
    fail('no maʿṭūf card names its head as المعطوف عليه');
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
  wave5: { name: 'باب التوكيد', target: WAVE5_KEYS.length, full: wave5Full,
    sourceExcluded: WAVE5_SOURCE_EXCLUDED.length },
  wave6: { name: 'باب الاستثناء', target: WAVE6_KEYS.length + WAVE6_SOURCE_EXCLUDED.length,
    full: wave6.filter(r => r.status === 'FULL').length,
    sourceExcluded: WAVE6_SOURCE_EXCLUDED.length },
  wave7: { name: 'باب المنادى', target: WAVE7_KEYS.length,
    full: WAVE7_KEYS.filter(k => (observed.find(r => r.key === k) || {}).status === 'FULL').length },
  wave8: { name: 'باب التمييز', target: WAVE8_KEYS.length + WAVE8_NOT_COUNTED.length,
    full: WAVE8_KEYS.filter(k => (observed.find(r => r.key === k) || {}).status === 'FULL').length,
    notCounted: WAVE8_NOT_COUNTED.length },
  wave9: { name: 'باب الحال', target: WAVE9_KEYS.length + WAVE9_NOT_COUNTED.length,
    full: WAVE9_KEYS.filter(k => (observed.find(r => r.key === k) || {}).status === 'FULL').length,
    notCounted: WAVE9_NOT_COUNTED.length },
  wave10: { name: 'باب «لا» النافية للجنس', target: WAVE10_KEYS.length + WAVE10_NOT_COUNTED.length,
    full: WAVE10_KEYS.filter(k => (observed.find(r => r.key === k) || {}).status === 'FULL').length,
    notCounted: WAVE10_NOT_COUNTED.length },
  wave11: { name: 'باب العطف', target: WAVE11_FULL_KEYS.length + WAVE11_BLOCKED_KEYS.length,
    full: WAVE11_FULL_KEYS.filter(k => (observed.find(r => r.key === k) || {}).status === 'FULL').length,
    trueBlocker: WAVE11_BLOCKED_KEYS.filter(k => (observed.find(r => r.key === k) || {}).status === 'TRUE_BLOCKER').length,
    probeCorrections: WAVE11_FULL_KEYS.length },
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
