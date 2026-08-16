# Vocabulary expansion 2

**Branch:** `vocabulary-expansion-2` (cut from `main` at `fccd280`, “Final Full-System QA”)
**Scope:** vocabulary only. No new iʿrāb role, no new source rule, no new grammar chapter, no new
morphology class, no change to the curriculum inventory.

**398 new lexemes.** Every one of them fits an engine class that already existed; a candidate that
would have needed the engine to change was dropped instead.

| Registry | Added | Now |
| --- | ---: | ---: |
| `singularPeople` — masculine human singulars | 56 | 115 |
| `singularThings` — objects and abstracts | 97 | 235 |
| `places` | 40 | 78 |
| `brokenHuman` — broken plurals (human) | 8 | 19 |
| `brokenThings` — broken plurals (thing) | 15 | 35 |
| `duals` | 11 | 23 |
| `smp` — sound masculine plurals | 8 | 19 |
| `sfp` — sound feminine plurals | 8 | 18 |
| `adjectives` → `singularPredicates` | 60 | 98 |
| `additionalVerbActions` — transitive verb families | 95 | 291 |
| **total** | **398** | |

Engine totals moved with them: **239 → 334 verb families** and **308 → 551 noun entries**, and the
learner-facing footer advertises both in English and in Arabic-Indic digits.

The full item list is in `VOCABULARY-EXPANSION-2-ADDITIONS.csv`.

## What was added, and why those words

The lexicon is weighted towards the vocabulary of Arabic and Islamic **books** — grammar, fiqh,
hadith, tafsīr, history, and commentary prose — with everyday words for variety. Of the 97 new
things, 34 are book-and-study words (`الْمَتْنُ`, `الْحَاشِيَةُ`, `الْمُخْتَصَرُ`, `الْمَرْجِعُ`, `الْمَصْدَرُ`,
`الْمَخْطُوطُ`, `الِاصْطِلَاحُ`, `اللَّفْظُ`, `الْفَائِدَةُ`, `الْعَقِيدَةُ`, `الْمَذْهَبُ`, …), and ten of the 56 new
people are the people of that world (`النَّحْوِيُّ`, `اللُّغَوِيُّ`, `الْمُؤَرِّخُ`, `الْوَرَّاقُ`, `النَّاسِخُ`,
`الْمُحَقِّقُ`, `الْخَطَّاطُ`, `النَّاشِرُ`, `الشَّاعِرُ`, `الْأَدِيبُ`).

Morphological diversity was the second criterion. The additions spread across every declension class
the engine already models: sound singulars, feminine `ـة` singulars, broken plurals of both kinds,
duals, sound masculine plurals and sound feminine plurals. Deliberately **excluded**, because the
engine has no safe registration pattern for them: maqṣūr and manqūṣ nouns (`الْمُسْتَشْفَى`, `الْوَادِي`,
`الْقَاضِي`, `الْمَقْهَى`, `النَّادِي`, `الْمُصَلَّى`), diptotes in indefinite positions, hamza-on-alif finals,
and weak-final verbs (`تَلَا`, `رَوَى`, `اِشْتَرَى`, `دَعَا`, `سَقَى`, `نَادَى` …). `اِشْتَرَى` “buy” was replaced by
the sound hollow `اِبْتَاعَ` “purchase” for exactly this reason.

## Semantic wiring

Verbs are never handed an arbitrary object. Each of the 95 new verb families names an
object-compatibility group, and twelve new groups were added for meanings the existing ones did not
cover: `browsable`, `parsable`, `formulable`, `narratable`, `editableText`, `money`, `payable`,
`applicable`, `choppable`, `harvestable`, `tearable`, `diggableGround`. Forty-eight existing groups
were widened with the new nouns.

Two rules constrained that wiring:

* **The sixteen semantically locked book groups were not touched.** `explainable`, `dividable`,
  `includable`, `authoredText`, `reflectable`, `confirmable`, `derivable`, `extractable`,
  `addressable`, `citable`, `specifiable`, `noticeable`, `watchable`, `manufacturable`, `takeable`
  and `enterablePlaces` keep the exact membership the 2026-07 review pinned. New verbs may *use*
  them; nothing was added to them.
* **Religious safety.** A religious noun may only be the object of a verb reviewed for it. The five
  new verbs that can reach one are `طَالَعَ` (peruse) and `أَتْقَنَ` (master) via `study`, `اِسْتَوْعَبَ`
  (grasp) via `explainable`, `تَأَمَّلَ` (contemplate) via `reflectable`, and `أَعْرَبَ` (parse) via
  `parsable`, to which `الْآيَةُ` was added on purpose — parsing a verse is what this app is for.
  The six new text-editing verbs (`نَقَّحَ`, `هَذَّبَ`, `اِخْتَصَرَ`, `أَطَالَ`, `أَجَازَ`, `عَنْوَنَ`) were given a
  dedicated `editableText` group rather than the general `text` group, so that “abridged the
  Qurʾān” cannot be produced. The harness asserts all of this.

## The one engine change

`isHumanNoun` was widened, and only it. The dual lanes choose a human action or a thing action from
the noun's own English gloss, and every dual is glossed «the two …» — so the singular-only pattern
matched **`the two men` and nothing else**. `the two students` was being handed to the thing
actions, which produced “The student cleans the two students.” The pattern now accepts the plural
forms too, which fixes that pre-existing defect and is what makes the five new human duals usable.
Twelve of the 23 duals are now recognised as human; the harness pins both halves of that split.

## Verification

| Check | Result |
| --- | --- |
| `node work/check-iraab-term-inventory.js` | **274 rows, 267 FULL (97.4 %), 7 TRUE_BLOCKER, 0 failures** — unchanged, stored inventory untouched |
| `node work/check-nominal-pairs.js index.html` | **exit 0** |
| Why fallbacks | **0** |
| Runtime production rejections | **0** |
| Diagnostic generations in the harness | 369 027 generated, 369 015 valid, 12 intentional faults |
| Unique sentences per 3 000 random generations | 1 959 (floor 1 825) |
| Distinct opening words | 443 |
| `git diff --check` | clean |

### Vocabulary stress test

`node work/vocab2-stress.js 150000` — 150 000 randomized exercises:

```
generated                150000
validationFailures            0
translationFailures           0
roundTripFailures             0
buildErrors                   0
newLexemes                  398
newLexemesObserved          398
newLexemesUnreachable         0
coveragePercent             100
```

Every one of the 398 new lexemes was observed in a generated exercise. Reachability needed one
round of work: a first run showed eleven new things reachable only through the catch-all `general`
group — one verb, so a learner would effectively never meet them — and they were given two or more
semantically honest homes each. No new record was left dead, and none had to be removed.

Verb reachability is additionally proved *deterministically*, not statistically: the release harness
walks all 291 additional verb families through a canonical past template and a canonical present
template and requires each one to build and validate (`additionalPastSeen === 291`,
`additionalPresentSeen === 291`).

### Manual review

188 generated sentences containing new vocabulary were read by hand, spread across mubtadaʾ, khabar,
fāʿil, mafʿūl bihi, majrūr, muḍāf ilayh, ism/khabar of kāna, ism/khabar of inna, past and present
verbs, and the dual / broken / sound-plural morphology. A sample of 398 — one per new lexeme — is
saved in `work/vocab2-stress-samples.json`.

Nine real defects were found and fixed:

| Defect | Fix |
| --- | --- |
| `الْأَدِيبُ` glossed “the man of letters” (four words) broke the lā al-nāhiyah translation guard, which allows at most three words between *let* and *not* | glossed “the literary man” |
| “has not ceased being **residing** / **visiting**” — participial glosses read badly after *being* | `مُقِيمٌ` → “resident”, `زَائِرٌ` → “a visitor” |
| same problem latent in “arriving” and “standing” | `قَادِمٌ` replaced by `مُنْتَظَرٌ` “awaited”; `قَائِمٌ` replaced by `مُسْتَقِيمٌ` “upright” |
| “The judge **kept secret** the news.” | `كَتَمَ` → “withhold / withholds / withheld” |
| “The translators **covered** the newspaper.” (ambiguous) | `غَلَّفَ` → “bind / binds / bound” |
| “The two children **pursued** the report.” | `تَابَعَ` → “follow up on” |
| “The guard **inhabits** the school.” | `سَكَنَ` → “live in / lives in / lived in” |
| “The judge **paid off** the money.” | `سَدَّدَ` → “pay”, on a `payable` group of price / salary / sum |

### Duplicate and collision audit

Every new surface and every new gloss was checked against the whole of `index.html` before
insertion, not just against the noun and verb registries — the narrower check missed the Wave-1
oath frames, which carry their khabar under a `khabar:` key. **Nine candidates were rejected and
replaced:**

| Rejected | Reason |
| --- | --- |
| `الرَّجُلُ` “the man”, `الْوَالِدُ` “the father”, `الْهَدِيَّةُ` “the gift”, `الْمَالُ` “the money” | the surface already belongs to a Wave-1 curriculum frame; a second identity on one surface breaks the History round trip (the restored exercise resolves the gloss through the other registry) |
| `قَرِيبٌ` “nearby”, `ثَابِتٌ` “steadfast” | same — both are qasam-frame khabar lexemes, glossed “near” and “firm”; the round trip was observed changing the translation |
| `غَافِلٌ` “heedless”, `عَاقِلٌ` “sensible”, `حَرِيصٌ` “keen” | accusative surface already owned by the munādā and naʿt-sababī registries |
| `الْمُؤْمِنُونَ` “the believers” | already spelled by a grammar-definition example |
| `أَكْرَمَ` “treat generously” | its present `يُكْرِمُ` is the harness's deliberately *unregistered* present-surface fixture |
| `الْمِظَلَّةُ` “the umbrella”, `مَظْلُومٌ` “wronged” | both skeletonise to something containing `ظل`, the `K_ZALLA` inventory probe — they inflated `ظَلَّ` from 3 observed template lanes to 13 and flipped its randomization grade from LIMITED to GOOD. The inventory checker matches probes as undiacritized substrings, so this was a false improvement, not a real one. Replaced by `الْقُفْلُ` “the lock” and `مُحْسِنٌ` “benevolent”, after which the stored inventory needed **no edit at all**. |
| `هَنَّأَ` “congratulate” | skeletonises to exactly `هنا`, the probe of the TRUE_BLOCKER row `B_ZARF_HUNA`. It did not flip the row in four measured runs, but leaving a lexeme whose skeleton *is* a blocker's probe is a booby trap. Replaced by `جَالَسَ` “sit with”. |

## Known pre-existing issue, not changed here

The general `text` object group contains `الْقُرْآنُ` and `الْحَدِيثُ`, and the pre-existing verbs on
that group include `حَذَفَ` (delete), `صَحَّحَ` (correct) and `اِخْتَصَرَ`-adjacent meanings, so pairings
such as “deleted the Qurʾān” were already producible before this branch. The new verbs deliberately
avoid that group — that is why `editableText` exists — but the existing pins were left alone,
because narrowing `text` changes released behaviour and is a grammar/content decision rather than a
vocabulary one. Flagging it rather than fixing it silently.

## Harness changes

`work/check-nominal-pairs.js`:

* the pinned totals moved: `mainNounEntries` 302 → 545, noun entries 308 → 551, verb families
  239 → 334 (two sites), additional verb records 196 → 291 (three sites), and the ordinary
  verb-index constant 604 → 794 (95 families × 2 surfaces).
* **each expansion's audited set is now anchored between two baselines instead of an array tail.**
  The 2026-07 block read its 40 nouns, 10 adjectives and 19 verbs off `slice(-10)`/`slice(-20)`/
  `slice(-19)` — which the next expansion silently steals the moment it appends. Each set is now
  “what my baseline lacks and the next baseline already has”, so every expansion keeps being
  audited by its own block. The book-expansion block was anchored the same way.
* a new **vocabulary-expansion-2 audit**: per-registry counts, definiteness, absence of tanwīn,
  rejection of maqṣūr/manqūṣ, the requirement that the three case forms be one stem carrying three
  signs, global surface and gloss uniqueness, predicate and verb shape, one canonical surface and
  one canonical meaning per verb family, the twelve new object groups and their source pools,
  religious safety, reachability, and both halves of the dual human/thing split.
* `isHumanNoun` is exported so that split is testable.

`work/vocab2-stress.js` is new: the randomized reachability harness described above.
`work/index-pre-vocabulary-expansion-2-backup.html` is the baseline every diff-based audit reads.
