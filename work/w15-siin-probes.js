#!/usr/bin/env node
/* ============================================================================
   work/w15-siin-probes.js

   FINAL MARATHON — سِينُ التَّنْفِيسِ (pp. 14–16, parsed at p. 95).

   Writes P_SIN's probe from the app's OWN COMPONENT_REGISTRY, so the inventory never holds a
   second typed copy of the chapter's Arabic. Same contract as w4/w11–w15.

   The old probe was the bare word «التَّنْفِيسِ», which any line merely MENTIONING futurity could
   match. The new one is the whole claim p. 95 makes about the letter — «حَرْفٌ دَالٌّ عَلَى
   التَّنْفِيسِ» — and this script proves it is produced, proves it is produced only on the sīn's
   own component card of a present verb, and proves it does not collide with سَوْفَ, which teaches
   the same meaning through a separate word and holds its own row.
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

/* The claim, composed from the app's own frozen component record: «حَرْفٌ» is the word the renderer
   supplies for a particle component and the rest is the registry's, so the probe is exactly the run
   a learner reads on the card. */
const reg = api.COMPONENT_REGISTRY['siin-tanfiis'];
if (!reg) throw new Error('the sīn component is not registered');
const probe = 'حَرْفٌ ' + reg.functionAr;

/* Every rendered line, tagged with where it came from. */
const lines = new Map();
for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < 20; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      for (const line of [token.ar, token.phraseAr]) {
        if (line) lines.set(line, { source: 'word', tense: token.tense || '' });
      }
      for (const c of token.components || []) {
        if (c.ar) lines.set(c.ar, { source: 'component', tense: token.tense || '', kind: c.kind });
      }
    }
  }
}

const hits = [...lines.entries()].filter(([line]) => line.includes(probe));
if (!hits.length) throw new Error('no rendered card carries «' + probe + '»');
console.log('P_SIN probe, from COMPONENT_REGISTRY[siin-tanfiis]:', JSON.stringify(probe));
for (const [line] of hits) console.log('   ' + line);

/* It is a COMPONENT claim about a PRESENT verb, and nothing else. */
for (const [line, meta] of hits) {
  if (meta.source !== 'component') throw new Error('the sīn claim came from a whole-word card: ' + line);
  if (meta.kind !== 'siin-tanfiis') throw new Error('the sīn claim came from another component: ' + meta.kind);
  if (meta.tense !== 'present') throw new Error('the sīn claim sits on a ' + meta.tense + ' verb: ' + line);
}
console.log('provenance proved: ' + hits.length + ' card(s), all sīn components of present verbs');

/* And it does not collide with سَوْفَ, which teaches the same meaning through a separate WORD and
   holds its own row (P_SAWFA). If the two shared a card the inventory could not tell them apart. */
{
  const rows = require(path.join(__dirname, 'iraab-term-rows.js')).rows;
  const sawfaProbe = rows.find(r => r.key === 'P_SAWFA').probe;
  const sawfaHits = [...lines.keys()].filter(line => line.includes(sawfaProbe));
  if (!sawfaHits.length) throw new Error('سَوْفَ is no longer produced, so the discrimination proves nothing');
  for (const line of sawfaHits) {
    if (line.includes(probe)) throw new Error('one card makes both the sīn and the سوف claim: ' + line);
  }
  console.log('discrimination proved: ' + sawfaHits.length + ' سَوْفَ card(s), none of them a sīn card');
}

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
const at = src.indexOf("R('P_SIN',");
if (at < 0) throw new Error('row P_SIN not found');
const spans = literalSpans(src, at, FIELDS.length);
if (spans[0].value !== 'P_SIN') throw new Error('row P_SIN did not start at its own key');
src = src.slice(0, spans[4].start) + probe + src.slice(spans[4].end);
fs.writeFileSync(rowsPath, src);
delete require.cache[require.resolve(rowsPath)];
const row = require(rowsPath).rows.find(r => r.key === 'P_SIN');
if (!row) throw new Error('row P_SIN vanished');
if (row.probe !== probe) throw new Error('P_SIN.probe did not take: ' + JSON.stringify(row.probe));
if (row.missingReason) throw new Error('P_SIN still carries a missingReason after shipping');
if (!row.parent) throw new Error('P_SIN lost its parent column');
console.log('P_SIN   probe=' + JSON.stringify(row.probe) + '  pages=' + JSON.stringify(row.pages));
console.log('rows file updated: 1 row');
