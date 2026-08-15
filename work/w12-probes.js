#!/usr/bin/env node
/* ============================================================================
   work/w12-probes.js

   Wave 12 — derives the بَابُ الْمُعْرَبَاتِ probe strings from the APP's own frozen registries and
   its RENDERED iʿrāb cards, then writes them into work/iraab-term-rows.js. Same contract, and same
   reason, as work/w4-probes.js and work/w11-probes.js: two independently typed copies of the same
   Arabic is how combining-mark ORDER has drifted invisibly in this repo before, and this wave met
   that drift twice — once inside index.html's own five «لأنه» clauses, once in a pin typed from
   memory. Nothing Arabic is typed in this file.

   Four rows are rewritten:

     L_BROKEN        term + probe — the class clause the broken plural's card now carries. The
                     source writes this one with «وهو», not «لأنه» (p. 60 «وكل من «التلاميذ»
                     و«الدروس» جمعُ تكسير»; p. 62 «وعلامة رفعه الضمة الظاهرة، وهو جمع تكسير»), so
                     the row's canonical term is corrected to what the source and the card both say.
     G_SAHIH_AKHIR   probe — was «الصَّحِيحِ الْآخِرِ», the definite form of p. 56's matn, which the
                     card does not carry. The card carries p. 56's own PARSE wording, «فِعلٌ مضارع
                     صحيح الآخر», exactly as its معتل الآخر sibling row already does.
     G_EST_THIQL     probe — widened from the preventer clause alone to the WHOLE sign.
     G_EST_TAADHDHUR probe — the same widening, and it is a correction, not a tidy-up: the row's
                     canonical term is a ḌAMMAH, its probe named only the preventer, and the only
                     line carrying that preventer was Wave 6's FATḤAH. The row was FULL on a sign
                     the learner never saw. Both rows now name their whole sign, so neither can be
                     credited by the other's.
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

/* ── the four values, each taken from the app and then CHECKED against a real rendered card ── */
const brokenClause = api.inflectionReasonArabic('broken');            // «؛ وَهُوَ جَمْعُ تَكْسِيرٍ»
const brokenTerm = brokenClause.slice(2).trim();                      // «وَهُوَ جَمْعُ تَكْسِيرٍ»
const brokenProbe = api.WHY_FORM.broken.ar;                           // «جَمْعُ تَكْسِيرٍ»
const sahihProbe = api.SAHIH_FINAL_CLASS_AR;                          // «صَحِيحُ الْآخِرِ»
const thiqlProbe = api.GRAMMAR_SIGNS.dammaMuqaddaraThiql.ar;
const taadhdhurProbe = api.GRAMMAR_SIGNS.dammaMuqaddaraTaadhdhur.ar;

const updates = {
  L_BROKEN: { term: brokenTerm, probe: brokenProbe, pages: '26–28,60,62' },
  G_SAHIH_AKHIR: { probe: sahihProbe, pages: '56,60–61' },
  G_EST_THIQL: { probe: thiqlProbe, pages: '20–21,95' },
  G_EST_TAADHDHUR: { probe: taadhdhurProbe, pages: '20–21,95' }
};

/* Every probe must actually be on a card, and the two estimated ones must be on DIFFERENT cards —
   the confusion this correction exists to end. */
for (const [key, update] of Object.entries(updates)) {
  const hits = seenOn(update.probe);
  if (!hits.length) throw new Error(key + ': no rendered card contains «' + update.probe + '»');
  console.log(key.padEnd(16), JSON.stringify(update.probe), '→', hits.length, 'card(s)');
  console.log('   e.g. ' + hits[0]);
}
if (seenOn(thiqlProbe).some(line => seenOn(taadhdhurProbe).includes(line))) {
  throw new Error('the two estimated ḍammah signs share a card, so neither probe discriminates');
}
if (!seenOn(brokenClause).length) throw new Error('no card carries the broken-plural class clause');
/* And the sound-final class must be on a JAZM card and on no five-verb one — p. 56 owns one موضع. */
for (const line of seenOn(sahihProbe)) {
  if (!line.includes(api.GRAMMAR_SIGNS.sukun.ar)) {
    throw new Error('«' + sahihProbe + '» reached a card that is not the sukūn jazm: ' + line);
  }
}

/* ── write ─────────────────────────────────────────────────────────────────────────────────
   The row table is `R(key, term, chapter, pages, parent, probe, opts)`, and `chapter` is a bare
   identifier, so the QUOTED literals of a call run: key, term, pages, parent, probe. A call may
   also wrap onto a second line, which is why the literals are walked across the whole call text
   rather than counted per line — counting per line is exactly how a first attempt at this writer
   put a page list into the `parent` column. Each write is verified by re-reading the file. */
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
  /* Rewrite from the LAST field backwards so earlier offsets stay valid. */
  for (let f = FIELDS.length - 1; f >= 1; f--) {
    const field = FIELDS[f];
    if (!Object.prototype.hasOwnProperty.call(update, field)) continue;
    src = src.slice(0, spans[f].start) + update[field] + src.slice(spans[f].end);
  }
  rewritten++;
}

/* A row that now reaches the learner must not keep the note explaining why it did not. The checker
   ignores missingReason once a row is FULL, so a stale one is invisible there — and an invisible
   stale claim in the authored table is the kind of thing this project treats as a defect. */
for (const key of ['G_SAHIH_AKHIR', 'G_EST_THIQL', 'G_EST_TAADHDHUR']) {
  const at = src.indexOf("R('" + key + "',");
  const optsAt = src.indexOf('{ missingReason:', at);
  const rowEnd = src.indexOf("\n  R('", at + 1);
  if (optsAt < 0 || optsAt > rowEnd) throw new Error(key + ': no missingReason to clear');
  const optsEnd = src.indexOf('}', optsAt);
  let commaAt = src.lastIndexOf(',', optsAt);
  src = src.slice(0, commaAt) + src.slice(optsEnd + 1);
}
/* Tidy the now-empty continuation the removal can leave behind. */
src = src.split(')\n    )').join('))').split(',\n    )').join(')');

fs.writeFileSync(rowsPath, src);
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
  console.log(key.padEnd(16), 'parent=' + JSON.stringify(row.parent), 'pages=' + JSON.stringify(row.pages),
    'missingReason=' + JSON.stringify(row.missingReason || ''));
}
console.log('rows file updated:', rewritten, 'rows');
