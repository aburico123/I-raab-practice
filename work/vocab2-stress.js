'use strict';
/* Vocabulary-expansion-2 stress test.
   ==================================
   Generates a large randomized run of exercises and measures the ONE thing a vocabulary change is
   for: whether the new words actually reach the learner. It tracks, per generated exercise,
   validation failures, translation failures and History round-trip failures, and per lexeme
   whether it was ever produced.

   It reuses the release harness's own loader (work/check-nominal-pairs.js, lines 1..778, ending at
   `const api=context.__nahwTest;`) rather than re-implementing the DOM/crypto shims, so the app is
   loaded exactly as the harness loads it. The cut point is asserted, not assumed.

     node work/vocab2-stress.js                 # 12000 exercises
     node work/vocab2-stress.js 20000           # a longer run
     node work/vocab2-stress.js 12000 --samples # also dump sentences that contain new vocabulary
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const harnessSource = fs.readFileSync(path.join(ROOT, 'work/check-nominal-pairs.js'), 'utf8');
const harnessLines = harnessSource.split(/\r?\n/);
const CUT = 778;
if (!/^const api=context\.__nahwTest;$/.test(harnessLines[CUT - 2])) {
  throw new Error(`The harness loader no longer ends at line ${CUT - 1}; found: ${harnessLines[CUT - 2]}`);
}
const requested = Number(process.argv[2]) || 12000;
const wantSamples = process.argv.includes('--samples');
process.chdir(ROOT);
const savedArgv = process.argv;
process.argv = [savedArgv[0], savedArgv[1], 'index.html'];
const sandbox = { exports: {} };
new Function('require', 'module', 'exports', '__dirname', '__filename', 'process',
  harnessLines.slice(0, CUT).join('\n') + '\nmodule.exports={api,html};')(
  require, sandbox, sandbox.exports, __dirname, __filename, process);
process.argv = savedArgv;
const { api, html } = sandbox.exports;

/* ── what counts as NEW: everything the pre-expansion baseline does not spell ─────────────── */
const baseline = fs.readFileSync(path.join(ROOT, 'work/index-pre-vocabulary-expansion-2-backup.html'), 'utf8');
const baselineNoms = new Set(baseline.match(/nom:'([^']+)'/g).map(m => m.slice(5, -1)));
const baselinePasts = new Set([...baseline.matchAll(/past:'([^']+)'/g)].map(m => m[1]));

const NOUN_POOLS = ['singularPeople', 'singularThings', 'places', 'brokenHuman', 'brokenThings', 'duals', 'smp', 'sfp'];
const newLexemes = new Map();   // key -> {label, kind, surfaces:Set, seen:false}
function addLexeme(key, label, kind, surfaces) {
  newLexemes.set(key, { label, kind, surfaces: new Set(surfaces.filter(Boolean)), seen: false });
}
for (const pool of NOUN_POOLS) {
  for (const noun of api.nounLexicons[pool]) {
    if (baselineNoms.has(noun.nom)) continue;
    addLexeme(`${pool}:${noun.nom}`, noun.en, pool, [noun.nom, noun.acc, noun.gen]);
  }
}
for (const adj of api.nounLexicons.singularPredicates) {
  if (baselineNoms.has(adj.nom)) continue;
  addLexeme(`predicate:${adj.nom}`, adj.en, 'predicates', [adj.nom, adj.acc]);
}
for (const verb of api.verbLexicons.additionalVerbActions) {
  if (baselinePasts.has(verb.past)) continue;
  addLexeme(`verb:${verb.past}`, verb.en, 'verbs', [verb.past, verb.pres]);
}
const surfaceIndex = new Map();
for (const [key, record] of newLexemes) for (const surface of record.surfaces) {
  if (!surfaceIndex.has(surface)) surfaceIndex.set(surface, []);
  surfaceIndex.get(surface).push(key);
}

/* ── the run ──────────────────────────────────────────────────────────────────────────────── */
const stats = {
  requested, generated: 0, validationFailures: 0, translationFailures: 0,
  roundTripFailures: 0, buildErrors: 0
};
const failureDetail = new Map();
const note = (bucket, detail) => {
  if (!failureDetail.has(bucket)) failureDetail.set(bucket, { count: 0, sample: detail });
  failureDetail.get(bucket).count++;
};
const samples = new Map();   // lexeme key -> one rendered example
const clone = value => JSON.parse(JSON.stringify(value));
const templates = api.templates;
const pickIndex = n => {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0] % n;
};

while (stats.generated < requested) {
  const template = templates[pickIndex(templates.length)];
  let data;
  try { data = api.buildTemplate(template.id); }
  catch (error) { stats.buildErrors++; note(`BUILD ${template.stableId}`, error.message.slice(0, 200)); continue; }
  stats.generated++;

  const failures = api.validateExercise(data);
  if (failures.length) {
    stats.validationFailures++;
    note(`INVALID ${template.stableId} ${failures.map(f => f.code).join(',')}`, data.sentence);
  }
  const translation = data.translation;
  if (typeof translation !== 'string' || !translation.trim()
    || /undefined|null|NaN|\[object/.test(translation) || /\s{2,}/.test(translation)) {
    stats.translationFailures++;
    note(`TRANSLATION ${template.stableId}`, `${data.sentence} || ${translation}`);
  }
  const restored = api.restoreExerciseSnapshot(clone(api.createExerciseSnapshot(data)));
  if (!restored || restored.sentence !== data.sentence || restored.translation !== translation) {
    stats.roundTripFailures++;
    note(`ROUNDTRIP ${template.stableId}`, `${data.sentence} || ${translation} -> ${restored && restored.translation}`);
  }

  for (const token of data.tokens) {
    const keys = surfaceIndex.get(token.word);
    if (!keys) continue;
    for (const key of keys) {
      const record = newLexemes.get(key);
      record.seen = true;
      if (wantSamples && !samples.has(key)) {
        samples.set(key, {
          kind: record.kind, gloss: record.label, role: token.grammar && token.grammar.role,
          template: template.stableId, sentence: data.sentence, translation
        });
      }
    }
  }
}

/* ── the report ───────────────────────────────────────────────────────────────────────────── */
const byKind = {};
for (const record of newLexemes.values()) {
  byKind[record.kind] = byKind[record.kind] || { total: 0, seen: 0, missing: [] };
  byKind[record.kind].total++;
  if (record.seen) byKind[record.kind].seen++; else byKind[record.kind].missing.push(record.label);
}
const totalNew = newLexemes.size;
const totalSeen = [...newLexemes.values()].filter(r => r.seen).length;

console.log(JSON.stringify({
  ...stats,
  newLexemes: totalNew,
  newLexemesObserved: totalSeen,
  newLexemesUnreachable: totalNew - totalSeen,
  coveragePercent: Number((100 * totalSeen / totalNew).toFixed(2)),
  byKind: Object.fromEntries(Object.entries(byKind).map(([kind, v]) =>
    [kind, { total: v.total, seen: v.seen, missing: v.missing }]))
}, null, 1));

if (failureDetail.size) {
  console.log('\nFAILURES');
  for (const [bucket, v] of failureDetail) console.log(` x${v.count} ${bucket}\n      ${v.sample}`);
} else {
  console.log('\n0 validation failures, 0 translation failures, 0 History round-trip failures, 0 build errors.');
}

if (wantSamples) {
  const out = [...samples.values()];
  fs.writeFileSync(path.join(ROOT, 'work/vocab2-stress-samples.json'), JSON.stringify(out, null, 1));
  console.log(`\nWrote ${out.length} sample sentences to work/vocab2-stress-samples.json`);
}
