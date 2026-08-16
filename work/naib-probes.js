#!/usr/bin/env node
/* work/naib-probes.js — نَائِبُ فَاعِلٍ مُضْمَرٌ scratch probe.
   Builds the lane, prints the cards, and runs the build → snapshot → restore → validate
   round trip that this row exists to prove.  Usage:
     node work/naib-probes.js build
     node work/naib-probes.js roundtrip
     node work/naib-probes.js negatives
*/
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
const mode = process.argv[2] || 'build';

const laneIndexes = api.templates
  .map((t, i) => [t, i])
  .filter(([t]) => t.naibMudmarVerbKeys && t.naibMudmarVerbKeys.length);

if (!laneIndexes.length) { console.log('NO NAIB-MUDMAR TEMPLATES REGISTERED'); process.exit(1); }

function show(data) {
  console.log('  templateId : ' + data.templateId);
  console.log('  tuple      : ' + [data.templateStarts, data.templateForm, data.templateState, JSON.stringify(data.templateSign)].join(' / '));
  console.log('  sentence   : ' + data.sentence);
  console.log('  translation: ' + data.translation);
  for (const tok of data.tokens) {
    console.log('  ── ' + tok.word + (tok.target ? '   ★TARGET' : '') + '   gloss="' + tok.gloss + '"');
    console.log('     IʿRĀB : ' + tok.ar);
    console.log('     EN    : ' + tok.en);
    for (const c of tok.components || []) {
      console.log('     COMP  : ' + c.ar + (c.focusable ? '   [focusable]' : ''));
      console.log('     COMPEN: ' + c.en);
    }
    for (const line of (tok.why && tok.why.ar) || []) console.log('     WHY   : ' + line);
    for (const line of (tok.why && tok.why.en) || []) console.log('     WHYEN : ' + line);
  }
  const focus = data.tokens.find(t => t.target);
  console.log('  focusDescriptor: ' + JSON.stringify(api.focusDescriptor(focus), (k, v) => k === 'component' ? (v && v.kind) : v));
}

if (mode === 'build') {
  for (const [t, i] of laneIndexes) {
    console.log('\n================ ' + t.stableId + ' [' + t.naibMudmarVerbKeys.join(',') + '] ================');
    const data = api.buildTemplate(i);
    show(data);
  }
  process.exit(0);
}

if (mode === 'roundtrip') {
  let bad = 0;
  for (const [t, i] of laneIndexes) {
    console.log('\n================ ' + t.stableId + ' ================');
    const built = api.buildTemplate(i);
    const snapshot = api.createExerciseSnapshot(built);
    console.log('  snapshot          : ' + (snapshot ? 'OK' : 'NULL'));
    if (!snapshot) { bad++; continue; }
    const restored = api.restoreExerciseSnapshot(snapshot);
    console.log('  restore           : ' + (restored ? 'OK' : 'NULL'));
    if (!restored) { bad++; continue; }
    const failures = api.validateExercise(restored);
    console.log('  validate(restored): ' + (failures.length ? JSON.stringify(failures) : 'OK'));
    const same = k => JSON.stringify(built[k]) === JSON.stringify(restored[k]);
    console.log('  sentence identical: ' + same('sentence'));
    console.log('  translation ident. : ' + same('translation') + '   [' + restored.translation + ']');
    const bt = built.tokens, rt = restored.tokens;
    console.log('  token.ar identical : ' + bt.every((tok, n) => tok.ar === rt[n].ar));
    console.log('  token.en identical : ' + bt.every((tok, n) => tok.en === rt[n].en));
    console.log('  gloss identical    : ' + bt.every((tok, n) => tok.gloss === rt[n].gloss));
    console.log('  components ident.  : ' + (JSON.stringify(bt.map(x => (x.components || []).map(c => c.ar))) === JSON.stringify(rt.map(x => (x.components || []).map(c => c.ar)))));
    console.log('  why identical      : ' + bt.every((tok, n) => JSON.stringify(tok.why) === JSON.stringify(rt[n].why)));
    const rf = rt.find(x => x.target);
    const fd = api.focusDescriptor(rf);
    console.log('  restored focus     : ' + JSON.stringify(fd, (k, v) => k === 'component' ? (v && v.kind) : v));
    if (failures.length || !same('sentence') || !same('translation')) bad++;
  }
  process.exit(bad ? 1 : 0);
}

console.log('unknown mode: ' + mode);
process.exit(2);
