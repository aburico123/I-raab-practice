#!/usr/bin/env node
/* ============================================================================
   work/w15-zarf-probes.js

   FINAL MARATHON — باب ظرف الزمان وظرف المكان.

   Writes the place-ẓarf discriminator into the two built-ẓarf rows from the app's OWN
   MAFUL_FIH_KIND_LABELS, so nothing Arabic is typed here (same contract as w4/w11–w15).

   WHY THESE ROWS NEEDED A DISCRIMINATOR AT ALL. B_ZARF_THAMMA was scored FULL by a
   skeleton collision: the inventory folds every ḥarakah away before matching, and
   skeleton(«ثَمَّ») is "ثم" — which is also skeleton(«ثُمَّ»), the ḥarf ʿaṭf this app
   really does produce. The row's card-mode probe declared no `requires`, so the
   conjunction's card answered for the ẓarf. This script proves the collision exists,
   proves the discriminator separates it, and proves the ẓarf itself is genuinely absent.
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

/* skeleton(), SLICED out of the inventory checker so the two cannot drift apart. */
const checkerSrc = fs.readFileSync(path.join(__dirname, 'check-iraab-term-inventory.js'), 'utf8');
const skelStart = checkerSrc.indexOf('const skeleton = text =>');
const skelEnd = checkerSrc.indexOf('.trim();', skelStart) + '.trim();'.length;
if (skelStart < 0 || skelEnd < skelStart) throw new Error('could not slice skeleton() out of the checker');
const skeleton = new Function(checkerSrc.slice(skelStart, skelEnd) + '\nreturn skeleton;')();

const api = loadApi();

/* Every rendered card, split into head and body exactly as the checker splits it. */
const cards = [];
for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < 30; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      for (const line of [token.ar, token.phraseAr, ...(token.components || []).map(c => c.ar)]) {
        if (!line) continue;
        const at = line.indexOf(':');
        if (at < 0) continue;
        cards.push({ line, head: line.slice(0, at), body: line.slice(at + 1) });
      }
    }
  }
}

/* ── the value, taken from the app's own frozen label table ───────────────────────────────── */
const placeLabel = api.MAFUL_FIH_KIND_LABELS.place.ar;
if (!placeLabel) throw new Error('the app did not export the ẓarf kind labels');
const updates = {
  B_ZARF_THAMMA: { requires: placeLabel },
  B_ZARF_HUNA: { requires: placeLabel }
};
console.log('place-ẓarf discriminator, from MAFUL_FIH_KIND_LABELS.place.ar:', JSON.stringify(placeLabel));

const rowsPath = path.join(__dirname, 'iraab-term-rows.js');
let rows = require(rowsPath).rows;

/* ── 1. the collision is REAL: the ẓarf's skeleton head is produced, by another word ───────── */
{
  const probe = rows.find(r => r.key === 'B_ZARF_THAMMA').probe;
  const h = skeleton(probe);
  const heads = new Set(cards.filter(c => skeleton(c.head) === h).map(c => c.head));
  if (!heads.size) throw new Error('nothing folds to the ẓarf head, so there was no collision to fix');
  const exact = [...heads].filter(head => head.includes(probe));
  if (exact.length) throw new Error('the ẓarf ثَمَّ is actually produced; this is not a false FULL after all');
  console.log('collision proved: skeleton ' + JSON.stringify(h) + ' is produced by ' +
              [...heads].map(x => JSON.stringify(x)).join(', ') + ' and by no card spelling the ẓarf');
}

/* ── 2. the discriminator SEPARATES it: no colliding card body claims to be a place ẓarf ───── */
{
  const need = skeleton(placeLabel);
  for (const key of Object.keys(updates)) {
    const h = skeleton(rows.find(r => r.key === key).probe);
    const colliding = cards.filter(c => skeleton(c.head) === h);
    const survivors = colliding.filter(c => skeleton(c.body).includes(need));
    if (survivors.length) {
      throw new Error(key + ': a colliding card still passes the discriminator: ' + survivors[0].line);
    }
    console.log(key.padEnd(16), colliding.length + ' colliding card(s), 0 survive the discriminator');
  }
}

/* ── 3. the discriminator is not vacuous: real place-ẓarf cards DO carry it ────────────────── */
{
  const need = skeleton(placeLabel);
  const real = cards.filter(c => skeleton(c.body).includes(need));
  if (!real.length) throw new Error('no card carries the place-ẓarf label, so the discriminator can never pass');
  console.log('discriminator is live: ' + real.length + ' place-ẓarf card(s) carry it, e.g.');
  console.log('   ' + real[0].line);
}

/* ── write ───────────────────────────────────────────────────────────────────────────────── */
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
/* The single-quoted literals of these rows, in source order. `mode` sits between the probe and
   the requires, so it is named here rather than skipped — a positional rewriter must count it. */
const FIELDS = ['key', 'term', 'pages', 'parent', 'probe', 'mode', 'requires'];
let rewritten = 0;
for (const [key, update] of Object.entries(updates)) {
  const at = src.indexOf("R('" + key + "',");
  if (at < 0) throw new Error('row ' + key + ' not found');
  const spans = literalSpans(src, at, FIELDS.length);
  if (spans[0].value !== key) throw new Error('row ' + key + ' did not start at its own key');
  if (spans[5].value !== 'card') throw new Error('row ' + key + ' literal 6 is not the mode: ' + spans[5].value);
  for (let f = FIELDS.length - 1; f >= 1; f--) {
    const field = FIELDS[f];
    if (!Object.prototype.hasOwnProperty.call(update, field)) continue;
    src = src.slice(0, spans[f].start) + update[field] + src.slice(spans[f].end);
  }
  rewritten++;
}
fs.writeFileSync(rowsPath, src);
delete require.cache[require.resolve(rowsPath)];
rows = require(rowsPath).rows;
for (const [key, update] of Object.entries(updates)) {
  const row = rows.find(r => r.key === key);
  if (!row) throw new Error('row ' + key + ' vanished');
  if (row.requires !== update.requires) throw new Error(key + '.requires did not take: ' + JSON.stringify(row.requires));
  if (row.mode !== 'card') throw new Error(key + ' lost its card mode');
  if (!row.trueBlocker) throw new Error(key + ' lost its blocker proof');
  console.log(key.padEnd(16), 'mode=' + row.mode, 'requires=' + JSON.stringify(row.requires));
}
console.log('rows file updated:', rewritten, 'row(s)');
