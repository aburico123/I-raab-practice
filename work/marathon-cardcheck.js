#!/usr/bin/env node
/* work/marathon-cardcheck.js — final-marathon scratch verifier for `mode:'card'` rows.
   Rebuilds the checker's own cardHeads map with the checker's own skeleton(), then shows
   which card a row's probe is really matching. Needles come from the rows file. */
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

/* The checker's skeleton(), SLICED out of work/check-iraab-term-inventory.js rather than
   re-implemented, so the two cannot drift apart. */
const checkerSrc = fs.readFileSync(path.join(__dirname, 'check-iraab-term-inventory.js'), 'utf8');
const skelStart = checkerSrc.indexOf('const skeleton = text =>');
const skelEnd = checkerSrc.indexOf('.trim();', skelStart) + '.trim();'.length;
if (skelStart < 0 || skelEnd < skelStart) throw new Error('could not slice skeleton() out of the checker');
const skeleton = new Function(checkerSrc.slice(skelStart, skelEnd) + '\nreturn skeleton;')();

const api = loadApi();
const rows = require(path.join(__dirname, 'iraab-term-rows.js')).rows;

/* cardHeads: head skeleton -> Set(body skeletons), exactly as the checker builds it. */
const cardHeads = new Map();
const rawByHead = new Map();
for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < 30; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      for (const line of [token.ar, token.phraseAr, ...(token.components || []).map(c => c.ar)]) {
        if (!line) continue;
        const at = line.indexOf(':');
        if (at < 0) continue;
        const head = skeleton(line.slice(0, at));
        const body = skeleton(line.slice(at + 1));
        if (!cardHeads.has(head)) { cardHeads.set(head, new Set()); rawByHead.set(head, new Set()); }
        cardHeads.get(head).add(body);
        rawByHead.get(head).add(line);
      }
    }
  }
}
console.log('distinct card heads: ' + cardHeads.size);

/* ── --mention <KEY>: where, exactly, does a GENERIC_ONLY row's probe live? ─────────────────
   Rebuilds the checker's why/defs corpora the way the checker builds them, so a GENERIC_ONLY
   verdict can be read rather than guessed at — in particular, whether the hit is a real mention
   or a skeleton artefact (skeleton(«مُعْرَبٌ») is "معرب", a substring of "المعربات"). */
if (process.argv[2] === '--mention') {
  const collect = (node, sink) => {
    if (node == null) return;
    if (typeof node === 'string') { sink.push(node); return; }
    if (Array.isArray(node)) { node.forEach(x => collect(x, sink)); return; }
    if (typeof node === 'object') for (const k of Object.keys(node)) collect(node[k], sink);
  };
  const whyText = new Set(), defText = new Set();
  for (let i = 0; i < api.templates.length; i++) {
    for (let r = 0; r < 12; r++) {
      const data = api.buildTemplate(i);
      api.renderExercise(data);
      for (const token of data.tokens) {
        const sink = [];
        collect(token.why, sink); collect(token.phraseWhy, sink);
        for (const line of sink) if (/[؀-ۿ]/.test(line)) whyText.add(line);
      }
    }
  }
  { const sink = []; collect(api.grammarDefinitionGroups, sink);
    for (const line of sink) if (/[؀-ۿ]/.test(line)) defText.add(line); }
  console.log('why lines: ' + whyText.size + ', def lines: ' + defText.size);
  for (const key of process.argv.slice(3)) {
    const row = rows.find(r => r.key === key);
    if (!row) { console.log(key + ': no such row'); continue; }
    const s = skeleton(row.probe);
    console.log('\n=== ' + key + '  probe=' + JSON.stringify(row.probe) + '  skeleton=' + JSON.stringify(s));
    for (const [label, corpus] of [['WHY', whyText], ['DEFS', defText]]) {
      const folded = [...corpus].filter(l => skeleton(l).includes(s));
      const exact = folded.filter(l => l.includes(row.probe));
      console.log('  ' + label + ': ' + folded.length + ' folded hit(s), ' + exact.length + ' spelling it exactly');
      for (const l of folded.slice(0, 4)) console.log('     | ' + l.slice(0, 240));
    }
  }
  process.exit(0);
}

/* ── GLOBAL AUDIT: every card-mode row whose skeleton head is AMBIGUOUS ──────────────────────
   Two different raw spellings that fold to one skeleton head is exactly how B_ZARF_THAMMA
   («ثَمَّ») came to be scored FULL by «ثُمَّ» the ḥarf ʿaṭf. A row in that position is only
   honest if it declares a `requires` that separates the readings. */
if (process.argv[2] === '--audit') {
  const rawHeads = new Map();  // skeleton head -> Set(raw heads)
  for (const [head, lineSet] of rawByHead) {
    const raws = new Set();
    for (const line of lineSet) raws.add(line.slice(0, line.indexOf(':')));
    rawHeads.set(head, raws);
  }
  let flagged = 0;
  for (const row of rows) {
    if ((row.mode || 'contains') !== 'card') continue;
    const h = skeleton(row.probe);
    const raws = rawHeads.get(h);
    if (!raws) continue;                       // not produced at all — nothing to confuse
    const exact = [...raws].some(r => r.includes(row.probe));
    const ambiguous = raws.size > 1;
    if (!exact || ambiguous) {
      flagged++;
      console.log('\n!! ' + row.key + '  probe=' + JSON.stringify(row.probe) +
                  '  skeleton=' + JSON.stringify(h) +
                  '  requires=' + (row.requires ? JSON.stringify(row.requires) : 'NONE'));
      console.log('   raw heads folding to it: ' + [...raws].map(r => JSON.stringify(r)).join(', '));
      console.log('   probe occurs as exact bytes in a head: ' + exact);
    }
  }
  console.log('\ncard-mode rows audited: ' + rows.filter(r => (r.mode || 'contains') === 'card').length +
              '; flagged: ' + flagged);
  process.exit(0);
}

for (const key of process.argv.slice(2)) {
  const row = rows.find(r => r.key === key);
  if (!row) { console.log(key + ': no such row'); continue; }
  const h = skeleton(row.probe);
  const need = row.requires ? skeleton(row.requires) : null;
  const bodies = cardHeads.get(h);
  const ok = !!bodies && (!need || [...bodies].some(b => b.includes(need)));
  console.log('\n=== ' + key + ' mode=' + (row.mode || 'contains') + ' ===');
  console.log('  probe    : ' + JSON.stringify(row.probe) + '  → skeleton ' + JSON.stringify(h));
  console.log('  requires : ' + (row.requires ? JSON.stringify(row.requires) : '(none)'));
  console.log('  card head found: ' + !!bodies + '   passes: ' + ok);
  if (bodies) {
    console.log('  the ACTUAL rendered cards under that skeleton head:');
    for (const line of [...rawByHead.get(h)].slice(0, 6)) console.log('     | ' + line);
  }
  /* And separately: does the probe's EXACT bytes ever occur anywhere at all? */
  let exact = 0;
  for (const set of rawByHead.values()) for (const line of set) if (line.includes(row.probe)) exact++;
  console.log('  exact-byte occurrences of the probe in any card: ' + exact);
}
