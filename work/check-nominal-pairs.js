const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

const file=process.argv[2]||'index.html';
const durationMs=Number(process.argv[3]||0);
const html=fs.readFileSync(file,'utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/);
if(!match)throw new Error('No embedded application script found');
let script=match[1];
const staticIds=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
assert(new Set(staticIds).size===staticIds.length,'The HTML contains a duplicate id');
for(const id of new Set([...script.matchAll(/byId\('([^']+)'\)/g)].map(match=>match[1]))){
  assert(staticIds.includes(id),`JavaScript references missing HTML element #${id}`);
}
const exportNeedle='window.nahwGenerate=generate;';
if(!script.includes(exportNeedle))throw new Error('Generator export point was not found');
script=script.replace(exportNeedle,`window.__nahwTest={
  templates:templates.map(({id,stableId,starts,form,sign})=>({id,stableId,starts,form,sign})),
  buildTemplate:id=>completeNominalAnalysis(templates[id].build()),
  completeNominalAnalysis,
  poolFor,
  grammarDefinitionGroups,
  GRAMMAR_RULES,
  GRAMMAR_COVERAGE_MATRIX,
  grammarDiagnostics,
  validateExercise,
  inflectFiveVerb,
  makeToken:token,
  specs:AR,
  verbs,
  generalVerbActions,
  nounLexicons:{singularPeople,singularThings,places,brokenHuman,brokenThings,duals,smp,sfp,fiveNouns,singularPredicates,dualPredicates,masculinePluralPredicates,femininePluralPredicates,masculineThingPredicates,feminineThingPredicates,ownedNouns},
  verbLexicons:{verbs,additionalVerbActions,humanActions,humanPrepActions,thingActions,thingPrepActions,femininePastActions,brokenObjectActions},
  objectGroups
};\n${exportNeedle}`);

function assert(condition,message){if(!condition)throw new Error(message)}
function element(id,value=''){
  const classes=new Set();
  const listeners=new Map();
  const attributes=new Map();
  return {
    id,value,textContent:'',innerHTML:'',className:'',options:[],hidden:false,disabled:false,
    classList:{
      add:name=>classes.add(name),remove:name=>classes.delete(name),
      contains:name=>classes.has(name),
      toggle:name=>classes.has(name)?(classes.delete(name),false):(classes.add(name),true)
    },
    addEventListener(type,handler){listeners.set(type,handler)},
    dispatch(type){const handler=listeners.get(type);if(handler)handler({target:this})},
    setAttribute(name,value){attributes.set(name,String(value))},
    getAttribute(name){return attributes.get(name)??null}
  };
}

const optionValues={
  startFilter:['any','noun','verb','particle'],
  formFilter:['any','singular','broken','dual','smp','sfp','fiveNouns','present','fiveVerbs'],
  signFilter:['any','damma','fatha','kasra','sukun','alif','waw','ya','kasraSub','nunKept','nunDropped']
};
const elements={
  startFilter:element('startFilter','any'),formFilter:element('formFilter','any'),
  signFilter:element('signFilter','any'),sentence:element('sentence'),translation:element('translation'),
  answers:element('answers'),answerPanel:element('answerPanel'),revealBtn:element('revealBtn'),
  status:element('status'),newBtn:element('newBtn'),nextBtn:element('nextBtn'),
  historyToggle:element('historyToggle'),historyPanel:element('historyPanel'),
  historyList:element('historyList'),historyEmpty:element('historyEmpty'),
  clearHistoryBtn:element('clearHistoryBtn'),definitionsToggle:element('definitionsToggle'),
  definitionsPanel:element('definitionsPanel'),definitionsList:element('definitionsList')
};
for(const [id,values] of Object.entries(optionValues)){
  elements[id].options=values.map(value=>({value,disabled:false}));
}
const storage=new Map([['nahw-sentence-history-v1',JSON.stringify([
  {sentence:'جُمْلَةٌ سَابِقَةٌ',translation:'A previously saved sentence.'}
])]]);
const localStorage={
  getItem:key=>storage.has(key)?storage.get(key):null,
  setItem:(key,value)=>storage.set(key,String(value)),
  removeItem:key=>storage.delete(key)
};
const context={
  console,crypto:webcrypto,Uint32Array,Map,Set,Array,Object,String,Number,Math,RangeError,Error,RegExp,
  localStorage,document:{getElementById:id=>elements[id]}
};
context.window=context;
context.globalThis=context;
vm.createContext(context);
vm.runInContext(script,context,{filename:'index.html'});

const api=context.__nahwTest;
assert(api&&typeof api.completeNominalAnalysis==='function','Nominal validator was not exported to the test harness');
assert(elements.sentence.textContent,'The application did not generate its initial sentence');
assert(elements.historyToggle.textContent==='Sentence history (2)','Saved history was not loaded before recording the initial sentence');
assert(elements.historyList.innerHTML.includes('جُمْلَةٌ سَابِقَةٌ'),'Previously saved sentence is missing from history');
assert(JSON.parse(storage.get('nahw-sentence-history-v1')).length===2,'Initial sentence was not persisted');
elements.historyToggle.dispatch('click');
assert(elements.historyPanel.classList.contains('open'),'History tab did not open its panel');
assert(elements.historyToggle.getAttribute('aria-expanded')==='true','History tab did not expose its open state');
elements.nextBtn.dispatch('click');
assert(elements.historyToggle.textContent==='Sentence history (3)','New Sentence was not added to history');
elements.clearHistoryBtn.dispatch('click');
assert(elements.historyToggle.textContent==='Sentence history (0)','Clear history did not reset its count');
assert(elements.historyList.hidden&& !elements.historyEmpty.hidden,'Clear history did not restore the empty state');
assert(JSON.parse(storage.get('nahw-sentence-history-v1')).length===0,'Cleared history was not persisted');
const definitionItems=api.grammarDefinitionGroups.flatMap(group=>group.items);
assert(api.grammarDefinitionGroups.length===5,'Expected five definition groups');
assert(definitionItems.length===65,`Expected 65 grammar definitions, found ${definitionItems.length}`);
assert(definitionItems.every(item=>item.arTerm&&item.enTerm&&item.ar&&item.en),'A grammar definition is incomplete');
assert(new Set(definitionItems.map(item=>item.arTerm)).size===definitionItems.length,'Two Arabic definition terms are duplicated');
assert(new Set(definitionItems.map(item=>item.enTerm)).size===definitionItems.length,'Two English definition terms are duplicated');
for(const required of ['Noun (ism)','Verb (fiʿl)','Particle (ḥarf)','Singular noun','Mubtadaʾ','Khabar','Direct object','Kāna and its sisters','Ism of kāna','Khabar of kāna']){
  assert(definitionItems.some(item=>item.enTerm===required),`Missing required definition: ${required}`);
}
assert(elements.definitionsToggle.textContent==='Simple grammar definitions (65)','Definition count was not rendered');
assert((elements.definitionsList.innerHTML.match(/class="definition-card"/g)||[]).length===65,'Not every definition was rendered');
assert(elements.definitionsList.innerHTML.includes('التُّحْفَة')===false,'Source note was unexpectedly duplicated inside the definition list');
assert(html.includes('https://islamhouse.com/ar/books/334271'),'The Al-Tuhfah al-Saniyyah source link is missing');
elements.definitionsToggle.dispatch('click');
assert(elements.definitionsPanel.classList.contains('open'),'Definitions tab did not open its panel');
assert(elements.definitionsToggle.getAttribute('aria-expanded')==='true','Definitions tab did not expose its open state');

const mainNounKinds=['singularPeople','singularThings','places','brokenHuman','brokenThings','duals','smp','sfp','fiveNouns'];
const mainNounEntries=mainNounKinds.flatMap(name=>api.nounLexicons[name]);
assert(mainNounEntries.length===200,`Structured noun audit found ${mainNounEntries.length} entries instead of 200`);
const repeatedNounMeanings=[...new Set(mainNounEntries.map(item=>item.en).filter((meaning,index,all)=>all.indexOf(meaning)!==index))];
assert(repeatedNounMeanings.length===0,`The 200 main noun entries repeat: ${repeatedNounMeanings.join(', ')}`);
for(const name of ['singularPeople','singularThings','places','brokenHuman','brokenThings']){
  for(const noun of api.nounLexicons[name]){
    assert(noun.nom.endsWith('ُ'),`${name}/${noun.en}: nominative form lacks ḍammah`);
    assert(noun.acc.endsWith('َ'),`${name}/${noun.en}: accusative form lacks fatḥah`);
    assert(noun.gen.endsWith('ِ'),`${name}/${noun.en}: genitive form lacks kasrah`);
  }
}
for(const noun of api.nounLexicons.duals){
  assert(noun.nom.endsWith('َانِ'),`${noun.en}: dual nominative form is malformed`);
  assert(noun.acc.endsWith('َيْنِ')&&noun.gen.endsWith('َيْنِ'),`${noun.en}: dual accusative/genitive form is malformed`);
}
for(const noun of api.nounLexicons.smp){
  assert(noun.nom.endsWith('ُونَ'),`${noun.en}: sound masculine plural nominative is malformed`);
  assert(noun.acc.endsWith('ِينَ')&&noun.gen.endsWith('ِينَ'),`${noun.en}: sound masculine plural accusative/genitive is malformed`);
}
for(const noun of api.nounLexicons.sfp){
  assert(noun.nom.endsWith('َاتُ'),`${noun.en}: sound feminine plural nominative is malformed`);
  assert(noun.acc.endsWith('َاتِ')&&noun.gen.endsWith('َاتِ'),`${noun.en}: sound feminine plural accusative/genitive is malformed`);
}
for(const noun of api.nounLexicons.fiveNouns){
  assert(noun.nom.endsWith('ُوكَ')&&noun.acc.endsWith('َاكَ')&&noun.gen.endsWith('ِيكَ'),`${noun.en}: five-noun letter endings are malformed`);
}
for(const noun of mainNounEntries){
  for(const form of ['nom','acc','gen'])assert(noun[form]&&!noun[form].includes('undefined'),`${noun.en}: missing ${form} form`);
  if(noun.nom.startsWith('ال'))assert(!/[ًٌٍ]/u.test(`${noun.nom}${noun.acc}${noun.gen}`),`${noun.en}: definite noun incorrectly contains tanwīn`);
}
for(const noun of api.nounLexicons.ownedNouns){
  assert(noun.nom.endsWith('ُ')&&!/[ًٌٍ]/u.test(noun.nom),`${noun.en}: muḍāf surface has tanwīn or a wrong ending`);
}
for(const verb of api.verbs){
  for(const field of ['past','pres','acc','juss','five','fiveSub','en','third','pastEn'])assert(verb[field],`${verb.past||verb.en}: missing ${field}`);
  assert(verb.pres.endsWith('ُ'),`${verb.past}: indicative present lacks visible ḍammah`);
  assert(verb.acc.endsWith('َ'),`${verb.past}: subjunctive present lacks visible fatḥah`);
  assert(verb.juss.endsWith('ْ'),`${verb.past}: jussive present lacks visible sukūn`);
  assert(verb.pres.slice(0,-1)===verb.acc.slice(0,-1),`${verb.past}: indicative and subjunctive stems disagree`);
  assert(verb.five.endsWith('ُونَ'),`${verb.past}: five-verb indicative ending is malformed`);
  assert(verb.fiveSub.endsWith('ُوا'),`${verb.past}: five-verb dropped-nūn ending is malformed`);
  assert(verb.five.slice(0,-4)===verb.fiveSub.slice(0,-3),`${verb.past}: five-verb forms do not share one stem`);
  assert(Array.isArray(verb.obj)&&verb.obj.length>0,`${verb.past}: transitive object list is empty`);
}
for(const verb of api.verbLexicons.additionalVerbActions){
  for(const field of ['past','pres','en','third','pastEn','group'])assert(verb[field],`${verb.past||verb.en}: missing ${field}`);
  assert(verb.past.endsWith('َ'),`${verb.past}: added past form is not built on visible fatḥah`);
  assert(verb.pres.endsWith('ُ'),`${verb.past}: added present form would require an unsupported estimated sign`);
  assert(api.objectGroups[verb.group]?.length,`${verb.past}: object compatibility group ${verb.group} is empty`);
}
assert(new Set(api.verbLexicons.additionalVerbActions.map(verb=>verb.past)).size===api.verbLexicons.additionalVerbActions.length,'Added past verbs contain duplicates');
assert(new Set(api.verbLexicons.additionalVerbActions.map(verb=>verb.pres)).size===api.verbLexicons.additionalVerbActions.length,'Added present verbs contain duplicates');
const uniquePresentRecords=new Map();
for(const list of [api.verbLexicons.verbs,api.verbLexicons.additionalVerbActions,api.verbLexicons.humanActions,api.verbLexicons.humanPrepActions,api.verbLexicons.thingActions,api.verbLexicons.thingPrepActions,api.verbLexicons.brokenObjectActions]){
  for(const verb of list)if(!uniquePresentRecords.has(verb.pres))uniquePresentRecords.set(verb.pres,verb);
}
const verbMeaningKeys=[...uniquePresentRecords.values()].map(verb=>(verb.en||verb.third).toLowerCase());
const repeatedVerbMeanings=[...new Set(verbMeaningKeys.filter((meaning,index,all)=>all.indexOf(meaning)!==index))];
assert(repeatedVerbMeanings.length===0,`Distinct Arabic verb families repeat English meanings: ${repeatedVerbMeanings.join(', ')}`);
assert(uniquePresentRecords.size+api.verbLexicons.femininePastActions.length===200,'The structured vocabulary does not contain 200 unique verb families');

const PLAIN_KHABAR=/(^|[\s:،])خَبَرٌ(?=$|[\s،.])/u;
const stats={
  templates:api.templates.length,sentences:0,nominal:0,directKhabar:0,
  verbalKhabar:0,phraseKhabar:0,frontedKhabar:0,innaPairs:0,filterStates:0
};

function countTokens(data,pattern){return data.tokens.filter(token=>pattern.test(token.ar)).length}
function assertNominalPair(data,label){
  assert(data&&Array.isArray(data.tokens),`${label}: invalid generated data`);
  assert(data.sentence&&data.translation,`${label}: missing sentence or translation`);
  assert(!data.translation.includes('undefined'),`${label}: undefined translation`);

  const mubtadaIndexes=data.tokens.map((token,index)=>token.ar.includes('مُبْتَدَأٌ')?index:-1).filter(index=>index>=0);
  const khabarIndexes=data.tokens.map((token,index)=>PLAIN_KHABAR.test(token.ar)?index:-1).filter(index=>index>=0);
  const ismInna=countTokens(data,/اسْمُ «/u);
  const khabarInna=countTokens(data,/خَبَرُ «/u);
  assert(ismInna===khabarInna,`${label}: ${ismInna} ism inna but ${khabarInna} khabar inna`);
  if(ismInna)stats.innaPairs++;
  assert(mubtadaIndexes.length===khabarIndexes.length,
    `${label}: ${mubtadaIndexes.length} mubtada but ${khabarIndexes.length} khabar — ${data.sentence}`);
  assert(mubtadaIndexes.length<=1,`${label}: multiple nominal pairs need explicit metadata — ${data.sentence}`);
  if(!mubtadaIndexes.length)return;

  stats.nominal++;
  const mubtadaIndex=mubtadaIndexes[0];
  const mubtada=data.tokens[mubtadaIndex];
  const khabar=data.tokens[khabarIndexes[0]];
  const verbIndex=data.tokens.findIndex((token,index)=>index>mubtadaIndex&&token.ar.includes('فِعْلٌ مُضَارِعٌ'));
  const delayed=mubtada.ar.includes('مُؤَخَّرٌ');

  if(delayed){
    stats.frontedKhabar++;
    assert(khabar.ar.includes('شِبْهُ جُمْلَةٍ'),`${label}: delayed mubtada lacks phrase-like khabar`);
    assert(khabar.ar.includes('خَبَرٌ مُقَدَّمٌ'),`${label}: delayed mubtada lacks fronted-khabar label`);
    assert(khabar.ar.includes(`«${mubtada.word}»`),`${label}: fronted khabar does not name its delayed mubtada`);
    const phrase=data.tokens.slice(0,mubtadaIndex).map(token=>token.word).join(' ');
    assert(khabar.ar.includes(phrase),`${label}: fronted khabar omits the complete phrase “${phrase}”`);
  }else if(verbIndex>=0){
    stats.verbalKhabar++;
    const verb=data.tokens[verbIndex];
    const clause=data.tokens.slice(mubtadaIndex+1).map(token=>token.word).join(' ');
    assert(khabar===verb,`${label}: verbal khabar was not attached to the verb card`);
    assert(verb.ar.includes('الْجُمْلَةُ الْفِعْلِيَّةُ'),`${label}: missing verbal-sentence label`);
    assert(verb.ar.includes('فِي مَحَلِّ رَفْعٍ خَبَرٌ'),`${label}: verbal sentence is not labeled as khabar`);
    assert(verb.ar.includes(`«${clause}»`),`${label}: khabar omits the complete verbal sentence “${clause}”`);
    assert(verb.ar.includes(`«${mubtada.word}»`),`${label}: verbal khabar does not name its mubtada`);
    assert(verb.ar.includes('الرَّابِطُ'),`${label}: verbal khabar has no link back to its mubtada`);
    if(verb.ar.includes('الْأَفْعَالِ الْخَمْسَةِ')){
      assert(verb.ar.includes('وَاوُ الْجَمَاعَةِ'),`${label}: five-verb khabar lacks wāw subject/link`);
    }else{
      assert(verb.ar.includes('ضَمِيرٌ مُسْتَتِرٌ جَوَازًا'),`${label}: regular verbal khabar lacks hidden subject`);
      assert(verb.ar.includes('«هُوَ»'),`${label}: hidden subject is not identified as huwa`);
    }
  }else if(khabar.ar.includes('شِبْهُ جُمْلَةٍ')){
    stats.phraseKhabar++;
    assert(khabar.ar.includes(`«${mubtada.word}»`),`${label}: phrase-like khabar does not name its mubtada`);
    const phraseStart=data.tokens.findIndex((token,index)=>index>mubtadaIndex&&(token.ar.includes('حَرْفُ جَرٍّ')||token.ar.includes('ظَرْفٌ')));
    assert(phraseStart>=0,`${label}: phrase-like khabar has no phrase lead`);
    const phrase=data.tokens.slice(phraseStart).map(token=>token.word).join(' ');
    assert(khabar.ar.includes(phrase),`${label}: phrase-like khabar omits the complete phrase “${phrase}”`);
  }else{
    stats.directKhabar++;
    assert(khabar.ar.includes('خَبَرٌ مَرْفُوعٌ'),`${label}: direct khabar is not nominative`);
  }
}

function expectThrow(name,data){
  let threw=false;
  try{api.completeNominalAnalysis(data)}catch(error){threw=true}
  assert(threw,`Fault injection did not reject: ${name}`);
}
expectThrow('mubtada without khabar',{templateId:'FAULT_MUBTADA',sentence:'زَيْدٌ',translation:'Zayd.',tokens:[api.makeToken('زَيْدٌ','Zayd',api.specs.mubtada('زَيْدٌ'),'',true)]});
expectThrow('khabar without mubtada',{templateId:'FAULT_KHABAR',sentence:'قَائِمٌ',translation:'Standing.',tokens:[api.makeToken('قَائِمٌ','standing',api.specs.khabar('قَائِمٌ'),'',true)]});
expectThrow('inna noun without khabar',{templateId:'FAULT_INNA',sentence:'إِنَّ زَيْدًا',translation:'Indeed Zayd.',tokens:[api.makeToken('إِنَّ','indeed',api.specs.particle({ar:'إِنَّ',particleIraab:'حَرْفُ تَوْكِيدٍ وَنَصْبٍ'})),api.makeToken('زَيْدًا','Zayd',api.specs.ismInna('زَيْدًا','إِنَّ'),'',true)]});
expectThrow('delayed mubtada without fronted phrase',{templateId:'FAULT_DELAYED',sentence:'زَيْدٌ',translation:'Zayd.',tokens:[api.makeToken('زَيْدٌ','Zayd',api.specs.delayedMubtada('زَيْدٌ'),'',true)]});

const exact=api.completeNominalAnalysis({
  templateId:'TEST_EXACT_TAILOR',
  sentence:'الْخَيَّاطُ يُكْرِمُ الطَّبِيبَاتِ',translation:'The tailor honors the female doctors.',
  tokens:[
    api.makeToken('الْخَيَّاطُ','the tailor',api.specs.mubtada('الْخَيَّاطُ')),
    api.makeToken('يُكْرِمُ','honors',api.specs.presentPred('يُكْرِمُ')),
    api.makeToken('الطَّبِيبَاتِ','the female doctors',api.specs.object('الطَّبِيبَاتِ'),'',true)
  ]
});
assertNominalPair(exact,'exact tailor/doctors case');
assert(exact.tokens[1].ar.includes('«الْخَيَّاطُ»'),'Exact case does not link huwa back to the tailor');

const exactFronted=api.completeNominalAnalysis({
  templateId:'TEST_EXACT_FRONTED',
  sentence:'فِي السُّوقِ مُعَلِّمٌ',translation:'There is a teacher in the market.',
  tokens:[
    api.makeToken('فِي','in',api.specs.prep('فِي')),
    api.makeToken('السُّوقِ','the market',api.specs.majrur('السُّوقِ','فِي'),'',true),
    api.makeToken('مُعَلِّمٌ','a teacher',api.specs.delayedMubtada('مُعَلِّمٌ'))
  ]
});
assertNominalPair(exactFronted,'exact market/teacher case');
assert(exactFronted.tokens[0].ar.startsWith('فِي: حَرْفُ جَرٍّ'),'Exact fronted case lost the individual preposition analysis');
assert(exactFronted.tokens[0].ar.includes('فِي السُّوقِ: شِبْهُ جُمْلَةٍ'),'Exact fronted case omits the complete phrase');
assert(exactFronted.tokens[0].ar.includes('فِي مَحَلِّ رَفْعٍ خَبَرٌ مُقَدَّمٌ'),'Exact fronted case omits the fronted khabar');
assert(exactFronted.tokens[1].ar.includes('اسْمٌ مَجْرُورٌ بِـ«فِي»'),'Exact fronted case lost the governed noun analysis');
assert(exactFronted.tokens[2].ar.includes('مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ'),'Exact fronted case lost the delayed mubtada analysis');

// Direct rule-engine tests: every surface, state, sign, governor, and relationship
// must be derived from the same structured representation.
assert(new Set(api.templates.map(template=>template.stableId)).size===api.templates.length,'Stable template IDs are not unique');
assert(api.templates.every(template=>/^T_[A-Z0-9_]+_\d{2}$/.test(template.stableId)),'A template lacks a stable auditable ID');
assert(Object.keys(api.GRAMMAR_RULES.nounInflection).length===6,'The noun declension matrix is incomplete');
assert(Object.keys(api.GRAMMAR_RULES.presentVerb.regular).join(',')==='raf,nasb,jazm','Regular present moods are incomplete');
assert(Object.keys(api.GRAMMAR_RULES.presentVerb.afalKhamsa).join(',')==='raf,nasb,jazm','Five-verb moods are incomplete');
assert(api.GRAMMAR_COVERAGE_MATRIX.deliberatelyNotGenerated.includes('diptote'),'Unsupported diptotes are not recorded in the coverage matrix');

function structuredCase(templateId,translation,tokens){
  return api.completeNominalAnalysis({templateId,sentence:'',translation,tokens});
}
function targetOf(data){return data.tokens.find(token=>token.target)}
function relationTypes(data){return new Set(data.relationships.map(rel=>rel.type))}
function clone(value){return JSON.parse(JSON.stringify(value))}
function assertFailureCode(name,data,code){
  const codes=api.validateExercise(data).map(failure=>failure.code);
  assert(codes.includes(code),`${name}: expected ${code}, received ${codes.join(', ')||'no failures'}`);
}

const arrange=api.verbs.find(verb=>verb.past==='رَتَّبَ');
assert(arrange,'The arrange verb is missing');
const fiveVerbExpected={
  '3md':{raf:'يُرَتِّبَانِ',nasb:'يُرَتِّبَا',jazm:'يُرَتِّبَا'},
  '2md':{raf:'تُرَتِّبَانِ',nasb:'تُرَتِّبَا',jazm:'تُرَتِّبَا'},
  '3mp':{raf:'يُرَتِّبُونَ',nasb:'يُرَتِّبُوا',jazm:'يُرَتِّبُوا'},
  '2mp':{raf:'تُرَتِّبُونَ',nasb:'تُرَتِّبُوا',jazm:'تُرَتِّبُوا'},
  '2fs':{raf:'تُرَتِّبِينَ',nasb:'تُرَتِّبِي',jazm:'تُرَتِّبِي'}
};
let fiveVerbFormCases=0;
let fiveVerbExerciseCases=0;
let regularVerbMoodCases=0;
const moodSigns={raf:'nunKept',nasb:'nunDropped',jazm:'nunDropped'};
const moodGovernors={nasb:{word:'لَنْ',spec:()=>api.specs.lan('لَنْ'),translation:'You will not arrange the book.'},jazm:{word:'لَمْ',spec:()=>api.specs.lam('لَمْ'),translation:'You did not arrange the book.'}};
for(const [person,forms] of Object.entries(fiveVerbExpected)){
  for(const mood of ['raf','nasb','jazm']){
    const expected=forms[mood];
    assert(api.inflectFiveVerb(arrange,person,mood)===expected,`${person}/${mood}: expected ${expected}`);
    fiveVerbFormCases++;
    const governor=moodGovernors[mood];
    const verbSpec={...api.specs.presentFive(arrange.pres),person};
    const tokens=[];
    if(governor)tokens.push(api.makeToken(governor.word,governor.word,governor.spec()));
    tokens.push(api.makeToken(arrange.pres,'arrange',verbSpec,'',true));
    tokens.push(api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ')));
    const data=structuredCase(`TEST_AFAL5_${person}_${mood}`,governor?.translation||'They arrange the book.',tokens);
    const verb=targetOf(data);
    assert(verb.word===expected,`${person}/${mood}: rendered ${verb.word}, expected ${expected}`);
    assert(verb.state===mood,`${person}/${mood}: wrong mood ${verb.state}`);
    assert(verb.sign.id===moodSigns[mood],`${person}/${mood}: wrong sign ${verb.sign.id}`);
    assert(relationTypes(data).has('verbSubject')&&relationTypes(data).has('verbObject'),`${person}/${mood}: missing verb relationships`);
    if(mood==='raf')assert(!verb.ar.includes('بِـ«لَنْ»')&&!verb.ar.includes('بِـ«لَمْ»'),`${person}/${mood}: invented a governor`);
    fiveVerbExerciseCases++;
  }
}
for(const verb of api.verbs){
  assert(api.inflectFiveVerb(verb,'3mp','raf')===verb.five,`${verb.past}: stored indicative five-verb form disagrees with derivation`);
  assert(api.inflectFiveVerb(verb,'3mp','nasb')===verb.fiveSub,`${verb.past}: stored subjunctive five-verb form disagrees with derivation`);
  assert(api.inflectFiveVerb(verb,'3mp','jazm')===verb.fiveSub,`${verb.past}: stored jussive five-verb form disagrees with derivation`);
  fiveVerbFormCases+=3;
  for(const mood of ['raf','nasb','jazm']){
    const governor=moodGovernors[mood];
    const tokens=[];
    if(governor)tokens.push(api.makeToken(governor.word,governor.word,governor.spec()));
    tokens.push(api.makeToken(verb.pres,verb.en,api.specs.presentPred(verb.pres),'',true));
    tokens.push(api.makeToken(verb.obj[0],'the object',api.specs.object(verb.obj[0])));
    const data=structuredCase(`TEST_REGULAR_${regularVerbMoodCases}`,governor?.translation||'He acts on the object.',tokens);
    const target=targetOf(data);
    const expected=verb[{raf:'pres',nasb:'acc',jazm:'juss'}[mood]];
    assert(target.word===expected,`${verb.past}/${mood}: rendered ${target.word}, expected ${expected}`);
    assert(target.state===mood,`${verb.past}/${mood}: wrong mood`);
    assert(target.ar.includes('ضَمِيرٌ مُسْتَتِرٌ')&&target.ar.includes('«هُوَ»'),`${verb.past}/${mood}: implicit subject is not explained`);
    regularVerbMoodCases++;
  }
}

const nounSamples=[
  {kind:'singular',nom:'الطَّالِبُ',acc:'الطَّالِبَ',gen:'الطَّالِبِ',signs:{raf:'damma',nasb:'fatha',jarr:'kasra'}},
  {kind:'broken',nom:'الطُّلَّابُ',acc:'الطُّلَّابَ',gen:'الطُّلَّابِ',signs:{raf:'damma',nasb:'fatha',jarr:'kasra'}},
  {kind:'dual',nom:'الطَّالِبَانِ',acc:'الطَّالِبَيْنِ',gen:'الطَّالِبَيْنِ',signs:{raf:'alif',nasb:'ya',jarr:'ya'}},
  {kind:'smp',nom:'الْمُعَلِّمُونَ',acc:'الْمُعَلِّمِينَ',gen:'الْمُعَلِّمِينَ',signs:{raf:'waw',nasb:'ya',jarr:'ya'}},
  {kind:'sfp',nom:'الطَّالِبَاتُ',acc:'الطَّالِبَاتِ',gen:'الطَّالِبَاتِ',signs:{raf:'damma',nasb:'kasraSub',jarr:'kasra'}},
  {kind:'fiveNouns',nom:'أَبُوكَ',acc:'أَبَاكَ',gen:'أَبِيكَ',signs:{raf:'waw',nasb:'alif',jarr:'ya'}}
];
let nounDeclensionCases=0;
for(const sample of nounSamples){
  const cases={
    raf:()=>structuredCase(`TEST_NOUN_${sample.kind}_raf`,'The subject read the book.',[
      api.makeToken('قَرَأَ','read',api.specs.past('قَرَأَ')),
      api.makeToken(sample.nom,'the subject',api.specs.faail(sample.nom),'',true),
      api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'))
    ]),
    nasb:()=>structuredCase(`TEST_NOUN_${sample.kind}_nasb`,'The teacher saw the object.',[
      api.makeToken('زَارَ','visited',api.specs.past('زَارَ')),
      api.makeToken('الْمُعَلِّمُ','the teacher',api.specs.faail('الْمُعَلِّمُ')),
      api.makeToken(sample.acc,'the object',api.specs.object(sample.acc),'',true)
    ]),
    jarr:()=>structuredCase(`TEST_NOUN_${sample.kind}_jarr`,'It is connected to the noun.',[
      api.makeToken('إِلَى','to',api.specs.prep('إِلَى')),
      api.makeToken(sample.gen,'the noun',api.specs.majrur(sample.gen,'إِلَى'),'',true)
    ])
  };
  for(const state of ['raf','nasb','jarr']){
    const noun=targetOf(cases[state]());
    assert(noun.inflection===sample.kind,`${sample.kind}/${state}: inferred ${noun.inflection}`);
    assert(noun.state===state,`${sample.kind}/${state}: wrong case ${noun.state}`);
    assert(noun.sign.id===sample.signs[state],`${sample.kind}/${state}: wrong sign ${noun.sign.id}`);
    assert(noun.word===sample[{raf:'nom',nasb:'acc',jarr:'gen'}[state]],`${sample.kind}/${state}: wrong surface ${noun.word}`);
    nounDeclensionCases++;
  }
}

const deterministicStructures=[
  structuredCase('TEST_DIRECT_NOMINAL','The student is hardworking.',[
    api.makeToken('الطَّالِبُ','the student',api.specs.mubtada('الطَّالِبُ'),'',true),
    api.makeToken('مُجْتَهِدٌ','hardworking',api.specs.khabar('مُجْتَهِدٌ'))
  ]),
  structuredCase('TEST_PHRASE_KHABAR','The student is in the school.',[
    api.makeToken('الطَّالِبُ','the student',api.specs.mubtada('الطَّالِبُ'),'',true),
    api.makeToken('فِي','in',api.specs.prep('فِي')),
    api.makeToken('الْمَدْرَسَةِ','the school',api.specs.majrur('الْمَدْرَسَةِ','فِي'))
  ]),
  structuredCase('TEST_IDAFA','The student’s book is new.',[
    api.makeToken('كِتَابُ','book',api.specs.mudaf('كِتَابُ'),'',true),
    api.makeToken('الطَّالِبِ','the student',api.specs.mudafIlayh('الطَّالِبِ')),
    api.makeToken('مُجْتَهِدٌ','hardworking',api.specs.khabar('مُجْتَهِدٌ'))
  ]),
  structuredCase('TEST_INNA','Indeed, the student is hardworking.',[
    api.makeToken('إِنَّ','indeed',api.specs.particle({ar:'إِنَّ',iraab:'حَرْفُ تَوْكِيدٍ وَنَصْبٍ'})),
    api.makeToken('الطَّالِبَ','the student',api.specs.ismInna('الطَّالِبَ','إِنَّ'),'',true),
    api.makeToken('مُجْتَهِدٌ','hardworking',api.specs.khabarInna('مُجْتَهِدٌ','إِنَّ'))
  ]),
  structuredCase('TEST_KANA','The student was hardworking.',[
    api.makeToken('كَانَ','was',api.specs.kana('كَانَ')),
    api.makeToken('الطَّالِبُ','the student',api.specs.ismKana('الطَّالِبُ')),
    api.makeToken('مُجْتَهِدًا','hardworking',api.specs.khabarKana('مُجْتَهِدًا'),'',true)
  ]),
  structuredCase('TEST_VERBAL_TRANSITIVE','Zayd read the book.',[
    api.makeToken('قَرَأَ','read',api.specs.past('قَرَأَ')),
    api.makeToken('زَيْدٌ','Zayd',api.specs.faail('زَيْدٌ'),'',true),
    api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'))
  ])
];
for(const data of deterministicStructures){
  assert(data.validated,`${data.templateId}: deterministic structure was not validated`);
  assert(data.tokens.every(token=>token.ruleId),`${data.templateId}: a token lacks a rule ID`);
  assert(data.relationships.every(rel=>rel.ruleId),`${data.templateId}: a relationship lacks a rule ID`);
}
assert(relationTypes(deterministicStructures[0]).has('mubtadaKhabar'),'Direct nominal relationship is missing');
assert(relationTypes(deterministicStructures[1]).has('preposition')&&relationTypes(deterministicStructures[1]).has('mubtadaKhabar'),'Phrase khabar relationships are missing');
assert(relationTypes(deterministicStructures[2]).has('idafa'),'Iḍāfah relationship is missing');
assert(relationTypes(deterministicStructures[3]).has('inna'),'Inna relationship is missing');
assert(relationTypes(deterministicStructures[4]).has('kana'),'Kāna relationship is missing');
assert(relationTypes(deterministicStructures[5]).has('verbSubject')&&relationTypes(deterministicStructures[5]).has('verbObject'),'Transitive verbal relationships are missing');

const criticalIndicative=structuredCase('TEST_CRITICAL_INDICATIVE','They arrange the book.',[
  api.makeToken('يُرَتِّبُوا','arrange',{...api.specs.presentFive(arrange.pres),person:'3mp'},'',true),
  api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'))
]);
assert(criticalIndicative.sentence.startsWith('يُرَتِّبُونَ '),'Standalone indicative failed to restore the nūn');
assert(!criticalIndicative.tokens[0].ar.includes('لَنْ'),'Standalone indicative explanation falsely mentions lan');

let validatorFaultCases=0;
const badFiveSurface=clone(criticalIndicative);badFiveSurface.tokens[0].word='يُرَتِّبُوا';
assertFailureCode('dropped nūn without governor',badFiveSurface,'E_SURFACE_FORM');validatorFaultCases++;
const fakeLan=clone(criticalIndicative);fakeLan.tokens[0].ar+=' مَنْصُوبٌ بِـ«لَنْ».';
assertFailureCode('invented lan explanation',fakeLan,'E_FAKE_LAN');validatorFaultCases++;
const missingKhabar=clone(deterministicStructures[0]);missingKhabar.tokens[0].relations={};
assertFailureCode('removed mubtada khabar link',missingKhabar,'E_MUBTADA_NO_KHABAR');validatorFaultCases++;
const orphanObject=clone(criticalIndicative);delete orphanObject.tokens[1].relations.verbId;
assertFailureCode('removed object link',orphanObject,'E_ORPHAN_OBJECT');validatorFaultCases++;
const badRelationRule=clone(deterministicStructures[3]);delete badRelationRule.relationships[0].ruleId;
assertFailureCode('removed relationship rule ID',badRelationRule,'E_RELATION_RULE');validatorFaultCases++;
const wrongPrepositionCause=clone(exactFronted);wrongPrepositionCause.tokens[1].grammar.governorWord='إِلَى';
assertFailureCode('mismatched named preposition',wrongPrepositionCause,'E_PREPOSITION_CAUSE');validatorFaultCases++;
const wrongAttachedSubject=clone(criticalIndicative);wrongAttachedSubject.relationships.find(rel=>rel.type==='verbSubject').pronoun='أَلِفُ الِاثْنَيْنِ';
assertFailureCode('wrong attached subject',wrongAttachedSubject,'E_ATTACHED_SUBJECT');validatorFaultCases++;
const incompleteKhabarSpan=clone(deterministicStructures[1]);incompleteKhabarSpan.relationships.find(rel=>rel.type==='mubtadaKhabar').tokenIds.pop();
assertFailureCode('incomplete khabar phrase span',incompleteKhabarSpan,'E_KHABAR_SPAN');validatorFaultCases++;
const badLanTranslation=structuredCase('TEST_LAN_TRANSLATION_BASE','They will not arrange the book.',[
  api.makeToken('لَنْ','will not',api.specs.lan('لَنْ')),
  api.makeToken(arrange.pres,'arrange',{...api.specs.presentFive(arrange.pres),person:'3mp'},'',true),
  api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'))
]);
badLanTranslation.translation='They arrange the book.';
assertFailureCode('lan translation lost negation',badLanTranslation,'E_LAN_TRANSLATION');validatorFaultCases++;

function runEveryTemplate(repetitions){
  for(const template of api.templates){
    for(let iteration=0;iteration<repetitions;iteration++){
      const data=api.buildTemplate(template.id);
      assertNominalPair(data,`template ${template.id} ${template.starts}/${template.form}/${template.sign} run ${iteration}`);
      stats.sentences++;
    }
  }
}
runEveryTemplate(200);

let semanticCompatibilityCases=0;
const idafaTemplate=api.templates.find(template=>template.starts==='noun'&&template.form==='singular'&&template.sign==='kasra');
assert(idafaTemplate,'The iḍāfah template is missing');
for(let iteration=0;iteration<1000;iteration++){
  const data=api.buildTemplate(idafaTemplate.id);
  const feminine=data.tokens[0].word.endsWith('ةُ');
  const khabar=data.tokens[2].word;
  assert(feminine?khabar.endsWith('ةٌ'):!khabar.endsWith('ةٌ'),`Iḍāfah gender disagreement: ${data.sentence}`);
  assert(['new','old','useful','important','valuable','available'].includes(data.tokens[2].gloss),`Unsafe object predicate: ${data.sentence}`);
  semanticCompatibilityCases++;
}
const dualNominalTemplate=api.templates.find(template=>template.starts==='noun'&&template.form==='dual'&&template.sign==='alif');
assert(dualNominalTemplate,'The dual nominal template is missing');
for(let iteration=0;iteration<1000;iteration++){
  const data=api.buildTemplate(dualNominalTemplate.id);
  assert(!/books|pens|windows|cars|bags/i.test(data.tokens[0].gloss),`Nonhuman dual received a human predicate: ${data.sentence}`);
  semanticCompatibilityCases++;
}
const innaDualTemplate=api.templates.find(template=>template.starts==='particle'&&template.form==='dual'&&template.sign==='ya'&&api.buildTemplate(template.id).tokens[0].grammar.particleType==='inna');
assert(innaDualTemplate,'The dual inna template is missing');
for(let iteration=0;iteration<1000;iteration++){
  const data=api.buildTemplate(innaDualTemplate.id);
  assert(!/books|pens|windows|cars|bags/i.test(data.tokens[1].gloss),`Nonhuman dual received a human khabar of inna: ${data.sentence}`);
  semanticCompatibilityCases++;
}

const marketTeacherTemplate=api.templates.find(template=>
  template.starts==='particle'&&template.form==='singular'&&template.sign==='kasra');
assert(marketTeacherTemplate,'The fronted singular prepositional template is missing');
let generatedMarketTeacher=false;
for(let iteration=0;iteration<20000;iteration++){
  const data=api.buildTemplate(marketTeacherTemplate.id);
  assertNominalPair(data,`fronted singular coverage run ${iteration}`);
  stats.sentences++;
  if(data.sentence==='فِي السُّوقِ مُعَلِّمٌ'){
    generatedMarketTeacher=true;
    assert(data.tokens[0].ar.includes('فِي السُّوقِ: شِبْهُ جُمْلَةٍ'),
      'Generated market/teacher case omitted the complete phrase');
    assert(data.tokens[0].ar.includes('فِي مَحَلِّ رَفْعٍ خَبَرٌ مُقَدَّمٌ'),
      'Generated market/teacher case omitted the fronted khabar');
    assert(data.tokens[2].ar.includes('مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ'),
      'Generated market/teacher case omitted the delayed mubtada');
  }
}
assert(generatedMarketTeacher,'The exact market/teacher sentence was not reached through the real template');

const starts=optionValues.startFilter;
const forms=optionValues.formFilter;
const signs=optionValues.signFilter;
function isDisabled(id,value){
  return elements[id].options.find(option=>option.value===value).disabled;
}
for(const start of starts){
  for(const form of forms){
    for(const sign of signs){
      const pool=api.poolFor(start,form,sign);
      if(!pool.length)continue;
      stats.filterStates++;
      elements.startFilter.value=start;
      elements.formFilter.value=form;
      elements.signFilter.value=sign;
      elements.signFilter.dispatch('change');
      assert(elements.startFilter.value===start&&elements.formFilter.value===form&&elements.signFilter.value===sign,
        `Valid filters were reset: ${start}/${form}/${sign}`);
      assert(elements.sentence.textContent,`No rendered sentence for ${start}/${form}/${sign}`);
      assert((elements.answers.innerHTML.match(/class="word-card/g)||[]).length>=2,
        `Incomplete rendered analysis for ${start}/${form}/${sign}`);
      for(const candidate of starts){
        assert(isDisabled('startFilter',candidate)===(api.poolFor(candidate,form,sign).length===0),
          `Wrong start availability for ${start}/${form}/${sign} -> ${candidate}`);
      }
      for(const candidate of forms){
        assert(isDisabled('formFilter',candidate)===(api.poolFor(start,candidate,sign).length===0),
          `Wrong form availability for ${start}/${form}/${sign} -> ${candidate}`);
      }
      for(const candidate of signs){
        assert(isDisabled('signFilter',candidate)===(api.poolFor(start,form,candidate).length===0),
          `Wrong sign availability for ${start}/${form}/${sign} -> ${candidate}`);
      }
    }
  }
}

elements.clearHistoryBtn.dispatch('click');
elements.startFilter.value='particle';
elements.formFilter.value='fiveNouns';
elements.signFilter.value='ya';
elements.newBtn.dispatch('click');
assert(elements.startFilter.value==='any','Reset Filters did not restore Any beginning');
assert(elements.formFilter.value==='any','Reset Filters did not restore All forms');
assert(elements.signFilter.value==='any','Reset Filters did not restore All signs');
assert(Object.keys(optionValues).every(id=>elements[id].options.every(option=>!option.disabled)),
  'Reset Filters did not re-enable all compatible options');
assert(elements.status.className==='status'&&elements.status.textContent==='',
  'Reset Filters still shows the removed confirmation notice');
assert(elements.sentence.textContent,'Reset Filters did not generate an unrestricted sentence');
assert(elements.historyToggle.textContent==='Sentence history (1)','Reset Filters generation was not added to history');
assert(html.indexOf('id="historyToggle"')>html.indexOf('id="answerPanel"')
  && html.indexOf('id="historyToggle"')<html.indexOf('id="status"'),
  'Sentence history is not positioned where the reset notice used to appear');
assert(html.indexOf('id="definitionsToggle"')>html.indexOf('id="historyToggle"')
  && html.indexOf('id="definitionsToggle"')<html.indexOf('id="status"'),
  'Grammar definitions are not positioned beneath sentence history');

elements.startFilter.value='any';
elements.formFilter.value='any';
elements.signFilter.value='any';
elements.signFilter.dispatch('change');
const rejectedBeforeRandom=api.grammarDiagnostics.rejected;
const rejectionReasonsBeforeRandom={...api.grammarDiagnostics.rejectionReasons};
const randomSentences=[];
const openingWords=new Set();
const openingParticles=new Set();
const particleWords=new Set(['إِنَّ','لَكِنَّ','لَعَلَّ','لَيْتَ','فِي','عَنْ','إِلَى','لَنْ','لَمْ','سَوْفَ']);
let consecutiveRepeats=0;
for(let iteration=0;iteration<3000;iteration++){
  context.nahwGenerate();
  const sentence=elements.sentence.textContent;
  const rendered=elements.answers.innerHTML;
  const first=sentence.split(/\s+/)[0];
  if(randomSentences[randomSentences.length-1]===sentence)consecutiveRepeats++;
  randomSentences.push(sentence);
  openingWords.add(first);
  if(particleWords.has(first))openingParticles.add(first);
  assert((rendered.match(/class="word-card target/g)||[]).length===1,`Random run ${iteration}: wrong focus-card count`);
  const renderedMubtada=(rendered.match(/مُبْتَدَأٌ/gu)||[]).length;
  const renderedKhabar=(rendered.match(/خَبَرٌ(?=$|[\s،.<])/gu)||[]).length;
  assert(renderedMubtada===renderedKhabar,
    `Random run ${iteration}: rendered mubtada/khabar mismatch in ${sentence}`);
}
const uniqueRandomSentences=new Set(randomSentences).size;
const runtimeRejectedCandidates=api.grammarDiagnostics.rejected-rejectedBeforeRandom;
const runtimeRejectionReasons=Object.fromEntries(Object.entries(api.grammarDiagnostics.rejectionReasons)
  .map(([code,count])=>[code,count-(rejectionReasonsBeforeRandom[code]||0)]).filter(([,count])=>count>0));
assert(runtimeRejectedCandidates===0,`Runtime generation rejected ${runtimeRejectedCandidates} candidates: ${JSON.stringify(runtimeRejectionReasons)}`);
assert(consecutiveRepeats===0,'A consecutive sentence repeat was generated');
assert(uniqueRandomSentences>=2100,`Only ${uniqueRandomSentences} unique sentences in 3000 random generations`);
assert(openingWords.size>=60,`Only ${openingWords.size} distinct opening words appeared`);
assert(openingParticles.size>=9,`Only ${openingParticles.size} distinct opening particles appeared`);
assert(JSON.parse(storage.get('nahw-sentence-history-v1')).length===100,'Sentence history did not enforce its 100-entry limit');

const additionalBlock=html.match(/const additionalVerbActions=\[([\s\S]*?)\n\];/)[1];
const additionalRecords=[...additionalBlock.matchAll(/\{past:'([^']+)',pres:'([^']+)'/g)]
  .map(record=>({past:record[1],pres:record[2]}));
assert(additionalRecords.length===157,`Expected 157 additional verb records, found ${additionalRecords.length}`);
elements.startFilter.value='verb';
elements.formFilter.value='singular';
elements.signFilter.value='damma';
elements.signFilter.dispatch('change');
const pastStarts=new Set();
for(let iteration=0;iteration<5000;iteration++){
  context.nahwGenerate();
  pastStarts.add(elements.sentence.textContent.split(/\s+/)[0]);
}
const additionalPastSeen=additionalRecords.filter(record=>pastStarts.has(record.past)).length;
assert(additionalPastSeen===157,`Only ${additionalPastSeen} of 157 added past verbs appeared`);
elements.startFilter.value='noun';
elements.formFilter.value='singular';
elements.signFilter.value='fatha';
elements.signFilter.dispatch('change');
const presentSentences=[];
for(let iteration=0;iteration<5000;iteration++){
  context.nahwGenerate();
  presentSentences.push(elements.sentence.textContent);
  assert(elements.answers.innerHTML.includes('الْجُمْلَةُ الْفِعْلِيَّةُ'),
    `Focused nominal run ${iteration}: verbal khabar analysis is missing`);
}
const additionalPresentSeen=additionalRecords
  .filter(record=>presentSentences.some(sentence=>sentence.includes(` ${record.pres} `))).length;
assert(additionalPresentSeen===157,`Only ${additionalPresentSeen} of 157 added present verbs appeared`);

const nounArrayNames=['singularPeople','singularThings','places','brokenHuman','brokenThings','duals','smp','sfp','fiveNouns'];
const nounEntries=nounArrayNames.reduce((total,name)=>{
  const block=html.match(new RegExp(`const ${name}=\\[([\\s\\S]*?)\\n\\];`))[1];
  return total+(block.match(/\{/g)||[]).length;
},0);
const presentArrayNames=['verbs','additionalVerbActions','humanActions','humanPrepActions','thingActions','thingPrepActions','brokenObjectActions'];
const uniquePresentVerbs=new Set();
for(const name of presentArrayNames){
  const block=html.match(new RegExp(`const ${name}=\\[([\\s\\S]*?)\\n\\];`))[1];
  for(const verb of block.matchAll(/pres:'([^']+)'/g))uniquePresentVerbs.add(verb[1]);
}
const femininePastBlock=html.match(/const femininePastActions=\[([\s\S]*?)\n\];/)[1];
const totalVerbFamilies=uniquePresentVerbs.size+(femininePastBlock.match(/\{past:'/g)||[]).length;
assert(nounEntries===200,`Expected 200 noun entries, found ${nounEntries}`);
assert(totalVerbFamilies===200,`Expected 200 verb families, found ${totalVerbFamilies}`);

const started=Date.now();
let nextProgress=started+30000;
let stressPasses=0;
while(Date.now()-started<durationMs){
  runEveryTemplate(25);
  stressPasses++;
  if(Date.now()>=nextProgress){
    console.log(`PROGRESS elapsed=${Math.round((Date.now()-started)/1000)}s sentences=${stats.sentences} passes=${stressPasses}`);
    nextProgress+=30000;
  }
}

const untestedTemplateIds=api.templates.filter(template=>!api.grammarDiagnostics.validByTemplate[template.stableId]).map(template=>template.stableId);
assert(untestedTemplateIds.length===0,`Templates missing diagnostic coverage: ${untestedTemplateIds.join(', ')}`);
const uncoveredRuleIds=[];
for(const table of Object.values(api.GRAMMAR_RULES.nounInflection)){
  for(const [,ruleId] of Object.values(table))if(!api.grammarDiagnostics.validByRule[ruleId])uncoveredRuleIds.push(ruleId);
}
for(const table of Object.values(api.GRAMMAR_RULES.presentVerb)){
  for(const [,ruleId] of Object.values(table))if(!api.grammarDiagnostics.validByRule[ruleId])uncoveredRuleIds.push(ruleId);
}
assert(uncoveredRuleIds.length===0,`Grammar rules missing execution coverage: ${uncoveredRuleIds.join(', ')}`);

console.log(JSON.stringify({
  ...stats,nounEntries,totalVerbFamilies,stressPasses,
  fiveVerbFormCases,fiveVerbExerciseCases,regularVerbMoodCases,nounDeclensionCases,
  deterministicStructureCases:deterministicStructures.length,validatorFaultCases,semanticCompatibilityCases,
  randomGenerations:randomSentences.length,uniqueRandomSentences,consecutiveRepeats,
  runtimeRejectedCandidates,runtimeRejectionReasons,
  distinctOpeningWords:openingWords.size,distinctOpeningParticles:openingParticles.size,
  additionalPastSeen,additionalPresentSeen,
  diagnosticGenerated:api.grammarDiagnostics.generated,
  diagnosticValid:api.grammarDiagnostics.valid,
  diagnosticRejectedIncludingIntentionalFaults:api.grammarDiagnostics.rejected,
  diagnosticRejectionReasonsIncludingIntentionalFaults:api.grammarDiagnostics.rejectionReasons,
  coveredTemplateIds:Object.keys(api.grammarDiagnostics.validByTemplate).length,
  coveredRuleIds:Object.keys(api.grammarDiagnostics.validByRule).length,
  stressDurationSeconds:Math.round((Date.now()-started)/1000)
},null,2));
