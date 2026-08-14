#!/usr/bin/env node
/* ============================================================================
   work/w4-probes.js

   Derives the Wave-4 probe strings from the APP's own rendered iʿrāb rather than
   typing them a second time, then writes them into work/iraab-term-rows.js.

   Two independently typed copies of the same Arabic is how combining-mark ORDER has
   drifted invisibly in this repo before — «إِنَّ» typed fatḥah-before-shaddah against
   the app's shaddah-before-fatḥah — and a probe that drifts reports a false ABSENT.
   Run this whenever a Wave-4 learner-facing clause changes.
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
const all = [...lines];

function grab(re, label) {
  for (const line of all) {
    const m = re.exec(line);
    if (m) return m[0];
  }
  throw new Error('no rendered iʿrāb line matched ' + label);
}

const found = {
  T_NAAT_HAQIQI: grab(/نَعْتٌ\s+حَقِيقِيٌّ/u, 'naat haqiqi'),
  T_NAAT_SABABI: grab(/نَعْتٌ\s+سَبَبِيٌّ/u, 'naat sababi'),
  T_MARIFA_DAMIR: grab(/مَعْرِفَةٌ، وَنَوْعُهَا الضَّمِيرُ/u, 'marifa damir'),
  T_MARIFA_ALAM: grab(/مَعْرِفَةٌ، وَنَوْعُهَا الْعَلَمُ/u, 'marifa alam'),
  T_MARIFA_ISHARA: grab(/مَعْرِفَةٌ، وَنَوْعُهَا اسْمُ الْإِشَارَةِ/u, 'marifa ishara'),
  T_MARIFA_AL: grab(/مَعْرِفَةٌ، وَنَوْعُهَا الْمُحَلَّى بِأَلْ/u, 'marifa al')
};
for (const [key, value] of Object.entries(found)) console.log(key, '=>', JSON.stringify(value));

const rowsPath = path.join(__dirname, 'iraab-term-rows.js');
const src = fs.readFileSync(rowsPath, 'utf8');
const out = src.split('\n').map(line => {
  const trimmed = line.trimStart();
  for (const key of Object.keys(found)) {
    if (!trimmed.startsWith("R('" + key + "',")) continue;
    const last = line.lastIndexOf("'");
    const first = line.lastIndexOf("'", last - 1);
    if (first < 0) throw new Error('no probe literal on the row line for ' + key);
    return line.slice(0, first + 1) + found[key] + line.slice(last);
  }
  return line;
}).join('\n');
if (out === src) throw new Error('no row line was rewritten');
fs.writeFileSync(rowsPath, out);
console.log('rows file updated');
