#!/usr/bin/env node
/* ============================================================================
   work/w13-probes.js

   Wave 13 — derives the بَابُ الْمُبْتَدَأِ وَالْخَبَرِ probe strings from the APP's own frozen
   registries and its RENDERED iʿrāb cards, then writes them into work/iraab-term-rows.js. Same
   contract, and the same reason, as work/w4-probes.js, work/w11-probes.js and work/w12-probes.js:
   two independently typed copies of one Arabic string is how combining-mark ORDER has drifted
   invisibly in this repo before, and this wave met that drift twice in one sitting — a hand-typed
   «مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ» and a hand-typed «مُقَدَّمٍ» both rendered identically to the file's
   own bytes and both compared UNEQUAL. Nothing Arabic is typed in this file.

   Two rows are rewritten, and they are a matched pair:

     M_ZARF_MUTAALLIQ  term + probe. The row asked for «ظَرْفٌ مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ», which is
                       not what this source says. p. 104 parses «محمد عندك» as «عند: ظرف مكان متعلق
                       بمحذوف خبر المبتدإ» — ظَرْفُ مَكَانٍ, the kind named, exactly as the app's own
                       MAFUL_FIH_KIND_LABELS already words it. The probe now asks for what the
                       source actually teaches.

     M_JARR_MUTAALLIQ  probe only, and it is a CORRECTION, not a tidy-up. Its probe was the bare
                       shared clause «مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ», which both شبه الجملة cards carry:
                       once Wave 13 produced the ẓarf half, a ẓarf card alone would have scored the
                       jār-majrūr row FULL. Each row now names its own half of p. 102's division, so
                       neither can be credited by the other's card — the same discrimination Wave 12
                       had to add to the two estimated ḍammahs.
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
const seenOn = needle => [...lines].filter(line => line.includes(needle));

/* ── the two values, composed from the app's own constants and then CHECKED on a real card ── */
const shared = api.MUTAALLIQ_MAHDHUF_KHABAR_AR;                 // «مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ»
const jarrProbe = `${api.JARR_MAJRUR_NAME_AR} ${shared}`;
/* The ẓarf's name is read from the lexeme of a real registered frame, so the probe cannot name a
   kind the production lanes do not actually have. */
const zarfKinds = new Set(api.ZARF_KHABAR_FRAME_KEYS
  .map(key => api.zarfKhabarFrameRecord(key).lexeme.kind));
if (zarfKinds.size !== 1) throw new Error('the ẓarf-khabar frames span more than one ẓarf kind: ' + [...zarfKinds]);
const zarfProbe = `${api.MAFUL_FIH_KIND_LABELS[[...zarfKinds][0]].ar} ${shared}`;

const updates = {
  M_ZARF_MUTAALLIQ: { term: zarfProbe, probe: zarfProbe, pages: '101–104' },
  M_JARR_MUTAALLIQ: { probe: jarrProbe }
};

for (const [key, update] of Object.entries(updates)) {
  const hits = seenOn(update.probe);
  if (!hits.length) throw new Error(key + ': no rendered card contains «' + update.probe + '»');
  console.log(key.padEnd(18), JSON.stringify(update.probe), '→', hits.length, 'card(s)');
  console.log('   e.g. ' + hits[0]);
}
/* The whole point: the two probes must never share a card. */
if (seenOn(zarfProbe).some(line => seenOn(jarrProbe).includes(line))) {
  throw new Error('the two shibh-jumlah probes share a card, so neither discriminates');
}
/* And each must be on a card of its own kind, not merely somewhere. */
for (const line of seenOn(zarfProbe)) {
  if (line.includes(api.JARR_MAJRUR_NAME_AR)) throw new Error('a ẓarf khabar card also names a jār wa-majrūr: ' + line);
}
for (const line of seenOn(jarrProbe)) {
  if (line.includes(api.MAFUL_FIH_KIND_LABELS.place.ar) || line.includes(api.MAFUL_FIH_KIND_LABELS.time.ar)) {
    throw new Error('a jār-majrūr khabar card also names a ẓarf: ' + line);
  }
}
/* The demonstrative rābiṭ is not rewritten — its probe and its `requires` discriminator were
   already right — but the card it now needs must exist, and must NOT carry the pronoun link's
   verb, or the two rābiṭ rows would credit each other. */
const rabitIshara = seenOn(api.RABIT_KINDS.ismIshara.ar).filter(line => line.includes(api.RABIT_NAME_AR));
if (!rabitIshara.length) throw new Error('no rendered card carries the demonstrative rābiṭ');
for (const line of rabitIshara) {
  if (line.includes(api.PRONOUN_RABIT_RETURN_AR)) {
    throw new Error('the demonstrative rābiṭ card also carries the pronoun link’s wording: ' + line);
  }
}
console.log('M_RABIT_ISHARA'.padEnd(18), 'verified on', rabitIshara.length, 'card(s)');
console.log('   e.g. ' + rabitIshara[0]);

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
  for (const field of ['term', 'pages', 'probe']) {
    if (Object.prototype.hasOwnProperty.call(update, field) && row[field] !== update[field]) {
      throw new Error(key + '.' + field + ' did not take: ' + JSON.stringify(row[field]));
    }
  }
  if (!row.parent) throw new Error(key + ' lost its parent column');
  console.log(key.padEnd(18), 'parent=' + JSON.stringify(row.parent), 'pages=' + JSON.stringify(row.pages));
}
console.log('rows file updated:', rewritten, 'rows');
