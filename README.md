# Nahw Iʿrāb Practice

A standalone Arabic nahw practice generator. The application is contained in
`index.html` and is designed for GitHub Pages.

## Grammar engine

Exercises are built from structured token metadata. Grammatical role determines
case or mood, declension/conjugation determines the iʿrāb sign, and those values
determine the displayed Arabic form and bilingual explanation. Explicit
relationships connect verbs to subjects and objects, prepositions to governed
nouns, iḍāfah terms to each other, and every mubtadaʾ to its khabar.

Every exercise is validated before it can be displayed. Unsupported advanced
constructions are excluded from random generation.

## Regression audit

Run the lightweight Node audit from the repository root:

```powershell
node work/check-nominal-pairs.js index.html
```

An optional duration in milliseconds keeps rebuilding and validating every
template for a continuous stress audit:

```powershell
node work/check-nominal-pairs.js index.html 7200000
```
