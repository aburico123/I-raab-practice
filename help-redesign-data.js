/*
 * Manual Chapter Help redesign map for the 23 chapters published through
 * printed page 118. This file does not replace the reviewed help prose in
 * lesson-data.js. For each chapter, sections[n] supplies presentation
 * metadata for chapter.help[n], in the same order.
 *
 * The essentials are concise app-prepared study summaries. Their exampleId
 * values were checked against active Book Practice records in the same
 * chapter. The held relative-06 item is intentionally never referenced.
 */

const HELP_REDESIGN_BY_CHAPTER = {
  'speech-core': {
    essentials: {
      coreRuleAr: 'الْكَلَامُ لَفْظٌ مُرَكَّبٌ يُفِيدُ مَعْنًى تَامًّا.',
      coreRuleEn: 'Speech is a composed utterance that gives a complete meaning.',
      definitionAr: 'الْكَلَامُ هُوَ اللَّفْظُ الْمُرَكَّبُ الْمُفِيدُ بِالْوَضْعِ.',
      definitionEn: 'Speech is an utterance that is composed, complete in meaning, and used according to Arabic convention.',
      effectAr: 'يُبَيِّنُ هَلِ التَّرْكِيبُ تَامٌّ يُسْكَتُ عَلَيْهِ أَمْ يَحْتَاجُ إِلَى تَتِمَّةٍ.',
      effectEn: 'The rule tells you whether an utterance is complete or still needs a completion.',
      recognitionAr: 'اسْأَلْ: هَلْ فَهِمَ السَّامِعُ مَعْنًى تَامًّا يَحْسُنُ السُّكُوتُ عَلَيْهِ؟',
      recognitionEn: 'Ask whether the listener receives a complete meaning on which the speaker may stop.',
      exampleId: 'speech-01',
      cautionsAr: 'قَدْ يَكُونُ التَّرْكِيبُ مُؤَلَّفًا مِنْ كَلِمَاتٍ وَلَكِنَّهُ غَيْرُ مُفِيدٍ وَحْدَهُ.',
      cautionsEn: 'A string may contain several words yet remain incomplete by itself.'
    },
    sections: [
      { id: 'speech-core-definition', titleAr: 'تَعْرِيفُ الْكَلَامِ', titleEn: 'Definition of speech', group: 'definition', defaultOpen: true },
      { id: 'speech-core-minimum-forms', titleAr: 'أَقَلُّ مَا يَتَأَلَّفُ مِنْهُ', titleEn: 'Smallest complete forms', group: 'forms', defaultOpen: false },
      { id: 'speech-core-incomplete-condition', titleAr: 'التَّرْكِيبُ غَيْرُ الْمُفِيدِ', titleEn: 'An incomplete construction', group: 'caution', defaultOpen: false }
    ]
  },

  'word-types': {
    essentials: {
      coreRuleAr: 'كُلُّ كَلِمَةٍ اسْمٌ، أَوْ فِعْلٌ، أَوْ حَرْفٌ.',
      coreRuleEn: 'Every word is a noun, a verb, or a particle.',
      definitionAr: 'الْكَلِمَةُ قَوْلٌ مُفْرَدٌ دَالٌّ عَلَى مَعْنًى.',
      definitionEn: 'A word is a single expression that conveys a meaning.',
      effectAr: 'يُحَدِّدُ نَوْعُ الْكَلِمَةِ الْعَلَامَاتِ وَالْأَحْكَامَ الَّتِي تَقْبَلُهَا.',
      effectEn: 'A word’s type determines which signs and grammatical rulings it can take.',
      recognitionAr: 'ابْحَثْ عَنْ عَلَامَاتِ الِاسْمِ أَوِ الْفِعْلِ؛ فَإِنْ لَمْ تَصْلُحْ وَاحِدَةٌ مِنْهَا فَالْكَلِمَةُ حَرْفٌ.',
      recognitionEn: 'Test for noun and verb signs; if neither set fits, the word is a particle.',
      exampleId: 'word-01',
      cautionsAr: 'لَا تَعْتَمِدْ عَلَى التَّرْجَمَةِ وَحْدَهَا؛ بَلْ عَلَى عَلَامَاتِ الْكَلِمَةِ فِي الْعَرَبِيَّةِ.',
      cautionsEn: 'Do not classify a word from translation alone; use its Arabic signs.'
    },
    sections: [
      { id: 'word-types-three-kinds', titleAr: 'أَقْسَامُ الْكَلِمَةِ الثَّلَاثَةُ', titleEn: 'The three word types', group: 'overview', defaultOpen: true },
      { id: 'word-types-noun-signs', titleAr: 'الِاسْمُ وَعَلَامَاتُهُ', titleEn: 'The noun and its signs', group: 'recognition', defaultOpen: false },
      { id: 'word-types-verb-signs', titleAr: 'الْفِعْلُ وَعَلَامَاتُهُ', titleEn: 'The verb and its signs', group: 'recognition', defaultOpen: false },
      { id: 'word-types-verb-tenses', titleAr: 'عَلَامَاتُ أَنْوَاعِ الْفِعْلِ', titleEn: 'Recognizing the verb forms', group: 'forms', defaultOpen: false },
      { id: 'word-types-particle-test', titleAr: 'الْحَرْفُ وَعَلَامَتُهُ', titleEn: 'The particle and its test', group: 'recognition', defaultOpen: false }
    ]
  },

  'iraab-bina': {
    essentials: {
      coreRuleAr: 'الْمُعْرَبُ يَتَغَيَّرُ آخِرُهُ بِالْعَامِلِ، وَالْمَبْنِيُّ يَلْزَمُ آخِرًا وَاحِدًا.',
      coreRuleEn: 'An inflected word changes its ending with the governor; a fixed word keeps one ending.',
      definitionAr: 'الْإِعْرَابُ تَغَيُّرُ الْآخِرِ لِاخْتِلَافِ الْعَوَامِلِ، وَالْبِنَاءُ لُزُومُ الْآخِرِ حَالًا وَاحِدَةً.',
      definitionEn: 'Iʿrāb is an ending changing with grammatical governors; bināʾ is an ending remaining fixed.',
      effectAr: 'يُفَرِّقُ بَيْنَ عَلَامَةٍ تَتَغَيَّرُ وَنِهَايَةٍ ثَابِتَةٍ قَدْ يَكُونُ لِكَلِمَتِهَا مَحَلٌّ إِعْرَابِيٌّ.',
      effectEn: 'It distinguishes a changing sign from a fixed ending, while allowing a fixed word to occupy a syntactic position.',
      recognitionAr: 'قَارِنْ آخِرَ الْكَلِمَةِ مَعَ عَوَامِلَ مُخْتَلِفَةٍ: أَيَتَغَيَّرُ أَمْ يَثْبُتُ؟',
      recognitionEn: 'Compare the word under different governors: does its ending change or remain fixed?',
      exampleId: 'iraab-01',
      cautionsAr: 'حَرَكَةُ الْبِنَاءِ لَيْسَتْ هِيَ الْمَحَلَّ الْإِعْرَابِيَّ.',
      cautionsEn: 'A fixed ending is not the same thing as the word’s syntactic position.'
    },
    sections: [
      { id: 'iraab-bina-definition-iraab', titleAr: 'تَعْرِيفُ الْإِعْرَابِ', titleEn: 'Definition of iʿrāb', group: 'definition', defaultOpen: true },
      { id: 'iraab-bina-four-types', titleAr: 'أَقْسَامُ الْإِعْرَابِ', titleEn: 'The four types of iʿrāb', group: 'overview', defaultOpen: false },
      { id: 'iraab-bina-definition-bina', titleAr: 'تَعْرِيفُ الْبِنَاءِ', titleEn: 'Definition of bināʾ', group: 'definition', defaultOpen: false },
      { id: 'iraab-bina-fixed-versus-inflected', titleAr: 'الْمُعْرَبُ وَالْمَبْنِيُّ', titleEn: 'Inflected versus fixed', group: 'comparison', defaultOpen: false }
    ]
  },

  'noun-forms': {
    essentials: {
      coreRuleAr: 'الِاسْمُ إِمَّا مُعْرَبٌ يَتَغَيَّرُ آخِرُهُ، وَإِمَّا مَبْنِيٌّ يَثْبُتُ آخِرُهُ.',
      coreRuleEn: 'A noun is either inflected and changes its ending, or fixed and keeps its ending.',
      definitionAr: 'الْمُعْرَبُ هُوَ الْأَصْلُ فِي الْأَسْمَاءِ، وَالْمَبْنِيُّ فَرْعٌ عَنْهُ.',
      definitionEn: 'Inflection is the default for nouns; fixed forms are the secondary class.',
      effectAr: 'يُحَدِّدُ هَلْ نَذْكُرُ عَلَامَةً ظَاهِرَةً أَوْ مُقَدَّرَةً، أَوْ بِنَاءً ثَابِتًا وَمَحَلًّا إِعْرَابِيًّا.',
      effectEn: 'The classification tells us to state a visible or estimated sign, or a fixed ending together with any syntactic position.',
      recognitionAr: 'انْظُرْ هَلْ يَتَغَيَّرُ آخِرُ الِاسْمِ عِنْدَ تَغَيُّرِ الْعَامِلِ.',
      recognitionEn: 'Check whether the noun’s ending changes when its governor changes.',
      exampleId: 'noun-01',
      cautionsAr: 'فِي الِاسْمِ الْمَبْنِيِّ افْصِلْ بَيْنَ حَرَكَةِ بِنَائِهِ وَمَحَلِّهِ فِي الْجُمْلَةِ.',
      cautionsEn: 'For a fixed noun, keep its fixed ending separate from its sentence-level position.'
    },
    sections: [
      { id: 'noun-forms-two-kinds', titleAr: 'قِسْمَا الِاسْمِ', titleEn: 'The two noun classes', group: 'overview', defaultOpen: true },
      { id: 'noun-forms-inflected-nouns', titleAr: 'الِاسْمُ الْمُعْرَبُ', titleEn: 'The inflected noun', group: 'definition', defaultOpen: false },
      { id: 'noun-forms-fixed-nouns', titleAr: 'الِاسْمُ الْمَبْنِيُّ', titleEn: 'The fixed noun', group: 'definition', defaultOpen: false },
      { id: 'noun-forms-fixed-endings', titleAr: 'أَنْوَاعُ بِنَاءِ الِاسْمِ', titleEn: 'Fixed noun endings', group: 'forms', defaultOpen: false }
    ]
  },

  'verb-forms': {
    essentials: {
      coreRuleAr: 'الْمَاضِي وَالْأَمْرُ مَبْنِيَّانِ، وَالْمُضَارِعُ مُعْرَبٌ إِلَّا مَعَ نُونِ النِّسْوَةِ أَوْ نُونِ التَّوْكِيدِ الْمُبَاشِرَةِ.',
      coreRuleEn: 'The past and imperative are fixed; the present is inflected except with feminine-plural nūn or directly attached emphasis nūn.',
      definitionAr: 'الْفِعْلُ مَبْنِيٌّ فِي الْأَصْلِ، وَإِعْرَابُ الْمُضَارِعِ فَرْعٌ.',
      definitionEn: 'Fixed form is the default for verbs; the inflection of the present verb is secondary.',
      effectAr: 'يُحَدِّدُ نَوْعُ الْفِعْلِ وَمَا اتَّصَلَ بِهِ حَرَكَةَ بِنَائِهِ أَوْ حُكْمَ إِعْرَابِهِ.',
      effectEn: 'The verb form and its attachments determine its fixed ending or inflectional mood.',
      recognitionAr: 'حَدِّدِ الزَّمَنَ أَوَّلًا، ثُمَّ افْحَصْ مَا اتَّصَلَ بِآخِرِ الْفِعْلِ.',
      recognitionEn: 'Identify the tense first, then inspect what is attached to the verb’s ending.',
      exampleId: 'verb-01',
      cautionsAr: 'قَدْ لَا يَكُونُ لِلْفِعْلِ الْمَبْنِيِّ مَحَلٌّ، وَيَكُونُ لِلْجُمْلَةِ الَّتِي فِيهَا مَحَلٌّ.',
      cautionsEn: 'A fixed verb may have no syntactic position even when its whole clause has one.'
    },
    sections: [
      { id: 'verb-forms-two-kinds', titleAr: 'قِسْمَا الْفِعْلِ', titleEn: 'The two verb classes', group: 'overview', defaultOpen: true },
      { id: 'verb-forms-past-endings', titleAr: 'بِنَاءُ الْفِعْلِ الْمَاضِي', titleEn: 'Past-verb endings', group: 'forms', defaultOpen: false },
      { id: 'verb-forms-imperative-endings', titleAr: 'بِنَاءُ فِعْلِ الْأَمْرِ', titleEn: 'Imperative endings', group: 'forms', defaultOpen: false },
      { id: 'verb-forms-present-rule', titleAr: 'إِعْرَابُ الْفِعْلِ الْمُضَارِعِ', titleEn: 'When the present verb is inflected', group: 'conditions', defaultOpen: false },
      { id: 'verb-forms-clause-position', titleAr: 'مَحَلُّ الْفِعْلِ وَمَحَلُّ جُمْلَتِهِ', titleEn: 'The verb and its clause position', group: 'caution', defaultOpen: false }
    ]
  },

  'particle-forms': {
    essentials: {
      coreRuleAr: 'الْحُرُوفُ كُلُّهَا مَبْنِيَّةٌ وَلَا مَحَلَّ لَهَا مِنَ الْإِعْرَابِ.',
      coreRuleEn: 'All particles are fixed and have no syntactic position.',
      definitionAr: 'الْحَرْفُ كَلِمَةٌ ثَابِتَةُ الْآخِرِ يَظْهَرُ مَعْنَاهَا مَعَ غَيْرِهَا.',
      definitionEn: 'A particle is a fixed word whose meaning appears through another word or construction.',
      effectAr: 'يُذْكَرُ نَوْعُ الْحَرْفِ وَحَرَكَةُ بِنَائِهِ، ثُمَّ أَنَّهُ لَا مَحَلَّ لَهُ.',
      effectEn: 'Parse a particle by naming its type and fixed ending, then stating that it has no syntactic position.',
      recognitionAr: 'إِذَا لَمْ تَصْلُحْ لِلْكَلِمَةِ عَلَامَاتُ الِاسْمِ وَلَا الْفِعْلِ فَهِيَ حَرْفٌ.',
      recognitionEn: 'If neither noun nor verb signs fit the word, it is a particle.',
      exampleId: 'particle-01'
    },
    sections: [
      { id: 'particle-forms-all-fixed', titleAr: 'الْحُرُوفُ كُلُّهَا مَبْنِيَّةٌ', titleEn: 'All particles are fixed', group: 'definition', defaultOpen: true },
      { id: 'particle-forms-four-endings', titleAr: 'حَرَكَاتُ بِنَاءِ الْحُرُوفِ', titleEn: 'Four fixed particle endings', group: 'forms', defaultOpen: false }
    ]
  },

  'raf-signs': {
    essentials: {
      coreRuleAr: 'عَلَامَاتُ الرَّفْعِ أَرْبَعٌ: الضَّمَّةُ، وَالْوَاوُ، وَالْأَلِفُ، وَثُبُوتُ النُّونِ.',
      coreRuleEn: 'Rafʿ has four signs: ḍammah, wāw, alif, and retention of nūn.',
      definitionAr: 'الضَّمَّةُ هِيَ الْعَلَامَةُ الْأَصْلِيَّةُ، وَالثَّلَاثُ الْبَاقِيَةُ نَوَائِبُ عَنْهَا.',
      definitionEn: 'Ḍammah is the original sign; the other three substitute for it.',
      effectAr: 'تَدُلُّ عَلَامَةُ الرَّفْعِ عَلَى حُكْمِ الِاسْمِ الْمَرْفُوعِ أَوِ الْفِعْلِ الْمُضَارِعِ الْمَرْفُوعِ بِحَسَبِ صِيغَتِهِ.',
      effectEn: 'The chosen sign displays rafʿ on a noun or the indicative mood of a present verb according to its form.',
      recognitionAr: 'حَدِّدِ الْوَظِيفَةَ الَّتِي أَوْجَبَتِ الرَّفْعَ، ثُمَّ صِيغَةَ الْكَلِمَةِ، ثُمَّ عَلَامَتَهَا.',
      recognitionEn: 'Identify what gives the word rafʿ, then its form, sign, and why that sign applies.',
      exampleId: 'raf-01',
      cautionsAr: 'قَدْ تَكُونُ الضَّمَّةُ ظَاهِرَةً أَوْ مُقَدَّرَةً، وَتُذْكَرُ عِلَّةُ التَّقْدِيرِ.',
      cautionsEn: 'Ḍammah may be visible or estimated; state the reason when it is estimated.'
    },
    sections: [
      { id: 'raf-signs-overview', titleAr: 'عَلَامَاتُ الرَّفْعِ الْأَرْبَعُ', titleEn: 'The four signs of rafʿ', group: 'overview', defaultOpen: true },
      { id: 'raf-signs-dammah', titleAr: 'مَوَاضِعُ الضَّمَّةِ', titleEn: 'Where ḍammah marks rafʿ', group: 'signs', defaultOpen: false },
      { id: 'raf-signs-waw', titleAr: 'مَوَاضِعُ الْوَاوِ', titleEn: 'Where wāw marks rafʿ', group: 'signs', defaultOpen: false },
      { id: 'raf-signs-alif-and-nun', titleAr: 'الْأَلِفُ وَثُبُوتُ النُّونِ', titleEn: 'Alif and retained nūn', group: 'signs', defaultOpen: false },
      { id: 'raf-signs-three-questions', titleAr: 'كَيْفَ تَتَحَقَّقُ مِنَ الرَّفْعِ؟', titleEn: 'Three checks for rafʿ', group: 'recognition', defaultOpen: false }
    ]
  },

  'nasb-signs': {
    essentials: {
      coreRuleAr: 'عَلَامَاتُ النَّصْبِ خَمْسٌ: الْفَتْحَةُ، وَالْأَلِفُ، وَالْكَسْرَةُ، وَالْيَاءُ، وَحَذْفُ النُّونِ.',
      coreRuleEn: 'Naṣb has five signs: fatḥah, alif, kasrah, yāʾ, and deletion of nūn.',
      definitionAr: 'الْفَتْحَةُ هِيَ الْعَلَامَةُ الْأَصْلِيَّةُ، وَالْأَرْبَعُ الْبَاقِيَةُ نَوَائِبُ عَنْهَا.',
      definitionEn: 'Fatḥah is the original sign; the other four substitute for it.',
      effectAr: 'تَدُلُّ عَلَامَةُ النَّصْبِ عَلَى حُكْمِ الِاسْمِ الْمَنْصُوبِ أَوِ الْفِعْلِ الْمُضَارِعِ الْمَنْصُوبِ بِحَسَبِ صِيغَتِهِ.',
      effectEn: 'The chosen sign displays naṣb on a noun or the subjunctive mood of a present verb according to its form.',
      recognitionAr: 'حَدِّدِ الْعَامِلَ، ثُمَّ صِيغَةَ الْكَلِمَةِ، ثُمَّ عَلَامَةَ النَّصْبِ وَسَبَبَ اخْتِيَارِهَا.',
      recognitionEn: 'Identify the governor, the word form, the sign of naṣb, and why that sign applies.',
      exampleId: 'nasb-01',
      cautionsAr: 'عِنْدَ الْعَلَامَةِ النَّائِبَةِ اذْكُرِ السَّبَبَ الْمُوجَزَ الَّذِي يَخُصُّ صِيغَةَ الْكَلِمَةِ.',
      cautionsEn: 'For a substitute sign, briefly state the word form that requires it.'
    },
    sections: [
      { id: 'nasb-signs-overview', titleAr: 'عَلَامَاتُ النَّصْبِ الْخَمْسُ', titleEn: 'The five signs of naṣb', group: 'overview', defaultOpen: true },
      { id: 'nasb-signs-fathah', titleAr: 'مَوَاضِعُ الْفَتْحَةِ', titleEn: 'Where fatḥah marks naṣb', group: 'signs', defaultOpen: false },
      { id: 'nasb-signs-alif-and-kasrah', titleAr: 'الْأَلِفُ وَالْكَسْرَةُ', titleEn: 'Alif and kasrah', group: 'signs', defaultOpen: false },
      { id: 'nasb-signs-yaa', titleAr: 'مَوَاضِعُ الْيَاءِ', titleEn: 'Where yāʾ marks naṣb', group: 'signs', defaultOpen: false },
      { id: 'nasb-signs-delete-nun', titleAr: 'حَذْفُ النُّونِ وَأَسْئِلَةُ النَّصْبِ', titleEn: 'Deleted nūn and the naṣb checks', group: 'recognition', defaultOpen: false }
    ]
  },

  'khafd-signs': {
    essentials: {
      coreRuleAr: 'عَلَامَاتُ الْخَفْضِ ثَلَاثٌ: الْكَسْرَةُ، وَالْيَاءُ، وَالْفَتْحَةُ.',
      coreRuleEn: 'Khafḍ has three signs: kasrah, yāʾ, and fatḥah.',
      definitionAr: 'الْكَسْرَةُ هِيَ الْعَلَامَةُ الْأَصْلِيَّةُ، وَالْيَاءُ وَالْفَتْحَةُ نَائِبَتَانِ عَنْهَا.',
      definitionEn: 'Kasrah is the original sign; yāʾ and fatḥah substitute for it.',
      effectAr: 'تُظْهِرُ عَلَامَةُ الْخَفْضِ أَثَرَ حَرْفِ الْجَرِّ أَوِ الْإِضَافَةِ أَوْ غَيْرِهِمَا فِي الِاسْمِ.',
      effectEn: 'The sign of khafḍ displays the effect of a preposition, iḍāfah, or another genitive governor on a noun.',
      recognitionAr: 'اذْكُرِ الْعَامِلَ وَوَظِيفَةَ الِاسْمِ وَعَلَامَةَ خَفْضِهِ وَسَبَبَ اخْتِيَارِهَا.',
      recognitionEn: 'State the governor, the noun’s role, its sign of khafḍ, and why that sign applies.',
      exampleId: 'khafd-01',
      cautionsAr: 'الِاسْمُ الَّذِي لَا يَنْصَرِفُ يُخْفَضُ بِالْفَتْحَةِ مَا لَمْ تَدْخُلْ عَلَيْهِ «أَلْ» أَوْ يُضَفْ.',
      cautionsEn: 'A diptote takes fatḥah in khafḍ unless it has al or is annexed.'
    },
    sections: [
      { id: 'khafd-signs-overview', titleAr: 'عَلَامَاتُ الْخَفْضِ الثَّلَاثُ', titleEn: 'The three signs of khafḍ', group: 'overview', defaultOpen: true },
      { id: 'khafd-signs-kasrah', titleAr: 'مَوَاضِعُ الْكَسْرَةِ', titleEn: 'Where kasrah marks khafḍ', group: 'signs', defaultOpen: false },
      { id: 'khafd-signs-yaa', titleAr: 'مَوَاضِعُ الْيَاءِ', titleEn: 'Where yāʾ marks khafḍ', group: 'signs', defaultOpen: false },
      { id: 'khafd-signs-fathah', titleAr: 'الْفَتْحَةُ فِي غَيْرِ الْمُنْصَرِفِ', titleEn: 'Fatḥah with a diptote', group: 'signs', defaultOpen: false },
      { id: 'khafd-signs-four-questions', titleAr: 'كَيْفَ تَتَحَقَّقُ مِنَ الْخَفْضِ؟', titleEn: 'Four checks for khafḍ', group: 'recognition', defaultOpen: false }
    ]
  },

  'jazm-signs': {
    essentials: {
      coreRuleAr: 'لِلْجَزْمِ عَلَامَتَانِ: السُّكُونُ وَالْحَذْفُ.',
      coreRuleEn: 'Jazm has two signs: sukūn and deletion.',
      definitionAr: 'السُّكُونُ هُوَ الْعَلَامَةُ الْأَصْلِيَّةُ، وَالْحَذْفُ نَائِبٌ عَنْهُ.',
      definitionEn: 'Sukūn is the original sign; deletion substitutes for it.',
      effectAr: 'يَجْزِمُ الْعَامِلُ الْفِعْلَ الْمُضَارِعَ، فَيَظْهَرُ السُّكُونُ أَوْ يُحْذَفُ حَرْفُ عِلَّةٍ أَوِ النُّونُ.',
      effectEn: 'A jussive governor affects the present verb by sukūn or by deleting a weak letter or nūn.',
      recognitionAr: 'حَدِّدِ الْعَامِلَ، ثُمَّ انْظُرْ: أَصَحِيحُ الْآخِرِ هُوَ، أَمْ مُعْتَلٌّ، أَمْ مِنَ الْأَفْعَالِ الْخَمْسَةِ؟',
      recognitionEn: 'Identify the governor, then decide whether the verb is sound-final, weak-final, or one of the five forms.',
      exampleId: 'jazm-01',
      cautionsAr: 'عِنْدَ الْحَذْفِ عَيِّنِ الْمَحْذُوفَ: حَرْفَ الْعِلَّةِ أَوِ النُّونَ.',
      cautionsEn: 'When the sign is deletion, identify exactly what was deleted.'
    },
    sections: [
      { id: 'jazm-signs-overview', titleAr: 'عَلَامَتَا الْجَزْمِ', titleEn: 'The two signs of jazm', group: 'overview', defaultOpen: true },
      { id: 'jazm-signs-sukun', titleAr: 'السُّكُونُ', titleEn: 'Sukūn', group: 'signs', defaultOpen: false },
      { id: 'jazm-signs-delete-weak-letter', titleAr: 'حَذْفُ حَرْفِ الْعِلَّةِ', titleEn: 'Deletion of a weak letter', group: 'signs', defaultOpen: false },
      { id: 'jazm-signs-delete-nun', titleAr: 'حَذْفُ النُّونِ', titleEn: 'Deletion of nūn', group: 'signs', defaultOpen: false },
      { id: 'jazm-signs-oral-check', titleAr: 'طَرِيقَةُ إِعْرَابِ الْمَجْزُومِ', titleEn: 'How to parse a jussive verb', group: 'recognition', defaultOpen: false }
    ]
  },

  'summary-recap': {
    essentials: {
      coreRuleAr: 'الْمُعْرَبُ إِمَّا بِالْحَرَكَاتِ وَإِمَّا بِالْحُرُوفِ.',
      coreRuleEn: 'Inflection is shown either by vowel signs or by letter signs.',
      definitionAr: 'تَجْمَعُ هَذِهِ الْخُلَاصَةُ الْكَلِمَاتِ بِحَسَبِ صِيغَتِهَا وَعَلَامَاتِ إِعْرَابِهَا.',
      definitionEn: 'This recap groups words by form and by the signs that display their inflection.',
      effectAr: 'تَنْقُلُ الطَّالِبَ مِنْ تَعْرِيفِ صِيغَةِ الْكَلِمَةِ إِلَى اخْتِيَارِ عَلَامَةِ إِعْرَابِهَا.',
      effectEn: 'It directs the student from identifying a word form to choosing its correct inflectional sign.',
      recognitionAr: 'حَدِّدْ أَوَّلًا: أَمُفْرَدٌ هُوَ، أَمْ مُثَنًّى، أَمْ جَمْعٌ، أَمْ مِنَ الْأَسْمَاءِ السِّتَّةِ، أَمْ مِنَ الْأَفْعَالِ الْخَمْسَةِ؟',
      recognitionEn: 'First identify whether the word is singular, dual, plural, one of the six nouns, or one of the five verb forms.',
      exampleId: 'summary-01',
      cautionsAr: 'تَلْحَقُ «كِلَا» وَ«كِلْتَا» بِالْمُثَنَّى إِذَا أُضِيفَتَا إِلَى ضَمِيرٍ، وَلَهُمَا حُكْمٌ آخَرُ مَعَ الِاسْمِ الظَّاهِرِ.',
      cautionsEn: 'Kilā and kiltā follow dual inflection when annexed to a pronoun, but behave differently with an overt noun.'
    },
    sections: [
      { id: 'summary-recap-vowels-and-letters', titleAr: 'الْإِعْرَابُ بِالْحَرَكَاتِ وَالْحُرُوفِ', titleEn: 'Inflection by vowels and letters', group: 'overview', defaultOpen: true },
      { id: 'summary-recap-letter-classes', titleAr: 'الْمُعْرَبُ بِالْحُرُوفِ', titleEn: 'Classes inflected by letters', group: 'overview', defaultOpen: false },
      { id: 'summary-recap-dual', titleAr: 'عَلَامَاتُ الْمُثَنَّى', titleEn: 'The dual’s signs', group: 'signs', defaultOpen: false },
      { id: 'summary-recap-sound-masculine-plural', titleAr: 'عَلَامَاتُ جَمْعِ الْمُذَكَّرِ السَّالِمِ', titleEn: 'Sound masculine plural signs', group: 'signs', defaultOpen: false },
      { id: 'summary-recap-five-verbs', titleAr: 'عَلَامَاتُ الْأَفْعَالِ الْخَمْسَةِ', titleEn: 'The five verb forms', group: 'signs', defaultOpen: false },
      { id: 'summary-recap-fourteen-signs', titleAr: 'عَلَامَاتُ الْإِعْرَابِ الْأَرْبَعَ عَشْرَةَ', titleEn: 'The fourteen inflection signs', group: 'overview', defaultOpen: false }
    ]
  },

  'estimated-inflection': {
    essentials: {
      coreRuleAr: 'قَدْ يَثْبُتُ حُكْمُ الْإِعْرَابِ وَتُقَدَّرُ عَلَامَتُهُ إِذْ لَا تَظْهَرُ عَلَى آخِرِ الْكَلِمَةِ.',
      coreRuleEn: 'A word may have an inflectional ruling whose sign is estimated because it cannot appear on the ending.',
      definitionAr: 'الْإِعْرَابُ التَّقْدِيرِيُّ حُكْمٌ إِعْرَابِيٌّ عَلَامَتُهُ غَيْرُ ظَاهِرَةٍ عَلَى اللَّفْظِ.',
      definitionEn: 'Estimated inflection is a grammatical ruling whose sign is not visibly pronounced on the word.',
      effectAr: 'يُذْكَرُ الدَّوْرُ وَالْحُكْمُ وَالْعَلَامَةُ الْمُقَدَّرَةُ وَمَوْضِعُهَا وَسَبَبُ تَقْدِيرِهَا.',
      effectEn: 'State the role, ruling, estimated sign, where it is estimated, and the reason it cannot appear.',
      recognitionAr: 'افْحَصْ يَاءَ الْمُتَكَلِّمِ، وَالِاسْمَ الْمَقْصُورَ وَالْمَنْقُوصَ، وَالْفِعْلَ الْمُعْتَلَّ الْآخِرِ.',
      recognitionEn: 'Look for the speaker’s yāʾ, maqṣūr and manqūṣ nouns, and weak-final present verbs.',
      exampleId: 'estimated-01',
      cautionsAr: 'لَيْسَتْ كُلُّ حَرَكَاتِ الْمَنْقُوصِ مُقَدَّرَةً؛ فَالْفَتْحَةُ تَظْهَرُ عَلَى يَائِهِ.',
      cautionsEn: 'Not every sign on a manqūṣ noun is estimated; fatḥah appears on its yāʾ.'
    },
    sections: [
      { id: 'estimated-inflection-overview', titleAr: 'مَوَاضِعُ الْإِعْرَابِ التَّقْدِيرِيِّ', titleEn: 'Where signs are estimated', group: 'overview', defaultOpen: true },
      { id: 'estimated-inflection-speaker-yaa', titleAr: 'مَا قَبْلَ يَاءِ الْمُتَكَلِّمِ', titleEn: 'Before the speaker’s yāʾ', group: 'conditions', defaultOpen: false },
      { id: 'estimated-inflection-maqsur', titleAr: 'الِاسْمُ الْمَقْصُورُ', titleEn: 'The maqṣūr noun', group: 'conditions', defaultOpen: false },
      { id: 'estimated-inflection-manqus', titleAr: 'الِاسْمُ الْمَنْقُوصُ', titleEn: 'The manqūṣ noun', group: 'conditions', defaultOpen: false },
      { id: 'estimated-inflection-weak-verbs', titleAr: 'الْفِعْلُ الْمُعْتَلُّ الْآخِرِ', titleEn: 'Weak-final present verbs', group: 'conditions', defaultOpen: false }
    ]
  },

  'diptote-nouns': {
    essentials: {
      coreRuleAr: 'الِاسْمُ الَّذِي لَا يَنْصَرِفُ لَا يُنَوَّنُ، وَيُخْفَضُ بِالْفَتْحَةِ مَا لَمْ تَدْخُلْ عَلَيْهِ «أَلْ» أَوْ يُضَفْ.',
      coreRuleEn: 'A diptote does not take tanwīn and takes fatḥah in khafḍ unless it has al or is annexed.',
      definitionAr: 'هُوَ اسْمٌ مُعْرَبٌ مُنِعَ مِنَ الصَّرْفِ لِعِلَّةٍ تَقُومُ مَقَامَ عِلَّتَيْنِ أَوْ لِعِلَّتَيْنِ مُجْتَمِعَتَيْنِ.',
      definitionEn: 'It is an inflected noun barred from full declension by one cause equivalent to two or by two combined causes.',
      effectAr: 'يُرْفَعُ بِالضَّمَّةِ، وَيُنْصَبُ بِالْفَتْحَةِ، وَيُخْفَضُ بِالْفَتْحَةِ فِي حَالِهِ الْمُجَرَّدَةِ، وَبِالْكَسْرَةِ مَعَ «أَلْ» أَوِ الْإِضَافَةِ.',
      effectEn: 'It takes ḍammah in rafʿ, fatḥah in naṣb, and fatḥah in bare khafḍ, but kasrah with al or iḍāfah.',
      recognitionAr: 'تَعَرَّفْ صِيغَةَ الْكَلِمَةِ وَعِلَّةَ مَنْعِهَا مِنَ الصَّرْفِ، ثُمَّ افْحَصْ وُجُودَ «أَلْ» أَوِ الْإِضَافَةِ.',
      recognitionEn: 'Identify the form and cause of diptosis, then check whether al or iḍāfah is present.',
      exampleId: 'diptote-01',
      cautionsAr: 'يَذْكُرُ الْكِتَابُ قِرَاءَتَيْ نَافِعٍ فِي «سَلَاسِلًا» وَ«قَوَارِيرًا» عَلَى الصَّرْفِ لِلتَّنَاسُبِ.',
      cautionsEn: 'The book cites Nāfiʿ’s fully declined readings of salāsilan and qawārīran for formal matching.'
    },
    sections: [
      { id: 'diptote-nouns-definition', titleAr: 'تَعْرِيفُ غَيْرِ الْمُنْصَرِفِ', titleEn: 'What a diptote is', group: 'definition', defaultOpen: true },
      { id: 'diptote-nouns-single-causes', titleAr: 'الْعِلَّةُ الْقَائِمَةُ مَقَامَ عِلَّتَيْنِ', titleEn: 'A single cause equivalent to two', group: 'causes', defaultOpen: false },
      { id: 'diptote-nouns-paired-causes', titleAr: 'الْعِلَلُ الْمُجْتَمِعَةُ', titleEn: 'Paired causes', group: 'causes', defaultOpen: false },
      { id: 'diptote-nouns-inflection', titleAr: 'إِعْرَابُ غَيْرِ الْمُنْصَرِفِ', titleEn: 'How a diptote is inflected', group: 'signs', defaultOpen: false },
      { id: 'diptote-nouns-nafi-readings', titleAr: 'قِرَاءَتَا نَافِعٍ فِي الشَّوَاهِدِ', titleEn: 'Nāfiʿ’s cited readings', group: 'caution', defaultOpen: false }
    ]
  },

  'definiteness-intro': {
    essentials: {
      coreRuleAr: 'الِاسْمُ إِمَّا نَكِرَةٌ شَائِعَةٌ، وَإِمَّا مَعْرِفَةٌ مُعَيَّنَةٌ.',
      coreRuleEn: 'A noun is either indefinite and non-specific, or definite and identified.',
      definitionAr: 'النَّكِرَةُ تَدُلُّ عَلَى وَاحِدٍ غَيْرِ مُعَيَّنٍ، وَالْمَعْرِفَةُ تَدُلُّ عَلَى مُعَيَّنٍ.',
      definitionEn: 'An indefinite noun denotes an unspecified member; a definite noun identifies its referent.',
      effectAr: 'يُحَدِّدُ التَّعْرِيفُ هَلِ الِاسْمُ شَائِعٌ أَمْ مُعَيَّنٌ، وَيُمَهِّدُ لِأَنْوَاعِ الْمَعَارِفِ السِّتَّةِ.',
      effectEn: 'Definiteness tells whether a noun is general or identified and introduces the six kinds of definite noun.',
      recognitionAr: 'جَرِّبْ دُخُولَ «أَلْ» عَلَى النَّكِرَةِ، أَوْ تَعَرَّفْ نَوْعَ الْمَعْرِفَةِ مِنَ الْأَنْوَاعِ السِّتَّةِ.',
      recognitionEn: 'Test whether an indefinite noun accepts al, or identify which of the six definite categories the noun belongs to.',
      exampleId: 'definiteness-01'
    },
    sections: [
      { id: 'definiteness-intro-two-kinds', titleAr: 'النَّكِرَةُ وَالْمَعْرِفَةُ', titleEn: 'Indefinite and definite nouns', group: 'overview', defaultOpen: true },
      { id: 'definiteness-intro-indefinite-test', titleAr: 'عَلَامَةُ النَّكِرَةِ', titleEn: 'A practical indefinite test', group: 'recognition', defaultOpen: false },
      { id: 'definiteness-intro-six-definites', titleAr: 'أَنْوَاعُ الْمَعَارِفِ السِّتَّةُ', titleEn: 'The six definite categories', group: 'forms', defaultOpen: false },
      { id: 'definiteness-intro-ranking', titleAr: 'مَرَاتِبُ الْمَعَارِفِ', titleEn: 'Degrees of definiteness', group: 'overview', defaultOpen: false }
    ]
  },

  'pronoun-forms': {
    essentials: {
      coreRuleAr: 'الضَّمِيرُ اسْمٌ مَبْنِيٌّ يَدُلُّ عَلَى مُتَكَلِّمٍ أَوْ مُخَاطَبٍ أَوْ غَائِبٍ.',
      coreRuleEn: 'A pronoun is a fixed noun referring to a speaker, addressee, or absent person or thing.',
      definitionAr: 'الضَّمِيرُ إِمَّا مُسْتَتِرٌ، وَإِمَّا بَارِزٌ مُتَّصِلٌ أَوْ مُنْفَصِلٌ.',
      definitionEn: 'A pronoun is either hidden or explicit, and an explicit pronoun is attached or detached.',
      effectAr: 'يَبْقَى لَفْظُ الضَّمِيرِ مَبْنِيًّا، وَيَشْغَلُ مَحَلَّ رَفْعٍ أَوْ نَصْبٍ أَوْ جَرٍّ بِحَسَبِ الْجُمْلَةِ.',
      effectEn: 'The pronoun remains fixed while occupying a nominative, accusative, or genitive syntactic position.',
      recognitionAr: 'ابْحَثْ عَنِ الضَّمِيرِ فِي اللَّفْظِ أَوْ قَدِّرِ الْفَاعِلَ الْمُسْتَتِرَ مِنْ صِيغَةِ الْفِعْلِ.',
      recognitionEn: 'Locate the spoken pronoun, or recover a hidden subject from the verb form.',
      exampleId: 'pronoun-01',
      cautionsAr: 'تَاءُ التَّأْنِيثِ السَّاكِنَةُ حَرْفٌ، وَلَيْسَتْ ضَمِيرًا؛ فَفِي «قَامَتْ» الْفَاعِلُ ضَمِيرٌ مُسْتَتِرٌ تَقْدِيرُهُ «هِيَ».',
      cautionsEn: 'Silent feminine tāʾ is a particle, not a pronoun; in qāmat the subject is the hidden “she.”'
    },
    sections: [
      { id: 'pronoun-forms-definition', titleAr: 'تَعْرِيفُ الضَّمِيرِ', titleEn: 'What a pronoun is', group: 'definition', defaultOpen: true },
      { id: 'pronoun-forms-hidden', titleAr: 'الضَّمِيرُ الْمُسْتَتِرُ', titleEn: 'The hidden pronoun', group: 'forms', defaultOpen: false },
      { id: 'pronoun-forms-explicit', titleAr: 'الضَّمِيرُ الْبَارِزُ', titleEn: 'The explicit pronoun', group: 'forms', defaultOpen: false },
      { id: 'pronoun-forms-attached-paradigms', titleAr: 'صِيَغُ الضَّمِيرِ الْمُتَّصِلِ', titleEn: 'Attached-pronoun paradigms', group: 'forms', defaultOpen: false },
      { id: 'pronoun-forms-detached-lists', titleAr: 'الضَّمَائِرُ الْمُنْفَصِلَةُ', titleEn: 'Detached pronoun lists', group: 'forms', defaultOpen: false },
      { id: 'pronoun-forms-attachment-rule', titleAr: 'مَتَى يُسْتَعْمَلُ الْمُتَّصِلُ؟', titleEn: 'Prefer attachment when possible', group: 'conditions', defaultOpen: false },
      { id: 'pronoun-forms-feminine-taa', titleAr: 'تَاءُ التَّأْنِيثِ لَيْسَتْ ضَمِيرًا', titleEn: 'Feminine tāʾ is not a pronoun', group: 'caution', defaultOpen: false }
    ]
  },

  'proper-names': {
    essentials: {
      coreRuleAr: 'الْعَلَمُ مَعْرِفَةٌ وُضِعَتْ لِمُعَيَّنٍ أَوْ لِجِنْسٍ بِعَيْنِهِ.',
      coreRuleEn: 'A proper name is a definite noun assigned to a particular referent or to a species as such.',
      definitionAr: 'الْعَلَمُ شَخْصِيٌّ أَوْ جِنْسِيٌّ، وَيَكُونُ اسْمًا أَوْ كُنْيَةً أَوْ لَقَبًا.',
      definitionEn: 'A proper name may be personal or generic, and may be an ism, kunyah, or laqab.',
      effectAr: 'يُعَيِّنُ الْمُسَمَّى، وَلَكِنَّ كَوْنَهُ عَلَمًا لَا يُحَدِّدُ وَظِيفَتَهُ الْإِعْرَابِيَّةَ فِي الْجُمْلَةِ.',
      effectEn: 'It identifies its referent, but being a proper name does not by itself determine its grammatical role in the sentence.',
      recognitionAr: 'اسْأَلْ: أَوُضِعَ هَذَا اللَّفْظُ لِشَخْصٍ أَوْ مَكَانٍ أَوْ جِنْسٍ بِعَيْنِهِ؟',
      recognitionEn: 'Ask whether the form was assigned to a particular person, place, or species.',
      exampleId: 'proper-name-01',
      cautionsAr: 'افْصِلْ بَيْنَ تَصْنِيفِ الْكَلِمَةِ عَلَمًا وَبَيْنَ مَوْقِعِهَا الْإِعْرَابِيِّ فِي الْجُمْلَةِ.',
      cautionsEn: 'Keep the classification “proper name” separate from the word’s syntactic role.'
    },
    sections: [
      { id: 'proper-names-personal-and-generic', titleAr: 'الْعَلَمُ الشَّخْصِيُّ وَالْجِنْسِيُّ', titleEn: 'Personal and generic proper names', group: 'overview', defaultOpen: true },
      { id: 'proper-names-generic-examples', titleAr: 'أَمْثِلَةُ عَلَمِ الْجِنْسِ', titleEn: 'Generic proper-name examples', group: 'examples', defaultOpen: false },
      { id: 'proper-names-ism-kunya-laqab', titleAr: 'الِاسْمُ وَالْكُنْيَةُ وَاللَّقَبُ', titleEn: 'Ism, kunyah, and laqab', group: 'forms', defaultOpen: false },
      { id: 'proper-names-name-and-epithet-order', titleAr: 'تَرْتِيبُ الِاسْمِ وَاللَّقَبِ', titleEn: 'Ordering an ism and laqab', group: 'conditions', defaultOpen: false },
      { id: 'proper-names-simple-and-compound', titleAr: 'الْعَلَمُ الْمُفْرَدُ وَالْمُرَكَّبُ', titleEn: 'Simple and compound names', group: 'forms', defaultOpen: false }
    ]
  },

  'demonstrative-nouns': {
    essentials: {
      coreRuleAr: 'اسْمُ الْإِشَارَةِ مَعْرِفَةٌ تُعَيِّنُ مُشَارًا إِلَيْهِ بِحَسَبِ الْعَدَدِ وَالْجِنْسِ وَالْقُرْبِ أَوِ الْبُعْدِ.',
      coreRuleEn: 'A demonstrative identifies a referent according to number, gender, and nearness or distance.',
      definitionAr: 'هُوَ اسْمٌ وُضِعَ لِلدَّلَالَةِ عَلَى شَيْءٍ بِالْإِشَارَةِ إِلَيْهِ.',
      definitionEn: 'It is a noun used to identify something by pointing to it.',
      effectAr: 'يُعَرِّفُ الْمُشَارَ إِلَيْهِ، وَيَشْغَلُ اسْمُ الْإِشَارَةِ وَظِيفَةً إِعْرَابِيَّةً فِي جُمْلَتِهِ.',
      effectEn: 'It makes the referent definite, while the demonstrative itself occupies a grammatical role in the sentence.',
      recognitionAr: 'اخْتَرِ الصِّيغَةَ بِحَسَبِ الْمُفْرَدِ وَالْمُثَنَّى وَالْجَمْعِ، وَالْمُذَكَّرِ وَالْمُؤَنَّثِ، وَالْقَرِيبِ وَالْبَعِيدِ.',
      recognitionEn: 'Choose the form by singular, dual, or plural; masculine or feminine; and near or far.',
      exampleId: 'demonstrative-01',
      cautionsAr: 'تُعْرَبُ صِيَغُ الْمُثَنَّى إِعْرَابَ الْمُثَنَّى فِي مُعَالَجَةِ الْمُؤَلِّفِ، وَتَبْقَى هَاءُ التَّنْبِيهِ وَلَامُ الْبُعْدِ وَكَافُ الْخِطَابِ مُتَّصِلَةً فِي الْكِتَابَةِ.',
      cautionsEn: 'The author treats the dual forms like the dual; keep attention hāʾ, distance lām, and address kāf joined in writing.'
    },
    sections: [
      { id: 'demonstrative-nouns-basic-forms', titleAr: 'تَعْرِيفُ اسْمِ الْإِشَارَةِ وَصِيَغُ الْمُفْرَدِ', titleEn: 'Definition and singular forms', group: 'definition', defaultOpen: true },
      { id: 'demonstrative-nouns-dual-forms', titleAr: 'صِيَغُ الْمُثَنَّى', titleEn: 'Dual demonstratives', group: 'forms', defaultOpen: false },
      { id: 'demonstrative-nouns-plural-and-attention', titleAr: 'صِيَغُ الْجَمْعِ وَهَاءُ التَّنْبِيهِ', titleEn: 'Plural forms and attention hāʾ', group: 'forms', defaultOpen: false },
      { id: 'demonstrative-nouns-distance-markers', titleAr: 'كَافُ الْخِطَابِ وَلَامُ الْبُعْدِ', titleEn: 'Address kāf and distance lām', group: 'forms', defaultOpen: false },
      { id: 'demonstrative-nouns-place-forms', titleAr: 'أَسْمَاءُ الْإِشَارَةِ لِلْمَكَانِ', titleEn: 'Demonstratives for place', group: 'forms', defaultOpen: false }
    ]
  },

  'relative-nouns': {
    essentials: {
      coreRuleAr: 'الِاسْمُ الْمَوْصُولُ يَحْتَاجُ إِلَى صِلَةٍ وَعَائِدٍ يُتِمَّانِ مَعْنَاهُ.',
      coreRuleEn: 'A relative noun needs a relative clause and a returning pronoun to complete its meaning.',
      definitionAr: 'الِاسْمُ الْمَوْصُولُ مَعْرِفَةٌ تَفْتَقِرُ إِلَى صِلَةٍ بَعْدَهَا وَعَائِدٍ يَرْبِطُهَا بِهَا.',
      definitionEn: 'A relative noun is a definite form that requires a following ṣilah and a returning pronoun linking that clause to it.',
      effectAr: 'تَصِفُ الصِّلَةُ مَرْجِعَ الْمَوْصُولِ، وَيَرْبِطُهَا الْعَائِدُ بِهِ، وَلِلْمَوْصُولِ نَفْسِهِ مَحَلٌّ فِي الْجُمْلَةِ.',
      effectEn: 'The ṣilah describes the referent, the returning pronoun links back to it, and the relative noun itself has a sentence role.',
      recognitionAr: 'عَيِّنِ الْمَوْصُولَ، ثُمَّ حُدُودَ صِلَتِهِ، ثُمَّ الْعَائِدَ الظَّاهِرَ أَوِ الْمُسْتَتِرَ أَوِ الْمَحْذُوفَ.',
      recognitionEn: 'Locate the relative noun, the exact span of its ṣilah, and its visible, hidden, or omitted returning pronoun.',
      exampleId: 'relative-01',
      cautionsAr: 'لَا تَخْلِطْ بَيْنَ مَحَلِّ الِاسْمِ الْمَوْصُولِ وَجُمْلَةِ الصِّلَةِ الَّتِي لَا مَحَلَّ لَهَا.',
      cautionsEn: 'Do not confuse the relative noun’s syntactic position with the ṣilah clause, which has no syntactic position.'
    },
    sections: [
      { id: 'relative-nouns-definition', titleAr: 'تَعْرِيفُ الِاسْمِ الْمَوْصُولِ', titleEn: 'What a relative noun needs', group: 'definition', defaultOpen: true },
      { id: 'relative-nouns-explicit-forms', titleAr: 'الْمَوْصُولُ النَّصُّ', titleEn: 'Explicit relative forms', group: 'forms', defaultOpen: false },
      { id: 'relative-nouns-shared-forms', titleAr: 'الْمَوْصُولُ الْمُشْتَرَكُ', titleEn: 'Shared relative forms', group: 'forms', defaultOpen: false },
      { id: 'relative-nouns-silah-types', titleAr: 'أَنْوَاعُ الصِّلَةِ', titleEn: 'Types of ṣilah', group: 'forms', defaultOpen: false },
      { id: 'relative-nouns-returning-pronoun', titleAr: 'الْعَائِدُ', titleEn: 'The returning pronoun', group: 'recognition', defaultOpen: false },
      { id: 'relative-nouns-dual-treatment', titleAr: 'إِعْرَابُ صِيَغِ الْمُثَنَّى', titleEn: 'Treatment of dual relatives', group: 'caution', defaultOpen: false }
    ]
  },

  'definite-article': {
    essentials: {
      coreRuleAr: '«أَلْ» تُعَرِّفُ الِاسْمَ، وَتَكُونُ لِلْعَهْدِ أَوْ لِلْجِنْسِ.',
      coreRuleEn: 'Al makes a noun definite and is either referential or generic.',
      definitionAr: 'الْمُعَرَّفُ بِالْأَدَاةِ هُوَ الِاسْمُ الَّذِي دَخَلَتْ عَلَيْهِ الْأَلِفُ وَاللَّامُ لِتَعْرِيفِهِ.',
      definitionEn: 'A noun made definite by the article is one to which alif and lām have been added for definiteness.',
      effectAr: 'تُعَيِّنُ «أَلْ» مَعْهُودًا فِي السِّيَاقِ أَوْ تَدُلُّ عَلَى جِنْسٍ أَوِ اسْتِغْرَاقِهِ.',
      effectEn: 'Al may identify a known referent or indicate a class, its members, or its defining characteristics.',
      recognitionAr: 'حَدِّدْ «أَلْ» فِي أَوَّلِ الِاسْمِ، ثُمَّ اسْتَعِنْ بِالسِّيَاقِ لِتَمْيِيزِ الْعَهْدِ مِنَ الْجِنْسِ.',
      recognitionEn: 'Locate al at the noun’s beginning, then use context to distinguish referential from generic use.',
      exampleId: 'article-01'
    },
    sections: [
      { id: 'definite-article-two-kinds', titleAr: 'الْعَهْدِيَّةُ وَالْجِنْسِيَّةُ', titleEn: 'Referential and generic al', group: 'overview', defaultOpen: true },
      { id: 'definite-article-referential-types', titleAr: 'أَنْوَاعُ «أَلْ» الْعَهْدِيَّةِ', titleEn: 'Three referential uses', group: 'forms', defaultOpen: false },
      { id: 'definite-article-generic-types', titleAr: 'أَنْوَاعُ «أَلْ» الْجِنْسِيَّةِ', titleEn: 'Three generic uses', group: 'forms', defaultOpen: false }
    ]
  },

  'definite-idafa': {
    essentials: {
      coreRuleAr: 'الْمُضَافُ إِلَى مَعْرِفَةٍ يَكْتَسِبُ مِنْهَا التَّعْرِيفَ.',
      coreRuleEn: 'A noun annexed to a definite noun acquires definiteness from it.',
      definitionAr: 'الْإِضَافَةُ تَرْكِيبٌ مِنْ مُضَافٍ وَمُضَافٍ إِلَيْهِ، وَيَكُونُ الثَّانِي مَجْرُورًا أَوْ فِي مَحَلِّ جَرٍّ.',
      definitionEn: 'Iḍāfah joins a first term to a second term, which is genitive or in a genitive position.',
      effectAr: 'يَصِيرُ الْمُضَافُ مَعْرِفَةً إِذَا كَانَ الْمُضَافُ إِلَيْهِ مَعْرِفَةً.',
      effectEn: 'The first term becomes definite when the second term is definite.',
      recognitionAr: 'عَيِّنِ الْمُضَافَ وَالْمُضَافَ إِلَيْهِ، ثُمَّ بَيِّنْ مَا الَّذِي جَعَلَ الثَّانِي مَعْرِفَةً.',
      recognitionEn: 'Identify both terms, then state what makes the second term definite.',
      exampleId: 'idafa-definite-04',
      cautionsAr: 'الْعِبَارَةُ الْمُفْرَدَةُ تُثْبِتُ الْإِضَافَةَ، وَلَا تُثْبِتُ لِلْمُضَافِ وَظِيفَةً كَالْفَاعِلِ أَوِ الْمَفْعُولِ بِهِ مِنْ غَيْرِ جُمْلَةٍ.',
      cautionsEn: 'A standalone phrase establishes iḍāfah but does not by itself make the first term a subject or object.'
    },
    sections: [
      { id: 'definite-idafa-definition', titleAr: 'التَّعْرِيفُ بِالْإِضَافَةِ', titleEn: 'Definiteness through iḍāfah', group: 'definition', defaultOpen: true },
      { id: 'definite-idafa-definite-types', titleAr: 'أَنْوَاعُ الْمَعَارِفِ فِي الْمُضَافِ إِلَيْهِ', titleEn: 'Definite second-term types', group: 'forms', defaultOpen: false },
      { id: 'definite-idafa-phrase-scope', titleAr: 'حَدُّ مَا تُثْبِتُهُ الْعِبَارَةُ', titleEn: 'What a standalone phrase establishes', group: 'caution', defaultOpen: false }
    ]
  },

  'faail': {
    essentials: {
      coreRuleAr: 'الْفَاعِلُ مَرْفُوعٌ، وَيَأْتِي بَعْدَ فِعْلِهِ أَوْ مَا فِي مَعْنَاهُ.',
      coreRuleEn: 'The fāʿil is nominative and follows its verb or an expression equivalent to a verb.',
      definitionAr: 'الْفَاعِلُ اسْمٌ مَرْفُوعٌ أُسْنِدَ إِلَيْهِ الْفِعْلُ، وَيَكُونُ ظَاهِرًا أَوْ ضَمِيرًا.',
      definitionEn: 'The fāʿil is a nominative noun to which the verb is assigned; it may be overt or pronominal.',
      effectAr: 'يُسْنِدُ الْفِعْلَ إِلَى مَنْ قَامَ بِهِ أَوِ اتَّصَفَ بِهِ، وَيُوجِبُ لِلْفَاعِلِ الرَّفْعَ.',
      effectEn: 'It connects the verb to its grammatical subject and gives that subject rafʿ.',
      recognitionAr: 'ابْحَثْ عَمَّنْ أُسْنِدَ إِلَيْهِ الْفِعْلُ بَعْدَ الْفِعْلِ، وَتَحَقَّقْ مِنْ عَلَامَةِ رَفْعِهِ.',
      recognitionEn: 'Find the noun or pronoun to which the preceding verb is assigned, then check its sign of rafʿ.',
      exampleId: 'faail-01',
      cautionsAr: 'إِذَا تَقَدَّمَ الِاسْمُ عَلَى الْفِعْلِ فَهُوَ مُبْتَدَأٌ، وَلِلْفِعْلِ فَاعِلٌ ضَمِيرٌ. وَالْفِعْلُ الْمُتَقَدِّمُ عَلَى مُثَنًّى أَوْ جَمْعٍ يَبْقَى مُفْرَدًا فِي الْفُصْحَى.',
      cautionsEn: 'If the noun comes before the verb, it is a nominal subject and the verb has a pronoun as fāʿil; a verb preceding a dual or plural fāʿil remains singular in standard usage.'
    },
    sections: [
      { id: 'faail-nominative-overview', titleAr: 'أَقْسَامُ الْمَرْفُوعَاتِ', titleEn: 'The nominative categories', group: 'overview', defaultOpen: true },
      { id: 'faail-definition-and-forms', titleAr: 'تَعْرِيفُ الْفَاعِلِ وَصُوَرُهُ', titleEn: 'Definition and forms of the fāʿil', group: 'definition', defaultOpen: false },
      { id: 'faail-position-and-necessity', titleAr: 'مَوْضِعُ الْفَاعِلِ وَعُمْدِيَّتُهُ', titleEn: 'The fāʿil’s position and necessity', group: 'conditions', defaultOpen: false },
      { id: 'faail-number-agreement', titleAr: 'الْفِعْلُ مَعَ الْمُثَنَّى وَالْجَمْعِ', titleEn: 'Verb agreement with dual and plural subjects', group: 'agreement', defaultOpen: false },
      { id: 'faail-gender-and-order', titleAr: 'التَّأْنِيثُ وَتَرْتِيبُ الْجُمْلَةِ', titleEn: 'Gender agreement and word order', group: 'agreement', defaultOpen: false }
    ]
  },

  'deputy-subject': {
    essentials: {
      coreRuleAr: 'إِذَا حُذِفَ الْفَاعِلُ بُنِيَ الْفِعْلُ لِلْمَجْهُولِ، وَقَامَ نَائِبُ الْفَاعِلِ مَقَامَهُ مَرْفُوعًا.',
      coreRuleEn: 'When the agent is omitted, the verb becomes passive and a nominative deputy subject takes its place.',
      definitionAr: 'نَائِبُ الْفَاعِلِ اسْمٌ مَرْفُوعٌ أُقِيمَ مَقَامَ الْفَاعِلِ الْمَحْذُوفِ.',
      definitionEn: 'The deputy subject is a nominative noun placed in the position of an omitted agent.',
      effectAr: 'يَتَغَيَّرُ بِنَاءُ الْفِعْلِ لِلْمَجْهُولِ، وَيَصِيرُ النَّائِبُ عُمْدَةً مَرْفُوعَةً لَا تَتَقَدَّمُ عَلَى فِعْلِهَا.',
      effectEn: 'The verb takes passive form, and the deputy becomes an indispensable nominative element that does not precede its verb.',
      recognitionAr: 'تَعَرَّفِ الْفِعْلَ الْمَبْنِيَّ لِلْمَجْهُولِ، ثُمَّ عَيِّنِ الِاسْمَ أَوِ الضَّمِيرَ الْمَرْفُوعَ الَّذِي قَامَ مَقَامَ الْفَاعِلِ.',
      recognitionEn: 'Recognize the passive verb, then identify the nominative noun or pronoun that replaces the agent.',
      exampleId: 'naib-01',
      cautionsAr: 'فِي ص ١٠٥ يَرِدُ «تُعُلِّمَ» فِي الْمَتْنِ وَحْدَهُ، وَتَذْكُرُ الْحَاشِيَةُ «الْعِلْمُ»؛ فَيُحْفَظُ الْفَرْقُ بَيْنَ نَصِّ الْمَتْنِ وَإِضَافَةِ الْحَاشِيَةِ.',
      cautionsEn: 'On page 105 the main text prints tuʿullima alone while the footnote supplies al-ʿilmu; preserve that source boundary.'
    },
    sections: [
      { id: 'deputy-subject-definition', titleAr: 'تَعْرِيفُ نَائِبِ الْفَاعِلِ', titleEn: 'Definition of the deputy subject', group: 'definition', defaultOpen: true },
      { id: 'deputy-subject-agreement', titleAr: 'التَّأْنِيثُ وَاتِّفَاقُ الْعَدَدِ', titleEn: 'Gender and number agreement', group: 'agreement', defaultOpen: false },
      { id: 'deputy-subject-passive-patterns', titleAr: 'بِنَاءُ الْمَاضِي وَالْمُضَارِعِ لِلْمَجْهُولِ', titleEn: 'Past and present passive patterns', group: 'forms', defaultOpen: false },
      { id: 'deputy-subject-hollow-verbs', titleAr: 'الْأَجْوَفُ وَالْإِشْمَامُ', titleEn: 'Hollow verbs and ishmām', group: 'variants', defaultOpen: false },
      { id: 'deputy-subject-replacements', titleAr: 'مَا يَنُوبُ عَنِ الْفَاعِلِ', titleEn: 'What can replace the agent', group: 'forms', defaultOpen: false },
      { id: 'deputy-subject-page-105-source-boundary', titleAr: 'تَنْبِيهُ ص ١٠٥: «تُعُلِّمَ»', titleEn: 'Page 105 source boundary: tuʿullima', group: 'caution', defaultOpen: false }
    ]
  },

  'mubtada-khabar': {
    essentials: {
      coreRuleAr: 'الْمُبْتَدَأُ وَالْخَبَرُ مَرْفُوعَانِ، وَبِهِمَا تَتِمُّ فَائِدَةُ الْجُمْلَةِ الِاسْمِيَّةِ.',
      coreRuleEn: 'The mubtadaʾ and khabar are nominative, and together they complete the meaning of the nominal sentence.',
      definitionAr: 'الْمُبْتَدَأُ اسْمٌ مَرْفُوعٌ مُجَرَّدٌ مِنَ الْعَوَامِلِ اللَّفْظِيَّةِ، وَالْخَبَرُ هُوَ الْجُزْءُ الَّذِي تَتِمُّ بِهِ الْفَائِدَةُ مَعَهُ.',
      definitionEn: 'The mubtadaʾ is a nominative noun free of overt verbal governors; the khabar is the part that completes the statement with it.',
      effectAr: 'يُعَيِّنُ الْمُبْتَدَأُ مَا نَتَحَدَّثُ عَنْهُ، وَيُكْمِلُ الْخَبَرُ الْمَعْنَى الَّذِي نُثْبِتُهُ لَهُ.',
      effectEn: 'The mubtadaʾ identifies what is being discussed, and the khabar completes what is stated about it.',
      recognitionAr: 'عَيِّنِ الْمُبْتَدَأَ أَوَّلًا، ثُمَّ اسْأَلْ: أَخَبَرُهُ مُفْرَدٌ، أَمْ جُمْلَةٌ، أَمْ شِبْهُ جُمْلَةٍ؟',
      recognitionEn: 'Find the mubtadaʾ first, then ask whether its khabar is mufrad, a clause, or a shibh jumlah.',
      exampleId: 'mubtada-01',
      cautionsAr: 'الْمُرَادُ بِالْخَبَرِ «الْمُفْرَدِ» هُنَا مَا لَيْسَ جُمْلَةً وَلَا شِبْهَ جُمْلَةٍ، وَلَيْسَ الْمُرَادُ أَنَّهُ وَاحِدٌ فِي الْعَدَدِ.',
      cautionsEn: 'Here a mufrad predicate means one that is not a clause or shibh jumlah; it does not necessarily mean grammatically singular.'
    },
    sections: [
      { id: 'mubtada-khabar-definition', titleAr: 'تَعْرِيفُ الْمُبْتَدَإِ وَصُوَرُهُ', titleEn: 'Definition and forms of the mubtadaʾ', group: 'definition', defaultOpen: true },
      { id: 'mubtada-khabar-descriptive', titleAr: 'الْمُبْتَدَأُ الْوَصْفِيُّ وَمَرْفُوعُهُ', titleEn: 'The descriptive mubtadaʾ and what it raises', group: 'forms', defaultOpen: false },
      { id: 'mubtada-khabar-indefinite', titleAr: 'الِابْتِدَاءُ بِالنَّكِرَةِ وَالْمَصْدَرِ الْمُؤَوَّلِ', titleEn: 'Indefinite and infinitival mubtadaʾ forms', group: 'conditions', defaultOpen: false },
      { id: 'mubtada-khabar-khabar-types', titleAr: 'تَعْرِيفُ الْخَبَرِ وَأَقْسَامُهُ', titleEn: 'Definition and divisions of the khabar', group: 'overview', defaultOpen: false },
      { id: 'mubtada-khabar-clause-predicates', titleAr: 'الْخَبَرُ الْجُمْلَةُ وَرَابِطُهُ', titleEn: 'Clause predicates and their links', group: 'forms', defaultOpen: false },
      { id: 'mubtada-khabar-shibh-jumlah', titleAr: 'شِبْهُ الْجُمْلَةِ وَالْمُتَعَلَّقُ الْمَحْذُوفُ', titleEn: 'Shibh jumlah and its omitted attachment', group: 'forms', defaultOpen: false },
      { id: 'mubtada-khabar-fronting', titleAr: 'تَعَدُّدُ الْخَبَرِ وَتَقْدِيمُهُ', titleEn: 'Multiple predicates and fronting', group: 'order', defaultOpen: false },
      { id: 'mubtada-khabar-deletion', titleAr: 'حَذْفُ الْمُبْتَدَإِ أَوِ الْخَبَرِ', titleEn: 'Deleting the mubtadaʾ or khabar', group: 'deletion', defaultOpen: false }
    ]
  },

  'kana-sisters': {
    essentials: {
      coreRuleAr: 'تَرْفَعُ «كَانَ وَأَخَوَاتُهَا» الِاسْمَ، وَتَنْصِبُ الْخَبَرَ.',
      coreRuleEn: 'Kāna and its sisters raise the ism and make the khabar accusative.',
      definitionAr: 'تَدْخُلُ هَذِهِ الْأَفْعَالُ عَلَى الْجُمْلَةِ الِاسْمِيَّةِ؛ فَيَصِيرُ الْمُبْتَدَأُ اسْمًا لَهَا، وَيَصِيرُ الْخَبَرُ خَبَرًا لَهَا.',
      definitionEn: 'These verbs enter a nominal sentence: its mubtadaʾ becomes their ism, and its khabar becomes their khabar.',
      effectAr: 'اسْمُهَا مَرْفُوعٌ، وَخَبَرُهَا مَنْصُوبٌ. وَقَدْ يَتَقَدَّمُ الْخَبَرُ أَوْ تَأْتِي بَعْضُ هَذِهِ الْأَفْعَالِ تَامَّةً فَيَتَغَيَّرُ التَّحْلِيلُ.',
      effectEn: 'Their ism is nominative and their khabar accusative. The khabar may be fronted, and some of these verbs may be complete, which changes the analysis.',
      recognitionAr: 'ابْحَثْ عَنْ فِعْلٍ مِنْ أَخَوَاتِ «كَانَ»، ثُمَّ عَيِّنِ الِاسْمَ الْمَرْفُوعَ وَالْخَبَرَ الْمَنْصُوبَ. وَتَحَقَّقْ مِنَ الشَّرْطِ مَعَ «زَالَ» وَأَخَوَاتِهَا وَمَعَ «دَامَ».',
      recognitionEn: 'Find a verb from the kāna family, then identify its nominative ism and accusative khabar. Check the required condition with zāla and its group and with dāma.',
      exampleId: 'kana-01',
      cautionsAr: 'لَا تَفْتَرِضْ أَنَّ كُلَّ «كَانَ» نَاقِصَةٌ؛ فَقَدْ تَكُونُ تَامَّةً أَوْ زَائِدَةً، وَقَدْ تُحْذَفُ هِيَ وَاسْمُهَا. وَعِنْدَ حَذْفِ نُونِ الْمُضَارِعِ الْمَجْزُومِ تَبْقَى عَلَامَةُ الْجَزْمِ السُّكُونَ عَلَى النُّونِ الْمَحْذُوفَةِ.',
      cautionsEn: 'Do not assume every kāna is deficient: it may be complete or extra, and it and its ism may be omitted. When the nūn of its jussive present is deleted, the sign remains sukūn on that deleted nūn.'
    },
    sections: [
      { id: 'kana-sisters-nawasikh-overview', titleAr: 'نَوَاسِخُ الِابْتِدَاءِ', titleEn: 'The nāsikhs of the nominal beginning', group: 'overview', defaultOpen: true },
      { id: 'kana-sisters-operation-divisions', titleAr: 'عَمَلُ كَانَ وَأَخَوَاتِهَا وَأَقْسَامُهَا', titleEn: 'Operation and divisions of kāna and its sisters', group: 'definition', defaultOpen: true },
      { id: 'kana-sisters-order', titleAr: 'التَّقْدِيمُ وَالتَّأْخِيرُ', titleEn: 'Fronting and delay', group: 'order', defaultOpen: false },
      { id: 'kana-sisters-other-rulings', titleAr: 'بَعْضُ أَحْكَامِ كَانَ وَأَخَوَاتِهَا', titleEn: 'Further rulings for kāna and its sisters', group: 'forms', defaultOpen: false },
      { id: 'kana-sisters-special-properties', titleAr: 'خَصَائِصُ كَانَ', titleEn: 'Special properties of kāna', group: 'caution', defaultOpen: false }
    ]
  },

  'laysa-like-particles': {
    essentials: {
      coreRuleAr: 'تَرْفَعُ الْحُرُوفُ الْمُشَبَّهَةُ بِـ«لَيْسَ» الِاسْمَ وَتَنْصِبُ الْخَبَرَ إِذَا اسْتَوْفَتْ شُرُوطَهَا.',
      coreRuleEn: 'Particles resembling laysa raise the ism and make the khabar accusative when their conditions are met.',
      definitionAr: 'هِيَ أَرْبَعَةٌ: «مَا»، وَ«لَا»، وَ«إِنْ»، وَ«لَاتَ». وَكُلُّهَا حُرُوفُ نَفْيٍ.',
      definitionEn: 'They are four negative particles: mā, lā, in, and lāta.',
      effectAr: 'يَبْقَى الِاسْمُ مَرْفُوعًا، وَيَصِيرُ الْخَبَرُ مَنْصُوبًا؛ فَإِذَا اخْتَلَّ شَرْطٌ بَطَلَ الْعَمَلُ وَعَادَ التَّرْكِيبُ مُبْتَدَأً وَخَبَرًا.',
      effectEn: 'The ism remains nominative and the khabar becomes accusative. If a condition fails, the operation stops and the construction returns to mubtadaʾ and khabar.',
      recognitionAr: 'عَيِّنْ حَرْفَ النَّفْيِ، ثُمَّ اخْتَبِرِ الشُّرُوطَ، ثُمَّ ابْحَثْ عَنِ الِاسْمِ الْمَرْفُوعِ وَالْخَبَرِ الْمَنْصُوبِ.',
      recognitionEn: 'Identify the negative particle, test its conditions, then locate the nominative ism and accusative khabar.',
      exampleId: 'laysa-like-01',
      cautionsAr: '«لَاتَ» خَاصَّةٌ بِأَلْفَاظِ الزَّمَانِ مَعَ حَذْفِ أَحَدِ الْجُزْأَيْنِ، وَالْغَالِبُ حَذْفُ الِاسْمِ، كَمَا فِي «وَلَاتَ حِينَ مَنَاصٍ».',
      cautionsEn: 'Lāta is restricted to time expressions with one of the two parts omitted; usually the ism is omitted, as in wa-lāta ḥīna manāṣin.'
    },
    sections: [
      { id: 'laysa-like-particles-overview', titleAr: 'الْحُرُوفُ الْأَرْبَعَةُ وَعَمَلُهَا', titleEn: 'The four particles and their operation', group: 'overview', defaultOpen: true },
      { id: 'laysa-like-particles-ma-conditions', titleAr: 'شُرُوطُ عَمَلِ «مَا»', titleEn: 'Conditions for operating mā', group: 'conditions', defaultOpen: true },
      { id: 'laysa-like-particles-la-and-in', titleAr: '«لَا» وَ«إِنْ» الْمُشَبَّهَتَانِ بِـ«لَيْسَ»', titleEn: 'Lā and in resembling laysa', group: 'conditions', defaultOpen: false },
      { id: 'laysa-like-particles-lata', titleAr: '«لَاتَ» وَأَلْفَاظُ الزَّمَانِ', titleEn: 'Lāta and time expressions', group: 'caution', defaultOpen: false }
    ]
  },

  'verbs-of-proximity': {
    essentials: {
      coreRuleAr: 'تَعْمَلُ أَفْعَالُ الْمُقَارَبَةِ عَمَلَ «كَانَ»: تَرْفَعُ الِاسْمَ، وَيَكُونُ خَبَرُهَا فِعْلًا مُضَارِعًا فِي مَحَلِّ نَصْبٍ.',
      coreRuleEn: 'Verbs of proximity operate like kāna: they raise the ism, and their khabar is a present construction in the accusative position.',
      definitionAr: 'تَنْقَسِمُ إِلَى أَفْعَالِ الْمُقَارَبَةِ، وَأَفْعَالِ الرَّجَاءِ، وَأَفْعَالِ الشُّرُوعِ.',
      definitionEn: 'They divide into verbs of proximity, hope, and inception.',
      effectAr: 'تَدُلُّ عَلَى قُرْبِ الْخَبَرِ أَوْ رَجَائِهِ أَوِ الشُّرُوعِ فِيهِ، مَعَ بَقَاءِ الِاسْمِ مَرْفُوعًا وَالْخَبَرِ فِي مَحَلِّ نَصْبٍ.',
      effectEn: 'They express that the event is near, hoped for, or beginning, while the ism is nominative and the khabar occupies the accusative position.',
      recognitionAr: 'حَدِّدِ الْقِسْمَ، ثُمَّ عَيِّنِ الِاسْمَ، ثُمَّ تَحَقَّقْ مِنْ حُكْمِ «أَنْ» مَعَ الْفِعْلِ الْمُضَارِعِ.',
      recognitionEn: 'Identify the division, locate the ism, then check whether an is required, usual, or forbidden before the present khabar.',
      exampleId: 'muqarabah-01',
      cautionsAr: 'يَجِبُ اقْتِرَانُ خَبَرِ «حَرَى» وَ«اخْلَوْلَقَ» بِـ«أَنْ»، وَيَجِبُ تَجَرُّدُ خَبَرِ أَفْعَالِ الشُّرُوعِ مِنْهَا.',
      cautionsEn: 'The khabar of ḥarā and ikhlawlaqa must take an, while the khabar of inception verbs must omit it.'
    },
    sections: [
      { id: 'verbs-of-proximity-three-divisions', titleAr: 'الْأَقْسَامُ الثَّلَاثَةُ', titleEn: 'The three divisions', group: 'overview', defaultOpen: true },
      { id: 'verbs-of-proximity-operation', titleAr: 'الْعَمَلُ وَشَرْطُ الْخَبَرِ', titleEn: 'Operation and the khabar condition', group: 'definition', defaultOpen: true },
      { id: 'verbs-of-proximity-an-rule', titleAr: 'وُجُوبُ «أَنْ» أَوْ مَنْعُهَا', titleEn: 'Where an is required or forbidden', group: 'conditions', defaultOpen: false },
      { id: 'verbs-of-proximity-usual-patterns', titleAr: 'الْأَكْثَرُ فِي بَقِيَّةِ الْأَفْعَالِ', titleEn: 'Usual patterns with the other verbs', group: 'forms', defaultOpen: false }
    ]
  },

  'inna-sisters': {
    essentials: {
      coreRuleAr: 'تَنْصِبُ «إِنَّ وَأَخَوَاتُهَا» الِاسْمَ، وَتَرْفَعُ الْخَبَرَ.',
      coreRuleEn: 'Inna and its sisters make the ism accusative and raise the khabar.',
      definitionAr: 'هِيَ سِتَّةُ أَحْرُفٍ تَدْخُلُ عَلَى الْجُمْلَةِ الِاسْمِيَّةِ: «إِنَّ، أَنَّ، كَأَنَّ، لَكِنَّ، لَيْتَ، لَعَلَّ».',
      definitionEn: 'Six particles enter a nominal sentence: inna, anna, kaʾanna, lakinna, layta, and laʿalla.',
      effectAr: 'يَصِيرُ الْمُبْتَدَأُ اسْمًا مَنْصُوبًا لِلْحَرْفِ، وَيَصِيرُ الْخَبَرُ خَبَرًا مَرْفُوعًا لَهُ.',
      effectEn: 'The former mubtadaʾ becomes the particle’s accusative ism, and the former khabar becomes its nominative khabar.',
      recognitionAr: 'حَدِّدِ الْحَرْفَ وَمَعْنَاهُ، ثُمَّ عَيِّنِ الِاسْمَ الْمَنْصُوبَ وَالْخَبَرَ الْمَرْفُوعَ. وَعِنْدَ «إِنَّ/أَنَّ» تَحَقَّقْ مِنْ مَوْضِعِ الْجُمْلَةِ لِتَعْرِفَ حَرَكَةَ الْهَمْزَةِ.',
      recognitionEn: 'Identify the particle and its meaning, then locate its accusative ism and nominative khabar. With inna/anna, inspect the clause’s position to determine the hamzah vowel.',
      exampleId: 'inna-01',
      cautionsAr: 'يَقِفُ هَذَا الدَّرْسُ عِنْدَ آخِرِ الْحُكْمِ الْمَطْبُوعِ فِي نِطَاقِهِ. وَفِي شَاهِدَيِ الطَّارِقِ ٤ وَهُودٍ ١١١ حُفِظَ وَجْهُ الْقِرَاءَةِ الَّذِي يَشْرَحُهُ الْمَصْدَرُ.',
      cautionsEn: 'This lesson stops at the final rule printed within its range. The Q86:4 and Q11:111 cards preserve the transmitted readings explained by the source.'
    },
    sections: [
      { id: 'inna-sisters-core', titleAr: 'الْحُرُوفُ السِّتَّةُ وَعَمَلُهَا', titleEn: 'The six particles and their operation', group: 'definition', defaultOpen: true },
      { id: 'inna-sisters-order', titleAr: 'تَرْتِيبُ الِاسْمِ وَالْخَبَرِ', titleEn: 'Ordering the ism and khabar', group: 'order', defaultOpen: true },
      { id: 'inna-sisters-kasr', titleAr: 'مَوَاضِعُ كَسْرِ هَمْزَةِ «إِنَّ»', titleEn: 'Where the hamzah of inna takes kasrah', group: 'conditions', defaultOpen: false },
      { id: 'inna-sisters-fath', titleAr: 'مَوَاضِعُ فَتْحِ هَمْزَةِ «أَنَّ»', titleEn: 'Where the hamzah of anna takes fatḥah', group: 'conditions', defaultOpen: false },
      { id: 'inna-sisters-both', titleAr: 'مَوَاضِعُ جَوَازِ الْوَجْهَيْنِ', titleEn: 'Where both vowels are allowed', group: 'conditions', defaultOpen: false },
      { id: 'inna-sisters-lam', titleAr: 'مَوَاضِعُ لَامِ الِابْتِدَاءِ', titleEn: 'Placements of the shifted lām', group: 'forms', defaultOpen: false },
      { id: 'inna-sisters-ma', titleAr: '«مَا» الزَّائِدَةُ وَكَفُّ الْعَمَلِ', titleEn: 'Extra mā and blocked operation', group: 'forms', defaultOpen: false },
      { id: 'inna-sisters-reduction', titleAr: 'تَخْفِيفُ «إِنَّ» وَ«أَنَّ» وَ«كَأَنَّ»', titleEn: 'Reducing inna, anna, and kaʾanna', group: 'caution', defaultOpen: false },
      { id: 'inna-sisters-reduced-lakin', titleAr: 'إِهْمَالُ «لَكِنْ» الْمُخَفَّفَةِ', titleEn: 'The non-operating reduced lākin', group: 'caution', defaultOpen: false }
    ]
  },

  'la-jins': {
    essentials: {
      coreRuleAr: 'تَنْفِي «لَا» حُكْمَ الْخَبَرِ عَنِ الْجِنْسِ كُلِّهِ، وَتَنْصِبُ الِاسْمَ وَتَرْفَعُ الْخَبَرَ.',
      coreRuleEn: 'Categorical lā denies the predicate for the entire class. Its ism is accusative and its khabar nominative.',
      definitionAr: 'فِي «لَا رَجُلَ حَاضِرٌ» يَشْمَلُ النَّفْيُ حُضُورَ كُلِّ رَجُلٍ.',
      definitionEn: 'In lā rajula ḥāḍirun, the negation denies that any man is present.',
      effectAr: 'الْمُضَافُ وَشَبِيهُهُ مُعْرَبَانِ مَنْصُوبَانِ، وَمَا عَدَاهُمَا مَبْنِيٌّ فِي مَحَلِّ نَصْبٍ.',
      effectEn: 'The annexed and annex-like forms take accusative inflection. The remaining forms are built in the accusative position.',
      recognitionAr: 'تَحَقَّقْ مِنْ تَنْكِيرِ الِاسْمِ وَالْخَبَرِ، وَمِنْ مُلَاصَقَةِ الِاسْمِ لِـ«لَا». ثُمَّ عَيِّنْ نَوْعَ الِاسْمِ وَعَلَامَتَهُ.',
      recognitionEn: 'Check that the ism and khabar are indefinite and that the ism immediately follows lā. Then identify the type of ism and its ending.',
      exampleId: 'la-jins-06'
    },
    sections: [
      { id: 'la-jins-conditions', titleAr: 'دَلَالَةُ «لَا» وَشُرُوطُ عَمَلِهَا', titleEn: 'Meaning and conditions', group: 'definition', defaultOpen: true },
      { id: 'la-jins-ism-types', titleAr: 'أَقْسَامُ الِاسْمِ', titleEn: 'Ism types', group: 'forms', defaultOpen: true },
      { id: 'la-jins-building', titleAr: 'عَلَامَاتُ الْبِنَاءِ', titleEn: 'Fixed endings', group: 'forms', defaultOpen: false },
      { id: 'la-jins-repeat', titleAr: 'تَكْرَارُ «لَا»', titleEn: 'When lā repeats', group: 'conditions', defaultOpen: false },
      { id: 'la-jins-coordinate', titleAr: 'الْعَطْفُ بِلَا تَكْرَارٍ', titleEn: 'Coordination without repetition', group: 'conditions', defaultOpen: false },
      { id: 'la-jins-attribute', titleAr: 'أَحْكَامُ النَّعْتِ', titleEn: 'Adjective options', group: 'forms', defaultOpen: false },
      { id: 'la-jins-khabar', titleAr: 'ذِكْرُ الْخَبَرِ وَحَذْفُهُ', titleEn: 'Stated and omitted khabar', group: 'forms', defaultOpen: false },
      { id: 'la-jins-idle', titleAr: 'إِهْمَالُ «لَا»', titleEn: 'When lā does not govern', group: 'caution', defaultOpen: false }
    ]
  }
  ,'zanna-sisters': {
    essentials: {
      coreRuleAr: 'تَنْصِبُ «ظَنَّ وَأَخَوَاتُهَا» جُزْأَيِ الْجُمْلَةِ الِاسْمِيَّةِ مَفْعُولَيْنِ فِي الْمَعَانِي الْمَذْكُورَةِ.',
      coreRuleEn: 'In the senses taught here, ẓanna and its sisters take a mubtadaʾ and khabar as two accusative objects.',
      definitionAr: 'قِسْمَانِ: أَفْعَالُ الْقُلُوبِ وَأَفْعَالُ التَّصْيِيرِ.',
      definitionEn: 'The lesson distinguishes heart verbs from transformation verbs.',
      effectAr: 'يَصِيرُ الْمُبْتَدَأُ مَفْعُولًا أَوَّلَ، وَالْخَبَرُ مَفْعُولًا ثَانِيًا.',
      effectEn: 'The former mubtadaʾ becomes the first object, and the former khabar the second.',
      recognitionAr: 'حَدِّدْ مَعْنَى الْفِعْلِ أَوَّلًا، ثُمَّ انْظُرْ: أَعَمِلَ فِي الْجُزْأَيْنِ، أَمْ أُلْغِيَ، أَمْ عُلِّقَ؟',
      recognitionEn: 'Identify the verb’s meaning first. Then decide whether it operates on both parts, is cancelled, or is suspended.',
      cautionsAr: 'لَا تَحْكُمْ بِعَدَدِ الْمَفْعُولَاتِ مِنْ لَفْظِ الْفِعْلِ وَحْدَهُ؛ فَقَدْ يَتَغَيَّرُ مَعْنَاهُ، أَوْ يَدُلُّ السِّيَاقُ عَلَى مَحْذُوفٍ.',
      cautionsEn: 'Do not count objects from the verb alone. Its meaning may change, or context may supply an omitted object.',
      exampleId: 'zanna-p154-01'
    },
    sections: [
      {id:'zanna-sisters-two-objects',titleAr:'الْعَمَلُ فِي الْمَفْعُولَيْنِ',titleEn:'How the two objects work',group:'definition',defaultOpen:true},
      {id:'zanna-sisters-heart-verb-senses',titleAr:'أَفْعَالُ الْقُلُوبِ وَمَعَانِيهَا',titleEn:'Heart verbs and their meanings',group:'forms',defaultOpen:true},
      {id:'zanna-sisters-transformation',titleAr:'أَفْعَالُ التَّصْيِيرِ',titleEn:'Transformation verbs',group:'forms',defaultOpen:false},
      {id:'zanna-sisters-operation-cancellation',titleAr:'الْإِعْمَالُ وَالْإِلْغَاءُ',titleEn:'Operation and cancellation',group:'order',defaultOpen:false},
      {id:'zanna-sisters-suspension',titleAr:'التَّعْلِيقُ وَأَدَوَاتُهُ',titleEn:'Suspension and its triggers',group:'conditions',defaultOpen:false},
      {id:'zanna-sisters-fixed-and-omitted',titleAr:'الْأَفْعَالُ الْجَامِدَةُ وَحَذْفُ الْمَفْعُولِ',titleEn:'Fixed verbs and omitted objects',group:'conditions',defaultOpen:false},
      {id:'zanna-sisters-samia',titleAr:'وَجْهَا إِعْرَابِ «سَمِعَ»',titleEn:'Two analyses of samiʿa',group:'caution',defaultOpen:false}
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HELP_REDESIGN_BY_CHAPTER;
}

if (typeof window !== 'undefined') {
  window.MIFTAH_HELP_REDESIGN = HELP_REDESIGN_BY_CHAPTER;
}
