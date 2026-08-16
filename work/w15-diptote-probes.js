#!/usr/bin/env node
/* ============================================================================
   work/w15-diptote-probes.js

   FINAL MARATHON — باب نيابة الفتحة عن الكسرة (pp. 52–55).

   Writes G_DIPTOTE's probe from the app's OWN GRAMMAR_SIGNS.fathaSub, so the inventory
   never holds a second typed copy of the chapter's one new Arabic string. Same contract as
   w4/w11–w15 and w15-zarf-probes.

   The old probe was the bare tail «نِيَابَةً عَنِ الْكَسْرَةِ». The whole sign is stronger and
   is what the learner actually reads, and this script proves three things about it: that it is
   produced, that it is produced ONLY on a ممنوع من الصرف noun in khafḍ, and that it cannot be
   confused with the mirror substitution the sound feminine plural owns.
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

const substitution = api.GRAMMAR_SIGNS.fathaSub.ar;
const mirror = api.GRAMMAR_SIGNS.kasraSub.ar;
if (!substitution || !mirror) throw new Error('the app did not export both substitution signs');
if (substitution === mirror) throw new Error('the two substitutions render identically');

/* Every rendered card, tagged with the declension of the token that produced it. */
const cards = [];
for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < 20; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      for (const line of [token.ar, token.phraseAr]) {
        if (line) cards.push({ line, inflection: token.inflection || '', state: token.state || '' });
      }
    }
  }
}

const hits = cards.filter(c => c.line.includes(substitution));
if (!hits.length) throw new Error('no rendered card carries the fatḥah substitution');
console.log('G_DIPTOTE probe, from GRAMMAR_SIGNS.fathaSub.ar:', JSON.stringify(substitution));
console.log('  observed on ' + hits.length + ' card(s), e.g.');
for (const c of [...new Set(hits.map(h => h.line))].slice(0, 4)) console.log('    ' + c);

/* «مَوْضِعٌ وَاحِدٌ» — p. 52's exhaustive clause, checked against the corpus. */
for (const hit of hits) {
  if (hit.inflection !== 'mamnu') throw new Error('the substitution reached a ' + hit.inflection + ' noun: ' + hit.line);
  if (hit.state !== 'jarr') throw new Error('the substitution reached a non-khafḍ card: ' + hit.line);
}
console.log('exclusivity proved: every card carrying it is a ممنوع من الصرف noun in khafḍ');

/* And the mirror substitution must still be produced, and must never share a card — otherwise the
   probe is not discriminating between the two, it is merely the only one that exists. */
const mirrorHits = cards.filter(c => c.line.includes(mirror));
if (!mirrorHits.length) throw new Error('the kasrah substitution is no longer produced, so the probe discriminates against nothing');
for (const hit of mirrorHits) {
  if (hit.line.includes(substitution)) throw new Error('one card claims both substitutions: ' + hit.line);
}
console.log('discrimination proved: ' + mirrorHits.length + ' card(s) carry the mirror kasrah substitution, none of them this one');

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
const updates = { G_DIPTOTE: { probe: substitution } };
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
}
fs.writeFileSync(rowsPath, src);
delete require.cache[require.resolve(rowsPath)];
const rows = require(rowsPath).rows;
const row = rows.find(r => r.key === 'G_DIPTOTE');
if (!row) throw new Error('row G_DIPTOTE vanished');
if (row.probe !== substitution) throw new Error('G_DIPTOTE.probe did not take: ' + JSON.stringify(row.probe));
if (row.missingReason) throw new Error('G_DIPTOTE still carries a missingReason after shipping');
if (!row.parent) throw new Error('G_DIPTOTE lost its parent column');
console.log('G_DIPTOTE   probe=' + JSON.stringify(row.probe) + '  pages=' + JSON.stringify(row.pages));
console.log('rows file updated: 1 row');
