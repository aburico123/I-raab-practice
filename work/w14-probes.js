#!/usr/bin/env node
/* ============================================================================
   work/w14-probes.js

   Wave 14 — derives the بَابُ الْأَفْعَالِ probe strings from the APP's own frozen constants and its
   RENDERED iʿrāb cards, then writes them into work/iraab-term-rows.js. Same contract, and the same
   reason, as work/w4-probes.js, w11-probes.js, w12-probes.js and w13-probes.js: two independently
   typed copies of one Arabic string is how combining-mark ORDER has drifted invisibly in this repo
   before, and this wave met that drift again — a hand-pasted «لِتَجَرُّدِهِ مِنَ النَّاصِبِ
   وَالْجَازِمِ» arrived with its shadda and its vowel transposed (0631 064F 0651 instead of
   0631 0651 064F) and rendered identically. Nothing Arabic is typed in this file.

   Two rows are rewritten, and they are the wave's two targets:

     V_AMR         term + probe. The row asked for «فِعْلُ أَمْرٍ» alone, which is only the first
                   half of what p. 72 rules. The probe is now the WHOLE claim the learner must
                   utter — «فِعْلُ أَمْرٍ مَبْنِيٌّ عَلَى السُّكُونِ» — composed from the app's own
                   label and bināʾ constants, so a card naming the type without ruling the bināʾ
                   could never score this row FULL.

     V_MUJARRAD    probe only. «لِتَجَرُّدِهِ» is the run that cannot occur anywhere else, but it is
                   taken from PRESENT_MUJARRAD_CAUSE_AR rather than retyped.

   Both are then proved to DISCRIMINATE: the imperative probe may not appear on any present-verb
   card, and the mujarrad probe may not appear on any card carrying a nāṣib or a jāzim cause.
   ========================================================================== */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
function loadApi() {
  const html = fs.readFileSync(path.resolve(ROOT, 'index.html'), 'utf8');
  const harnessSrc = fs.readFileSync(path.join(__dirname, 'check-nominal-pairs.js'), 'utf8');
  let script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const exportNeedle = 'window.nahwGenerate=generate;';
  const injHead = 'script=script.replace(exportNeedle,`';
  const injStart = harnessSrc.indexOf(injHead);
  const injBody = injStart + injHead.length;
  const injEnd = harnessSrc.indexOf('`);', injBody);
  const injection = new Function('exportNeedle', 'return `' + harnessSrc.slice(injBody, injEnd) + '`;')(exportNeedle);
  script = script.replace(exportNeedle, injection);
  const bootStart = harnessSrc.indexOf('function assert(condition,message)');
  const bootTail = 'const api=context.__nahwTest;';
  const bootEnd = harnessSrc.indexOf(bootTail);
  const bootstrap = harnessSrc.slice(bootStart, bootEnd + bootTail.length);
  return new Function('html', 'script', 'vm', 'webcrypto', 'console', bootstrap + '\nreturn api;')
    (html, script, vm, webcrypto, console);
}
const api = loadApi();

/* Every rendered iʿrāb line, tagged with the verb tense of the token that produced it, exactly as
   the inventory checker collects them. */
const lines = new Set();
const linesByTense = new Map();
for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < 40; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      for (const line of [token.ar, token.phraseAr, ...(token.components || []).map(c => c.ar)]) {
        if (!line) continue;
        lines.add(line);
        const tense = token.grammar?.type === 'verb' ? (token.tense || '') : '';
        if (!linesByTense.has(line)) linesByTense.set(line, new Set());
        linesByTense.get(line).add(tense);
      }
    }
  }
}
const seenOn = needle => [...lines].filter(line => line.includes(needle));

/* ── the two values, composed from the app's own constants and then CHECKED on real cards ── */
const amrProbe = `${api.AMR_VERB_LABEL_AR} ${api.AMR_BINAA_SUKUN_AR}`;
/* The cause clause carries a leading «، » so it can sit between the state word and «وَعَلَامَةُ».
   The probe is the clause without that punctuation lead-in, which is what a learner says. */
const mujarradProbe = api.PRESENT_MUJARRAD_CAUSE_AR.replace(/^[،\s]+/, '');

const updates = {
  V_AMR: { term: amrProbe, probe: amrProbe, pages: '70–72' },
  V_MUJARRAD: { probe: mujarradProbe }
};

for (const [key, update] of Object.entries(updates)) {
  const hits = seenOn(update.probe);
  if (!hits.length) throw new Error(key + ': no rendered card contains «' + update.probe + '»');
  console.log(key.padEnd(12), JSON.stringify(update.probe), '→', hits.length, 'card(s)');
  console.log('   e.g. ' + hits[0]);
}

/* ── discrimination: this is the sukūn collision, tested from the cards themselves ────────── */
const amrCards = seenOn(amrProbe);
const mujarradCards = seenOn(mujarradProbe);

/* 1 — the imperative's claim may only ever be made by an imperative token. */
for (const line of amrCards) {
  const tenses = [...linesByTense.get(line)];
  if (tenses.some(t => t !== api.AMR_INFLECTION)) {
    throw new Error('the imperative probe appears on a non-imperative card (' + tenses + '): ' + line);
  }
}
/* 2 — and it may never carry an iʿrāb state, which is what would make it a majzūm present. */
for (const line of amrCards) {
  for (const banned of [api.stateArabic('jazm'), api.stateArabic('raf'), api.stateArabic('nasb')]) {
    if (line.includes(banned)) throw new Error('an imperative card claims an iʿrāb state: ' + line);
  }
}
/* 3 — the mujarrad cause may only ever be made by a present token. */
for (const line of mujarradCards) {
  const tenses = [...linesByTense.get(line)];
  if (tenses.some(t => t !== 'present')) {
    throw new Error('the mujarrad cause appears on a non-present card (' + tenses + '): ' + line);
  }
}
/* 4 — and never beside a governor's own cause, nor on a verb that is not مرفوع. */
for (const line of mujarradCards) {
  if (!line.includes(api.stateArabic('raf'))) throw new Error('a mujarrad card is not مرفوع: ' + line);
  for (const cause of Object.values(api.PRESENT_GOVERNOR_CAUSE_AR)) {
    if (line.includes(cause)) throw new Error('a mujarrad card also names a governor cause: ' + line);
  }
}
/* 5 — the two probes must never share a card. */
if (amrCards.some(line => mujarradCards.includes(line))) {
  throw new Error('the imperative and mujarrad probes share a card, so neither discriminates');
}
console.log('discrimination proved:', amrCards.length, 'imperative card(s),', mujarradCards.length, 'mujarrad card(s), no overlap');

/* ── write ───────────────────────────────────────────────────────────────────────────────── */
const rowsPath = path.join(__dirname, 'iraab-term-rows.js');
let src = fs.readFileSync(rowsPath, 'utf8');

function literalSpans(text, from, count) {
  const spans = [];
  let index = from;
  while (spans.length < count) {
    const open = text.indexOf("'", index);
    if (open < 0) throw new Error('ran out of literals');
    const close = text.indexOf("'", open + 1);
    if (close < 0) throw new Error('unterminated literal');
    spans.push({ start: open + 1, end: close, value: text.slice(open + 1, close) });
    index = close + 1;
  }
  return spans;
}

const FIELDS = ['key', 'term', 'pages', 'parent', 'probe'];
let rewritten = 0;
for (const [key, update] of Object.entries(updates)) {
  const at = src.indexOf("R('" + key + "',");
  if (at < 0) throw new Error('row ' + key + ' not found');
  const spans = literalSpans(src, at, FIELDS.length);
  if (spans[0].value !== key) throw new Error('row ' + key + ' did not start at its own key');
  for (let f = FIELDS.length - 1; f >= 1; f--) {
    const field = FIELDS[f];
    if (!Object.prototype.hasOwnProperty.call(update, field)) continue;
    src = src.slice(0, spans[f].start) + update[field] + src.slice(spans[f].end);
  }
  rewritten++;
}

fs.writeFileSync(rowsPath, src);
delete require.cache[require.resolve(rowsPath)];
const rows = require(rowsPath).rows;
for (const [key, update] of Object.entries(updates)) {
  const row = rows.find(r => r.key === key);
  if (!row) throw new Error('row ' + key + ' vanished');
  for (const field of ['term', 'pages', 'probe']) {
    if (Object.prototype.hasOwnProperty.call(update, field) && row[field] !== update[field]) {
      throw new Error(key + '.' + field + ' did not take: ' + JSON.stringify(row[field]));
    }
  }
  if (!row.parent) throw new Error(key + ' lost its parent column');
  if (row.missingReason) throw new Error(key + ' still carries a missingReason after shipping');
  console.log(key.padEnd(12), 'parent=' + JSON.stringify(row.parent), 'pages=' + JSON.stringify(row.pages));
}
console.log('rows file updated:', rewritten, 'rows');
