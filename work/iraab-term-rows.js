/* ============================================================================
   AUTHORED ROW TABLE — the canonical direct-iʿrāb-term inventory of
   Al-Tuḥfah al-Saniyyah bi-Sharḥ al-Muqaddimah al-Ājurrūmiyyah
   (repo-verified `tuhfa newer.pdf`, sha256 e07c666e…, 183 pages, printed page == PDF page).

   ONE ROW = ONE distinct technical term or meaningful subtype that a learner can
   LEGITIMATELY SAY while performing full iʿrāb from this source.

   Deliberately NOT rows (they inflate the denominator without being sayable in iʿrāb):
     · semantic classifications never uttered in an iʿrāb — the four أقسام of ẓanna (p. 111),
       kāna's 3+3 عمل/تصرف classifications (p. 108), مختص/مبهم as labels, المكيلات/الموزونات.
       These are FACTS ABOUT a term, not a term. They are recorded in `notCounted` below.
     · terms this source does not teach (see `sourceExcluded`) — a curriculum derived only
       from this book cannot keep a row the book never states.

   `status` is NEVER authored: it is DERIVED by work/check-iraab-term-inventory.js from a
   deterministic build+render of every template. `probe` is the canonical Arabic the learner
   must actually see; `mode:'card'` requires a rendered iʿrāb card headed by that exact word.
   ========================================================================== */

const CH = {
  foundations: 'المقدمات وأقسام الكلام (pp. 6–18)',
  irab: 'باب الإعراب والبناء (pp. 19–24)',
  signs: 'باب معرفة علامات الإعراب (pp. 25–58)',
  muarabat: 'باب المعربات (pp. 59–69)',
  afaal: 'باب الأفعال (pp. 70–73)',
  nawasib: 'نواصب الفعل المضارع (pp. 74–78)',
  jawazim: 'جوازم الفعل المضارع (pp. 79–84)',
  marfuat: 'باب مرفوعات الأسماء (p. 85)',
  fail: 'باب الفاعل (pp. 87–95)',
  naib: 'باب المفعول الذي لم يسم فاعله (pp. 96–98)',
  mubtada: 'باب المبتدأ والخبر (pp. 99–104)',
  nawasikh: 'باب العوامل الداخلة على المبتدأ والخبر (pp. 105–115)',
  naat: 'باب النعت (pp. 116–123)',
  atf: 'باب العطف (pp. 124–130)',
  tawkid: 'باب التوكيد (pp. 131–134)',
  badal: 'باب البدل (pp. 135–137)',
  mansubat: 'باب منصوبات الأسماء (pp. 138–139)',
  mafulBih: 'باب المفعول به (pp. 140–145)',
  mutlaq: 'باب المصدر / المفعول المطلق (pp. 146–147)',
  zarf: 'باب ظرف الزمان وظرف المكان (pp. 148–152)',
  haal: 'باب الحال (pp. 153–157)',
  tamyiz: 'باب التمييز (pp. 157–161)',
  istithna: 'باب الاستثناء (pp. 162–165)',
  laJins: 'باب «لا» النافية للجنس (pp. 166–167)',
  munada: 'باب المنادى (pp. 168–170)',
  mafulAjl: 'باب المفعول من أجله (pp. 170–172)',
  mafulMaah: 'باب المفعول معه (pp. 172–173)',
  makhfudat: 'باب المخفوضات من الأسماء (pp. 174–178)'
};

/* r(key, term, chapter, pages, parent, probe, opts) */
const R = (key, term, chapter, pages, parent, probe, opts = {}) =>
  ({ key, term, chapter, pages, parent, probe, ...opts });

const rows = [
  // ─────────── FOUNDATIONS ───────────
  R('F_ISM', 'اسْمٌ', CH.foundations, '9–13', 'أقسام الكلام', 'اسْمٌ', { mode: 'standalone' }),
  R('F_FIL', 'فِعْلٌ', CH.foundations, '9,14–16', 'أقسام الكلام', 'فِعْلٌ مَاضٍ'),
  R('F_HARF', 'حَرْفٌ', CH.foundations, '9,17–18', 'أقسام الكلام', 'حَرْفُ خَفْضٍ'),
  R('F_MUARAB', 'مُعْرَبٌ', CH.irab, '19–24', 'الإعراب والبناء', 'مُعْرَبٌ', { mode: 'standalone' }),
  R('F_MABNI', 'مَبْنِيٌّ', CH.irab, '21–24', 'الإعراب والبناء', 'مَبْنِيٌّ عَلَى'),
  R('F_LA_MAHALL', 'لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ', CH.irab, '21–24', 'البناء', 'لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ'),

  // ─────────── STATES ───────────
  R('S_RAF', 'مَرْفُوعٌ', CH.signs, '25', 'أقسام الإعراب', 'مَرْفُوعٌ'),
  R('S_NASB', 'مَنْصُوبٌ', CH.signs, '40', 'أقسام الإعراب', 'مَنْصُوبٌ'),
  R('S_KHAFD', 'مَخْفُوضٌ', CH.signs, '48', 'أقسام الإعراب', 'مَخْفُوضٌ'),
  R('S_JAZM', 'مَجْزُومٌ', CH.signs, '56', 'أقسام الإعراب', 'مَجْزُومٌ'),

  /* SIGNS. The old inventory crossed every SIGN with every LOCUS, which double-counted:
     a broken plural in rafʿ and a singular in rafʿ are the SAME utterance
     («وعلامة رفعه الضمة الظاهرة»). What the learner actually says splits cleanly in two —
     the sign phrase, and the «لأنه …» locus clause — so each gets its own row exactly once. */
  R('G_DAMMA', 'الضَّمَّةُ الظَّاهِرَةُ عَلَامَةُ الرَّفْعِ', CH.signs, '25–39', 'علامات الرفع', 'وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ'),
  R('G_WAW_RAF', 'الْوَاوُ عَلَامَةُ الرَّفْعِ', CH.signs, '31–35,64–67', 'علامات الرفع', 'وَعَلَامَةُ رَفْعِهِ الْوَاوُ'),
  R('G_ALIF_RAF', 'الْأَلِفُ عَلَامَةُ الرَّفْعِ', CH.signs, '35,64–65', 'علامات الرفع', 'وَعَلَامَةُ رَفْعِهِ الْأَلِفُ'),
  R('G_NUN_RAF', 'ثُبُوتُ النُّونِ عَلَامَةُ الرَّفْعِ', CH.signs, '37–39,67,72', 'علامات الرفع', 'ثُبُوتُ النُّونِ'),
  R('G_FATHA', 'الْفَتْحَةُ الظَّاهِرَةُ عَلَامَةُ النَّصْبِ', CH.signs, '40–41,48', 'علامات النصب', 'وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ الظَّاهِرَةُ'),
  R('G_ALIF_NASB', 'الْأَلِفُ عَلَامَةُ النَّصْبِ', CH.signs, '44,50,66–67', 'علامات النصب', 'وَعَلَامَةُ نَصْبِهِ الْأَلِفُ'),
  R('G_YA_NASB', 'الْيَاءُ عَلَامَةُ النَّصْبِ', CH.signs, '45,50,64–65', 'علامات النصب', 'وَعَلَامَةُ نَصْبِهِ الْيَاءُ'),
  R('G_KASRA_SUB', 'الْكَسْرَةُ نِيَابَةً عَنِ الْفَتْحَةِ', CH.signs, '44,49,69', 'علامات النصب', 'الْكَسْرَةُ نِيَابَةً عَنِ الْفَتْحَةِ'),
  R('G_HADHF_NUN_NASB', 'حَذْفُ النُّونِ عَلَامَةُ النَّصْبِ', CH.signs, '47,67,74–78', 'علامات النصب', 'وَعَلَامَةُ نَصْبِهِ حَذْفُ النُّونِ'),
  R('G_KASRA', 'الْكَسْرَةُ الظَّاهِرَةُ عَلَامَةُ الْخَفْضِ', CH.signs, '48,62', 'علامات الخفض', 'وَعَلَامَةُ خَفْضِهِ الْكَسْرَةُ'),
  R('G_YA_KHAFD', 'الْيَاءُ عَلَامَةُ الْخَفْضِ', CH.signs, '50,66–67', 'علامات الخفض', 'وَعَلَامَةُ خَفْضِهِ الْيَاءُ'),
  R('G_DIPTOTE', 'الْفَتْحَةُ نِيَابَةً عَنِ الْكَسْرَةِ فِي الِاسْمِ الَّذِي لَا يَنْصَرِفُ', CH.signs, '52–55,154', 'علامات الخفض',
    'نِيَابَةً عَنِ الْكَسْرَةِ', { missingReason: 'الممنوع من الصرف is not modelled; named in deliberatelyNotGenerated as "diptote". p. 154 uses it in the ḥāl chapter (إبراهيمَ مجرور بالفتحة نيابة عن الكسرة).' }),
  R('G_SUKUN_JAZM', 'السُّكُونُ عَلَامَةُ الْجَزْمِ', CH.signs, '56,58,79–81', 'علامات الجزم', 'وَعَلَامَةُ جَزْمِهِ السُّكُونُ'),
  R('G_HADHF_NUN_JAZM', 'حَذْفُ النُّونِ عَلَامَةُ الْجَزْمِ', CH.signs, '57–58,67,79–81', 'علامات الجزم', 'وَعَلَامَةُ جَزْمِهِ حَذْفُ النُّونِ'),
  R('G_JAZM_HADHF_ILLAH', 'حَذْفُ حَرْفِ الْعِلَّةِ عَلَامَةُ الْجَزْمِ', CH.signs, '57–58,79–81', 'علامات الجزم', 'حَذْفُ حَرْفِ الْعِلَّةِ'),
  R('G_WEAK_ALIF', 'وَهُوَ الْأَلِفُ، وَالْفَتْحَةُ قَبْلَهَا دَلِيلٌ عَلَيْهَا', CH.signs, '57', 'حذف حرف العلة', 'وَهُوَ الْأَلِفُ، وَالْفَتْحَةُ قَبْلَهَا دَلِيلٌ عَلَيْهَا'),
  R('G_WEAK_WAW', 'وَهُوَ الْوَاوُ، وَالضَّمَّةُ قَبْلَهَا دَلِيلٌ عَلَيْهَا', CH.signs, '57', 'حذف حرف العلة', 'وَهُوَ الْوَاوُ، وَالضَّمَّةُ قَبْلَهَا دَلِيلٌ عَلَيْهَا'),
  R('G_WEAK_YA', 'وَهُوَ الْيَاءُ، وَالْكَسْرَةُ قَبْلَهَا دَلِيلٌ عَلَيْهَا', CH.signs, '57', 'حذف حرف العلة', 'وَهُوَ الْيَاءُ، وَالْكَسْرَةُ قَبْلَهَا دَلِيلٌ عَلَيْهَا'),
  /* the locus clauses — each said once, whatever the state. Four carry «لأنه» and one «وهو»,
     because that is the difference the source itself makes: pp. 62–66 justify a SUBSTITUTE sign
     with «لأنه» («وعلامة نصبه الكسرة نيابةً عن الفتحة؛ لأنه جمعُ مؤنثٍ سالمٌ»), while the broken
     plural takes the ORIGINAL signs and p. 60/62 simply append «وهو جمع تكسير». */
  R('L_MUTHANNA', 'لِأَنَّهُ مُثَنًّى', CH.muarabat, '35,45,64–65', 'مواضع علامات الإعراب', 'مُثَنًّى'),
  R('L_SMP', 'لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ', CH.muarabat, '31,50,65', 'مواضع علامات الإعراب', 'جَمْعُ مُذَكَّرٍ سَالِمٌ'),
  R('L_SFP', 'لِأَنَّهُ جَمْعُ مُؤَنَّثٍ سَالِمٌ', CH.muarabat, '30,44,49', 'مواضع علامات الإعراب', 'جَمْعُ مُؤَنَّثٍ سَالِمٌ'),
  R('L_BROKEN', 'وَهُوَ جَمْعُ تَكْسِيرٍ', CH.muarabat, '26–28,60,62', 'مواضع علامات الإعراب', 'جَمْعُ تَكْسِيرٍ'),
  R('L_5NOUNS', 'لِأَنَّهُ مِنَ الْأَسْمَاءِ الْخَمْسَةِ', CH.muarabat, '32,44,50,66–67', 'مواضع علامات الإعراب', 'مِنَ الْأَسْمَاءِ الْخَمْسَةِ'),
  R('L_5VERBS', 'لِأَنَّهُ مِنَ الْأَفْعَالِ الْخَمْسَةِ', CH.muarabat, '37–39,47,67', 'مواضع علامات الإعراب', 'الْأَفْعَالِ الْخَمْسَةِ'),
  R('G_SAHIH_AKHIR', 'الصَّحِيحُ الْآخِرِ', CH.muarabat, '56,60–61', 'المعربات', 'صَحِيحُ الْآخِرِ'),
  R('G_MUTALL_AKHIR', 'الْمُعْتَلُّ الْآخِرُ', CH.muarabat, '57,61', 'المعربات', 'مُعْتَلُّ الْآخِرِ'),
  R('G_EST_TAADHDHUR', 'ضَمَّةٌ مُقَدَّرَةٌ مَنَعَ مِنْ ظُهُورِهَا التَّعَذُّرُ', CH.muarabat, '20–21,95', 'الإعراب التقديري',
    'ضَمَّةٌ مُقَدَّرَةٌ عَلَى الْأَلِفِ مَنَعَ مِنْ ظُهُورِهَا التَّعَذُّرُ'),
  R('G_EST_THIQL', 'ضَمَّةٌ مُقَدَّرَةٌ مَنَعَ مِنْ ظُهُورِهَا الثِّقَلُ', CH.muarabat, '20–21,95', 'الإعراب التقديري',
    'ضَمَّةٌ مُقَدَّرَةٌ عَلَى الْيَاءِ مَنَعَ مِنْ ظُهُورِهَا الثِّقَلُ'),
  R('G_EST_MUNASABA', 'حَرَكَةٌ مُقَدَّرَةٌ مَنَعَ مِنْ ظُهُورِهَا حَرَكَةُ الْمُنَاسَبَةِ', CH.muarabat, '20–21,71–72,95', 'الإعراب التقديري', 'الْمُنَاسَبَةِ'),
  R('G_EST_INCIDENTAL', 'فَتْحٌ مُقَدَّرٌ مَنَعَهُ اشْتِغَالُ الْمَحَلِّ بِالسُّكُونِ', CH.afaal, '72,157', 'الإعراب التقديري', 'اشْتِغَالُ الْمَحَلِّ'),

  // ─────────── VERBS ───────────
  R('V_MADI', 'فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ', CH.afaal, '70–72', 'أقسام الأفعال', 'فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ'),
  R('V_MUDARI', 'فِعْلٌ مُضَارِعٌ', CH.afaal, '70,73', 'أقسام الأفعال', 'فِعْلٌ مُضَارِعٌ'),
  R('V_AMR', 'فِعْلُ أَمْرٍ مَبْنِيٌّ عَلَى السُّكُونِ', CH.afaal, '70–71', 'أقسام الأفعال', 'فِعْلُ أَمْرٍ',
    { missingReason: 'No imperative lane exists; named in deliberatelyNotGenerated as "imperative".' }),
  R('V_MUJARRAD', 'مَرْفُوعٌ لِتَجَرُّدِهِ مِنَ النَّاصِبِ وَالْجَازِمِ', CH.afaal, '73,95', 'رفع المضارع', 'لِتَجَرُّدِهِ',
    { missingReason: 'The app states the rafʿ but never names تجرُّده من الناصب والجازم as its cause, which is the source\'s own wording at p. 95.' }),
  R('V_NUUN_NISWAH_BINAA', 'مَبْنِيٌّ عَلَى السُّكُونِ لِاتِّصَالِهِ بِنُونِ النِّسْوَةِ', CH.afaal, '73,124', 'بناء المضارع', 'نُونِ النِّسْوَةِ'),
  R('V_MAHALL_RAF', 'فِي مَحَلِّ رَفْعٍ', CH.afaal, '73', 'محل المبني', 'فِي مَحَلِّ رَفْعٍ'),
  R('V_MAHALL_NASB', 'فِي مَحَلِّ نَصْبٍ', CH.afaal, '42,73', 'محل المبني', 'فِي مَحَلِّ نَصْبٍ'),
  R('V_MAHALL_JAZM', 'فِي مَحَلِّ جَزْمٍ', CH.afaal, '42,73,79–80', 'محل المبني', 'فِي مَحَلِّ جَزْمٍ'),
  R('V_PASSIVE_PAST', 'فِعْلٌ مَاضٍ مَبْنِيٌّ لِلْمَجْهُولِ', CH.naib, '96–98', 'المبني للمجهول', 'مَبْنِيٌّ لِلْمَجْهُولِ'),
  R('V_PASSIVE_PRES', 'فِعْلٌ مُضَارِعٌ مَبْنِيٌّ لِلْمَجْهُولِ', CH.naib, '96–98', 'المبني للمجهول', 'مُضَارِعٌ مَبْنِيٌّ لِلْمَجْهُولِ'),

  // ─────────── NAWĀṢIB (pp. 74–78) ───────────
  R('N_AN', 'أَنْ — حَرْفُ مَصْدَرٍ وَنَصْبٍ وَاسْتِقْبَالٍ', CH.nawasib, '75', 'نواصب المضارع', 'حَرْفُ مَصْدَرٍ وَنَصْبٍ وَاسْتِقْبَالٍ'),
  R('N_LAN', 'لَنْ — حَرْفُ نَفْيٍ وَنَصْبٍ وَاسْتِقْبَالٍ', CH.nawasib, '73–74', 'نواصب المضارع', 'حَرْفُ نَفْيٍ وَنَصْبٍ وَاسْتِقْبَالٍ'),
  R('N_IDHAN', 'إِذَنْ — حَرْفُ جَوَابٍ وَجَزَاءٍ وَنَصْبٍ', CH.nawasib, '75', 'نواصب المضارع', 'حَرْفُ جَوَابٍ وَجَزَاءٍ وَنَصْبٍ'),
  R('N_KAY', 'كَيْ — حَرْفُ مَصْدَرٍ وَنَصْبٍ', CH.nawasib, '76', 'نواصب المضارع', 'حَرْفُ مَصْدَرٍ وَنَصْبٍ'),
  R('N_LAM_TALIL', 'لَامُ التَّعْلِيلِ', CH.nawasib, '76', 'نواصب المضارع', 'لَامُ التَّعْلِيلِ'),
  R('N_LAM_JUHUD', 'لَامُ الْجُحُودِ', CH.nawasib, '76', 'نواصب المضارع', 'لَامُ الْجُحُودِ'),
  R('N_HATTA', 'حَتَّى النَّاصِبَةُ', CH.nawasib, '76', 'نواصب المضارع', 'حَتَّى'),
  R('N_FA_SABAB', 'فَاءُ السَّبَبِيَّةِ', CH.nawasib, '76–77', 'نواصب المضارع', 'فَاءُ السَّبَبِيَّةِ'),
  /* SPLIT, not a duplicate: the source teaches this wāw in two chapters governing two
     different categories, and the learner's iʿrāb differs — before a verb it licenses أن
     مضمرة, before a noun it produces a mafʿūl maʿah. Named apart so neither row can own
     the other's canonical Arabic. */
  R('N_WAW_MAIYYA', 'وَاوُ الْمَعِيَّةِ النَّاصِبَةُ لِلْمُضَارِعِ بِأَنْ مُضْمَرَةً', CH.nawasib, '76–77', 'نواصب المضارع', 'وَاوُ الْمَعِيَّةِ'),
  R('N_AW', 'أَوْ النَّاصِبَةُ', CH.nawasib, '78', 'نواصب المضارع', 'أَوْ'),
  R('N_AN_MUDMARA_JAWAZ', 'أَنْ مُضْمَرَةٌ جَوَازًا', CH.nawasib, '76', 'إضمار أن', 'مُضْمَرَةٌ جَوَازًا'),
  R('N_AN_MUDMARA_WUJUB', 'أَنْ مُضْمَرَةٌ وُجُوبًا', CH.nawasib, '76–78', 'إضمار أن', 'مُضْمَرَةٌ وُجُوبًا'),

  // ─────────── JAWĀZIM (pp. 79–84) ───────────
  R('J_LAM', 'لَمْ — حَرْفُ نَفْيٍ وَجَزْمٍ وَقَلْبٍ', CH.jawazim, '79–80', 'جوازم فعل واحد', 'حَرْفُ نَفْيٍ وَجَزْمٍ وَقَلْبٍ'),
  R('J_LAMMA', 'لَمَّا', CH.jawazim, '79–80', 'جوازم فعل واحد', 'لَمَّا', { mode: 'card', requires: 'وَجَزْمٍ' }),
  R('J_ALAM', 'أَلَمْ', CH.jawazim, '79–80', 'جوازم فعل واحد', 'أَلَمْ', { mode: 'sentence' }),
  R('J_ALAMMA', 'أَلَمَّا', CH.jawazim, '79–80', 'جوازم فعل واحد', 'أَلَمَّا', { mode: 'sentence' }),
  R('J_HAMZAT_TAQRIR', 'هَمْزَةُ التَّقْرِيرِ', CH.jawazim, '79–80', 'جوازم فعل واحد', 'هَمْزَةُ التَّقْرِيرِ'),
  R('J_LAM_AMR', 'لَامُ الْأَمْرِ', CH.jawazim, '79–80', 'جوازم فعل واحد', 'لَامُ الْأَمْرِ'),
  R('J_LAM_DUAA', 'لَامُ الدُّعَاءِ', CH.jawazim, '79–80', 'جوازم فعل واحد', 'لَامُ الدُّعَاءِ'),
  R('J_LA_NAHIYA', 'لَا النَّاهِيَةُ', CH.jawazim, '79–81', 'جوازم فعل واحد', 'لَا النَّاهِيَةُ'),
  R('J_LA_DUAA', 'لَا الدُّعَائِيَّةُ', CH.jawazim, '79–81', 'جوازم فعل واحد', 'لَا الدُّعَائِيَّةُ'),
  R('J_IN', 'إِنْ الشَّرْطِيَّةُ', CH.jawazim, '79,81', 'جوازم فعلين', 'إِنْ', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_MAN', 'مَنْ الشَّرْطِيَّةُ', CH.jawazim, '79,81–83', 'جوازم فعلين', 'مَنْ', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_MA', 'مَا الشَّرْطِيَّةُ', CH.jawazim, '79,81–83', 'جوازم فعلين', 'مَا', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_MAHMA', 'مَهْمَا', CH.jawazim, '79,81–83', 'جوازم فعلين', 'مَهْمَا', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_IDHMA', 'إِذْ مَا', CH.jawazim, '79,81–83', 'جوازم فعلين', 'إِذْ مَا'),
  R('J_AYY', 'أَيٌّ', CH.jawazim, '79,81–83', 'جوازم فعلين', 'أَيَّ', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_MATA', 'مَتَى', CH.jawazim, '79,81–83', 'جوازم فعلين', 'مَتَى', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_AYYANA', 'أَيَّانَ', CH.jawazim, '79,81–83', 'جوازم فعلين', 'أَيَّانَ', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_AYNA', 'أَيْنَمَا', CH.jawazim, '79,81–83', 'جوازم فعلين', 'أَيْنَمَا', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_ANNA', 'أَنَّى', CH.jawazim, '79,81–83', 'جوازم فعلين', 'أَنَّى', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_HAYTHUMA', 'حَيْثُمَا', CH.jawazim, '79,81–83', 'جوازم فعلين', 'حَيْثُمَا', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_KAYFAMA', 'كَيْفَمَا', CH.jawazim, '79,81–83', 'جوازم فعلين', 'كَيْفَمَا', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_IDHA_SHIR', 'إِذَا فِي الشِّعْرِ', CH.jawazim, '79,81–83', 'جوازم فعلين', 'إِذَا', { mode: 'card', requires: 'شَرْطٍ جَازِمٌ' }),
  R('J_ADAH', 'أَدَاةُ الشَّرْطِ', CH.jawazim, '81', 'تركيب الشرط', 'أَدَاةُ الشَّرْطِ'),
  R('J_HARF_SHART', 'حَرْفُ شَرْطٍ جَازِمٌ', CH.jawazim, '81', 'تركيب الشرط', 'حَرْفُ شَرْطٍ جَازِمٌ'),
  R('J_ISM_SHART', 'اسْمُ شَرْطٍ جَازِمٌ', CH.jawazim, '81–83', 'تركيب الشرط', 'اسْمُ شَرْطٍ جَازِمٌ'),
  R('J_FIL_SHART', 'فِعْلُ الشَّرْطِ', CH.jawazim, '81', 'تركيب الشرط', 'فِعْلُ الشَّرْطِ'),
  R('J_JAWAB_SHART', 'جَوَابُ الشَّرْطِ وَجَزَاؤُهُ', CH.jawazim, '81', 'تركيب الشرط', 'جَوَابُ الشَّرْطِ وَجَزَاؤُهُ'),

  // ─────────── MARFŪʿĀT ───────────
  R('M_FAIL', 'فَاعِلٌ', CH.fail, '87–90', 'المرفوعات', 'فَاعِلٌ'),
  R('M_FAIL_ZAHIR', 'الْفَاعِلُ الظَّاهِرُ', CH.fail, '88–90', 'أقسام الفاعل', 'فَاعِلٌ مَرْفُوعٌ'),
  R('M_DAMIR_MUTTASIL', 'ضَمِيرٌ مُتَّصِلٌ', CH.fail, '91–93', 'أقسام المضمر', 'ضَمِيرٌ مُتَّصِلٌ'),
  R('M_DAMIR_MUNFASIL', 'ضَمِيرٌ مُنْفَصِلٌ', CH.fail, '93', 'أقسام المضمر', 'ضَمِيرٌ مُنْفَصِلٌ',
    { trueBlocker: "TRUE BLOCKER under the approved source. The obstacle is the bināʾ, not the host sentence. (1) A منفصل pronoun is BY DEFINITION a standalone word — «مَا يُبْتَدَأُ بِهِ الْكَلَامُ وَيَصِحُّ وُقُوعُهُ بَعْدَ إِلَّا فِي الِاخْتِيَارِ» (pp. 93, 142). So unlike the other eight Wave-2 terms, which are all letters inside another word and are carried by COMPONENT_REGISTRY, this term needs a whole-word token of its own. (2) A standalone pronoun does not inflect, so in this app it is necessarily a BUILT noun — isBuiltNoun(): a noun carrying a maḥall and no state. (3) builtNounBinaaMarker() admits a built noun only through a per-construction, source-verified bināʾ table, and the harness asserts that a built noun outside those tables has no canonical marker. Both existing built nouns get their marker from an explicit statement in this source: the munādā's three markers from p. 169, and the interrogative ḥāl's fatḥah from p. 155 («كَيْفَ: اسْمُ اسْتِفْهَامٍ مَبْنِيٌّ عَلَى الْفَتْحِ فِي مَحَلِّ نَصْبٍ حَالٌ»). (4) Al-Tuḥfah enumerates the detached pronouns three separate times and parses none of them: the twelve fāʿil forms (p. 93), the twelve mubtadaʾ forms (pp. 100–101), and the twelve إِيَّا forms (p. 143) — including at p. 93 the forward reference «وَسَيَأْتِي بَيَانُ أَنْوَاعِ الضَّمِيرِ الْمُنْفَصِلِ بِأَوْسَعَ مِنْ هَذِهِ الْإِشَارَةِ فِي بَابِ الْمُبْتَدَأِ وَالْخَبَرِ», which pp. 99–104 answer with a list and no iʿrāb. Every pronoun this source DOES parse is attached: «نَا» (p. 88), التاء / نا / النون (p. 72), يَاءُ الْمُتَكَلِّمِ (p. 95), الهاء (p. 103), الكاف (p. 104), and the object yāʾ (p. 157). The model-iʿrāb drills of all three chapters (pp. 94–95, 103–104, 157) use ẓāhir nouns. Rendering «ضَمِيرٌ مُنْفَصِلٌ مَبْنِيٌّ عَلَى السُّكُونِ فِي مَحَلِّ رَفْعٍ فَاعِلٌ» would therefore require INVENTING the bināʾ sign — the exact gate that keeps نونا التوكيد out of COMPONENT_REGISTRY — or weakening the harness invariant that exists to catch an invented bināʾ. Both were refused. NOT the obstacle: the host. p. 93 supplies the whole frame («مَا ضَرَبَ إِلَّا أَنَا», twelve forms) and p. 95 sets it as an exercise («مَثِّلْ لِلضَّمِيرِ الْمُنْفَصِلِ الْوَاقِعِ فَاعِلًا بِاثْنَيْ عَشَرَ مِثَالًا»). UNBLOCK: one reviewed secondary source for the bināʾ of the detached pronouns, registered through the mechanism this codebase already has — secondarySupportedRule + REVIEWED_SOURCE_AUTHORITIES — exactly as أَلِفُ الِاثْنَيْنِ is handled today (Al-Tuḥfah p. 71 controls the construction, Daʿkūr p. 86 supplies the component analysis). That citation must be read and verified by a human against the secondary text; it is deliberately NOT invented here." }),
  R('M_DAMIR_MUSTATIR_WUJUB', 'ضَمِيرٌ مُسْتَتِرٌ وُجُوبًا', CH.fail, '81,91–93', 'أقسام المضمر', 'مُسْتَتِرٌ وُجُوبًا'),
  R('M_DAMIR_MUSTATIR_JAWAZ', 'ضَمِيرٌ مُسْتَتِرٌ جَوَازًا', CH.fail, '91–93,130', 'أقسام المضمر', 'مُسْتَتِرٌ جَوَازًا'),
  R('M_WAW_JAMAAH', 'وَاوُ الْجَمَاعَةِ', CH.fail, '38,67,71–72,91', 'الضمير المتصل', 'وَاوُ الْجَمَاعَةِ'),
  R('M_ALIF_ITHNAIN', 'أَلِفُ الِاثْنَيْنِ', CH.fail, '71,91–92', 'الضمير المتصل', 'أَلِفُ الِاثْنَيْنِ'),
  R('M_NUUN_NISWAH', 'نُونُ النِّسْوَةِ', CH.fail, '72,124', 'الضمير المتصل', 'نُونُ النِّسْوَةِ'),
  R('M_TAA_FAIL_1S', 'تَاءُ الْمُتَكَلِّمِ', CH.fail, '72,91,95', 'الضمير المتصل', 'تَاءُ الْمُتَكَلِّمِ',
    { missingReason: 'C_TAA_FAIL_1S is registered and the verb inflects for it, but the component is never named on its own card.' }),
  R('M_TAA_FAIL_2MS', 'تَاءُ الْمُخَاطَبِ', CH.fail, '72,91', 'الضمير المتصل', 'تَاءُ الْمُخَاطَبِ',
    { mode: 'standalone' }),
  R('M_TAA_FAIL_2FS', 'تَاءُ الْمُخَاطَبَةِ', CH.fail, '72,91', 'الضمير المتصل', 'تَاءُ الْمُخَاطَبَةِ',
    { missingReason: 'Registered component, never rendered as a named card.' }),
  R('M_NAA_FAILIN', 'نَا الْفَاعِلِينَ', CH.fail, '72,91–92', 'الضمير المتصل', 'نَا الْفَاعِلِينَ',
    { missingReason: 'C_NAA_FAILIN is registered; the label never reaches the learner\'s iʿrāb.' }),
  R('M_YAA_MUKHATABA', 'يَاءُ الْمُخَاطَبَةِ', CH.fail, '38,91', 'الضمير المتصل', 'يَاءُ الْمُخَاطَبَةِ',
    { missingReason: 'Registered component; no 2fs present lane produces it.' }),
  R('M_TAA_TANIITH', 'تَاءُ التَّأْنِيثِ السَّاكِنَةُ', CH.fail, '15–16,88,91,157', 'علامات الفعل', 'تَاءُ التَّأْنِيثِ',
    { missingReason: 'C_TAA_TANIITH_SAKINA is registered; p. 157\'s model parse says «والتاء علامة التأنيث», which the app never prints.' }),
  R('M_NUUN_WIQAYA', 'نُونُ الْوِقَايَةِ', CH.fail, '157', 'الضمير المتصل', 'نُونُ الْوِقَايَةِ',
    { missingReason: 'Named in the p. 157 model iʿrāb («والنون للوقاية»); no lane attaches an object pronoun to a verb.' }),
  R('M_ALIF_FARIQA', 'الْأَلِفُ الْفَارِقَةُ', CH.fail, '—', 'رسم الفعل', 'الْأَلِفُ الْفَارِقَةُ',
    { missingReason: 'C_ALIF_FARIQA is registered with NO source page; it is an orthographic note, and it never renders.' }),
  R('M_NAIB_FAIL', 'نَائِبُ فَاعِلٍ', CH.naib, '96–98', 'المرفوعات', 'نَائِبُ فَاعِلٍ'),
  R('M_NAIB_MUDMAR', 'نَائِبُ فَاعِلٍ مُضْمَرٌ', CH.naib, '97–98', 'نائب الفاعل', 'نَائِبُ فَاعِلٍ مُضْمَرٌ',
    { missingReason: 'p. 97 makes نائب الفاعل ظاهر أو مضمر كالفاعل; only the ẓāhir deputy is produced (deliberatelyNotGenerated: "passive deputy pronouns").' }),
  R('M_MUBTADA', 'مُبْتَدَأٌ', CH.mubtada, '99–100', 'المرفوعات', 'مُبْتَدَأٌ'),
  R('M_MUBTADA_MUDMAR', 'مُبْتَدَأٌ مُضْمَرٌ', CH.mubtada, '100', 'أقسام المبتدأ', 'مُبْتَدَأٌ مُضْمَرٌ',
    { trueBlocker: "TRUE BLOCKER under the approved source, and it is a STRICTER case of the ضَمِيرٌ مُنْفَصِلٌ wall, not a copy of it. (1) Al-Tuḥfah teaches the row: p. 100's matn divides the mubtadaʾ into ظاهر and مضمر and enumerates twelve muḍmars — «وَالْمُضْمَرُ اثْنَا عَشَرَ، وَهِيَ: أَنَا، وَنَحْنُ، وَأَنْتَ، وَأَنْتِ، وَأَنْتُمَا، وَأَنْتُمْ، وَأَنْتُنَّ، وَهُوَ، وَهِيَ، وَهُمَا، وَهُمْ، وَهُنَّ» — and pp. 100–101's شرح gives each one a model sentence («أَنَا عَبْدُ اللهِ», «أَنْتَ فَاهِمٌ», «هُوَ حَاضِرٌ», «هُنَّ قَائِمَاتٌ»). It is emphatically not sourceExcluded, and «مبتدأ» is a direct analysis, so the row stays counted. (2) The source CLOSES every escape this app has. p. 101 ends the enumeration with «وَإِذَا كَانَ الْمُبْتَدَأُ ضَمِيراً فَإِنَّهُ لَا يَكُونُ إِلَّا بَارِزاً مُنْفَصِلاً، كَمَا رَأَيْتَ» — so a mubtadaʾ pronoun may not be مستتر and may not be متصل. The two pronoun lanes this app CAN produce are exactly those two: the concealed fāʿil (M_DAMIR_MUSTATIR_WUJUB / _JAWAZ, both FULL) and the attached letters COMPONENT_REGISTRY carries. This row is therefore reachable only through the one pronoun class the source never parses. (3) That class has no bināʾ here. A standalone pronoun does not inflect, so it is necessarily a BUILT noun — isBuiltNoun(): a noun with a maḥall and no state — and builtNounBinaaMarker() admits a built noun only through a per-construction, source-verified bināʾ table. p. 22 is this book's own catalogue of what is built and upon what — «وذلك كلزوم «كَمْ» و«مَنْ» السكون، وكلزوم «هٰؤُلَاءِ» و«حَذَامِ» و«أَمْسِ» الكَسْرَ، وكلزوم «مُنْذُ» و«حَيْثُ» الضمَّ، وكلزوم «أَيْنَ» و«كَيْفَ» الفَتْحَ» — and no pronoun stands in it. That same sentence is what licensed هَؤُلَاءِ in Wave 4 and again in Wave 13's rābiṭ lane, so the asymmetry is the source's, not the engine's. (4) The chapter's own model iʿrāb declines to help. p. 93 forward-references this very bāb — «وَسَيَأْتِي بَيَانُ أَنْوَاعِ الضَّمِيرِ الْمُنْفَصِلِ بِأَوْسَعَ مِنْ هَذِهِ الْإِشَارَةِ فِي بَابِ الْمُبْتَدَإِ وَالْخَبَرِ» — and pp. 99–104 answer with a list and no parse: the «تدريب على الإعراب» of pp. 103–104 works five sentences («محمد قائم», «محمد حضر أبوه», «محمد أبوه مسافر», «محمد في الدار», «محمد عندك») and every mubtadaʾ in them is ẓāhir. The only pronouns those pages parse are ATTACHED — «والهاءُ مضاف إليه، مبني على الضم في محل خفض» (p. 103) and «والكاف ضمير مضاف إليه مبني على الفتح في محل خفض» (p. 104) — and this app already produces both. Rendering «أَنَا: ضَمِيرٌ مُنْفَصِلٌ مَبْنِيٌّ عَلَى السُّكُونِ فِي مَحَلِّ رَفْعٍ مُبْتَدَأٌ» would therefore mean INVENTING the bināʾ sign, or dropping it and shipping a built noun with no bināʾ — which is the built-vs-muʿrab contract Wave 12 strengthened globally. Both were refused; printing a bare «مبتدأ مضمر» label instead was refused too, because a label is not an iʿrāb. NOT the obstacle: the host. p. 100's own «أَنَا قَائِمٌ» is a two-word nominal sentence this engine builds in every other form. UNBLOCK: one reviewed secondary source for the bināʾ of the detached pronouns, registered through secondarySupportedRule + REVIEWED_SOURCE_AUTHORITIES exactly as أَلِفُ الِاثْنَيْنِ is handled today (Al-Tuḥfah p. 71 controls the construction, Daʿkūr p. 86 supplies the component analysis). One such citation unblocks this row and ضَمِيرٌ مُنْفَصِلٌ together, since it is the same missing fact. It must be read and verified by a human against the secondary text; it is deliberately NOT invented here." }),
  R('M_MUBTADA_MUAKHKHAR', 'مُبْتَدَأٌ مُؤَخَّرٌ', CH.mubtada, '103–104', 'المبتدأ', 'مُبْتَدَأٌ مُؤَخَّرٌ'),
  R('M_KHABAR', 'خَبَرٌ', CH.mubtada, '99–101', 'المرفوعات', 'خَبَرٌ'),
  R('M_KHABAR_MUFRAD', 'خَبَرٌ مُفْرَدٌ', CH.mubtada, '101', 'أقسام الخبر', 'خَبَرٌ مَرْفُوعٌ'),
  R('M_KHABAR_MUQADDAM', 'خَبَرٌ مُقَدَّمٌ', CH.mubtada, '103–104', 'أقسام الخبر', 'خَبَرٍ مُقَدَّمٍ'),
  R('M_KHABAR_JUMLA_ISMIYYA', 'خَبَرٌ جُمْلَةٌ اسْمِيَّةٌ', CH.mubtada, '101–102', 'أقسام الخبر', 'خَبَرٌ جُمْلَةٌ اسْمِيَّةٌ'),
  R('M_KHABAR_JUMLA_FILIYYA', 'خَبَرٌ جُمْلَةٌ فِعْلِيَّةٌ', CH.mubtada, '101–102', 'أقسام الخبر', 'خَبَرٌ جُمْلَةٌ فِعْلِيَّةٌ'),
  R('M_JUMLA_MAHALL_RAF', 'جُمْلَةٌ فِي مَحَلِّ رَفْعٍ خَبَرٌ', CH.mubtada, '101–102', 'أقسام الخبر', 'فِي مَحَلِّ رَفْعٍ خَبَرٌ'),
  R('M_RABIT', 'الرَّابِطُ', CH.mubtada, '102', 'أقسام الخبر', 'الرَّابِطُ'),
  R('M_RABIT_DAMIR', 'ضَمِيرٌ يَعُودُ عَلَى الْمُبْتَدَأِ', CH.mubtada, '102', 'الرابط', 'يَعُودُ عَلَى'),
  R('M_RABIT_ISHARA', 'اسْمُ إِشَارَةٍ رَابِطًا', CH.mubtada, '102', 'الرابط', 'اسْمُ إِشَارَةٍ',
    /* The `requires` discriminator STAYS now that the row is FULL, and it is the point of the row.
       باب النعت produces a demonstrative as an ordinary mubtadaʾ, and that card carries «اسْمُ
       إِشَارَةٍ» too; only p. 102's link card carries «الرَّابِطُ» beside it. Dropping the
       discriminator would let the باب النعت lane score this row, which is precisely the false
       collision Wave 4 found and left standing. */
    { requires: 'الرَّابِطُ' }),
  R('M_KHABAR_SHIBH', 'خَبَرٌ شِبْهُ جُمْلَةٍ', CH.mubtada, '101–102', 'أقسام الخبر', 'خَبَرٌ شِبْهُ جُمْلَةٍ'),
  R('M_JARR_MUTAALLIQ', 'جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ', CH.mubtada, '103–104', 'شبه الجملة', 'جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ'),
  R('M_ZARF_MUTAALLIQ', 'ظَرْفُ مَكَانٍ مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ', CH.mubtada, '101–104', 'شبه الجملة', 'ظَرْفُ مَكَانٍ مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ'),

  // ─────────── NAWĀSIKH ───────────
  R('K_ISM_KANA', 'اسْمُ كَانَ مَرْفُوعٌ', CH.nawasikh, '106–108', 'كان وأخواتها', 'اسْمُ «كَانَ»'),
  R('K_KHABAR_KANA', 'خَبَرُ كَانَ مَنْصُوبٌ', CH.nawasikh, '106–108', 'كان وأخواتها', 'خَبَرُ «كَانَ»'),
  R('K_KANA', 'كَانَ', CH.nawasikh, '106–107', 'كان وأخواتها', 'كَانَ', { mode: 'kana' }),
  R('K_AMSA', 'أَمْسَى', CH.nawasikh, '106–107', 'كان وأخواتها', 'أَمْسَى', { mode: 'kana' }),
  R('K_ASBAHA', 'أَصْبَحَ', CH.nawasikh, '106–107', 'كان وأخواتها', 'أَصْبَحَ', { mode: 'kana' }),
  R('K_ADHA', 'أَضْحَى', CH.nawasikh, '106–107', 'كان وأخواتها', 'أَضْحَى', { mode: 'kana' }),
  R('K_ZALLA', 'ظَلَّ', CH.nawasikh, '106–107', 'كان وأخواتها', 'ظَلَّ', { mode: 'kana' }),
  R('K_BATA', 'بَاتَ', CH.nawasikh, '106–107', 'كان وأخواتها', 'بَاتَ', { mode: 'kana' }),
  R('K_SARA', 'صَارَ', CH.nawasikh, '106–107', 'كان وأخواتها', 'صَارَ', { mode: 'kana' }),
  R('K_LAYSA', 'لَيْسَ', CH.nawasikh, '106–107', 'كان وأخواتها', 'لَيْسَ', { mode: 'kana' }),
  R('K_MA_ZALA', 'مَا زَالَ', CH.nawasikh, '107–108', 'كان وأخواتها', 'مَا زَالَ', { mode: 'kana' }),
  R('K_MA_INFAKKA', 'مَا انْفَكَّ', CH.nawasikh, '107–108', 'كان وأخواتها', 'مَا انْفَكَّ', { mode: 'kana' }),
  R('K_MA_FATIA', 'مَا فَتِئَ', CH.nawasikh, '107–108', 'كان وأخواتها', 'مَا فَتِئَ', { mode: 'kana' }),
  R('K_MA_BARIHA', 'مَا بَرِحَ', CH.nawasikh, '107–108', 'كان وأخواتها', 'مَا بَرِحَ', { mode: 'kana' }),
  R('K_MA_DAMA', 'مَا دَامَ', CH.nawasikh, '107–108', 'كان وأخواتها', 'مَا دَامَ', { mode: 'kana' }),
  R('I_ISM_INNA', 'اسْمُ إِنَّ مَنْصُوبٌ', CH.nawasikh, '109–110', 'إن وأخواتها', 'اسْمُ «إِنَّ»'),
  R('I_KHABAR_INNA', 'خَبَرُ إِنَّ مَرْفُوعٌ', CH.nawasikh, '109–110', 'إن وأخواتها', 'خَبَرُ «إِنَّ»'),
  R('I_INNA', 'إِنَّ بِكَسْرِ الْهَمْزَةِ — حَرْفُ تَوْكِيدٍ وَنَصْبٍ', CH.nawasikh, '109', 'إن وأخواتها', 'حَرْفُ تَوْكِيدٍ وَنَصْبٍ'),
  R('I_ANNA', 'أَنَّ بِفَتْحِ الْهَمْزَةِ — حَرْفُ تَوْكِيدٍ وَنَصْبٍ', CH.nawasikh, '109', 'إن وأخواتها', 'أَنَّ',
    { mode: 'inna', missingReason: 'p. 109 makes the sisters SIX — «الأول: إنَّ بكسر الهمزة. الثاني: أنَّ بفتح الهمزة» — and innaSisters registers only five.' }),
  R('I_LAKINNA', 'لَكِنَّ — حَرْفُ اسْتِدْرَاكٍ وَنَصْبٍ', CH.nawasikh, '109', 'إن وأخواتها', 'حَرْفُ اسْتِدْرَاكٍ وَنَصْبٍ'),
  R('I_KAANNA', 'كَأَنَّ — حَرْفُ تَشْبِيهٍ وَنَصْبٍ', CH.nawasikh, '109', 'إن وأخواتها', 'حَرْفُ تَشْبِيهٍ وَنَصْبٍ'),
  R('I_LAYTA', 'لَيْتَ — حَرْفُ تَمَنٍّ وَنَصْبٍ', CH.nawasikh, '109–110', 'إن وأخواتها', 'حَرْفُ تَمَنٍّ وَنَصْبٍ'),
  R('I_LAALLA', 'لَعَلَّ — حَرْفُ تَرَجٍّ وَتَوَقُّعٍ وَنَصْبٍ', CH.nawasikh, '110', 'إن وأخواتها', 'حَرْفُ تَرَجٍّ وَتَوَقُّعٍ وَنَصْبٍ'),
  R('Z_MAFUL_AWWAL', 'مَفْعُولٌ أَوَّلُ', CH.nawasikh, '110', 'ظن وأخواتها', 'مَفْعُولٌ أَوَّلُ'),
  R('Z_MAFUL_THANI', 'مَفْعُولٌ ثَانٍ', CH.nawasikh, '110', 'ظن وأخواتها', 'مَفْعُولٌ ثَانٍ'),
  R('Z_ZANANTU', 'ظَنَنْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'ظَنَنْتُ', { mode: 'sentence' }),
  R('Z_HASIBTU', 'حَسِبْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'حَسِبْتُ', { mode: 'sentence' }),
  R('Z_KHILTU', 'خِلْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'خِلْتُ', { mode: 'sentence' }),
  R('Z_ZAAMTU', 'زَعَمْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'زَعَمْتُ', { mode: 'sentence' }),
  R('Z_RAAYTU', 'رَأَيْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'رَأَيْتُ', { mode: 'sentence' }),
  R('Z_ALIMTU', 'عَلِمْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'عَلِمْتُ', { mode: 'sentence' }),
  R('Z_WAJADTU', 'وَجَدْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'وَجَدْتُ', { mode: 'sentence' }),
  R('Z_ITTAKHADHTU', 'اتَّخَذْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'اتَّخَذْتُ', { mode: 'sentence' }),
  R('Z_JAALTU', 'جَعَلْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'جَعَلْتُ', { mode: 'sentence' }),
  R('Z_SAMITU', 'سَمِعْتُ', CH.nawasikh, '110–111', 'ظن وأخواتها', 'سَمِعْتُ', { mode: 'sentence' }),

  // ─────────── FOLLOWERS ───────────
  R('T_NAAT', 'نَعْتٌ تَابِعٌ لِلْمَنْعُوتِ', CH.naat, '116–118', 'التوابع', 'نَعْتٌ'),
  R('T_NAAT_HAQIQI', 'النَّعْتُ الْحَقِيقِيُّ', CH.naat, '116–118', 'أقسام النعت', 'نَعْتٌ حَقِيقِيٌّ'),
  R('T_NAAT_SABABI', 'النَّعْتُ السَّبَبِيُّ', CH.naat, '116–118', 'أقسام النعت', 'نَعْتٌ سَبَبِيٌّ'),
  /* p. 118 «المعرفة خمسة أقسام». These rows ask whether the learner is ever made to NAME a
     noun as one of the five kinds while doing iʿrāb — not whether the underlying item is
     produced (the pronoun, for instance, has its own rows under باب الفاعل). */
  R('T_MARIFA_DAMIR', 'الْمَعْرِفَةُ: الضَّمِيرُ', CH.naat, '118–120', 'أقسام المعرفة', 'مَعْرِفَةٌ، وَنَوْعُهَا الضَّمِيرُ'),
  R('T_MARIFA_ALAM', 'الْمَعْرِفَةُ: الْعَلَمُ', CH.naat, '118–120', 'أقسام المعرفة', 'مَعْرِفَةٌ، وَنَوْعُهَا الْعَلَمُ'),
  R('T_MARIFA_ISHARA', 'الْمَعْرِفَةُ: اسْمُ الْإِشَارَةِ', CH.naat, '118–120', 'أقسام المعرفة', 'مَعْرِفَةٌ، وَنَوْعُهَا اسْمُ الْإِشَارَةِ'),
  R('T_MARIFA_MAWSUL', 'الْمَعْرِفَةُ: الِاسْمُ الْمَوْصُولُ', CH.naat, '118–120', 'أقسام المعرفة', 'مَعْرِفَةٌ، وَنَوْعُهَا الِاسْمُ الْمَوْصُولُ',
    { trueBlocker: "TRUE BLOCKER under the approved source, and the obstacle is the bināʾ. (1) Al-Tuḥfah TEACHES this kind: p. 118's matn makes الاسم المبهم the third of the five maʿrifahs and names اسم الإشارة and الاسم الموصول as its two types, and p. 120 defines the relative noun in full — «ما يدل على معين بواسطة جملة أو شبهها تذكر بعده البتة وتسمى صِلةً، وتكون مشتملة على ضمير يطابق الموصول ويسمى عائداً» — and lists its six alfāẓ (الَّذي، الَّتي، اللَّذانِ/اللَّذَيْنِ، اللَّتانِ/اللَّتَيْنِ، الَّذين، اللَّاتي/اللَّائي). So it is a curriculum row, not an out-of-source term. (2) It is never PARSED. The relative noun appears in this book only as a listed lafẓ (p. 120) and inside an unparsed example of the fifth kind, «وغلامُ الَّذي زارنا أمسِ» (p. 120), and inside student exercises the book does not answer (pp. 104, 122). Every model iʿrāb in the book — pp. 94–95, 103–104, 115, 123, 145, 157 — parses ẓāhir nouns and attached pronouns and no relative. (3) A whole-word relative is necessarily a BUILT noun in this engine — isBuiltNoun(): a noun carrying a maḥall and no state — and builtNounBinaaMarker() admits a built noun only through a per-construction, source-verified bināʾ table. This source's own catalogue of what is built and upon what, at p. 22, is «وذلك كلزوم «كَمْ» و«مَنْ» السكون، وكلزوم «هٰؤُلَاءِ» و«حَذَامِ» و«أَمْسِ» الكَسْرَ، وكلزوم «مُنْذُ» و«حَيْثُ» الضمَّ، وكلزوم «أَيْنَ» و«كَيْفَ» الفَتْحَ» — and no relative noun stands in it. That same sentence is exactly what licensed هَؤُلَاءِ in this wave, which is why اسم الإشارة shipped and the relative did not: the asymmetry is the source's, not the engine's. (4) Even with a bināʾ, the ṣilah would have to be parsed, and this source never says what position a ṣilah clause holds. Producing «الَّذِي: اسْمٌ مَوْصُولٌ مَبْنِيٌّ عَلَى السُّكُونِ فِي مَحَلِّ رَفْعٍ» would therefore mean INVENTING the bināʾ — the same gate that keeps ضَمِيرٌ مُنْفَصِلٌ out — or weakening the harness invariant that exists to catch an invented bināʾ. Both were refused. UNBLOCK: one reviewed secondary source for the bināʾ of the relative nouns and for the ṣilah's position, registered through the mechanism this codebase already has — secondarySupportedRule + REVIEWED_SOURCE_AUTHORITIES — exactly as أَلِفُ الِاثْنَيْنِ is handled today. That citation must be read and verified by a human against the secondary text; it is deliberately NOT invented here." }),
  R('T_MARIFA_AL', 'الْمَعْرِفَةُ: الْمُحَلَّى بِأَلْ', CH.naat, '118–120', 'أقسام المعرفة', 'مَعْرِفَةٌ، وَنَوْعُهَا الْمُحَلَّى بِأَلْ'),
  R('T_NAKIRA', 'النَّكِرَةُ', CH.naat, '120–123', 'النعت', 'نَكِرَةٌ'),
  R('T_ATF_NASAQ', 'مَعْطُوفٌ تَابِعٌ لِلْمَعْطُوفِ عَلَيْهِ', CH.atf, '124–130', 'التوابع', 'مَعْطُوفٌ'),
  /* Wave 11 — these two rows were ABSENT for a reason that was never true. Their old missingReason
     said the wāw and the fāʾ "never receive an iʿrāb card, unlike the other eight conjunctions";
     the app has in fact always given all TEN their own card, and the wāw's reaches eight template
     lanes — more than any other conjunction. What was actually wrong was the PROBE: it asked for
     «الْوَاوُ الْعَاطِفَةُ» / «الْفَاءُ الْعَاطِفَةُ», wording that occurs neither in the app nor in
     Al-Tuḥfah. The book names these two inside «وَحُرُوفُ الْعَطْفِ عَشَرَةٌ، وَهِيَ: الْوَاوُ، وَالْفَاءُ»
     (p. 124) and then PARSES the wāw twice, in its own model iʿrāb, as «وَالْوَاوُ حَرْفُ عَطْفٍ»
     (pp. 129–130) — which is exactly what this row's `term` column already said and exactly what the
     card renders. The adjectival «عَاطِفَةٌ» the old probe reached for is this source's word too
     («وَتَأْتِي «حتى» ابْتِدَائِيَّةً غَيْرَ عَاطِفَةٍ», p. 127), which is why the other eight rows use
     it legitimately — but it is not what the source or the app calls THESE two. The probe is
     therefore corrected; no second, redundant name was added to a card that already exists.
     `mode:'card'` is stronger than the plain `contains` the other eight use, and deliberately so:
     «وَ» heads FOUR different cards in this app (عطف، معية of المفعول معه، معية of the concealed
     أن، and قسم) and «فَ» heads two (عطف، سببية), so a head alone would prove nothing. `requires`
     must be found in that same card's BODY. Both literals are rewritten from the app's own frozen
     registry by work/w11-probes.js and are never typed here. */
  R('T_ATF_WAW', 'الْوَاوُ — حَرْفُ عَطْفٍ', CH.atf, '124–125', 'حروف عطف النسق', 'وَ',
    { mode: 'card', requires: 'وَاوُ الْعَطْفِ' }),
  R('T_ATF_FA', 'الْفَاءُ — حَرْفُ عَطْفٍ', CH.atf, '124,126', 'حروف عطف النسق', 'فَ',
    { mode: 'card', requires: 'فَاءُ الْعَطْفِ' }),
  R('T_ATF_THUMMA', 'ثُمَّ — حَرْفُ عَطْفٍ', CH.atf, '124,126', 'حروف عطف النسق', 'ثُمَّ الْعَاطِفَةُ'),
  R('T_ATF_AW', 'أَوْ — حَرْفُ عَطْفٍ', CH.atf, '124,126', 'حروف عطف النسق', 'أَوْ الْعَاطِفَةُ'),
  R('T_ATF_AM', 'أَمْ — حَرْفُ عَطْفٍ', CH.atf, '124,126', 'حروف عطف النسق', 'أَمْ الْعَاطِفَةُ'),
  R('T_ATF_IMMA', 'إِمَّا — حَرْفُ عَطْفٍ', CH.atf, '124,126', 'حروف عطف النسق', 'إِمَّا الْعَاطِفَةُ'),
  R('T_ATF_BAL', 'بَلْ — حَرْفُ عَطْفٍ', CH.atf, '124,126', 'حروف عطف النسق', 'بَلْ الْعَاطِفَةُ'),
  R('T_ATF_LA', 'لَا — حَرْفُ عَطْفٍ', CH.atf, '124,127', 'حروف عطف النسق', 'لَا الْعَاطِفَةُ'),
  R('T_ATF_LAKIN', 'لَكِنْ — حَرْفُ عَطْفٍ', CH.atf, '124,127', 'حروف عطف النسق', 'لَكِنْ الْعَاطِفَةُ'),
  R('T_ATF_HATTA', 'حَتَّى — حَرْفُ عَطْفٍ', CH.atf, '124,127', 'حروف عطف النسق', 'حَتَّى الْعَاطِفَةُ'),
  R('T_ATF_BAYAN', 'عَطْفُ الْبَيَانِ', CH.atf, '125,130', 'أقسام العطف', 'عَطْفُ الْبَيَانِ',
    { trueBlocker: "TRUE BLOCKER under the approved source, and the obstacle is the missing حُكْم. (1) Al-Tuḥfah TEACHES this term, and the old row understated how much: p. 125 makes عطف البيان the FIRST of the two أقسام of العطف, defines it — «التَّابِعُ الْجَامِدُ الْمُوَضِّحُ لِمَتْبُوعِهِ فِي الْمَعَارِفِ الْمُخَصِّصُ لَهُ فِي النَّكِرَاتِ» — gives one maʿrifah example «جَاءَنِي مُحَمَّدٌ أَبُوكَ» and one nakirah example ﴿مِنْ مَاءٍ صَدِيدٍ﴾, and p. 130's أسئلة drills it («ما هو عطف البيان؟ مَثِّلْ لعطف البيان بمثالين»). It is emphatically NOT sourceExcluded. (2) It is also NOT notCounted: the book utters it as a direct analysis, «فَأَبُوكَ: عَطْفُ بَيَانٍ عَلَى مُحَمَّدٍ» and «فَصَدِيدٌ: عَطْفُ بَيَانٍ عَلَى مَاءٍ», which is the same shape as the maʿṭūf analysis it performs at p. 129 («وَكِيلٌ: مَعْطُوفٌ عَلَى مُحَمَّدٍ»). A learner may legitimately say it, so the row stays counted. (3) What the source WITHHOLDS is the حُكْم, and this book states a حكم for every OTHER تابع it teaches: النعت at p. 116 («تَابِعٌ لِلْمَنْعُوتِ فِي رَفْعِهِ وَنَصْبِهِ وَخَفْضِهِ، وَتَعْرِيفِهِ وَتَنْكِيرِهِ»), عطف النسق under its own heading «حكم حروف العطف» at p. 127 («فَإِنْ عَطَفْتَ عَلَى مَرْفُوعٍ رَفَعْتَ...»), and البدل at p. 135 («تَبِعَهُ فِي جَمِيعِ إِعْرَابِهِ»). For عطف البيان it states NONE — its whole treatment is the one definitional paragraph on p. 125, and its own two analyses stop at «عَطْفُ بَيَانٍ عَلَى مُحَمَّدٍ، وَكِلَاهُمَا مَعْرِفَةٌ» with no state and no sign, whereas the maʿṭūf analysis it models continues «وَالْمَعْطُوفُ عَلَى الْمَرْفُوعِ مَرْفُوعٌ، وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ». The app's full-iʿrāb standard needs that continuation. (4) The one rule that would supply it cannot be borrowed. p. 127's شرح scopes itself explicitly to the particle — «هَذِهِ الْأَحْرُفُ الْعَشَرَةُ تَجْعَلُ مَا بَعْدَهَا تَابِعاً لِمَا قَبْلَهَا فِي حُكْمِهِ الْإِعْرَابِيِّ» — and عطف البيان has no particle at all, so citing R_ATF_* for it would be exactly the source-rule theft PARTICLE_RULE_OWNERS and ROLE_RULE_VARIANTS exist to refuse; citing البدل's p. 135 rule would be worse, since the source keeps the two in different bābs. Producing «أَبُوكَ: عَطْفُ بَيَانٍ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الْوَاوُ» therefore means INVENTING the following-rule, which is the same wall الِاسْمُ الْمَوْصُولُ and ضَمِيرٌ مُنْفَصِلٌ stand at. (5) Note the source's own deliberate near-miss: p. 125's definition of عطف البيان and p. 116's definition of النعت are word-for-word identical except جَامِد against مُشْتَقّ — the book draws the contrast and still declines to give the second one a حكم. That asymmetry is the source's, not the engine's. UNBLOCK: one reviewed secondary source for the iʿrāb-following rule of عطف البيان, registered through secondarySupportedRule + REVIEWED_SOURCE_AUTHORITIES exactly as أَلِفُ الِاثْنَيْنِ is handled today, read and verified by a human against that text. It is deliberately NOT invented here." }),
  R('T_TAWKID', 'تَوْكِيدٌ تَابِعٌ لِلْمُؤَكَّدِ', CH.tawkid, '131–134', 'التوابع', 'تَوْكِيدٌ'),
  R('T_TAWKID_LAFZI', 'تَوْكِيدٌ لَفْظِيٌّ', CH.tawkid, '131', 'أقسام التوكيد', 'تَوْكِيدٌ لَفْظِيٌّ'),
  R('T_TAWKID_MANAWI', 'تَوْكِيدٌ مَعْنَوِيٌّ', CH.tawkid, '131–134', 'أقسام التوكيد', 'تَوْكِيدٌ مَعْنَوِيٌّ'),
  R('T_TAWKID_NAFS', 'النَّفْسُ', CH.tawkid, '132–134', 'ألفاظ التوكيد المعنوي', 'نَفْسُهُ'),
  R('T_TAWKID_AYN', 'الْعَيْنُ', CH.tawkid, '132–134', 'ألفاظ التوكيد المعنوي', 'عَيْنُهُ'),
  R('T_TAWKID_KULL', 'كُلٌّ', CH.tawkid, '132–134', 'ألفاظ التوكيد المعنوي', 'كُلَّهُ'),
  /* Wave 5. The probe is the word's REAL rendered surface, not its dictionary form: «أَجْمَعُ»
     skeletons to "اجمع", which is letters inside "اجمعون", and the probe-integrity invariant
     rightly refuses to call that a practised term. `requires` ties the surface to the line that
     parses it AS emphasis, so the row can never be satisfied by the word appearing as anything
     else. p. 134 renders it in rafʿ as أَجْمَعُونَ and pp. 132/134 in naṣb/khafḍ as أَجْمَعِينَ. */
  R('T_TAWKID_AJMA', 'أَجْمَعُ', CH.tawkid, '132–134', 'ألفاظ التوكيد المعنوي', 'أَجْمَعُونَ', { requires: 'تَوْكِيدٌ' }),
  R('T_TAWKID_AKTA', 'أَكْتَعُ', CH.tawkid, '132–134', 'ألفاظ التوكيد المعنوي', 'أَكْتَعُونَ', { requires: 'تَوْكِيدٌ' }),
  R('T_TAWKID_ABTA', 'أَبْتَعُ', CH.tawkid, '132–134', 'ألفاظ التوكيد المعنوي', 'أَبْتَعُونَ', { requires: 'تَوْكِيدٌ' }),
  R('T_TAWKID_ABSA', 'أَبْصَعُ', CH.tawkid, '132–134', 'ألفاظ التوكيد المعنوي', 'أَبْصَعُونَ', { requires: 'تَوْكِيدٌ' }),
  R('T_TAWKID_JAMI', 'جَمِيعٌ', CH.tawkid, '132–134', 'ألفاظ التوكيد المعنوي', 'جَمِيعُهُمْ'),
  R('T_BADAL', 'بَدَلٌ تَابِعٌ لِلْمُبْدَلِ مِنْهُ', CH.badal, '135–137', 'التوابع', 'تَابِعٌ لِلْمُبْدَلِ مِنْهُ'),
  R('T_BADAL_KULL', 'بَدَلُ الْكُلِّ مِنَ الْكُلِّ (بَدَلُ الشَّيْءِ مِنَ الشَّيْءِ)', CH.badal, '135–137', 'أقسام البدل', 'بَدَلُ الْكُلِّ مِنَ الْكُلِّ'),
  R('T_BADAL_BAAD', 'بَدَلُ الْبَعْضِ مِنَ الْكُلِّ', CH.badal, '135–137', 'أقسام البدل', 'بَدَلُ الْبَعْضِ مِنَ الْكُلِّ'),
  R('T_BADAL_ISHTIMAL', 'بَدَلُ الِاشْتِمَالِ', CH.badal, '135–137', 'أقسام البدل', 'بَدَلُ الِاشْتِمَالِ'),
  R('T_BADAL_GHALAT', 'بَدَلُ الْغَلَطِ', CH.badal, '135–137', 'أقسام البدل', 'بَدَلُ الْغَلَطِ'),

  // ─────────── MANṢŪBĀT ───────────
  R('B_MAFUL_BIH', 'مَفْعُولٌ بِهِ', CH.mafulBih, '140–145', 'المنصوبات', 'مَفْعُولٌ بِهِ'),
  R('B_MAFUL_MUDMAR_MUTTASIL', 'مَفْعُولٌ بِهِ مُضْمَرٌ مُتَّصِلٌ', CH.mafulBih, '142–145,157', 'أقسام المفعول به', 'مَفْعُولٌ بِهِ مُتَّصِلٌ',
    { missingReason: 'p. 157\'s model parse makes the yāʾ «مفعول به مبني على السكون في محل نصب»; no lane attaches an object pronoun.' }),
  R('B_MAFUL_MUDMAR_MUNFASIL', 'مَفْعُولٌ بِهِ مُضْمَرٌ مُنْفَصِلٌ', CH.mafulBih, '142–145', 'أقسام المفعول به', 'إِيَّاكَ',
    { missingReason: 'The إيّاي/إيّاك series of p. 143 is not produced. Probe tightened from the bare stem «إِيَّا», whose skeleton hid inside «أَيَّانَ» and read FULL while nothing was produced; it now names p.143’s own surface.' }),
  R('B_MAFUL_MUTLAQ', 'مَفْعُولٌ مُطْلَقٌ', CH.mutlaq, '146–147', 'المنصوبات', 'مَفْعُولٌ مُطْلَقٌ'),
  R('B_MUTLAQ_TAWKID', 'الْمُؤَكِّدُ لِعَامِلِهِ', CH.mutlaq, '146–147', 'أقسام المفعول المطلق', 'الْمُؤَكِّدُ لِعَامِلِهِ'),
  R('B_MUTLAQ_NAW', 'الْمُبَيِّنُ لِلنَّوْعِ', CH.mutlaq, '146–147', 'أقسام المفعول المطلق', 'الْمُبَيِّنُ لِلنَّوْعِ'),
  R('B_MUTLAQ_ADAD', 'الْمُبَيِّنُ لِلْعَدَدِ', CH.mutlaq, '146–147', 'أقسام المفعول المطلق', 'الْمُبَيِّنُ لِلْعَدَدِ'),
  R('B_MUTLAQ_LAFZI', 'الْمَصْدَرُ اللَّفْظِيُّ', CH.mutlaq, '147', 'أقسام المصدر', 'لَفْظِيٌّ'),
  R('B_MUTLAQ_MANAWI', 'الْمَصْدَرُ الْمَعْنَوِيُّ', CH.mutlaq, '147', 'أقسام المصدر', 'مَعْنَوِيٌّ'),
  R('B_MAFUL_FIH', 'مَفْعُولٌ فِيهِ مَنْصُوبٌ عَلَى الظَّرْفِيَّةِ', CH.zarf, '148–152', 'المنصوبات', 'عَلَى الظَّرْفِيَّةِ'),
  /* PARTIAL: the term itself is practised, but p. 149–150's own list of time ẓarfs is only
     partly productive here and the unbuilt members have no rows of their own —
     غدًا/أبدًا/أمدًا have no present-tense ʿāmil lane, and غدوة/بكرة/عتمة no host at all. */
  R('B_ZARF_ZAMAN', 'ظَرْفُ زَمَانٍ', CH.zarf, '148–150', 'أقسام الظرف', 'ظَرْفُ زَمَانٍ',
    { partial: { have: 'the ẓarfs with a past-tense host', of: 'the source list of p. 149–150' },
      missingReason: 'deliberatelyNotGenerated withholds غدًا/أبدًا/أمدًا (no truthful past-tense host) and غدوة/بكرة/عتمة (no productive host).' }),
  R('B_ZARF_MAKAN', 'ظَرْفُ مَكَانٍ', CH.zarf, '151–152', 'أقسام الظرف', 'ظَرْفُ مَكَانٍ'),
  R('B_ZARF_THAMMA', 'ثَمَّ', CH.zarf, '151–152', 'ظرف المكان المبني', 'ثَمَّ',
    { mode: 'card', missingReason: 'deliberatelyNotGenerated: "the mabnī place ẓarfs ثَمَّ and هُنَا, which the noun sign matrix does not model".' }),
  R('B_ZARF_HUNA', 'هُنَا', CH.zarf, '151–152', 'ظرف المكان المبني', 'هُنَا',
    { mode: 'card', missingReason: 'Same deferral as ثَمَّ.' }),
  R('B_HAAL', 'حَالٌ مَنْصُوبٌ', CH.haal, '153–157', 'المنصوبات', 'حَالٌ'),
  /* Wave 9. Both aqsām are produced now. The قسم is read off whichever token the frozen frame
     actually yields as the صاحب, so the card reads the way p. 157's own answer key reads:
     «حال مبين لهيئة الفاعل منصوب، وعلامة نصبه الفتحة الظاهرة». The pages field gains 156 because
     p. 156's تمرينات ٢/٣ set the learner the same two labels in the book's own words. */
  R('B_HAAL_FAIL', 'حَالٌ مُبَيِّنٌ لِهَيْئَةِ الْفَاعِلِ', CH.haal, '154,156,157', 'أقسام الحال', 'مُبَيِّنٌ لِهَيْئَةِ الْفَاعِلِ'),
  R('B_HAAL_MAFUL', 'حَالٌ مُبَيِّنٌ لِهَيْئَةِ الْمَفْعُولِ بِهِ', CH.haal, '154,156,157', 'أقسام الحال', 'مُبَيِّنٌ لِهَيْئَةِ الْمَفْعُولِ'),
  R('B_HAAL_ISTIFHAM', 'اسْمُ اسْتِفْهَامٍ مَبْنِيٌّ عَلَى الْفَتْحِ فِي مَحَلِّ نَصْبٍ حَالٌ', CH.haal, '155', 'الحال المبنية', 'فِي مَحَلِّ نَصْبٍ حَالٌ'),
  R('B_TAMYIZ', 'تَمْيِيزٌ مَنْصُوبٌ', CH.tamyiz, '157–161', 'المنصوبات', 'تَمْيِيزٌ'),
  R('B_TAMYIZ_DHAT', 'تَمْيِيزُ ذَاتٍ', CH.tamyiz, '158', 'أقسام التمييز', 'تَمْيِيزُ ذَاتٍ'),
  R('B_TAMYIZ_NISBAH', 'تَمْيِيزُ نِسْبَةٍ', CH.tamyiz, '158–159', 'أقسام التمييز', 'تَمْيِيزُ نِسْبَةٍ'),
  /* Wave 8 — implemented. p. 159 names the three أنواع of المحوَّل and gives each its own
     derivation. The probe is the clause the CARD actually prints, which is how p. 161's own
     model answer parses one: «نفساً: تمييز نسبة محوَّل عن المبتدأ منصوب وعلامة نصبه الفتحة
     الظاهرة» — indefinite «محوَّلٌ», not the dictionary form «المحوَّلُ» the term is named by. */
  R('B_TAMYIZ_MUHAWWAL_FAIL', 'الْمُحَوَّلُ عَنِ الْفَاعِلِ', CH.tamyiz, '159', 'تمييز النسبة', "مُحَوَّلٌ عَنِ الْفَاعِلِ",
    { requires: 'تَمْيِيزُ نِسْبَةٍ' }),
  R('B_TAMYIZ_MUHAWWAL_MAFUL', 'الْمُحَوَّلُ عَنِ الْمَفْعُولِ', CH.tamyiz, '159', 'تمييز النسبة', "مُحَوَّلٌ عَنِ الْمَفْعُولِ",
    { requires: 'تَمْيِيزُ نِسْبَةٍ' }),
  R('B_TAMYIZ_MUHAWWAL_MUBTADA', 'الْمُحَوَّلُ عَنِ الْمُبْتَدَأِ', CH.tamyiz, '159,161', 'تمييز النسبة', "مُحَوَّلٌ عَنِ الْمُبْتَدَأِ",
    { requires: 'تَمْيِيزُ نِسْبَةٍ' }),
  R('B_MUSTATHNA', 'مُسْتَثْنًى مَنْصُوبٌ', CH.istithna, '162–165', 'المنصوبات', 'مُسْتَثْنًى'),
  R('B_ILLA', 'إِلَّا — حَرْفُ اسْتِثْنَاءٍ', CH.istithna, '162–163', 'أدوات الاستثناء', 'حَرْفُ اسْتِثْنَاءٍ'),
  R('B_GHAYR', 'غَيْرَ — اسْمُ اسْتِثْنَاءٍ', CH.istithna, '164–165', 'أدوات الاستثناء', 'اسْمُ اسْتِثْنَاءٍ'),
  R('B_ISTITHNA_TAMM_MANFI', 'الْمُسْتَثْنَى مِنْ كَلَامٍ تَامٍّ مَنْفِيٍّ', CH.istithna, '164', 'أقسام الاستثناء', 'تَامٍّ مَنْفِيٍّ'),
  /* WAVE 6 — TERMINOLOGY CORRECTION, not a new row and not a deletion. This row was authored as
     «الِاسْتِثْنَاءُ الْمُفَرَّغُ» with a probe on «الْمُفَرَّغُ». That word appears NOWHERE in pp. 162–165.
     What the book DOES teach, in full, is the same regime under its own name: p. 163's third of
     «ثَلَاثَةَ أَحْوَالٍ», and p. 164's «وَإِنْ كَانَ الْكَلَامُ السَّابِقُ نَاقِصًا … كَانَ الْمُسْتَثْنَى عَلَى حَسَبِ مَا
     قَبْلَ إِلَّا مِنَ الْعَوَامِلِ», with all three of its ʿāmil readings and an example of each. So this is
     the OPPOSITE of the Wave-5 كِلَا case: there the row was fiction and had to go; here the row is
     source-backed and only its NAME was imported from a later tradition. Renamed to the source's
     own wording, with the probe following the name. Verified bidirectionally from the page images:
     «مفرغ» absent from the whole bāb; «ناقص» present on pp. 163, 164 and 165 as the technical term
     for exactly this regime. */
  R('B_ISTITHNA_NAQIS', 'الْمُسْتَثْنَى مِنْ كَلَامٍ نَاقِصٍ', CH.istithna, '163–164', 'أقسام الاستثناء', 'كَلَامٍ نَاقِصٍ'),
  R('B_ISTITHNA_SIWA', 'سِوًى / سُوًى / سَوَاءٌ', CH.istithna, '164–165', 'أدوات الاستثناء', 'سِوَى'),
  R('B_ISTITHNA_KHALA', 'خَلَا / عَدَا / حَاشَا', CH.istithna, '165', 'أدوات الاستثناء', 'حَاشَا'),
  R('B_LA_JINS', 'لَا النَّافِيَةُ لِلْجِنْسِ', CH.laJins, '166–167', 'المنصوبات', 'لَا النَّافِيَةُ لِلْجِنْسِ'),
  R('B_ISM_LA_MUDAF', 'اسْمُ لَا مَنْصُوبٌ (الْمُضَافُ)', CH.laJins, '166–167', 'اسم لا', 'اسْمُ «لَا»'),
  R('B_KHABAR_LA', 'خَبَرُ لَا مَرْفُوعٌ', CH.laJins, '166', 'خبر لا', 'خَبَرُ «لَا»'),
  /* WAVE 10. Both of the old missingReasons here said "deliberatelyNotGenerated", which — as
     Wave 7 established — is a SCOPE decision, not a source finding, and both turned out to be
     stale. The bināʾ one had been true when it was written and stopped being true three waves
     later; the شبيه one mistook the sharḥ's EXAMPLE for its definition. Read the page, not the
     note. The نوع is now printed in the combined block, exactly as the المنادى chapter's is, so
     each of these is a term the learner actually sees. */
  R('B_ISM_LA_MUFRAD', 'اسْمُ لَا الْمُفْرَدُ مَبْنِيٌّ عَلَى مَا يُنْصَبُ بِهِ', CH.laJins, '166–167', 'اسم لا', 'الْمُفْرَدُ',
    { requires: 'لِلْجِنْسِ' }),
  R('B_ISM_LA_SHABIH', 'اسْمُ لَا الشَّبِيهُ بِالْمُضَافِ', CH.laJins, '167', 'اسم لا', 'الشَّبِيهُ بِالْمُضَافِ',
    { requires: 'لِلْجِنْسِ' }),
  /* WAVE 10 COUNTING CORRECTION — see `notCounted`. تكرار «لا» is the FOURTH of the four شروط
     p. 166 lists («والرابع: ألّا تتكرر لا»), i.e. a condition on the government, and no learner
     ever utters it while parsing. Both of the readings repetition permits are already rows. */
  /* WAVE 10 RENAME, on the Wave-6 precedent: the row is real and the source teaches it in full,
     but «إلغاء» is the name of the RULE, and what p. 167 actually puts in an iʿrāb is «و«لا»:
     نافية مهملة». Renamed to the source's own uttered wording; the key is kept, because the row
     was never fiction — only its name came from the rule rather than from the parse. */
  R('B_LA_ILGHA', 'لَا النَّافِيَةُ الْمُهْمَلَةُ', CH.laJins, '167', 'إلغاء عمل لا', 'مُهْمَلَةٌ'),
  R('B_MUNADA', 'مُنَادًى', CH.munada, '168–170', 'المنصوبات', 'مُنَادًى'),
  R('B_NIDA', 'يَا — حَرْفُ نِدَاءٍ', CH.munada, '168', 'أدوات النداء', 'حَرْفُ نِدَاءٍ'),
  R('B_MUNADA_MUFRAD_ALAM', 'الْمُفْرَدُ الْعَلَمُ', CH.munada, '168–169', 'أقسام المنادى', 'الْمُفْرَدُ الْعَلَمُ'),
  R('B_MUNADA_NAKIRA_MAQSUDA', 'النَّكِرَةُ الْمَقْصُودَةُ', CH.munada, '168–169', 'أقسام المنادى', 'النَّكِرَةُ الْمَقْصُودَةُ'),
  R('B_MUNADA_NAKIRA_GHAYR', 'النَّكِرَةُ غَيْرُ الْمَقْصُودَةِ', CH.munada, '168–170', 'أقسام المنادى', 'النَّكِرَةُ غَيْرُ الْمَقْصُودَةِ'),
  R('B_MUNADA_MUDAF', 'الْمُضَافُ', CH.munada, '168–170', 'أقسام المنادى', 'وَنَوْعُهُ الْمُضَافُ'),
  R('B_MUNADA_SHABIH', 'الشَّبِيهُ بِالْمُضَافِ', CH.munada, '168–170', 'أقسام المنادى', 'الشَّبِيهُ بِالْمُضَافِ'),
  R('B_MUNADA_MABNI_DAMM', 'مَبْنِيٌّ عَلَى الضَّمِّ فِي مَحَلِّ نَصْبٍ', CH.munada, '169', 'بناء المنادى', 'مَبْنِيٌّ عَلَى الضَّمِّ'),
  /* Wave 7 — implemented. p. 169: «وإن كان يرفع بالألف نيابة عن الضمة — وذلك المثنى — فإنه يبنى
     على الألف، نحو: يا محمدان ويا فاطمتان». The discriminator is «مُنَادًى» in the same rendered
     line, because the alif is also an ordinary iʿrāb sign elsewhere in the app. */
  R('B_MUNADA_MABNI_ALIF', 'مَبْنِيٌّ عَلَى الْأَلِفِ (الْمُثَنَّى)', CH.munada, '169', 'بناء المنادى', "مَبْنِيٌّ عَلَى الْأَلِفِ",
    { requires: 'مُنَادًى' }),
  /* pp. 169–170: «وإن كان يُرفع بالواو نيابة عن الضمة — وذلك جمع المذكر السالم — فإنه يبنى على
     الواو نحو: يا محمدون». */
  R('B_MUNADA_MABNI_WAW', 'مَبْنِيٌّ عَلَى الْوَاوِ (جَمْعُ الْمُذَكَّرِ السَّالِمُ)', CH.munada, '169–170', 'بناء المنادى', "مَبْنِيٌّ عَلَى الْوَاوِ",
    { requires: 'مُنَادًى' }),
  /* Wave 7 — the four sisters p. 168 names, each now produced on that page's OWN example for it:
     «أَزَيْدُ أَقْبِلْ»، «أَيْ إبراهيمُ تَفَهَّمْ»، «أَيَا شَجَرَ الْخَابُورِ»، «هيا مُحَمَّدُ تَعَالَ». Each probe
     is the particle's own naming clause, which is what separates it from its sisters — the bare
     surfaces are too short to probe safely. */
  R('B_NIDA_HAMZA', 'الْهَمْزَةُ — حَرْفُ نِدَاءٍ', CH.munada, '168', 'أدوات النداء', "الْهَمْزَةُ لِلنِّدَاءِ"),
  R('B_NIDA_AY', 'أَيْ — حَرْفُ نِدَاءٍ', CH.munada, '168', 'أدوات النداء', "«أَيْ» لِلنِّدَاءِ"),
  R('B_NIDA_AYA', 'أَيَا — حَرْفُ نِدَاءٍ', CH.munada, '168', 'أدوات النداء', "«أَيَا» لِلنِّدَاءِ"),
  R('B_NIDA_HAYA', 'هَيَا — حَرْفُ نِدَاءٍ', CH.munada, '168', 'أدوات النداء', "«هَيَا» لِلنِّدَاءِ"),
  R('B_MAFUL_AJL', 'مَفْعُولٌ لِأَجْلِهِ مَنْصُوبٌ', CH.mafulAjl, '170–172', 'المنصوبات', 'مَفْعُولٌ لِأَجْلِهِ'),
  R('B_MAFUL_AJL_AL', 'الْمَفْعُولُ لَهُ الْمُقْتَرِنُ بِأَلْ', CH.mafulAjl, '172', 'أقسام المفعول له', 'الْمُقْتَرِنُ بِأَلْ',
    { missingReason: 'deliberatelyNotGenerated: p. 172 makes khafḍ the more frequent reading there.' }),
  R('B_MAFUL_AJL_MUDAF', 'الْمَفْعُولُ لَهُ الْمُضَافُ', CH.mafulAjl, '172', 'أقسام المفعول له', 'الْمَفْعُولُ لَهُ الْمُضَافُ',
    { missingReason: 'deliberatelyNotGenerated: naṣb and khafḍ equally permissible.' }),
  R('B_MAFUL_MAAH', 'مَفْعُولٌ مَعَهُ مَنْصُوبٌ', CH.mafulMaah, '172–173', 'المنصوبات', 'مَفْعُولٌ مَعَهُ'),
  R('B_WAW_MAIYYA_MAAH', 'وَاوُ الْمَعِيَّةِ الدَّاخِلَةُ عَلَى الْمَفْعُولِ مَعَهُ', CH.mafulMaah, '172–173', 'المفعول معه', 'وَاوُ الْمَعِيَّةِ'),
  R('B_MAAH_ATF', 'الْعَطْفُ فِي مَوْضِعِ الْمَفْعُولِ مَعَهُ', CH.mafulMaah, '173', 'المفعول معه', 'الْعَطْفُ عَلَى مَا قَبْلَهُ',
    { missingReason: 'deliberatelyNotGenerated: p. 173 permits BOTH naṣb and ʿaṭf.' }),
  R('B_MAAH_ISM_FAIL', 'الْمَفْعُولُ مَعَهُ عَامِلُهُ اسْمُ فَاعِلٍ', CH.mafulMaah, '173', 'المفعول معه', 'عَامِلُهُ اسْمُ فَاعِلٍ',
    { missingReason: 'deliberatelyNotGenerated: (الأمير حاضر والجيشَ).' }),

  // ─────────── MAKHFŪḌĀT ───────────
  R('X_MAKHFUD_HARF', 'الْمَخْفُوضُ بِالْحَرْفِ', CH.makhfudat, '174–177', 'المخفوضات', 'حَرْفُ خَفْضٍ'),
  R('X_MAKHFUD_IDAFA', 'الْمَخْفُوضُ بِالْإِضَافَةِ', CH.makhfudat, '174–178', 'المخفوضات', 'مُضَافٌ إِلَيْهِ'),
  R('X_MUDAF', 'مُضَافٌ', CH.makhfudat, '177–178', 'الإضافة', 'وَهُوَ مُضَافٌ'),
  R('X_PREP_MIN', 'مِنْ', CH.makhfudat, '13,175–176', 'حروف الخفض', 'مِنْ', { mode: 'prep' }),
  R('X_PREP_ILA', 'إِلَى', CH.makhfudat, '175–176', 'حروف الخفض', 'إِلَى', { mode: 'prep' }),
  R('X_PREP_AN', 'عَنْ', CH.makhfudat, '175–176', 'حروف الخفض', 'عَنْ', { mode: 'prep' }),
  R('X_PREP_ALA', 'عَلَى', CH.makhfudat, '175–176', 'حروف الخفض', 'عَلَى', { mode: 'prep' }),
  R('X_PREP_FI', 'فِي', CH.makhfudat, '175–176', 'حروف الخفض', 'فِي', { mode: 'prep' }),
  R('X_PREP_RUBBA', 'رُبَّ', CH.makhfudat, '13,175–176', 'حروف الخفض', 'رُبَّ', { mode: 'prep' }),
  R('X_PREP_BA', 'الْبَاءُ', CH.makhfudat, '13,175–176', 'حروف الخفض', 'بِ', { mode: 'prep' }),
  R('X_PREP_KAF', 'الْكَافُ', CH.makhfudat, '13,175–176', 'حروف الخفض', 'كَ', { mode: 'prep' }),
  R('X_PREP_LAM', 'اللَّامُ', CH.makhfudat, '13,175–176', 'حروف الخفض', 'لِ', { mode: 'prep' }),
  R('X_PREP_WAW_QASAM', 'وَاوُ الْقَسَمِ', CH.makhfudat, '13,176–177', 'حروف القسم', 'وَاوُ الْقَسَمِ'),
  R('X_PREP_BA_QASAM', 'بَاءُ الْقَسَمِ', CH.makhfudat, '13,176–177', 'حروف القسم', 'بَاءُ الْقَسَمِ'),
  R('X_PREP_TA_QASAM', 'تَاءُ الْقَسَمِ', CH.makhfudat, '13,176–177', 'حروف القسم', 'تَاءُ الْقَسَمِ'),
  R('X_PREP_MUDH', 'مُذْ', CH.makhfudat, '176–177', 'حروف الخفض', 'مُذْ', { mode: 'prep' }),
  R('X_PREP_MUNDHU', 'مُنْذُ', CH.makhfudat, '176–177', 'حروف الخفض', 'مُنْذُ', { mode: 'prep' }),
  R('X_PREP_HATTA', 'حَتَّى الْجَارَّةُ', CH.makhfudat, '127', 'حروف الخفض', 'حَتَّى', { mode: 'prep' }),
  R('X_IDAFA_LAM', 'الْإِضَافَةُ عَلَى مَعْنَى اللَّامِ', CH.makhfudat, '177–178', 'معاني الإضافة', 'عَلَى مَعْنَى اللَّامِ'),
  R('X_IDAFA_MIN', 'الْإِضَافَةُ عَلَى مَعْنَى «مِنْ»', CH.makhfudat, '177–178', 'معاني الإضافة', 'عَلَى مَعْنَى مِنْ'),
  R('X_IDAFA_FI', 'الْإِضَافَةُ عَلَى مَعْنَى «فِي»', CH.makhfudat, '177–178', 'معاني الإضافة', 'عَلَى مَعْنَى فِي'),

  // ─────────── PARTICLE IDENTITIES ALREADY PRODUCED ───────────
  R('P_SAWFA', 'سَوْفَ — حَرْفُ اسْتِقْبَالٍ', CH.foundations, '14–16', 'علامات الفعل', 'حَرْفُ اسْتِقْبَالٍ'),
  R('P_SIN', 'السِّينُ — حَرْفٌ دَالٌّ عَلَى التَّنْفِيسِ', CH.foundations, '14–16,95', 'علامات الفعل', 'التَّنْفِيسِ',
    { missingReason: 'p. 95\'s model parse names «السين حرف دال على التنفيس»; only سوف is produced.' }),
  R('P_HAMZAT_ISTIFHAM', 'هَمْزَةُ الِاسْتِفْهَامِ', CH.atf, '126', 'أدوات الاستفهام', 'هَمْزَةُ الِاسْتِفْهَامِ'),
  R('P_LA_NAFIYA', 'لَا — حَرْفُ نَفْيٍ', CH.nawasib, '76–77', 'حروف النفي', 'حَرْفُ نَفْيٍ مَبْنِيٌّ'),
  R('P_MA_NAFIYA', 'مَا — حَرْفُ نَفْيٍ', CH.nawasib, '76', 'حروف النفي', 'حَرْفُ نَفْيٍ مَبْنِيٌّ')
];

/* Terms this source does NOT teach. A curriculum derived only from this book cannot keep them
   as targets, so they are NOT rows and NOT in the denominator. Verified by reading pp. 153–157. */
const sourceExcluded = [
  { term: 'حَالٌ جُمْلَةٌ', reason: 'pp. 153–157 never divide the ḥāl into مفرد/جملة/شبه جملة the way p. 102 divides the khabar. The sentence-shaped ḥāl of p. 154 is analysed as الاسم المؤول بالصريح («في تأويل ضاحكًا»).' },
  { term: 'جُمْلَةٌ فِي مَحَلِّ نَصْبٍ حَالٌ', reason: 'Never stated. The only «في محل نصب» in the chapter is p. 155\'s interrogative كَيْفَ, which IS built.' },
  { term: 'حَالٌ شِبْهُ جُمْلَةٍ', reason: 'Never stated in this chapter.' },
  { term: 'وَاوُ الْحَالِ', reason: 'The ḥāl chapter teaches no waw al-ḥāl.' },
  { term: 'الرَّابِطُ لِلْحَالِ', reason: 'No rābiṭ is required of the ḥāl in this source; the rābiṭ belongs to the sentence khabar of p. 102.' },
  /* Wave 5. Both were carried as tawkīd rows whose missingReason ASSERTED that «p. 132 lists» them.
     p. 132 does not. The matn's enumeration is closed and complete — «وَيَكُونُ بِأَلْفَاظٍ مَعْلُومَةٍ،
     وَهِيَ: النَّفْسُ، وَالْعَيْنُ، وَكُلٌّ، وَأَجْمَعُ، وَتَوَابِعُ أَجْمَعَ، وَهِيَ: أَكْتَعُ، وَأَبْتَعُ، وَأَبْصَعُ» — and
     the شرح adds exactly one word to it, جَمِيع, as كُلّ's like. Neither كِلَا/كِلْتَا nor عَامَّة appears
     anywhere in pp. 131–135, and pp. 35–36 define المثنى with no مُلحقات either, so كِلَا is not
     taught by this book at all. Both belong to the LONGER lists of other books (Ibn ʿAqīl on the
     Alfiyyah), and importing a larger taxonomy is exactly what this inventory exists to prevent.
     Verified by reading the complete bāb from the page images, not from the old comment. */
  { term: 'كِلَا وَكِلْتَا', reason: 'Not among ألفاظ التوكيد in this source. pp. 131–135 enumerate النفس، العين، كل، أجمع، أكتع، أبتع، أبصع (matn) plus جميع (شرح), and no more; pp. 35–36 define المثنى without ملحقات, so this book never teaches كلا/كلتا in any role. The row\'s previous missingReason cited a p. 132 listing that is not there.' },
  { term: 'عَامَّةٌ', reason: 'Not among ألفاظ التوكيد in this source; it appears nowhere in pp. 131–135. Its row likewise cited a p. 132 listing that is not there. It is an addition of the longer Alfiyyah-tradition lists, not of this matn or its شرح.' },
  /* Wave 6. The one row of باب الاستثناء that this book does not teach, and the proof runs in BOTH
     directions rather than resting on the word's absence alone:
       · NEGATIVE — «منقطع» (and «متصل», its pair) appear nowhere in pp. 162–165. The whole bāb was
         read from the page images: p. 162 defines الاستثناء and sorts the eight أدوات into three
         أنواع; p. 163 gives the noun after «إلا» its three أحوال; p. 164 works through all three and
         then treats the four اسم أدوات; p. 165 treats خلا وأخواتها and closes with أسئلة. No division
         of الاستثناء into متصل/منقطع occurs at any point.
       · POSITIVE — p. 162's own definition EXCLUDES it. The book defines the bāb as «الإخراج بإلا
         أو إحدى أخواتها، لشيءٍ لولا ذلك الإخراجُ لكان داخلاً فيما قبل الأداة»: the excepted thing is one
         that WOULD have been inside had it not been excepted. الاستثناء المنقطع is by construction
         the case where it would not have been, so it falls outside the definition this book gives,
         not merely outside its examples.
     A term this source does not teach is not a blocked target; it is not in the curriculum. */
  { term: 'الِاسْتِثْنَاءُ الْمُنْقَطِعُ', reason: 'Absent from pp. 162–165 in both name and case, and positively excluded by the definition p. 162 gives the bāb: «لشيءٍ لولا ذلك الإخراجُ لكان داخلاً فيما قبل الأداة» requires الاتصال, which is exactly what a منقطع exception lacks. The row’s previous missingReason — «the excepted noun is not part of the group» — was in fact a statement of why this source cannot teach it.' }
];

/* Source-backed facts that are NOT sayable in an iʿrāb, so they are not rows.
   Recorded so the decision is auditable rather than silent. */
const notCounted = [
  { term: 'أقسام ظنّ الأربعة: التَّرْجِيح / الْيَقِين / التَّصْيِير / النِّسْبَة فِي السَّمْع', pages: '111', reason: 'A semantic classification OF the ten sisters. A learner parsing «ظننت زيدًا قائمًا» says مفعول أول / مفعول ثانٍ, never «الترجيح». Confirmed: these labels appear in the Why corpus and never in the iʿrāb corpus.' },
  { term: 'أقسام كان من جهة العمل والتصرف (3+3)', pages: '108', reason: 'Facts about which sisters work under which condition; not uttered in an iʿrāb.' },
  { term: 'مُخْتَصٌّ / مُبْهَمٌ', pages: '148–152', reason: 'A rule about WHICH nouns may be ẓarfs. The iʿrāb says «ظرف زمان منصوب», not «مختص».' },
  /* Wave 8 CORRECTION. p. 158 states this as ONE enumeration — «ويكون بعد العَدَد … أو بعد
     المقادير، من الموزونات … أو المَكِيلَاتِ … أو المساحات» — and all four members have the same
     status: they name what a tamyīz al-dhāt FOLLOWS, not what the learner calls the tamyīz.
     The book's own model iʿrāb of exactly these constructions (p. 161) reads «ذراعاً: تمييز
     لعشرين، منصوب بالفتحة الظاهرة» and «حريراً: تمييز لذراع» — it names the mumayyaz, never the
     category. Contrast p. 161's other model answer, «نفساً: تمييز نسبة محوَّل عن المبتدأ
     منصوب», which utters its classification verbatim and therefore IS a row. المكيلات and
     الموزونات were already here; العدد and المساحات had rows, which split one list in two. */
  { term: 'الْعَدَدُ / الْمَوْزُونَات / الْمَكِيلَات / الْمِسَاحَات', pages: '158', reason: 'The four positions p. 158 says a tamyīz al-dhāt may follow. Not iʿrāb terms: the source’s own model answers at p. 161 parse these very constructions as «تمييز لعشرين» and «تمييز لذراع», naming the mumayyaz. All four are taught in the Why corpus; the three مقادير are additionally productive, and the number position is not — 11–99 need the bināʾ of أحد عشر or the ملحق-by-SMP signs of عشرين, morphology this engine does not model.' },
  { term: 'تَمْيِيزُ الْمُفْرَدِ / تَمْيِيزُ الْجُمْلَةِ', pages: '158', reason: 'Alternative NAMES for تمييز ذات / تمييز نسبة, which already have rows. Counting both would double-count one target.' },
  /* Wave 9 CORRECTION. Both were carried as ḥāl rows, and both are genuinely in the source — but
     both belong to the sharḥ's gloss OF ITS OWN DEFINITION, not to any parse. p. 153 gives the
     definition as «الاسم، الفضلة، المنصوب، المُفَسِّر لما انبهم من الهيئات», and p. 154 then walks the
     four qayds one at a time, each opening «وقولنا: "X"». الفضلة and المؤول بالصريح are two of those
     glosses. The test that settles it is the one Wave 8 established: p. 157's own «تدريب على
     الإعراب» parses two ḥāl sentences in full and says «حال مبين لهيئة الفاعل منصوب بالفتحة
     الظاهرة» — no فضلة, no تأويل. Contrast «مبين لهيئة …», which that same answer key utters
     verbatim and which therefore keeps its rows. Note the qayd «المنصوب» is not a third deletion:
     the state IS uttered, and B_HAAL already carries it. */
  { term: 'الْفَضْلَةُ', pages: '153–154', reason: 'One of the four qayds of the sharḥ’s definition (p. 153), glossed at p. 154 as «ليس جزءاً من الكلام؛ فخرج به الخبر» — a statement of what the definition excludes, not a word the learner utters. p. 157’s own model answers parse a ḥāl as «حال مبين لهيئة الفاعل منصوب بالفتحة الظاهرة» with no فضلة in the line. The idea is enforced structurally (a ḥāl frame already has its fāʿil) and explained in the Why; it is not a separate direct target.' },
  /* Wave 10 CORRECTION. تكرار «لا» was carried as a row of باب «لا». It is genuinely in the source
     — p. 166 makes it the fourth of the four شروط of obligatory government, «والرابع: ألّا تتكرر
     "لا"», and p. 167 rules on it twice more — but it is a CONDITION on the government, not a term
     anyone says while parsing. The Wave-8 test settles it: the only iʿrāb this bāb performs is
     p. 167's «فـ«غَوْلٌ»: مبتدأٌ مؤخَّرٌ، وفيها: متعلق بمحذوف خبر مقدّم، و«لا» نافية مهملة» — «مهملة»
     is uttered and is a row; «تكرار» is not uttered anywhere. And repetition adds no third analysis:
     p. 167–168's own minimal pair «لَا رَجُلَ في الدار ولا امْرَأَةَ» / «لا رَجُلٌ في الدار ولا
     امْرَأَةٌ» resolves into the two readings this inventory ALREADY counts — the built اسم لا on the
     إعمال side, the نافية المهملة on the إلغاء side. */
  { term: 'تَكْرَارُ «لَا»', pages: '166–167', reason: 'The fourth of the four شروط of obligatory government (p. 166), and the thing p. 167 makes obligatory alongside الإلغاء. A condition, never a sayable iʿrāb term: the bāb’s own model parse utters «نافية مهملة» and no form of «تكرار». It stays TAUGHT — the cancelled-لا Why and combined block both state that repetition is obligatory, and the frame proves it structurally by carrying two «لا»s — and its two permitted readings are already counted as B_ISM_LA_MUFRAD and B_LA_ILGHA.' },
  { term: 'الِاسْمُ الْمُؤَوَّلُ بِالصَّرِيحِ', pages: '154', reason: 'Appears only inside the gloss of the qayd «الاسم»: «يشمل الصريح مثل ضاحكاً … ويشمل المؤول بالصريح مثل يَضْحَكُ … فإنه في تأويل ضاحكاً». It names how a sentence-shaped ḥāl is UNDERSTOOD, and the chapter never parses يضحك with it — nor with any modern حال جملة label, which is separately source-excluded. p. 158 confirms the direction of the contrast from the tamyīz side: «وقولنا الصريح لإخراج الاسم المؤول … بخلاف الحال كما سبق». Explanatory analysis, not a sayable iʿrāb term.' }
];

module.exports = { rows, sourceExcluded, notCounted, CH };
