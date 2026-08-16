#!/usr/bin/env node
/* ============================================================================
   work/marathon-corpus.js

   Final-marathon scratch prober. Loads the app exactly the way the inventory
   checker and the wave probe scripts do, builds every template, and dumps the
   three corpora the checker keeps apart (iʿrāb / why / defs) so a needle can be
   looked up WITHOUT re-running the 53,600-build inventory audit.

   Usage:  node work/marathon-corpus.js  <needle> [<needle> ...]
           node work/marathon-corpus.js  --rounds 40 <needle>

   Nothing Arabic is typed in this file; needles come from argv, which is fed
   from the rows file or from the app's own constants by the caller.
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

const argv = process.argv.slice(2);
let rounds = 24;
const needles = [];
const labels = new Map();
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--rounds') { rounds = Number(argv[++i]); continue; }
  /* --rowkeys K1,K2 pulls each row's OWN probe string out of the authored rows file,
     so no Arabic is ever retyped into an argv. */
  if (argv[i] === '--rowkeys') {
    const rows = require(path.join(__dirname, 'iraab-term-rows.js')).rows;
    for (const key of argv[++i].split(',')) {
      const row = rows.find(r => r.key === key.trim());
      if (!row) throw new Error('no such row: ' + key);
      needles.push(row.probe);
      labels.set(row.probe, key.trim() + ' [' + row.status + ' | mode=' + (row.probeMode || 'contains') + ']');
    }
    continue;
  }
  needles.push(argv[i]);
}

const api = loadApi();

/* Three corpora, kept apart exactly as check-iraab-term-inventory.js keeps them:
   only `iraab` can prove a row FULL. */
const iraab = new Map();   // line -> Set(templateIndex)
const why = new Set();
const defs = new Set();

function note(map, line, idx) {
  if (!line) return;
  if (!map.has(line)) map.set(line, new Set());
  map.get(line).add(idx);
}

for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < rounds; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      note(iraab, token.ar, i);
      note(iraab, token.phraseAr, i);
      for (const c of token.components || []) note(iraab, c.ar, i);
    }
    if (Array.isArray(data.whyTokens)) for (const w of data.whyTokens) { if (w && w.ar) why.add(w.ar); }
    if (Array.isArray(data.whyConstructions)) for (const w of data.whyConstructions) { if (w && w.ar) why.add(w.ar); }
    if (typeof api.collectWhy === 'function') {
      try { for (const w of api.collectWhy(data) || []) { if (w && w.ar) why.add(w.ar); } } catch (e) { /* optional */ }
    }
  }
}
if (typeof api.definitionCorpus === 'function') {
  try { for (const d of api.definitionCorpus() || []) defs.add(d); } catch (e) { /* optional */ }
}

console.log('corpus: ' + iraab.size + ' distinct iʿrāb line(s) from ' + api.templates.length +
            ' templates × ' + rounds + ' round(s); ' + why.size + ' why line(s); ' + defs.size + ' def line(s)');

for (const needle of needles) {
  const hits = [...iraab.entries()].filter(([line]) => line.includes(needle));
  const whyHits = [...why].filter(line => line.includes(needle));
  const defHits = [...defs].filter(line => line.includes(needle));
  const lanes = new Set();
  for (const [, set] of hits) for (const t of set) lanes.add(t);
  console.log('\n=== ' + (labels.get(needle) || '') + ' ' + JSON.stringify(needle) + ' ===');
  console.log('  IʿRĀB : ' + hits.length + ' line(s) across ' + lanes.size + ' template lane(s)');
  for (const [line] of hits.slice(0, 8)) console.log('      | ' + line);
  if (hits.length > 8) console.log('      | … +' + (hits.length - 8) + ' more');
  console.log('  WHY   : ' + whyHits.length + ' line(s)');
  for (const line of whyHits.slice(0, 3)) console.log('      | ' + line);
  console.log('  DEFS  : ' + defHits.length + ' line(s)');
  for (const line of defHits.slice(0, 3)) console.log('      | ' + line);
}
