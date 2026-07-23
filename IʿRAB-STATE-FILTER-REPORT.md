# Iʿrāb State Filter — Implementation Report

**Date:** 2026-07-22
**Scope:** Added a fourth practice filter, **Iʿrāb state — حَالَةُ الْإِعْرَابِ**, working together with the
existing *Sentence starts with*, *Word form*, and *Iʿrāb sign* filters. No grammar rule, inflection,
rendering, relationship, source-lock, or iʿrāb-display logic was changed. Vocabulary was untouched.

## Files changed

| File | Change |
|---|---|
| `index.html` | New `stateFilter` dropdown + 5-column controls layout; `state` added to template metadata; filter/pool/disabled/normalize logic extended to four dimensions; a new target-consistency validator invariant; two nondeterministic five-verb templates split into distinct naṣb/jazm templates. |
| `work/check-nominal-pairs.js` | Test harness taught the `state` dimension (mock dropdown, option values, template map, 4-arg `poolFor`); new **Iʿrāb-state-filter audit** block (Tests A–I) added; existing disabled-option/reset tests extended to four filters. |
| `IʿRAB-STATE-FILTER-REPORT.md` | This report (new). |
| `work/index-pre-state-filter-backup.html` | Pre-feature snapshot of the known-good app (new). |

## Architecture

- **The word-level filters describe one token.** *Word form*, *Iʿrāb state*, and *Iʿrāb sign* are all
  properties of the single gold **focus token** (`data.tokens.find(t => t.target)`). *Sentence starts with*
  remains sentence-level metadata. The engine already required exactly one focus token; that requirement is
  preserved (`E_FOCUS_COUNT`) and strengthened.
- **State is a first-class template property, never inferred from the sign.** The `add(...)` helper was
  extended from `add(starts, form, sign, build)` to `add(starts, form, state, sign, build)`. Every template
  now carries an explicit `state`, and each build stamps `templateStarts/Form/State/Sign` onto the exercise.
- **Internal vocabulary is unchanged:** states use the app's existing keys `raf` / `nasb` / `jarr` / `jazm`.
  The learner-facing dropdown shows الرَّفْعُ / النَّصْبُ / الْخَفْضُ / الْجَزْمُ, and the displayed iʿrāb keeps the
  app's khafḍ terminology (مَخْفُوضٌ … وَعَلَامَةُ خَفْضِهِ …). No mixed terminology was introduced.
- **State is taken from the token's real grammatical structure.** `token.state` and `token.sign` are computed
  during `inflectNoun` / `inflectVerb` from roles and governors — exactly as before. The filter only *selects*
  among templates; it does not re-derive any grammar.

## State values

| Filter option (Arabic) | Internal value |
|---|---|
| الرَّفْعُ | `raf` |
| النَّصْبُ | `nasb` |
| الْخَفْضُ | `jarr` (legacy internal id; displayed as khafḍ) |
| الْجَزْمُ | `jazm` |
| All states | `any` |

## Compatibility matrix (as implemented)

| Word form | rafʿ | naṣb | khafḍ | jazm |
|---|---|---|---|---|
| الِاسْمُ الْمُفْرَدُ (singular) | ḍammah | fatḥah | kasrah | — |
| جَمْعُ التَّكْسِيرِ (broken) | ḍammah | fatḥah | kasrah | — |
| الْمُثَنَّى (dual) | alif | **yāʾ** | **yāʾ** | — |
| جَمْعُ الْمُذَكَّرِ السَّالِمُ (smp) | wāw | **yāʾ** | **yāʾ** | — |
| جَمْعُ الْمُؤَنَّثِ السَّالِمُ (sfp) | ḍammah | kasrah-for-fatḥah | kasrah | — |
| الْأَسْمَاءُ الْخَمْسَةُ (five nouns) | wāw | alif | yāʾ | — |
| الْمُضَارِعُ … (present verb) | ḍammah | fatḥah | — | sukūn |
| الْأَفْعَالُ الْخَمْسَةُ (five verbs) | ثبوت النون | **حذف النون** | — | **حذف النون** |

The three **bold same-sign / different-state** pairs (dual yāʾ, smp yāʾ, five-verbs ḥadhf al-nūn) are the
cases the filter exists to disambiguate, and they are kept as distinct template identities.

## Template count: 54 → 56

Two templates that previously chose between لَنْ (naṣb) and لَمْ (jazm) at random via `chance()` — so their
target's *state* was nondeterministic while the sign was always ḥadhf al-nūn — were each split into two
deterministic templates:

- `noun` + `fiveVerbs` + **nasb** + nunDropped (لَنْ only) and `noun` + `fiveVerbs` + **jazm** + nunDropped (لَمْ only)
- `particle` + `fiveVerbs` + **nasb** + nunDropped (لَنْ only) and `particle` + `fiveVerbs` + **jazm** + nunDropped (لَمْ only)

**Why this was necessary:** the state filter requires each template to have one well-defined target state.
Both grammar forms were already fully supported and source-locked (`R_AFAL5_NASB_DELETE_NUN`,
`R_AFAL5_JAZM_DELETE_NUN`); no new grammar pattern was invented. The random لَنْ/لَمْ variety is preserved —
the generator now picks between the two split templates.

**Templates whose metadata needed correction:** none. The runtime target-consistency invariant (below) ran
across the whole suite with **0 rejections**, so every hand-assigned `state` matched its actual focus token on
the first run.

## Validator invariant (target consistency)

Added to `validateExercise`, immediately after the single-focus-token check:

```
focusForm = focus is a verb ? (afalKhamsa ? 'fiveVerbs' : 'present') : focus.inflection
E_TARGET_FORM  if templateForm  && focusForm     !== templateForm
E_TARGET_STATE if templateState && focus.state   !== templateState
E_TARGET_SIGN  if templateSign  && focus.sign.id !== templateSign
```

This is checked against the token's **structured** grammar (its inflected `state`/`sign`/`inflection`), not the
metadata alone. A template whose metadata claims `state = nasb` while its target validates as `jarr` fails —
**even when both use the yāʾ sign.** The guard on `templateForm||…` leaves the harness's hand-built
validator-fault fixtures untouched.

## Filter interaction (disabled options + minimal reset)

- **Disabled before selection:** `refreshDisabledOptions()` disables, in each of the four dropdowns, any option
  whose selection (holding the other three) would empty the template pool. This covers e.g. *state = jazm →*
  all six noun forms disabled; *form = dual + state = raf → sign yāʾ disabled, alif enabled*; etc.
- **Minimal reset on conflict:** `normalizeFilters` preserves the filter the user just changed and relaxes only
  the incompatible dependent filters, most-derived first (`sign → state → form → start`), stopping the moment a
  valid pool exists. A clear notice names exactly what was reset. It never empties the pool and never leaves a
  stale selection that contradicts the generated sentence.

Example: with *Form = dual, State = naṣb, Sign = yāʾ*, changing **State → rafʿ** resets **only** the sign to
"All signs" and keeps Form = dual, State = rafʿ (→ dual + rafʿ + alif). Form is not wiped.

## Valid filter combinations

All 24 matrix cells above are reachable (Test F asserts ≥1 production template each). Counting `any` in every
dimension there are **353 non-empty `(start, form, state, sign)` filter tuples**.

## Intentionally impossible combinations (Test E asserts empty pool)

`singular/jazm`, `broken/jazm`, `dual/jazm`, `smp/jazm`, `sfp/jazm`, `fiveNouns/jazm` (jazm is verb-only);
`present/jarr`, `fiveVerbs/jarr` (present verbs are never khafḍ); plus invalid form/sign pairs such as
`singular+yāʾ`, `dual+ḍammah`, `present+yāʾ`, `fiveVerbs+ḍammah`, `sfp+naṣb+fatḥah`, `dual+rafʿ+yāʾ`.

## Test results

`node work/check-nominal-pairs.js index.html` → **PASS** (exit 0). Plus a 15-second stress pass
(`… index.html 15000`): 115 passes, **192,200** generated sentences, **0** failures.

- **New Iʿrāb-state-filter audit:** `56 templates, 24 valid matrix cells, 353 valid filter tuples, 3584 checks.`
  - **A** — stateFilter options are exactly `any/raf/nasb/jarr/jazm` (HTML + harness) with the four Arabic labels.
  - **B** — every template returned by `poolFor(start,form,state,sign)` satisfies all four dimensions.
  - **C** — all 56 templates rebuilt 40× each: exactly one target, and target form/state/sign match the metadata.
  - **C (negative)** — corrupting a genuine dual-naṣb-yāʾ exercise's metadata to `jarr` / `alif` / `singular` is
    rejected by `E_TARGET_STATE` / `E_TARGET_SIGN` / `E_TARGET_FORM` (the same-sign case is caught).
  - **D** — dual naṣb+yāʾ vs jarr+yāʾ, smp naṣb+yāʾ vs jarr+yāʾ, five-verbs naṣb vs jazm (both ḥadhf al-nūn)
    all remain distinct.
  - **E** — every impossible combination above returns 0 templates.
  - **F** — every valid matrix cell has ≥1 production template.
  - **G** — simulated dropdowns disable exactly the impossible dependent options.
  - **H** — changing one filter resets only incompatible dependents and preserves unrelated selections
    (including the sentence-start filter).
  - **I** — 400 randomized state-filtered selections: sentence always renders, selection never wrongly reset,
    every producible target satisfies the tuple, **0** validation rejections.
- **Existing suite unchanged in intent:** all pre-existing checks still pass. The disabled-option and
  Reset-filters tests were extended to four filters; no test was weakened or removed. `filterStates`
  coverage rose from 140 to 353; `runtimeRejectedCandidates` remained **0**.

## Randomized semantic / display review

A sample of generated sentences for each ambiguous and each new template was read by hand. Every focus word's
revealed iʿrāb was correct and terminology-consistent, e.g.:

- dual naṣb: `… يُرَتِّبُ الصَّدِيقَيْنِ` → «مَفْعُولٌ بِهِ مَنْصُوبٌ …، وَعَلَامَةُ نَصْبِهِ الْيَاءُ؛ لِأَنَّهُ مُثَنًّى.»
- dual khafḍ: `… عَنْ الْكِتَابَيْنِ` → «اسْمٌ مَخْفُوضٌ بِـ«عَنْ»، وَعَلَامَةُ خَفْضِهِ الْيَاءُ؛ لِأَنَّهُ مُثَنًّى.»
- sfp naṣb: `… الْمُسْلِمَاتِ` → «… وَعَلَامَةُ نَصْبِهِ الْكَسْرَةُ نِيَابَةً عَنِ الْفَتْحَةِ …»
- present jazm: `لَمْ يُصْلِحْ …` → «فِعْلٌ مُضَارِعٌ مَجْزُومٌ بِـ«لَمْ»، وَعَلَامَةُ جَزْمِهِ السُّكُونُ …»
- five verbs naṣb: `… لَنْ يَنْقُلُوا …` (will not) vs jazm: `… لَمْ يَنْقُلُوا …` (did not) — split templates,
  each deterministic, «حَذْفُ النُّونِ» with the correct state.

No nonsensical output, incorrect form/state/sign, mixed terminology, unreachable template, or unexpected
validator rejection was found.

## Preservation confirmation

Diffing `index.html` against `work/index-pre-state-filter-backup.html`: everything between the header controls
and the template block (all vocabulary, `GRAMMAR_RULES`, `SOURCE_REGISTRY`, `inflectNoun`, `inflectVerb`,
`renderExercise`, `resolveRelationships`, `renderRelationshipAnalysis`, phrase/sentence recipient logic, and the
iʿrāb display-order fix) is byte-identical. The gold Focus-Word mechanism and the combined-phrase /
verbal-sentence-khabar presentation order are unchanged. The only validator edit is an *addition* (the
target-consistency invariant). Nothing was committed, pushed, deployed, or otherwise sent to GitHub; the
production version was not deployed.

## Known limitations

- The Browser pane could not load the app in this environment (`file://` and `localhost` are blocked by policy),
  so the visual/mobile check was done through the headless VM harness, which executes the exact embedded script
  (full load sequence + rendered `word-card` HTML + thousands of filter dispatches) and would throw on any
  load-time or runtime error. The controls were widened to five responsive columns (four dropdowns + reset),
  collapsing to two columns ≤760 px (reset spanning full width) and one column ≤460 px, matching the existing
  responsive style.
- Scope was held to the source-locked grammar already in production: no jazm noun forms, no khafḍ verb forms,
  and no new morphology were introduced. The two added templates only make already-supported five-verb naṣb and
  jazm forms independently selectable.
