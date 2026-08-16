#!/usr/bin/env node
/* ============================================================================
   work/w15-probes.js

   FINAL MARATHON — Chapter «باب المفعول به»، قسم المضمر المتصل.

   Same contract and same reason as w4/w11/w12/w13/w14-probes.js: two independently
   typed copies of one Arabic string is how combining-mark ORDER has drifted invisibly
   in this repo before, so nothing Arabic is typed here. Every value written into
   work/iraab-term-rows.js is composed from the app's OWN frozen label tables and is
   then checked against real rendered cards.

   ONE row is rewritten:

     B_MAFUL_MUDMAR_MUTTASIL   probe + requires. The old probe «مَفْعُولٌ بِهِ مُتَّصِلٌ»
                               welded two of the app's labels together in an order no card
                               renders, and scored a FALSE ABSENT on a lane that has been
                               producing since Phase 0. The attached object pronoun's card is
                               «… ضَمِيرٌ مُتَّصِلٌ مَبْنِيٌّ عَلَى السُّكُونِ فِي مَحَلِّ نَصْبٍ
                               مَفْعُولٌ بِهِ» — class first, role last. The probe is now the
                               ROLE (COMPONENT_ROLE_AR.maful) and the discriminator is the
                               CLASS (COMPONENT_ATTACHED_PRONOUN_AR), which is exactly the
                               two-part claim «مفعول به مضمر متصل» makes.

   The discrimination that matters is against the WHOLE-WORD mafʿūl bihi, which shares the
   role label and is a different row (B_MAFUL_BIH). It is proved from the cards themselves.
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

/* Every rendered iʿrāb line, tagged with whether it came from a word-internal COMPONENT or from
   the whole visible word. That tag is the thing the corrected probe has to be able to separate. */
const lines = new Map();   // line -> 'component' | 'word'
for (let i = 0; i < api.templates.length; i++) {
  for (let r = 0; r < 40; r++) {
    const data = api.buildTemplate(i);
    api.renderExercise(data);
    for (const token of data.tokens) {
      for (const line of [token.ar, token.phraseAr]) if (line) lines.set(line, 'word');
      for (const c of token.components || []) if (c.ar) lines.set(c.ar, 'component');
    }
  }
}
const seenOn = (needle, extra) => [...lines.keys()]
  .filter(line => line.includes(needle) && (!extra || line.includes(extra)));

/* ── the two values, taken from the app's own frozen tables ───────────────────────────────── */
const mafulRole = api.COMPONENT_ROLE_AR.maful;
const attachedClass = api.COMPONENT_ATTACHED_PRONOUN_AR;
if (!mafulRole || !attachedClass) throw new Error('the app did not export the component label tables');

const updates = {
  B_MAFUL_MUDMAR_MUTTASIL: { probe: mafulRole, requires: attachedClass }
};

/* ── the row must actually be observed, on a COMPONENT card ───────────────────────────────── */
const bothCards = seenOn(mafulRole, attachedClass);
if (!bothCards.length) throw new Error('no rendered card carries both the object role and the attached-pronoun class');
for (const line of bothCards) {
  if (lines.get(line) !== 'component') throw new Error('an attached-object claim came from a whole-word card: ' + line);
}
console.log('B_MAFUL_MUDMAR_MUTTASIL', JSON.stringify(mafulRole), '+', JSON.stringify(attachedClass),
            '→', bothCards.length, 'component card(s)');
for (const line of bothCards) console.log('   ' + line);

/* ── discrimination 1: the ROLE alone is NOT enough — that is the whole-word row ───────────── */
const roleOnly = seenOn(mafulRole);
const wordRoleCards = roleOnly.filter(line => lines.get(line) === 'word');
if (!wordRoleCards.length) {
  throw new Error('no whole-word mafʿūl card exists, so the discriminator proves nothing');
}
for (const line of wordRoleCards) {
  if (line.includes(attachedClass)) throw new Error('a whole-word mafʿūl card claims to be an attached pronoun: ' + line);
}
console.log('discrimination: ' + wordRoleCards.length + ' whole-word mafʿūl card(s) carry the role and are correctly excluded by the discriminator');

/* ── discrimination 2: the CLASS alone is not enough either — most of it is the fāʿil ──────── */
const classOnly = seenOn(attachedClass);
const failClassCards = classOnly.filter(line => !line.includes(mafulRole));
if (!failClassCards.length) throw new Error('every attached-pronoun card is an object, so the role adds nothing');
console.log('discrimination: ' + failClassCards.length + ' attached-pronoun card(s) are NOT objects and are correctly excluded by the role');

/* ── discrimination 3: the OLD probe must still find nothing, which is why it was wrong ────── */
const oldProbe = mafulRole + ' ' + attachedClass.split(' ').slice(-1)[0];
if (seenOn(oldProbe).length) throw new Error('the old welded probe unexpectedly matches: ' + oldProbe);
console.log('the superseded welded probe ' + JSON.stringify(oldProbe) + ' matches 0 cards — it was a false ABSENT');

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

const FIELDS = ['key', 'term', 'pages', 'parent', 'probe', 'requires'];
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
  for (const field of ['probe', 'requires']) {
    if (Object.prototype.hasOwnProperty.call(update, field) && row[field] !== update[field]) {
      throw new Error(key + '.' + field + ' did not take: ' + JSON.stringify(row[field]));
    }
  }
  if (!row.parent) throw new Error(key + ' lost its parent column');
  if (row.missingReason) throw new Error(key + ' still carries a missingReason after shipping');
  console.log(key.padEnd(26), 'probe=' + JSON.stringify(row.probe), 'requires=' + JSON.stringify(row.requires));
}
console.log('rows file updated:', rewritten, 'row(s)');
