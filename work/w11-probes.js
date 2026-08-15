#!/usr/bin/env node
/* ============================================================================
   work/w11-probes.js

   Wave 11 — derives the two باب العطف probe strings from the APP's own frozen
   conjunction registry and its RENDERED iʿrāb card, then writes them into
   work/iraab-term-rows.js. Same contract, and same reason, as work/w4-probes.js:
   two independently typed copies of the same Arabic is how combining-mark ORDER
   has drifted invisibly in this repo before, and a probe that drifts reports a
   false ABSENT — which is precisely the failure this wave was called to fix.

   T_ATF_WAW / T_ATF_FA use mode:'card', so BOTH literals matter:
     · the row's probe    ← the card HEAD, i.e. the particle's rendered surface
     · the row's requires ← the identity named in that card's BODY
   Both are read from ATF_CONJUNCTION_REGISTRY and then CHECKED against a real
   rendered card before anything is written, so the file can never be updated to
   a string the learner does not actually see.
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

/* Every rendered iʿrāb line, exactly as the inventory checker collects them. */
const lines = new Set();
for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < 40; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      for (const line of [token.ar, token.phraseAr, ...(token.components || []).map(c => c.ar)]) {
        if (line) lines.add(line);
      }
    }
  }
}

const TARGETS = { T_ATF_WAW: 'waw', T_ATF_FA: 'fa' };
const found = {};
for (const [key, registryKey] of Object.entries(TARGETS)) {
  const record = api.ATF_CONJUNCTION_REGISTRY[registryKey];
  if (!record) throw new Error('no ʿaṭf registry record for ' + registryKey);
  const probe = record.surface, requires = record.nameAr;
  /* The card must actually exist, be headed by this surface, and name this identity. */
  const card = [...lines].find(line => {
    const head = /^(\S+):\s*([\s\S]+)$/.exec(line);
    return head && head[1] === probe && head[2].includes(requires);
  });
  if (!card) throw new Error('no rendered card is headed «' + probe + '» and names «' + requires + '»');
  if (!card.includes('حَرْفُ عَطْفٍ')) throw new Error('the ' + registryKey + ' card is not a ḥarf ʿaṭf card');
  found[key] = { probe, requires, card };
}
for (const [key, value] of Object.entries(found)) {
  console.log(key, '=> probe', JSON.stringify(value.probe), 'requires', JSON.stringify(value.requires));
  console.log('   card:', value.card);
}

const rowsPath = path.join(__dirname, 'iraab-term-rows.js');
const src = fs.readFileSync(rowsPath, 'utf8');
const srcLines = src.split('\n');
let rewritten = 0;
for (let i = 0; i < srcLines.length; i++) {
  const trimmed = srcLines[i].trimStart();
  for (const key of Object.keys(found)) {
    if (!trimmed.startsWith("R('" + key + "',")) continue;
    /* the probe is the last quoted literal on the R( line */
    const last = srcLines[i].lastIndexOf("'");
    const first = srcLines[i].lastIndexOf("'", last - 1);
    if (first < 0) throw new Error('no probe literal on the row line for ' + key);
    srcLines[i] = srcLines[i].slice(0, first + 1) + found[key].probe + srcLines[i].slice(last);
    /* the requires literal sits in the opts object on the following line */
    const opts = srcLines[i + 1];
    const m = /requires:\s*'([^']*)'/.exec(opts || '');
    if (!m) throw new Error('no requires literal beneath the row line for ' + key);
    srcLines[i + 1] = opts.slice(0, m.index) + "requires: '" + found[key].requires + "'" +
      opts.slice(m.index + m[0].length);
    rewritten++;
  }
}
if (rewritten !== Object.keys(found).length) throw new Error('expected to rewrite every target row');
fs.writeFileSync(rowsPath, srcLines.join('\n'));
console.log('rows file updated:', rewritten, 'rows');
