#!/usr/bin/env node
/* work/marathon-inspect.js — final-marathon scratch inspector.
   Dumps live rendered lines selected by a PREDICATE over the app's own frozen
   constants, so no Arabic is ever retyped. Usage:
     node work/marathon-inspect.js components
     node work/marathon-inspect.js role maful
     node work/marathon-inspect.js api                     (list exported keys)
     node work/marathon-inspect.js grepconst <substr>       (constants whose name matches)
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
const [mode, arg] = process.argv.slice(2);

if (mode === 'api') {
  console.log(Object.keys(api).sort().join('\n'));
  process.exit(0);
}
if (mode === 'zarf') {
  const L = api.MAFUL_FIH_LEXEMES;
  const byKind = {};
  for (const [k, v] of Object.entries(L)) {
    const kind = v.kind || '(none)';
    (byKind[kind] = byKind[kind] || []).push((v.acc || v.surface || k) + (v.class ? ' [' + v.class + ']' : ''));
  }
  for (const [kind, list] of Object.entries(byKind)) console.log(kind + ' (' + list.length + '): ' + list.join(' ، '));
  console.log('KIND LABELS  : ' + JSON.stringify(api.MAFUL_FIH_KIND_LABELS));
  console.log('CLASS LABELS : ' + JSON.stringify(api.MAFUL_FIH_CLASS_LABELS));
  process.exit(0);
}
if (mode === 'grepconst') {
  for (const k of Object.keys(api).sort()) {
    if (!k.toLowerCase().includes(String(arg).toLowerCase())) continue;
    let v = api[k];
    if (typeof v === 'function') { console.log(k, '= [function]'); continue; }
    try { v = JSON.stringify(v); } catch (e) { v = String(v); }
    console.log(k, '=', String(v).slice(0, 400));
  }
  process.exit(0);
}

/* Build the corpus, keeping component lines separate from whole-word lines. */
const wordLines = new Set();
const compLines = new Map();   // line -> kind
const rounds = 24;
for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < rounds; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      if (token.ar) wordLines.add(token.ar);
      if (token.phraseAr) wordLines.add(token.phraseAr);
      for (const c of token.components || []) if (c.ar) compLines.set(c.ar, c.kind);
    }
  }
}

if (mode === 'components') {
  console.log('distinct component lines: ' + compLines.size);
  const byKind = new Map();
  for (const [line, kind] of compLines) {
    if (!byKind.has(kind)) byKind.set(kind, []);
    byKind.get(kind).push(line);
  }
  for (const [kind, list] of [...byKind].sort()) {
    console.log('\n--- ' + kind + ' (' + list.length + ') ---');
    for (const line of list) console.log('   ' + line);
  }
  process.exit(0);
}
if (mode === 'role') {
  const needle = api.COMPONENT_ROLE_AR ? api.COMPONENT_ROLE_AR[arg] : null;
  if (!needle) { console.log('no COMPONENT_ROLE_AR entry for ' + arg + '; exported? ' + !!api.COMPONENT_ROLE_AR); process.exit(1); }
  console.log('needle from app constant COMPONENT_ROLE_AR[' + arg + '] = ' + JSON.stringify(needle));
  const comp = [...compLines.keys()].filter(l => l.includes(needle));
  const word = [...wordLines].filter(l => l.includes(needle));
  console.log('\ncomponent lines carrying it: ' + comp.length);
  for (const l of comp) console.log('   ' + l);
  console.log('\nwhole-word lines carrying it: ' + word.length);
  for (const l of word.slice(0, 20)) console.log('   ' + l);
  process.exit(0);
}
console.log('unknown mode');
process.exit(1);
