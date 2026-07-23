# APPEARANCE MODE REPORT — System / Light / Dark

Presentation-only feature. **No grammar, definition, vocabulary, or engine changes. Nothing committed, pushed, or deployed.**

## 1. Starting commit
- HEAD `62174eeac75ed3f12b9744375e46f7fec8465927`, branch `main`. Baseline regression green before starting. Backup saved to `work/index-pre-appearance-mode-backup.html` (SHA-verified identical to the pre-edit `index.html`).

## 2. Files changed
- **`index.html`** — 115 insertions, 0 deletions (purely additive): a flash-prevention head script, a dark-theme + appearance-control CSS block, the Appearance UI control, the appearance JS (preference/effective/persistence/OS-listener), and event wiring.
- **`work/check-nominal-pairs.js`** — additive only: extended the DOM mock with `document.documentElement` + a controllable `matchMedia`, exported the appearance API, and added an **Appearance-mode audit** (7 groups). No existing test changed or removed.
- New (optional) browser-QA/report tooling under `work/`; this report.

## 3. Appearance architecture
- Theme is applied by a **`data-theme` attribute on `<html>`** (`light` / `dark`). Light rules are the existing stylesheet untouched; dark is an appended override block keyed on `:root[data-theme="dark"]` (variables) and `[data-theme="dark"] <selector>` (the few hard-coded colours). No existing light rule was modified, so **light mode is provably identical** to before.

## 4. Preference vs effective theme
- **Preference** (`appearanceMode`): `system` | `light` | `dark` (what the user chose / persisted).
- **Effective theme**: `light` | `dark` (what actually renders).
- `effectiveTheme() = appearanceMode==='system' ? (systemPrefersDark()?'dark':'light') : appearanceMode`. `applyAppearanceMode()` writes `data-theme=effectiveTheme()` and updates the buttons' `aria-pressed`. It touches nothing else — no `generate`/`render`/`poolFor`/`normalizeFilters`/`renderGrammarDefinitions`.

## 5. localStorage key
- **`nahw-appearance-mode-v1`**, values `system`/`light`/`dark`. Invalid/corrupt/missing values fall back to `system`. All reads/writes are wrapped in try/catch (storage failures never break the app), mirroring the existing language-preference pattern.

## 6. System-mode behaviour
- Resolves via `window.matchMedia('(prefers-color-scheme: dark)')`. On a light OS → light; on a dark OS → dark. Verified in a real browser via CDP `Emulation.setEmulatedMedia`: `system` + OS-light rendered `data-theme=light`, `system` + OS-dark rendered `data-theme=dark`.

## 7. OS-change listener behaviour
- A `change` listener on the media query (with `addEventListener`, falling back to legacy `addListener`) re-applies the effective theme **only when** `appearanceMode==='system'`. It never regenerates, writes history, changes filters, collapses panels, or changes language. Explicit `light`/`dark` **ignore** OS changes (verified live: toggling the simulated OS while on explicit light/dark did not change the theme).

## 8. Arabic labels
- The control uses static bilingual `en-only`/`ar-only` spans (same mechanism as the Language bar), so language switching swaps them with zero extra logic:
  - Label: **Appearance** / **الْمَظْهَرُ**
  - Buttons: **System** / **النِّظَامُ** · **Light** / **فَاتِحٌ** · **Dark** / **دَاكِنٌ**
- Underlying values stay `system`/`light`/`dark`. Verified rendering in Arabic-only mode (RTL).

## 9. Light-mode behaviour
- Unchanged. Warm cream background, white cards, green identity, gold focus, blue actions, yellow reveal, Arabic typography — all preserved. The only visible addition is the Appearance bar beside the Language bar.

## 10. Dark-mode colour strategy
- Warm charcoal page (`#191b16`, gradient to `#15170f`) — **not pure black**; warm off-white text (`#ece6d8`); light gray-beige muted text. Elevated dark card/surface (`#25271f` / `#2c2e25`) distinct from the page. Green identity kept readable on dark (medium green `#2f9268` for pressed-button fills with white text; light green `#8ad4ac`/`#63c79c` for green text and the practice sentence); green-soft areas become a dark green-tinted surface (`#20302a`). Gold focus retained (`#d8a951`) with a dark gold-tinted focus header and a dark-text gold badge. Blue and yellow buttons keep their identity with dark-compatible contrast. Subtle borders (`#3c3f36`), soft shadows (no glows), dark inputs with light text and a visible focus outline. Introduced 4 semantic vars (`--surface-raised`, `--input-bg`, `--shadow-color`, and dark redefinitions of the existing palette).

## 11. Components audited (dark)
Body/header, Language bar, Appearance bar, filter panel + labels + selects (+ disabled/focus), practice card (sentence/translation/tip), Reveal/New buttons, answer panel (heading, word cards, **focus card** with gold border/header/badge, gloss, Arabic iʿrāb, English, phrase-analysis region), history (toggle/panel/rows/clear), definitions (toggle, intro, chapter selectors + selected state, cards, terms, definitions, Examples/Learn-more buttons, example regions, focus example word, source line), status notice/error, footer. All render on dark surfaces with readable contrast; no stray light boxes.

## 12. Accessibility
- Real `<button>` elements with `aria-pressed` reflecting the current preference; keyboard-operable; visible focus outline in both themes (dark uses a green-tinted outline). State is not conveyed by colour alone (the pressed button also carries `aria-pressed="true"`). A subtle theme transition respects `prefers-reduced-motion` (only applied under `prefers-reduced-motion: no-preference`).

## 13. Language + Appearance interaction
- Independent. Verified all six combinations (mixed/arabic × system/light/dark). Switching language does not reset appearance; switching appearance does not reset language (asserted in the harness and confirmed in the browser).

## 14. Appearance state-preservation tests
- The harness Appearance-mode audit (7 groups, 26 checks) asserts that `dark→light→system` (and each switch) leave **unchanged**: sentence, templateId, target token, form/state/sign, all four filters, history length, reveal state, definitions panel state, and language mode; and that the definitions panel HTML is not re-rendered. Appearance switching calls no generation/render path.

## 15. Full regression result
- `node work/check-nominal-pairs.js index.html` → **PASS, exit 0**: vocabulary, Iʿrāb-state-filter (3584 checks), language-mode, **appearance-mode (7 groups)**, definitions (70/88/70), terminology (488 checks).

## 16. Stress result
- 8-second stress → exit 0: 134 stress passes, 3000 random generations, **0 consecutive repeats, 0 runtime rejections, 0 grammar failures**.

## 17. Browser QA result
- Chrome headless via CDP (built-in WebSocket). 18 core combos + 3 tall captures, screenshots inspected. **System mode follows the emulated OS** (os-light→light, os-dark→dark); explicit light/dark apply and persist; light mode visually identical to before; dark mode high-quality and warm; focus card obviously gold in dark; Arabic + dark/light correct RTL. **0 console errors** in every state.

## 18. Breakpoint results (`scrollWidth ≤ innerWidth`, no horizontal overflow)
| Width | Light | Dark | Arabic+Dark |
|-------|-------|------|-------------|
| 1440 | ✓ 1425/1440 | ✓ 1425/1440 | ✓ 1425/1440 |
| 1024 | — | ✓ 1009/1024 | — |
| 768 | — | ✓ 768/768 | ✓ 753/768 |
| 390 | ✓ 375/390 | ✓ 375/390 | ✓ 375/390 |
| 320 | ✓ 305/320 | ✓ 305/320 | — |
All `overflowX=false`. Appearance controls fit on one row at 320px.

## 19. Console result
- 0 errors / 0 uncaught exceptions across light, dark, system (light & dark OS), Arabic+dark, definitions-open, and answer-revealed states.

## 20. Final counts
- 56 templates · 240 nouns · 219 verb families · 176 additionalVerbActions · 70 definitions · 88 examples · 70 expanded explanations — **unchanged**.

## 21. Grammar-engine diff
- `git diff --no-index work/index-pre-appearance-mode-backup.html index.html` = **115 insertions, 0 deletions**, all in presentation regions (head script, CSS, appearance HTML/JS/wiring). A targeted grep for `grammarDefinitionGroups`, `definitionEnrichment`, `GRAMMAR_RULES`, `SOURCE_REGISTRY`, `inflectNoun`, `inflectVerb`, `poolFor`, `matchesTemplate`, `validateExercise`, `resolveRelationships`, `renderRelationshipAnalysis`, `arTerm:`, `detailsAr:`, `add('` found **no changes**. Grammar engine, morphology, templates, filters, definitions, and vocabulary are byte-for-byte unchanged.

## 22. Known limitations
- Native `<select>` dropdown *option lists* are styled for dark (`option` bg/color set) but the exact rendering of open dropdowns is browser-controlled; on some platforms the OS may still draw a light popup. The closed control and all custom UI are fully themed.
- System mode depends on the browser exposing `prefers-color-scheme`; where unavailable, `systemPrefersDark()` safely returns false (→ light), and explicit Light/Dark always work.
- Head flash-prevention script sets `data-theme` before first paint from `localStorage`; a first-ever visit with no stored preference resolves via the OS, matching System default.

## 23. Commit / push / deploy status
- **Not committed. Not pushed. Not deployed.** All changes left in the working tree for review.
