#!/usr/bin/env node
/* work/marathon-mutate.js — final-marathon scratch mutation driver.
   Applies one named mutation to work/iraab-term-rows.js, runs the inventory checker,
   restores the file byte-for-byte, and reports whether the expected failure fired.

   Usage: node work/marathon-mutate.js <mutationName>
          node work/marathon-mutate.js --list
*/
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const ROWS = path.join(__dirname, 'iraab-term-rows.js');

const MUTATIONS = {
  /* Put B_ZARF_THAMMA back exactly as it stood before this marathon: a card-mode row with no
     discriminator and no blocker declaration. The skeleton collision with «ثُمَّ» then re-scores
     it FULL, and the card-probe integrity guard must be what refuses it. */
  thammaFalseFull: {
    expect: 'row B_ZARF_THAMMA is FULL on a card whose head only matches',
    apply(src) {
      const at = src.indexOf("R('B_ZARF_THAMMA',");
      if (at < 0) throw new Error('B_ZARF_THAMMA not found');
      const end = src.indexOf("R('B_ZARF_HUNA',", at);
      if (end < 0) throw new Error('could not find the end of the B_ZARF_THAMMA row');
      const row = src.slice(at, end);
      const probeEnd = row.indexOf("{ mode: 'card'");
      if (probeEnd < 0) throw new Error('B_ZARF_THAMMA does not carry a card mode');
      const mutated = row.slice(0, probeEnd) + "{ mode: 'card' }),\n  ";
      return src.slice(0, at) + mutated + src.slice(end);
    }
  },
  /* Same shape for هُنَا, whose probe is not produced by anything at all. This one must NOT be
     caught by the card-probe guard — with no colliding head it simply stays ABSENT — so it proves
     the guard is specific to collisions rather than firing on every unproduced card row. */
  hunaNoCollision: {
    /* SPECIFICITY, not sensitivity: this mutation must be killed by SOME check, and specifically
       NOT by the card-probe integrity guard — «هُنَا» has no colliding head, so the guard has
       nothing to refuse and firing on it would mean the guard is really just "unproduced card
       row". `forbid` is what makes that a real assertion rather than a hopeful comment. */
    forbid: 'row B_ZARF_HUNA is',
    expect: 'B_ZARF_HUNA',
    apply(src) {
      const at = src.indexOf("R('B_ZARF_HUNA',");
      if (at < 0) throw new Error('B_ZARF_HUNA not found');
      const end = src.indexOf("R('B_HAAL',", at);
      if (end < 0) throw new Error('could not find the end of the B_ZARF_HUNA row');
      const row = src.slice(at, end);
      const probeEnd = row.indexOf("{ mode: 'card'");
      if (probeEnd < 0) throw new Error('B_ZARF_HUNA does not carry a card mode');
      return src.slice(0, at) + row.slice(0, probeEnd) + "{ mode: 'card' }),\n\n  " + src.slice(end);
    }
  }
};

const name = process.argv[2];
if (!name || name === '--list') {
  console.log('mutations: ' + Object.keys(MUTATIONS).join(', '));
  process.exit(0);
}
const mutation = MUTATIONS[name];
if (!mutation) throw new Error('unknown mutation: ' + name);

const original = fs.readFileSync(ROWS);
const originalHash = crypto.createHash('sha256').update(original).digest('hex');
let result;
try {
  fs.writeFileSync(ROWS, mutation.apply(original.toString('utf8')));
  result = spawnSync(process.execPath, [path.join(__dirname, 'check-iraab-term-inventory.js')],
    { cwd: path.resolve(__dirname, '..'), encoding: 'utf8', maxBuffer: 1 << 28 });
} finally {
  fs.writeFileSync(ROWS, original);
  const back = crypto.createHash('sha256').update(fs.readFileSync(ROWS)).digest('hex');
  if (back !== originalHash) throw new Error('FAILED TO RESTORE work/iraab-term-rows.js');
  console.log('rows file restored byte-for-byte (sha256 ' + originalHash.slice(0, 12) + '…)');
}

const out = (result.stdout || '') + (result.stderr || '');
const fired = out.includes(mutation.expect);
console.log('\nmutation      : ' + name);
console.log('checker exit  : ' + result.status);
console.log('expected      : ' + JSON.stringify(mutation.expect));
console.log('fired         : ' + fired);
console.log('failures reported:');
for (const line of out.split(/\r?\n/)) {
  if (/^\s*·/.test(line)) console.log('  ' + line.trim().slice(0, 200));
}
if (result.status === 0) { console.log('\nMUTATION SURVIVED — the checker passed with the bug reintroduced.'); process.exit(1); }
if (!fired) { console.log('\nMUTATION KILLED BY THE WRONG CHECK — the expected message did not appear.'); process.exit(1); }
if (mutation.forbid) {
  /* The card-probe guard's own wording, which this mutation must NOT provoke. */
  const guard = ' on a card whose head only matches ';
  const overfired = out.split(/\r?\n/).some(l => l.includes(mutation.forbid) && l.includes(guard));
  console.log('card-probe guard fired on this row: ' + overfired + ' (must be false)');
  if (overfired) { console.log('\nGUARD IS NOT SPECIFIC — it fires on an unproduced card row with no collision.'); process.exit(1); }
}
console.log('\nMUTATION KILLED by the expected guard.');
