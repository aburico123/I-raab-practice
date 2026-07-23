# DEFINITION CONTENT AUDIT — all 70 definitions, all 88 examples

Independent item-by-item review of the authored educational content in `index.html`
(`grammarDefinitionGroups` + `definitionEnrichment`, lines 391–1041).

- **Primary project source:** *Al-Tuḥfah al-Saniyyah bi-Sharḥ al-Muqaddimah al-Ājurrūmiyyah* (page refs carried in each definition's `source.pdfPages`).
- **Method:** every field inspected — arTerm, enTerm, simple ar/en, detailsAr/detailsEn, each example (ar, en, focus, iraabAr, iraabEn), and source pages. Grammatical claims cross-checked against the Ājurrūmiyyah framework the app already implements (external cross-check only where noted).
- **Legend:** PASS = accurate as written; FIXED = corrected this pass. Columns: Simple / Expanded / Examples / Arabic ḥarakāt / English.

Counts confirmed by harness: **70 definitions, 88 examples, 70 expanded explanations, 5 chapters.**

---

## Group 0 — Foundations of speech (10)

| # | Term (ar / en) | Pages | Simple | Expanded | Examples | Arabic | English | Notes |
|---|----------------|-------|--------|----------|----------|--------|---------|-------|
| 1 | الْكَلَامُ / Complete speech | 7–11 | PASS | PASS | PASS (2) | PASS | PASS | Standard definition (murakkab mufīd). Contrast example «إِنْ قَامَ زَيْدٌ» is the classic incomplete-speech case. |
| 2 | الْكَلِمَةُ / Word | 9–11 | PASS | PASS | PASS (3) | PASS | PASS | ism/fiʿl/ḥarf, "no fourth kind." Examples كِتَابٌ/كَتَبَ/فِي. |
| 3 | الِاسْمُ / Noun | 9–11 | PASS | PASS | PASS (2) | PASS | PASS | Signs of the noun listed (أل، خفض، تنوين، نداء). |
| 4 | الْفِعْلُ / Verb | 9–11 | PASS | PASS | PASS (2) | PASS | PASS | Three times: past/present/future. |
| 5 | الْفِعْلُ الْمَاضِي / Past verb | 9–11 | PASS | PASS | PASS (1) | PASS | PASS | mabnī, aṣl on fatḥ. |
| 6 | الْفِعْلُ الْمَاضِي النَّاقِصُ / Deficient past | 105–106 | PASS | PASS | PASS (1) | PASS | PASS | kāna raises ism, naṣb khabar. Framing internally consistent. |
| 7 | الْفِعْلُ الْمُضَارِعُ / Present verb | 9–11 | PASS | PASS | PASS (1) | PASS | PASS | starts with أَنَيْتُ letters; marfūʿ unless nāṣib/jāzim. |
| 8 | الْحَرْفُ / Particle | 9–11 | PASS | PASS | PASS (2) | PASS | PASS | "meaning shows only with another word"; all ḥurūf mabnī. |
| 9 | الْجُمْلَةُ الِاسْمِيَّةُ / Nominal sentence | 99–104 | PASS | PASS | PASS (1) | PASS | PASS | mubtadaʾ + khabar, both marfūʿ. |
| 10 | الْجُمْلَةُ الْفِعْلِيَّةُ / Verbal sentence | 87–93 | PASS | PASS | PASS (1) | PASS | PASS | verb + fāʿil (+ object). |

## Group 1 — Word forms (8)

| # | Term | Pages | Simple | Expanded | Examples | Arabic | English | Notes |
|---|------|-------|--------|----------|----------|--------|---------|-------|
| 11 | الِاسْمُ الْمُفْرَدُ / Singular noun | 26 | PASS | PASS | PASS (1) | PASS | PASS | inflects with visible ḥarakāt. |
| 12 | جَمْعُ التَّكْسِيرِ / Broken plural | 27–29 | PASS | PASS | PASS (1) | PASS | PASS | "when munṣarif" qualifier present — good. |
| 13 | الْمُثَنَّى / Dual | 31,64–66 | PASS | PASS | PASS (2) | PASS | PASS | alif rafʿ, yāʾ naṣb/khafḍ. Both examples correct. |
| 14 | جَمْعُ الْمُذَكَّرِ السَّالِمُ / SMP | 31,64–66 | PASS | PASS | PASS (2) | PASS | PASS | wāw rafʿ, yāʾ naṣb/khafḍ. |
| 15 | جَمْعُ الْمُؤَنَّثِ السَّالِمُ / SFP | 30,49,62 | PASS | PASS | PASS (2) | PASS | PASS | ḍamma rafʿ, kasra khafḍ, **kasra for fatḥa in naṣb** — correct. |
| 16 | الْأَسْمَاءُ الْخَمْسَةُ / Five nouns | 32,66,67 | PASS | PASS | PASS (3) | PASS | PASS | wāw/alif/yāʾ; conditions (ifrād, iḍāfah to non-yāʾ) stated. |
| 17 | الْمُضَارِعُ الَّذِي لَمْ يَتَّصِلْ… / Unattached present | 26,39 | PASS | **FIXED** | PASS (1) | PASS | PASS | **Issue 6:** expanded now qualified to الصحيح الآخر; example يَكْتُبُ (sound-final) was already fine. |
| 18 | الْأَفْعَالُ الْخَمْسَةُ / Five verbs | 39,67 | PASS | PASS | PASS (3) | PASS | PASS | Simple def already correctly restricted to المضارع. Three examples show rafʿ (ثبوت), naṣb-by-لن, jazm-by-لم — model coverage. |

## Group 2 — Iʿrāb states and signs (18)

| # | Term | Pages | Simple | Expanded | Examples | Arabic | English | Notes |
|---|------|-------|--------|----------|----------|--------|---------|-------|
| 19 | الْإِعْرَابُ / Iʿrāb | 19–20 | PASS | PASS | PASS (1) | PASS | PASS | four kinds rafʿ/naṣb/khafḍ/jazm; lafẓan aw taqdīran. |
| 20 | الْمُعْرَبُ / Inflected word | 19–20 | PASS | PASS | PASS (1) | PASS | PASS | present verb muʿrab unless nūn tawkīd/niswah — accurate. |
| 21 | الْبِنَاءُ / Fixed form | 20–22 | PASS | **FIXED** | PASS (1) | PASS | PASS | **Issue 5:** demonstratives now "most" + هَذَانِ/هَاتَانِ exception. Example هَؤُلَاءِ genuinely mabnī. |
| 22 | عَلَامَةُ الْإِعْرَابِ / Iʿrāb sign | 23…67 | **FIXED** | **FIXED** | PASS (1) | PASS | PASS | **Issue 4 + Phase-6 refinement:** simple def recast as "…مِنْ حَرَكَةٍ أَوْ حَرْفٍ أَوْ ثُبُوتٍ أَوْ حَذْفٍ"; expanded farʿiyyah now four DISTINCT categories — letters (alif/wāw/yāʾ) / **retention (ثبوت النون, own category, five verbs)** / substitute vowel (kasrah for fatḥah, SFP) / deletion. Retention no longer inside حُرُوف. |
| 23 | الرَّفْعُ / Nominative | 23,26,35,39 | PASS | PASS | PASS (1) | PASS | PASS | secondary rafʿ signs alif/wāw/ثبوت النون — correct. |
| 24 | النَّصْبُ / Accusative | 23,40,47–50 | PASS | PASS | PASS (1) | PASS | PASS | secondary naṣb: alif/yāʾ/kasrah/ḥadhf al-nūn — correct. |
| 25 | الْخَفْضُ / Genitive | 23,61,62,66 | PASS | PASS | PASS (1) | PASS | PASS | noun-only; secondary yāʾ + fatḥah; three causes. |
| 26 | الْجَزْمُ / Jussive | 23,51,58 | PASS | PASS | PASS (1) | PASS | PASS | present-verb only; secondary ḥadhf al-nūn + ḥadhf ḥarf al-ʿilla. |
| 27 | الضَّمَّةُ الظَّاهِرَةُ / Visible ḍammah | 26 | PASS | PASS | PASS (1) | PASS | PASS | loci incl. "المضارع الصحيح الآخر" — already qualified. |
| 28 | الْفَتْحَةُ الظَّاهِرَةُ / Visible fatḥah | 48 | PASS | PASS | PASS (1) | PASS | PASS | "المضارع المنصوب الصحيح الآخر" — qualified. |
| 29 | الْكَسْرَةُ الظَّاهِرَةُ / Visible kasrah | 62 | PASS | PASS | PASS (1) | PASS | PASS | "المنصرف" qualifier on singular/broken — good. |
| 30 | السُّكُونُ الظَّاهِرُ / Visible sukūn | 58 | PASS | PASS | PASS (1) | PASS | PASS | "المضارع الصحيح الآخر" — qualified. |
| 31 | الْأَلِفُ / Alif as a sign | 35,50 | PASS | PASS | PASS (2) | PASS | PASS | rafʿ dual + naṣb five nouns. |
| 32 | الْوَاوُ / Wāw as a sign | 35,66 | PASS | PASS | PASS (2) | PASS | PASS | rafʿ SMP + five nouns. |
| 33 | الْيَاءُ / Yāʾ as a sign | 50,66 | PASS | PASS | PASS (3) | PASS | PASS | Explicitly: "the state is not known from the sign alone." Excellent. |
| 34 | الْكَسْرَةُ نِيَابَةً… / Kasrah replacing fatḥah | 49 | PASS | PASS | PASS (1) | PASS | PASS | SFP naṣb — clearly shown. |
| 35 | ثُبُوتُ النُّونِ / Keeping the nūn | 67 | PASS | PASS | PASS (1) | PASS | PASS | rafʿ of five verbs. |
| 36 | حَذْفُ النُّونِ / Dropping the nūn | 67 | PASS | PASS | PASS (2) | PASS | PASS | naṣb + jazm; distinguishes لن (naṣb) vs لم (jazm). |

## Group 3 — Sentence roles (24)

| # | Term | Pages | Simple | Expanded | Examples | Arabic | English | Notes |
|---|------|-------|--------|----------|----------|--------|---------|-------|
| 37 | الْمُبْتَدَأُ / Mubtadaʾ | 99–104 | PASS | PASS | PASS (1) | PASS | PASS | marfūʿ, no lafẓī governor. |
| 38 | الْخَبَرُ / Khabar | 99–104 | PASS | PASS | PASS (1) | PASS | PASS | mufrad/jumla/shibh jumla. |
| 39 | الْخَبَرُ الْمُفْرَدُ / Single-word khabar | 99–104 | PASS | PASS | PASS (1) | PASS | PASS | agrees in number/gender. |
| 40 | خَبَرُ الْجُمْلَةِ / Sentence khabar | 102–104,130 | PASS | PASS | PASS (1) | PASS | PASS | fī maḥall rafʿ; requires rābiṭ. |
| 41 | خَبَرُ شِبْهِ الْجُمْلَةِ / Phrase-like khabar | 102–104,161 | PASS | PASS | PASS (1) | PASS | PASS | attaches to omitted khabar (kāʾin/mawjūd). |
| 42 | الْخَبَرُ الْمُقَدَّمُ / Fronted khabar | 161 | PASS | PASS | PASS (1) | PASS | PASS | «فِي الدَّارِ رَجُلٌ» classic. |
| 43 | الْمُبْتَدَأُ الْمُؤَخَّرُ / Delayed mubtadaʾ | 161 | PASS | PASS | PASS (1) | PASS | PASS | stays marfūʿ. |
| 44 | الْفَاعِلُ / Subject (fāʿil) | 87–93,130 | PASS | PASS | PASS (1) | PASS | PASS | marfūʿ; ẓāhir or ḍamīr. |
| 45 | الْفَاعِلُ الظَّاهِرُ / Explicit subject | 87–93 | PASS | PASS | PASS (1) | PASS | PASS | |
| 46 | الْفَاعِلُ الْمُضْمَرُ / Pronominal subject | 87–93 | PASS | PASS | PASS (1) | PASS | PASS | example كَتَبُوا (متصل) contrasted with مستتر. |
| 47 | الضَّمِيرُ الْمُسْتَتِرُ / Hidden pronoun | 87–93 | PASS | PASS | PASS (1) | PASS | PASS | wājib/jāʾiz noted; example «زَيْدٌ كَتَبَ» تقديره هو. |
| 48 | الضَّمِيرُ الْمُتَّصِلُ / Attached pronoun | 87–93 | PASS | PASS | PASS (1) | PASS | PASS | fāʿil/mafʿūl/muḍāf ilayh by position; example كَ = muḍāf ilayh. |
| 49 | وَاوُ الْجَمَاعَةِ / Plural wāw | 87–93 | PASS | **FIXED** | PASS (1) | PASS | PASS | **Issue 1:** five-verb claim restricted to المضارع + «نَجَحُوا» past counterexample. |
| 50 | أَلِفُ الِاثْنَيْنِ / Dual alif | 87–93 | PASS | **FIXED** | PASS (1) | PASS | PASS | **Issue 2:** same fix + «كَتَبَا» counterexample. Example يَكْتُبَانِ (present) correct. |
| 51 | يَاءُ الْمُخَاطَبَةِ / Feminine-address yāʾ | 87–93 | PASS | **FIXED** | PASS (1) | PASS | PASS | **Issue 3:** restricted to المضارع + imperative «اكْتُبِي» counterexample. |
| 52 | الْمَفْعُولُ بِهِ / Direct object | 140–141 | PASS | PASS | PASS (1) | PASS | PASS | good fāʿil-vs-mafʿūl contrast in expanded. |
| 53 | شِبْهُ الْجُمْلَةِ / Phrase-like expression | 103,104,161 | PASS | PASS | PASS (1) | PASS | PASS | "not the khabar itself, attaches to omitted khabar." |
| 54 | الْجَارُّ وَالْمَجْرُورُ / Prep + governed noun | 13,103,104,174–177 | PASS | PASS | PASS (1) | PASS | PASS | Construction name «جار ومجرور» kept; state described with khafḍ/مخفوض. Correct per project rule. |
| 55 | حَرْفُ الْخَفْضِ / Preposition | 13,174–177 | PASS | PASS | PASS (1) | PASS | PASS | list من/إلى/عن/على/في/الباء/اللام. |
| 56 | الِاسْمُ الْمَخْفُوضُ / Genitive noun | 13,174–177 | PASS | PASS | PASS (1) | PASS | PASS | three causes of khafḍ. |
| 57 | الظَّرْفُ / Adverb of time/place | 148–153 | PASS | PASS | PASS (1) | PASS | PASS | manṣūb, taqdīr «في»; example أَمَامَ (+muḍāf). |
| 58 | الْمُضَافُ / First of iḍāfah | 175,177,178 | PASS | PASS | PASS (1) | PASS | PASS | drops tanwīn/nūn; parsed by role. |
| 58b | الْمُضَافُ إِلَيْهِ / Second of iḍāfah | 175,177,178 | PASS | PASS | PASS (1) | PASS | PASS | always makhfūḍ by iḍāfah. |
| 60 | الرَّابِطُ / Link back to mubtadaʾ | 103,104,130 | PASS | PASS | PASS (1) | PASS | PASS | example «الطَّالِبُ كِتَابُهُ جَدِيدٌ» هُ = rābiṭ. |

*(row "58b" = الْمُضَافُ إِلَيْهِ, the 23rd item of Group 3; numbering is display-only. Group 3 holds 24 items.)*

## Group 4 — Governing words and particles (10)

| # | Term | Pages | Simple | Expanded | Examples | Arabic | English | Notes |
|---|------|-------|--------|----------|----------|--------|---------|-------|
| 61 | الْعَامِلُ / Governing word | 19 | PASS | PASS | PASS (1) | PASS | PASS | lafẓī vs maʿnawī (ibtidāʾ) — accurate. |
| 62 | إِنَّ وَأَخَوَاتُهَا / Inna & sisters | 105,109,110 | PASS | PASS | PASS (1) | PASS | PASS | six sisters listed; naṣb ism / rafʿ khabar. |
| 63 | اسْمُ إِنَّ / Ism of inna | 105,109,110 | PASS | PASS | PASS (1) | PASS | PASS | example لَعَلَّ الْبَابَ مَفْتُوحٌ. |
| 64 | خَبَرُ إِنَّ / Khabar of inna | 105,109,110 | PASS | PASS | PASS (1) | PASS | PASS | marfūʿ. |
| 65 | كَانَ وَأَخَوَاتُهَا / Kāna & sisters | 105,106 | PASS | PASS | PASS (1) | PASS | PASS | كان/أصبح/صار/ليس. |
| 66 | اسْمُ كَانَ / Ism of kāna | 105,106 | PASS | PASS | PASS (1) | PASS | PASS | marfūʿ. |
| 67 | خَبَرُ كَانَ / Khabar of kāna | 105,106 | PASS | PASS | PASS (1) | PASS | PASS | manṣūb. |
| 68 | النَّاصِبُ / Accusative governor | 73,74 | PASS | PASS | PASS (1) | PASS | PASS | أن/لن/كي/إذن; example لَنْ يَغِيبَ. |
| 69 | الْجَازِمُ / Jussive governor | 79,80 | PASS | PASS | PASS (1) | PASS | PASS | لم/لمَّا/لام الأمر/لا الناهية; example لَمْ يَغِبْ (correct short vowel). |
| 70 | لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ / No syntactic position | 60 | PASS | PASS | PASS (1) | PASS | PASS | example هَلْ. |

---

## Summary

- **Definitions:** 70 audited. **7 fields FIXED** across **6 definitions** (Issues 1–6; #22 also had its simple def harmonized). **64 PASS** with no change.
- **Examples:** 88 audited individually (Arabic validity, naturalness, focus presence, iʿrāb, state, sign, explanation, translation). **88 PASS** — no example replaced or removed. Example count stays **88**.
- **Terminology:** khafḍ/مخفوض used consistently for nouns in learner-facing text; جار ومجرور retained only as the construction name. No `مجرور` case-labels, no `عَلَامَةُ جَرِّهِ`.
- **Source pages:** all present and consistent with the app's `definitionSourceGroups`; none invented; no fabricated quotations (expanded texts are paraphrases).

### Style observations (no change required)
- Definition #6 "الْفِعْلُ الْمَاضِي النَّاقِصُ / Deficient past-tense verb" is a project-specific label for kāna-family; internally consistent and paired with the standard كان وأخواتها card (#65). Left as-is.
- Example «إِنْ قَامَ زَيْدٌ» (incomplete speech) is slightly abstract but is the canonical textbook illustration. Left as-is.
- No `[object Object]`, `undefined`, `null`, empty focus, or duplicate example (ar+iʿrāb) found — enforced by harness and re-verified via JSON dump.
