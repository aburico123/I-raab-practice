# Vocabulary Expansion — Test Results

## Before / after counts

| Metric | Before | After |
|---|---:|---:|
| Noun entries (all 9 declension-class arrays combined) | 200 | 240 |
| Verb families (unique present-tense forms + femininePastActions) | 200 | 219 |
| `additionalVerbActions` records | 157 | 176 |
| Adjectives (`singularPredicates`) | 18 | 28 |
| Object groups (`objectGroups`) | 55 | 71 (16 new, narrow, semantic groups) |
| Templates | 54 | 54 (unchanged — no template/architecture changes) |

## Regression suite: `node work/check-nominal-pairs.js index.html`

**Result: PASS.**

Final summary block from a full run (default duration, `durationMs=0`, so the long-running stress loop is skipped but every other check runs):

```
Vocabulary-expansion lexical audit passed: 40 nouns, 10 adjectives, 19 verb families checked.
{
  "templates": 54, "sentences": 30800, "nominal": 26008,
  "directKhabar": 1400, "verbalKhabar": 3207, "phraseKhabar": 200, "frontedKhabar": 21201,
  "innaPairs": 1400, "filterStates": 140,
  "nounEntries": 240, "totalVerbFamilies": 219,
  "additionalPastSeen": 176, "additionalPresentSeen": 176,
  "diagnosticGenerated": 47124, "diagnosticValid": 47120,
  "diagnosticRejectedIncludingIntentionalFaults": 4,
  "coveredTemplateIds": 185, "coveredRuleIds": 48
}
```

(Re-run after the correction pass below; diagnostic-generation counts vary slightly run to run because that phase is randomized, everything else is deterministic and unchanged.)

I also ran a 20-second stress pass (`node work/check-nominal-pairs.js index.html 20000`), which repeats `runEveryTemplate(25)` in a loop: **354 additional passes, 508,700 additional sentences generated, 0 failures.**

All pre-existing assertions passed unmodified except the totals below, which were updated because they hard-code the exact vocabulary size (not a correctness rule) and I intentionally grew the vocabulary:

- `mainNounEntries.length===200` → `===240`
- `uniquePresentRecords.size+femininePastActions.length===200` → `===219`
- `additionalRecords.length===157` → `===176` (and the two `additionalPastSeen`/`additionalPresentSeen` assertions that must equal it)
- `nounEntries===200` / `totalVerbFamilies===200` (regex-based recount near the end of the file) → `===240` / `===219`

No test's *logic* (what it checks, or how strict it is) was weakened — only the literal target counts were updated to match the intentionally expanded vocabulary.

## New lexical regression tests added

Added to `work/check-nominal-pairs.js`, directly after the pre-existing `nounEntries`/`totalVerbFamilies` assertions, a new block titled *"Vocabulary-expansion lexical audit"* that specifically covers the newly added vocabulary:

1. **Count check** — exactly 40 newly added noun entries (last 10 of `singularPeople`, last 20 of `singularThings`, last 10 of `places`).
2. **Duplicate Arabic check** — no two newly added nouns share the same nominative surface form.
3. **No collision with pre-expansion vocabulary** — every newly added noun's nominative surface is verified absent from `work/index-pre-vocab-expansion-backup.html` (i.e., genuinely new, not a re-addition of an existing word).
4. **Malformed case-form check** — every newly added noun's nominative/accusative/genitive ends with a supported sign (ḍammah/fatḥah/kasrah or the corresponding tanwīn+shadda pattern), and none look defective (منقوص) or elongated (مقصور) by ending in a bare alif/alif maqṣūrah/yāʾ after diacritic stripping.
5. **Adjective checks** — exactly 10 newly added adjectives; no duplicate Arabic surface and no duplicate English gloss across the full 28-entry adjective list.
6. **Verb duplicate checks** — exactly 19 newly added verb records; no duplicate past form and no duplicate present form among them.
7. **Object-group integrity for new verbs** — every newly added verb's `group` resolves to a non-empty array of well-formed noun objects (each with `acc` and `en`).
8. **New object-group validity** — all 16 newly created object groups (`sewable`, `hangable`, `knockable`, `greasable`, `dryable`, `grindable`, `peelable`, `weavable`, `squeezable`, `illuminable`, `trimmable`, `weldable`, `meltable`, `sprayable`, `stirrable`, `drillable`) are non-empty and reference only real entries from `singularThings` (i.e., no invalid semantic-group references, no empty object groups).
9. **Reachability** — every newly added noun's nominative surface is present in at least one real generation pool (`singularPeople`/`places` directly, or somewhere inside `objectGroups`/`singularThings`), so nothing added is a dead/unreferenced entry.

This block ran and printed `Vocabulary-expansion lexical audit passed: 40 nouns, 10 adjectives, 19 verb families checked.` on every successful run above.

Transitivity/preposition note: all 19 newly added verbs are simple bare-object transitive verbs (no verb requiring an obligatory preposition was added to `additionalVerbActions`, since that array's template shape is verb+accusative-object only); this was a design choice recorded in the report rather than something a runtime test needed to flag.

## Randomized semantic review

Generated batches of random sentences via the exported `generate()` function (same code path the app uses) until at least 130 sentences containing new vocabulary (a new noun, new adjective, or new verb past-tense form) were collected, then read every one manually.

**First pass (130 sentences) found 3 categories of nonsensical verb/object pairing**, all caused by reusing an existing broad object group for a semantically narrower new verb:

| Verb | Broad group used | Bad example generated | Fix |
|---|---|---|---|
| لَحَمَ (weld) | `material` | *“The two men welded the garment / the cloth / the rope.”* | New `weldable` group: metal only |
| عَصَرَ (squeeze) | `food` | *“Your brother squeezed the tea.” “The chanter squeezed the milk.”* | New `squeezable` group: fruit, vegetables |
| أَذَابَ (melt) | `food` | *“The two men melted the milk.”* | New `meltable` group: sugar only |
| أَنَارَ (illuminate) | `household` | *“The two men illuminated the table.”* | New `illuminable` group: room only |
| ثَقَبَ (drill) | `material` | *“Your father drilled the cloth.” “The employee drilled the garment.”* | New `drillable` group: wood, metal |
| طَحَنَ (grind) | `food` | (risk of “ground the milk”/“ground the bread” once more samples ran) | New `grindable` group: coffee, tea, rice, sugar |
| قَشَّرَ (peel) | `food` | (risk of “peeled the bread”/“peeled the milk”) | New `peelable` group: fruit, vegetables |
| حَاكَ (weave) | `sewable` (garment, cloth) | (risk of “wove the garment,” a finished item rather than fabric) | New `weavable` group: cloth only |
| رَشَّ (spray) | `liquid` | (risk of “sprayed the coffee”) | New `sprayable` group: water only |
| قَصَّ (trim) | `material` | (risk of “trimmed the wood/metal”) | New `trimmable` group: paper, cloth, garment, rope |
| حَرَّكَ (stir) | `food` | (borderline — kept broad but confirmed no bad samples) | left as `food` group |

After creating the 16 narrow object groups above and re-pointing each affected verb, I regenerated a **second sample of 130 sentences** containing new vocabulary and read every one. Representative results from the fixed pass:

```
دَهَنَ الْمُنْشِدُ الْآلَةَ            The chanter greased the machine.
طَحَنَ الْمُجْتَهِدُونَ الْقَهْوَةَ      The hardworking men ground the coffee.
عَصَرَ الرَّجُلَانِ الْخُضَارَ         The two men squeezed the vegetables.
لَحَمَ الْقَارِئُ الْمَعْدِنَ          The reader welded the metal.
أَذَابَ أَخُوكَ السُّكَّرَ            Your brother melted the sugar.
طَحَنَ أَخُوكَ الْأُرْزَ             Your brother ground the rice.
حَاكَ أَبُوكَ الْقُمَاشَ            Your father wove the cloth.
ثَقَبَ أَبُوكَ الْقُمَاشَ           (still generated at first — درillable group had not
                                    yet been created; fixed in the same pass, see below)
أَنَارَ السَّائِقُونَ الْغُرْفَةَ       The drivers illuminated the room.
خَاطَ الْبَاحِثُ الثَّوْبَ           The researcher sewed the garment.
```

One issue surfaced even in the “fixed” second pass: `ثَقَبَ` (drill) had been left pointed at the broad `material` group when the other eight verbs were narrowed, producing *“Your father drilled the cloth”* and *“The employee drilled the garment.”* This was caught by re-reading the second sample, fixed by adding the `drillable` group (wood, metal) and re-pointing `ثَقَبَ` to it, and confirmed clean in a **third sample** (also ≥130 sentences), which contained no further nonsensical pairings involving new vocabulary. The regression suite (including the stress pass) was re-run after this fix and passed.

No bad translations, incorrect case/mood forms, or validator errors were found in any of the three samples — every issue found was an object-semantics issue in a *hand-written* object group, not a grammar/validator bug, and none required touching the generation architecture or any grammar rule.

## Rejected candidates (dropped rather than guessed)

**Nouns dropped for unsupported morphology (defective/مقصور, which the engine's noun-inflection tables do not model):**
- الْقَاضِي (judge) — منقوص (defective), estimated iʿrāb not supported
- الرَّاعِي (shepherd) — منقوص
- الْمَقْهَى (café) — مقصور (elongated alif), estimated iʿrāb not supported
- الْمُسْتَشْفَى (hospital) — مقصور

**Nouns dropped for complexity/uncertainty rather than a hard morphology rule:**
- الْمَلْجَأُ (shelter) — genitive spelling with hamza-under-alif (مَلْجَإِ) judged too easy to get subtly wrong without a dictionary to check against; dropped rather than risk a malformed genitive.

**Verbs dropped for unsupported morphology (final-weak/معتل الآخر, whose present tense would end in a long vowel rather than a visible ḍammah, which `additionalVerbActions`' present-tense rule does not support):**
- سَقَى (to water/irrigate) — يَسْقِي
- كَوَى (to iron) — يَكْوِي
- طَوَى (to fold) — يَطْوِي
- حَشَا (to stuff) — يَحْشُو
- صَفَّى (to filter) — يُصَفِّي

**Verbs dropped because they would duplicate an English meaning already present in the app** (كنس/sweep, لصق/glue, نظّف/clean, جفّف/dry, قابل/meet, صقل/polish, قطع “cut” already used) — each has a synonym or near-synonym already in the corpus, and adding a second Arabic verb for the same English gloss would violate the no-duplicate-gloss rule enforced by the existing regression suite.

**Verbs dropped for missing a natural, available object** (حَلَبَ “to milk [an animal]” — no animal noun exists in the current noun set to serve as a sensible object; not force-fit into an unrelated group).

**Total rejected-and-dropped candidates:** 5 nouns (4 defective/mقصور + 1 uncertain hamza spelling), 9 verbs (5 defective morphology + 3 duplicate-meaning + 1 no-available-object). All are logged here with a specific, checkable reason rather than silently omitted.

## Correction pass (2026-07-22, later same day)

Three targeted fixes, verified against a fresh regression run (see updated summary numbers above, now reflecting 219 verb families / 176 `additionalVerbActions` records):

1. Fixed "blanket" spelling: الْبِطَّانِيَّةُ → الْبَطَّانِيَّةُ (and accusative/genitive forms) — kasra-after-bāʾ was a typo; the correct lexical vowel is fatḥah.
2. Fixed لَحَمَ (weld) present tense: يَلْحَمُ → يَلْحُمُ (correct Form I u-imperfect pattern).
3. Dropped كَوَّمَ (pile up) — it had been left on the generic `countable` object group, which allowed odd singular pairings ("pile up the pen"). No replacement verb was substituted in this pass. This is the reason the verb-family/`additionalVerbActions` counts dropped by one from the original delivery (220→219 / 177→176).

No grammar, template, validator, source-lock, or iʿrāb code was touched in this pass. Full regression suite re-run and passing after the corrections; the `Vocabulary-expansion lexical audit` block above now reports 19 verb families.

## Known limitations (carried over from the report)

- Duals, sound plurals, broken plurals, and the five nouns were not expanded (see report for rationale).
- The full `verbs` array (with five-verb paradigms and dedicated object lists) was not extended, only `additionalVerbActions`.
- No verb requiring an obligatory preposition was added; all 20 new verbs are bare transitive verbs matching the array's existing shape.
- Vocabulary was verified against trained knowledge of standard Arabic morphology and meaning rather than a live per-entry dictionary lookup (no network/dictionary tool was available in this session); every entry was still checked for correct, self-consistent morphology and for zero duplication against the existing inventory, and anything I was not confident about was dropped (see rejected-candidates list above) rather than included on a guess.
