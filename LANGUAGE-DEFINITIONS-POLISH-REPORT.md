# Language Modes + Expanded Definitions + UI Polish — Report

**Date:** 2026-07-23
**Base checkpoint:** git HEAD `07a9abc Add Iʿrāb state filter and focus-word validation` (verified known-good:
56 templates, 240 nouns, 219 verb families, 176 additionalVerbActions, 70 definitions, four filters, 0 runtime
rejections). Backup saved to `work/index-pre-language-definitions-polish-backup.html`.

## 1. Summary

Added, on top of the audited grammar engine and without changing it:
- **A. Language mode** — a presentation-only toggle between **Arabic + English** (`mixed`, default) and
  **العربية فقط** (`arabic`), persisted in `localStorage`.
- **B. Layered definitions** — every one of the 70 definitions now has worked **examples** (88 total) and an
  **expanded explanation** (70 total), shown in accessible collapsible regions, in both languages.
- **C. UI polish** — a visually separate language bar, language-aware footer, accessible expanders,
  responsive tweaks, RTL alignment for new Arabic blocks.

## 2. Files changed

| File | Change |
|---|---|
| `index.html` | Language bar + `UI_TEXT`/`languageMode`/`applyLanguageMode`; `.en-only`/`.ar-only` CSS + wrapping in card/history/definition/footer markup; `definitionEnrichment` data (70 examples-sets + details) + merge; data-driven `renderDefinitionGroup` with accessible expanders; new CSS for langbar + expanders. |
| `work/check-nominal-pairs.js` | New **Language-mode**, **Definitions**, and **Terminology** audit groups; mock DOM taught the new ids, `document.body`, force-aware `classList.toggle`, `closest`, targeted dispatch; two rendered-markup assertions updated for new `en-only` classes (intent unchanged). |
| `LANGUAGE-DEFINITIONS-POLISH-REPORT.md`, `work/LANGUAGE-DEFINITIONS-POLISH-WORKLOG.md`, `work/index-pre-language-definitions-polish-backup.html` | New. |

## 3. Language-mode architecture

- One grammar engine, unchanged. Language is **pure presentation**: it never participates in `poolFor`,
  `matchesTemplate`, template selection, generation, or validation. `poolFor(start,form,state,sign)` keeps its
  4-argument signature.
- Every renderer emits **both** languages into the DOM: Arabic content is always present (base language);
  English supplementary content carries `.en-only`; mode-specific labels are paired `.en-only`/`.ar-only`.
- `applyLanguageMode()` does only three things: toggles `body.lang-mixed`/`body.lang-arabic`; swaps static
  control/label text and the `any`-option labels from `UI_TEXT`; refreshes toggle-button counts. It does
  **not** call `generate`, `render`, or `renderGrammarDefinitions`.
- Because switching language is a class toggle + label swap over already-rendered DOM, it **cannot** change
  the sentence, target, filters, history, reveal state, or definition-expansion state. This is verified, not
  just intended (see §19).

## 4. localStorage behavior

- Key `nahw-language-mode-v1`, values `mixed` | `arabic`, default `mixed` (first visit = current experience).
- Read once at load (`loadLanguageMode`); written on every explicit switch (`saveLanguageMode`). Wrapped in
  try/catch so private-mode storage failures never break the app. Independent of `nahw-sentence-history-v1`.

## 5. Exact Arabic-only behavior

Hidden (via `.en-only` + CSS): English sentence translation; word-card English gloss and English iʿrāb;
phrase-analysis English; definition English term/definition/example-translation/expanded-explanation;
history English translations; footer English; the definitions-intro English line.
Swapped to Arabic (via `UI_TEXT`): subtitle, tip, eyebrow, "Full Iʿrāb" title, the four filter labels, the
Reveal/Hide/New-Sentence/Reset buttons, the "All …" option labels and the start-filter option labels, the
history title/note/empty/clear labels and toggle, the definitions toggle, the chapter intro, "Focus word"
(→ الْكَلِمَةُ الْمُسْتَهْدَفَةُ), "Examples"/"Learn more", and the source line (→ التُّحْفَةُ السَّنِيَّةُ، ص …).
Retained in both modes: the Arabic sentence, full Arabic iʿrāb, Arabic definitions/examples/explanations.
The app title (h1) is kept as the product name. Verified no Latin letters remain in Arabic-mode control labels.

## 6. Definition data-model changes

Added, via a `definitionEnrichment` array merged into the existing items at load (keeping the 70-item array
readable; alignment asserted by `enTerm`): `item.examples[] = {ar, en, focus, iraabAr, iraabEn}`,
`item.detailsAr`, `item.detailsEn`, and a stable `item.defId = "def-<group>-<item>"`. Existing `item.source`
(Al-Tuḥfah page metadata) is preserved untouched. Rendering is fully data-driven — no per-card hardcoded HTML.

## 7–9. Counts

- **Definitions with at least one example:** 70 / 70.
- **Total examples:** 88.
- **Definitions with an expanded explanation:** 70 / 70.

## 10. Sources used

All content is grounded in the project's primary source, *Al-Tuḥfah al-Saniyyah bi-Sharḥ al-Muqaddimah
al-Ājurrūmiyyah* (the per-term PDF-page metadata already in the app is preserved and shown on each card).
Examples are **original, beginner-level sentences** constructed for clarity (not verbatim quotations); their
grammar was checked for correctness and for terminology consistency. Expanded explanations paraphrase the
Ājurrūmiyyah framework already taught by the app. No second school/framework was introduced.

## 11. Source uncertainty

None introduced. Where a deeper claim would have required going beyond the beginner Ājurrūmiyyah scope, the
explanation was kept at the level the app already teaches rather than speculating. All example iʿrāb uses the
project's existing wording and the khafḍ terminology.

## 12. Accessibility changes

Expanders are real `<button>` elements with `aria-expanded` and `aria-controls` pointing to stable region ids;
toggling flips `aria-expanded` and the region's `hidden`. The language control is a labelled button group with
`aria-pressed`. A subtle transition is gated behind `@media (prefers-reduced-motion: no-preference)`. No
clickable `<div>`s were introduced; no duplicate DOM ids (asserted).

## 13. Responsive-layout changes

New `.langbar` (its own rounded bar above the filters, segmented toggle) is visually and structurally separate
from the grammar filters. `.langbar-seg` becomes full-width with equal-flex buttons ≤460px. Definition
expanders wrap; Arabic example/detail blocks are RTL-aligned; regions scroll within their own box. The
existing warm/green/gold/blue/yellow identity, card layout, and Arabic typography are unchanged.

## 14. Grammar-engine changes

**NONE.** The region `function inflectNoun … const templates=[]` (all inflection, relationship resolution,
sentence classification, `validateExercise`, `completeNominalAnalysis`, `GRAMMAR_RULES`, `GRAMMAR_SIGNS`,
`SOURCE_REGISTRY`) is **byte-identical** to the pre-task backup (32,533 chars).

## 15–18. Counts before/after

| Metric | Before | After |
|---|---:|---:|
| Production templates | 56 | 56 |
| Noun entries | 240 | 240 |
| Verb families | 219 | 219 |
| additionalVerbActions | 176 | 176 |
| Grammar definitions | 70 | 70 |

## 19. Test results

`node work/check-nominal-pairs.js index.html` → **PASS (exit 0).** All pre-existing tests pass unchanged in
intent (two rendered-markup assertions updated for the new `en-only` class names; none weakened or removed).
New groups:
- **Language-mode audit** — both values exist; default mixed; localStorage persistence; mixed↔arabic switch
  leaves templateId, sentence, target, all four filters, history length, reveal-panel state, and
  definitions-panel state identical; Arabic mode wraps/ hides English (word gloss + iʿrāb + translation CSS)
  and swaps control labels to Latin-free Arabic; mixed restores English; switching adds no history entry.
- **Definitions audit** — 70 definitions, each with source pages, ≥1 example, and an expanded explanation;
  every example focus occurs in its Arabic example; no duplicate example reused across terms; 70 cards render;
  ≥70 expander buttons with `aria-expanded="false"` and valid `aria-controls`; no duplicate DOM ids; example
  regions hidden by default; a real click through the handler opens/closes a region (aria flips, `hidden`
  flips) and leaves all grammar state unchanged.
- **Terminology audit (488 checks)** — over definition text, expanded text, example iʿrāb, and 400 rendered
  production exercises: forbids «مجرور» as a case label (allowing the construction name «جار ومجرور» in any
  case ending) and «علامة جرّه», and requires each «علامة رفعه/نصبه/خفضه/جزمه» to match its state word.

## 20. Stress result

`node work/check-nominal-pairs.js index.html 18000`: 302 passes, **454,000** sentences, **0** rejections, exit 0.

## 21. Browser QA result

**Not performed.** The in-app Browser pane could not load the app in this environment: `navigate` and
`preview_start` to `file://` timed out (300s), `localhost` is blocked by policy, and although the tab lists
the file as loaded, every interaction reports "No site is open." Reported honestly rather than claimed.
Responsive CSS was written and reasoned through but not visually confirmed. Runtime behavior is otherwise
exercised head-lessly by the VM harness (full load sequence, language switching, rendering, real click-handler
dispatch), which throws on any runtime error and passed cleanly.

## 22. Known limitations

- No visual/mobile browser confirmation (environment limitation above).
- Examples are illustrative originals (grammar-verified), not verbatim citations from the source text.
- Arabic-only mode keeps the English app title (h1) as the product name.

## 23. Unexpected code changes

None. Existing grammar, morphology, source-lock, relationship, target-word, and iʿrāb rendering logic were
preserved (byte-identical engine region). The only change touching the validator file region was already made
in a prior task; this task added no grammar logic. Nothing was committed, pushed, or deployed.
