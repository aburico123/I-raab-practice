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
  ,'direct-object': {
    essentials: {
      coreRuleAr:'الْمَفْعُولُ بِهِ هُوَ الِاسْمُ الَّذِي يَقَعُ عَلَيْهِ فِعْلُ الْفَاعِلِ.',
      coreRuleEn:'The direct object receives the action of the subject.',
      definitionAr:'يَكُونُ اسْمًا ظَاهِرًا أَوْ ضَمِيرًا مُتَّصِلًا أَوْ مُنْفَصِلًا.',
      definitionEn:'It can be an overt noun, an attached pronoun, or a detached pronoun.',
      effectAr:'يَنْصِبُهُ عَامِلُهُ؛ فَيَكُونُ مَنْصُوبًا أَوْ فِي مَحَلِّ نَصْبٍ.',
      effectEn:'Its governor gives it accusative case or, for a fixed form such as a pronoun, an accusative position.',
      recognitionAr:'اسْأَلْ: عَلَى مَنْ أَوْ عَلَى مَاذَا وَقَعَ الْفِعْلُ؟ وَانْظُرْ إِلَى الْعَامِلِ، مَذْكُورًا كَانَ أَوْ مَحْذُوفًا.',
      recognitionEn:'Ask whom or what the action affects, then identify its stated or omitted governor.',
      cautionsAr:'لَيْسَ كُلُّ مُتَقَدِّمٍ مَنْصُوبًا بِالْفِعْلِ الَّذِي بَعْدَهُ؛ فَفِي الِاشْتِغَالِ يَكُونُ لَهُ عَامِلٌ مَحْذُوفٌ.',
      cautionsEn:'In ishtighāl, the later verb does not itself govern the fronted object. An omitted governor does.',
      exampleId:'mafool-p167-01'
    },
    sections:[
      {id:'direct-object-overview',titleAr:'أَقْسَامُ الْمَنْصُوبَاتِ فِي الْكِتَابِ',titleEn:'The book’s overview of accusatives',group:'overview',defaultOpen:false},
      {id:'direct-object-definition',titleAr:'حَدُّ الْمَفْعُولِ بِهِ وَالِاسْمُ الظَّاهِرُ',titleEn:'The direct object and overt nouns',group:'definition',defaultOpen:true},
      {id:'direct-object-pronouns',titleAr:'الضَّمِيرُ الْمُتَّصِلُ وَالْمُنْفَصِلُ',titleEn:'Attached and detached pronouns',group:'forms',defaultOpen:true},
      {id:'direct-object-order',titleAr:'مَوْضِعُ الْمَفْعُولِ وَتَقْدِيمُهُ',titleEn:'Default order and fronting',group:'order',defaultOpen:false},
      {id:'direct-object-optional',titleAr:'حَذْفُ الْعَامِلِ جَوَازًا',titleEn:'Optional omission of the governor',group:'conditions',defaultOpen:false},
      {id:'direct-object-ishtighal',titleAr:'الِاشْتِغَالُ وَالْعَامِلُ الْمَحْذُوفُ وُجُوبًا',titleEn:'Ishtighāl and obligatory omission',group:'conditions',defaultOpen:false},
      {id:'direct-object-estimates',titleAr:'تَقْدِيرَاتُ الْمُؤَلِّفِ',titleEn:'The author’s reconstructions',group:'caution',defaultOpen:false}
    ]
  }
};

HELP_REDESIGN_BY_CHAPTER.vocative={
 essentials:{
  coreRuleAr:'الْمُنَادَى مَنْصُوبٌ أَوْ مَبْنِيٌّ فِي مَحَلِّ نَصْبٍ؛ وَنَوْعُهُ هُوَ الَّذِي يُحَدِّدُ الْحُكْمَ.',
  coreRuleEn:'The vocative takes accusative case or a fixed ending in an accusative position. Its type determines which.',
  definitionAr:'الْمُنَادَى مَنْ يُطْلَبُ إِقْبَالُهُ بِـ«يَا» أَوْ إِحْدَى أَخَوَاتِهَا.',
  definitionEn:'A vocative names the person or group being called by yā or a sister particle.',
  effectAr:'يُبْنَى الْعَلَمُ غَيْرُ الْمُضَافِ وَلَا الشَّبِيهِ بِهِ، وَالنَّكِرَةُ الْمَقْصُودَةُ، عَلَى مَا يُرْفَعَانِ بِهِ؛ وَتُنْصَبُ الْأَنْوَاعُ الثَّلَاثَةُ الْبَاقِيَةُ.',
  effectEn:'A proper name that is neither annexed nor quasi-annexed, and an intended indefinite, are built on their normal signs of rafʿ. The other three types take accusative case.',
  recognitionAr:'مَنْ قَصَدَ الْمُتَكَلِّمُ بِالنِّدَاءِ؟ وَهَلْ بَعْدَ الِاسْمِ مُضَافٌ إِلَيْهِ أَوْ مَعْمُولٌ يُتِمُّ مَعْنَاهُ؟',
  recognitionEn:'Who is being called? Is the noun followed by a genitive annex or another element that completes its meaning?',
  cautionsAr:'الضَّمُّ فِي «يَا رَجُلُ» بِنَاءٌ، لَا رَفْعٌ. وَضَمَّةُ «يَا أُمُّ» لَا تَمْنَعُ تَقْدِيرَ الْإِضَافَةِ إِلَى يَاءِ الْمُتَكَلِّمِ.',
  cautionsEn:'The ḍamm of yā rajulu is a fixed ending, not nominative case. The audible ḍammah of yā ummu does not remove its understood first-person annexation.',
  exampleId:'voc-p171-01'
 },
 sections:[
  {id:'vocative-relationship',titleAr:'مَوْضِعُ النِّدَاءِ فِي بَابِ الْمَفْعُولِ بِهِ',titleEn:'Why the book puts this under the direct object',group:'overview',defaultOpen:false},
  {id:'vocative-fixed',titleAr:'نَوْعَانِ مَبْنِيَّانِ فِي مَحَلِّ نَصْبٍ',titleEn:'Two fixed types in the accusative position',group:'forms',defaultOpen:true},
  {id:'vocative-accusative',titleAr:'ثَلَاثَةُ أَنْوَاعٍ مَنْصُوبَةٍ إِعْرَابًا',titleEn:'Three types that take accusative case',group:'forms',defaultOpen:true},
  {id:'vocative-ya-forms',titleAr:'صُوَرُ الْإِضَافَةِ إِلَى يَاءِ الْمُتَكَلِّمِ',titleEn:'Six first-person forms',group:'forms',defaultOpen:false},
  {id:'vocative-estimated-ending',titleAr:'مَتَى تُقَدَّرُ الْفَتْحَةُ؟',titleEn:'When is fatḥah estimated?',group:'caution',defaultOpen:false},
  {id:'vocative-parents',titleAr:'صُوَرٌ زَائِدَةٌ لِنِدَاءِ الْأَبِ وَالْأُمِّ',titleEn:'Additional forms for father and mother',group:'forms',defaultOpen:false},
  {id:'vocative-mediated',titleAr:'الْإِضَافَةُ غَيْرُ الْمُبَاشِرَةِ وَاسْتِثْنَاؤُهَا',titleEn:'Indirect annexation and its exceptions',group:'conditions',defaultOpen:false},
  {id:'vocative-poetry',titleAr:'شَاهِدَا الشِّعْرِ وَالتَّقْدِيرُ',titleEn:'Two lines of poetry and an estimate',group:'source',defaultOpen:false}
 ]
};

HELP_REDESIGN_BY_CHAPTER['absolute-object']={
 essentials:{coreRuleAr:'الْمَفْعُولُ الْمُطْلَقُ يُؤَكِّدُ الْحَدَثَ أَوْ يُبَيِّنُ نَوْعَهُ أَوْ عَدَدَهُ.',coreRuleEn:'The absolute object emphasizes an event or specifies its type or count.',definitionAr:'مَصْدَرٌ فَضْلَةٌ أَوْ مَا يَنُوبُ عَنْهُ.',definitionEn:'A non-core verbal noun or an expression that stands in for it.',effectAr:'يَنْصِبُهُ عَامِلُهُ، فَيَدُلُّ عَلَى حَدَثِهِ أَوْ مَا يَخُصُّ ذَلِكَ الْحَدَثَ.',effectEn:'Its governor gives it accusative case. It tells you about the action itself.',recognitionAr:'اسْأَلْ: هَلْ أَكَّدَ الْحَدَثَ، أَمْ بَيَّنَ كَيْفَ وَقَعَ، أَمْ كَمْ مَرَّةً وَقَعَ؟',recognitionEn:'Ask whether it reinforces the event, tells how it happened, or counts the occurrences.',exampleId:'abs-p179-01'},
 sections:[['definition','الْحَدُّ وَالْفَضْلَةُ','Definition and non-core status',true],['functions','التَّوْكِيدُ وَالنَّوْعُ وَالْعَدَدُ','Emphasis, kind and count',true],['matches','اللَّفْظِيُّ وَالْمَعْنَوِيُّ','Lexical and semantic match'],['masdar','الْمَصْدَرُ وَاسْمُ الْمَصْدَرِ','Maṣdar and ism maṣdar'],['substitutes','كُلٌّ وَبَعْضٌ وَالْعَدَدُ','Kull, baʿḍ and number'],['instrument','الْآلَةُ الْمَعْهُودَةُ','Recognized instruments']].map(([key,titleAr,titleEn,expanded])=>({id:'absolute-'+key,titleAr,titleEn,group:'rule',defaultOpen:Boolean(expanded)}))
};
HELP_REDESIGN_BY_CHAPTER['adverbial-object']={
 essentials:{coreRuleAr:'الظَّرْفُ يَدُلُّ عَلَى زَمَانِ الْحَدَثِ أَوْ مَكَانِهِ بِمَعْنَى «فِي».',coreRuleEn:'A ẓarf locates the event in time or place, with fī understood.',definitionAr:'ظَرْفُ زَمَانٍ أَوْ ظَرْفُ مَكَانٍ، وَيُسَمَّى الْمَفْعُولَ فِيهِ.',definitionEn:'An accusative adverbial of time or place, called the adverbial object.',effectAr:'يَنْصِبُ الْعَامِلُ الظَّرْفَ؛ فَإِنْ ظَهَرَ حَرْفُ الْجَرِّ جَرَّ الِاسْمَ.',effectEn:'The governor gives the adverbial accusative case. An overt preposition instead governs its noun in the genitive.',recognitionAr:'اسْأَلْ: مَتَى، أَوْ كَمْ مِنَ الزَّمَانِ، أَوْ فِي أَيِّ مَكَانٍ وَقَعَ الْحَدَثُ؟',recognitionEn:'Ask when, for how long, or where the event occurred.',exampleId:'adv-p185-01'},
 sections:[['definition','الظَّرْفُ وَمَعْنَى «فِي»','What the adverbial means',true],['other-roles','أَسْمَاءُ الزَّمَانِ فِي غَيْرِ الظَّرْفِيَّةِ','Time words in other roles'],['vocabulary','أَلْفَاظُ الزَّمَانِ وَالْمَكَانِ','The book’s time and place terms'],['time','الْمُخْتَصُّ وَالْمَعْدُودُ وَالْمُبْهَمُ','Three kinds of time',true],['place','مَا يَنْتَصِبُ مِنْ أَسْمَاءِ الْمَكَانِ','Three eligible place classes'],['derived','الْمُشْتَقُّ مِنْ مَصْدَرِ عَامِلِهِ','Place nouns derived from their governor'],['exceptions','الْمَكَانُ الْمُخْتَصُّ وَإِسْقَاطُ الْخَافِضِ','Specified places and omitted preposition']].map(([key,titleAr,titleEn,expanded])=>({id:'adverbial-'+key,titleAr,titleEn,group:'rule',defaultOpen:Boolean(expanded)}))
};

const stage188Summary=(chapter,values,sections)=>{
 const [coreRuleAr,coreRuleEn,definitionAr,definitionEn,effectAr,effectEn,recognitionAr,recognitionEn,exampleId]=values;
 HELP_REDESIGN_BY_CHAPTER[chapter]={essentials:{coreRuleAr,coreRuleEn,definitionAr,definitionEn,effectAr,effectEn,recognitionAr,recognitionEn,exampleId},
  sections:sections.map(([key,titleAr,titleEn,defaultOpen])=>({id:chapter+'-'+key,titleAr,titleEn,group:'rule',defaultOpen:Boolean(defaultOpen)}))};
};
stage188Summary('purpose-object',[
 'الْمَفْعُولُ لِأَجْلِهِ يُبَيِّنُ سَبَبَ الْفِعْلِ.','The purpose object tells why the action happens.',
 'مَصْدَرٌ مَنْصُوبٌ يَدُلُّ عَلَى السَّبَبِ أَوِ الْغَرَضِ.','An accusative verbal noun giving a cause or purpose.',
 'يَنْصِبُ الْعَامِلُ الْمَصْدَرَ إِذَا تَحَقَّقَتِ الشُّرُوطُ الَّتِي يَذْكُرُهَا الْمَتْنُ.','The governor gives the verbal noun accusative case if the book’s conditions are met.',
 'اسْأَلْ: لِمَ وَقَعَ الْفِعْلُ؟ وَهَلِ اتَّحَدَ الزَّمَنُ وَالْفَاعِلُ؟','Ask why it happened and whether the time and agent match.','purpose-p188-01'
],[
 ['definition','التَّعْرِيفُ وَالْأَسْمَاءُ','Definition and names',true],
 ['conditions','شُرُوطُ النَّصْبِ','Conditions for the accusative',true],
 ['contrast','مَتَى نَذْكُرُ اللَّامَ؟','When to use lām'],
 ['editorial','خِلَافٌ فِي الْحَاشِيَةِ','An editorial note on disagreement']
]);
stage188Summary('accompaniment-object',[
 'وَاوُ الْمَعِيَّةِ بِمَعْنَى «مَعَ» لَا بِمَعْنَى الْعَطْفِ.','The wāw of accompaniment means “with,” not “and.”',
 'اسْمٌ مَنْصُوبٌ بَعْدَ وَاوِ الْمَعِيَّةِ.','An accusative noun after the wāw of accompaniment.',
 'يَنْصِبُهُ الْفِعْلُ أَوْ مَا فِيهِ مَعْنَاهُ وَحُرُوفُهُ فِي الْجُمْلَةِ السَّابِقَةِ.','The preceding verb or its equivalent governs the accusative.',
 'اسْأَلْ: هَلْ وَقَعَ الْفِعْلُ مِنَ الِاسْمَيْنِ، أَمْ صَاحَبَ الثَّانِي الْحَدَثَ؟','Ask whether both took part in the action or the second only accompanied it.','accompaniment-p190-02'
],[
 ['definition','الْوَاوُ وَالْعَامِلُ','Wāw and its preceding governor',true],
 ['required','وُجُوبُ النَّصْبِ','When accompaniment is required',true],
 ['preference','تَرَجُّحُ النَّصْبِ أَوِ الْعَطْفِ','When accompaniment or coordination is preferred']
]);
stage188Summary('object-like-complement',[
 'تَنْصِبُ الصِّفَةُ الْمُشَبَّهَةُ اسْمًا عَلَى التَّشْبِيهِ بِالْمَفْعُولِ بِهِ.','The ṣifah mushabbahah can govern an accusative complement resembling a direct object.',
 'مَعْمُولُ صِفَةٍ لَا مَفْعُولٌ بِهِ حَقِيقِيٌّ.','An adjectival complement, not a true direct object.',
 'فِي هَذَا الْوَجْهِ «وَجْهَ» مَنْصُوبٌ بِالصِّفَةِ «حَسَنٌ».','In this construction, the adjective ḥasan governs accusative wajha.',
 'انْظُرْ إِلَى عَامِلِهِ: أَهُوَ صِفَةٌ مُشَبَّهَةٌ؟','Identify the governor: is it a ṣifah mushabbahah?','object-like-p192-01'
],[['construction','مِثَالُ النَّصْبِ فِي الْمَتْنِ','The book’s accusative example',true]]);
stage188Summary('circumstantial-state',[
 'الْحَالُ يُبَيِّنُ هَيْئَةَ صَاحِبِهِ وَقْتَ الْفِعْلِ.','A ḥāl describes its owner’s state when the action takes place.',
 'اسْمٌ مَنْصُوبٌ، وَقَدْ يَكُونُ شِبْهَ جُمْلَةٍ بِمُتَعَلَّقٍ مَحْذُوفٍ أَوْ جُمْلَةً فِي مَحَلِّ نَصْبٍ.','An accusative noun, a phrase attached to an omitted ḥāl, or a clause in accusative position.',
 'يَصِفُ الْفَاعِلَ أَوِ الْمَفْعُولَ بِهِ أَوْ كِلَيْهِمَا فِي أَمْثِلَةِ الْمَتْنِ.','The book illustrates the subject, the object, and both as possible owners.',
 'اسْأَلْ: عَلَى أَيِّ هَيْئَةٍ وَقَعَ الْفِعْلُ؟ وَمَنِ الَّذِي وُصِفَ؟','Ask in what state the action took place and who is being described.','hal-p194-01'
],[
 ['owner','الْحَالُ وَصَاحِبُهَا','The state and its owner',true],
 ['conditions','شُرُوطُ الْحَالِ','What can serve as a ḥāl?',true],
 ['underived','شَوَاهِدُ الْحَالِ الْجَامِدَةِ','Underived states in the editor’s note'],
 ['indefinite','تَنْكِيرُ صَاحِبِ الْحَالِ','When the owner is indefinite'],
 ['reading','شَاهِدُ ابْنِ أَبِي عَبْلَةَ','The Ibn Abī ʿAblah witness'],
 ['phrases','الظَّرْفُ وَالْجَارُّ وَالْمَجْرُورُ','Adverbs and prepositional phrases'],
 ['clause','رَابِطُ جُمْلَةِ الْحَالِ','What links a ḥāl clause?'],
 ['appendix','فَائِدَةُ الصَّبَّانِ وَقَيْدُهَا','Al-Ṣabbān’s note and its qualification']
]);

const finalManSummary=(chapter,values,sections)=>{
 const [coreRuleAr,coreRuleEn,definitionAr,definitionEn,effectAr,effectEn,recognitionAr,recognitionEn,exampleId]=values;
 HELP_REDESIGN_BY_CHAPTER[chapter]={essentials:{coreRuleAr,coreRuleEn,definitionAr,definitionEn,effectAr,effectEn,recognitionAr,recognitionEn,exampleId},
  sections:sections.map(([key,titleAr,titleEn,defaultOpen])=>({id:chapter+'-'+key,titleAr,titleEn,group:'rule',defaultOpen:Boolean(defaultOpen)}))};
};
finalManSummary('tamyiz',[
 'التَّمْيِيزُ يُزِيلُ إِبْهَامًا فِي ذَاتٍ أَوْ نِسْبَةٍ.','A tamyīz clarifies an ambiguous entity or relation.',
 'اسْمٌ مَنْصُوبٌ، نَكِرَةٌ عَلَى قَاعِدَةِ الْمَتْنِ.','An accusative noun, indefinite under the rule given in the main text.',
 'يُبَيِّنُ الْمَعْدُودَ وَنَحْوَهُ، أَوْ يَكْشِفُ جِهَةَ الْإِسْنَادِ.','It specifies what is counted or measured, or clarifies an entire predication.',
 'اسْأَلْ: أَيُّ شَيْءٍ يُرَادُ بِهَذَا الْعَدَدِ؟ أَوْ مِنْ أَيِّ جِهَةٍ صَحَّ هَذَا الْإِسْنَادُ؟','Ask what is being counted, or in what respect the statement is true.','tamyiz-p198-01'
],[
 ['definition','الذَّاتُ وَالنِّسْبَةُ','Entity and relation',true],
 ['entity','أَنْوَاعُ الذَّاتِ الْأَرْبَعَةُ','Four entity types',true],
 ['relation','أَنْوَاعُ تَمْيِيزِ النِّسْبَةِ','Four relation categories'],
 ['indefinite','التَّنْكِيرُ وَالْخِلَافُ','Indefiniteness and the editorial contrast'],
 ['order','تَمَامُ الْكَلَامِ وَمَوْضِعُ التَّمْيِيزِ','Completed predication, governor and order']
]);
finalManSummary('exception',[
 'يَخْرُجُ الْمُسْتَثْنَى مِنْ حُكْمِ مَا قَبْلَهُ، وَيَخْتَلِفُ إِعْرَابُهُ بِاخْتِلَافِ التَّرْكِيبِ.','An exception falls outside the preceding statement’s ruling; its case depends on the construction.',
 'اسْمٌ يَأْتِي بَعْدَ «إِلَّا» أَوْ مَا يَقُومُ مَقَامَهَا.','A noun after illā or another tool of exception.',
 'قَدْ يُنْصَبُ، أَوْ يَتْبَعُ مَا قَبْلَهُ، أَوْ يُعْرَبُ بِحَسَبِ الْعَامِلِ.','The form may be accusative, follow another noun, or take the case its governor assigns.',
 'بَعْدَ تَعْيِينِ الْأَدَاةِ انْظُرْ: أَذُكِرَ الْمُسْتَثْنَى مِنْهُ؟ أَمُوجَبٌ هُوَ؟ أَمُتَّصِلٌ أَمْ مُنْقَطِعٌ؟','Identify the tool, then ask whether the excluded-from set is stated, whether the clause is affirmative, and whether the exception belongs to that set.','except-p204-02'
],[
 ['tools','أَدَوَاتُ الِاسْتِثْنَاءِ الثَّمَانِي','The eight tools',true],
 ['affirmative','التَّامُّ الْمُوجَبُ','Complete affirmative',true],
 ['connected','التَّامُّ غَيْرُ الْمُوجَبِ الْمُتَّصِلُ','Complete non-affirmative connected'],
 ['disconnected','التَّامُّ غَيْرُ الْمُوجَبِ الْمُنْقَطِعُ','Complete non-affirmative disconnected'],
 ['deficient','النَّاقِصُ الْمُفَرَّغُ','Deficient exception'],
 ['nouns','غَيْرٌ وَسِوَى','Ghayr and siwā'],
 ['laysa','لَيْسَ وَلَا يَكُونُ','Laysa and lā yakūnu'],
 ['three','خَلَا، عَدَا، حَاشَا','Khalā, ʿadā, ḥāshā'],
 ['closure','إِحَالَاتُ الْخِتَامِ، ص ٢١١','Closing references, p.211']
]);

finalManSummary('genitive-by-particle',[
 'حَرْفُ الْجَرِّ يَجُرُّ مَا بَعْدَهُ؛ وَتَخْتَلِفُ الْحُرُوفُ فِيمَا تَقْبَلُهُ.','A preposition governs the genitive; prepositions differ in what they can take.',
 'الْمَخْفُوضُ بِالْحَرْفِ اسْمٌ ظَاهِرٌ أَوْ ضَمِيرٌ فِي مَحَلِّ جَرٍّ.','The complement is an overt noun or a pronoun in a genitive slot.',
 'تَجُرُّ السَّبْعَةُ الْأُولَى الظَّاهِرَ وَالْمُضْمَرَ.','The first seven govern both overt nouns and pronouns.',
 'عَيِّنِ الْحَرْفَ، ثُمَّ مَا يَجُرُّهُ، ثُمَّ عَلَامَةَ الْجَرِّ أَوْ مَحَلَّهُ.','Find the preposition, its complement, and the sign or syntactic position.','gen-p212-01'
],[
 ['overview','أَقْسَامُ الْمَخْفُوضَاتِ','The three genitive categories',true],
 ['first','السَّبْعَةُ الْأُولَى','The first seven',true],
 ['last','السَّبْعَةُ الْأَخِيرَةُ','The last seven'],
 ['oath','حُرُوفُ الْقَسَمِ هُنَا','Oath prepositions here'],
 ['time','مُذْ وَمُنْذُ','Time: mudh and mundhu'],
 ['rubba','رُبَّ وَمَا تَجُرُّهُ','Rubba and its complements'],
 ['omission','حَذْفُ رُبَّ مَعَ بَقَاءِ عَمَلِهَا','Omitted rubba and retained government']
]);
finalManSummary('imperfect-jawazim',[
 'تَجْزِمُ هَذِهِ الْأَدَوَاتُ فِعْلًا مُضَارِعًا وَاحِدًا.','These governors make one imperfect verb jussive.',
 'هَذِهِ شُعْبَةُ الْفِعْلِ الْوَاحِدِ فِي جَوَازِمِ الْمُضَارِعِ.','This is the one-verb branch of the imperfect’s jussive governors.',
 'يَظْهَرُ أَثَرُ الْجَزْمِ فِي آخِرِ الْفِعْلِ، مِثْلَ السُّكُونِ أَوْ حَذْفِ حَرْفِ الْعِلَّةِ.','Look for the mood sign at the verb’s end, such as sukūn or deletion of a weak letter.',
 'فَرِّقْ بَيْنَ الْأَدَاةِ وَالْفِعْلِ، وَتَحَقَّقْ مِنْ قَصْدِ الْجَزَاءِ فِي جَوَابِ الطَّلَبِ.','Identify the governor and the verb; for a request, check that the response is meant as its consequence.','jaw-p239-02'
],[
 ['overview','الْعَدَدُ وَالسَّبْعَةُ الْأُولَى','The counts and the first seven',true],
 ['negative','لَمْ وَلَمَّا وَهَمْزَةُ الِاسْتِفْهَامِ','Lam, lammā, and interrogative hamzah',true],
 ['lam','لَامُ الْأَمْرِ وَالدُّعَاءِ','Command and invocation lām'],
 ['la','لَا فِي النَّهْيِ وَالدُّعَاءِ','Prohibitive and supplicatory lā'],
 ['request','جَوَابُ الطَّلَبِ','The response to a request']
]);

finalManSummary('added-ma',[
 'لَا تَكُفُّ «مَا» «مِنْ» وَ«عَنْ» وَالْبَاءَ، وَقَدْ تَكُفُّ الْكَافَ وَ«رُبَّ».','Extra mā does not block min, ʿan or bāʾ, but can block kāf or rubba.',
 'زِيَادَةُ «مَا» بَعْدَ حَرْفِ جَرٍّ.','Extra mā following a preposition.',
 'قَدْ يَبْقَى الْجَرُّ، وَقَدْ يَصِيرُ مَا بَعْدَهَا جُمْلَةً.','Genitive government may remain; if blocked, a clause can follow.',
 'انْظُرْ إِلَى مَا بَعْدَ «مَا»: أَهُوَ اسْمٌ مَجْرُورٌ أَمْ جُمْلَةٌ؟','Check whether a governed noun or a whole clause follows.','added-ma-p220-01'
],[
 ['keeps','مِنْ وَعَنْ وَالْبَاءُ','Min, ʿan and bāʾ',true],
 ['blocks','الْكَافُ وَرُبَّ حِينَ تُكَفَّانِ','Blocked kāf and rubba'],
 ['retains','الْكَافُ وَرُبَّ حِينَ تَعْمَلَانِ','Retained government']
]);
finalManSummary('genitive-by-annexation',[
 'الْمُضَافُ إِلَيْهِ مَجْرُورٌ، وَيَعْمَلُ فِيهِ الْمُضَافُ عَلَى اخْتِيَارِ الْمُؤَلِّفِ.','The second term is genitive, governed by the first noun in the author’s analysis.',
 'إِسْنَادُ اسْمٍ إِلَى اسْمٍ، مِثْلُ «غُلَامُ زَيْدٍ».','A relation between two nouns, as in “Zayd’s servant.”',
 'يُحْذَفُ تَنْوِينُ الْأَوَّلِ أَوْ نُونُهُ، وَيُجَرُّ الثَّانِي.','The first loses tanwīn or inflectional nūn; the second is genitive.',
 'فَرِّقْ بَيْنَ مَعْنَى الْعَلَاقَةِ وَفَائِدَةِ الْإِضَافَةِ.','Distinguish the semantic relation from the effect of the construction.','idafa-p223-01'
],[
 ['form','صُورَةُ الْمُضَافِ وَالْمُضَافِ إِلَيْهِ','Form of the two terms',true],
 ['sense','أَقْسَامُ الْإِضَافَةِ مِنْ حَيْثُ تَقْدِيرُ حَرْفِ الْجَرِّ','Underlying lām, min and fī'],
 ['verbal','أَنْوَاعُ الْإِضَافَةِ مِنْ حَيْثُ الْفَائِدَةِ: اللَّفْظِيَّةُ','Effect: verbal annexation'],
 ['semantic','الْإِضَافَةُ الْمَعْنَوِيَّةُ','Effect: semantic annexation'],
 ['forward','إِحَالَةُ التَّابِعِ لِلْمَخْفُوضِ','Forward reference to dependents']
]);
finalManSummary('verb-inflection-intro',[
 'الْأَصْلُ فِي الْمُضَارِعِ الْمُعْرَبِ الرَّفْعُ.','The inflected imperfect is indicative by default.',
 'لِلْمُضَارِعِ الْمُعْرَبِ ثَلَاثَةُ أَحْوَالٍ.','The inflected imperfect has three moods.',
 'يَنْقُلُهُ النَّاصِبُ إِلَى النَّصْبِ وَالْجَازِمُ إِلَى الْجَزْمِ.','A subjunctive or jussive governor changes its mood.',
 'فَرِّقْ بَيْنَ الْفِعْلِ الْمَبْنِيِّ وَالْمُعْرَبِ، ثُمَّ ابْحَثْ عَنِ الْعَامِلِ.','First identify fixed versus inflected form, then look for a governor.','verb-intro-p227-01'
],[
 ['classes','أَقْسَامُ الْفِعْلِ وَالْبِنَاءُ','Verb categories and fixed forms',true],
 ['moods','أَحْوَالُ الْمُضَارِعِ','Moods of the imperfect']
]);
finalManSummary('imperfect-nawasib',[
 'يُنْصَبُ الْمُضَارِعُ بِنَاصِبٍ مُبَاشِرٍ أَوْ بِـ«أَنْ» مُضْمَرَةٍ.','A direct governor or omitted an makes the imperfect subjunctive.',
 'النَّوَاصِبُ أَدَوَاتٌ أَوْ تَرَاكِيبُ تُفْضِي إِلَى نَصْبِ الْمُضَارِعِ.','Subjunctive governors are particles or constructions that give the imperfect naṣb.',
 'الْفَتْحَةُ أَوْ حَذْفُ النُّونِ فِي الْأَفْعَالِ الْخَمْسَةِ.','The sign is fatḥah or deletion of nūn in the five verb forms.',
 'حَدِّدِ النَّاصِبَ: أَهُوَ مَذْكُورٌ، أَمْ «أَنْ» مُضْمَرَةٌ جَوَازًا أَوْ وُجُوبًا؟','Ask whether the governor is overt, or whether an is optionally or necessarily omitted.','naw-p228-01'
],[
 ['overview','الْقِسْمَانِ','Two types of governor',true],
 ['an','أَنْ بَعْدَ الْعِلْمِ وَالظَّنِّ وَغَيْرِهِمَا','An after certainty, supposition or neither',true],
 ['lan-kay','لَنْ وَكَيْ','Lan and kay'],
 ['idhan','شُرُوطُ عَمَلِ إِذَنْ','Conditions for idhan'],
 ['optional','إِضْمَارُ أَنْ جَوَازًا','Optional omission of an'],
 ['required','إِضْمَارُ أَنْ وُجُوبًا','Obligatory omission of an'],
 ['response','فَاءُ السَّبَبِيَّةِ وَوَاوُ الْمَعِيَّةِ','Causal fāʾ and accompaniment wāw']
]);

finalManSummary('two-verb-jawazim',[
 'تَجْزِمُ الْأَدَاةُ فِعْلَ الشَّرْطِ وَفِعْلَ الْجَوَابِ.','The governor gives jussive force to the condition and answer.',
 'الْأَوَّلُ شَرْطٌ، وَالثَّانِي جَوَابٌ أَوْ جَزَاءٌ.','The first verb is the condition; the second is the answer or consequence.',
 'فَرِّقْ بَيْنَ عَلَامَةِ جَزْمِ الْمُضَارِعِ وَمَحَلِّ الْفِعْلِ الْمَبْنِيِّ أَوِ الْجُمْلَةِ الْمَرْبُوطَةِ.','Distinguish the imperfect’s jussive ending from the syntactic position of a fixed verb or linked clause.',
 'حَدِّدِ الْأَدَاةَ، ثُمَّ الشَّرْطَ، ثُمَّ الْجَوَابَ وَرَابِطَهُ إِنْ وُجِدَ.','Find the governor, the condition, then the answer and its link if present.','jaw-two-p243-01'
],[
 ['governors','الْأَدَوَاتُ وَعَمَلُهَا','The eleven and their operation',true],
 ['meanings','الْحُرُوفُ وَالْأَسْمَاءُ وَمَعَانِيهَا','Particles, nouns and meanings'],
 ['linked','اقْتِرَانُ جَوَابِ الشَّرْطِ بِالْفَاءِ، أَوْ بِإِذَا الْفُجَائِيَّةِ','Answers linked by fāʾ or sudden idhā',true],
 ['unusual','كَيْفَمَا وَإِذَا فِي الشِّعْرِ','Kayfamā and poetic idhā']
]);
finalManSummary('adjective-naat',[
 'يَتْبَعُ النَّعْتُ مَنْعُوتَهُ فِي الْإِعْرَابِ وَالتَّعْرِيفِ وَالتَّنْكِيرِ.','The adjective agrees with its head in case and definiteness.',
 'تَابِعٌ مُشْتَقٌّ أَوْ مَا يُؤَوَّلُ بِهِ، يُخَالِفُ مَتْبُوعَهُ فِي اللَّفْظِ.','A dependent expression, derived or interpretable as derived, and distinct in wording from its head.',
 'الْحَقِيقِيُّ يُطَابِقُ مَنْعُوتَهُ فِي الْجِنْسِ وَالْعَدَدِ أَيْضًا، وَالسَّبَبِيُّ يُرَاعِي جِنْسَ فَاعِلِهِ.','A direct adjective also follows its head in gender and number; a causal adjective takes its own subject’s gender.',
 'ابْحَثْ عَنِ الْمَنْعُوتِ لِلْإِعْرَابِ، وَعَنْ فَاعِلِ النَّعْتِ لِلْجِنْسِ.','Find the head for case, and the adjective’s subject for gender.','naat-p257-01'
],[
 ['definition','تَعْرِيفُ النَّعْتِ وَالْمُشْتَقُّ','Definition and derived forms',true],
 ['equivalents','مَا يُؤَوَّلُ بِالْمُشْتَقِّ','What can act like a derived adjective'],
 ['direct','النَّعْتُ الْحَقِيقِيُّ','The direct adjective',true],
 ['causal','النَّعْتُ السَّبَبِيُّ','The causal adjective'],
 ['purposes','أَغْرَاضُ النَّعْتِ وَفَوَائِدُهُ','Purposes of the adjective'],
 ['cut','جَوَازُ إِتْبَاعِ النَّعْتِ وَقَطْعِهِ','Agreement and cutting off'],
 ['multiple','تَعَدُّدُ النُّعُوتِ','Several adjectives for one noun']
]);

finalManSummary('atf-bayan',[
 'عَطْفُ الْبَيَانِ يُوَضِّحُ مَعْرِفَةً أَوْ يُخَصِّصُ نَكِرَةً.','Clarifying apposition identifies a definite or narrows an indefinite.',
 'تَابِعٌ جَامِدٌ يُوَضِّحُ مَتْبُوعَهُ بِغَيْرِ حَرْفِ عَطْفٍ.','A non-derived dependent that clarifies its head without a coordinator.',
 'يُوَافِقُ مَتْبُوعَهُ فِي الْإِعْرَابِ وَالْجِنْسِ وَالتَّعْرِيفِ وَالْعَدَدِ.','It agrees with the head in case, gender, definiteness and number.',
 'ابْحَثْ عَنِ الِاسْمِ الثَّانِي الَّذِي يُبَيِّنُ الْأَوَّلَ دُونَ حَرْفٍ.','Look for a second noun that makes the first more precise without a conjunction.','bayan-p263-01'
],[
 ['purpose','التَّوْضِيحُ وَالتَّخْصِيصُ','Clarifying or narrowing',true],
 ['agreement','الْمُطَابَقَةُ','Agreement'],
 ['alternate','مَتَى يَجُوزُ وَجْهُ الْبَدَلِ؟','When is a badal analysis possible?']
]);
finalManSummary('atf-nasaq',[
 'الْمَعْطُوفُ يَتْبَعُ مَا قَبْلَهُ فِي الْإِعْرَابِ.','A coordinated word follows its head in inflection.',
 'تَابِعٌ بَيْنَهُ وَبَيْنَ مَتْبُوعِهِ حَرْفُ عَطْفٍ.','A dependent linked to its head by a coordinator.',
 'يَتْبَعُهُ فِي الرَّفْعِ وَالنَّصْبِ وَالْجَرِّ أَوِ الْجَزْمِ.','It shares the nominative, accusative, genitive or jussive.',
 'عَيِّنِ الْحَرْفَ وَالْمَعْطُوفَ عَلَيْهِ، ثُمَّ انْظُرْ إِلَى الْعَلَامَةِ وَمَعْنَى الْحَرْفِ.','Find the coordinator and first term, then check the ending and the coordinator’s meaning.','nasaq-p265-01'
],[
 ['inventory','الْحُرُوفُ الْعَشَرَةُ','The ten listed coordinators',true],
 ['rulings','أَوْجُهُ الْإِعْرَابِ الْأَرْبَعَةُ','The four inflection patterns',true],
 ['sequence','الْوَاوُ وَالْفَاءُ وَثُمَّ وَحَتَّى','Wāw, fāʾ, thumma and ḥattā'],
 ['options','أَمْ وَأَوْ','Am and aw'],
 ['turn','إِمَّا وَبَلْ وَلَكِنْ وَلَا','Immā, bal, lākin and lā']
]);
finalManSummary('tawkid',[
 'التَّوْكِيدُ يَتْبَعُ الْمُؤَكَّدَ فِي إِعْرَابِهِ وَتَعْرِيفِهِ.','Emphasis follows the case and definiteness of what it emphasizes.',
 'يَكُونُ بِإِعَادَةِ اللَّفْظِ، أَوْ بِأَلْفَاظٍ مَعْلُومَةٍ لِتَقْوِيَةِ الْمَعْنَى.','Repeat the wording, or use one of the forms that strengthens its meaning.',
 'فِي الْمَعْنَوِيِّ يُطَابِقُ الضَّمِيرُ الْمُؤَكَّدَ، وَتَخْتَلِفُ الصُّورَةُ بِاخْتِلَافِ الْعَدَدِ.','In semantic emphasis, the pronoun matches the head and the form depends on its number.',
 'مَيِّزْ بَيْنَ تَكْرَارِ اللَّفْظِ وَزِيَادَةِ لَفْظٍ مِثْلِ «نَفْسُهُ» أَوْ «كُلُّهُمْ».','Distinguish repetition from adding a form such as nafsuhu or kulluhum.','tawkid-p271-01'
],[
 ['verbal','التَّوْكِيدُ اللَّفْظِيُّ','Repetition',true],
 ['pronouns','التَّوْكِيدُ الْمَعْنَوِيُّ وَضَمِيرُهُ','Semantic emphasis and its pronoun',true],
 ['number','الْمُفْرَدُ وَالْمُثَنَّى وَالْجَمْعُ','Singular, dual and plural'],
 ['stronger','سِلْسِلَةُ أَجْمَعَ وَتَوَابِعُهُ','The ajmaʿ series and its intensifiers'],
 ['definiteness','الِاتِّبَاعُ وَحُكْمُ النَّكِرَةِ','Agreement and the indefinite']
]);
finalManSummary('badal',[
 'الْبَدَلُ هُوَ الْمَقْصُودُ بِالْحُكْمِ، وَيَتْبَعُ مَا قَبْلَهُ فِي الْإِعْرَابِ.','Badal is what the assertion is about; it follows the first term in inflection.',
 'تَابِعٌ مَقْصُودٌ بِالْحُكْمِ بِلَا وَاسِطَةٍ.','A dependent directly intended by the assertion, without a coordinator.',
 'يَتَّبِعُ الِاسْمُ الِاسْمَ وَالْفِعْلُ الْفِعْلَ.','A noun follows a noun and a verb follows a verb.',
 'اسْأَلْ: أَهُوَ نَفْسُ الْأَوَّلِ، أَمْ جُزْءٌ مِنْهُ، أَمْ شَيْءٌ مُتَّصِلٌ بِهِ، أَمْ شَيْءٌ آخَرُ؟','Is it the same referent, part of it, associated with it, or something else?','badal-p277-01'
],[
 ['whole','حَدُّ الْبَدَلِ وَالْبَدَلُ الْمُطَابِقُ','Definition and whole-for-whole',true],
 ['linked','الْبَعْضُ وَالِاشْتِمَالُ وَالرَّابِطُ','Part, inclusion and the link'],
 ['other','الْبَدَلُ الْمُبَايِنُ','Dissimilar substitution'],
 ['verb','بَدَلُ الْفِعْلِ وَحُكْمُ التَّعْرِيفِ','Verb substitution and definiteness']
]);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HELP_REDESIGN_BY_CHAPTER;
}

if (typeof window !== 'undefined') {
  window.MIFTAH_HELP_REDESIGN = HELP_REDESIGN_BY_CHAPTER;
}
