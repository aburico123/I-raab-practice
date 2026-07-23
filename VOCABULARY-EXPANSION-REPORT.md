# Vocabulary Expansion Report

**Date:** 2026-07-22
**Scope:** `index.html` vocabulary arrays and object groups only. No grammar-engine, validator, source-lock, or generation-architecture code was changed.

## What was added

| Category | Before | Added | After |
|---|---|---|---|
| Noun entries (singularPeople + singularThings + places + brokenHuman + brokenThings + duals + smp + sfp + fiveNouns) | 200 | 40 | 240 |
| — of which singularPeople | 41 | 10 | 51 |
| — of which singularThings | 68 | 20 | 88 |
| — of which places | 24 | 10 | 34 |
| Verb families (unique across all present-tense lexicons + femininePastActions) | 200 | 19 | 219 |
| — of which additionalVerbActions records | 157 | 19 | 176 |
| Adjectives (singularPredicates) | 18 | 10 | 28 |
| New narrow object groups | — | 16 | — |

A pre-edit copy of the original file is preserved at `work/index-pre-vocab-expansion-backup.html`.

## Why this scope (targets vs. actuals)

The task set targets of roughly +100 nouns, +50 verb families, and +30–50 adjectives, explicitly as *targets, not hard quotas*, with the instruction to reject anything that could not be verified with confidence and to prioritize correctness over hitting numbers. After auditing the existing engine (see below), I chose a smaller, fully-verified set instead of stretching to the target counts, because:

- **Nouns.** The engine only inflects the noun classes it already has hard-coded tables and rule IDs for (`singular`, `broken`, `dual`, `smp`, `sfp`, `fiveNouns`), and diptotes/defective (منقوص) and elongated (مقصور) nouns are explicitly excluded (see `GRAMMAR_COVERAGE_MATRIX.deliberatelyNotGenerated` and the `excludedDiptoteBrokenPlurals` test list). I only added to `singularPeople`, `singularThings`, and `places` — all sound, fully-declinable, triptote/nisba nouns — because verifying correct **broken-plural**, **dual**, and **sound-plural** forms for dozens of new roots without introducing an accidental diptote or irregular pattern is exactly the kind of morphology risk the task asked me to avoid. That is a deliberate scope reduction versus the +100 target, logged here rather than guessed at.
- **Verbs.** I only added to `additionalVerbActions`, which requires nothing beyond a past form ending in visible fatḥah and a present form ending in visible ḍammah (the engine does not generate five-verb, subjunctive, or jussive forms for this array). I avoided any final-weak (assimilated-lām, e.g. سَقَى، طَوَى، كَوَى، حَشَا) verb whose present tense would end in a long vowel rather than a visible ḍammah, since that is an “estimated iʿrāb” pattern this array does not support. Twenty verbs were added; several additional candidates were drafted and then rejected for morphology or duplicate-meaning reasons (see the CSV “rejected candidates” note and the count below).
- **Adjectives.** Ten were added to `adjectives` (used as `singularPredicates`), all masculine sound triptote forms matching the existing pattern exactly (nominative tanwīn ḍammah, accusative tanwīn fatḥah).

## Process

1. **Read the whole file** (1933 lines originally) and the regression suite (`work/check-nominal-pairs.js`, 1022 lines) before touching anything, to build an inventory of every existing Arabic noun/verb/adjective surface form and English gloss, and to identify exactly which lexical arrays feed which templates (`pickPerson()` → `singularPeople`, `pickPlace()` → `places`, `pickGeneralVerb()` → `verbs + additionalVerbActions`, `objectGroups[...]` → subsets of `singularThings`/`places`, etc.).
2. **Backed up** the pre-expansion file to `work/index-pre-vocab-expansion-backup.html` before any edit.
3. **Checked every candidate against the existing inventory** (via scripted `indexOf`/regex search across the whole file) for duplicate Arabic surface forms and duplicate English glosses before adding it.
4. **Added nouns** to `singularPeople` (professions), `singularThings` (household/clothing/food/transport items), and `places` (everyday locations) — all sound, definite, triptote or nisba nouns matching the declension pattern the engine already inflects correctly.
5. **Added verbs** to `additionalVerbActions`, choosing only sound-final Form I/II/IV verbs (including hollow/assimilated roots, which the array already contains examples of, e.g. بَاعَ، أَعَادَ) whose indicative present visibly ends in ḍammah. Each verb’s past/present/meaning was checked against my working knowledge of standard Form I–IV/VIII morphology and cross-checked for internal consistency (stem agreement between forms) rather than invented.
6. **Built narrow semantic object groups** for every new verb rather than reusing broad pools. An early draft reused the broad `material`/`food`/`household`/`liquid` groups for verbs like “weld,” “squeeze,” “melt,” “illuminate,” and “drill”; a randomized-sample review (see test results) caught nonsensical pairings such as *“welded the cloth,” “squeezed the milk,” “melted the milk,” “illuminated the table,” “drilled the garment.”* I then created 16 new narrow object groups (`sewable`, `hangable`, `knockable`, `greasable`, `dryable`, `grindable`, `peelable`, `weavable`, `squeezable`, `illuminable`, `trimmable`, `weldable`, `meltable`, `sprayable`, `stirrable`, `drillable`) so every new verb only pairs with objects that make sense (e.g. `weldable` = the metal only; `illuminable` = the room only; `meltable` = the sugar only).
7. **Fixed a systematic diacritic-ordering bug I introduced**: several of my newly-typed words placed the shadda (ّ) after the short-vowel diacritic instead of before it (the file’s existing convention, confirmed against pre-existing entries such as البُسْتَانِيُّ and مُسْتَعِدٌّ, is shadda-then-vowel). This was caught by the regression suite’s `nominative form lacks ḍammah` assertion and fixed with a targeted regex normalization limited to the diacritic-order bug, verified to touch only my new entries.
8. **Updated the hard-coded totals** that the regression suite and the UI footer assert (200 → 240 nouns, 200 → 219 verb families, 157 → 176 `additionalVerbActions` records) to reflect the intentional, verified expansion — these are counts, not weakened correctness checks.
9. **Added a new lexical regression block** to `work/check-nominal-pairs.js` (see test results file) specifically covering the new vocabulary: duplicate Arabic surfaces among new nouns, no collision with pre-expansion nouns, duplicate adjective surfaces/glosses, duplicate verb past/present forms, non-empty and well-formed object groups for every new verb, all new object groups reference only real `singularThings` entries, and reachability of every new noun through a real generation pool.
10. **Ran the full existing regression suite** (default + a 20-second stress pass covering ~500,000 additional generated sentences) — all passed.
11. **Randomized semantic review**: generated batches of sentences and filtered for ones containing new vocabulary until ≥130 were collected and read manually. This caught the object-group problems described in step 6, which were then fixed and re-verified with a second sample.

## Known limitations

- Duals, sound masculine/feminine plurals, broken plurals, and the five nouns were **not** expanded. Adding new entries there would require confidently producing correct broken-plural and dual/plural forms for new roots, which is higher-risk than the singular/sound expansion and was intentionally left for a future, narrower pass.
- The `verbs` array (the one with full `five`/`fiveSub` five-verb paradigms and dedicated `obj` lists) was not extended — only `additionalVerbActions` was. Adding to `verbs` would require also supplying a verified five-verb (وَاوُ الْجَمَاعَةِ) plural form for each new verb, which was judged lower-value than a careful `additionalVerbActions` expansion within the available time.
- All new verbs are Form I/II/IV (plus a couple of hollow/geminate roots already precedented in the array); no Form V/VI/VII/X verbs or verbs requiring an obligatory preposition were added, since the `additionalVerbActions` construction the templates use is a bare transitive verb + accusative object, and forcing a preposition-requiring verb into that shape would misrepresent its grammar.
- Lexical verification relied on my own trained knowledge of standard Arabic morphology and meaning (equivalent to Hans Wehr–level vocabulary), not a live dictionary lookup per entry, since no network/dictionary tool was used in this session. Every candidate was nonetheless checked for (a) correct, self-consistent Form-pattern morphology, (b) an ending compatible with the engine’s supported inflection classes, and (c) no duplicate Arabic surface or English gloss against the existing 200/200/18 inventory. Entries about which I was not confident were dropped rather than guessed (see `VOCABULARY-TEST-RESULTS.md` for the rejected list).

## Correction pass (2026-07-22, later same day)

A targeted correction pass fixed three items found after initial delivery:

1. **"blanket" spelling**: was entered as الْبِطَّانِيَّةُ / الْبِطَّانِيَّةَ / الْبِطَّانِيَّةِ (kasra after bāʾ). Corrected to the standard lexical form الْبَطَّانِيَّةُ / الْبَطَّانِيَّةَ / الْبَطَّانِيَّةِ (fatḥah after bāʾ).
2. **لَحَمَ "to weld" present tense**: was entered as يَلْحَمُ. Corrected to يَلْحُمُ (Form I u-imperfect, correct pattern for this verb).
3. **كَوَّمَ "to pile up" removed**: this verb used the generic `countable` object group, which allowed semantically odd singular combinations (e.g. "pile up the pen," "pile up the book" — piling up normally implies a plural/mass quantity, not one countable singular item). Rather than force-fit a narrower group in a rushed pass, the entry was dropped. No replacement verb was added in this pass. Verb-family and `additionalVerbActions` totals were reduced by one accordingly (220→219 verb families; 177→176 `additionalVerbActions` records) in `index.html` (footer text and one code comment) and `work/check-nominal-pairs.js` (two hard-coded total assertions, plus the "20 newly added verb families" slice/assert updated to 19).

No grammar logic, templates, rendering, validators, source locks, or iʿrāb code were touched in this pass — only the vocabulary arrays, the two count references, and the test file's hard-coded totals.

## Files touched

- `index.html` — vocabulary arrays (`singularPeople`, `singularThings`, `places`, `adjectives`, `additionalVerbActions`) and `objectGroups`, plus the footer text and one code comment that state the verb/noun totals.
- `work/check-nominal-pairs.js` — updated hard-coded totals (200→240 nouns, 200→219 verbs, 157→176 additional-verb records) and added a new lexical-audit test block for the added vocabulary.
- `work/index-pre-vocab-expansion-backup.html` — new, pre-edit snapshot.
- `VOCABULARY-EXPANSION-REPORT.md`, `VOCABULARY-ADDITIONS.csv`, `VOCABULARY-TEST-RESULTS.md` — new deliverables (this file and the other two, at repo root).
