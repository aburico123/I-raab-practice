const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

const file=process.argv[2]||'index.html';
const durationMs=Number(process.argv[3]||0);
const auditOutput=process.argv[4]||'';
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
  templates:templates.map(({id,stableId,starts,form,state,sign,pastPerson,pastCapabilities,presentPerson,frontedPresent,presentCapabilities})=>({id,stableId,starts,form,state,sign,pastPerson,pastCapabilities:pastCapabilities.map(capability=>({...capability})),presentPerson,frontedPresent,presentCapabilities:presentCapabilities.map(capability=>({...capability}))})),
  buildTemplate:id=>completeNominalAnalysis(templates[id].build()),
  completeNominalAnalysis,
  renderExercise,
  buildTokenWhy,
  buildRelationshipWhy,
  poolFor,
  grammarDefinitionGroups,
  GRAMMAR_RULES,
  GRAMMAR_COVERAGE_MATRIX,
  COMPONENT_REGISTRY,
  PAST_MORPHOLOGY,
  PAST_BINAA_RULE_IDS,
  PRESENT_MORPHOLOGY,
  PRESENT_ENDING_COMPONENTS,
  PRESENT_HIDDEN_SUBJECTS,
  PRESENT_CONCEALMENT,
  PRESENT_SURFACE_READINGS,
  PRESENT_NON_PRODUCTION_PERSONS,
  PRESENT_BINAA_RULE_IDS,
  MABNI_NUUN_NISWAH,
  resolvePresentReading,
  authoritativeVerbMorphology,
  verbFormIndex,
  nounFormIndex,
  canonicalExerciseIdentityV3Phase1,
  isPhase1V3IdentityCandidate,
  REVIEWED_SOURCE_AUTHORITIES,
  REVIEWED_SOURCE_EVIDENCE,
  SOURCE_STATUS,
  SOURCE_REGISTRY,
  isSourceAuthorized,
  isSourceRecordAuthorized,
  isCanonicalReviewedEvidence,
  grammarDiagnostics,
  validateExercise,
  render,
  inflectFiveVerb,
  makeToken:token,
  specs:AR,
  verbs,
  generalVerbActions,
  nounLexicons:{singularPeople,singularThings,places,brokenHuman,brokenThings,duals,smp,sfp,fiveNouns,singularPredicates,dualPredicates,masculinePluralPredicates,femininePluralPredicates,masculineThingPredicates,feminineThingPredicates,ownedNouns},
  verbLexicons:{verbs,generalVerbActions,additionalVerbActions,humanActions,humanPrepActions,thingActions,thingPrepActions,femininePastActions,advancedPastActions,advancedPresentActions,brokenObjectActions},
  vocabularyHistory,
  objectGroups,
  currentExercise:()=>current,
  sentenceHistory:()=>sentenceHistory,
  reviewSentenceFromHistory,
  createExerciseSnapshot,
  restoreExerciseSnapshot,
  canonicalExerciseIdentity,
  getLanguageMode:()=>languageMode,
  setLanguageMode,
  selectDefinitionChapter,
  UI_TEXT,
  setAppearanceMode,
  getAppearanceMode:()=>appearanceMode,
  loadAppearanceMode,
  effectiveTheme,
  applyAppearanceMode
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
      toggle:(name,force)=>{
        if(force===true){classes.add(name);return true}
        if(force===false){classes.delete(name);return false}
        return classes.has(name)?(classes.delete(name),false):(classes.add(name),true);
      }
    },
    addEventListener(type,handler){listeners.set(type,handler)},
    dispatch(type,target){const handler=listeners.get(type);if(handler)handler({target:target||this})},
    closest(selector){
      if(selector.startsWith('.'))return classes.has(selector.slice(1))?this:null;
      if(selector.startsWith('#'))return id===selector.slice(1)?this:null;
      if(selector.startsWith('['))return attributes.has(selector.slice(1,-1).split(/[=\]]/)[0])?this:null;
      return null;
    },
    setAttribute(name,value){attributes.set(name,String(value))},
    getAttribute(name){return attributes.get(name)??null}
  };
}

const optionValues={
  startFilter:['any','noun','verb','particle'],
  formFilter:['any','singular','broken','dual','smp','sfp','fiveNouns','present','fiveVerbs'],
  stateFilter:['any','raf','nasb','jarr','jazm'],
  signFilter:['any','damma','fatha','kasra','sukun','alif','waw','ya','kasraSub','nunKept','nunDropped']
};
const elements={
  startFilter:element('startFilter','any'),formFilter:element('formFilter','any'),
  stateFilter:element('stateFilter','any'),
  signFilter:element('signFilter','any'),sentence:element('sentence'),translation:element('translation'),
  answers:element('answers'),answerPanel:element('answerPanel'),revealBtn:element('revealBtn'),
  status:element('status'),newBtn:element('newBtn'),nextBtn:element('nextBtn'),
  historyToggle:element('historyToggle'),historyPanel:element('historyPanel'),
  historyList:element('historyList'),historyEmpty:element('historyEmpty'),
  clearHistoryBtn:element('clearHistoryBtn'),definitionsToggle:element('definitionsToggle'),
  definitionsPanel:element('definitionsPanel'),definitionsList:element('definitionsList'),
  langMixed:element('langMixed'),langArabic:element('langArabic'),
  langMenuBtn:element('langMenuBtn'),langMenu:element('langMenu'),
  apprMenuBtn:element('apprMenuBtn'),apprMenu:element('apprMenu'),
  practiceTip:element('practiceTip'),practiceEyebrow:element('practiceEyebrow'),
  answerTitle:element('answerTitle'),startLabel:element('startLabel'),formLabel:element('formLabel'),
  stateLabel:element('stateLabel'),signLabel:element('signLabel'),
  historyTitle:element('historyTitle'),historyNote:element('historyNote'),
  apprSystem:element('apprSystem'),apprLight:element('apprLight'),apprDark:element('apprDark'),
  filtersToggle:element('filtersToggle'),filtersPanel:element('filtersPanel')
};
const bodyElement=element('body');
const documentElement=element('documentElement');
elements.apprSystem.setAttribute('data-appearance','system');
elements.apprLight.setAttribute('data-appearance','light');
elements.apprDark.setAttribute('data-appearance','dark');
for(const [id,values] of Object.entries(optionValues)){
  elements[id].options=values.map(value=>({value,disabled:false}));
}
// Controllable matchMedia mock for appearance-mode tests (prefers-color-scheme: dark).
let __systemPrefersDark=false;
const __mediaListeners=new Set();
const __darkMedia={
  media:'(prefers-color-scheme: dark)',
  get matches(){return __systemPrefersDark},
  addEventListener(type,fn){if(type==='change')__mediaListeners.add(fn)},
  removeEventListener(type,fn){__mediaListeners.delete(fn)},
  addListener(fn){__mediaListeners.add(fn)},
  removeListener(fn){__mediaListeners.delete(fn)}
};
function matchMedia(query){return __darkMedia}
function setSystemPrefersDark(value){
  __systemPrefersDark=!!value;
  for(const fn of __mediaListeners)fn({matches:__systemPrefersDark,media:'(prefers-color-scheme: dark)'});
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
  localStorage,matchMedia,document:{getElementById:id=>elements[id],body:bodyElement,documentElement}
};
context.window=context;
context.globalThis=context;
vm.createContext(context);
vm.runInContext(script,context,{filename:'index.html'});

const api=context.__nahwTest;
assert(api&&typeof api.completeNominalAnalysis==='function','Nominal validator was not exported to the test harness');
assert(elements.sentence.textContent,'The application did not generate its initial sentence');
assert(elements.historyToggle.textContent==='Sentence history (1)','The initial exercise was not added to clean snapshot history');
assert(!elements.historyList.innerHTML.includes('جُمْلَةٌ سَابِقَةٌ'),'Legacy text-only history must not be treated as a reviewable exercise');
let savedHistory=JSON.parse(storage.get('nahw-sentence-history-v1'));
assert(savedHistory.length===1,'The initial exercise snapshot was not persisted');
assert(savedHistory[0].schemaVersion===3&&savedHistory[0].exerciseIdentity&&savedHistory[0].templateId&&savedHistory[0].tokens.length,
  'History did not persist a versioned structured exercise snapshot');
assert(!Object.hasOwn(savedHistory[0],'validated'),'History snapshots must be revalidated instead of trusting a stored flag');
assert(elements.historyList.innerHTML.includes('<button type="button" class="history-item"')
  &&elements.historyList.innerHTML.includes('data-history-index="0"'),
  'History rows are not native keyboard-accessible buttons');
elements.historyToggle.dispatch('click');
assert(elements.historyPanel.classList.contains('open'),'History tab did not open its panel');
assert(elements.historyToggle.getAttribute('aria-expanded')==='true','History tab did not expose its open state');
const originalExerciseSnapshot=JSON.parse(JSON.stringify(savedHistory[0]));
elements.nextBtn.dispatch('click');
assert(elements.historyToggle.textContent==='Sentence history (2)','New Sentence was not added to history');
const generatedAfterOriginal=api.currentExercise();
assert(generatedAfterOriginal.sentence!==originalExerciseSnapshot.sentence,'History review setup unexpectedly generated the same sentence twice');
elements.startFilter.value='particle';
elements.formFilter.value='fiveVerbs';
elements.stateFilter.value='nasb';
elements.signFilter.value='nunDropped';
const filtersBeforeReview=JSON.stringify([
  elements.startFilter.value,elements.formFilter.value,elements.stateFilter.value,elements.signFilter.value
]);
const storedBeforeReview=storage.get('nahw-sentence-history-v1');
const reviewButton=element('historyReview');
reviewButton.setAttribute('data-history-index','1');
elements.historyList.dispatch('click',reviewButton);
const reviewed=api.currentExercise();
assert(reviewed!==generatedAfterOriginal,'Opening history did not replace the current exercise');
assert(reviewed.templateId===originalExerciseSnapshot.templateId
  &&reviewed.sentence===originalExerciseSnapshot.sentence
  &&reviewed.translation===originalExerciseSnapshot.translation,
  'History review did not restore the exact saved exercise');
assert(JSON.stringify(reviewed.tokens)===JSON.stringify(originalExerciseSnapshot.tokens)
  &&JSON.stringify(reviewed.relationships)===JSON.stringify(originalExerciseSnapshot.relationships),
  'History review did not preserve the original token and relationship grammar data');
const reviewedFocus=reviewed.tokens.find(token=>token.target);
const savedFocus=originalExerciseSnapshot.tokens.find(token=>token.target);
assert(reviewedFocus.word===savedFocus.word&&reviewedFocus.inflection===savedFocus.inflection
  &&reviewedFocus.state===savedFocus.state&&reviewedFocus.sign.id===savedFocus.sign.id,
  'History review did not restore the saved focus word, form, state, and sign');
assert(JSON.stringify([
  elements.startFilter.value,elements.formFilter.value,elements.stateFilter.value,elements.signFilter.value
])===filtersBeforeReview,'Reviewing history changed the active filters');
assert(storage.get('nahw-sentence-history-v1')===storedBeforeReview
  &&elements.historyToggle.textContent==='Sentence history (2)',
  'Reviewing history duplicated or rewrote the saved sentence');
assert(!elements.answerPanel.classList.contains('open'),'A reviewed exercise should load with its answer hidden');
elements.revealBtn.dispatch('click');
assert(elements.answerPanel.classList.contains('open')
  &&elements.answers.innerHTML.includes(savedFocus.ar),
  'Reveal did not show the restored exercise iʿrāb');
elements.revealBtn.dispatch('click');
elements.startFilter.value='any';
elements.formFilter.value='any';
elements.stateFilter.value='any';
elements.signFilter.value='any';
elements.clearHistoryBtn.dispatch('click');
assert(elements.historyToggle.textContent==='Sentence history (0)','Clear history did not reset its count');
assert(elements.historyList.hidden&& !elements.historyEmpty.hidden,'Clear history did not restore the empty state');
assert(JSON.parse(storage.get('nahw-sentence-history-v1')).length===0,'Cleared history was not persisted');

// ===================================================================================
// COMBINED History + Why integration — a restored exercise must carry correct, non-fallback
// Why explanations rebuilt deterministically from its structured data (even legacy snapshots
// that predate the Why feature), while grammar/identity/filters restore exactly.
// ===================================================================================
const bareWhy=s=>s.replace(/[ـً-ْٰ]/g,'').replace(/[أإآٱ]/g,'ا');
function whyTokenOk(tok,label){
  assert(tok.why&&Array.isArray(tok.why.ar)&&tok.why.ar.length,`${label}: restored token has no Why`);
  assert(tok.why.ar.length===tok.why.en.length&&tok.why.ar.length===tok.why.ids.length,`${label}: restored Why ar/en/id mismatch`);
  tok.why.ar.concat(tok.why.en).forEach(l=>assert(l&&l.trim()&&!/undefined|null|\[object Object\]/.test(l),`${label}: bad restored Why line`));
  tok.why.ids.forEach(id=>assert(id&&!/FALLBACK|UNKNOWN|GENERIC/i.test(id),`${label}: restored Why fallback id ${id}`));
}
function genUntil(pred,tries=4000){
  elements.startFilter.value='any';elements.formFilter.value='any';elements.stateFilter.value='any';elements.signFilter.value='any';
  for(let i=0;i<tries;i++){context.nahwGenerate();const ex=api.currentExercise();if(pred(ex))return ex;}
  return null;
}
// (a) LEGACY snapshot (no persisted Why) restores with Why re-attached — the core integration point.
{
  const ex=genUntil(()=>true);
  const snap=api.createExerciseSnapshot(ex);
  assert(snap&&snap.schemaVersion===3&&snap.exerciseIdentity,'Could not create a current versioned snapshot');
  const legacy=JSON.parse(JSON.stringify(snap));
  legacy.schemaVersion=2;
  delete legacy.exerciseIdentity;
  legacy.tokens.forEach(t=>{delete t.why;delete t.phraseWhy;});         // simulate a pre-Why snapshot
  const restored=api.restoreExerciseSnapshot(legacy);
  assert(restored,'A legacy (pre-Why) snapshot failed to restore');
  assert(restored.sentence===snap.sentence&&restored.translation===snap.translation&&restored.templateId===snap.templateId,'Legacy restore changed the exercise identity');
  restored.tokens.forEach((t,i)=>{
    whyTokenOk(t,`legacy token ${i}`);
    if(t.phraseAr)assert(t.phraseWhy&&t.phraseWhy.ar.length,`legacy construction ${i}: phraseWhy not rebuilt`);
  });
}
// (b) End-to-end via the real click handler: restore, then Reveal, then the rendered answers must
//     contain working Why controls (real buttons, hidden regions, resolvable aria-controls).
{
  elements.clearHistoryBtn.dispatch('click');
  const a=genUntil(()=>true); const aSnap=JSON.parse(JSON.stringify(api.createExerciseSnapshot(a)));
  const b=genUntil(ex=>ex.sentence!==a.sentence);
  assert(b,'Could not generate a distinct second exercise');
  elements.startFilter.value='particle';elements.formFilter.value='fiveVerbs';elements.stateFilter.value='nasb';elements.signFilter.value='nunDropped';
  const filtersBefore=[elements.startFilter.value,elements.formFilter.value,elements.stateFilter.value,elements.signFilter.value].join('|');
  const historyBefore=storage.get('nahw-sentence-history-v1');
  const rb=element('historyReview');rb.setAttribute('data-history-index','1');   // index 1 = exercise a (newest-first)
  elements.historyList.dispatch('click',rb);
  const restored=api.currentExercise();
  assert(restored.sentence===aSnap.sentence&&restored.templateId===aSnap.templateId,'Click-restore did not restore the exact exercise');
  const rf=restored.tokens.find(t=>t.target),sf=aSnap.tokens.find(t=>t.target);
  assert(rf.word===sf.word&&rf.inflection===sf.inflection&&rf.state===sf.state&&rf.sign.id===sf.sign.id,'Click-restore lost the focus word / form / state / sign');
  restored.tokens.forEach((t,i)=>whyTokenOk(t,`click-restored token ${i}`));
  assert([elements.startFilter.value,elements.formFilter.value,elements.stateFilter.value,elements.signFilter.value].join('|')===filtersBefore,'Restore changed the active filters');
  assert(storage.get('nahw-sentence-history-v1')===historyBefore&&elements.historyToggle.textContent==='Sentence history (2)','Restore duplicated or rewrote history');
  assert(!elements.answerPanel.classList.contains('open'),'Restored exercise should load with iʿrāb hidden');
  elements.revealBtn.dispatch('click');
  const html=elements.answers.innerHTML;
  assert((html.match(/class="why-toggle"/g)||[]).length>=1,'Restored + revealed exercise has no Why controls');
  assert(/<div class="why-region" id="why-[tp]\d+" hidden>/.test(html),'Restored Why regions are not hidden by default');
  const wIds=[...html.matchAll(/<div class="why-region" id="([^"]+)"/g)].map(m=>m[1]);
  assert(new Set(wIds).size===wIds.length,'Restored exercise has duplicate Why region ids');
  [...html.matchAll(/aria-controls="(why-[^"]+)"/g)].forEach(m=>assert(wIds.includes(m[1]),`Restored aria-controls points at a missing region: ${m[1]}`));
  // sacred order on any restored construction card
  const card=html.split('<article').find(p=>p.includes('phrase-analysis'));
  if(card){const i1=card.indexOf('class="iraab"'),i2=card.indexOf('class="why-wrap"'),i3=card.indexOf('class="phrase-analysis"');
    assert(i1>=0&&i2>=0&&i3>=0&&i1<i2&&i2<i3,'Restored card broke the individual-iʿrāb → Why → construction order');}
  elements.revealBtn.dispatch('click');
}
// (c) Specific restored structures carry their exact Why rule.
const structGoldens=[
  ['five-noun attached kāf',ex=>ex.tokens.find(t=>t.grammar.isMudaf&&t.grammar.attachedKaf),'WHY_MUDAF_ATTACHED_KAF'],
  ['five verbs',ex=>ex.tokens.find(t=>t.inflection==='afalKhamsa'),null,t=>t.why.ids.some(id=>/WHY_SIGN_AFAL5_/.test(id))],
  ['verbal-sentence khabar',ex=>ex.tokens.find(t=>t.phraseWhy&&t.phraseWhy.ids.includes('WHY_REL_VERBAL_KHABAR')),null,null,'WHY_REL_VERBAL_KHABAR'],
  ['fronted phrase khabar',ex=>ex.tokens.find(t=>t.phraseWhy&&t.phraseWhy.ids.includes('WHY_REL_FRONTED_KHABAR')),null,null,'WHY_REL_FRONTED_KHABAR']
];
for(const [name,find,tokenId,tokenPred,relId] of structGoldens){
  const ex=genUntil(e=>Boolean(find(e)));
  assert(ex,`Combined restore golden never generated: ${name}`);
  const snap=api.createExerciseSnapshot(ex);
  const legacy=JSON.parse(JSON.stringify(snap));legacy.tokens.forEach(t=>{delete t.why;delete t.phraseWhy;});
  const restored=api.restoreExerciseSnapshot(legacy);
  const tok=find(restored);
  assert(tok,`${name}: target token vanished after restore`);
  if(tokenId)assert(tok.why.ids.includes(tokenId),`${name}: restored token missing rule ${tokenId}`);
  if(tokenPred)assert(tokenPred(tok),`${name}: restored token predicate failed`);
  if(relId)assert(tok.phraseWhy.ids.includes(relId),`${name}: restored construction missing rule ${relId}`);
}
elements.clearHistoryBtn.dispatch('click');
elements.startFilter.value='any';elements.formFilter.value='any';elements.stateFilter.value='any';elements.signFilter.value='any';
console.log('Combined History+Why audit passed: legacy-snapshot Why rebuild, click-restore Why UI, and restored five-noun kāf / five-verb / verbal-khabar / fronted-khabar rules all verified.');

const definitionItems=api.grammarDefinitionGroups.flatMap(group=>group.items);
assert(api.grammarDefinitionGroups.length===5,'Expected five definition groups');
assert(definitionItems.length===70,`Expected 70 grammar definitions, found ${definitionItems.length}`);
assert(definitionItems.every(item=>item.arTerm&&item.enTerm&&item.ar&&item.en),'A grammar definition is incomplete');
assert(definitionItems.every(item=>item.source?.book&&item.source?.pdfPages?.length),'A grammar definition lacks its Al-Tuḥfah source pages');
assert(new Set(definitionItems.map(item=>item.arTerm)).size===definitionItems.length,'Two Arabic definition terms are duplicated');
assert(new Set(definitionItems.map(item=>item.enTerm)).size===definitionItems.length,'Two English definition terms are duplicated');
for(const required of ['Noun (ism)','Verb (fiʿl)','Particle (ḥarf)','Singular noun','Mubtadaʾ','Khabar','Single-word khabar','Sentence khabar','Phrase-like khabar construction','Subject / doer (fāʿil)','Explicit subject','Pronominal subject','Direct object','Kāna and its sisters','Ism of kāna','Khabar of kāna']){
  assert(definitionItems.some(item=>item.enTerm===required),`Missing required definition: ${required}`);
}
assert(elements.definitionsToggle.textContent==='Simple grammar definitions (70)','Definition count was not rendered');
assert((elements.definitionsList.innerHTML.match(/class="definition-card"/g)||[]).length===70,'Not every definition was rendered');
assert(elements.definitionsList.innerHTML.includes('التُّحْفَة')===false,'Source note was unexpectedly duplicated inside the definition list');
assert(html.includes('https://islamhouse.com/ar/books/334271'),'The Al-Tuhfah al-Saniyyah source link is missing');
elements.definitionsToggle.dispatch('click');
assert(elements.definitionsPanel.classList.contains('open'),'Definitions tab did not open its panel');
assert(elements.definitionsToggle.getAttribute('aria-expanded')==='true','Definitions tab did not expose its open state');

const mainNounKinds=['singularPeople','singularThings','places','brokenHuman','brokenThings','duals','smp','sfp','fiveNouns'];
const mainNounEntries=mainNounKinds.flatMap(name=>api.nounLexicons[name]);
assert(mainNounEntries.length===302,`Structured noun audit found ${mainNounEntries.length} entries instead of 302`);
const repeatedNounMeanings=[...new Set(mainNounEntries.map(item=>item.en).filter((meaning,index,all)=>all.indexOf(meaning)!==index))];
assert(repeatedNounMeanings.length===0,`The ${mainNounEntries.length} main noun entries repeat: ${repeatedNounMeanings.join(', ')}`);
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
const excludedDiptoteBrokenPlurals=['الْعُلَمَاءُ','الْأَصْدِقَاءُ','الْأَطِبَّاءُ','الْمَسَاجِدُ','النَّوَافِذُ','الْحَقَائِبُ','الرَّسَائِلُ','الْحَدَائِقُ','التَّقَارِيرُ','الْمَشَارِيعُ','الْمَصَانِعُ','الْمَتَاحِفُ','الْمَلَاعِبُ','الْبَرَامِجُ'];
assert(excludedDiptoteBrokenPlurals.every(surface=>!api.nounLexicons.brokenThings.some(noun=>noun.nom===surface)),'A deliberately excluded diptote broken plural remains in the regular broken-plural table');
assert(api.nounLexicons.singularThings.some(noun=>noun.nom==='الْخُضَارُ'&&noun.en==='the vegetables'),'The corrected vegetables entry is missing');
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
const sourceSafeVerbGroups={
 'نَشَرَ':'broadcast','رَبَطَ':'tieable','فَكَّ':'tieable','وَضَعَ':'portable','سَرَقَ':'portable',
 'اِسْتَعَارَ':'lendable','أَعَارَ':'lendable','حَلَّ':'solvable','أَثْبَتَ':'provable','نَاقَشَ':'discussable',
 'جَادَلَ':'people','رَدَّ':'claim','أَنْكَرَ':'claim','قَيَّمَ':'evaluable','عَبَرَ':'crossable','وَصَّلَ':'connectable',
 'حَمَّلَ':'downloadable','مَسَحَ':'surface','كَبَّرَ':'visualMedia','صَغَّرَ':'visualMedia','دَوَّرَ':'rotatable',
 'اِخْتَارَ':'selectable','بَدَّلَ':'replaceable','غَيَّرَ':'replaceable','وَجَدَ':'portable','فَقَدَ':'portable',
 'بَاعَ':'tradable','مَلَكَ':'ownable','طَلَبَ':'requestable','قَبِلَ':'acceptable','رَفَضَ':'acceptable',
 'فَضَّلَ':'desirable','أَرَادَ':'desirable','اِكْتَشَفَ':'discoverable','لَمَسَ':'touchable',
 'صَوَّرَ':'photographable','أَضَافَ':'addable'
};
for(const [past,group] of Object.entries(sourceSafeVerbGroups)){
  const verb=api.verbLexicons.additionalVerbActions.find(item=>item.past===past);
  assert(verb?.group===group,`${past}: expected audited object group ${group}`);
  assert(api.objectGroups[group]?.length,`${past}: audited object group ${group} is empty`);
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
assert(uniquePresentRecords.size+api.verbLexicons.femininePastActions.length===239,'The structured vocabulary does not contain 239 unique verb families');

const PLAIN_KHABAR=/(^|[\s:،])خَبَر[ٌٍ](?=$|[\s،.])/u;
const stats={
  templates:api.templates.length,sentences:0,nominal:0,directKhabar:0,
  verbalKhabar:0,phraseKhabar:0,frontedKhabar:0,innaPairs:0,filterStates:0
};
const templateSourceDependencies=new Map();
const testSourceDependencies=new Map();
function recordSourceDependencies(data){
  const destination=/^T_[A-Z0-9_]+_\d{2}$/.test(data.templateId)?templateSourceDependencies:testSourceDependencies;
  const ruleIds=new Set([
    ...data.tokens.flatMap(token=>[token.ruleId,token.signRuleId]).filter(Boolean),
    ...data.relationships.map(relationship=>relationship.ruleId).filter(Boolean)
  ]);
  for(const ruleId of ruleIds){
    if(!destination.has(ruleId))destination.set(ruleId,new Set());
    destination.get(ruleId).add(data.templateId);
  }
}

function countTokens(data,pattern){return data.tokens.filter(token=>pattern.test(token.ar)).length}
function analysisText(token){return`${token.ar||''} ${token.phraseAr||''}`}
function assertGenitiveTerminology(token,label){
  const arabic=token.ar||'';
  assert(!/مَجْرُورٌ[\s\S]*عَلَامَةُ خَفْضِهِ/u.test(arabic),`${label}: mixed majrūr with ʿalāmatu khafḍihi`);
  assert(!/مَخْفُوضٌ[\s\S]*عَلَامَةُ جَرِّهِ/u.test(arabic),`${label}: mixed makhfūḍ with ʿalāmatu jarrihi`);
  if(arabic.includes('مَجْرُورٌ'))assert(arabic.includes('عَلَامَةُ جَرِّهِ'),`${label}: majrūr lacks its matching sign terminology`);
  if(arabic.includes('مَخْفُوضٌ'))assert(arabic.includes('عَلَامَةُ خَفْضِهِ'),`${label}: makhfūḍ lacks its matching sign terminology`);
  if(arabic.includes('عَلَامَةُ جَرِّهِ'))assert(arabic.includes('مَجْرُورٌ'),`${label}: jar sign lacks its matching state terminology`);
  if(arabic.includes('عَلَامَةُ خَفْضِهِ'))assert(arabic.includes('مَخْفُوضٌ'),`${label}: khafḍ sign lacks its matching state terminology`);
}
function assertNominalPair(data,label){
  assert(data&&Array.isArray(data.tokens),`${label}: invalid generated data`);
  assert(data.sentence&&data.translation,`${label}: missing sentence or translation`);
  assert(!data.translation.includes('undefined'),`${label}: undefined translation`);
  recordSourceDependencies(data);
  data.tokens.forEach((token,index)=>assertGenitiveTerminology(token,`${label}, token ${index+1}`));

  const mubtadaIndexes=data.tokens.map((token,index)=>token.ar.includes('مُبْتَدَأٌ')?index:-1).filter(index=>index>=0);
  const khabarIndexes=data.tokens.map((token,index)=>PLAIN_KHABAR.test(analysisText(token))?index:-1).filter(index=>index>=0);
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
    assert(khabar.phraseAr.includes('جَارٌّ وَمَجْرُورٌ')||khabar.phraseAr.includes('ظَرْفٌ'),`${label}: delayed mubtada lacks its complete attached expression`);
    assert(khabar.phraseAr.includes('مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ مُقَدَّمٍ'),`${label}: delayed mubtada lacks its source-grounded omitted fronted khabar`);
    assert(khabar.phraseAr.includes(`«${mubtada.word}»`),`${label}: fronted khabar does not name its delayed mubtada`);
    const phrase=data.tokens.slice(0,mubtadaIndex).map(token=>token.word).join(' ');
    assert(khabar.phraseAr.includes(phrase),`${label}: fronted khabar omits the complete phrase “${phrase}”`);
  }else if(verbIndex>=0){
    stats.verbalKhabar++;
    const verb=data.tokens[verbIndex];
    const clause=data.tokens.slice(mubtadaIndex+1).map(token=>token.word).join(' ');
    const constructionEnd=data.tokens.at(-1);
    assert(khabar===constructionEnd,`${label}: verbal khabar was not attached after its final component`);
    assert(constructionEnd.phraseAr.includes('الْجُمْلَةُ الْفِعْلِيَّةُ'),`${label}: missing verbal-sentence label`);
    assert(constructionEnd.phraseAr.includes('فِي مَحَلِّ رَفْعٍ خَبَرٌ'),`${label}: verbal sentence is not labeled as khabar`);
    assert(constructionEnd.phraseAr.includes(`«${clause}»`),`${label}: khabar omits the complete verbal sentence “${clause}”`);
    assert(constructionEnd.phraseAr.includes(`«${mubtada.word}»`),`${label}: verbal khabar does not name its mubtada`);
    assert(constructionEnd.phraseAr.includes('الرَّابِطُ'),`${label}: verbal khabar has no link back to its mubtada`);
    assert(constructionEnd.phraseEn.startsWith('Together,'),`${label}: verbal-sentence English is not a separate combined analysis`);
    if(constructionEnd!==verb)assert(!verb.phraseAr&&!verb.phraseEn,`${label}: verb card contains combined analysis before a later component`);
    // The rābiṭ must be whatever the verb's own subject actually is: the attached pronoun of a
    // five-verb form, or its hidden pronoun. A fronted feminine mubtadaʾ takes «هِيَ», so the
    // link is checked against the verb's real pronoun rather than a fixed «هُوَ».
    if(verb.ar.includes('الْأَفْعَالِ الْخَمْسَةِ')){
      const attachedKind=(verb.components||[]).find(component=>component.syntacticRole==='fail');
      assert(attachedKind&&attachedKind.category==='pronoun'&&attachedKind.mahall==='raf',`${label}: five-verb lacks its structured attached subject component`);
      assert(['waw-jamaaah','alif-ithnain'].includes(attachedKind.kind),`${label}: five-verb verbal khabar has an unexpected attached subject ${attachedKind.kind}`);
      assert(constructionEnd.phraseAr.includes(attachedKind.nameAr),`${label}: five-verb khabar lacks its attached-pronoun link`);
    }else{
      // The expected pronoun is derived from the canonical person resolved by the production
      // morphology authority — never from the learner-facing strings under test. A 3fs
      // exercise rendering «هُوَ» (or a 3ms rendering «هِيَ») therefore fails here.
      const canonicalPerson=api.authoritativeVerbMorphology(verb,data).person;
      const canonicalPronoun=api.PRESENT_HIDDEN_SUBJECTS[canonicalPerson];
      assert(canonicalPronoun,`${label}: no canonical hidden pronoun for resolved person ${canonicalPerson}`);
      const hidden=`«${canonicalPronoun}»`;
      assert(verb.ar.includes('ضَمِيرٌ مُسْتَتِرٌ جَوَازًا'),`${label}: regular verbal khabar lacks hidden subject`);
      assert(verb.ar.includes(hidden),`${label}: hidden subject is not identified`);
      assert(constructionEnd.phraseAr.includes(hidden),`${label}: verbal khabar lacks the hidden-subject link`);
    }
  }else if(khabar.phraseAr.includes('مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ')){
    stats.phraseKhabar++;
    assert(khabar.phraseAr.includes(`«${mubtada.word}»`),`${label}: phrase-like khabar does not name its mubtada`);
    const phraseStart=data.tokens.findIndex((token,index)=>index>mubtadaIndex&&(token.ar.includes('حَرْفُ خَفْضٍ')||token.ar.includes('ظَرْفٌ')));
    assert(phraseStart>=0,`${label}: phrase-like khabar has no phrase lead`);
    const phrase=data.tokens.slice(phraseStart).map(token=>token.word).join(' ');
    assert(khabar.phraseAr.includes(phrase),`${label}: phrase-like khabar omits the complete phrase “${phrase}”`);
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
  sentence:'الْخَيَّاطُ يَزُورُ الطَّبِيبَاتِ',translation:'The tailor visits the female doctors.',
  tokens:[
    api.makeToken('الْخَيَّاطُ','the tailor',api.specs.mubtada('الْخَيَّاطُ')),
    api.makeToken('يَزُورُ','visits',api.specs.presentPred('يَزُورُ')),
    api.makeToken('الطَّبِيبَاتِ','the female doctors',api.specs.object('الطَّبِيبَاتِ'),'',true)
  ]
});
assertNominalPair(exact,'exact tailor/doctors case');
assert(!exact.tokens[1].phraseAr,'Exact case put the verbal-sentence khabar on the verb before its object');
assert(exact.tokens[2].ar.startsWith('الطَّبِيبَاتِ: مَفْعُولٌ بِهِ مَنْصُوبٌ'),'Exact object lost its individual iʿrāb');
assert(exact.tokens[2].phraseAr.includes('«الْخَيَّاطُ»'),'Exact combined analysis does not link huwa back to the tailor');
assert(exact.tokens[2].phraseAr.includes('«يَزُورُ الطَّبِيبَاتِ»'),'Exact combined analysis omits the complete verbal sentence');

api.render(exact);
const exactVerbalCards=elements.answers.innerHTML.split('<article').slice(1);
assert(!exactVerbalCards[1].includes('phrase-analysis'),'Rendered verb card contains combined khabar analysis before its object');
assert(exactVerbalCards[2].includes('مَفْعُولٌ بِهِ مَنْصُوبٌ'),'Rendered object card lost its individual iʿrāb');
assert(exactVerbalCards[2].indexOf('class="english en-only"')<exactVerbalCards[2].indexOf('class="phrase-analysis"'),'Rendered verbal-sentence analysis does not follow the object’s individual Arabic and English');
assert(exactVerbalCards[2].includes('<strong>Sentence:</strong>'),'Rendered verbal construction is not labeled as a sentence');

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
assert(exactFronted.tokens[0].ar.startsWith('فِي: حَرْفُ خَفْضٍ'),'Exact fronted case lost the individual preposition analysis');
assert(!exactFronted.tokens[0].phraseAr,'Exact fronted case appended phrase analysis to the preposition card');
assert(exactFronted.tokens[1].ar.includes('اسْمٌ مَخْفُوضٌ بِـ«فِي»'),'Exact fronted case lost the governed noun analysis');
assert(exactFronted.tokens[1].phraseAr.includes('«فِي السُّوقِ»: جَارٌّ وَمَجْرُورٌ'),'Exact fronted case omits the complete phrase after the governed noun');
assert(exactFronted.tokens[1].phraseAr.includes('مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ مُقَدَّمٍ'),'Exact fronted case omits the source-grounded fronted khabar');
assert(!exactFronted.tokens[1].phraseAr.includes('شِبْهُ جُمْلَةٍ فِي مَحَلِّ رَفْعٍ خَبَرٌ'),'Exact fronted case restored the superseded phrase-in-position wording');
assert(exactFronted.tokens[1].phraseEn.startsWith('Together,'),'Exact fronted case lacks the separate English phrase explanation');
assert(exactFronted.tokens[2].ar.includes('مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ'),'Exact fronted case lost the delayed mubtada analysis');

api.render(exactFronted);
const exactFrontedCards=elements.answers.innerHTML.split('<article').slice(1);
assert(!exactFrontedCards[0].includes('phrase-analysis'),'Rendered preposition card contains combined phrase analysis');
assert(exactFrontedCards[1].includes('اسْمٌ مَخْفُوضٌ بِـ«فِي»'),'Rendered governed noun card does not begin with its individual analysis');
assert(exactFrontedCards[1].indexOf('class="iraab"')<exactFrontedCards[1].indexOf('class="phrase-analysis"'),'Rendered combined phrase does not follow the noun analysis');
assert(exactFrontedCards[1].indexOf('class="english en-only"')<exactFrontedCards[1].indexOf('class="phrase-analysis"'),'Rendered combined phrase does not follow the noun English explanation');
assert(exactFrontedCards[1].includes('class="phrase-analysis-ar"')&&exactFrontedCards[1].includes('class="phrase-analysis-en en-only"'),'Rendered noun card does not separate Arabic and English phrase analysis');

const exactAdverbPhrase=api.completeNominalAnalysis({
  templateId:'TEST_EXACT_ADVERB_PHRASE',sentence:'زَيْدٌ أَمَامَ الْبَيْتِ',translation:'Zayd is in front of the house.',
  tokens:[
    api.makeToken('زَيْدٌ','Zayd',api.specs.mubtada('زَيْدٌ')),
    api.makeToken('أَمَامَ','in front of',api.specs.adverbMudaf('أَمَامَ')),
    api.makeToken('الْبَيْتِ','the house',api.specs.mudafIlayh('الْبَيْتِ'),'',true)
  ]
});
assert(!exactAdverbPhrase.tokens[1].phraseAr,'Adverbial phrase analysis was appended before all component words were analyzed');
assert(exactAdverbPhrase.tokens[2].phraseAr.includes('«أَمَامَ الْبَيْتِ»: ظَرْفٌ مُتَعَلِّقٌ'),'Adverbial phrase analysis was not placed after its final governed noun');
assertGenitiveTerminology(exactAdverbPhrase.tokens[2],'adverbial muḍāf ilayh');

// Direct rule-engine tests: every surface, state, sign, governor, and relationship
// must be derived from the same structured representation.
assert(new Set(api.templates.map(template=>template.stableId)).size===api.templates.length,'Stable template IDs are not unique');
assert(api.templates.every(template=>/^T_[A-Z0-9_]+_\d{2}$/.test(template.stableId)),'A template lacks a stable auditable ID');
assert(Object.keys(api.GRAMMAR_RULES.nounInflection).length===6,'The noun declension matrix is incomplete');
assert(Object.keys(api.GRAMMAR_RULES.presentVerb.regular).join(',')==='raf,nasb,jazm','Regular present moods are incomplete');
assert(Object.keys(api.GRAMMAR_RULES.presentVerb.afalKhamsa).join(',')==='raf,nasb,jazm','Five-verb moods are incomplete');
assert(api.GRAMMAR_COVERAGE_MATRIX.deliberatelyNotGenerated.includes('diptote'),'Unsupported diptotes are not recorded in the coverage matrix');
assert(Object.keys(api.SOURCE_REGISTRY).length===64,`Expected 64 source-registry entries, found ${Object.keys(api.SOURCE_REGISTRY).length}`);
assert(Object.entries(api.SOURCE_REGISTRY).every(([ruleId,entry])=>entry.ruleId===ruleId),
  'A canonical source record is not bound to its owning SOURCE_REGISTRY key');
assert(Object.values(api.REVIEWED_SOURCE_EVIDENCE).every(evidence=>
  api.SOURCE_REGISTRY[evidence.ruleId]&&evidence.authority===api.REVIEWED_SOURCE_AUTHORITIES[evidence.authorityId]),
  'Reviewed evidence is not bound to both a real owner rule and a canonical authority');
assert(api.SOURCE_REGISTRY.R_PARTICLE.status===api.SOURCE_STATUS.DISABLED&&!api.SOURCE_REGISTRY.R_PARTICLE.productionEnabled,'Generic particle fallback is not disabled');
assert(Object.entries(api.SOURCE_REGISTRY).filter(([id])=>id!=='R_PARTICLE').every(([id])=>api.isSourceAuthorized(id)), 'An enabled rule is not authorized by its basis-specific source gate');
assert(Object.entries(api.SOURCE_REGISTRY).filter(([,entry])=>entry.basis==='nahw-rule').every(([,entry])=>entry.primarySource?.pdfPages?.length&&entry.primarySource?.edition&&(entry.primarySource?.url||entry.primarySource?.stableIdentifier)), 'An enabled nahw rule lacks edition-identified source metadata');
// Phase-0 component source rules must honestly distinguish Al-Tuḥfah-grounded nahw rulings
// (تاء التأنيث, واو الجماعة) from the orthographic-only ألف الفارقة convention. These checks verify
// the BASIS, the metadata STRUCTURE, and the AUTHORIZATION BEHAVIOUR only — never that a PDF page
// number equals a hard-coded value (that would merely re-assert the numbers typed into the code).
// PDF-page correctness against the workspace scan is a human/source-verification responsibility,
// recorded in each rule's conditions text.
assert(api.SOURCE_REGISTRY.C_WAW_JAMAAH_FAIL.basis==='nahw-rule'&&api.SOURCE_REGISTRY.C_TAA_TANIITH_SAKINA.basis==='nahw-rule','Al-Tuḥfah-grounded component rules must be identified as nahw rules');
assert(api.SOURCE_REGISTRY.C_WAW_JAMAAH_FAIL.primarySource.pdfPages.length&&api.SOURCE_REGISTRY.C_TAA_TANIITH_SAKINA.primarySource.pdfPages.length,'Nahw component rules must carry primary-source pages');
const alifSource=api.SOURCE_REGISTRY.C_ALIF_FARIQA;
assert(alifSource.basis==='orthographic-rule'&&alifSource.status===api.SOURCE_STATUS.VERIFIED_ORTHOGRAPHIC,'الألف الفارقة must use the distinct verified-orthographic source class');
assert(alifSource.orthographicAuthority?.name&&(alifSource.orthographicAuthority?.url||alifSource.orthographicAuthority?.stableIdentifier)&&alifSource.orthographicAuthority?.verificationStatus==='verified-direct','الألف الفارقة lacks a fully identified, verified orthographic authority');
assert(alifSource.attestation?.evidenceType==='form-only'&&alifSource.attestation?.source?.evidenceType==='form-only','Al-Tuḥfah spelling evidence must remain form-only attestation');
assert(api.isSourceRecordAuthorized('C_ALIF_FARIQA',alifSource),'The properly identified verified orthographic authority was rejected');
assert(api.isSourceAuthorized('R_MUBTADA_RAF'),'A normal verified nahw rule was rejected');
for(const ruleId of [
  'R_PAST_FATH_VISIBLE','R_PAST_FATH_EST_MUNASABAH','R_PAST_FATH_EST_INCIDENTAL_SUKUN',
  'C_TAA_FAIL_1S','C_TAA_FAIL_2MS','C_TAA_FAIL_2FS','C_NAA_FAILIN','C_ALIF_ITHNAIN','C_NUUN_NISWAH',
  'C_YAA_MUKHATABA'
]){
  assert(api.isSourceAuthorized(ruleId),`Phase-1 source rule ${ruleId} is not authorized`);
}
const dualAlifSource=api.SOURCE_REGISTRY.C_ALIF_ITHNAIN;
const reviewedDakurAuthority=api.REVIEWED_SOURCE_AUTHORITIES.DAKUR_APPLIED_GRAMMAR_2E;
const canonicalDualAlifSupport=dualAlifSource.secondarySources[0];
assert(dualAlifSource.primarySource.evidenceType==='form-context'
  &&dualAlifSource.secondaryRuleSupport===true
  &&dualAlifSource.secondaryRuleId==='C_ALIF_ITHNAIN'
  &&canonicalDualAlifSupport?.evidenceType==='rule-support'
  &&canonicalDualAlifSupport?.authority===reviewedDakurAuthority,
  'Dual-alif rule does not honestly separate Al-Tuḥfah context from Daʿkūr’s exact component support');
assert(api.isSourceRecordAuthorized('C_ALIF_ITHNAIN',dualAlifSource),'Canonical reviewed Daʿkūr authority and exact component claim were rejected');
assert(api.isCanonicalReviewedEvidence(
  canonicalDualAlifSupport.id,canonicalDualAlifSupport,'C_ALIF_ITHNAIN','rule-support','DAKUR_APPLIED_GRAMMAR_2E'
),'Canonical Daʿkūr evidence did not pass the production evidence gate');

let sourceAuthorizationAttackCases=0;
function assertSourceRecordRejected(name,ownerRuleId,candidate){
  assert(!api.isSourceRecordAuthorized(ownerRuleId,candidate),name);
  sourceAuthorizationAttackCases++;
}
function assertEvidenceRejected(name,evidenceId,candidate,ownerRuleId,evidenceType,authorityId){
  assert(!api.isCanonicalReviewedEvidence(evidenceId,candidate,ownerRuleId,evidenceType,authorityId),name);
  sourceAuthorizationAttackCases++;
}
const ordinaryPrimary=api.SOURCE_REGISTRY.R_MUBTADA_RAF;
const genericPrimary={
  ruleId:'R_MUBTADA_RAF',basis:'nahw-rule',status:api.SOURCE_STATUS.VERIFIED_PRIMARY,productionEnabled:true,
  primaryEvidenceId:'FABRICATED:PRIMARY',
  primarySource:{book:'Fabricated grammar',author:'Nobody',edition:'1',stableIdentifier:'fake:primary',pdfPages:[1],evidenceType:'rule-support'}
};
assertSourceRecordRejected('A generic fabricated primary source was authorized','R_MUBTADA_RAF',genericPrimary); // A
assertSourceRecordRejected('Copied primary metadata in a new object was authorized','R_MUBTADA_RAF',{
  ...ordinaryPrimary,primarySource:{...ordinaryPrimary.primarySource}
}); // B
assertSourceRecordRejected('Correct Tuḥfah evidence attached to the wrong rule was authorized','R_FAIL_RAF',{
  ...api.SOURCE_REGISTRY.R_FAIL_RAF,
  primaryEvidenceId:ordinaryPrimary.primaryEvidenceId,
  primarySource:ordinaryPrimary.primarySource
}); // C
assertSourceRecordRejected('A generic fabricated orthographic source was authorized','C_ALIF_FARIQA',{
  ruleId:'C_ALIF_FARIQA',basis:'orthographic-rule',status:api.SOURCE_STATUS.VERIFIED_ORTHOGRAPHIC,productionEnabled:true,
  orthographicAuthority:{name:'Fabricated',title:'Fabricated',stableIdentifier:'fake:orthography',relevantLocation:'fabricated',verificationStatus:'verified-direct'}
}); // D
assertSourceRecordRejected('Copied orthographic public metadata was authorized','C_ALIF_FARIQA',{
  ...alifSource,orthographicAuthority:{...alifSource.orthographicAuthority}
}); // E
assertSourceRecordRejected('Correct orthographic authority attached to an unrelated rule was authorized','R_MUBTADA_RAF',alifSource); // F
assertSourceRecordRejected('A generic fabricated secondary source was authorized','C_ALIF_ITHNAIN',{
  ...dualAlifSource,
  secondarySources:[{authorityId:'FABRICATED',ruleId:'C_ALIF_ITHNAIN',evidenceType:'rule-support',pdfPages:[86],exactClaim:'fabricated'}]
}); // G
assertSourceRecordRejected('Copied Daʿkūr metadata in a new object was authorized','C_ALIF_ITHNAIN',{
  ...dualAlifSource,secondarySources:[{...canonicalDualAlifSupport,authority:{...reviewedDakurAuthority}}]
}); // H
assertSourceRecordRejected('Correct Daʿkūr authority with the wrong rule was authorized','R_MUBTADA_RAF',{
  ...ordinaryPrimary,secondaryRuleSupport:true,secondaryRuleId:'C_ALIF_ITHNAIN',secondarySources:[canonicalDualAlifSupport]
}); // I
assertSourceRecordRejected('Correct Daʿkūr evidence attached to an unrelated registry entry was authorized','R_MUBTADA_RAF',dualAlifSource); // J
assertEvidenceRejected('Daʿkūr evidence with a wrong exactClaim was authorized',
  canonicalDualAlifSupport.id,{...canonicalDualAlifSupport,exactClaim:'wrong'},'C_ALIF_ITHNAIN','rule-support','DAKUR_APPLIED_GRAMMAR_2E'); // K
const missingExactClaim={...canonicalDualAlifSupport};delete missingExactClaim.exactClaim;
assertEvidenceRejected('Daʿkūr evidence without exactClaim was authorized',
  canonicalDualAlifSupport.id,missingExactClaim,'C_ALIF_ITHNAIN','rule-support','DAKUR_APPLIED_GRAMMAR_2E'); // L
assertEvidenceRejected('Daʿkūr evidence with a wrong scope was authorized',
  canonicalDualAlifSupport.id,{...canonicalDualAlifSupport,scope:'wrong'},'C_ALIF_ITHNAIN','rule-support','DAKUR_APPLIED_GRAMMAR_2E'); // M
assertEvidenceRejected('Daʿkūr evidence with a wrong page was authorized',
  canonicalDualAlifSupport.id,{...canonicalDualAlifSupport,pdfPages:[87]},'C_ALIF_ITHNAIN','rule-support','DAKUR_APPLIED_GRAMMAR_2E'); // N
assertEvidenceRejected('Form-only evidence authorized a grammar rule',
  alifSource.attestationEvidenceId,alifSource.attestation.source,'C_ALIF_FARIQA','rule-support','TUHFA_QATAR_WORKSPACE'); // O
assert(sourceAuthorizationAttackCases===15,'The required A–O source-authorization matrix was not completed');
assert(api.isSourceAuthorized('R_MUBTADA_RAF'),'Ordinary primary-source authorization regressed');

function structuredCase(templateId,translation,tokens){
  const data=api.completeNominalAnalysis({templateId,sentence:'',translation,tokens});
  recordSourceDependencies(data);
  return data;
}
function targetOf(data){return data.tokens.find(token=>token.target)}
function relationTypes(data){return new Set(data.relationships.map(rel=>rel.type))}
function clone(value){return JSON.parse(JSON.stringify(value))}
// Arabic literals in this project are written with the traditional shadda-before-kasra
// order, which is not Unicode NFC. Compare Arabic through NFC so a diacritic-ordering
// difference can never masquerade as a grammatical failure.
const nfc=value=>String(value==null?'':value).normalize('NFC');
const arHas=(haystack,needle)=>nfc(haystack).includes(nfc(needle));
const arEq=(left,right)=>nfc(left)===nfc(right);
function assertFailureCode(name,data,code){
  const codes=api.validateExercise(data).map(failure=>failure.code);
  assert(codes.includes(code),`${name}: expected ${code}, received ${codes.join(', ')||'no failures'}`);
}

const arrange=api.verbs.find(verb=>verb.past==='رَتَّبَ');
assert(arrange,'The arrange verb is missing');
const write=api.verbs.find(verb=>verb.past==='كَتَبَ');
assert(write,'The write verb is missing');
const hear=api.verbs.find(verb=>verb.past==='سَمِعَ');
assert(hear,'The hear verb is missing');
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
    // Non-3mp derived forms remain a harness-only legacy helper. Phase 2 production
    // deliberately does not authorize those surfaces, especially outside rafʿ.
    if(person!=='3mp')continue;
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
const goldenFiveVerbs=[
 structuredCase('TEST_GOLDEN_AFAL5_RAF','They write.',[
  api.makeToken(write.five,'they write',{...api.specs.presentFive(write.pres),person:'3mp'},'',true)
 ]),
 structuredCase('TEST_GOLDEN_AFAL5_NASB','They will not write.',[
  api.makeToken('لَنْ','will not',api.specs.lan('لَنْ')),
  api.makeToken(write.fiveSub,'they write',{...api.specs.presentFive(write.pres),person:'3mp'},'',true)
 ]),
 structuredCase('TEST_GOLDEN_AFAL5_JAZM','They did not write.',[
  api.makeToken('لَمْ','did not',api.specs.lam('لَمْ')),
  api.makeToken(write.fiveSub,'they write',{...api.specs.presentFive(write.pres),person:'3mp'},'',true)
 ])
];
assert(goldenFiveVerbs.map(item=>item.sentence).join('|')==='يَكْتُبُونَ|لَنْ يَكْتُبُوا|لَمْ يَكْتُبُوا','Five-verb golden surfaces changed');
assert(goldenFiveVerbs[0].tokens[0].ar.includes('ثُبُوتُ النُّونِ'),'Indicative five-verb golden case lost retention of nūn');
assert(goldenFiveVerbs[1].tokens[1].ar.includes('حَذْفُ النُّونِ')&&goldenFiveVerbs[2].tokens[1].ar.includes('حَذْفُ النُّونِ'),'Accusative/jussive five-verb golden cases lost deletion of nūn');

function assertDeferredVerbalKhabar(data,label,expectsObject=true){
  assertNominalPair(data,label);
  const relation=data.relationships.find(rel=>rel.type==='mubtadaKhabar'&&rel.khabarKind==='verbalSentence');
  assert(relation,`${label}: verbal-sentence relationship is missing`);
  const components=relation.tokenIds.map(id=>data.tokens.find(token=>token.id===id));
  const verb=components.find(token=>token.grammar.type==='verb');
  const recipient=components.at(-1);
  assert(components.slice(0,-1).every(token=>!token.phraseAr&&!token.phraseEn),`${label}: combined analysis appears before the final construction component`);
  assert(recipient.phraseAr.includes('الْجُمْلَةُ الْفِعْلِيَّةُ'),`${label}: final component lacks combined Arabic analysis`);
  assert(recipient.phraseEn.startsWith('Together,'),`${label}: final component lacks separate combined English analysis`);
  assert(recipient.phraseLabel==='Sentence',`${label}: combined verbal construction has the wrong display label`);
  if(expectsObject){
    assert(recipient.grammar.role==='object',`${label}: combined analysis was not assigned to the direct object`);
    assert(recipient.ar.includes('مَفْعُولٌ بِهِ مَنْصُوبٌ'),`${label}: direct object individual iʿrāb is missing`);
    assert(recipient!==verb,`${label}: verb incorrectly received combined analysis despite a later object`);
  }else{
    assert(recipient===verb,`${label}: verb-only construction did not retain its combined analysis after the verb`);
  }
}

const deferredVerbalKhabarCases=[
  structuredCase('TEST_DEFERRED_ORDINARY_OBJECT','The student writes the book.',[
    api.makeToken('الطَّالِبُ','the student',api.specs.mubtada('الطَّالِبُ')),
    api.makeToken(write.pres,'writes',api.specs.presentPred(write.pres)),
    api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'),'',true)
  ]),
  structuredCase('TEST_DEFERRED_FIVE_VERB_OBJECT','The workers hear the answer.',[
    api.makeToken('الْعُمَّالُ','the workers',api.specs.mubtada('الْعُمَّالُ')),
    api.makeToken(hear.five,'hear',{...api.specs.presentFive(hear.pres),person:'3mp'}),
    api.makeToken('الْجَوَابَ','the answer',api.specs.object('الْجَوَابَ'),'',true)
  ]),
  structuredCase('TEST_DEFERRED_LAM_OBJECT','The workers did not hear the answer.',[
    api.makeToken('الْعُمَّالُ','the workers',api.specs.mubtada('الْعُمَّالُ')),
    api.makeToken('لَمْ','did not',api.specs.lam('لَمْ')),
    api.makeToken(hear.fiveSub,'hear',{...api.specs.presentFive(hear.pres),person:'3mp'}),
    api.makeToken('الْجَوَابَ','the answer',api.specs.object('الْجَوَابَ'),'',true)
  ]),
  structuredCase('TEST_DEFERRED_SAWFA_OBJECT','The student will write the book.',[
    api.makeToken('الطَّالِبُ','the student',api.specs.mubtada('الطَّالِبُ')),
    api.makeToken('سَوْفَ','will',api.specs.future('سَوْفَ')),
    api.makeToken(write.pres,'write',api.specs.presentPred(write.pres)),
    api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'),'',true)
  ]),
  structuredCase('TEST_DEFERRED_LAN_OBJECT','The student will not write the book.',[
    api.makeToken('الطَّالِبُ','the student',api.specs.mubtada('الطَّالِبُ')),
    api.makeToken('لَنْ','will not',api.specs.lan('لَنْ')),
    api.makeToken(write.acc,'write',api.specs.presentPred(write.pres)),
    api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'),'',true)
  ])
];
for(const data of deferredVerbalKhabarCases)assertDeferredVerbalKhabar(data,data.templateId);

const verbOnlyKhabar=structuredCase('TEST_DEFERRED_VERB_ONLY','The student writes.',[
  api.makeToken('الطَّالِبُ','the student',api.specs.mubtada('الطَّالِبُ')),
  api.makeToken(write.pres,'writes',api.specs.presentPred(write.pres),'',true)
]);
assertDeferredVerbalKhabar(verbOnlyKhabar,'verb-only verbal khabar',false);

api.render(deferredVerbalKhabarCases[2]);
const deferredLamCards=elements.answers.innerHTML.split('<article').slice(1);
assert(!deferredLamCards[1].includes('phrase-analysis'),'Rendered lam card contains combined sentence analysis');
assert(!deferredLamCards[2].includes('phrase-analysis'),'Rendered five-verb card contains combined analysis before its object');
assert(deferredLamCards[3].includes('مَفْعُولٌ بِهِ مَنْصُوبٌ'),'Rendered lam example object lost its individual iʿrāb');
assert(deferredLamCards[3].indexOf('class="english en-only"')<deferredLamCards[3].indexOf('class="phrase-analysis"'),'Rendered lam example combined analysis does not follow the object’s individual analysis');
assert(deferredLamCards[3].includes('<strong>Sentence:</strong>'),'Rendered lam example is not labeled as a sentence-level analysis');

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
  {kind:'smp',nom:'الْمُسْلِمُونَ',acc:'الْمُسْلِمِينَ',gen:'الْمُسْلِمِينَ',signs:{raf:'waw',nasb:'ya',jarr:'ya'}},
  {kind:'sfp',nom:'الْمُسْلِمَاتُ',acc:'الْمُسْلِمَاتِ',gen:'الْمُسْلِمَاتِ',signs:{raf:'damma',nasb:'kasraSub',jarr:'kasra'}},
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

const phraseMorphologySamples=nounSamples.filter(sample=>['singular','dual','smp','fiveNouns'].includes(sample.kind));
for(const sample of phraseMorphologySamples){
  const data=structuredCase(`TEST_PHRASE_ORDER_${sample.kind}`,'The student is by the noun.',[
    api.makeToken('الطَّالِبُ','the student',api.specs.mubtada('الطَّالِبُ')),
    api.makeToken('إِلَى','to',api.specs.prep('إِلَى')),
    api.makeToken(sample.gen,'the noun',api.specs.majrur(sample.gen,'إِلَى'),'',true)
  ]);
  const preposition=data.tokens[1];
  const governedNoun=data.tokens[2];
  assert(preposition.ar==='إِلَى: حَرْفُ خَفْضٍ مَبْنِيٌّ لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ.',`${sample.kind}: preposition card is not limited to its own analysis`);
  assert(!preposition.phraseAr&&!preposition.phraseEn,`${sample.kind}: combined phrase was appended to the preposition card`);
  assert(governedNoun.ar.startsWith(`${governedNoun.word}: اسْمٌ مَخْفُوضٌ بِـ«إِلَى»`),`${sample.kind}: governed noun does not begin with its individual iʿrāb`);
  assert(governedNoun.phraseAr.includes(`«إِلَى ${governedNoun.word}»: جَارٌّ وَمَجْرُورٌ`),`${sample.kind}: Arabic combined phrase is missing after the noun`);
  assert(governedNoun.phraseEn.startsWith('Together,'),`${sample.kind}: English combined phrase is not separate`);
  assertGenitiveTerminology(governedNoun,`${sample.kind} phrase morphology`);
}

const deterministicStructures=[
  structuredCase('TEST_GOLDEN_DIRECT_NOMINAL','Zayd is hardworking.',[
    api.makeToken('زَيْدٌ','Zayd',api.specs.mubtada('زَيْدٌ'),'',true),
    api.makeToken('مُجْتَهِدٌ','hardworking',api.specs.khabar('مُجْتَهِدٌ'))
  ]),
  structuredCase('TEST_PHRASE_KHABAR','The student is in the school.',[
    api.makeToken('الطَّالِبُ','the student',api.specs.mubtada('الطَّالِبُ'),'',true),
    api.makeToken('فِي','in',api.specs.prep('فِي')),
    api.makeToken('الْمَدْرَسَةِ','the school',api.specs.majrur('الْمَدْرَسَةِ','فِي'))
  ]),
  structuredCase('TEST_GOLDEN_IDAFA','The student’s book is new.',[
    api.makeToken('كِتَابُ','book',api.specs.mudaf('كِتَابُ'),'',true),
    api.makeToken('الطَّالِبِ','the student',api.specs.mudafIlayh('الطَّالِبِ')),
    api.makeToken('جَدِيدٌ','new',api.specs.khabar('جَدِيدٌ'))
  ]),
  structuredCase('TEST_GOLDEN_INNA','Indeed, Zayd is hardworking.',[
    api.makeToken('إِنَّ','indeed',api.specs.particle({ar:'إِنَّ',iraab:'حَرْفُ تَوْكِيدٍ وَنَصْبٍ'})),
    api.makeToken('زَيْدًا','Zayd',api.specs.ismInna('زَيْدًا','إِنَّ'),'',true),
    api.makeToken('مُجْتَهِدٌ','hardworking',api.specs.khabarInna('مُجْتَهِدٌ','إِنَّ'))
  ]),
  structuredCase('TEST_GOLDEN_KANA','Zayd was hardworking.',[
    api.makeToken('كَانَ','was',api.specs.kana('كَانَ')),
    api.makeToken('زَيْدٌ','Zayd',api.specs.ismKana('زَيْدٌ')),
    api.makeToken('مُجْتَهِدًا','hardworking',api.specs.khabarKana('مُجْتَهِدًا'),'',true)
  ]),
  structuredCase('TEST_GOLDEN_VERBAL_TRANSITIVE','Zayd read the book.',[
    api.makeToken('قَرَأَ','read',api.specs.past('قَرَأَ')),
    api.makeToken('زَيْدٌ','Zayd',api.specs.faail('زَيْدٌ'),'',true),
    api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'))
  ]),
  structuredCase('TEST_GOLDEN_ZARF','Zayd read in front of the house.',[
    api.makeToken('قَرَأَ','read',api.specs.past('قَرَأَ')),
    api.makeToken('زَيْدٌ','Zayd',api.specs.faail('زَيْدٌ')),
    api.makeToken('أَمَامَ','in front of',api.specs.adverbMudaf('أَمَامَ'),'',true),
    api.makeToken('الْبَيْتِ','the house',api.specs.mudafIlayh('الْبَيْتِ'))
  ]),
  structuredCase('TEST_GOLDEN_SAWFA','Zayd will write the book.',[
    api.makeToken('سَوْفَ','will',api.specs.future('سَوْفَ')),
    api.makeToken('يَكْتُبُ','writes',api.specs.presentPred('يَكْتُبُ')),
    api.makeToken('زَيْدٌ','Zayd',api.specs.faail('زَيْدٌ')),
    api.makeToken('الْكِتَابَ','the book',api.specs.object('الْكِتَابَ'),'',true)
  ])
];
for(const data of deterministicStructures){
  assert(data.validated,`${data.templateId}: deterministic structure was not validated`);
  assert(data.tokens.every(token=>token.ruleId),`${data.templateId}: a token lacks a rule ID`);
  assert(data.relationships.every(rel=>rel.ruleId),`${data.templateId}: a relationship lacks a rule ID`);
}
assertGenitiveTerminology(deterministicStructures[2].tokens[1],'iḍāfah muḍāf ilayh');
assert(relationTypes(deterministicStructures[0]).has('mubtadaKhabar'),'Direct nominal relationship is missing');
assert(relationTypes(deterministicStructures[1]).has('preposition')&&relationTypes(deterministicStructures[1]).has('mubtadaKhabar'),'Phrase khabar relationships are missing');
assert(relationTypes(deterministicStructures[2]).has('idafa'),'Iḍāfah relationship is missing');
assert(relationTypes(deterministicStructures[3]).has('inna'),'Inna relationship is missing');
assert(relationTypes(deterministicStructures[4]).has('kana'),'Kāna relationship is missing');
assert(relationTypes(deterministicStructures[5]).has('verbSubject')&&relationTypes(deterministicStructures[5]).has('verbObject'),'Transitive verbal relationships are missing');
assert(relationTypes(deterministicStructures[6]).has('verbSubject')&&relationTypes(deterministicStructures[6]).has('idafa'),'Adverbial golden relationships are missing');
assert(relationTypes(deterministicStructures[7]).has('verbSubject')&&relationTypes(deterministicStructures[7]).has('verbObject'),'Sawfa golden relationships are missing');
assert(deterministicStructures[0].sentence==='زَيْدٌ مُجْتَهِدٌ','Golden nominal sentence surface changed');
assert(deterministicStructures[3].sentence==='إِنَّ زَيْدًا مُجْتَهِدٌ','Golden inna sentence surface changed');
assert(deterministicStructures[4].sentence==='كَانَ زَيْدٌ مُجْتَهِدًا','Golden kāna sentence surface changed');
assert(deterministicStructures[5].sentence==='قَرَأَ زَيْدٌ الْكِتَابَ','Golden verbal sentence surface changed');
assert(deterministicStructures[6].sentence==='قَرَأَ زَيْدٌ أَمَامَ الْبَيْتِ','Golden adverb sentence surface changed');
assert(deterministicStructures[6].tokens[2].ar.includes('ظَرْفٌ مَنْصُوبٌ'),'Golden adverb explanation is missing');
assert(deterministicStructures[7].sentence==='سَوْفَ يَكْتُبُ زَيْدٌ الْكِتَابَ','Golden sawfa sentence surface changed');
assert(deterministicStructures[7].tokens[0].ar.includes('حَرْفُ اسْتِقْبَالٍ'),'Golden sawfa explanation is missing');
assert(!deterministicStructures[1].tokens[1].phraseAr,'Golden phrase khabar was appended to the preposition card');
assert(deterministicStructures[1].tokens[2].phraseAr.includes('مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ'),'Golden phrase khabar does not follow the primary source analysis after the governed noun');
assert(!deterministicStructures[2].tokens[0].word.endsWith('ٌ'),'Golden iḍāfah incorrectly retained tanwīn on the muḍāf');

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
const disabledSourceRule=clone(deterministicStructures[0]);disabledSourceRule.tokens[0].ruleId='R_PARTICLE';
assertFailureCode('disabled source rule',disabledSourceRule,'E_SOURCE_UNVERIFIED');validatorFaultCases++;
const wrongIsmInna=clone(deterministicStructures[3]);wrongIsmInna.tokens[1].state='raf';wrongIsmInna.tokens[1].sign={id:'damma'};
assertFailureCode('ism inna marked nominative',wrongIsmInna,'E_ROLE_CASE');validatorFaultCases++;
const wrongKhabarInna=clone(deterministicStructures[3]);wrongKhabarInna.tokens[2].state='nasb';wrongKhabarInna.tokens[2].sign={id:'fatha'};
assertFailureCode('khabar inna marked accusative',wrongKhabarInna,'E_ROLE_CASE');validatorFaultCases++;
const wrongIsmKana=clone(deterministicStructures[4]);wrongIsmKana.tokens[1].state='nasb';wrongIsmKana.tokens[1].sign={id:'fatha'};
assertFailureCode('ism kana marked accusative',wrongIsmKana,'E_ROLE_CASE');validatorFaultCases++;
const wrongKhabarKana=clone(deterministicStructures[4]);wrongKhabarKana.tokens[2].state='raf';wrongKhabarKana.tokens[2].sign={id:'damma'};
assertFailureCode('khabar kana marked nominative',wrongKhabarKana,'E_ROLE_CASE');validatorFaultCases++;
const wrongMudafIlayh=clone(deterministicStructures[2]);wrongMudafIlayh.tokens[1].state='raf';wrongMudafIlayh.tokens[1].sign={id:'damma'};
assertFailureCode('mudaf ilayh marked nominative',wrongMudafIlayh,'E_ROLE_CASE');validatorFaultCases++;
const wrongFaail=clone(deterministicStructures[5]);wrongFaail.tokens[1].state='nasb';wrongFaail.tokens[1].sign={id:'fatha'};
assertFailureCode('faail marked accusative',wrongFaail,'E_ROLE_CASE');validatorFaultCases++;
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

// ===================================================================================
// Phase 0 — word-internal component infrastructure (adds NO new generated grammar).
// Retrofits the existing واو الجماعة (five verbs) and تاء التأنيث الساكنة (feminine past)
// as structured components; proves the schema, invariants, render order, snapshot/restore.
// Assertions use structured fields + ASCII English so they never depend on Arabic
// diacritic normalisation; Arabic surfaces come only from the lexemes themselves.
// ===================================================================================
let componentCases=0;
const object0=write.obj[0];                      // reuse the existing كَتَبَ lexeme (five/fiveSub/obj)

// (1) Five-verb rafʿ → exactly one waw-jamaaah pronoun component; no alif fāriqah.
const fiveRaf=structuredCase('TEST_PH0_FIVE_RAF','They write the assigned work.',[
  api.makeToken(write.five,'write',{...api.specs.presentFive(write.five),person:'3mp'},'',true),
  api.makeToken(object0,'the assigned work',api.specs.object(object0))
]);
const fiveVerbRaf=fiveRaf.tokens[0];
assert(Array.isArray(fiveVerbRaf.components)&&fiveVerbRaf.components.length===1,'Five-verb rafʿ must carry exactly one internal component');
const waw=fiveVerbRaf.components[0];
assert(waw.kind==='waw-jamaaah'&&waw.category==='pronoun'&&waw.syntacticRole==='fail'&&waw.mahall==='raf'&&waw.binaaSign==='sukun','wāw al-jamāʿah component fields are wrong');
assert(waw.ar&&waw.ar.includes(waw.nameAr),'wāw component Arabic analysis was not rendered');
assert(!fiveVerbRaf.ar.includes(waw.nameAr),'Five-verb whole-word iʿrāb must no longer inline the wāw subject');
componentCases++;

// (2) Five-verb naṣb → waw-jamaaah + alif-fariqa (orthographic, no maḥall).
const fiveNasb=structuredCase('TEST_PH0_FIVE_NASB','They will not write the assigned work.',[
  api.makeToken('لَنْ','will not',api.specs.lan('لَنْ')),
  api.makeToken(write.fiveSub,'write',{...api.specs.presentFive(write.fiveSub),person:'3mp'},'',true),
  api.makeToken(object0,'the assigned work',api.specs.object(object0))
]);
const nasbKinds=fiveNasb.tokens[1].components.map(component=>component.kind);
assert(nasbKinds.join(',')==='waw-jamaaah,alif-fariqa',`Five-verb naṣb components wrong: ${nasbKinds.join(',')}`);
const alif=fiveNasb.tokens[1].components[1];
assert(alif.category==='orthographic'&&alif.syntacticRole==='notApplicable'&&alif.mahall==='notApplicable'&&alif.binaaSign===null,'alif fāriqah must be orthographic/notApplicable/null');
assert(alif.en.includes('orthographic'),'alif fāriqah English analysis is wrong');
componentCases++;

// (3) Five-verb jazm → same two components.
const fiveJazm=structuredCase('TEST_PH0_FIVE_JAZM','They did not write the assigned work.',[
  api.makeToken('لَمْ','did not',api.specs.lam('لَمْ')),
  api.makeToken(write.fiveSub,'write',{...api.specs.presentFive(write.fiveSub),person:'3mp'},'',true),
  api.makeToken(object0,'the assigned work',api.specs.object(object0))
]);
assert(fiveJazm.tokens[1].components.map(component=>component.kind).join(',')==='waw-jamaaah,alif-fariqa','Five-verb jazm components wrong');
componentCases++;

// (4) Feminine past تاء التأنيث الساكنة: a particle with no maḥall — NOT the fāʿil.
const sfpSubject=api.nounLexicons.sfp[0];
const feminine=api.verbLexicons.femininePastActions[0];
const femPast=structuredCase('TEST_PH0_FEM_PAST',`${sfpSubject.en} ${feminine.pastEn}.`,[
  api.makeToken(feminine.past,feminine.pastEn,api.specs.past(feminine.past)),
  api.makeToken(sfpSubject.nom,sfpSubject.en,api.specs.faail(sfpSubject.nom),'',true)
]);
const pastVerb=femPast.tokens[0];
assert(pastVerb.components.length===1&&pastVerb.components[0].kind==='taa-taniith-sakina','Feminine past must carry the tāʾ al-taʾnīth component');
const taa=pastVerb.components[0];
assert(taa.category==='particle'&&taa.syntacticRole==='none'&&taa.mahall==='none','tāʾ al-taʾnīth must be particle/none/none');
assert(taa.en.includes('not the')&&taa.en.includes('no position'),'tāʾ English analysis must state it is not the fāʿil and has no position');
assert(femPast.tokens[1].grammar.role==='faail','The following noun — not the tāʾ — must be the fāʿil');
componentCases++;

// (5) Sacred render order: whole-word iʿrāb → component iʿrāb → individual Why → phrase → phrase Why.
api.render(fiveRaf,'',false);
const renderedHtml=elements.answers.innerHTML;
const posIraab=renderedHtml.indexOf('class="iraab"');
const posComponent=renderedHtml.indexOf('class="component-iraab"');
const posWhy=renderedHtml.indexOf('class="why-toggle"');
assert(posIraab>=0&&posComponent>=0&&posWhy>=0,'Rendered card is missing the iʿrāb / component / why blocks');
assert(posIraab<posComponent&&posComponent<posWhy,`Sacred order violated: iraab=${posIraab} component=${posComponent} why=${posWhy}`);
componentCases++;

// (6) Snapshot round-trip rebuilds components deterministically. Snapshots need the full
// template metadata, so these use real production templates (not the structuredCase stubs).
const structuredSignature=data=>data.tokens.map(token=>(token.components||[]).map(component=>`${component.kind}:${component.category}:${component.syntacticRole}:${component.mahall}:${component.binaaSign}`).join('|')).join('||');
const fiveNasbTemplate=api.templates.find(template=>template.form==='fiveVerbs'&&template.state==='nasb');
const femPastTemplate=api.templates.find(template=>template.starts==='verb'&&template.form==='sfp');
assert(fiveNasbTemplate&&femPastTemplate,'Phase-0 snapshot templates were not found');
for(const [label,template] of [['five-verb naṣb',fiveNasbTemplate],['feminine past',femPastTemplate]]){
  const exercise=api.buildTemplate(template.id);
  const snapshot=api.createExerciseSnapshot(exercise);
  assert(snapshot,`${label}: snapshot could not be created`);
  const restored=api.restoreExerciseSnapshot(snapshot);
  assert(restored,`${label}: snapshot could not be restored`);
  assert(structuredSignature(exercise)===structuredSignature(restored),`${label}: restored components differ from the original`);
  componentCases++;
}

// (7) Legacy (component-less) snapshot still restores; the five-verb wāw is re-derived.
const legacyBase=api.buildTemplate(fiveNasbTemplate.id);
const legacySnapshot=clone(api.createExerciseSnapshot(legacyBase));
legacySnapshot.schemaVersion=2;
delete legacySnapshot.exerciseIdentity;
legacySnapshot.tokens.forEach(token=>delete token.components);
const legacyRestored=api.restoreExerciseSnapshot(legacySnapshot);
assert(legacyRestored,'Legacy component-less snapshot failed to restore');
const restoredFiveVerb=legacyRestored.tokens.find(token=>token.inflection==='afalKhamsa');
assert(restoredFiveVerb&&restoredFiveVerb.components.some(component=>component.kind==='waw-jamaaah'),'Legacy five-verb did not re-derive its wāw component');
componentCases++;

// (8) Snapshot morphology is not self-authorizing. Injection, suppression, true-v1
// migration, and corrupt stored records all rebuild from registered production structure.
const masculinePastTemplate=api.templates.find(template=>template.starts==='verb'&&template.form==='singular'&&template.state==='raf');
assert(masculinePastTemplate,'Masculine past template was not found');
const masculineSnapshot=clone(api.createExerciseSnapshot(api.buildTemplate(masculinePastTemplate.id)));
const masculineVerbSnapshot=masculineSnapshot.tokens.find(token=>token.grammar.type==='verb'&&token.tense==='past');
masculineVerbSnapshot.grammar.componentKinds=['taa-taniith-sakina'];
masculineVerbSnapshot.grammar.morphology={feminineTaa:true};
masculineVerbSnapshot.components=[clone(taa)];
const masculineRestored=api.restoreExerciseSnapshot(masculineSnapshot);
assert(masculineRestored,'Masculine snapshot with injected feminine declarations did not fail safely');
const masculineRestoredVerb=masculineRestored.tokens.find(token=>token.grammar.type==='verb'&&token.tense==='past');
assert(masculineRestoredVerb.grammar.morphology.feminineTaa===false&&masculineRestoredVerb.components.length===0,'Injected feminine tāʾ metadata manufactured false grammar');
componentCases++;

const feminineSnapshot=clone(api.createExerciseSnapshot(api.buildTemplate(femPastTemplate.id)));
const feminineVerbSnapshot=feminineSnapshot.tokens.find(token=>token.grammar.type==='verb'&&token.tense==='past');
feminineVerbSnapshot.grammar.componentKinds=[];
feminineVerbSnapshot.grammar.morphology={feminineTaa:false};
feminineVerbSnapshot.components=[];
const feminineRestored=api.restoreExerciseSnapshot(feminineSnapshot);
assert(feminineRestored,'Feminine snapshot with suppressed declarations did not restore');
const feminineRestoredVerb=feminineRestored.tokens.find(token=>token.grammar.type==='verb'&&token.tense==='past');
assert(feminineRestoredVerb.grammar.morphology.feminineTaa===true&&feminineRestoredVerb.components.map(component=>component.kind).join(',')==='taa-taniith-sakina','Suppressed feminine tāʾ metadata hid authoritative morphology');
componentCases++;

const trueLegacyFeminine=clone(api.createExerciseSnapshot(api.buildTemplate(femPastTemplate.id)));
trueLegacyFeminine.schemaVersion=1;
delete trueLegacyFeminine.exerciseIdentity;
trueLegacyFeminine.tokens.forEach(token=>{
  delete token.components;
  delete token.grammar.componentKinds;
  delete token.grammar.morphology;
});
const trueLegacyRestored=api.restoreExerciseSnapshot(trueLegacyFeminine);
assert(trueLegacyRestored,'True pre-Phase-0 feminine snapshot failed controlled v1 migration');
const trueLegacyVerb=trueLegacyRestored.tokens.find(token=>token.grammar.type==='verb'&&token.tense==='past');
assert(trueLegacyVerb.grammar.morphology.feminineTaa===true&&trueLegacyVerb.components[0]?.kind==='taa-taniith-sakina','True legacy feminine snapshot lost its tāʾ analysis');
componentCases++;

const corruptStoredSnapshot=clone(api.createExerciseSnapshot(api.buildTemplate(femPastTemplate.id)));
const corruptStoredComponent=corruptStoredSnapshot.tokens.find(token=>token.components?.length).components[0];
Object.assign(corruptStoredComponent,{id:'FOREIGN:C99',ar:'زُوِّرَ',en:'forged',letterAr:'غ',nameAr:'اسْمٌ مُزَوَّرٌ',nameEn:'forged name'});
const repairedStored=api.restoreExerciseSnapshot(corruptStoredSnapshot);
assert(repairedStored,'Snapshot with corrupt stored component records did not rebuild safely');
const repairedComponent=repairedStored.tokens.find(token=>token.components?.length).components[0];
assert(repairedComponent.id.endsWith(':C1')&&repairedComponent.ar!==corruptStoredComponent.ar&&repairedComponent.en!==corruptStoredComponent.en
  &&repairedComponent.letterAr!==corruptStoredComponent.letterAr&&repairedComponent.nameAr!==corruptStoredComponent.nameAr&&repairedComponent.nameEn!==corruptStoredComponent.nameEn,
  'Corrupt stored component identity/presentation reached restored learner-facing output');
componentCases++;

// (9) Validator invariants: structural identity, global uniqueness, canonical order,
// registry-backed grammar, and canonical presentation are all enforced.
const tamperRole=clone(fiveRaf);tamperRole.tokens[0].components[0].syntacticRole='none';
assertFailureCode('wāw pronoun downgraded to role none',tamperRole,'E_COMPONENT_INVARIANT');componentCases++;
const tamperTaa=clone(femPast);tamperTaa.tokens[0].components[0].syntacticRole='fail';tamperTaa.tokens[0].components[0].mahall='raf';
assertFailureCode('tāʾ al-taʾnīth made the fāʿil',tamperTaa,'E_COMPONENT_INVARIANT');componentCases++;
const tamperOwner=clone(fiveRaf);tamperOwner.tokens[1].components=[clone(fiveRaf.tokens[0].components[0])];
assertFailureCode('noun given a verb component',tamperOwner,'E_COMPONENT_OWNER');componentCases++;
const tamperSet=clone(fiveRaf);tamperSet.tokens[0].components=[];
assertFailureCode('five-verb stripped of its subject component',tamperSet,'E_COMPONENT_SET');componentCases++;
const tamperAlif=clone(fiveNasb);tamperAlif.tokens[1].components[1].mahall='raf';
assertFailureCode('alif fāriqah given a maḥall',tamperAlif,'E_COMPONENT_INVARIANT');componentCases++;

const wrongOwnerId=clone(fiveRaf);wrongOwnerId.tokens[0].components[0].id='WRONG:T1:C1';
assertFailureCode('component given wrong owner-formatted id',wrongOwnerId,'E_COMPONENT_ID');componentCases++;
const duplicateIds=clone(fiveNasb);duplicateIds.tokens[1].components[1].id=duplicateIds.tokens[1].components[0].id;
assertFailureCode('duplicate component ids',duplicateIds,'E_COMPONENT_ID_DUPLICATE');componentCases++;
const copiedComponent=clone(fiveRaf);copiedComponent.tokens[0].components[0]=clone(fiveNasb.tokens[1].components[0]);
assertFailureCode('component copied from another verb',copiedComponent,'E_COMPONENT_ID');componentCases++;
const wrongOrder=clone(fiveNasb);wrongOrder.tokens[1].components.reverse();
assertFailureCode('component order reversed',wrongOrder,'E_COMPONENT_SET');componentCases++;
for(const [field,value] of [['ar','زُوِّرَ'],['en','forged English'],['nameAr','اسْمٌ مُزَوَّرٌ'],['nameEn','forged name'],['letterAr','غ']]){
  const forged=clone(fiveRaf);forged.tokens[0].components[0][field]=value;
  assertFailureCode(`forged component ${field}`,forged,'E_COMPONENT_PRESENTATION');componentCases++;
}

console.log(`Phase-0 internal-component audit passed: ${componentCases} checks; wāw al-jamāʿah + tāʾ al-taʾnīth retrofitted, schema/invariants/render-order/snapshot verified.`);

// ===================================================================================
// Phase 1 — advanced past verb: exact stored surfaces, Al-Tuḥfah bināʾ classes,
// attached subject components/relationships, deterministic Why, History, and faults.
// ===================================================================================
let pastVerbCases=0;
let pastAdversarialCases=0;
let coordinatedHistoryAttackCases=0;
let samePersonIdentityAttackCases=0;
let presentationRepairCases=0;
const advancedPast=api.verbLexicons.advancedPastActions;
assert(advancedPast.length===3,'Phase 1 must remain limited to three explicitly reviewed lexemes');
assert(advancedPast.map(item=>item.past).join(',')==='كَتَبَ,فَتَحَ,دَرَسَ','Phase-1 lexeme scope changed');
const phase1Persons=['1s','2ms','2fs','1p','3md','3mp','3fp'];
const allAdvancedSurfaces=advancedPast.flatMap(item=>phase1Persons.map(person=>item.forms[person]));
assert(allAdvancedSurfaces.every(Boolean)&&new Set(allAdvancedSurfaces).size===21,'Advanced past surfaces are missing or duplicated');
assert(api.templates.filter(template=>template.pastPerson).length===7,'Expected one person-bound production template for each Phase-1 attached form');
for(const person of phase1Persons){
  assert(api.templates.filter(template=>template.pastPerson===person).length===1,`Production template binding for ${person} is missing or duplicated`);
}
const expectedPastTemplateCapabilities={
  T_VERB_SINGULAR_RAF_DAMMA_01:'3ms/explicit',
  T_VERB_SINGULAR_NASB_FATHA_01:'3ms/explicit',
  T_VERB_BROKEN_RAF_DAMMA_01:'3ms/explicit',
  T_VERB_DUAL_RAF_ALIF_01:'3ms/explicit',
  T_VERB_SMP_RAF_WAW_01:'3ms/explicit',
  T_VERB_SFP_RAF_DAMMA_01:'3fs-explicit/explicit',
  T_VERB_FIVENOUNS_RAF_WAW_01:'3ms/explicit',
  T_VERB_SINGULAR_NASB_FATHA_03:'1s/attached',
  T_VERB_SINGULAR_NASB_FATHA_04:'2ms/attached',
  T_VERB_SINGULAR_NASB_FATHA_05:'2fs/attached',
  T_VERB_SINGULAR_NASB_FATHA_06:'1p/attached',
  T_VERB_SINGULAR_NASB_FATHA_07:'3md/attached',
  T_VERB_SINGULAR_NASB_FATHA_08:'3mp/attached',
  T_VERB_SINGULAR_NASB_FATHA_09:'3fp/attached'
};
const declaredPastTemplates=api.templates.filter(template=>template.pastCapabilities.length);
assert(declaredPastTemplates.length===Object.keys(expectedPastTemplateCapabilities).length,
  `Expected ${Object.keys(expectedPastTemplateCapabilities).length} explicitly authorized past templates, found ${declaredPastTemplates.length}`);
for(const template of declaredPastTemplates){
  const capability=template.pastCapabilities.map(item=>`${item.person}/${item.subjectMode}`).join(',');
  assert(expectedPastTemplateCapabilities[template.stableId]===capability,
    `${template.stableId}: unexpected past capability ${capability}`);
  const generated=api.buildTemplate(template.id);
  const past=generated.tokens.find(token=>token.tense==='past');
  assert(past&&template.pastCapabilities.some(item=>
    item.person===past.grammar.morphology.person&&item.subjectMode===past.grammar.morphology.subjectMode),
    `${template.stableId}: its real production past does not match its declared capability`);
  const restored=api.restoreExerciseSnapshot(api.createExerciseSnapshot(generated));
  const restoredPast=restored?.tokens.find(token=>token.tense==='past');
  assert(restoredPast&&restoredPast.grammar.morphology.person===past.grammar.morphology.person
    &&restoredPast.grammar.morphology.subjectMode===past.grammar.morphology.subjectMode,
    `${template.stableId}: its legitimate production History snapshot did not restore`);
}
for(const template of api.templates.filter(item=>!item.pastCapabilities.length)){
  assert(!api.buildTemplate(template.id).tokens.some(token=>token.tense==='past'),
    `${template.stableId}: production generates a past verb without explicit template authorization`);
}
const preservedKanaTemplate=api.templates.find(template=>template.stableId==='T_VERB_SINGULAR_NASB_FATHA_02');
assert(preservedKanaTemplate&&!preservedKanaTemplate.pastCapabilities.length
  &&api.buildTemplate(preservedKanaTemplate.id).tokens.some(token=>token.tense==='kana'),
  'The committed Phase-0 kāna template ID was not preserved as the controlled legacy target');

const writeAdvanced=advancedPast.find(item=>item.past==='كَتَبَ');
const phase1Object='الدَّرْسَ';
const barePast=structuredCase('TEST_PH1_BARE','He wrote the lesson.',[
  api.makeToken('كَتَبَ','wrote',api.specs.past('كَتَبَ')),
  api.makeToken(phase1Object,'the lesson',api.specs.object(phase1Object),'',true)
]);
assert(barePast.tokens[0].grammar.morphology.binaaClass==='visible-fath'
  &&barePast.tokens[0].ruleId==='R_PAST_FATH_VISIBLE'
  &&barePast.tokens[0].components.length===0
  &&barePast.tokens[0].relations.subjectType==='implicit',
  'Bare past did not receive visible fatḥ and its hidden subject');
assert(barePast.tokens[0].ar.includes('الْفَتْحِ الظَّاهِرِ')
  &&barePast.tokens[0].why.ids.includes('WHY_PAST_FATH_VISIBLE'),
  'Bare-past learner analysis/Why is not the visible-fatḥ path');
pastVerbCases++;

assert(femPast.tokens[0].grammar.morphology.binaaClass==='visible-fath'
  &&femPast.tokens[0].grammar.morphology.subjectMode==='explicit'
  &&femPast.tokens[0].ruleId==='R_PAST_FATH_VISIBLE',
  'Existing feminine-tāʾ past did not retain visible fatḥ with an explicit subject');
assert(femPast.tokens[0].why.ids.includes('WHY_TAA_TANIITH_NOT_SUBJECT'),
  'Feminine-tāʾ Why does not explain that the tāʾ is not the subject');
pastVerbCases++;
const exactFemininePast=structuredCase('TEST_PH1_EXACT_FEMININE','The female students wrote.',[
  api.makeToken('كَتَبَتْ','wrote',api.specs.past('كَتَبَتْ')),
  api.makeToken(sfpSubject.nom,sfpSubject.en,api.specs.faail(sfpSubject.nom),'',true)
]);
assert(exactFemininePast.sentence.startsWith('كَتَبَتْ ')
  &&exactFemininePast.tokens[0].grammar.morphology.person==='3fs-explicit'
  &&exactFemininePast.tokens[0].grammar.morphology.binaaClass==='visible-fath'
  &&exactFemininePast.tokens[0].components[0]?.kind==='taa-taniith-sakina'
  &&exactFemininePast.tokens[1].grammar.role==='faail',
  'Exact كَتَبَتْ deterministic case does not preserve visible fatḥ, feminine tāʾ, and the explicit noun subject');
pastVerbCases++;

const expectedPastForms={
  '1s':{surface:'كَتَبْتُ',ending:'taa-fail-1s',binaa:'estimated-fath-incidental-sukun',rule:'R_PAST_FATH_EST_INCIDENTAL_SUKUN',componentSign:'damma',why:'WHY_SUBJECT_TAA_FAIL_1S'},
  '2ms':{surface:'كَتَبْتَ',ending:'taa-fail-2ms',binaa:'estimated-fath-incidental-sukun',rule:'R_PAST_FATH_EST_INCIDENTAL_SUKUN',componentSign:'fatha',why:'WHY_SUBJECT_TAA_FAIL_2MS'},
  '2fs':{surface:'كَتَبْتِ',ending:'taa-fail-2fs',binaa:'estimated-fath-incidental-sukun',rule:'R_PAST_FATH_EST_INCIDENTAL_SUKUN',componentSign:'kasra',why:'WHY_SUBJECT_TAA_FAIL_2FS'},
  '1p':{surface:'كَتَبْنَا',ending:'naa-failin',binaa:'estimated-fath-incidental-sukun',rule:'R_PAST_FATH_EST_INCIDENTAL_SUKUN',componentSign:'sukun',why:'WHY_SUBJECT_NAA_FAILIN'},
  '3md':{surface:'كَتَبَا',ending:'alif-ithnain',binaa:'visible-fath',rule:'R_PAST_FATH_VISIBLE',componentSign:'sukun',why:'WHY_SUBJECT_ALIF_ITHNAIN'},
  '3mp':{surface:'كَتَبُوا',ending:'waw-jamaaah',binaa:'estimated-fath-munasabah',rule:'R_PAST_FATH_EST_MUNASABAH',componentSign:'sukun',why:'WHY_SUBJECT_WAW_JAMAAH'},
  '3fp':{surface:'كَتَبْنَ',ending:'nuun-niswah',binaa:'estimated-fath-incidental-sukun',rule:'R_PAST_FATH_EST_INCIDENTAL_SUKUN',componentSign:'fatha',why:'WHY_SUBJECT_NUUN_NISWAH'}
};
const phase1Cases={};
for(const person of phase1Persons){
  const expected=expectedPastForms[person];
  const data=structuredCase(`TEST_PH1_${person.toUpperCase()}`,`${person} wrote the lesson.`,[
    api.makeToken(expected.surface,'wrote',api.specs.past(expected.surface,{person})),
    api.makeToken(phase1Object,'the lesson',api.specs.object(phase1Object),'',true)
  ]);
  phase1Cases[person]=data;
  const verb=data.tokens[0];
  const morphology=verb.grammar.morphology;
  const subjectRel=data.relationships.find(rel=>rel.type==='verbSubject'&&rel.verbId===verb.id);
  const subjectComponent=verb.components.find(component=>component.syntacticRole==='fail');
  assert(verb.word===expected.surface&&morphology.person===person&&morphology.subjectMode==='attached'
    &&morphology.endingClass===expected.ending&&morphology.binaaClass===expected.binaa,
    `${person}: authoritative past morphology is wrong`);
  assert(verb.ruleId===expected.rule,`${person}: whole-word bināʾ rule is wrong`);
  assert(subjectComponent?.kind===expected.ending&&subjectComponent.binaaSign===expected.componentSign,
    `${person}: attached subject component or its bināʾ is wrong`);
  assert(subjectRel?.subjectType==='attached'&&subjectRel.pronoun===subjectComponent.nameAr,
    `${person}: attached subject relationship is wrong`);
  assert(!data.tokens.some(token=>token.grammar.role==='faail'),`${person}: generated a competing explicit fāʿil`);
  assert(verb.why.ids.includes(expected.why),`${person}: attached-subject Why rule is missing`);
  if(expected.binaa==='visible-fath')assert(verb.why.ids.includes('WHY_PAST_FATH_VISIBLE'),`${person}: visible-fatḥ Why is missing`);
  if(expected.binaa==='estimated-fath-munasabah')assert(verb.ar.includes('حَرَكَةِ الْمُنَاسَبَةِ')&&verb.why.ids.includes('WHY_PAST_FATH_EST_MUNASABAH'),`${person}: munāsabah analysis is missing`);
  if(expected.binaa==='estimated-fath-incidental-sukun')assert(verb.ar.includes('السُّكُونِ الْعَارِضِ')&&verb.ar.includes('تَوَالِي أَرْبَعِ مُتَحَرِّكَاتٍ')&&verb.why.ids.includes('WHY_PAST_FATH_EST_INCIDENTAL_SUKUN'),`${person}: incidental-sukūn analysis is missing`);
  pastVerbCases++;
}
assert(phase1Cases['3mp'].tokens[0].components.map(component=>component.kind).join(',')==='waw-jamaaah,alif-fariqa',
  'Past 3mp must carry wāw al-jamāʿah followed by orthographic alif fāriqah');
assert(phase1Cases['3mp'].tokens[0].components[1].mahall==='notApplicable',
  'Past 3mp alif fāriqah acquired a syntactic maḥall');
pastVerbCases++;

api.render(phase1Cases['3mp'],'',false);
const phase1Rendered=elements.answers.innerHTML;
assert(phase1Rendered.indexOf('class="iraab"')<phase1Rendered.indexOf('class="component-iraab"')
  &&phase1Rendered.indexOf('class="component-iraab"')<phase1Rendered.indexOf('class="why-toggle"'),
  'Phase-1 card violated the sacred whole-word/component/Why order');
pastVerbCases++;

const phase1Signature=data=>JSON.stringify(data.tokens.map(token=>({
  word:token.word,person:token.grammar.morphology?.person,ending:token.grammar.morphology?.endingClass,
  binaa:token.grammar.morphology?.binaaClass,ruleId:token.ruleId,
  components:(token.components||[]).map(component=>[component.kind,component.binaaSign,component.ruleId]),
  subjectType:token.relations.subjectType,subjectPronoun:token.relations.subjectPronoun,
  why:token.why?.ids
})));
const phase1ProductionSnapshots={};
for(const person of phase1Persons){
  const template=api.templates.find(item=>item.pastPerson===person);
  const exercise=api.buildTemplate(template.id);
  const snapshot=api.createExerciseSnapshot(exercise);
  phase1ProductionSnapshots[person]=clone(snapshot);
  const restored=api.restoreExerciseSnapshot(snapshot);
  assert(snapshot?.schemaVersion===3&&snapshot.exerciseIdentity&&restored,`${person}: schema-v3 History round-trip failed`);
  assert(restored.sentence===exercise.sentence&&restored.translation===exercise.translation
    &&phase1Signature(restored)===phase1Signature(exercise),
    `${person}: History did not preserve/rebuild the exact Phase-1 exercise`);

  const corrupted=clone(snapshot);
  const corruptedVerb=corrupted.tokens.find(token=>token.grammar.type==='verb');
  corruptedVerb.grammar.person='3ms';
  corruptedVerb.grammar.morphology={person:'3ms',endingClass:'none',binaaClass:'visible-fath'};
  corruptedVerb.components=[];
  corruptedVerb.why={ids:['FORGED_WHY'],ar:['forged'],en:['forged']};
  corrupted.relationships=[];
  const repaired=api.restoreExerciseSnapshot(corrupted);
  assert(repaired&&phase1Signature(repaired)===phase1Signature(exercise),
    `${person}: canonical restore did not repair corrupted morphology/components/relationships/Why`);

  const presentationCorruption=clone(snapshot);
  const presentationVerb=presentationCorruption.tokens.find(token=>token.tense==='past');
  const presentationObject=presentationCorruption.tokens.find(token=>token.grammar.role==='object');
  presentationCorruption.translation=person==='1s'?'You wrote the forged object.':'I wrote the forged object.';
  Object.assign(presentationVerb,{gloss:'forged person gloss',ar:'عَرْضٌ عَرَبِيٌّ مُزَوَّرٌ',en:'forged English analysis'});
  Object.assign(presentationObject,{gloss:'forged object gloss',ar:'مُزَوَّرٌ',en:'forged'});
  presentationVerb.why={ids:['FORGED_WHY'],ar:['مُزَوَّرٌ'],en:['forged']};
  if(presentationVerb.components?.length){
    Object.assign(presentationVerb.components[0],{nameAr:'مُزَوَّرٌ',nameEn:'forged component',ar:'مُزَوَّرٌ',en:'forged'});
  }
  assert(api.canonicalExerciseIdentity(presentationCorruption)===snapshot.exerciseIdentity,
    `${person}: presentation-only corruption changed the structural exercise identity`);
  const presentationRepaired=api.restoreExerciseSnapshot(presentationCorruption);
  assert(presentationRepaired&&presentationRepaired.translation===exercise.translation,
    `${person}: History retained corrupted person-facing English`);
  assert(presentationRepaired.tokens.map(token=>token.gloss).join('|')===exercise.tokens.map(token=>token.gloss).join('|')
    &&presentationRepaired.tokens.map(token=>token.ar).join('|')===exercise.tokens.map(token=>token.ar).join('|')
    &&presentationRepaired.tokens.map(token=>token.en).join('|')===exercise.tokens.map(token=>token.en).join('|'),
    `${person}: History retained corrupted token presentation`);
  assert(JSON.stringify(presentationRepaired.tokens.find(token=>token.tense==='past').components)
    ===JSON.stringify(exercise.tokens.find(token=>token.tense==='past').components),
    `${person}: History retained corrupted component presentation`);
  presentationRepairCases++;
  pastAdversarialCases++;
  pastVerbCases++;
}
const masculinePluralPresentation=clone(phase1ProductionSnapshots['3mp']);
const femininePluralPresentation=phase1ProductionSnapshots['3fp'];
const masculinePluralVerb=masculinePluralPresentation.tokens.find(token=>token.tense==='past');
const femininePluralVerb=femininePluralPresentation.tokens.find(token=>token.tense==='past');
masculinePluralPresentation.translation=femininePluralPresentation.translation;
Object.assign(masculinePluralVerb,{gloss:femininePluralVerb.gloss,ar:femininePluralVerb.ar,en:femininePluralVerb.en,why:clone(femininePluralVerb.why)});
Object.assign(masculinePluralVerb.components[0],{
  nameAr:femininePluralVerb.components[0].nameAr,
  nameEn:femininePluralVerb.components[0].nameEn,
  ar:femininePluralVerb.components[0].ar,
  en:femininePluralVerb.components[0].en
});
const repairedMasculinePluralPresentation=api.restoreExerciseSnapshot(masculinePluralPresentation);
assert(repairedMasculinePluralPresentation
  &&repairedMasculinePluralPresentation.tokens.find(token=>token.tense==='past').components.map(component=>component.kind).join(',')==='waw-jamaaah,alif-fariqa'
  &&repairedMasculinePluralPresentation.tokens.find(token=>token.tense==='past').components[0].nameAr!=='نُونُ النِّسْوَةِ',
  'A 3mp snapshot retained forged 3fp component presentation');
presentationRepairCases++;pastAdversarialCases++;

function corruptPastSnapshot(snapshot,surface,templateId=snapshot.templateId){
  const corrupted=clone(snapshot);
  const verb=corrupted.tokens.find(token=>token.grammar.type==='verb');
  verb.word=surface;
  verb.surfaceHint=surface;
  verb.expectedSurface=surface;
  corrupted.templateId=templateId;
  corrupted.sentence=corrupted.tokens.map(token=>token.word).join(' ');
  return corrupted;
}
for(const sourcePerson of phase1Persons){
  const sourceTemplate=api.templates.find(item=>item.pastPerson===sourcePerson);
  const sourceSnapshot=api.createExerciseSnapshot(api.buildTemplate(sourceTemplate.id));
  for(const targetPerson of phase1Persons.filter(person=>person!==sourcePerson)){
    const swapped=corruptPastSnapshot(sourceSnapshot,writeAdvanced.forms[targetPerson]);
    assert(api.restoreExerciseSnapshot(swapped)===null,
      `${sourcePerson} production snapshot accepted the ${targetPerson} surface under its original template`);
    pastAdversarialCases++;
  }
}
for(const sourcePerson of phase1Persons){
  for(const targetPerson of phase1Persons.filter(person=>person!==sourcePerson)){
    // This is a completely valid target production snapshot — template, surface, morphology,
    // components, relationships, Why, and presentation all move together. Only the original
    // schema-v3 exercise identity is retained. Restore must reject the coordinated rewrite.
    const coordinated=clone(phase1ProductionSnapshots[targetPerson]);
    coordinated.exerciseIdentity=phase1ProductionSnapshots[sourcePerson].exerciseIdentity;
    assert(api.restoreExerciseSnapshot(coordinated)===null,
      `${sourcePerson} History identity accepted a complete coordinated rewrite to ${targetPerson}`);
    coordinatedHistoryAttackCases++;
    pastAdversarialCases++;
  }
}
assert(coordinatedHistoryAttackCases===42,'The coordinated 7×6 History identity matrix was not completed');

function findPhase1Snapshot(person,predicate,tries=200){
  const template=api.templates.find(item=>item.pastPerson===person);
  for(let i=0;i<tries;i++){
    const snapshot=api.createExerciseSnapshot(api.buildTemplate(template.id));
    if(predicate(snapshot))return snapshot;
  }
  return null;
}
const identitySource=findPhase1Snapshot('1s',snapshot=>snapshot.tokens.find(token=>token.tense==='past').word==='كَتَبْتُ');
const differentLexeme=findPhase1Snapshot('1s',snapshot=>snapshot.tokens.find(token=>token.tense==='past').word==='فَتَحْتُ');
assert(identitySource&&differentLexeme,'Could not build real same-person different-lexeme production snapshots');
const lexemeRewrite=clone(differentLexeme);lexemeRewrite.exerciseIdentity=identitySource.exerciseIdentity;
assert(api.restoreExerciseSnapshot(lexemeRewrite)===null,'Schema-v3 History accepted a same-person different-lexeme rewrite');
samePersonIdentityAttackCases++;pastAdversarialCases++;
const identitySourceVerb=identitySource.tokens.find(token=>token.tense==='past').word;
const identitySourceObject=identitySource.tokens.find(token=>token.grammar.role==='object').word;
const differentObject=findPhase1Snapshot('1s',snapshot=>
  snapshot.tokens.find(token=>token.tense==='past').word===identitySourceVerb
  &&snapshot.tokens.find(token=>token.grammar.role==='object').word!==identitySourceObject);
assert(differentObject,'Could not build a real same-person different-object production snapshot');
const objectRewrite=clone(differentObject);objectRewrite.exerciseIdentity=identitySource.exerciseIdentity;
assert(api.restoreExerciseSnapshot(objectRewrite)===null,'Schema-v3 History accepted a different object identity');
samePersonIdentityAttackCases++;pastAdversarialCases++;

const template1s=api.templates.find(item=>item.pastPerson==='1s');
const template2ms=api.templates.find(item=>item.pastPerson==='2ms');
const template3mp=api.templates.find(item=>item.pastPerson==='3mp');
const snapshot1s=api.createExerciseSnapshot(api.buildTemplate(template1s.id));
const snapshot3mp=api.createExerciseSnapshot(api.buildTemplate(template3mp.id));
const genericPastTemplate=api.templates.find(item=>item.stableId==='T_VERB_SINGULAR_NASB_FATHA_01');
assert(genericPastTemplate?.pastCapabilities.map(item=>`${item.person}/${item.subjectMode}`).join(',')==='3ms/explicit',
  'The generic pre-Phase-1 past template is not restricted to its actual 3ms/explicit structure');
const requiredHistoryAttacks=[
  ['1s + 2ms + unknown template',corruptPastSnapshot(snapshot1s,writeAdvanced.forms['2ms'],'T_FORGED_UNKNOWN_01')],
  ['1s + 2ms + generic past template',corruptPastSnapshot(snapshot1s,writeAdvanced.forms['2ms'],genericPastTemplate.stableId)],
  ['3mp + 3fp + unknown template',corruptPastSnapshot(snapshot3mp,writeAdvanced.forms['3fp'],'T_FORGED_UNKNOWN_01')],
  ['3mp + 1p + generic past template',corruptPastSnapshot(snapshot3mp,writeAdvanced.forms['1p'],genericPastTemplate.stableId)],
  ['valid surface + unknown template',{...clone(snapshot1s),templateId:'T_FORGED_UNKNOWN_01'}],
  ['valid 1s snapshot + real unauthorized 2ms template',{...clone(snapshot1s),templateId:template2ms.stableId}]
];
for(const [name,attack] of requiredHistoryAttacks){
  assert(api.restoreExerciseSnapshot(attack)===null,`${name}: corrupted History snapshot was accepted`);
  pastAdversarialCases++;
}
const controlledV2=clone(snapshot1s);
controlledV2.schemaVersion=2;
delete controlledV2.exerciseIdentity;
const restoredV2=api.restoreExerciseSnapshot(controlledV2);
assert(restoredV2,'A legitimate schema-v2 Phase-1 snapshot failed the controlled legacy path');
const repersistedV2=api.createExerciseSnapshot(restoredV2);
assert(repersistedV2?.schemaVersion===3&&repersistedV2.exerciseIdentity,
  'A restored schema-v2 snapshot was not upgraded when persisted again');

const pastWithState=clone(phase1Cases['1s']);pastWithState.tokens[0].state='raf';pastWithState.tokens[0].sign={id:'damma'};
assertFailureCode('past verb assigned a muʿrab state',pastWithState,'E_PAST_MUARAB');pastAdversarialCases++;
const wrongBinaa=clone(phase1Cases['3mp']);wrongBinaa.tokens[0].grammar.morphology.binaaClass='visible-fath';
assertFailureCode('3mp assigned visible fatḥ',wrongBinaa,'E_VERB_MORPHOLOGY');pastAdversarialCases++;
const forgedBinaaRule=clone(phase1Cases['1s']);forgedBinaaRule.tokens[0].ruleId='R_PAST_FATH_VISIBLE';
assertFailureCode('forged past bināʾ rule',forgedBinaaRule,'E_PAST_BINAA_RULE');pastAdversarialCases++;
const wrongTaaPerson=clone(phase1Cases['1s']);wrongTaaPerson.tokens[0].word='كَتَبْتَ';wrongTaaPerson.tokens[0].expectedSurface='كَتَبْتَ';
assertFailureCode('tāʾ vowel/person mismatch',wrongTaaPerson,'E_PAST_PERSON');pastAdversarialCases++;
const taaAsFeminine=clone(phase1Cases['1s']);taaAsFeminine.tokens[0].components[0].kind='taa-taniith-sakina';
assertFailureCode('tāʾ al-fāʿil replaced by feminine tāʾ',taaAsFeminine,'E_COMPONENT_SET');pastAdversarialCases++;
const feminineAsFail=clone(femPast);feminineAsFail.tokens[0].components[0].kind='taa-fail-1s';
assertFailureCode('feminine tāʾ replaced by tāʾ al-fāʿil',feminineAsFail,'E_COMPONENT_SET');pastAdversarialCases++;
const missingPastComponent=clone(phase1Cases['1p']);missingPastComponent.tokens[0].components=[];
assertFailureCode('past attached component removed',missingPastComponent,'E_COMPONENT_SET');pastAdversarialCases++;
const extraPastComponent=clone(phase1Cases['1s']);extraPastComponent.tokens[0].components.push(clone(phase1Cases['3mp'].tokens[0].components[1]));
assertFailureCode('past extra component added',extraPastComponent,'E_COMPONENT_SET');pastAdversarialCases++;
const wrongPastOwner=clone(phase1Cases['2ms']);wrongPastOwner.tokens[0].components[0].id='OTHER:T1:C1';
assertFailureCode('past component owner changed',wrongPastOwner,'E_COMPONENT_ID');pastAdversarialCases++;
const wrongPastOrder=clone(phase1Cases['3mp']);wrongPastOrder.tokens[0].components.reverse();
assertFailureCode('past component order reversed',wrongPastOrder,'E_COMPONENT_SET');pastAdversarialCases++;
const duplicatePastComponent=clone(phase1Cases['3mp']);duplicatePastComponent.tokens[0].components[1].id=duplicatePastComponent.tokens[0].components[0].id;
assertFailureCode('past component id duplicated',duplicatePastComponent,'E_COMPONENT_ID_DUPLICATE');pastAdversarialCases++;
const wrongAttachedRelationship=clone(phase1Cases['1p']);wrongAttachedRelationship.relationships.find(rel=>rel.type==='verbSubject').pronoun='نُونُ النِّسْوَةِ';
assertFailureCode('past attached subject relationship changed',wrongAttachedRelationship,'E_PAST_ATTACHED_SUBJECT');pastAdversarialCases++;
const competingExplicit=clone(phase1Cases['1s']);
const copiedFaail=clone(deterministicStructures[5].tokens[1]);
copiedFaail.id='TEST_PH1_COMPETING:T3';copiedFaail.target=false;copiedFaail.relations={};
competingExplicit.tokens.push(copiedFaail);competingExplicit.sentence=competingExplicit.tokens.map(token=>token.word).join(' ');
assertFailureCode('attached past given explicit competing subject',competingExplicit,'E_PAST_COMPETING_SUBJECT');pastAdversarialCases++;
const nuunSukun=clone(phase1Cases['3fp']);nuunSukun.tokens[0].components[0].binaaSign='sukun';
assertFailureCode('nūn al-niswah built on sukūn',nuunSukun,'E_COMPONENT_INVARIANT');pastAdversarialCases++;
const nuunParticle=clone(phase1Cases['3fp']);nuunParticle.tokens[0].components[0].category='particle';
assertFailureCode('nūn al-niswah categorized as particle',nuunParticle,'E_COMPONENT_INVARIANT');pastAdversarialCases++;
const wawMissingAlif=clone(phase1Cases['3mp']);wawMissingAlif.tokens[0].components.pop();
assertFailureCode('past wāw missing alif fāriqah',wawMissingAlif,'E_COMPONENT_SET');pastAdversarialCases++;
const alifWithMahall=clone(phase1Cases['3mp']);alifWithMahall.tokens[0].components[1].mahall='raf';
assertFailureCode('past alif fāriqah given maḥall',alifWithMahall,'E_COMPONENT_INVARIANT');pastAdversarialCases++;
const forgedWhy=clone(phase1Cases['2fs']);forgedWhy.tokens[0].why.ids[0]='FORGED_WHY_RULE';
assertFailureCode('forged Phase-1 Why rule ID',forgedWhy,'E_WHY_CANONICAL');pastAdversarialCases++;
const missingWhy=clone(phase1Cases['2ms']);delete missingWhy.tokens[0].why;
assertFailureCode('removed Phase-1 Why explanation',missingWhy,'E_WHY_MISSING');pastAdversarialCases++;
const forgedPastSurface=clone(phase1Cases['2fs']);forgedPastSurface.tokens[0].word='كَتَبْتُمْ';forgedPastSurface.tokens[0].expectedSurface='كَتَبْتُمْ';
assertFailureCode('unregistered Phase-1 surface',forgedPastSurface,'E_PAST_SURFACE');pastAdversarialCases++;

console.log(`Phase-1 advanced-past audit passed: ${pastVerbCases} positive checks and ${pastAdversarialCases} adversarial checks.`);

// ===================================================================================
// PHASE 2 CORE — exact, surface-unambiguous present persons in rafʿ
// ===================================================================================
const PRESENT_EXPECTED=Object.freeze({
 'كَتَبَ':Object.freeze({'3ms':'يَكْتُبُ','1s':'أَكْتُبُ','1p':'نَكْتُبُ','3md':'يَكْتُبَانِ','3mp':'يَكْتُبُونَ','2mp':'تَكْتُبُونَ','2fs':'تَكْتُبِينَ'}),
 'فَتَحَ':Object.freeze({'3ms':'يَفْتَحُ','1s':'أَفْتَحُ','1p':'نَفْتَحُ','3md':'يَفْتَحَانِ','3mp':'يَفْتَحُونَ','2mp':'تَفْتَحُونَ','2fs':'تَفْتَحِينَ'}),
 'دَرَسَ':Object.freeze({'3ms':'يَدْرُسُ','1s':'أَدْرُسُ','1p':'نَدْرُسُ','3md':'يَدْرُسَانِ','3mp':'يَدْرُسُونَ','2mp':'تَدْرُسُونَ','2fs':'تَدْرُسِينَ'})
});
const PRESENT_PERSONS=['1s','1p','3ms','3md','3mp','2mp','2fs'];
const PHASE2_PRESENTATION_PERSONS=['1s','1p','3md','2mp','2fs'];
const PREEXISTING_PRESENT_TEMPLATE_IDS=Object.freeze({
  '3ms':'T_VERB_PRESENT_RAF_DAMMA_01',
  '3mp':'T_VERB_FIVEVERBS_RAF_NUNKEPT_01'
});
const PHASE2_PRESENTATION_TEMPLATE_IDS=Object.freeze({
  '1s':'T_VERB_SINGULAR_NASB_FATHA_10',
  '1p':'T_VERB_SINGULAR_NASB_FATHA_11',
  '3md':'T_VERB_SINGULAR_NASB_FATHA_12',
  '2mp':'T_VERB_SINGULAR_NASB_FATHA_13',
  '2fs':'T_VERB_SINGULAR_NASB_FATHA_14'
});
const PRESENT_MODES=Object.freeze({'1s':'implicit','1p':'implicit','3ms':'explicit','3md':'attached','3mp':'attached','2mp':'attached','2fs':'attached'});
const PRESENT_COMPONENTS=Object.freeze({'3md':'alif-ithnain','3mp':'waw-jamaaah','2mp':'waw-jamaaah','2fs':'yaa-mukhataba'});
const presentTemplates=Object.fromEntries(PRESENT_PERSONS.map(person=>[
  person,api.templates.find(template=>template.presentCapabilities.some(capability=>capability.person===person))
]));
for(const person of PRESENT_PERSONS){
  const template=presentTemplates[person];
  assert(template,`Phase-2 present template metadata is missing for ${person}`);
  const morphology=api.PRESENT_MORPHOLOGY[person];
  assert(template.presentCapabilities.length===1,`${person}: template does not have exactly one present capability`);
  assert(JSON.stringify(template.presentCapabilities[0])===JSON.stringify({
    person,subjectMode:PRESENT_MODES[person],formClass:morphology.formClass,endingClass:morphology.endingClass
  }),`${person}: template present capability is not canonical`);
  if(PHASE2_PRESENTATION_PERSONS.includes(person)){
    assert(template.stableId===PHASE2_PRESENTATION_TEMPLATE_IDS[person]&&template.presentPerson===person,
      `${person}: genuinely new Phase-2 template did not retain presentation opt-in`);
  }else{
    assert(template.stableId===PREEXISTING_PRESENT_TEMPLATE_IDS[person]&&!template.presentPerson,
      `${person}: pre-existing present template incorrectly opted into Phase-2 presentation rebuilding`);
  }
}
// Phase 2b-A adds two fronted-mubtadaʾ templates, which opt in through their own
// `frontedPresent` flag and their own rebuilder branch. The five original Phase-2 templates
// must keep the plain opt-in, and no pre-existing template may acquire either flag.
const PHASE2B_FRONTED_PERSONS=['3fs','3fd'];
// Phase 2b-B adds two more, which opt in through the same plain `presentPerson` flag the
// original Phase-2 templates use — not through `frontedPresent`.
const PHASE2B_MABNI_PERSONS=['3fp','2fp'];
assert(api.templates.filter(template=>template.presentPerson).map(template=>template.presentPerson).sort().join('|')
  ===[...PHASE2_PRESENTATION_PERSONS,...PHASE2B_FRONTED_PERSONS,...PHASE2B_MABNI_PERSONS].sort().join('|'),
  'Exactly the five Phase-2, two Phase-2b-A fronted, and two Phase-2b-B mabnī templates must opt into person-aware presentation rebuilding');
assert(api.templates.filter(template=>template.frontedPresent).map(template=>template.presentPerson).sort().join('|')
  ===[...PHASE2B_FRONTED_PERSONS].sort().join('|'),
  'Exactly the two Phase-2b-A fronted templates may use the fronted presentation rebuilder');

let presentVerbCases=0;
let ambiguityCases=0;
let frontedCases=0;
let presentAdversarialCases=0;
let presentHistoryCases=0;
let presentPresentationRepairCases=0;
let d2RoundTripCases=0;
let phase2PersonPresentationRepairCases=0;
let unsafeDerivedGuardCases=0;
let legacyV3PositiveCases=0;
let legacyV3AdversarialCases=0;
let legacyV3RepersistenceCases=0;
let phase2CoordinatedHistoryCases=0;
let phase2DowngradeAttackCases=0;
const presentProductionCases={};
const surfaceToPerson=new Map();

// Every one of the 21 approved forms must be a unique exact registry entry.
for(const [lemma,forms] of Object.entries(PRESENT_EXPECTED)){
  for(const [person,surface] of Object.entries(forms)){
    assert(!surfaceToPerson.has(surface),`${surface}: advanced-present surface is ambiguous`);
    surfaceToPerson.set(surface,person);
    const registered=api.verbFormIndex.get(surface);
    assert(registered?.form==='presentRaf'&&registered.surface===surface,`${lemma}/${person}: exact rafʿ surface is not registered`);
    assert(registered.lexeme?.past===lemma&&registered.morphology?.presentPerson===person
      &&registered.morphology?.exactPresentRaf===true,`${lemma}/${person}: exact surface is not bound to its authoritative lemma/person`);
    assert(registered.lexeme.presentForms?.[person]===surface,`${lemma}/${person}: lexeme registry does not reproduce its exact stored surface`);
    presentVerbCases++;
  }
}
assert(surfaceToPerson.size===21,'The Phase-2 exact registry does not contain exactly 21 unique surfaces');

// Exercise each approved lexeme through each enabled production person.
for(const person of PRESENT_PERSONS){
  const wanted=new Set(Object.values(PRESENT_EXPECTED).map(forms=>forms[person]));
  const found=new Map();
  for(let i=0;i<240&&found.size<wanted.size;i++){
    const data=api.buildTemplate(presentTemplates[person].id);
    const verb=data.tokens.find(token=>token.tense==='present');
    if(wanted.has(verb.word))found.set(verb.word,data);
  }
  assert(found.size===3,`${person}: production did not reach all three approved exact surfaces`);
  for(const [surface,data] of found){
    const verb=data.tokens.find(token=>token.tense==='present');
    const object=data.tokens.find(token=>token.grammar.role==='object');
    const morphology=verb.grammar.morphology;
    const expectedForm=PRESENT_COMPONENTS[person]?'afalKhamsa':'ordinary';
    const expectedEnding=PRESENT_COMPONENTS[person]||'none';
    assert(morphology.registered===true&&morphology.tense==='present'&&morphology.person===person
      &&morphology.subjectMode===PRESENT_MODES[person]&&morphology.formClass===expectedForm
      &&morphology.endingClass===expectedEnding,`${surface}: authoritative present morphology is wrong`);
    assert(verb.state==='raf',`${surface}: advanced present form is not in rafʿ`);
    assert(verb.sign.id===(expectedForm==='afalKhamsa'?'nunKept':'damma'),`${surface}: whole-word rafʿ sign is wrong`);
    assert(verb.ruleId===(expectedForm==='afalKhamsa'?'R_AFAL5_RAF_NUN':'R_MUDARI_RAF_DAMMA'),`${surface}: whole-word source rule is wrong`);
    assert(verb.ar.includes('فِعْلٌ مُضَارِعٌ مَرْفُوعٌ'),`${surface}: whole-word iʿrāb does not state present rafʿ`);
    const rel=data.relationships.find(item=>item.type==='verbSubject'&&item.verbId===verb.id);
    assert(rel?.subjectType===PRESENT_MODES[person],`${surface}: subject relationship mode is wrong`);
    if(PRESENT_MODES[person]==='implicit'){
      assert(rel.pronoun===api.PRESENT_HIDDEN_SUBJECTS[person],`${surface}: hidden subject does not match its person`);
      assert(verb.why.ids.includes(person==='1s'?'WHY_SUBJECT_HIDDEN_ANA':'WHY_SUBJECT_HIDDEN_NAHNU'),`${surface}: person-aware hidden-subject Why is missing`);
    }else if(PRESENT_MODES[person]==='explicit'){
      assert(rel.subjectId&&data.tokens.some(token=>token.id===rel.subjectId&&token.grammar.role==='faail'),`${surface}: explicit 3ms fāʿil is missing`);
      assert(verb.components.length===0,`${surface}: ordinary present prefix was incorrectly componentized`);
    }else{
      assert(verb.components.map(component=>component.kind).join('|')===PRESENT_COMPONENTS[person],`${surface}: attached component set is wrong`);
      const component=verb.components[0];
      assert(component.category==='pronoun'&&component.syntacticRole==='fail'&&component.mahall==='raf'
        &&component.binaaSign==='sukun'&&api.isSourceAuthorized(component.ruleId),`${surface}: attached component grammar/source is wrong`);
      assert(rel.pronoun===component.nameAr&&verb.why.ids.includes('WHY_SUBJECT_ATTACHED'),`${surface}: attached subject relationship/Why is wrong`);
      assert(!verb.components.some(component=>component.kind==='alif-fariqa'),`${surface}: rafʿ form incorrectly materialized alif fāriqah`);
    }
    if(person!=='3ms'&&person!=='3mp')assert(object?.target===true,`${surface}: new person-bound template does not keep the object as focus`);
    assert(verb.why.ids.includes('WHY_STATE_VERB_FREE')
      &&verb.why.ids.includes(expectedForm==='afalKhamsa'?'WHY_SIGN_AFAL5_RAF':'WHY_SIGN_MUDARI_RAF'),`${surface}: canonical state/sign Why is missing`);
    const snapshot=api.createExerciseSnapshot(data);
    const restored=api.restoreExerciseSnapshot(clone(snapshot));
    assert(snapshot?.schemaVersion===3&&snapshot.exerciseIdentity===api.canonicalExerciseIdentity(data),`${surface}: schema-v3 identity is missing or noncanonical`);
    assert(restored&&restored.tokens.find(token=>token.tense==='present')?.grammar.morphology.person===person,`${surface}: legitimate History snapshot did not restore`);
    assert(api.createExerciseSnapshot(restored)?.exerciseIdentity===snapshot.exerciseIdentity,`${surface}: restored identity is not stable`);
    presentProductionCases[`${person}:${surface}`]=data;
    presentHistoryCases++;
    presentVerbCases++;
  }
}

function phase2Case(person,lemma='كَتَبَ'){
  return presentProductionCases[`${person}:${PRESENT_EXPECTED[lemma][person]}`];
}
function stableHistoryValue(value){
  if(Array.isArray(value))return value.map(stableHistoryValue);
  if(value&&typeof value==='object'){
    return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableHistoryValue(value[key])]));
  }
  return value;
}
function stableHistoryJson(value){return JSON.stringify(stableHistoryValue(value))}

// D-2 deterministic regression: the two pre-existing builders own their saved
// English/gloss/enHint presentation. Their exact token payload must round-trip,
// while presentCapabilities continue to authorize current Phase-2 morphology.
for(const [person,stableId] of Object.entries(PREEXISTING_PRESENT_TEMPLATE_IDS)){
  const template=api.templates.find(candidate=>candidate.stableId===stableId);
  const seenSurfaces=new Set();
  assert(template&&!template.presentPerson&&template.presentCapabilities[0]?.person===person,
    `${stableId}: morphology authority and presentation opt-in are not separated`);
  for(let iteration=0;iteration<12;iteration++){
    const exercise=api.buildTemplate(template.id);
    const snapshot=api.createExerciseSnapshot(exercise);
    const restored=api.restoreExerciseSnapshot(clone(snapshot));
    const savedVerb=snapshot.tokens.find(token=>token.tense==='present');
    const restoredVerb=restored?.tokens.find(token=>token.tense==='present');
    assert(restored,`${stableId}/${iteration}: legitimate current-v3 snapshot did not restore`);
    assert(stableHistoryJson(restored.tokens)===stableHistoryJson(snapshot.tokens),
      `${stableId}/${iteration}: saved token payload did not round-trip exactly`);
    assert(restored.translation===snapshot.translation,
      `${stableId}/${iteration}: saved translation did not round-trip exactly`);
    assert(restoredVerb.gloss===savedVerb.gloss,
      `${stableId}/${iteration}: saved gloss changed during History restore`);
    assert(restoredVerb.enHint===savedVerb.enHint&&restoredVerb.enHint==='',
      `${stableId}/${iteration}: saved enHint changed during History restore`);
    assert(restoredVerb.grammar.morphology.person===person,
      `${stableId}/${iteration}: authoritative present morphology was lost`);
    seenSurfaces.add(savedVerb.word);
    d2RoundTripCases++;
  }
  assert(seenSurfaces.size>=3,`${stableId}: deterministic D-2 coverage did not exercise several valid lexemes`);
}
function mutatePresentVerb(data,mutator){
  const attack=clone(data);
  const verb=attack.tokens.find(token=>token.tense==='present');
  mutator(verb,attack);
  return attack;
}
function assertPhase2Failure(name,data,...codes){
  const actual=api.validateExercise(data).map(failure=>failure.code);
  assert(codes.some(code=>actual.includes(code)),`${name}: expected one of ${codes.join(', ')}, received ${actual.join(', ')||'no failures'}`);
  presentAdversarialCases++;
}

// Direct validator attacks: person/form/state/sign/component/source/subject authority.
assertPhase2Failure('1s stored as 1p',mutatePresentVerb(phase2Case('1s'),verb=>{verb.grammar.person='1p'}),'E_PRESENT_PERSON');
assertPhase2Failure('3md stored as 3mp',mutatePresentVerb(phase2Case('3md'),verb=>{verb.grammar.person='3mp'}),'E_PRESENT_PERSON');
assertPhase2Failure('3mp stored as 2mp',mutatePresentVerb(phase2Case('3mp'),verb=>{verb.grammar.person='2mp'}),'E_PRESENT_PERSON');
assertPhase2Failure('2mp stored as 2fs',mutatePresentVerb(phase2Case('2mp'),verb=>{verb.grammar.person='2fs'}),'E_PRESENT_PERSON');
assertPhase2Failure('forged present morphology',mutatePresentVerb(phase2Case('1s'),verb=>{verb.grammar.morphology.subjectMode='attached'}),'E_VERB_MORPHOLOGY');
assertPhase2Failure('forged present form class',mutatePresentVerb(phase2Case('1s'),verb=>{verb.grammar.morphology.formClass='afalKhamsa'}),'E_VERB_MORPHOLOGY');
assertPhase2Failure('forged present ending class',mutatePresentVerb(phase2Case('3md'),verb=>{verb.grammar.morphology.endingClass='waw-jamaaah'}),'E_VERB_MORPHOLOGY');
assertPhase2Failure('present assigned khafḍ',mutatePresentVerb(phase2Case('1s'),verb=>{verb.state='jarr'}),'E_PRESENT_KHAFD');
assertPhase2Failure('ordinary rafʿ assigned nunKept',mutatePresentVerb(phase2Case('1s'),verb=>{verb.sign={id:'nunKept'}}),'E_VERB_SIGN','E_PRESENT_ORDINARY_NUN');
assertPhase2Failure('five-verb rafʿ assigned nunDropped',mutatePresentVerb(phase2Case('3mp'),verb=>{verb.sign={id:'nunDropped'}}),'E_VERB_SIGN','E_AFAL5_RAF_SIGN');
assertPhase2Failure('wrong present source rule',mutatePresentVerb(phase2Case('1s'),verb=>{verb.ruleId='R_MUDARI_NASB_FATHA'}),'E_VERB_RULE');
assertPhase2Failure('unregistered present surface',mutatePresentVerb(phase2Case('1s'),(verb,data)=>{
  verb.word=verb.surfaceHint=verb.expectedSurface='يُكْرِمُ';data.sentence=data.tokens.map(token=>token.word).join(' ');
}),'E_PRESENT_SURFACE');
assertPhase2Failure('rafʿ five verb without retained nūn',mutatePresentVerb(phase2Case('3md'),(verb,data)=>{
  verb.word=verb.surfaceHint=verb.expectedSurface='يَكْتُبَا';data.sentence=data.tokens.map(token=>token.word).join(' ');
}),'E_AFAL5_RAF_NUN');
assertPhase2Failure('3md missing alif component',mutatePresentVerb(phase2Case('3md'),verb=>{verb.components=[]}),'E_COMPONENT_SET');
assertPhase2Failure('3md given wāw component',mutatePresentVerb(phase2Case('3md'),verb=>{verb.components=[clone(phase2Case('3mp').tokens[0].components[0])]}),'E_COMPONENT_SET');
assertPhase2Failure('2fs given wāw component',mutatePresentVerb(phase2Case('2fs'),verb=>{verb.components=[clone(phase2Case('2mp').tokens[0].components[0])]}),'E_COMPONENT_SET');
assertPhase2Failure('2mp missing wāw component',mutatePresentVerb(phase2Case('2mp'),verb=>{verb.components=[]}),'E_COMPONENT_SET');
assertPhase2Failure('rafʿ wāw given alif fāriqah',mutatePresentVerb(phase2Case('3mp'),verb=>{verb.components.push(clone(phase1Cases['3mp'].tokens[0].components[1]))}),'E_COMPONENT_SET');
assertPhase2Failure('component wrong owner',mutatePresentVerb(phase2Case('2fs'),verb=>{verb.components[0].id='OTHER:T1:C1'}),'E_COMPONENT_ID');
assertPhase2Failure('component wrong rule',mutatePresentVerb(phase2Case('2fs'),verb=>{verb.components[0].ruleId='C_WAW_JAMAAH_FAIL'}),'E_COMPONENT_INVARIANT');
assertPhase2Failure('component wrong bināʾ',mutatePresentVerb(phase2Case('2fs'),verb=>{verb.components[0].binaaSign='fatha'}),'E_COMPONENT_INVARIANT');
assertPhase2Failure('forged present Why',mutatePresentVerb(phase2Case('1p'),verb=>{verb.why.ids[2]='FORGED_WHY'}),'E_WHY_CANONICAL');
assertPhase2Failure('1s wrong hidden subject',mutatePresentVerb(phase2Case('1s'),(verb,data)=>{
  const rel=data.relationships.find(item=>item.type==='verbSubject'&&item.verbId===verb.id);rel.pronoun='هُوَ';verb.relations.subjectPronoun='هُوَ';
}),'E_PRESENT_IMPLICIT_SUBJECT');
assertPhase2Failure('attached present with competing explicit fāʿil',mutatePresentVerb(phase2Case('2mp'),(verb,data)=>{
  const faail=clone(phase2Case('3ms').tokens.find(token=>token.grammar.role==='faail'));
  faail.id=`${data.templateId}:T99`;faail.relations={};data.tokens.push(faail);data.sentence=data.tokens.map(token=>token.word).join(' ');
}),'E_PRESENT_COMPETING_SUBJECT');

let unsafeThrew=false;
try{api.inflectFiveVerb(arrange,'3md','raf',false)}catch{unsafeThrew=true}
assert(unsafeThrew,'Production-safe five-verb resolution allowed the derived string-surgery fallback');
unsafeDerivedGuardCases++;

// History attacks for every enabled person. Structural identity mutations reject.
// New Phase-2 templates also rebuild person-aware English presentation; the two
// pre-existing templates retain their builder-owned English while canonical
// Arabic analysis, components, relationships, and Why are still rebuilt.
const PRESENTATION_SUBJECT_PREFIX=Object.freeze({
  '1s':'I ','1p':'We ','3md':'The two of them ','2mp':'You all ','2fs':'You '
});
for(const person of PRESENT_PERSONS){
  const base=phase2Case(person);
  const snapshot=api.createExerciseSnapshot(base);
  const verbIndex=snapshot.tokens.findIndex(token=>token.tense==='present');
  const objectIndex=snapshot.tokens.findIndex(token=>token.grammar.role==='object');
  const otherPerson=PRESENT_PERSONS.find(candidate=>candidate!==person);
  const otherTemplate=presentTemplates[otherPerson];
  const attacks=[
    ['person',s=>{s.tokens[verbIndex].grammar.person=otherPerson}],
    ['subjectMode',s=>{s.tokens[verbIndex].grammar.morphology.subjectMode='forged'}],
    ['formClass',s=>{s.tokens[verbIndex].grammar.morphology.formClass='forged'}],
    ['endingClass',s=>{s.tokens[verbIndex].grammar.morphology.endingClass='forged'}],
    ['state',s=>{s.tokens[verbIndex].state='nasb'}],
    ['sign',s=>{s.tokens[verbIndex].sign={id:'forged'}}],
    ['exerciseIdentity',s=>{s.exerciseIdentity+='FORGED'}],
    ['template',s=>{s.templateId=otherTemplate.stableId;s.templateStarts=otherTemplate.starts;s.templateForm=otherTemplate.form;s.templateState=otherTemplate.state;s.templateSign=otherTemplate.sign}],
    ['cross-person surface',s=>{
      const surface=PRESENT_EXPECTED['كَتَبَ'][otherPerson];
      s.tokens[verbIndex].word=s.tokens[verbIndex].surfaceHint=s.tokens[verbIndex].expectedSurface=surface;
      s.sentence=s.tokens.map(token=>token.word).join(' ');
    }],
    ['same-person lexeme',s=>{
      const current=s.tokens[verbIndex].word;
      const surface=Object.values(PRESENT_EXPECTED).map(forms=>forms[person]).find(item=>item!==current);
      s.tokens[verbIndex].word=s.tokens[verbIndex].surfaceHint=s.tokens[verbIndex].expectedSurface=surface;
      s.sentence=s.tokens.map(token=>token.word).join(' ');
    }],
    ['object swap',s=>{
      const replacement=s.tokens[objectIndex].word==='الْكِتَابَ'?'الدَّرْسَ':'الْكِتَابَ';
      s.tokens[objectIndex].word=s.tokens[objectIndex].surfaceHint=s.tokens[objectIndex].expectedSurface=replacement;
      s.sentence=s.tokens.map(token=>token.word).join(' ');
    }]
  ];
  for(const [name,mutate] of attacks){
    const attack=clone(snapshot);mutate(attack);
    assert(api.restoreExerciseSnapshot(attack)===null,`${person} History ${name} attack was accepted`);
    presentAdversarialCases++;
    presentHistoryCases++;
  }
  const stale=clone(snapshot);
  const personPresentation=PHASE2_PRESENTATION_PERSONS.includes(person);
  if(personPresentation){
    stale.translation='FORGED PERSON PRESENTATION.';
    stale.tokens[verbIndex].gloss='forged person gloss';
    stale.tokens[verbIndex].enHint='forged person hint';
  }
  stale.tokens[verbIndex].ar='عَرْضٌ عَرَبِيٌّ مُزَوَّرٌ';
  stale.tokens[verbIndex].en='forged English analysis';
  stale.tokens[verbIndex].why={ids:['FORGED_WHY'],ar:['مُزَوَّرٌ'],en:['forged Why']};
  if(stale.tokens[verbIndex].components?.length){
    Object.assign(stale.tokens[verbIndex].components[0],{
      nameAr:'مُزَوَّرٌ',nameEn:'forged component',ar:'مُزَوَّرٌ',en:'forged component analysis'
    });
  }
  const repaired=api.restoreExerciseSnapshot(stale);
  const repairedVerb=repaired?.tokens.find(token=>token.tense==='present');
  const baseVerb=base.tokens.find(token=>token.tense==='present');
  assert(repaired&&repairedVerb.ar===baseVerb.ar&&repairedVerb.en===baseVerb.en
    &&stableHistoryJson(repairedVerb.why)===stableHistoryJson(baseVerb.why)
    &&stableHistoryJson(repairedVerb.components||[])===stableHistoryJson(baseVerb.components||[]),
    `${person}: canonical token/component/Why presentation was not rebuilt`);
  if(personPresentation){
    assert(repaired.translation===base.translation
      &&repairedVerb.gloss===baseVerb.gloss
      &&repairedVerb.enHint===baseVerb.enHint
      &&repaired.translation.startsWith(PRESENTATION_SUBJECT_PREFIX[person]),
      `${person}: person-aware Phase-2 English presentation was not canonically rebuilt`);
    phase2PersonPresentationRepairCases++;
  }else{
    assert(repaired.translation===snapshot.translation
      &&repairedVerb.gloss===snapshot.tokens[verbIndex].gloss
      &&repairedVerb.enHint===snapshot.tokens[verbIndex].enHint,
      `${person}: pre-existing builder presentation was not retained`);
  }
  presentPresentationRepairCases++;
  presentHistoryCases++;
}
assert(phase2PersonPresentationRepairCases===5,
  'Person-aware presentation repair did not cover exactly the five genuinely new Phase-2 templates');

// Reproduce the exact public identity emitted by the approved Phase-1 checkpoint.
// This test-local copy is intentionally independent of both production identity
// functions so a regression in production cannot manufacture its own fixture.
function checkpointPhase1VerbIdentityRecord(word){
  const record=api.verbFormIndex.get(word);
  if(record?.form!=='presentRaf')return record;
  if(word===record.lexeme?.pres)return{...record,form:'pres'};
  if(word===record.lexeme?.five)return{...record,form:'five'};
  return null;
}
function checkpointPhase1V3Identity(data){
  const tokens=data.tokens.map(token=>{
    const verbRecord=token.grammar?.type==='verb'?checkpointPhase1VerbIdentityRecord(token.word):null;
    const nounRecord=token.grammar?.type==='noun'?api.nounFormIndex.get(token.word):null;
    const morphology=token.tense==='past'?token.grammar?.morphology:null;
    return[
      token.id,
      token.word,
      token.target===true,
      token.grammar?.type||'',
      token.grammar?.role||'',
      token.grammar?.person||'',
      token.grammar?.conjugation||'',
      token.grammar?.particleType||'',
      token.grammar?.particleWord||'',
      token.grammar?.governorWord||'',
      token.grammar?.isMudaf===true,
      token.grammar?.attachedKaf===true,
      token.grammar?.delayed===true,
      token.tense||'',
      token.inflection||'',
      token.state||'',
      token.sign?.id||'',
      verbRecord?.form||'',
      verbRecord?.surface||'',
      verbRecord?.lexeme?.past||'',
      verbRecord?.lexeme?.pres||'',
      nounRecord?.lexeme?.nom||'',
      nounRecord?.lexeme?.acc||'',
      nounRecord?.lexeme?.gen||'',
      morphology?.person||'',
      morphology?.subjectMode||'',
      morphology?.endingClass||'',
      morphology?.binaaClass||''
    ];
  });
  return'nahw-exercise-v1:'+JSON.stringify([
    data.templateId,
    data.templateStarts,
    data.templateForm,
    data.templateState,
    data.templateSign,
    tokens
  ]);
}
function checkpointPhase1V3Fixture(currentSnapshot){
  const fixture=clone(currentSnapshot);
  for(const token of fixture.tokens){
    if(token?.grammar?.type!=='verb'||token.tense!=='present')continue;
    token.grammar.morphology={feminineTaa:false};
    const historicalLexeme=api.verbs.find(lexeme=>lexeme.past===token.lexeme?.past);
    assert(historicalLexeme,`${token.word}: historical present lexeme could not be reconstructed`);
    token.lexeme=clone(historicalLexeme);
  }
  fixture.exerciseIdentity=checkpointPhase1V3Identity(fixture);
  assert(fixture.exerciseIdentity===api.canonicalExerciseIdentityV3Phase1(fixture),
    `${fixture.templateId}: production and independent Phase-1 identity canonicalizers disagree`);
  assert(fixture.exerciseIdentity!==api.canonicalExerciseIdentity(fixture),
    `${fixture.templateId}: historical and current v3 identities unexpectedly match`);
  assert(api.isPhase1V3IdentityCandidate(fixture,api.templates.find(template=>template.stableId===fixture.templateId)),
    `${fixture.templateId}: genuine historical fixture was not classified as a Phase-1 candidate`);
  return fixture;
}
function findPureNominalSnapshot(){
  for(const template of api.templates.filter(candidate=>candidate.starts==='noun')){
    const data=api.buildTemplate(template.id);
    if(!data.tokens.some(token=>token.grammar.type==='verb'))return api.createExerciseSnapshot(data);
  }
  return null;
}

const nominalLegacySource=findPureNominalSnapshot();
assert(nominalLegacySource,'Could not construct a pure nominal schema-v3 checkpoint fixture');
const legacyV3Fixtures=Object.freeze({
  attachedPast:checkpointPhase1V3Fixture(identitySource),
  nominal:checkpointPhase1V3Fixture(nominalLegacySource),
  ordinaryPresent:checkpointPhase1V3Fixture(api.createExerciseSnapshot(phase2Case('3ms','كَتَبَ'))),
  fiveVerb:checkpointPhase1V3Fixture(api.createExerciseSnapshot(phase2Case('3mp','كَتَبَ')))
});

// Positive restoration, canonical cache repair, migration-on-repersist, and a
// stable second restore for each real checkpoint-shaped fixture.
const restoredLegacyFixtures={};
for(const [name,fixture] of Object.entries(legacyV3Fixtures)){
  const canonical=api.restoreExerciseSnapshot(clone(fixture));
  assert(canonical,`${name}: exact Phase-1 schema-v3 fixture did not restore`);
  assert(api.validateExercise(canonical).length===0,`${name}: restored legacy fixture is not valid under current rules`);

  const stale=clone(fixture);
  stale.relationships=[{type:'forged-cache'}];
  for(const token of stale.tokens){
    token.ar='مُزَوَّرٌ';
    token.en='forged analysis';
    token.relations={forged:true};
    token.why={ids:['FORGED_WHY'],ar:['مُزَوَّرٌ'],en:['forged Why']};
    if(token.grammar.type==='verb')token.components=[{id:`${token.id}:FORGED`,kind:'forged'}];
  }
  if(name==='attachedPast'){
    stale.translation='FORGED TRANSLATION.';
    stale.tokens[0].gloss='forged gloss';
  }
  const repaired=api.restoreExerciseSnapshot(stale);
  assert(repaired,`${name}: presentation/cache-only corruption was not canonically repairable`);
  assert(JSON.stringify(repaired.relationships)===JSON.stringify(canonical.relationships),
    `${name}: relationships were not rebuilt canonically`);
  repaired.tokens.forEach((token,index)=>{
    const expected=canonical.tokens[index];
    assert(token.ar===expected.ar&&token.en===expected.en,`${name}/${index}: token presentation retained forged cache data`);
    assert(JSON.stringify(token.relations)===JSON.stringify(expected.relations),`${name}/${index}: token relationships retained forged cache data`);
    assert(JSON.stringify(token.why)===JSON.stringify(expected.why),`${name}/${index}: token Why retained forged cache data`);
    assert(JSON.stringify(token.components||[])===JSON.stringify(expected.components||[]),`${name}/${index}: token components retained forged cache data`);
  });
  if(name==='attachedPast'){
    assert(repaired.translation===canonical.translation&&repaired.tokens[0].gloss===canonical.tokens[0].gloss,
      `${name}: supported History presentation was not rebuilt canonically`);
  }else{
    assert(repaired.translation===fixture.translation&&repaired.tokens[0].gloss===fixture.tokens[0].gloss,
      `${name}: builder-owned presentation did not survive legacy-v3 restoration`);
  }

  const current=api.createExerciseSnapshot(repaired);
  assert(current?.schemaVersion===3,`${name}: repersisted legacy fixture did not remain schema version 3`);
  assert(current.exerciseIdentity===api.canonicalExerciseIdentity(repaired),
    `${name}: repersisted fixture did not receive the current-v3 identity`);
  assert(current.exerciseIdentity!==fixture.exerciseIdentity,
    `${name}: repersisted fixture retained its historical identity`);
  const second=api.restoreExerciseSnapshot(clone(current));
  assert(second&&api.createExerciseSnapshot(second)?.exerciseIdentity===current.exerciseIdentity,
    `${name}: current-v3 second restore was not stable`);
  restoredLegacyFixtures[name]=canonical;
  legacyV3PositiveCases++;
  legacyV3RepersistenceCases++;
}

function assertLegacyIdentityReject(name,fixture,mutate){
  const attack=clone(fixture);
  mutate(attack);
  assert(api.restoreExerciseSnapshot(attack)===null,`${name}: legacy-v3 identity mutation was accepted`);
  legacyV3AdversarialCases++;
}
const alternateNounSurface=[...api.nounFormIndex.keys()].find(word=>
  !legacyV3Fixtures.nominal.tokens.some(token=>token.word===word));
assert(alternateNounSurface,'Could not find an alternate registered noun for legacy attacks');

// Every fixture rejects unknown templates, surface changes, and state/sign
// changes while retaining its original historical identity.
for(const [name,fixture] of Object.entries(legacyV3Fixtures)){
  assertLegacyIdentityReject(`${name} unknown template`,fixture,attack=>{attack.templateId='T_FORGED_UNKNOWN_01'});
  assertLegacyIdentityReject(`${name} surface`,fixture,attack=>{
    const index=attack.tokens.findIndex(token=>token.grammar.type==='verb'||token.grammar.type==='noun');
    const token=attack.tokens[index];
    if(token.tense==='past'){
      token.word=token.surfaceHint=token.expectedSurface=writeAdvanced.forms['2ms'];
    }else if(token.tense==='present'){
      const person=token.grammar.person==='3ms'?'3mp':'3ms';
      token.word=token.surfaceHint=token.expectedSurface=PRESENT_EXPECTED['كَتَبَ'][person];
    }else{
      token.word=token.surfaceHint=token.expectedSurface=alternateNounSurface;
    }
    attack.sentence=attack.tokens.map(item=>item.word).join(' ');
  });
  assertLegacyIdentityReject(`${name} state`,fixture,attack=>{
    const token=attack.tokens.find(item=>item.grammar.type==='verb'||item.grammar.type==='noun');
    token.state=token.state==='raf'?'nasb':'raf';
  });
  assertLegacyIdentityReject(`${name} sign`,fixture,attack=>{
    const token=attack.tokens.find(item=>item.grammar.type==='verb'||item.grammar.type==='noun');
    token.sign={id:token.sign?.id==='damma'?'fatha':'damma'};
  });
}

// Required coordinated identity attacks: all stored canonical layers move to a
// different valid exercise, but the original historical identity stays behind.
const legacy2ms=checkpointPhase1V3Fixture(phase1ProductionSnapshots['2ms']);
const pastPersonRewrite=clone(legacy2ms);
pastPersonRewrite.exerciseIdentity=legacyV3Fixtures.attachedPast.exerciseIdentity;
assert(api.restoreExerciseSnapshot(pastPersonRewrite)===null,
  'Phase-1 legacy 1s identity accepted a coordinated rewrite to 2ms');
legacyV3AdversarialCases++;

const presentPersonRewrite=clone(legacyV3Fixtures.fiveVerb);
presentPersonRewrite.exerciseIdentity=legacyV3Fixtures.ordinaryPresent.exerciseIdentity;
assert(api.restoreExerciseSnapshot(presentPersonRewrite)===null,
  'Legacy ordinary 3ms identity accepted a coordinated rewrite to 3mp');
legacyV3AdversarialCases++;

assertLegacyIdentityReject('legacy five-verb raf to dropped-nun structure',legacyV3Fixtures.fiveVerb,attack=>{
  const verb=attack.tokens.find(token=>token.tense==='present');
  verb.word=verb.surfaceHint=verb.expectedSurface=verb.lexeme.fiveSub;
  verb.state='nasb';
  verb.sign={id:'nunDropped'};
  attack.sentence=attack.tokens.map(token=>token.word).join(' ');
});

const alternateNominalSource=findPureNominalSnapshot();
assert(alternateNominalSource,'Could not construct an alternate nominal checkpoint fixture');
const nominalReplacement=checkpointPhase1V3Fixture(alternateNominalSource);
nominalReplacement.exerciseIdentity=legacyV3Fixtures.nominal.exerciseIdentity;
if(checkpointPhase1V3Identity(nominalReplacement)===legacyV3Fixtures.nominal.exerciseIdentity){
  const noun=nominalReplacement.tokens.find(token=>token.grammar.type==='noun');
  noun.word=noun.surfaceHint=noun.expectedSurface=alternateNounSurface;
  nominalReplacement.sentence=nominalReplacement.tokens.map(token=>token.word).join(' ');
}
assert(api.restoreExerciseSnapshot(nominalReplacement)===null,
  'Legacy nominal identity accepted a coordinated noun replacement');
legacyV3AdversarialCases++;

const legacyDifferentLexeme=checkpointPhase1V3Fixture(differentLexeme);
legacyDifferentLexeme.exerciseIdentity=legacyV3Fixtures.attachedPast.exerciseIdentity;
assert(api.restoreExerciseSnapshot(legacyDifferentLexeme)===null,
  'Legacy past identity accepted a same-person different-lexeme rewrite');
legacyV3AdversarialCases++;
const legacyDifferentObject=checkpointPhase1V3Fixture(differentObject);
legacyDifferentObject.exerciseIdentity=legacyV3Fixtures.attachedPast.exerciseIdentity;
assert(api.restoreExerciseSnapshot(legacyDifferentObject)===null,
  'Legacy past identity accepted a different-object rewrite');
legacyV3AdversarialCases++;

// The complete 7×6 coordinated current-v3 person matrix remains strict.
const currentPresentSnapshots=Object.fromEntries(PRESENT_PERSONS.map(person=>[
  person,api.createExerciseSnapshot(phase2Case(person,'كَتَبَ'))
]));
for(const sourcePerson of PRESENT_PERSONS){
  for(const targetPerson of PRESENT_PERSONS.filter(person=>person!==sourcePerson)){
    const attack=clone(currentPresentSnapshots[targetPerson]);
    attack.exerciseIdentity=currentPresentSnapshots[sourcePerson].exerciseIdentity;
    assert(api.restoreExerciseSnapshot(attack)===null,
      `Current Phase-2 ${sourcePerson} identity accepted a coordinated rewrite to ${targetPerson}`);
    phase2CoordinatedHistoryCases++;
    presentAdversarialCases++;
    presentHistoryCases++;
  }
}
assert(phase2CoordinatedHistoryCases===42,'The coordinated Phase-2 7×6 History matrix was not completed');

// A current Phase-2 snapshot carrying its current morphology and lexeme caches
// cannot opt into the historical path merely by receiving a computed old-format ID.
for(const person of PRESENT_PERSONS){
  const attack=clone(currentPresentSnapshots[person]);
  const verb=attack.tokens.find(token=>token.tense==='present');
  attack.exerciseIdentity=checkpointPhase1V3Identity(attack);
  verb.grammar.morphology.formClass='forged-downgrade';
  assert(api.restoreExerciseSnapshot(attack)===null,
    `${person}: corrupted current-v3 snapshot downgraded into the Phase-1 identity path`);
  phase2DowngradeAttackCases++;
  presentAdversarialCases++;
  presentHistoryCases++;
}

// Phase-2b-B boundary: nūn al-TAWKĪD remains entirely out of authority. Its surfaces share an
// unvowelized skeleton with nūn al-niswah (يكتبن) but are built on FATḤ, not sukūn, so only the
// fully vocalized niswah forms may exist. Governed niswah forms belong to Phase 2b-C.
for(const deferred of ['يَكْتُبَنَّ','يَكْتُبَنْ','تَكْتُبَنَّ','يَفْتَحَنَّ','لَنْ يَكْتُبْنَ','لَمْ يَكْتُبْنَ']){
  assert(!api.verbFormIndex.has(deferred),`Deferred present surface entered authority: ${deferred}`);
}
for(const [surface,readings] of [['تَكْتُبُ',['2ms','3fs']],['تَفْتَحُ',['2ms','3fs']],['تَدْرُسُ',['2ms','3fs']],
  ['تَكْتُبَانِ',['2d','3fd']],['تَفْتَحَانِ',['2d','3fd']],['تَدْرُسَانِ',['2d','3fd']]]){
  const record=api.verbFormIndex.get(surface);
  assert(record&&record.morphology&&record.morphology.presentPersonCandidates,`Ambiguous surface ${surface} carries no reading set`);
  assert([...record.morphology.presentPersonCandidates].sort().join('|')===[...readings].sort().join('|'),
    `Ambiguous surface ${surface} does not declare exactly its real readings`);
  assert(Object.isFrozen(record.morphology.presentPersonCandidates),`Reading set for ${surface} is not frozen`);
  ambiguityCases++;
}
for(const person of api.PRESENT_NON_PRODUCTION_PERSONS){
  assert(!api.templates.some(template=>template.presentCapabilities.some(capability=>capability.person===person)),
    `Deferred person ${person} acquired a production template`);
  ambiguityCases++;
}

// ===== Phase 2b-A: fronted-mubtadaʾ 3fs / 3fd, D-3 concealment, ambiguity resolution =====
// The fronted noun is the MUBTADAʾ and never the fāʿil; the fāʿil is the verb's own hidden
// pronoun (3fs) or its attached alif (3fd), and that pronoun is the rābiṭ.
const frontedTemplates=Object.fromEntries(api.templates.filter(t=>t.frontedPresent).map(t=>[t.presentPerson,t]));
assert(frontedTemplates['3fs']&&frontedTemplates['3fd'],'Fronted 3fs/3fd templates are missing');
const FRONTED_EXPECTED={
  '3fs':{surfaces:['تَكْتُبُ','تَفْتَحُ','تَدْرُسُ'],sign:'damma',formClass:'ordinary',endingClass:'none',subjectMode:'implicit'},
  '3fd':{surfaces:['تَكْتُبَانِ','تَفْتَحَانِ','تَدْرُسَانِ'],sign:'nunKept',formClass:'afalKhamsa',endingClass:'alif-ithnain',subjectMode:'attached'}
};
const frontedProduction={};   // every subject×verb pair, all deep-checked below
const frontedBySurface={};    // one stable fixture per surface, for the attack fixtures
for(const person of ['3fs','3fd']){
  // The subject rotates in a per-verb namespace, so the (verb, subject) sequence is a
  // deterministic period-9 cycle: nine consecutive builds must visit all nine pairs
  // exactly once. The window is exactly nine — a larger sample would let a regression
  // back into subject/verb phase-lock hide behind sheer volume.
  const pairs=new Map();
  for(let i=0;i<9;i++){
    const data=api.buildTemplate(frontedTemplates[person].id);
    const verb=data.tokens.find(t=>t.tense==='present');
    const noun=data.tokens[0].word;
    const pairKey=noun+'|'+verb.word;
    assert(!pairs.has(pairKey),person+': pair '+pairKey+' repeated inside one nine-build cycle');
    pairs.set(pairKey,data);
    frontedProduction[person+':'+noun+':'+verb.word]=data;
    if(!frontedBySurface[person+':'+verb.word])frontedBySurface[person+':'+verb.word]=data;
  }
  const nouns=[...new Set([...pairs.keys()].map(key=>key.split('|')[0]))];
  const verbs=[...new Set([...pairs.keys()].map(key=>key.split('|')[1]))];
  // The expected verb set comes from the production registry, not from what was generated.
  const canonicalVerbs=[...api.verbFormIndex.values()]
    .filter(record=>record.form==='presentRaf'&&record.morphology.presentPerson===person)
    .map(record=>record.surface);
  assert(canonicalVerbs.length===3,person+': expected three registered surfaces, found '+canonicalVerbs.length);
  for(const surface of FRONTED_EXPECTED[person].surfaces){
    assert(canonicalVerbs.includes(surface),person+': registry lost exact surface '+surface);
    assert(verbs.includes(surface),person+': exact registered surface '+surface+' was never produced');
  }
  assert(verbs.length===3&&verbs.every(v=>canonicalVerbs.includes(v)),
    person+': production emitted a surface outside the registry');
  assert(nouns.length===3,person+': expected three reviewed feminine antecedents, saw '+nouns.length);
  // The observed pair set must equal the complete 3×3 Cartesian product.
  assert(pairs.size===9,person+': expected nine subject-verb pairs, saw '+pairs.size);
  for(const noun of nouns)for(const verb of verbs){
    assert(pairs.has(noun+'|'+verb),person+': subject-verb pair '+noun+'|'+verb+' is unreachable');
  }
  for(const noun of nouns){
    assert(verbs.every(verb=>pairs.has(noun+'|'+verb)),person+': '+noun+' is welded to a subset of the verbs');
  }
  for(const verb of verbs){
    assert(nouns.every(noun=>pairs.has(noun+'|'+verb)),person+': '+verb+' is welded to a subset of the nouns');
  }
  // Whichever pair was saved must survive a History round trip unchanged.
  for(const [pairKey,data] of pairs){
    const restored=api.restoreExerciseSnapshot(clone(api.createExerciseSnapshot(data)));
    assert(restored,person+': pair '+pairKey+' did not restore from History');
    const restoredVerb=restored.tokens.find(t=>t.tense==='present');
    assert(restored.tokens[0].word+'|'+restoredVerb.word===pairKey,
      person+': History restore changed the saved subject-verb pair '+pairKey);
    frontedCases++;
  }
  ambiguityCases++;
}
// --- Combining-mark order: the new feminine nouns follow the project's local convention ---
// The project stores shadda BEFORE its vowel. That is deliberately not NFC, which orders by
// combining class and puts the vowel first. New vocabulary must match the convention already
// used by its masculine counterpart, or exact-literal registry lookup can diverge.
{
  const VOWEL_THEN_SHADDA=/[ً-ِْ]ّ/u;
  const newNouns=[...new Set(Object.values(frontedProduction).map(data=>data.tokens[0].word))];
  assert(newNouns.length===6,'Expected exactly six new feminine nouns, saw '+newNouns.length);
  const counterparts=api.nounLexicons.singularPeople.filter(noun=>noun.nom.includes('ّ')).map(noun=>noun.nom);
  assert(counterparts.length>0,'No shadda-bearing masculine counterpart was found to model');
  for(const word of counterparts){
    assert(!VOWEL_THEN_SHADDA.test(word),'Existing lexeme '+word+' no longer follows the shadda-first convention');
  }
  let shaddaBearing=0;
  for(const word of newNouns){
    assert(api.nounFormIndex.get(word),'New feminine noun '+word+' is not registered under its stored literal');
    if(word.includes('ّ')){
      shaddaBearing++;
      assert(!VOWEL_THEN_SHADDA.test(word),
        'New feminine noun '+word+' orders its vowel before the shadda, unlike its masculine counterpart');
      // Canonically equivalent to the NFC spelling: only mark order differs, nothing visible.
      assert(word.normalize('NFC')!==word&&word.normalize('NFD')===word.normalize('NFC').normalize('NFD'),
        'New feminine noun '+word+' is not a pure combining-mark reordering');
    }
  }
  assert(shaddaBearing===4,'Expected four shadda-bearing new nouns, saw '+shaddaBearing);
  // No canonically equivalent duplicate may exist anywhere in the noun registry.
  const byNfc=new Map();
  for(const key of api.nounFormIndex.keys()){
    const nfc=key.normalize('NFC');
    assert(!byNfc.has(nfc),'Registry holds canonically equivalent duplicates: '+byNfc.get(nfc)+' and '+key);
    byNfc.set(nfc,key);
  }
  frontedCases++;
}
for(const [key,data] of Object.entries(frontedProduction)){
  const person=key.split(':')[0];
  const expected=FRONTED_EXPECTED[person];
  const failures=api.validateExercise(data);
  assert(failures.length===0,key+': fronted exercise did not validate ('+failures.map(f=>f.code).join(', ')+')');
  const mubtada=data.tokens.find(t=>t.grammar.role==='mubtada');
  const verb=data.tokens.find(t=>t.tense==='present');
  const object=data.tokens.find(t=>t.grammar.role==='object');
  assert(mubtada&&verb&&object&&data.tokens.length===3,key+': fronted structure is incomplete');
  assert(data.tokens.indexOf(mubtada)===0,key+': the mubtadaʾ is not fronted');
  assert(!data.tokens.some(t=>t.grammar.role==='faail'),key+': an explicit fāʿil appeared in a fronted construction');
  assert(arHas(mubtada.ar,'مُبْتَدَأٌ')&&mubtada.state==='raf',
    key+': fronted noun is not a nominative mubtadaʾ');
  assert(verb.grammar.person===person&&verb.grammar.morphology.person===person,key+': resolved person is wrong');
  assert(verb.grammar.morphology.formClass===expected.formClass
    &&verb.grammar.morphology.endingClass===expected.endingClass
    &&verb.grammar.morphology.subjectMode===expected.subjectMode,key+': morphology disagrees with its person');
  assert(verb.state==='raf'&&verb.sign.id===expected.sign,key+': fronted present verb state/sign is wrong');
  assert(arHas(verb.ar,'فِعْلٌ مُضَارِعٌ مَرْفُوعٌ'),
    key+': whole-word iʿrāb does not state present rafʿ');
  const rel=data.relationships.find(r=>r.type==='mubtadaKhabar');
  assert(rel&&rel.khabarKind==='verbalSentence'&&rel.mubtadaId===mubtada.id&&rel.anchorId===verb.id,
    key+': the verbal sentence is not registered as the khabar of the fronted mubtadaʾ');
  const tail=data.tokens[data.tokens.length-1];
  assert(arHas(tail.phraseAr,'فِي مَحَلِّ رَفْعٍ خَبَرٌ')&&arHas(tail.phraseAr,'«'+mubtada.word+'»'),
    key+': combined analysis omits the khabar position or its mubtadaʾ');
  assert(arHas(tail.phraseAr,'الرَّابِطُ'),key+': combined analysis omits the rābiṭ');
  const subjectRel=data.relationships.find(r=>r.type==='verbSubject'&&r.verbId===verb.id);
  if(person==='3fs'){
    assert(subjectRel.subjectType==='implicit'&&arEq(subjectRel.pronoun,'هِيَ'),key+': 3fs hidden subject is not هِيَ');
    assert(arHas(verb.ar,'ضَمِيرٌ مُسْتَتِرٌ جَوَازًا')&&arHas(verb.ar,'«هِيَ»'),
      key+': 3fs whole-word iʿrāb lacks جوازًا/هِيَ');
    assert(!arHas(verb.ar,'وُجُوبًا'),key+': 3fs must not claim obligatory concealment');
    assert(verb.subjectRuleId==='R_HIDDEN_SUBJECT_JAWAZ_3S',key+': 3fs concealment is not bound to the jawāz rule');
    assert(arHas(tail.phraseAr,'«هِيَ»'),key+': the rābiṭ is not the hidden هِيَ');
    assert((verb.components||[]).length===0,key+': 3fs must carry no internal component');
    const why=api.buildTokenWhy(verb,data);
    assert(why.ids.includes('WHY_SUBJECT_HIDDEN_HIYA'),key+': 3fs Why does not use the هِيَ rule');
    assert(why.ar.join(' ').includes('جَوَازًا')&&why.ar.join(' ').includes('«هِيَ»'),key+': 3fs Why omits جوازًا/هِيَ');
  }else{
    assert(subjectRel.subjectType==='attached'&&arEq(subjectRel.pronoun,'أَلِفُ الِاثْنَيْنِ'),key+': 3fd subject is not the attached alif');
    const alif=(verb.components||[]).find(c=>c.kind==='alif-ithnain');
    assert(alif&&alif.syntacticRole==='fail'&&alif.mahall==='raf'&&alif.binaaSign==='sukun'&&alif.ruleId==='C_ALIF_ITHNAIN',
      key+': 3fd alif component is not the canonical attached fāʿil');
    assert(alif.id.indexOf(verb.id)===0,key+': 3fd alif component is not owned by its verb');
    assert(arHas(verb.sign.ar,'ثُبُوتُ النُّونِ'),key+': 3fd sign is not retention of the nūn');
    assert(!arHas(verb.ar,'مُسْتَتِرٌ'),key+': 3fd must not claim a hidden subject');
    assert(!verb.subjectRuleId,key+': 3fd must not carry a concealment rule');
    assert(arHas(tail.phraseAr,'أَلِفُ الِاثْنَيْنِ'),key+': the rābiṭ is not the attached alif');
  }
  frontedCases++;
}

// --- Ambiguity resolution: surface × template capability -> exactly one person ------------
for(const pair of [['تَكْتُبُ','3fs'],['تَكْتُبَانِ','3fd']]){
  const surface=pair[0],person=pair[1];
  const record=api.verbFormIndex.get(surface);
  const template=frontedTemplates[person];
  assert(api.resolvePresentReading(record,{templateId:template.stableId})===person,
    surface+': canonical template did not resolve exactly one person');
  const unrelated=api.templates.find(t=>t.presentCapabilities.some(c=>c.person==='1s'));
  assert(api.resolvePresentReading(record,{templateId:unrelated.stableId})===null,
    surface+': a template authorizing neither reading still resolved a person');
  assert(api.resolvePresentReading(record,{})===null,surface+': resolved a person with no template');
  assert(api.resolvePresentReading(record,null)===null,surface+': resolved a person with no data');
  assert(api.resolvePresentReading(record,{templateId:'T_DOES_NOT_EXIST_99'})===null,
    surface+': an unknown template still resolved a person');
  const reversedCandidates=record.morphology.presentPersonCandidates.slice().reverse();
  const reversed={...record,morphology:{...record.morphology,presentPersonCandidates:reversedCandidates}};
  assert(api.resolvePresentReading(reversed,{templateId:template.stableId})===person,
    surface+': resolution depends on candidate order');
  const both={stableId:'T_FAKE_BOTH_01',presentCapabilities:record.morphology.presentPersonCandidates.map(p=>({person:p}))};
  const originalLength=api.templates.length;
  api.templates.push(both);
  assert(api.resolvePresentReading(record,{templateId:both.stableId})===null,
    surface+': a template claiming both readings still resolved a single person');
  api.templates.length=originalLength;
  ambiguityCases+=7;
}
for(const template of api.templates){
  for(const readings of Object.values(api.PRESENT_SURFACE_READINGS)){
    const claimed=readings.filter(p=>template.presentCapabilities.some(c=>c.person===p));
    assert(claimed.length<=1,template.stableId+' authorizes more than one reading of a shared surface');
  }
}

// --- Same-surface person attacks: the Arabic never changes, only the claim ----------------
for(const pair of [['3fs','2ms'],['3fd','2d']]){
  const person=pair[0],other=pair[1];
  const base=frontedBySurface[person+':'+FRONTED_EXPECTED[person].surfaces[0]];
  assertPhase2Failure(person+' stored as '+other,mutatePresentVerb(clone(base),verb=>{verb.grammar.person=other}),
    'E_PRESENT_PERSON','E_PRESENT_TEMPLATE_AUTHORIZATION','E_VERB_MORPHOLOGY');
  assertPhase2Failure(person+' morphology rewritten to '+other,mutatePresentVerb(clone(base),verb=>{
    verb.grammar.person=other;verb.grammar.morphology={...verb.grammar.morphology,person:other};
  }),'E_PRESENT_PERSON','E_PRESENT_TEMPLATE_AUTHORIZATION','E_VERB_MORPHOLOGY');
  const swapped=clone(base);
  swapped.templateId=frontedTemplates[person==='3fs'?'3fd':'3fs'].stableId;
  assertPhase2Failure(person+' rehomed onto the other fronted template',swapped,
    'E_TEMPLATE_METADATA','E_PRESENT_TEMPLATE_AUTHORIZATION','E_PRESENT_PERSON','E_PRESENT_SURFACE');
  ambiguityCases++;
}

// --- 3fs syntax attacks ------------------------------------------------------------------
const fs3=frontedBySurface['3fs:تَكْتُبُ'];
assertPhase2Failure('3fs hidden pronoun swapped to huwa',mutatePresentVerb(clone(fs3),(verb,data)=>{
  verb.relations.subjectPronoun='هُوَ';
  const rel=data.relationships.find(r=>r.type==='verbSubject'&&r.verbId===verb.id);rel.pronoun='هُوَ';
}),'E_PRESENT_IMPLICIT_SUBJECT');
assertPhase2Failure('3fs concealment bound to the wajib rule',mutatePresentVerb(clone(fs3),verb=>{
  verb.subjectRuleId='R_HIDDEN_SUBJECT_WAJIB_PRESENT';
}),'E_PRESENT_CONCEALMENT_SOURCE');
assertPhase2Failure('3fs concealment source removed',mutatePresentVerb(clone(fs3),verb=>{delete verb.subjectRuleId}),'E_PRESENT_CONCEALMENT_SOURCE');
assertPhase2Failure('3fs subjectMode rewritten to explicit',mutatePresentVerb(clone(fs3),verb=>{
  verb.grammar.morphology={...verb.grammar.morphology,subjectMode:'explicit'};
}),'E_VERB_MORPHOLOGY','E_PRESENT_IMPLICIT_SUBJECT');
{
  const asFail=clone(fs3);
  asFail.tokens[0].grammar.role='faail';
  assertPhase2Failure('3fs fronted noun relabelled as fail',asFail,
    'E_PRESENT_IMPLICIT_SUBJECT','E_KHABAR_NO_MUBTADA','E_ROLE_CASE','E_PRESENT_EXPLICIT_SUBJECT','E_MUBTADA_NO_KHABAR','E_ORPHAN_SUBJECT','E_WHY_CANONICAL');
}
{
  const noKhabar=clone(fs3);
  noKhabar.relationships=noKhabar.relationships.filter(r=>r.type!=='mubtadaKhabar');
  assertPhase2Failure('3fs mubtada left without its khabar',noKhabar,'E_MUBTADA_NO_KHABAR');
}

// --- 3fd syntax attacks ------------------------------------------------------------------
const fd3=frontedBySurface['3fd:تَكْتُبَانِ'];
assertPhase2Failure('3fd alif component removed',mutatePresentVerb(clone(fd3),verb=>{verb.components=[]}),'E_COMPONENT_SET');
assertPhase2Failure('3fd alif component given the wrong role',mutatePresentVerb(clone(fd3),verb=>{verb.components[0].syntacticRole='none'}),'E_COMPONENT_INVARIANT');
assertPhase2Failure('3fd alif component given the wrong mahall',mutatePresentVerb(clone(fd3),verb=>{verb.components[0].mahall='nasb'}),'E_COMPONENT_INVARIANT');
assertPhase2Failure('3fd alif component given the wrong binaa',mutatePresentVerb(clone(fd3),verb=>{verb.components[0].binaaSign='fatha'}),'E_COMPONENT_INVARIANT');
assertPhase2Failure('3fd alif component given the wrong owner',mutatePresentVerb(clone(fd3),verb=>{verb.components[0].id='OTHER:T1:C1'}),'E_COMPONENT_ID');
assertPhase2Failure('3fd claims a hidden subject instead of its alif',mutatePresentVerb(clone(fd3),(verb,data)=>{
  const rel=data.relationships.find(r=>r.type==='verbSubject'&&r.verbId===verb.id);
  rel.subjectType='implicit';rel.pronoun='هِيَ';verb.relations.subjectType='implicit';verb.relations.subjectPronoun='هِيَ';
}),'E_ATTACHED_SUBJECT','E_PRESENT_CONCEALMENT_SOURCE');
{
  const noKhabar=clone(fd3);
  noKhabar.relationships=noKhabar.relationships.filter(r=>r.type!=='mubtadaKhabar');
  assertPhase2Failure('3fd mubtada left without its khabar',noKhabar,'E_MUBTADA_NO_KHABAR');
}
{
  const asFail=clone(fd3);
  asFail.tokens[0].grammar.role='faail';
  assertPhase2Failure('3fd fronted dual relabelled as fail',asFail,
    'E_KHABAR_NO_MUBTADA','E_ROLE_CASE','E_NOUN_SIGN','E_TOKEN_INCOMPLETE','E_MUBTADA_NO_KHABAR','E_ORPHAN_SUBJECT','E_WHY_CANONICAL');
}

// --- D-3 source authorization ------------------------------------------------------------
assert(api.isSourceAuthorized('R_HIDDEN_SUBJECT_WAJIB_PRESENT'),'The wajib concealment rule is not source-authorized');
assert(api.isSourceAuthorized('R_HIDDEN_SUBJECT_JAWAZ_3S'),'The jawaz concealment rule is not source-authorized');
for(const pair of [['R_HIDDEN_SUBJECT_WAJIB_PRESENT',['1s','1p','2ms']],['R_HIDDEN_SUBJECT_JAWAZ_3S',['3ms','3fs']]]){
  for(const person of pair[1]){
    assert(api.PRESENT_CONCEALMENT[person].ruleId===pair[0],person+' is not bound to '+pair[0]);
  }
}
assert(arEq(api.PRESENT_CONCEALMENT['1s'].ar,'وُجُوبًا')&&arEq(api.PRESENT_CONCEALMENT['1p'].ar,'وُجُوبًا'),
  'Speaker concealment must be obligatory');
assert(arEq(api.PRESENT_CONCEALMENT['3ms'].ar,'جَوَازًا')&&arEq(api.PRESENT_CONCEALMENT['3fs'].ar,'جَوَازًا'),
  'Singular absent-person concealment must be permissible');
{
  const wajib=api.SOURCE_REGISTRY.R_HIDDEN_SUBJECT_WAJIB_PRESENT;
  const jawaz=api.SOURCE_REGISTRY.R_HIDDEN_SUBJECT_JAWAZ_3S;
  assert(wajib.primarySource.pdfPages.includes(81),'The wajib rule lost its Al-Tuhfah p.81 primary page');
  assert(wajib.secondarySources.some(s=>s.authorityId==='DAKUR_APPLIED_GRAMMAR_2E'
    &&s.pdfPages.includes(26)&&s.pdfPages.includes(90)),'The wajib rule lost its Dakur pp.26/90 support');
  assert(jawaz.primarySource.pdfPages.includes(130),'The jawaz rule lost its Al-Tuhfah p.130 primary page');
  assert(jawaz.secondarySources.some(s=>s.authorityId==='DAKUR_APPLIED_GRAMMAR_2E'
    &&[24,26,90].every(page=>s.pdfPages.includes(page))),'The jawaz rule lost its Dakur pp.24/26/90 support');
  assertSourceRecordRejected('forged wajib record','R_HIDDEN_SUBJECT_WAJIB_PRESENT',{...clone(wajib),ruleId:'R_HIDDEN_SUBJECT_WAJIB_PRESENT'});
  assertSourceRecordRejected('forged jawaz record','R_HIDDEN_SUBJECT_JAWAZ_3S',{...clone(jawaz),ruleId:'R_HIDDEN_SUBJECT_JAWAZ_3S'});
  assertSourceRecordRejected('wajib record claimed by the jawaz rule','R_HIDDEN_SUBJECT_JAWAZ_3S',wajib);
  assertSourceRecordRejected('jawaz record claimed by the wajib rule','R_HIDDEN_SUBJECT_WAJIB_PRESENT',jawaz);
  assert(!api.isSourceAuthorized('R_HIDDEN_SUBJECT_UNKNOWN'),'An unknown concealment rule was authorized');
}
assertPhase2Failure('1s concealment bound to the jawaz rule',mutatePresentVerb(phase2Case('1s'),verb=>{
  verb.subjectRuleId='R_HIDDEN_SUBJECT_JAWAZ_3S';
}),'E_PRESENT_CONCEALMENT_SOURCE');

// --- History: schema v3, canonical presentation, coordinated same-surface rewrites --------
const frontedSnapshots={};
for(const person of ['3fs','3fd']){
  const data=frontedBySurface[person+':'+FRONTED_EXPECTED[person].surfaces[0]];
  const snapshot=api.createExerciseSnapshot(data);
  frontedSnapshots[person]=snapshot;
  assert(snapshot.schemaVersion===3,person+': fronted snapshot is not schema v3');
  const restored=api.restoreExerciseSnapshot(clone(snapshot));
  assert(restored,person+': a clean fronted snapshot did not restore');
  assert(api.validateExercise(restored).length===0,person+': restored fronted snapshot does not validate');
  const corrupt=clone(snapshot);
  corrupt.translation='forged translation';
  corrupt.tokens.forEach(token=>{token.gloss='forged';token.enHint='forged';});
  const repaired=api.restoreExerciseSnapshot(corrupt);
  assert(repaired,person+': corrupted fronted presentation did not restore');
  assert(repaired.translation===data.translation,person+': fronted translation was not canonically rebuilt');
  assert(repaired.tokens.every((token,i)=>token.gloss===data.tokens[i].gloss),person+': fronted glosses were not canonically rebuilt');
  frontedCases+=2;
  presentHistoryCases+=3;
}
for(const pair of [['3fs','3fd'],['3fd','3fs']]){
  const coordinated=clone(frontedSnapshots[pair[1]]);
  coordinated.exerciseIdentity=frontedSnapshots[pair[0]].exerciseIdentity;
  assert(api.restoreExerciseSnapshot(coordinated)===null,
    pair[0]+' History identity accepted a complete coordinated rewrite to '+pair[1]);
  coordinatedHistoryAttackCases++;
  presentHistoryCases++;
}
for(const pair of [['3fs','2ms'],['3fd','2d']]){
  const forged=clone(frontedSnapshots[pair[0]]);
  const verb=forged.tokens.find(t=>t.tense==='present');
  verb.grammar.person=pair[1];
  if(verb.grammar.morphology)verb.grammar.morphology.person=pair[1];
  assert(api.restoreExerciseSnapshot(forged)===null,
    pair[0]+': a same-surface rewrite to '+pair[1]+' survived History restore');
  presentHistoryCases++;
  ambiguityCases++;
}
console.log('Phase-2b-A fronted-mubtada audit passed: '+frontedCases+' production/History checks and '+ambiguityCases+' ambiguity-authority checks.');

/* ===== Phase 2b-B — ungoverned present verbs built on sukūn for نون النسوة ================
   The whole verb is MABNĪ (Al-Tuḥfah p. 73, applied p. 124) and therefore has no state, no
   iʿrāb sign, and NO maḥall in the bare case. The attached nūn is separately built on fatḥ in
   maḥall rafʿ as fāʿil. Conflating the two, or letting the muʿrab lane touch these forms, is
   the central risk this block exists to catch. */
let mabniCases=0,mabniAttackCases=0;
// Same normalization the Why audit uses; defined locally because that helper appears later.
const bareArMabni=s=>String(s).replace(/[ـً-ْٰ]/g,'').replace(/[أإآٱ]/g,'ا');
const MABNI_SURFACES={
  '3fp':{'كَتَبَ':'يَكْتُبْنَ','فَتَحَ':'يَفْتَحْنَ','دَرَسَ':'يَدْرُسْنَ'},
  '2fp':{'كَتَبَ':'تَكْتُبْنَ','فَتَحَ':'تَفْتَحْنَ','دَرَسَ':'تَدْرُسْنَ'}
};
// Exact code points: the final radical carries sukūn (0652) and the nūn carries fatḥ (064E).
// This is what separates يَكْتُبْنَ (niswah, built on sukūn) from يَكْتُبَنْ / يَكْتُبَنَّ (tawkīd,
// built on fatḥ), which share an unvowelized skeleton and are NOT in production.
for(const [person,forms] of Object.entries(MABNI_SURFACES)){
  for(const [lemma,surface] of Object.entries(forms)){
    const points=[...surface].map(c=>c.codePointAt(0));
    assert(points[0]===(person==='3fp'?0x64A:0x62A),`${surface}: wrong person prefix for ${person}`);
    assert(points[points.length-1]===0x064E&&points[points.length-2]===0x0646,`${surface}: must end in nūn + fatḥ`);
    assert(points[points.length-3]===0x0652,`${surface}: the radical before the nūn must carry sukūn`);
    const record=api.verbFormIndex.get(surface);
    assert(record&&record.form==='presentRaf'&&record.lexeme.past===lemma,`${surface}: not registered against ${lemma}`);
    assert([...record.morphology.presentPersonCandidates].join('|')===person,
      `${surface}: a fully vocalized niswah form must have exactly one reading (${person})`);
    mabniCases++;
  }
}
const mabniTemplates={};
for(const person of ['3fp','2fp']){
  const template=api.templates.find(t=>t.presentPerson===person);
  assert(template&&!template.frontedPresent,`${person}: no Phase-2b-B template`);
  assert(template.presentCapabilities.length===1,`${person}: template must declare exactly one capability`);
  const capability=template.presentCapabilities[0];
  assert(capability.person===person&&capability.subjectMode==='attached'&&capability.formClass==='mabniPresent'
    &&capability.endingClass==='nuun-niswah'&&capability.binaaClass==='sukun-nuun-niswah',
    `${person}: template capability is not the registered mabnī shape`);
  mabniTemplates[person]=template;
  mabniCases++;
}
const mabniGolden={};
for(const person of ['3fp','2fp']){
  const wanted=new Set(Object.values(MABNI_SURFACES[person]));
  for(let i=0;i<4000&&wanted.size;i++){
    const data=api.buildTemplate(mabniTemplates[person].id);
    const verb=data.tokens[0];
    if(!wanted.has(verb.word))continue;
    wanted.delete(verb.word);
    mabniGolden[verb.word]={data:clone(data),person};
    const morphology=verb.grammar.morphology;
    const bare=bareArMabni(verb.ar);
    assert(api.validateExercise(data).length===0,`${verb.word}: clean exercise failed validation`);
    // Whole word: bināʾ only.
    assert(bare.includes('فعل مضارع مبني على السكون لاتصاله بنون النسوة'),`${verb.word}: wrong whole-word bināʾ wording`);
    for(const forbidden of ['مرفوع','منصوب','مجزوم','وعلامة','في محل']){
      assert(!bare.includes(forbidden),`${verb.word}: whole-word analysis claims «${forbidden}»`);
    }
    assert(!/raised|accusative|jussive|indicative|subjunctive/i.test(verb.en),`${verb.word}: English describes a case/mood`);
    assert(/built on suk/i.test(verb.en),`${verb.word}: English omits the bināʾ`);
    // No muʿrab machinery whatsoever.
    assert(verb.inflection===api.MABNI_NUUN_NISWAH,`${verb.word}: wrong inflection lane`);
    assert(!verb.state&&verb.sign===null,`${verb.word}: carries an iʿrāb state or sign`);
    assert(verb.ruleId==='R_PRESENT_NUUN_NISWAH_BINAA',`${verb.word}: wrong whole-word rule`);
    assert(!verb.governorId,`${verb.word}: Phase 2b-B is ungoverned only`);
    assert(verb.subjectRuleId===undefined,`${verb.word}: a hidden-subject rule was bound to an attached-subject verb`);
    assert(morphology.person===person&&morphology.subjectMode==='attached'&&morphology.formClass==='mabniPresent'
      &&morphology.endingClass==='nuun-niswah'&&morphology.binaaClass==='sukun-nuun-niswah',
      `${verb.word}: stored morphology is not the registered mabnī shape`);
    // The nūn: exactly one, canonical, and the fāʿil.
    assert(verb.components.length===1&&verb.components[0].kind==='nuun-niswah',`${verb.word}: wrong component set`);
    const nuun=verb.components[0];
    assert(nuun.letterAr==='نَ'&&nuun.syntacticRole==='fail'&&nuun.mahall==='raf'&&nuun.binaaSign==='fatha'
      &&nuun.ruleId==='C_NUUN_NISWAH'&&nuun.category==='pronoun',`${verb.word}: nūn component is not canonical`);
    assert(bareArMabni(nuun.ar).includes('ضمير متصل مبني على الفتح في محل رفع فاعل'),`${verb.word}: nūn component wording changed`);
    // Subject: the attached nūn, never an explicit or hidden one.
    const subject=data.relationships.find(r=>r.type==='verbSubject'&&r.verbId===verb.id);
    assert(subject&&subject.subjectType==='attached'&&subject.pronoun==='نُونُ النِّسْوَةِ',`${verb.word}: wrong subject relationship`);
    assert(!data.tokens.some(t=>t.grammar.role==='faail'),`${verb.word}: an explicit fāʿil appeared`);
    assert(!/مستتر/.test(verb.ar),`${verb.word}: a hidden-subject clause appeared`);
    for(const pronoun of ['هُوَ','هِيَ','أَنَا','نَحْنُ','أَنْتَ']){
      assert(!verb.ar.includes(pronoun),`${verb.word}: emitted the hidden pronoun ${pronoun}`);
    }
    // Object still present and correct; English names the person unambiguously.
    const object=data.tokens.find(t=>t.grammar.role==='object');
    assert(object&&object.state==='nasb'&&object.sign.id==='fatha',`${verb.word}: object is not the accusative target`);
    assert(person==='3fp'?/^They \(women\)/.test(data.translation):/^You women/.test(data.translation),
      `${verb.word}: English does not distinguish ${person}`);
    mabniCases++;
  }
  assert(!wanted.size,`${person}: not every registered surface was produced (${[...wanted].join(',')})`);
}
assert(Object.keys(mabniGolden).length===6,'Phase 2b-B did not produce all six surfaces');
/* Internal coverage records the bināʾ, and the learner-facing filters must NOT: `builtOnSukun`
   is a bināʾ label, not an iʿrāb state, so it may never appear as a state or sign the user can
   select, and no mabnī template may advertise one. */
assert(api.GRAMMAR_COVERAGE_MATRIX.verb.mabniPresent?.join(',')==='builtOnSukun',
  'The coverage matrix does not record the mabnī present verb');
assert(!api.GRAMMAR_COVERAGE_MATRIX.verb.mabniPresent.some(entry=>['raf','nasb','jazm'].includes(entry)),
  'The mabnī present verb was recorded on the iʿrāb state axis');
for(const person of ['3fp','2fp']){
  const template=api.templates.find(t=>t.presentPerson===person);
  assert(template.state==='nasb'&&template.sign==='fatha',
    `${person}: the template's declared state/sign must describe its accusative object target, not the verb`);
  const target=api.buildTemplate(template.id).tokens.find(t=>t.target===true);
  assert(target&&target.grammar.type==='noun'&&target.grammar.role==='object',
    `${person}: the learner target must remain the direct object`);
}
mabniCases+=4;
// Source authority: one narrow whole-word rule, plus the widened component rule.
const binaaRule=api.SOURCE_REGISTRY.R_PRESENT_NUUN_NISWAH_BINAA;
assert(binaaRule&&binaaRule.productionEnabled&&binaaRule.basis==='nahw-rule','R_PRESENT_NUUN_NISWAH_BINAA is missing or disabled');
assert(binaaRule.primarySource.authorityId==='TUHFA_QATAR_WORKSPACE'
  &&[...binaaRule.primarySource.pdfPages].sort((a,b)=>a-b).join(',')==='73,124',
  'R_PRESENT_NUUN_NISWAH_BINAA is not bound to Al-Tuḥfah pp. 73 and 124');
assert(api.isSourceAuthorized('R_PRESENT_NUUN_NISWAH_BINAA'),'R_PRESENT_NUUN_NISWAH_BINAA is not authorized');
assert(/no raf|authorizes the bina/i.test(binaaRule.conditions)||/maḥall/.test(binaaRule.conditions),
  'The bināʾ rule does not exclude a maḥall claim in its conditions');
const nuunComponentRule=api.SOURCE_REGISTRY.C_NUUN_NISWAH;
assert([...nuunComponentRule.primarySource.pdfPages].sort((a,b)=>a-b).join(',')==='72,124',
  'C_NUUN_NISWAH was not widened to the present with Al-Tuḥfah p. 124');
assert(/present/i.test(nuunComponentRule.conditions),'C_NUUN_NISWAH conditions do not mention the present');
assert(Object.values(api.SOURCE_REGISTRY).filter(r=>/nūn al-niswah is a connected pronoun/i.test(r.topic||'')).length===1,
  'The nūn-al-niswah component rule was duplicated instead of widened');
mabniCases+=5;
// Source attacks.
const binaaAttacks=[
  ['wrong authority',{...binaaRule,primarySource:{...binaaRule.primarySource,authorityId:'DAKUR_APPLIED_GRAMMAR_2E'}}],
  ['wrong page',{...binaaRule,primarySource:{...binaaRule.primarySource,pdfPages:[42]}}],
  ['no pages',{...binaaRule,primarySource:{...binaaRule.primarySource,pdfPages:[]}}],
  ['disabled',{...binaaRule,productionEnabled:false}],
  ['arbitrary metadata',{topic:'A present verb attached to nūn al-niswah is built on sukūn.',status:binaaRule.status,
    productionEnabled:true,basis:'nahw-rule',primarySource:{authorityId:'TUHFA_QATAR_WORKSPACE',pdfPages:[73,124],evidenceType:'rule-support'},
    secondarySources:[],conditions:'x',exceptions:'y'}]
];
for(const [name,candidate] of binaaAttacks){
  assert(!api.isSourceRecordAuthorized('R_PRESENT_NUUN_NISWAH_BINAA',candidate),
    `Forged bināʾ source accepted: ${name}`);
  mabniAttackCases++;
}
assert(!api.isSourceRecordAuthorized('C_NUUN_NISWAH',binaaRule),'The whole-word rule was accepted as the component rule');
assert(!api.isSourceRecordAuthorized('R_PRESENT_NUUN_NISWAH_BINAA',nuunComponentRule),'The component rule was accepted as the whole-word rule');
assert(!api.isSourceAuthorized('R_PRESENT_NUUN_TAWKID_BINAA'),'An unregistered nūn-al-tawkīd rule reported as authorized');
mabniAttackCases+=3;
// Morphology, component, and lane attacks — every one must reject, none may throw.
function mabniAttack(name,surface,mutate){
  const base=clone(mabniGolden[surface].data);
  mutate(base,base.tokens[0]);
  let codes=[];
  assert((()=>{try{codes=api.validateExercise(base).map(e=>e.code);return true}catch(e){return false}})(),
    `${name}: validateExercise threw instead of rejecting`);
  assert(codes.length>0,`${name}: forged mabnī exercise was accepted`);
  mabniAttackCases++;
}
mabniAttack('3fp surface claimed as 2fp','يَكْتُبْنَ',(d,v)=>{v.grammar.person='2fp';v.grammar.morphology.person='2fp';});
mabniAttack('2fp surface claimed as 3fp','تَكْتُبْنَ',(d,v)=>{v.grammar.person='3fp';v.grammar.morphology.person='3fp';});
mabniAttack('ordinary formClass','يَكْتُبْنَ',(d,v)=>{v.grammar.morphology.formClass='ordinary';});
mabniAttack('afalKhamsa formClass','يَكْتُبْنَ',(d,v)=>{v.grammar.morphology.formClass='afalKhamsa';});
mabniAttack('wrong endingClass','يَكْتُبْنَ',(d,v)=>{v.grammar.morphology.endingClass='waw-jamaaah';});
mabniAttack('blank binaaClass','يَكْتُبْنَ',(d,v)=>{v.grammar.morphology.binaaClass='';});
mabniAttack('wrong binaaClass','يَكْتُبْنَ',(d,v)=>{v.grammar.morphology.binaaClass='visible-fath';});
mabniAttack('regular inflection','يَكْتُبْنَ',(d,v)=>{v.inflection='regular';});
mabniAttack('afalKhamsa inflection','يَكْتُبْنَ',(d,v)=>{v.inflection='afalKhamsa';});
for(const state of ['raf','nasb','jazm']){
  mabniAttack(`state ${state}`,'يَكْتُبْنَ',(d,v)=>{v.state=state;});
}
for(const sign of ['damma','fatha','sukun','nunKept','nunDropped']){
  mabniAttack(`sign ${sign}`,'يَكْتُبْنَ',(d,v)=>{v.sign={id:sign,ar:'x',en:'x'};});
}
mabniAttack('ordinary present rule','يَكْتُبْنَ',(d,v)=>{v.ruleId='R_MUDARI_RAF_DAMMA';});
mabniAttack('five-verb rule','يَكْتُبْنَ',(d,v)=>{v.ruleId='R_AFAL5_RAF_NUN';});
mabniAttack('jazm sukūn rule','يَكْتُبْنَ',(d,v)=>{v.ruleId='R_MUDARI_JAZM_SUKUN';});
mabniAttack('missing nūn component','يَكْتُبْنَ',(d,v)=>{v.components=[];});
mabniAttack('duplicate nūn component','يَكْتُبْنَ',(d,v)=>{v.components=[v.components[0],clone(v.components[0])];});
mabniAttack('wrong component role','يَكْتُبْنَ',(d,v)=>{v.components[0].syntacticRole='object';});
mabniAttack('wrong component maḥall','يَكْتُبْنَ',(d,v)=>{v.components[0].mahall='nasb';});
mabniAttack('wrong component bināʾ','يَكْتُبْنَ',(d,v)=>{v.components[0].binaaSign='sukun';});
mabniAttack('wrong component rule','يَكْتُبْنَ',(d,v)=>{v.components[0].ruleId='C_WAW_JAMAAH_FAIL';});
// Ownership is structural: the nūn must sit on the verb that carries it, and nowhere else.
mabniAttack('nūn component copied onto the object','يَكْتُبْنَ',(d,v)=>{
  d.tokens.find(t=>t.grammar.role==='object').components=[clone(v.components[0])];
});
mabniAttack('nūn component moved off the verb','يَكْتُبْنَ',(d,v)=>{
  d.tokens.find(t=>t.grammar.role==='object').components=[clone(v.components[0])];
  v.components=[];
});
mabniAttack('hidden-subject clause','يَكْتُبْنَ',(d,v)=>{
  v.relations.subjectType='implicit';v.relations.subjectPronoun='هُنَّ';
  const rel=d.relationships.find(r=>r.type==='verbSubject');if(rel){rel.subjectType='implicit';rel.pronoun='هُنَّ';}
});
mabniAttack('concealment rule bound','يَكْتُبْنَ',(d,v)=>{v.subjectRuleId='R_HIDDEN_SUBJECT_JAWAZ_3S';});
mabniAttack('2fp template substitution','يَكْتُبْنَ',d=>{d.templateId=mabniTemplates['2fp'].stableId;});
mabniAttack('fronted 3fs template substitution','يَكْتُبْنَ',d=>{d.templateId=api.templates.find(t=>t.presentPerson==='3fs').stableId;});
/* Phase 2b-C boundary. A governed niswah form («لن يكتبن» → «في محل نصب») is real grammar and
   is source-verified at Al-Tuḥfah p. 42, but its maḥall architecture is NOT in this phase, so
   every route to a governed form must reject — including a dangling governorId, which cannot
   arise from the builder and can only be forged. */
mabniAttack('dangling governor link','يَكْتُبْنَ',(d,v)=>{v.governorId='NO_SUCH_TOKEN';});
for(const [particle,type,rule] of [['لَنْ','lan','G_LAN_NASB'],['لَمْ','lam','G_LAM_JAZM']]){
  mabniAttack(`governed by ${particle}`,'يَكْتُبْنَ',(d,v)=>{
    const governor=clone(v);
    governor.id='T_GOV';governor.word=particle;governor.surfaceHint=particle;governor.expectedSurface=particle;
    governor.grammar={type:'particle',role:'particle',particleType:type};
    governor.components=[];governor.relations={governsId:v.id};governor.ruleId=rule;
    governor.state='';governor.sign=null;
    d.tokens.unshift(governor);
    v.governorId='T_GOV';
    d.sentence=`${particle} ${d.sentence}`;
  });
}

// --- History: schema v3, canonical reconstruction, and same-surface person attacks --------
const mabniSnapshots={};
for(const surface of Object.keys(mabniGolden)){
  const data=mabniGolden[surface].data;
  const snapshot=api.createExerciseSnapshot(data);
  mabniSnapshots[surface]=snapshot;
  assert(snapshot.schemaVersion===3,`${surface}: mabnī snapshot is not schema v3`);
  assert(api.restoreExerciseSnapshot(clone(snapshot)),`${surface}: a clean mabnī snapshot failed to restore`);
  // Corrupt every presentation layer, then require canonical reconstruction.
  const corrupt=clone(snapshot);
  corrupt.translation='CORRUPT';
  corrupt.tokens.forEach(t=>{
    t.gloss='CORRUPT';t.enHint='CORRUPT';t.ar='CORRUPT';t.en='CORRUPT';
    if(t.why){t.why.ar=['CORRUPT'];t.why.en=['CORRUPT'];t.why.ids=['CORRUPT'];}
    (t.components||[]).forEach(c=>{c.ar='CORRUPT';c.en='CORRUPT';});
  });
  (corrupt.relationships||[]).forEach(r=>{r.ar='CORRUPT';r.en='CORRUPT';});
  const repaired=api.restoreExerciseSnapshot(corrupt);
  assert(repaired,`${surface}: a corrupted mabnī snapshot did not restore`);
  assert(repaired.translation===data.translation,`${surface}: translation was not canonically rebuilt`);
  assert(repaired.tokens.every((t,i)=>t.gloss===data.tokens[i].gloss),`${surface}: glosses were not canonically rebuilt`);
  const verb=repaired.tokens.find(t=>t.grammar.type==='verb');
  assert(verb.ar===data.tokens[0].ar,`${surface}: whole-word analysis was not canonically rebuilt`);
  assert(!bareArMabni(verb.ar).includes('في محل'),`${surface}: canonical rebuild produced a maḥall for the bare verb`);
  assert(verb.inflection===api.MABNI_NUUN_NISWAH&&!verb.state&&verb.sign===null,
    `${surface}: restore reintroduced muʿrab state/sign`);
  assert(verb.components.length===1&&verb.components[0].ruleId==='C_NUUN_NISWAH'
    &&bareArMabni(verb.components[0].ar).includes('في محل رفع فاعل'),
    `${surface}: nūn component was not canonically rebuilt`);
  mabniCases+=3;
  presentHistoryCases+=2;
}
// The two persons share no surface, but a coordinated rewrite that swaps person while keeping
// the original identity must still be rejected.
for(const [from,to] of [['يَكْتُبْنَ','2fp'],['تَكْتُبْنَ','3fp']]){
  const forged=clone(mabniSnapshots[from]);
  const verb=forged.tokens.find(t=>t.grammar.type==='verb');
  verb.grammar.person=to;
  if(verb.grammar.morphology)verb.grammar.morphology.person=to;
  assert(api.restoreExerciseSnapshot(forged)===null,`${from}: a same-surface rewrite to ${to} survived History restore`);
  mabniAttackCases++;
  presentHistoryCases++;
}
for(const [from,to] of [['يَكْتُبْنَ','تَكْتُبْنَ'],['تَكْتُبْنَ','يَكْتُبْنَ']]){
  const coordinated=clone(mabniSnapshots[to]);
  coordinated.exerciseIdentity=mabniSnapshots[from].exerciseIdentity;
  assert(api.restoreExerciseSnapshot(coordinated)===null,
    `${from}: History identity accepted a complete coordinated rewrite to ${to}`);
  mabniAttackCases++;
  presentHistoryCases++;
}
// Forged binaaClass and formClass must not survive: they are what distinguishes a legitimately
// signless mabnī verb from a sign-stripped muʿrab one in the identity tuple.
for(const field of ['formClass','binaaClass','endingClass']){
  const forged=clone(mabniSnapshots['يَكْتُبْنَ']);
  const verb=forged.tokens.find(t=>t.grammar.type==='verb');
  verb.grammar.morphology[field]='';
  assert(api.restoreExerciseSnapshot(forged)===null,`يَكْتُبْنَ: a blanked ${field} survived History restore`);
  mabniAttackCases++;
}
console.log('Phase-2b-B nun-al-niswah audit passed: '+mabniCases+' production checks and '+mabniAttackCases+' adversarial checks.');
assert(api.COMPONENT_REGISTRY['yaa-mukhataba']?.ruleId==='C_YAA_MUKHATABA'
  &&api.SOURCE_REGISTRY.C_YAA_MUKHATABA.primarySource.pdfPages.includes(38),
  'Canonical yāʾ al-mukhāṭabah component/source evidence is missing');

console.log(`Phase-2 present-raf audit passed: ${presentVerbCases} positive checks, ${presentAdversarialCases} adversarial checks, ${presentHistoryCases} History checks, ${presentPresentationRepairCases} canonical presentation checks, ${d2RoundTripCases} deterministic D-2 round-trips, and ${phase2PersonPresentationRepairCases} new-template person-presentation repairs.`);
console.log(`Legacy Phase-1 schema-v3 audit passed: ${legacyV3PositiveCases} positive restores, ${legacyV3AdversarialCases} identity attacks, ${legacyV3RepersistenceCases} current-v3 repersistence checks, ${phase2CoordinatedHistoryCases} current coordinated attacks, and ${phase2DowngradeAttackCases} downgrade attacks.`);

function runEveryTemplate(repetitions){
  for(const template of api.templates){
    for(let iteration=0;iteration<repetitions;iteration++){
      const data=api.buildTemplate(template.id);
      assertNominalPair(data,`template ${template.id} ${template.starts}/${template.form}/${template.state}/${template.sign} run ${iteration}`);
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
    assert(!data.tokens[0].phraseAr,'Generated market/teacher case appended the phrase to the preposition');
    assert(data.tokens[1].phraseAr.includes('«فِي السُّوقِ»: جَارٌّ وَمَجْرُورٌ'),
      'Generated market/teacher case omitted the complete phrase');
    assert(data.tokens[1].phraseAr.includes('مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ مُقَدَّمٍ'),
      'Generated market/teacher case omitted the fronted khabar');
    assert(data.tokens[2].ar.includes('مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ'),
      'Generated market/teacher case omitted the delayed mubtada');
  }
}
assert(generatedMarketTeacher,'The exact market/teacher sentence was not reached through the real template');

const starts=optionValues.startFilter;
const forms=optionValues.formFilter;
const statesOpt=optionValues.stateFilter;
const signs=optionValues.signFilter;
function isDisabled(id,value){
  return elements[id].options.find(option=>option.value===value).disabled;
}
for(const start of starts){
  for(const form of forms){
    for(const state of statesOpt){
      for(const sign of signs){
        const pool=api.poolFor(start,form,state,sign);
        if(!pool.length)continue;
        stats.filterStates++;
        elements.startFilter.value=start;
        elements.formFilter.value=form;
        elements.stateFilter.value=state;
        elements.signFilter.value=sign;
        elements.signFilter.dispatch('change');
        assert(elements.startFilter.value===start&&elements.formFilter.value===form&&elements.stateFilter.value===state&&elements.signFilter.value===sign,
          `Valid filters were reset: ${start}/${form}/${state}/${sign}`);
        assert(elements.sentence.textContent,`No rendered sentence for ${start}/${form}/${state}/${sign}`);
        assert((elements.answers.innerHTML.match(/class="word-card/g)||[]).length>=2,
          `Incomplete rendered analysis for ${start}/${form}/${state}/${sign}`);
        for(const candidate of starts){
          assert(isDisabled('startFilter',candidate)===(api.poolFor(candidate,form,state,sign).length===0),
            `Wrong start availability for ${start}/${form}/${state}/${sign} -> ${candidate}`);
        }
        for(const candidate of forms){
          assert(isDisabled('formFilter',candidate)===(api.poolFor(start,candidate,state,sign).length===0),
            `Wrong form availability for ${start}/${form}/${state}/${sign} -> ${candidate}`);
        }
        for(const candidate of statesOpt){
          assert(isDisabled('stateFilter',candidate)===(api.poolFor(start,form,candidate,sign).length===0),
            `Wrong state availability for ${start}/${form}/${state}/${sign} -> ${candidate}`);
        }
        for(const candidate of signs){
          assert(isDisabled('signFilter',candidate)===(api.poolFor(start,form,state,candidate).length===0),
            `Wrong sign availability for ${start}/${form}/${state}/${sign} -> ${candidate}`);
        }
      }
    }
  }
}

elements.clearHistoryBtn.dispatch('click');
elements.startFilter.value='particle';
elements.formFilter.value='fiveNouns';
elements.stateFilter.value='nasb';
elements.signFilter.value='alif';
elements.newBtn.dispatch('click');
assert(elements.startFilter.value==='any','Reset Filters did not restore Any beginning');
assert(elements.formFilter.value==='any','Reset Filters did not restore All forms');
assert(elements.stateFilter.value==='any','Reset Filters did not restore All states');
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
elements.stateFilter.value='any';
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
  // The mubtadaʾ/khabar balance below measures the GRAMMAR ANALYSIS, not the “Why?” prose,
  // so strip the explanation lines first. (Same assertion, scoped to its original subject.)
  const analysisOnly=rendered.replace(/<p class="why-line[^"]*"[^>]*>[\s\S]*?<\/p>/g,'');
  const first=sentence.split(/\s+/)[0];
  if(randomSentences[randomSentences.length-1]===sentence)consecutiveRepeats++;
  randomSentences.push(sentence);
  openingWords.add(first);
  if(particleWords.has(first))openingParticles.add(first);
  assert((rendered.match(/class="word-card target/g)||[]).length===1,`Random run ${iteration}: wrong focus-card count`);
  const renderedMubtada=(analysisOnly.match(/مُبْتَدَأٌ/gu)||[]).length;
  const renderedKhabar=(analysisOnly.match(/خَبَر[ٌٍ](?=$|[\s،.<])/gu)||[]).length;
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
assert(additionalRecords.length===196,`Expected 196 additional verb records, found ${additionalRecords.length}`);
const pastCoverageTemplate=api.templates.find(template=>template.stableId==='T_VERB_SINGULAR_RAF_DAMMA_01');
const presentCoverageTemplate=api.templates.find(template=>template.stableId==='T_NOUN_SINGULAR_NASB_FATHA_01');
assert(pastCoverageTemplate?.starts==='verb'&&pastCoverageTemplate.form==='singular'
  &&pastCoverageTemplate.state==='raf'&&pastCoverageTemplate.sign==='damma',
  'Canonical additional-verb past coverage template is missing or changed');
assert(presentCoverageTemplate?.starts==='noun'&&presentCoverageTemplate.form==='singular'
  &&presentCoverageTemplate.state==='nasb'&&presentCoverageTemplate.sign==='fatha',
  'Canonical additional-verb present coverage template is missing or changed');
function buildWithGeneralVerbIndex(template,index){
  const originalCrypto=context.crypto;
  api.vocabularyHistory.delete('general-verbs');
  context.crypto={getRandomValues(values){values[0]=index;return values}};
  try{return api.buildTemplate(template.id)}
  finally{
    context.crypto=originalCrypto;
    api.vocabularyHistory.delete('general-verbs');
  }
}
let additionalPastSeen=0;
let additionalPresentSeen=0;
for(const record of additionalRecords){
  const matchingIndexes=[];
  api.verbLexicons.generalVerbActions.forEach((lexeme,index)=>{
    if(lexeme.past===record.past&&lexeme.pres===record.pres)matchingIndexes.push(index);
  });
  assert(matchingIndexes.length===1,
    `${record.past}/${record.pres}: expected one canonical general-verb lexeme, found ${matchingIndexes.length}`);
  const index=matchingIndexes[0];
  const pastExercise=buildWithGeneralVerbIndex(pastCoverageTemplate,index);
  const pastVerb=pastExercise.tokens.find(token=>token.tense==='past');
  assert(pastVerb?.word===record.past,
    `${record.past}: canonical past template did not produce the selected lexeme`);
  assert(api.validateExercise(pastExercise).length===0,
    `${record.past}: canonical past coverage exercise did not validate`);
  additionalPastSeen++;
  const presentExercise=buildWithGeneralVerbIndex(presentCoverageTemplate,index);
  const presentVerb=presentExercise.tokens.find(token=>token.tense==='present');
  assert(presentVerb?.word===record.pres,
    `${record.pres}: canonical present template did not produce the selected lexeme`);
  assert(presentExercise.relationships.some(relationship=>
    relationship.type==='mubtadaKhabar'&&relationship.khabarKind==='verbalSentence'),
    `${record.pres}: canonical present coverage exercise lost its verbal-sentence khabar`);
  assert(api.validateExercise(presentExercise).length===0,
    `${record.pres}: canonical present coverage exercise did not validate`);
  additionalPresentSeen++;
}
assert(additionalPastSeen===196,`Only ${additionalPastSeen} of 196 added past verbs appeared`);
assert(additionalPresentSeen===196,`Only ${additionalPresentSeen} of 196 added present verbs appeared`);

const nounArrayNames=['singularPeople','singularThings','places','brokenHuman','brokenThings','duals','smp','sfp',
  'feminineHumanSingulars','feminineHumanDuals','fiveNouns'];
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
assert(nounEntries===308,`Expected 308 noun entries, found ${nounEntries}`);
assert(totalVerbFamilies===239,`Expected 239 verb families, found ${totalVerbFamilies}`);
// The learner-facing footer must advertise the real, current totals in both English and Arabic-Indic
// digits, so a future vocabulary change cannot update the engine counts while leaving the UI stale.
const toArabicDigits=n=>String(n).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[+d]);
const footerHtml=(html.match(/<div class="footer">([\s\S]*?)<\/div>/)||[])[1];
assert(footerHtml,'The learner-facing footer div was not found');
const footerEn=(footerHtml.match(/<span class="en-only">([\s\S]*?)<\/span>/)||[])[1]||'';
const footerAr=(footerHtml.match(/<span class="ar-only"[^>]*>([\s\S]*?)<\/span>/)||[])[1]||'';
assert(footerEn.includes(`${totalVerbFamilies} verb families and ${nounEntries} noun entries`),
  `Footer (English) must state “${totalVerbFamilies} verb families and ${nounEntries} noun entries”`);
assert(footerAr.includes(toArabicDigits(totalVerbFamilies))&&footerAr.includes(toArabicDigits(nounEntries)),
  `Footer (Arabic) ar-only span must state ${toArabicDigits(totalVerbFamilies)} and ${toArabicDigits(nounEntries)}`);

// --- Vocabulary-expansion lexical audit (added with the 2026-07 vocabulary expansion) ---
const addedNounEntries=[
  ...api.nounLexicons.singularPeople.slice(-10),
  ...api.nounLexicons.singularThings.slice(-20),
  ...api.nounLexicons.places.slice(-10)
];
assert(addedNounEntries.length===40,`Expected 40 newly added noun entries, found ${addedNounEntries.length}`);
const addedNomSurfaces=addedNounEntries.map(n=>n.nom);
assert(new Set(addedNomSurfaces).size===addedNomSurfaces.length,'Two newly added nouns share the same Arabic nominative surface');
const preExpansionNoms=new Set(fs.readFileSync('work/index-pre-vocab-expansion-backup.html','utf8').match(/nom:'([^']+)'/g).map(m=>m.slice(5,-1)));
for(const noun of addedNounEntries){
  assert(!preExpansionNoms.has(noun.nom),`${noun.en}: newly added noun “${noun.nom}” already existed before the vocabulary expansion`);
}
for(const noun of addedNounEntries){
  assert(noun.nom.endsWith('ُ')||/[ٌّ]$/u.test(noun.nom),`${noun.en}: added noun nominative has an unsupported ending`);
  assert(noun.acc.endsWith('َ')||/[ًّ]$/u.test(noun.acc),`${noun.en}: added noun accusative has an unsupported ending`);
  assert(noun.gen.endsWith('ِ')||/[ٍّ]$/u.test(noun.gen),`${noun.en}: added noun genitive has an unsupported ending`);
  assert(!/[ىأإ]$/u.test(noun.nom.replace(/[ً-ْ]/gu,'')),`${noun.en}: added noun looks defective (منقوص/مقصور), an unsupported morphology`);
}
const addedAdjectives=api.nounLexicons.singularPredicates.slice(-10);
assert(addedAdjectives.length===10,`Expected 10 newly added adjectives, found ${addedAdjectives.length}`);
const allAdjectiveSurfaces=api.nounLexicons.singularPredicates.flatMap(a=>[a.nom,a.acc]);
assert(new Set(allAdjectiveSurfaces).size===allAdjectiveSurfaces.length,'A duplicate Arabic adjective surface form exists');
const allAdjectiveMeanings=api.nounLexicons.singularPredicates.map(a=>a.en.toLowerCase());
assert(new Set(allAdjectiveMeanings).size===allAdjectiveMeanings.length,'Two adjectives share the same English gloss');
const addedVerbRecords=additionalRecords.slice(-19);
assert(addedVerbRecords.length===19,`Expected 19 newly added verb families, found ${addedVerbRecords.length}`);
const addedVerbLexemes=api.verbLexicons.additionalVerbActions.slice(-19);
for(const verb of addedVerbLexemes){
  const group=api.objectGroups[verb.group];
  assert(Array.isArray(group)&&group.length>0,`${verb.past}: object group “${verb.group}” referenced by a newly added verb is missing or empty`);
  assert(group.every(noun=>noun&&noun.acc&&noun.en),`${verb.past}: object group “${verb.group}” contains a malformed noun entry`);
}
assert(new Set(addedVerbLexemes.map(v=>v.past)).size===19,'Newly added verbs contain a duplicate past-tense form');
assert(new Set(addedVerbLexemes.map(v=>v.pres)).size===19,'Newly added verbs contain a duplicate present-tense form');
const newObjectGroupNames=['sewable','hangable','knockable','greasable','dryable','grindable','peelable','weavable','squeezable','illuminable','trimmable','weldable','meltable','sprayable','stirrable','drillable'];
for(const name of newObjectGroupNames){
  assert(Array.isArray(api.objectGroups[name])&&api.objectGroups[name].length>0,`New object group “${name}” is empty or missing`);
  assert(api.objectGroups[name].every(noun=>api.nounLexicons.singularThings.includes(noun)),`New object group “${name}” references a noun outside singularThings`);
}
// Reachability: every added noun's nominative surface must be producible by pickPerson/pickPlace or an object group.
const reachableNounSurfaces=new Set([
  ...api.nounLexicons.singularPeople.map(n=>n.nom),
  ...api.nounLexicons.places.map(n=>n.nom),
  ...Object.values(api.objectGroups).flat().map(n=>n.nom),
  ...api.nounLexicons.singularThings.map(n=>n.nom) // singularThings is itself the source pool for objectGroups/general
]);
for(const noun of addedNounEntries){
  assert(reachableNounSurfaces.has(noun.nom),`${noun.en}: newly added noun is not reachable through any generation pool`);
}
console.log(`Vocabulary-expansion lexical audit passed: ${addedNounEntries.length} nouns, ${addedAdjectives.length} adjectives, ${addedVerbLexemes.length} verb families checked.`);

// --- Book-vocabulary expansion audit (2026-07-24) -----------------------------------
// Validates every lexical item added on top of the f0305bc production baseline by
// diffing the live lexicon against work/index-pre-book-vocab-expansion-backup.html.
// Every candidate must be a fully declinable sound word that slots into an existing
// engine class; nothing here expands the engine to fit a word.
const bookBaseline=fs.readFileSync('work/index-pre-book-vocab-expansion-backup.html','utf8');
const bookBaselineNoms=new Set(bookBaseline.match(/nom:'([^']+)'/g).map(m=>m.slice(5,-1)));
const bookBaselinePasts=new Set([...bookBaseline.matchAll(/past:'([^']+)'/g)].map(m=>m[1]));
const bookAddedPeople=api.nounLexicons.singularPeople.filter(n=>!bookBaselineNoms.has(n.nom));
const bookAddedThings=api.nounLexicons.singularThings.filter(n=>!bookBaselineNoms.has(n.nom));
const bookAddedPlaces=api.nounLexicons.places.filter(n=>!bookBaselineNoms.has(n.nom));
const bookAddedAdjectives=api.nounLexicons.singularPredicates.filter(a=>!bookBaselineNoms.has(a.nom));
const bookAddedVerbs=api.verbLexicons.additionalVerbActions.filter(v=>!bookBaselinePasts.has(v.past));
assert(bookAddedPeople.length===8,`Expected 8 added book people, found ${bookAddedPeople.length}`);
assert(bookAddedThings.length===50,`Expected 50 added book/study nouns, found ${bookAddedThings.length}`);
assert(bookAddedPlaces.length===4,`Expected 4 added places, found ${bookAddedPlaces.length}`);
assert(bookAddedAdjectives.length===10,`Expected 10 added adjectives, found ${bookAddedAdjectives.length}`);
assert(bookAddedVerbs.length===20,`Expected 20 added verb families, found ${bookAddedVerbs.length}`);
const bookAddedNouns=[...bookAddedPeople,...bookAddedThings,...bookAddedPlaces];
// Morphology: sound triptote declension, no diptote/manqūṣ/maqṣūr, no accidental tanwīn on a definite noun.
for(const noun of bookAddedNouns){
  assert(noun.nom.endsWith('ُ')||/[ٌّ]$/u.test(noun.nom),`${noun.en}: added noun nominative has an unsupported ending`);
  assert(noun.acc.endsWith('َ')||/[ًّ]$/u.test(noun.acc),`${noun.en}: added noun accusative has an unsupported ending`);
  assert(noun.gen.endsWith('ِ')||/[ٍّ]$/u.test(noun.gen),`${noun.en}: added noun genitive has an unsupported ending`);
  assert(!/[ىأإ]$/u.test(noun.nom.replace(/[ً-ْ]/gu,'')),`${noun.en}: added noun looks defective (منقوص/مقصور), an unsupported morphology`);
  assert(noun.nom.startsWith('ال')&&!/[ًٌٍ]/u.test(`${noun.nom}${noun.acc}${noun.gen}`),`${noun.en}: definite noun carries tanwīn`);
}
// Global uniqueness of every added Arabic surface and English gloss across the main noun pools.
const bookMainNounKinds=['singularPeople','singularThings','places','brokenHuman','brokenThings','duals','smp','sfp','fiveNouns'];
const bookAllNouns=bookMainNounKinds.flatMap(name=>api.nounLexicons[name]);
for(const noun of bookAddedNouns){
  assert(bookAllNouns.filter(n=>n.nom===noun.nom).length===1,`${noun.en}: added noun surface “${noun.nom}” collides with an existing noun`);
  assert(bookAllNouns.filter(n=>n.en===noun.en).length===1,`${noun.en}: added noun gloss collides with an existing noun gloss`);
}
// Added adjectives: predicate shape {nom,acc}, unique surface and gloss.
for(const adj of bookAddedAdjectives){
  assert(adj.nom&&adj.acc,`${adj.en}: added adjective is missing a nominative or accusative form`);
  assert(api.nounLexicons.singularPredicates.filter(a=>a.nom===adj.nom).length===1,`${adj.en}: added adjective surface collides`);
  assert(api.nounLexicons.singularPredicates.filter(a=>a.en===adj.en).length===1,`${adj.en}: added adjective gloss collides`);
}
// Added verbs: only past+present 3ms are needed; the surface must carry visible signs and a real object group.
const bookAllPresent=new Set([...api.verbLexicons.verbs,...api.verbLexicons.additionalVerbActions,...api.verbLexicons.humanActions,...api.verbLexicons.humanPrepActions,...api.verbLexicons.thingActions,...api.verbLexicons.thingPrepActions,...api.verbLexicons.brokenObjectActions].map(v=>v.pres));
for(const verb of bookAddedVerbs){
  for(const field of ['past','pres','en','third','pastEn','group'])assert(verb[field],`${verb.past||verb.en}: added verb is missing ${field}`);
  assert(verb.past.endsWith('َ'),`${verb.past}: added past is not built on visible fatḥah`);
  assert(verb.pres.endsWith('ُ'),`${verb.past}: added present lacks the visible ḍammah (would need an estimated sign)`);
  const group=api.objectGroups[verb.group];
  assert(Array.isArray(group)&&group.length>0,`${verb.past}: object group “${verb.group}” is missing or empty`);
  assert(group.every(noun=>noun&&noun.acc&&noun.en),`${verb.past}: object group “${verb.group}” has a malformed member`);
}
assert(new Set(bookAddedVerbs.map(v=>v.past)).size===bookAddedVerbs.length,'Added book verbs contain a duplicate past form');
assert(new Set(bookAddedVerbs.map(v=>v.pres)).size===bookAddedVerbs.length,'Added book verbs contain a duplicate present form');
for(const verb of bookAddedVerbs){
  assert([...api.verbLexicons.verbs,...api.verbLexicons.additionalVerbActions,...api.verbLexicons.humanActions,...api.verbLexicons.humanPrepActions,...api.verbLexicons.thingActions,...api.verbLexicons.thingPrepActions,...api.verbLexicons.brokenObjectActions].filter(v=>v.pres===verb.pres).length===1,`${verb.past}: present form “${verb.pres}” duplicates an existing verb`);
}
// The curated singularThings-backed object groups introduced for the book verbs must be non-empty
// and drawn only from singularThings (enterablePlaces is a places-backed group, validated separately below).
const bookNewGroupNames=['explainable','dividable','includable','authoredText','reflectable','confirmable','derivable','extractable','addressable','citable','specifiable','noticeable','watchable','manufacturable','takeable'];
for(const name of bookNewGroupNames){
  assert(Array.isArray(api.objectGroups[name])&&api.objectGroups[name].length>0,`New object group “${name}” is empty or missing`);
  assert(api.objectGroups[name].every(noun=>api.nounLexicons.singularThings.includes(noun)),`New object group “${name}” references a noun outside singularThings`);
}
// enterablePlaces is drawn from the places lexicon (for دَخَلَ), so it is validated against places.
assert(Array.isArray(api.objectGroups.enterablePlaces)&&api.objectGroups.enterablePlaces.length>0,'New object group “enterablePlaces” is empty or missing');
assert(api.objectGroups.enterablePlaces.every(noun=>api.nounLexicons.places.includes(noun)),'New object group “enterablePlaces” references a place outside the places lexicon');
// Reachability: every added object-noun is producible as a person, a place, or a member of some object group.
const bookReachable=new Set([
  ...api.nounLexicons.singularPeople.map(n=>n.nom),
  ...api.nounLexicons.places.map(n=>n.nom),
  ...api.nounLexicons.singularThings.map(n=>n.nom),
  ...Object.values(api.objectGroups).flat().map(n=>n.nom)
]);
for(const noun of bookAddedNouns){
  assert(bookReachable.has(noun.nom),`${noun.en}: added noun is not reachable through any generation pool`);
}
// Every added thing must actually sit in at least one object group (general included) so a learner can meet it.
for(const thing of bookAddedThings){
  assert(Object.values(api.objectGroups).some(group=>group.includes(thing)),`${thing.en}: added thing is not wired into any object group`);
}
console.log(`Book-vocabulary expansion audit passed: ${bookAddedPeople.length} people, ${bookAddedThings.length} book/study nouns, ${bookAddedPlaces.length} places, ${bookAddedAdjectives.length} adjectives, ${bookAddedVerbs.length} verbs, and ${bookNewGroupNames.length+1} curated object groups verified against the f0305bc baseline.`);

// --- Book-verb semantic lock (2026-07-24 naturalness audit) -------------------------
// Each new verb is pinned to a reviewed object group and English gloss, and every group's
// exact membership is locked, so no future edit can broaden a group into unnatural or
// religiously misleading verb-object pairings. Enumerated pairings were reviewed by hand.
const bookVerbSpec={
  'بَيَّنَ':{group:'explainable',en:'clarify'},
  'وَضَّحَ':{group:'explainable',en:'make clear'},
  'قَسَّمَ':{group:'dividable',en:'divide'},
  'أَدْرَجَ':{group:'includable',en:'include'},
  'أَلَّفَ':{group:'authoredText',en:'author'},
  'تَدَبَّرَ':{group:'reflectable',en:'reflect on'},
  'أَكَّدَ':{group:'confirmable',en:'confirm'},
  'وَافَقَ':{group:'people',en:'agree with'},
  'خَالَفَ':{group:'people',en:'disagree with'},
  'اِسْتَنْبَطَ':{group:'derivable',en:'derive'},
  'اِسْتَخْرَجَ':{group:'extractable',en:'extract'},
  'تَنَاوَلَ':{group:'addressable',en:'address'},
  'أَوْرَدَ':{group:'citable',en:'cite'},
  'حَدَّدَ':{group:'specifiable',en:'specify'},
  'لَاحَظَ':{group:'noticeable',en:'notice'},
  'شَاهَدَ':{group:'watchable',en:'watch'},
  'دَخَلَ':{group:'enterablePlaces',en:'enter'},
  'غَادَرَ':{group:'places',en:'leave'},
  'أَخَذَ':{group:'takeable',en:'take'},
  'صَنَعَ':{group:'manufacturable',en:'make'}
};
// The stored lexicon orders a geminated letter's shadda before its vowel; normalize both sides
// to that order so Arabic keys compare reliably regardless of how the mark pair was typed.
const sf=s=>s.replace(/([ً-ِ])ّ/gu,(m,v)=>'ّ'+v);
const bookVerbSpecN={}; for(const [k,val] of Object.entries(bookVerbSpec))bookVerbSpecN[sf(k)]=val;
assert(Object.keys(bookVerbSpecN).length===20,'The semantic lock must cover exactly the 20 new verbs');
assert(new Set(bookAddedVerbs.map(v=>sf(v.past))).size===20&&bookAddedVerbs.every(v=>bookVerbSpecN[sf(v.past)]),
  'The 20 detected new verbs do not match the semantic-lock roster');
// شَمِلَ was rejected (unnatural with a human subject in this generator) and replaced by أَدْرَجَ.
assert(!api.verbLexicons.additionalVerbActions.some(v=>v.past==='شَمِلَ'),'شَمِلَ must not be present; it was replaced by أَدْرَجَ');
assert(api.verbLexicons.additionalVerbActions.some(v=>v.past==='أَدْرَجَ'&&v.group==='includable'),'أَدْرَجَ (include → includable) is missing');
for(const [pastN,spec] of Object.entries(bookVerbSpecN)){
  const rec=api.verbLexicons.additionalVerbActions.find(v=>sf(v.past)===pastN);
  assert(rec,`Semantic lock: new verb ${pastN} is missing`);
  assert(rec.group===spec.group,`Semantic lock: ${rec.past} must use group ${spec.group}, found ${rec.group}`);
  assert(rec.en===spec.en,`Semantic lock: ${rec.past} must gloss “${spec.en}”, found “${rec.en}”`);
}
// Lock the exact reviewed membership of every curated group (glosses, order-independent).
const bookGroupMembers={
  explainable:['the rule','the ruling','the issue','the matter','the difference','the reason','the cause','the condition','the sign','the definition','the intended meaning','the answer','the question','the topic','the statement','the evidence','the proof','the verse','the hadith'],
  dividable:['the book','the lesson','the text','the topic','the section','the number'],
  includable:['the example','the definition','the question','the answer','the section','the topic','the evidence','the rule','the report'],
  authoredText:['the book','the explanation','the introduction','the report','the story'],
  reflectable:['the Qurʾān','the verse','the sūrah','the hadith','the narration','the text','the intended meaning'],
  confirmable:['the ruling','the rule','the statement','the opinion','the evidence','the proof','the news','the report','the answer','the truth','the matter','the intended meaning'],
  derivable:['the ruling','the rule','the intended meaning','the answer','the cause'],
  extractable:['the ruling','the rule','the intended meaning','the evidence','the proof','the answer'],
  addressable:['the topic','the issue','the matter','the question','the rule','the ruling','the difference','the reason'],
  citable:['the evidence','the proof','the example','the statement','the narration','the hadith','the verse','the opinion'],
  specifiable:['the condition','the reason','the cause','the intended meaning','the ruling','the rule','the sign','the type','the number','the topic'],
  noticeable:['the difference','the sign','the reason','the matter','the type','the condition'],
  watchable:['the television','the program','the news'],
  manufacturable:['the tool','the machine','the chair','the table','the box','the garment','the rope'],
  takeable:['the book','the pen','the notebook','the bag','the phone','the computer','the key','the map','the picture','the letter','the newspaper','the car','the garment','the cup','the sheet of paper','the clock','the tool','the box','the bottle','the plate','the spoon','the knife','the rope','the cloth','the medicine','the ticket','the file','the report','the ball'],
  enterablePlaces:['the mosque','the house','the school','the market','the classroom','the library','the garden','the restaurant','the institute','the university','the office','the airport','the station','the farm','the workshop','the hotel','the clinic','the factory','the bank','the post office','the museum','the theater','the stadium','the laboratory','the bathroom','the bakery','the pharmacy','the camp','the prison','the palace','the country','the city','the village']
};
for(const [name,glosses] of Object.entries(bookGroupMembers)){
  const actual=api.objectGroups[name].map(n=>n.en).sort();
  const expected=[...glosses].sort();
  assert(actual.length===expected.length&&actual.every((g,i)=>g===expected[i]),
    `Semantic lock: group ${name} membership drifted → [${actual.join(', ')}]`);
}
// Forbidden pairings can never be generated (the object simply is not in the verb's group).
const forbidden={
  authoredText:['the Qurʾān','the hadith','the verse','the sūrah','the Sunnah'],
  derivable:['the Sunnah','the obligation'],
  dividable:['the Qurʾān','the hadith','the verse','the sūrah','the Sunnah'],
  watchable:['the newspaper','the picture'],
  reflectable:['the Sunnah']
};
for(const [name,bad] of Object.entries(forbidden)){
  const glosses=new Set(api.objectGroups[name].map(n=>n.en));
  for(const g of bad)assert(!glosses.has(g),`Forbidden pairing: “${g}” must never be an object of group ${name}`);
}
// Religious nouns may only be objects of an approved set of NEW verbs.
const approvedReligiousVerbs={
  'the Qurʾān':new Set(['تَدَبَّرَ']),
  'the hadith':new Set(['بَيَّنَ','وَضَّحَ','تَدَبَّرَ','أَوْرَدَ']),
  'the verse':new Set(['بَيَّنَ','وَضَّحَ','تَدَبَّرَ','أَوْرَدَ']),
  'the sūrah':new Set(['تَدَبَّرَ']),
  'the Sunnah':new Set([])
};
for(const k in approvedReligiousVerbs)approvedReligiousVerbs[k]=new Set([...approvedReligiousVerbs[k]].map(sf));
for(const [gloss,approved] of Object.entries(approvedReligiousVerbs)){
  for(const v of bookAddedVerbs){
    const takesIt=(api.objectGroups[v.group]||[]).some(n=>n.en===gloss);
    if(takesIt)assert(approved.has(sf(v.past)),`Religious safety: new verb ${v.past} (“${v.en}”) must not take “${gloss}”`);
  }
}
console.log(`Book-verb semantic lock passed: 20 verbs pinned to reviewed groups/glosses, ${Object.keys(bookGroupMembers).length} group memberships locked, forbidden and religious-safety pairings verified.`);

// ===================================================================================
// Iʿrāb-state-filter audit (added with the state filter). The word-level filters
// form/state/sign must all describe the SAME single focus token; state is taken from
// the token's real grammatical structure and is never inferred from the sign.
// ===================================================================================
function focusFormOf(tk){return tk.grammar&&tk.grammar.type==='verb'?(tk.inflection==='afalKhamsa'?'fiveVerbs':'present'):tk.inflection}
function setFilters(start,form,state,sign){
  elements.startFilter.value=start;elements.formFilter.value=form;
  elements.stateFilter.value=state;elements.signFilter.value=sign;
}
let stateFilterCases=0;

// --- Test A: the state filter offers exactly the five intended options, in order. ---
assert(JSON.stringify(optionValues.stateFilter)===JSON.stringify(['any','raf','nasb','jarr','jazm']),
  'stateFilter option set is not exactly any/raf/nasb/jarr/jazm');
const stateSelectBlock=html.match(/<select id="stateFilter">([\s\S]*?)<\/select>/);
assert(stateSelectBlock,'The stateFilter select is missing from the HTML');
const stateOptionValues=[...stateSelectBlock[1].matchAll(/value="([^"]+)"/g)].map(m=>m[1]);
assert(JSON.stringify(stateOptionValues)===JSON.stringify(['any','raf','nasb','jarr','jazm']),
  'The HTML stateFilter options are not exactly any/raf/nasb/jarr/jazm in order');
['الرَّفْعُ','النَّصْبُ','الْخَفْضُ','الْجَزْمُ'].forEach(label=>
  assert(stateSelectBlock[1].includes(label),`stateFilter is missing the Arabic label ${label}`));
stateFilterCases++;

// --- Test B: poolFor(start,form,state,sign) — every returned template satisfies all four dimensions. ---
for(const start of optionValues.startFilter){
  for(const form of optionValues.formFilter){
    for(const state of optionValues.stateFilter){
      for(const sign of optionValues.signFilter){
        for(const t of api.poolFor(start,form,state,sign)){
          assert((start==='any'||t.starts===start)&&(form==='any'||t.form===form)&&(state==='any'||t.state===state)&&(sign==='any'||t.sign===sign),
            `poolFor(${start},${form},${state},${sign}) returned a non-matching template ${t.stableId}`);
          stateFilterCases++;
        }
      }
    }
  }
}

// --- Test C: every production template has exactly one target whose real form/state/sign
//     matches the template metadata. Rebuilt many times to cover randomized vocabulary. ---
assert(api.templates.length===72,`Expected 72 production templates, found ${api.templates.length}`);
for(const t of api.templates){
  for(let i=0;i<40;i++){
    const data=api.buildTemplate(t.id);
    const targets=data.tokens.filter(tok=>tok.target);
    assert(targets.length===1,`Template ${t.stableId} does not have exactly one target`);
    const tk=targets[0];
    assert(focusFormOf(tk)===t.form,`Template ${t.stableId}: target form ${focusFormOf(tk)} != metadata ${t.form}`);
    assert(tk.state===t.state,`Template ${t.stableId}: target state ${tk.state} != metadata ${t.state}`);
    assert(tk.sign.id===t.sign,`Template ${t.stableId}: target sign ${tk.sign.id} != metadata ${t.sign}`);
    stateFilterCases++;
  }
}

// --- Test C (negative): corrupted template metadata must be rejected even when the
//     surface sign is unchanged (e.g. a genuine dual naṣb target relabelled as khafḍ). ---
const genuineDualNasb=api.buildTemplate(api.poolFor('any','dual','nasb','ya')[0].id);
assert(api.validateExercise(genuineDualNasb).length===0,'A genuine dual/nasb/ya exercise did not validate cleanly');
assert(api.validateExercise({...genuineDualNasb,templateState:'jarr'}).some(f=>f.code==='E_TARGET_STATE'),
  'Metadata state nasb->jarr (same yāʾ sign) was not rejected by E_TARGET_STATE');
assert(api.validateExercise({...genuineDualNasb,templateSign:'alif'}).some(f=>f.code==='E_TARGET_SIGN'),
  'Metadata sign ya->alif was not rejected by E_TARGET_SIGN');
assert(api.validateExercise({...genuineDualNasb,templateForm:'singular'}).some(f=>f.code==='E_TARGET_FORM'),
  'Metadata form dual->singular was not rejected by E_TARGET_FORM');
stateFilterCases+=4;

// --- Test D: same sign, different state, must stay distinct template identities. ---
function soleTargetState(pool){
  assert(pool.length>=1,'Expected at least one template for a same-sign/different-state case');
  const data=api.buildTemplate(pool[0].id);
  const tk=data.tokens.find(tok=>tok.target);
  return {state:tk.state,sign:tk.sign.id};
}
const dualNasbYa=soleTargetState(api.poolFor('any','dual','nasb','ya'));
const dualJarrYa=soleTargetState(api.poolFor('any','dual','jarr','ya'));
assert(dualNasbYa.sign==='ya'&&dualJarrYa.sign==='ya'&&dualNasbYa.state==='nasb'&&dualJarrYa.state==='jarr',
  'Dual nasb+ya and jarr+ya are not distinct accusative/genitive targets');
const smpNasbYa=soleTargetState(api.poolFor('any','smp','nasb','ya'));
const smpJarrYa=soleTargetState(api.poolFor('any','smp','jarr','ya'));
assert(smpNasbYa.state==='nasb'&&smpJarrYa.state==='jarr','SMP nasb+ya and jarr+ya are not distinct');
const fvNasb=soleTargetState(api.poolFor('any','fiveVerbs','nasb','nunDropped'));
const fvJazm=soleTargetState(api.poolFor('any','fiveVerbs','jazm','nunDropped'));
assert(fvNasb.sign==='nunDropped'&&fvJazm.sign==='nunDropped'&&fvNasb.state==='nasb'&&fvJazm.state==='jazm',
  'Five-verb nasb+nunDropped and jazm+nunDropped are not distinct');
stateFilterCases+=3;

// --- Test E: grammatically impossible combinations must return no templates. ---
const impossible=[
  ['any','singular','jazm','any'],['any','broken','jazm','any'],['any','dual','jazm','any'],
  ['any','smp','jazm','any'],['any','sfp','jazm','any'],['any','fiveNouns','jazm','any'],
  ['any','present','jarr','any'],['any','fiveVerbs','jarr','any'],
  // invalid form/sign pairings
  ['any','singular','any','ya'],['any','dual','any','damma'],['any','present','any','ya'],
  ['any','fiveVerbs','any','damma'],['any','sfp','nasb','fatha'],['any','dual','raf','ya']
];
for(const [s,f,st,sg] of impossible){
  assert(api.poolFor(s,f,st,sg).length===0,`Impossible combination produced templates: ${f}/${st}/${sg}`);
  stateFilterCases++;
}

// --- Test F: every intended valid matrix cell has at least one production template. ---
const validMatrix=[
  ['singular','raf','damma'],['singular','nasb','fatha'],['singular','jarr','kasra'],
  ['broken','raf','damma'],['broken','nasb','fatha'],['broken','jarr','kasra'],
  ['dual','raf','alif'],['dual','nasb','ya'],['dual','jarr','ya'],
  ['smp','raf','waw'],['smp','nasb','ya'],['smp','jarr','ya'],
  ['sfp','raf','damma'],['sfp','nasb','kasraSub'],['sfp','jarr','kasra'],
  ['fiveNouns','raf','waw'],['fiveNouns','nasb','alif'],['fiveNouns','jarr','ya'],
  ['present','raf','damma'],['present','nasb','fatha'],['present','jazm','sukun'],
  ['fiveVerbs','raf','nunKept'],['fiveVerbs','nasb','nunDropped'],['fiveVerbs','jazm','nunDropped']
];
for(const [f,st,sg] of validMatrix){
  assert(api.poolFor('any',f,st,sg).length>=1,`Missing production template for valid cell ${f}/${st}/${sg}`);
  stateFilterCases++;
}

// --- Test G: representative selections disable exactly the impossible dependent options. ---
function refreshVia(start,form,state,sign){setFilters(start,form,state,sign);elements.signFilter.dispatch('change');}
refreshVia('any','any','jazm','any');
['singular','broken','dual','smp','sfp','fiveNouns'].forEach(f=>
  assert(isDisabled('formFilter',f),`state=jazm did not disable noun form ${f}`));
['present','fiveVerbs'].forEach(f=>assert(!isDisabled('formFilter',f),`state=jazm wrongly disabled verb form ${f}`));
refreshVia('any','dual','raf','any');
assert(isDisabled('signFilter','ya'),'dual+raf did not disable sign ya');
assert(!isDisabled('signFilter','alif'),'dual+raf wrongly disabled sign alif');
refreshVia('any','dual','nasb','any');
assert(!isDisabled('signFilter','ya'),'dual+nasb wrongly disabled sign ya');
assert(isDisabled('signFilter','alif'),'dual+nasb did not disable sign alif');
refreshVia('any','fiveVerbs','jazm','any');
assert(!isDisabled('signFilter','nunDropped'),'fiveVerbs+jazm wrongly disabled nunDropped');
assert(isDisabled('signFilter','nunKept'),'fiveVerbs+jazm did not disable nunKept');
stateFilterCases++;

// --- Test H: changing one filter resets only the incompatible dependent value(s). ---
// Change state on a dual/nasb/ya selection to raf -> keep form+state, reset only the sign.
setFilters('any','dual','nasb','ya');elements.stateFilter.value='raf';elements.stateFilter.dispatch('change');
assert(elements.formFilter.value==='dual'&&elements.stateFilter.value==='raf'&&elements.signFilter.value==='any',
  `Changing state did not minimally reset: got form=${elements.formFilter.value} state=${elements.stateFilter.value} sign=${elements.signFilter.value}`);
assert(/Iʿrāb sign/.test(elements.status.textContent),'The state-change reset notice did not name the Iʿrāb sign');
// Change sign on a dual/nasb/ya selection to alif -> keep form+sign, reset only the state.
setFilters('any','dual','nasb','ya');elements.signFilter.value='alif';elements.signFilter.dispatch('change');
assert(elements.formFilter.value==='dual'&&elements.signFilter.value==='alif'&&elements.stateFilter.value==='any',
  `Changing sign did not minimally reset: got form=${elements.formFilter.value} state=${elements.stateFilter.value} sign=${elements.signFilter.value}`);
// Change form on a dual/raf/alif selection to singular -> keep form+state, reset only the sign.
setFilters('any','dual','raf','alif');elements.formFilter.value='singular';elements.formFilter.dispatch('change');
assert(elements.formFilter.value==='singular'&&elements.stateFilter.value==='raf'&&elements.signFilter.value==='any',
  `Changing form did not minimally reset: got form=${elements.formFilter.value} state=${elements.stateFilter.value} sign=${elements.signFilter.value}`);
// Unrelated start filter must be preserved across a word-level reset.
setFilters('noun','dual','nasb','ya');elements.stateFilter.value='raf';elements.stateFilter.dispatch('change');
assert(elements.startFilter.value==='noun','A word-level reset wrongly wiped the sentence-start filter');
stateFilterCases++;

// --- Test I: randomized generation with state filters set never violates the filters. ---
const validTuples=[];
for(const start of optionValues.startFilter)for(const form of optionValues.formFilter)
  for(const state of optionValues.stateFilter)for(const sign of optionValues.signFilter)
    if(api.poolFor(start,form,state,sign).length)validTuples.push([start,form,state,sign]);
const rejectedBeforeState=api.grammarDiagnostics.rejected;
for(let iteration=0;iteration<400;iteration++){
  const [start,form,state,sign]=validTuples[Math.floor(Math.random()*validTuples.length)];
  setFilters(start,form,state,sign);
  elements.signFilter.dispatch('change');
  assert(elements.sentence.textContent,`No sentence for state-filtered selection ${start}/${form}/${state}/${sign}`);
  // Selected filters must be preserved (this tuple is valid, so nothing should reset).
  assert(elements.startFilter.value===start&&elements.formFilter.value===form&&elements.stateFilter.value===state&&elements.signFilter.value===sign,
    `A valid state-filtered selection was reset: ${start}/${form}/${state}/${sign}`);
  // Structural guarantee: every template that could have produced it satisfies the tuple.
  for(const t of api.poolFor(start,form,state,sign)){
    const data=api.buildTemplate(t.id);
    const tgts=data.tokens.filter(tok=>tok.target);
    assert(tgts.length===1,`State-filtered template ${t.stableId} lacks a unique target`);
    const tk=tgts[0];
    assert(form==='any'||focusFormOf(tk)===form,`Target form violates filter for ${t.stableId}`);
    assert(state==='any'||tk.state===state,`Target state violates filter for ${t.stableId}`);
    assert(sign==='any'||tk.sign.id===sign,`Target sign violates filter for ${t.stableId}`);
  }
  stateFilterCases++;
}
assert(api.grammarDiagnostics.rejected===rejectedBeforeState,
  `State-filtered generation produced ${api.grammarDiagnostics.rejected-rejectedBeforeState} validation rejections`);
// Restore an unrestricted selection for the remaining audit.
setFilters('any','any','any','any');elements.signFilter.dispatch('change');
console.log(`Iʿrāb-state-filter audit passed: ${api.templates.length} templates, ${validMatrix.length} valid matrix cells, ${validTuples.length} valid filter tuples, ${stateFilterCases} checks.`);

// ===================================================================================
// Language-mode audit (presentation only — must NOT touch grammar/generation state).
// ===================================================================================
let languageCases=0;
const historyKey='nahw-sentence-history-v1';
const langKey='nahw-language-mode-v1';
const histLen=()=>JSON.parse(storage.get(historyKey)||'[]').length;
function snapshotState(){
  const ex=api.currentExercise();
  return {
    templateId:ex&&ex.templateId,
    sentence:elements.sentence.textContent,
    target:ex&&(ex.tokens.find(t=>t.target)||{}).word,
    start:elements.startFilter.value,form:elements.formFilter.value,
    state:elements.stateFilter.value,sign:elements.signFilter.value,
    history:histLen(),reveal:elements.answerPanel.classList.contains('open'),
    defsOpen:elements.definitionsPanel.classList.contains('open')
  };
}
// 1-2: both language values exist; default is mixed.
assert(api.UI_TEXT.mixed&&api.UI_TEXT.arabic,'UI_TEXT is missing a language mode');
assert(api.getLanguageMode()==='mixed','Default language mode is not mixed');
languageCases++;
// Generate a fresh exercise, open reveal + definitions + expand one definition to set up state.
elements.startFilter.value='any';elements.formFilter.value='any';elements.stateFilter.value='any';elements.signFilter.value='any';
elements.signFilter.dispatch('change');
if(!elements.answerPanel.classList.contains('open'))elements.revealBtn.dispatch('click');
if(!elements.definitionsPanel.classList.contains('open'))elements.definitionsToggle.dispatch('click');
api.selectDefinitionChapter(0);
const before=snapshotState();
assert(before.reveal===true,'Reveal panel was not open before the language switch');
assert(before.defsOpen===true,'Definitions panel was not open before the language switch');
// 4-12: mixed -> arabic must not regenerate or change any grammar/app state.
api.setLanguageMode('arabic');
const afterAr=snapshotState();
assert(api.getLanguageMode()==='arabic','Language did not switch to arabic');
assert(storage.get(langKey)==='arabic','Arabic language choice was not persisted to localStorage');
['templateId','sentence','target','start','form','state','sign','history','reveal','defsOpen'].forEach(k=>
  assert(before[k]===afterAr[k],`Language switch mixed->arabic changed ${k}: ${before[k]} -> ${afterAr[k]}`));
languageCases++;
// 13-15,17: Arabic-only removes English learning text (via en-only wrapping + swapped labels).
assert(bodyElement.classList.contains('lang-arabic')&&!bodyElement.classList.contains('lang-mixed'),'Body did not enter lang-arabic');
assert(elements.answers.innerHTML.includes('class="english en-only"'),'Word iʿrāb English is not wrapped for hiding in Arabic mode');
assert(elements.answers.innerHTML.includes('class="gloss-en en-only"'),'Word gloss English is not wrapped for hiding in Arabic mode');
assert(/body\.lang-arabic \.en-only\{display:none\}/.test(html),'CSS does not hide .en-only in Arabic mode');
assert(/body\.lang-arabic #translation\{display:none\}/.test(html),'CSS does not hide the English sentence translation in Arabic mode');
assert(elements.revealBtn.textContent===api.UI_TEXT.arabic.reveal||elements.revealBtn.textContent===api.UI_TEXT.arabic.hide,'Reveal button label is not Arabic in Arabic mode');
assert(elements.newBtn.textContent===api.UI_TEXT.arabic.reset,'Reset button label is not Arabic in Arabic mode');
assert(elements.startLabel.textContent===api.UI_TEXT.arabic.startLabel&&elements.signLabel.textContent===api.UI_TEXT.arabic.signLabel,'Filter labels are not Arabic in Arabic mode');
assert(!/[A-Za-z]/.test(elements.newBtn.textContent+elements.startLabel.textContent+elements.stateLabel.textContent),'Arabic-mode control labels still contain Latin letters');
languageCases++;
// 16: mixed restores English content/labels.
api.setLanguageMode('mixed');
const afterMix=snapshotState();
['templateId','sentence','target','start','form','state','sign','history','reveal','defsOpen'].forEach(k=>
  assert(before[k]===afterMix[k],`Language switch arabic->mixed changed ${k}`));
assert(storage.get(langKey)==='mixed','Mixed language choice was not persisted');
assert(elements.revealBtn.textContent===api.UI_TEXT.mixed.hide||elements.revealBtn.textContent===api.UI_TEXT.mixed.reveal,'Reveal button did not restore English label');
assert(elements.newBtn.textContent==='Reset filters','Reset button did not restore English label');
assert(bodyElement.classList.contains('lang-mixed'),'Body did not return to lang-mixed');
languageCases++;
// 10: switching language must not add a history entry.
assert(before.history===afterAr.history&&afterAr.history===afterMix.history,'Language switching changed the sentence-history length');
languageCases++;
console.log(`Language-mode audit passed: ${languageCases} groups, reveal/definitions/filters/target/history all preserved across switches.`);

// ===================================================================================
// Appearance-mode audit — presentation only; must never touch grammar/generation state.
// ===================================================================================
let appearanceCases=0;
const apprKey='nahw-appearance-mode-v1';
const themeAttr=()=>documentElement.getAttribute('data-theme');
const apprPressed=id=>elements[id].getAttribute('aria-checked');
// 1-2: three valid modes; default is system with its button pressed.
assert(typeof api.setAppearanceMode==='function'&&typeof api.effectiveTheme==='function','Appearance API was not exported');
assert(api.getAppearanceMode()==='system','Default appearance mode is not system');
assert(apprPressed('apprSystem')==='true'&&apprPressed('apprLight')==='false'&&apprPressed('apprDark')==='false','System button is not pressed by default');
appearanceCases++;
// 7 + 8: System resolves via matchMedia and reacts LIVE to a simulated OS change (no regenerate).
setSystemPrefersDark(false);api.setAppearanceMode('system');
assert(api.effectiveTheme()==='light'&&themeAttr()==='light','System mode with a light OS did not resolve to light');
setSystemPrefersDark(true);
assert(api.effectiveTheme()==='dark'&&themeAttr()==='dark','System mode did not follow the OS change to dark');
setSystemPrefersDark(false);
assert(api.effectiveTheme()==='light'&&themeAttr()==='light','System mode did not follow the OS change back to light');
appearanceCases++;
// 5 + 10: explicit light applies, persists, and ignores a later OS change.
api.setAppearanceMode('light');
assert(api.getAppearanceMode()==='light'&&api.effectiveTheme()==='light'&&themeAttr()==='light','Explicit light did not apply');
assert(storage.get(apprKey)==='light','Light appearance was not persisted');
assert(apprPressed('apprLight')==='true'&&apprPressed('apprSystem')==='false','Light button is not pressed');
setSystemPrefersDark(true);
assert(api.effectiveTheme()==='light'&&themeAttr()==='light','Explicit light was wrongly overridden by an OS change');
appearanceCases++;
// 6 + 9: explicit dark applies, persists, and ignores a later OS change.
api.setAppearanceMode('dark');
assert(api.getAppearanceMode()==='dark'&&api.effectiveTheme()==='dark'&&themeAttr()==='dark','Explicit dark did not apply');
assert(storage.get(apprKey)==='dark','Dark appearance was not persisted');
assert(apprPressed('apprDark')==='true','Dark button is not pressed');
setSystemPrefersDark(false);
assert(api.effectiveTheme()==='dark'&&themeAttr()==='dark','Explicit dark was wrongly overridden by an OS change');
appearanceCases++;
// 11-23: appearance switching must NOT regenerate or change any grammar/app/language/definition state.
setSystemPrefersDark(false);api.setAppearanceMode('system');
const apprLangBefore=api.getLanguageMode();
const apprDefsBefore=elements.definitionsList.innerHTML;
const apprStateBefore=snapshotState();
for(const mode of ['dark','light','system']){
  api.setAppearanceMode(mode);
  const s=snapshotState();
  ['templateId','sentence','target','start','form','state','sign','history','reveal','defsOpen'].forEach(k=>
    assert(apprStateBefore[k]===s[k],`Appearance switch ->${mode} changed ${k}: ${apprStateBefore[k]} -> ${s[k]}`));
  assert(api.getLanguageMode()===apprLangBefore,`Appearance switch ->${mode} changed the language mode`);
  assert(elements.definitionsList.innerHTML===apprDefsBefore,`Appearance switch ->${mode} re-rendered the definitions panel`);
}
appearanceCases++;
// 4: invalid stored/selected value falls back to system.
api.setAppearanceMode('neon-glow');
assert(api.getAppearanceMode()==='system','An invalid appearance value did not fall back to system');
// 24: preference (and safe fallback) survive a simulated reload via the real loader.
storage.set(apprKey,'dark');assert(api.loadAppearanceMode()==='dark','Saved dark preference did not survive a simulated reload');
storage.set(apprKey,'garbage');assert(api.loadAppearanceMode()==='system','Corrupted stored value did not fall back to system on reload');
storage.delete(apprKey);assert(api.loadAppearanceMode()==='system','Missing stored value did not default to system');
appearanceCases++;
// 25-26: language and appearance are independent — neither switch resets the other.
api.setAppearanceMode('dark');api.setLanguageMode('arabic');
assert(api.getAppearanceMode()==='dark'&&themeAttr()==='dark','Switching language reset the appearance mode');
api.setAppearanceMode('light');
assert(api.getLanguageMode()==='arabic','Switching appearance reset the language mode');
api.setLanguageMode('mixed');api.setAppearanceMode('system');setSystemPrefersDark(false);api.applyAppearanceMode();
appearanceCases++;
console.log(`Appearance-mode audit passed: ${appearanceCases} groups; system/light/dark, live OS-change reactions, persistence, and zero state change all verified.`);

// ===================================================================================
// “Why this iʿrāb?” explanation audit — complete coverage over every production path.
// Explanations must be deterministic, structured-metadata driven, concise, and correct.
// ===================================================================================
let whyCases=0;
const bareAr=s=>s.replace(/[ـً-ْٰ]/g,'').replace(/[أإآٱ]/g,'ا');
const WHY_ROLE_STATE={mubtada:'raf',khabar:'raf',faail:'raf',object:'nasb',majrur:'jarr',mudafIlayh:'jarr',ismInna:'nasb',khabarInna:'raf',ismKana:'raf',khabarKana:'nasb',adverb:'nasb'};
const whyRuleIds=new Set();
let whyTokens=0,whyRels=0,whyFallbacks=0;
function auditWhy(why,label,{max=4}={}){
  assert(why&&Array.isArray(why.ar)&&why.ar.length,`${label}: missing/empty why explanation`);
  assert(why.ar.length===why.en.length&&why.ar.length===why.ids.length,`${label}: ar/en/id count mismatch`);
  assert(why.ar.length<=max,`${label}: ${why.ar.length} statements (max ${max})`);
  why.ar.concat(why.en).forEach(line=>{
    assert(line&&String(line).trim(),`${label}: empty statement`);
    assert(!/undefined|null|\[object Object\]/.test(line),`${label}: bad text “${line}”`);
  });
  why.ids.forEach(id=>{
    assert(id&&!/FALLBACK|UNKNOWN|GENERIC/i.test(id),`${label}: fallback/generic rule id “${id}”`);
    whyRuleIds.add(id);
  });
}
function auditTokenWhy(tok,label){
  auditWhy(tok.why,label);
  whyTokens++;
  const ar=bareAr(tok.why.ar.join(' '));
  if(tok.grammar.type==='noun'){
    assert(tok.state===WHY_ROLE_STATE[tok.grammar.role],`${label}: role/state mismatch`);
    assert(tok.state!=='jazm'&&!ar.includes('مجزوم'),`${label}: noun described with jazm`);
    const signRule=`WHY_SIGN_${tok.inflection.toUpperCase()}_${tok.state.toUpperCase()}`;
    assert(tok.why.ids.includes(signRule),`${label}: missing sign rule ${signRule}`);
    assert(tok.sign.id===api.GRAMMAR_RULES.nounInflection[tok.inflection][tok.state][0],`${label}: sign != declared sign`);
    if(tok.sign.id==='ya')assert(ar.includes(tok.state==='nasb'?'نصبه':'خفضه'),`${label}: yāʾ does not name ${tok.state}`);
    if(tok.inflection==='sfp'&&tok.state==='nasb')assert(ar.includes('نيابة عن الفتحة'),`${label}: SFP naṣb misses kasrah substitution`);
  }else if(tok.grammar.type==='verb'){
    assert(tok.state!=='jarr'&&!ar.includes('مخفوض'),`${label}: verb described with khafḍ`);
    if(tok.tense==='present'&&tok.inflection===api.MABNI_NUUN_NISWAH){
      // A مبني present verb has bināʾ, not iʿrāb: it must carry the bināʾ rule and the attached
      // nūn's subject rule, and must claim no state, no sign, and no maḥall.
      assert(tok.why.ids.includes('WHY_PRESENT_NUUN_NISWAH_BINAA'),`${label}: missing WHY_PRESENT_NUUN_NISWAH_BINAA`);
      assert(tok.why.ids.includes('WHY_SUBJECT_NUUN_NISWAH'),`${label}: missing WHY_SUBJECT_NUUN_NISWAH`);
      assert(!tok.state&&tok.sign===null,`${label}: mabnī present carries an iʿrāb state or sign`);
      for(const forbidden of ['WHY_STATE_VERB_FREE','WHY_STATE_VERB_LAN','WHY_STATE_VERB_LAM','WHY_STATE_VERB_SAWFA',
        'WHY_SIGN_MUDARI_RAF','WHY_SIGN_MUDARI_NASB','WHY_SIGN_MUDARI_JAZM','WHY_SIGN_AFAL5_RAF']){
        assert(!tok.why.ids.includes(forbidden),`${label}: mabnī present routed through ${forbidden}`);
      }
      // The forbidden claims are checked against the WHOLE-WORD line only. The separate
      // subject line must still carry the attached nūn's own «في محل رفع فاعل», which is the
      // component's maḥall and says nothing about the verb's.
      const binaaAr=bareAr(tok.why.ar[tok.why.ids.indexOf('WHY_PRESENT_NUUN_NISWAH_BINAA')]||'');
      const subjectAr=bareAr(tok.why.ar[tok.why.ids.indexOf('WHY_SUBJECT_NUUN_NISWAH')]||'');
      for(const claim of ['مرفوع','منصوب','مجزوم','وعلامة','في محل']){
        assert(!binaaAr.includes(claim),`${label}: mabnī present whole-word Why claims «${claim}»`);
      }
      assert(binaaAr.includes('مبني على السكون')&&binaaAr.includes('نون النسوة'),`${label}: mabnī present Why omits its bināʾ`);
      assert(subjectAr.includes('في محل رفع')&&subjectAr.includes('فاعل'),`${label}: nūn component Why omits its rafʿ maḥall as fāʿil`);
    }else if(tok.tense==='present'){
      const signRule=tok.inflection==='afalKhamsa'?`WHY_SIGN_AFAL5_${tok.state.toUpperCase()}`:`WHY_SIGN_MUDARI_${tok.state.toUpperCase()}`;
      assert(tok.why.ids.includes(signRule),`${label}: missing ${signRule}`);
      assert(tok.sign.id===api.GRAMMAR_RULES.presentVerb[tok.inflection][tok.state][0],`${label}: verb sign != declared`);
      if(tok.sign.id==='nunDropped')assert(ar.includes(tok.state==='nasb'?'تنصب بحذف النون':'تجزم بحذف النون'),`${label}: nūn-deletion does not distinguish ${tok.state}`);
    }else{
      assert(ar.includes('مبني'),`${label}: mabnī verb not described as mabnī`);
      assert(!/مرفوع|منصوب|مجزوم/.test(ar),`${label}: mabnī verb given an iʿrāb state`);
    }
  }else{
    assert(ar.includes('مبني'),`${label}: particle not described as mabnī`);
  }
  assert(!(ar.includes('ثبوت النون')&&/حرف |حروف/.test(ar)),`${label}: retention of nūn classified as a letter`);
}
// A) Every production template, many samples: full token + construction coverage.
for(let tid=0;tid<api.templates.length;tid++){
  for(let rep=0;rep<12;rep++){
    const data=api.buildTemplate(tid);
    api.renderExercise(data);
    data.tokens.forEach(tok=>{
      auditTokenWhy(tok,`tpl${tid} «${tok.word}»`);
      if(tok.phraseAr){auditWhy(tok.phraseWhy,`tpl${tid} phrase «${tok.word}»`,{max:3});whyRels++;}
      else assert(!tok.phraseWhy,`tpl${tid}: construction why without a construction analysis`);
    });
  }
}
whyCases++;
// B) Every valid filter tuple through the real production path (generate()).
let tupleRuns=0;
for(const [tStart,tForm,tState,tSign] of validTuples){
  elements.startFilter.value=tStart;elements.formFilter.value=tForm;
  elements.stateFilter.value=tState;elements.signFilter.value=tSign;
  context.nahwGenerate();
  const ex=api.currentExercise();
  ex.tokens.forEach(tok=>{
    auditTokenWhy(tok,`tuple ${tStart}/${tForm}/${tState}/${tSign} «${tok.word}»`);
    if(tok.phraseAr)auditWhy(tok.phraseWhy,`tuple phrase «${tok.word}»`,{max:3});
  });
  tupleRuns++;
}
assert(tupleRuns===validTuples.length,'Not every valid filter tuple was explained');
whyCases++;
// C) Golden checks: representative structures produce the right explanation rules.
// Build every canonical production template through its genuine builder. Golden
// predicates below do not depend on vocabulary identity; the only template-local
// structural variation is the six-item humanPrepActions pool that can yield a ẓarf.
// Its pickVaried history window is five, so six consecutive builds guarantee every
// action regardless of random order. This bounded corpus proves reachability without
// asking the global randomized template chooser to happen upon a rare template.
const GOLDEN_LOCAL_VARIATION_BOUND=6;
const deterministicGoldenCorpus=api.templates
  .slice()
  .sort((left,right)=>left.stableId.localeCompare(right.stableId))
  .flatMap(template=>Array.from({length:GOLDEN_LOCAL_VARIATION_BOUND},
    ()=>({template,ex:api.buildTemplate(template.id)})));
function goldenFind(predicate){
  for(const {template,ex} of deterministicGoldenCorpus){
    for(const tok of ex.tokens){
      if(predicate(tok,ex))return{tok,ex,template};
    }
  }
  return null;
}
const coldIsmKanaGolden=goldenFind(token=>token.grammar.role==='ismKana');
assert(coldIsmKanaGolden?.template.stableId==='T_VERB_SINGULAR_NASB_FATHA_02',
  'Deterministic cold-corpus scan did not find ism kāna in its canonical template');
const goldens=[
 ['singular fāʿil / ḍammah',t=>t.grammar.role==='faail'&&t.inflection==='singular',['WHY_ROLE_FAIL','WHY_STATE_FAIL','WHY_SIGN_SINGULAR_RAF']],
 ['singular object / fatḥah',t=>t.grammar.role==='object'&&t.inflection==='singular',['WHY_ROLE_OBJECT','WHY_STATE_OBJECT','WHY_SIGN_SINGULAR_NASB']],
 ['mubtadaʾ',t=>t.grammar.role==='mubtada'&&!t.grammar.delayed,['WHY_ROLE_MUBTADA','WHY_STATE_MUBTADA']],
 ['delayed mubtadaʾ',t=>t.grammar.role==='mubtada'&&t.grammar.delayed,['WHY_ROLE_MUBTADA_DELAYED']],
 ['direct khabar',t=>t.grammar.role==='khabar',['WHY_ROLE_KHABAR','WHY_STATE_KHABAR']],
 ['dual rafʿ / alif',t=>t.inflection==='dual'&&t.state==='raf',['WHY_SIGN_DUAL_RAF']],
 ['dual naṣb / yāʾ',t=>t.inflection==='dual'&&t.state==='nasb',['WHY_SIGN_DUAL_NASB']],
 ['dual khafḍ / yāʾ',t=>t.inflection==='dual'&&t.state==='jarr',['WHY_SIGN_DUAL_JARR']],
 ['SMP rafʿ / wāw',t=>t.inflection==='smp'&&t.state==='raf',['WHY_SIGN_SMP_RAF']],
 ['SMP naṣb / yāʾ',t=>t.inflection==='smp'&&t.state==='nasb',['WHY_SIGN_SMP_NASB']],
 ['SMP khafḍ / yāʾ',t=>t.inflection==='smp'&&t.state==='jarr',['WHY_SIGN_SMP_JARR']],
 ['SFP rafʿ / ḍammah',t=>t.inflection==='sfp'&&t.state==='raf',['WHY_SIGN_SFP_RAF']],
 ['SFP naṣb / substitute kasrah',t=>t.inflection==='sfp'&&t.state==='nasb',['WHY_SIGN_SFP_NASB']],
 ['SFP khafḍ / kasrah',t=>t.inflection==='sfp'&&t.state==='jarr',['WHY_SIGN_SFP_JARR']],
 ['five nouns rafʿ',t=>t.inflection==='fiveNouns'&&t.state==='raf',['WHY_SIGN_FIVENOUNS_RAF','WHY_MUDAF_ATTACHED_KAF']],
 ['five nouns naṣb',t=>t.inflection==='fiveNouns'&&t.state==='nasb',['WHY_SIGN_FIVENOUNS_NASB']],
 ['five nouns khafḍ',t=>t.inflection==='fiveNouns'&&t.state==='jarr',['WHY_SIGN_FIVENOUNS_JARR']],
 // The free present and the سوف future are both present/regular/rafʿ; this golden targets the free
// variant (سوف is covered by the deterministic golden above), so exclude the future-particle case
// to keep the check order-independent regardless of the random generation sequence.
 ['present rafʿ',t=>t.tense==='present'&&t.inflection==='regular'&&t.state==='raf'&&!(t.why&&t.why.ids.includes('WHY_STATE_VERB_SAWFA')),['WHY_STATE_VERB_FREE','WHY_SIGN_MUDARI_RAF']],
 ['present after lan',t=>t.tense==='present'&&t.inflection==='regular'&&t.state==='nasb',['WHY_STATE_VERB_LAN','WHY_SIGN_MUDARI_NASB']],
 ['present after lam',t=>t.tense==='present'&&t.inflection==='regular'&&t.state==='jazm',['WHY_STATE_VERB_LAM','WHY_SIGN_MUDARI_JAZM']],
 ['five verbs rafʿ / ثبوت النون',t=>t.inflection==='afalKhamsa'&&t.state==='raf',['WHY_SIGN_AFAL5_RAF','WHY_SUBJECT_ATTACHED']],
 ['five verbs naṣb / حذف النون',t=>t.inflection==='afalKhamsa'&&t.state==='nasb',['WHY_STATE_VERB_LAN','WHY_SIGN_AFAL5_NASB']],
 ['five verbs jazm / حذف النون',t=>t.inflection==='afalKhamsa'&&t.state==='jazm',['WHY_STATE_VERB_LAM','WHY_SIGN_AFAL5_JAZM']],
 ['ism inna',t=>t.grammar.role==='ismInna',['WHY_ROLE_ISM_INNA','WHY_STATE_ISM_INNA']],
 ['khabar inna',t=>t.grammar.role==='khabarInna',['WHY_ROLE_KHABAR_INNA','WHY_STATE_KHABAR_INNA']],
 ['ism kāna',t=>t.grammar.role==='ismKana',['WHY_ROLE_ISM_KANA','WHY_STATE_ISM_KANA']],
 ['khabar kāna',t=>t.grammar.role==='khabarKana',['WHY_ROLE_KHABAR_KANA','WHY_STATE_KHABAR_KANA']],
 ['muḍāf ilayh',t=>t.grammar.role==='mudafIlayh',['WHY_ROLE_MUDAF_ILAYH','WHY_STATE_MUDAF_ILAYH']],
 ['preposition + governed noun',t=>t.grammar.role==='majrur',['WHY_ROLE_MAJRUR','WHY_STATE_MAJRUR']],
 ['past verb / visible fatḥ',t=>t.tense==='past'&&t.grammar.morphology?.binaaClass==='visible-fath',['WHY_PAST_VERB','WHY_PAST_FATH_VISIBLE']],
 ['past verb / estimated fatḥ for munāsabah',t=>t.tense==='past'&&t.grammar.morphology?.binaaClass==='estimated-fath-munasabah',['WHY_PAST_VERB','WHY_PAST_FATH_EST_MUNASABAH','WHY_SUBJECT_WAW_JAMAAH']],
 ['past verb / estimated fatḥ with incidental sukūn',t=>t.tense==='past'&&t.grammar.morphology?.binaaClass==='estimated-fath-incidental-sukun',['WHY_PAST_VERB','WHY_PAST_FATH_EST_INCIDENTAL_SUKUN']],
 ['kāna (mabnī)',t=>t.tense==='kana',['WHY_KANA','WHY_MABNI_KANA']],
 ['mabnī particle',t=>t.grammar.type==='particle',['WHY_MABNI_PARTICLE']],
 // Each present concealment person carries its own rule, so the Why can state both the
 // estimated pronoun and the concealment class the D-3 sources actually license.
 ['hidden subject',t=>t.tense==='present'&&t.relations&&t.relations.subjectType==='implicit'
   &&t.grammar.morphology?.person==='3ms',['WHY_SUBJECT_HIDDEN_HUWA']],
 ['hidden subject (3fs)',t=>t.tense==='present'&&t.relations&&t.relations.subjectType==='implicit'
   &&t.grammar.morphology?.person==='3fs',['WHY_SUBJECT_HIDDEN_HIYA']],
 ['ẓarf',t=>t.grammar.role==='adverb',['WHY_ROLE_ZARF','WHY_STATE_ZARF']]
];
for(const [name,pred,expectIds] of goldens){
  const hit=goldenFind(pred);
  assert(hit,`Golden why case never generated: ${name}`);
  expectIds.forEach(id=>assert(hit.tok.why.ids.includes(id),`Golden “${name}”: expected rule ${id}, got ${hit.tok.why.ids.join(',')}`));
  whyCases++;
}
// D) Construction goldens: jār-majrūr khabar, fronted khabar, verbal-sentence khabar (hidden + attached link).
const relGoldens=[
 ['jār wa-majrūr khabar',t=>t.phraseWhy&&t.phraseWhy.ids.includes('WHY_REL_PHRASE_KHABAR'),['WHY_REL_JARR_MAJRUR','WHY_REL_ATTACHED_TO_OMITTED']],
 ['fronted khabar + delayed mubtadaʾ',t=>t.phraseWhy&&t.phraseWhy.ids.includes('WHY_REL_FRONTED_KHABAR'),['WHY_REL_JARR_MAJRUR']],
 ['verbal khabar, hidden link',t=>t.phraseWhy&&t.phraseWhy.ids.includes('WHY_REL_LINK_HIDDEN'),['WHY_REL_VERBAL_KHABAR','WHY_REL_KHABAR_POSITION']],
 ['verbal khabar, attached link',t=>t.phraseWhy&&t.phraseWhy.ids.includes('WHY_REL_LINK_ATTACHED'),['WHY_REL_VERBAL_KHABAR','WHY_REL_KHABAR_POSITION']]
];
for(const [name,pred,expectIds] of relGoldens){
  const hit=goldenFind(pred);
  assert(hit,`Golden construction why never generated: ${name}`);
  expectIds.forEach(id=>assert(hit.tok.phraseWhy.ids.includes(id),`Golden “${name}”: expected ${id}`));
  whyCases++;
}
// D2) Independent-review corrections.
{ // (1a) five noun with an attached kāf must use the attached-kāf muḍāf explanation
  const kaf=goldenFind(t=>t.grammar.isMudaf&&t.grammar.attachedKaf);
  assert(kaf,'No attached-kāf five noun was generated');
  const kw=kaf.tok.why,kAr=bareAr(kw.ar.join(' ')),kEn=kw.en.join(' ');
  assert(kw.ids.includes('WHY_MUDAF_ATTACHED_KAF'),'Attached-kāf five noun does not use the attached-kāf muḍāf rule');
  assert(!kw.ids.includes('WHY_MUDAF'),'Attached-kāf five noun still uses the generic muḍāf rule');
  assert(kAr.includes('مضاف')&&kAr.includes('الكاف')&&kAr.includes('مضاف اليه'),'Attached-kāf Arabic must name the kāf as the muḍāf ilayh');
  assert(!kAr.includes('الى ما بعده'),'Attached-kāf must not say “joined to what follows it” (Arabic)');
  assert(!/what follows it/.test(kEn),'Attached-kāf must not say “joined to what follows it” (English)');
  assert(/كَاف/.test(kEn),'Attached-kāf English must mention the kāf');
  assert(/الْكَافُ/.test(kaf.tok.ar),'The displayed five-noun iʿrāb lost its kāf clause (grammar must be untouched)');
  whyCases++;
}
{ // (1b) ordinary token-to-token iḍāfah keeps the ordinary wording
  const mudaf=goldenFind(t=>t.grammar.isMudaf&&!t.grammar.attachedKaf);
  assert(mudaf,'No ordinary muḍāf was generated');
  assert(mudaf.tok.why.ids.includes('WHY_MUDAF'),'Ordinary muḍāf lost the ordinary muḍāf explanation');
  assert(!mudaf.tok.why.ids.includes('WHY_MUDAF_ATTACHED_KAF'),'Ordinary muḍāf wrongly uses the attached-kāf rule');
  const mi=goldenFind(t=>t.grammar.role==='mudafIlayh');
  assert(mi&&mi.tok.why.ids.includes('WHY_ROLE_MUDAF_ILAYH')&&mi.tok.why.ids.includes('WHY_STATE_MUDAF_ILAYH'),'muḍāf ilayh explanation missing');
  whyCases++;
}
{ // (2) mabnī particle: direct statement, never the false causal universal
  const p=goldenFind(t=>t.grammar.type==='particle');
  const pAr=bareAr(p.tok.why.ar.join(' ')),pEn=p.tok.why.en.join(' ');
  assert(pAr.includes('حرف مبني')&&pAr.includes('لا محل له من الاعراب'),'Particle why must state it is a mabnī particle with no position in iʿrāb');
  assert(!pAr.includes('والحروف كلها مبنية'),'Particle why still teaches the causal universal «وَالْحُرُوفُ كُلُّهَا مَبْنِيَّةٌ، فَـ…»');
  assert(!/All particles are built/.test(pEn),'Particle English why still teaches the causal universal');
  assert(/مَبْنِيٌّ/.test(pEn),'Particle English why should use the Arabic term mabnī');
  whyCases++;
}
{ // (3) English Why must carry the real Arabic Nahw role/state vocabulary, not only transliterations
  const need=[
    ['fāʿil',t=>t.grammar.role==='faail',['فاعل','مرفوع']],
    ['mafʿūl bihi',t=>t.grammar.role==='object',['مفعول','منصوب']],
    ['mubtadaʾ',t=>t.grammar.role==='mubtada'&&!t.grammar.delayed,['مبتدا','مرفوع']],
    ['khabar',t=>t.grammar.role==='khabar',['خبر','مرفوع']],
    ['muḍāf ilayh',t=>t.grammar.role==='mudafIlayh',['مضاف اليه','مخفوض']],
    ['majrūr',t=>t.grammar.role==='majrur',['مخفوض']],
    ['ism inna',t=>t.grammar.role==='ismInna',['اسم','منصوب']],
    ['khabar kāna',t=>t.grammar.role==='khabarKana',['خبر','منصوب']],
    ['present after lam',t=>t.tense==='present'&&t.inflection==='regular'&&t.state==='jazm',['مجزوم']],
    ['five verbs rafʿ',t=>t.inflection==='afalKhamsa'&&t.state==='raf',['الافعال الخمسة','ثبوت النون']],
    ['dual naṣb',t=>t.inflection==='dual'&&t.state==='nasb',['ياء']]
  ];
  for(const [name,pred,terms] of need){
    const hit=goldenFind(pred);
    assert(hit,`English-vocabulary golden never generated: ${name}`);
    const en=bareAr(hit.tok.why.en.join(' '));
    terms.forEach(term=>assert(en.includes(term),`English Why for ${name} must contain the Arabic term «${term}» — got: ${hit.tok.why.en.join(' ')}`));
  }
  whyCases++;
}
// E) Rendered UI: Why controls are real buttons with unique ids, closed by default, and the
//    individual why always precedes the combined analysis (sacred ordering).
context.nahwGenerate();
const whyHtml=elements.answers.innerHTML;
assert((whyHtml.match(/class="why-toggle"/g)||[]).length>=1,'No Why controls rendered');
assert((whyHtml.match(/aria-expanded="false"/g)||[]).length>=1,'Why controls are not closed by default');
assert(/<div class="why-region" id="why-[tp]\d+" hidden>/.test(whyHtml),'Why regions are not hidden by default');
const whyIds=[...whyHtml.matchAll(/<div class="why-region" id="([^"]+)"/g)].map(m=>m[1]);
assert(new Set(whyIds).size===whyIds.length,'Duplicate Why region ids');
[...whyHtml.matchAll(/aria-controls="(why-[^"]+)"/g)].forEach(m=>assert(whyIds.includes(m[1]),`aria-controls points at a missing region: ${m[1]}`));
assert(whyHtml.includes('class="why-en en-only"'),'English why is not wrapped for Arabic-only hiding');
whyCases++;
// Ordering: within any card carrying a construction, individual why comes before the construction.
{
  const hit=goldenFind(t=>Boolean(t.phraseWhy));
  assert(hit,'No construction card generated for the ordering check');
  api.render(hit.ex,'',false);
  const card=elements.answers.innerHTML.split('<article').find(part=>part.includes('phrase-analysis'));
  const iIraab=card.indexOf('class="iraab"'),iWhy=card.indexOf('class="why-wrap"'),iPhrase=card.indexOf('class="phrase-analysis"');
  assert(iIraab>=0&&iWhy>=0&&iPhrase>=0,'Ordering check could not locate all sections');
  assert(iIraab<iWhy&&iWhy<iPhrase,`Sacred ordering broken: iraab=${iIraab} why=${iWhy} phrase=${iPhrase}`);
  whyCases++;
}
// F) Why expansion is LOCAL UI state: language and appearance switches must preserve it,
//    must not regenerate, and must not touch grammar state. New Sentence resets it (by design).
{
  context.nahwGenerate();
  const region=element('why-t0');region.hidden=true;elements['why-t0']=region;
  const btn=element('whyBtn');btn.classList.add('why-toggle');
  btn.setAttribute('aria-controls','why-t0');btn.setAttribute('aria-expanded','false');
  const beforeWhy=snapshotState();
  elements.answers.dispatch('click',btn);
  assert(btn.getAttribute('aria-expanded')==='true'&&region.hidden===false,'Why control did not open its region');
  api.setLanguageMode('arabic');
  assert(btn.getAttribute('aria-expanded')==='true'&&region.hidden===false,'Language switch collapsed an open Why region');
  api.setLanguageMode('mixed');
  api.setAppearanceMode('dark');api.setAppearanceMode('system');
  assert(btn.getAttribute('aria-expanded')==='true'&&region.hidden===false,'Appearance switch collapsed an open Why region');
  const afterWhy=snapshotState();
  ['templateId','sentence','target','start','form','state','sign','history','reveal','defsOpen'].forEach(k=>
    assert(beforeWhy[k]===afterWhy[k],`Opening a Why region / switching language or appearance changed ${k}`));
  elements.answers.dispatch('click',btn);
  assert(btn.getAttribute('aria-expanded')==='false'&&region.hidden===true,'Why control did not close its region');
  delete elements['why-t0'];
  whyCases++;
}
// G) A new sentence re-renders the answers, so Why regions come back closed.
context.nahwGenerate();
assert(!/class="why-region"[^>]*id="[^"]+"(?![^>]*hidden)/.test(elements.answers.innerHTML),'A Why region rendered open after New Sentence');
whyCases++;
console.log(`Why-explanation audit passed: ${whyCases} groups; ${whyTokens} token explanations, ${whyRels} construction explanations, ${whyRuleIds.size} unique rules, ${whyFallbacks} fallbacks, ${tupleRuns} filter tuples.`);

// ===================================================================================
// Definitions audit (examples + expanded explanations + accessible expanders).
// ===================================================================================
let definitionCases=0;
const allDefs=api.grammarDefinitionGroups.flatMap(g=>g.items);
assert(allDefs.length===70,`Expected 70 definitions, found ${allDefs.length}`);
const stripDia=s=>s.replace(/[ـً-ْٰ]/g,'');
let totalExamples=0,defsWithDetails=0;
for(const item of allDefs){
  assert(item.source&&Array.isArray(item.source.pdfPages)&&item.source.pdfPages.length,`${item.enTerm}: missing source pages`);
  assert(Array.isArray(item.examples)&&item.examples.length>=1,`${item.enTerm}: has no example`);
  assert(typeof item.detailsAr==='string'&&item.detailsAr.trim().length>0,`${item.enTerm}: missing detailsAr`);
  assert(typeof item.detailsEn==='string'&&item.detailsEn.trim().length>0,`${item.enTerm}: missing detailsEn`);
  assert(typeof item.defId==='string'&&/^def-\d+-\d+$/.test(item.defId),`${item.enTerm}: bad defId`);
  if(item.detailsAr)defsWithDetails++;
  for(const ex of item.examples){
    totalExamples++;
    ['ar','en','focus','iraabAr','iraabEn'].forEach(k=>assert(ex[k]&&String(ex[k]).trim(),`${item.enTerm}: example missing ${k}`));
    assert(ex.ar.includes(ex.focus)||stripDia(ex.ar).includes(stripDia(ex.focus)),`${item.enTerm}: focus «${ex.focus}» not in example «${ex.ar}»`);
  }
}
assert(defsWithDetails===70,'Not every definition has an expanded explanation');
// No duplicate accidental example (ar + iʿrāb) reused across different definitions.
const exSeen=new Set();
for(const item of allDefs)for(const ex of item.examples){
  const key=ex.ar+'||'+ex.iraabAr;
  assert(!exSeen.has(key),`Duplicate example reused: «${ex.ar}»`);
  exSeen.add(key);
}
definitionCases++;
// -------------------------------------------------------------------------------------------------
// Content-accuracy locks (final-perfection audit). These protect corrected TEACHING FACTS, not exact
// wording. Needles are undiacritized and compared with stripDia() so they are robust to ḥarakāt.
// -------------------------------------------------------------------------------------------------
const defByEn=en=>{const d=allDefs.find(x=>x.enTerm===en);assert(d,`Content lock: missing definition «${en}»`);return d;};
// (1–3) The five verbs are formed only from the PRESENT verb. The waw/alif/yaa cards must tie the rule
// to al-muḍāriʿ and must not keep the old overbroad claim «…يتكون فعل من الأفعال الخمسة» for any attachment.
for(const en of ['Plural wāw','Dual alif','Feminine-address yāʾ']){
  const d=defByEn(en);
  const bareAr=stripDia(d.detailsAr);
  assert(bareAr.includes('المضارع'),`Content lock: «${en}» expanded explanation must tie the five verbs to the present verb (al-muḍāriʿ)`);
  assert(!bareAr.includes('يتكون'),`Content lock: «${en}» still uses the overbroad «يتكون فعل من الأفعال الخمسة» wording`);
  assert(/present-tense verb/.test(d.detailsEn),`Content lock: «${en}» English explanation must reference the present-tense verb`);
}
// (4) Iʿrāb sign: the four secondary-sign kinds must be represented as DISTINCT categories —
// a vowel, a letter, RETENTION (ثبوت النون), and deletion — plus a substitute vowel (kasrah for
// fatḥah). The key regression this guards: ثبوت النون must be its own concept, NOT lumped inside
// the list of letters (the old wording «حروف: …والياء وثبوت النون»). Wording-robust via stripDia.
{
  const d=defByEn('Iʿrāb sign');
  const norm=x=>stripDia(x).replace(/[أإآٱ]/g,'ا'); // also fold hamza-alif to bare alif so needles are robust
  const bareSimple=norm(d.ar);
  const bareAr=norm(d.detailsAr);
  // (a) the SIMPLE definition recognizes retention (ثبوت) as one of the kinds of sign.
  assert(bareSimple.includes('ثبوت'),'Content lock: Iʿrāb-sign simple definition must recognize retention (ثبوت)');
  // (b) the expanded explanation names all four secondary kinds (letters / retention / substitute vowel / deletion).
  for(const kw of ['حروف','ثبوت النون','نيابة','حذف'])
    assert(bareAr.includes(kw),`Content lock: Iʿrāb-sign explanation must mention «${kw}»`);
  assert(!bareAr.includes('الفرعية حروف او حذف'),'Content lock: Iʿrāb-sign explanation must not reduce secondary signs to letters-or-deletion');
  // (c) retention stands as ITS OWN category tied to the rafʿ of the five verbs (not a letter).
  assert(/ثبوت النون[^.؛]*الافعال الخمسة/.test(bareAr),'Content lock: retention (ثبوت النون) must be its own category for the rafʿ of the five verbs, not one of the letters');
  // (d) the letters category enumerates alif/wāw/yāʾ and does NOT append ثبوت النون to that list.
  assert(bareAr.includes('الالف')&&bareAr.includes('الواو')&&bareAr.includes('الياء'),'Content lock: the letters category must list alif, wāw, and yāʾ');
  assert(!/الياء\s*وثبوت/.test(bareAr),'Content lock: ثبوت النون is wrongly grouped inside the letters (…والياء وثبوت النون)');
}
// (5) Bināʾ: must not flatly list demonstratives as mabnī; the dual (هذان/هاتان) is muʿrab.
{
  const d=defByEn('Fixed form (bināʾ)');
  const bareAr=stripDia(d.detailsAr);
  assert(bareAr.includes('اكثر اسماء الاشارة')||bareAr.includes('هذان'),'Content lock: Bināʾ explanation must qualify demonstratives (dual هذان/هاتان are muʿrab)');
}
// (6) Unattached present verb: the visible-ending rule must be limited to the sound-final (صحيح الآخر) class.
{
  const d=defByEn('Unattached present verb');
  assert(stripDia(d.detailsAr).includes('الصحيح'),'Content lock: unattached-present explanation must be limited to ṣaḥīḥ al-ākhir');
}
definitionCases++;
// Rendered markup: expanders, aria attributes, unique ids, hidden regions.
api.selectDefinitionChapter(2);
const defsHtml=elements.definitionsList.innerHTML;
assert((defsHtml.match(/class="definition-card"/g)||[]).length===70,'Not all 70 definition cards rendered');
assert((defsHtml.match(/class="def-expand"/g)||[]).length>=70,'Expander buttons are missing');
assert((defsHtml.match(/aria-expanded="false"/g)||[]).length>=70,'Expander aria-expanded attributes are missing');
assert((defsHtml.match(/aria-controls="def-\d+-\d+-(?:ex|more)"/g)||[]).length>=70,'Expander aria-controls are missing/malformed');
const idMatches=[...defsHtml.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
assert(new Set(idMatches).size===idMatches.length,'Rendered definitions contain duplicate DOM ids');
assert(defsHtml.includes('class="definition-region"')&&/class="definition-region" id="def-\d+-\d+-ex" hidden/.test(defsHtml),'Example regions are not present/hidden by default');
definitionCases++;
// Expander toggle behaviour + isolation from grammar (via the real click handler).
const preExpand=snapshotState();
const region=element('def-2-0-ex');region.hidden=true;elements['def-2-0-ex']=region;
const exBtn=element('exBtn');exBtn.classList.add('def-expand');exBtn.setAttribute('aria-controls','def-2-0-ex');exBtn.setAttribute('aria-expanded','false');
elements.definitionsList.dispatch('click',exBtn);
assert(exBtn.getAttribute('aria-expanded')==='true'&&region.hidden===false,'Expander did not open its region');
elements.definitionsList.dispatch('click',exBtn);
assert(exBtn.getAttribute('aria-expanded')==='false'&&region.hidden===true,'Expander did not close its region');
const postExpand=snapshotState();
['sentence','target','start','form','state','sign','history'].forEach(k=>
  assert(preExpand[k]===postExpand[k],`Expanding a definition changed grammar state ${k}`));
delete elements['def-2-0-ex'];
definitionCases++;
console.log(`Definitions audit passed: 70 definitions, ${totalExamples} examples, ${defsWithDetails} expanded explanations, ${definitionCases} groups.`);

// ===================================================================================
// Terminology audit — enforce the project's beginner khafḍ terminology everywhere.
// ===================================================================================
let terminologyCases=0;
const forbiddenJarrSign=/عَلَامَةُ جَرّ|جَرِّهِ/;
function checkTerminology(text,label,requireAgreement){
  if(forbiddenJarrSign.test(text))throw new Error(`Terminology: ${label} uses جَرّ sign-wording (project uses خفض)`);
  // Remove the construction name «جار ومجرور» in any case ending before checking for a bare مجرور case-label.
  const bare=stripDia(text).replace(/(?:ال)?جارا?\s*و(?:ال)?مجرورا?/g,'');
  if(/مجرور/.test(bare))throw new Error(`Terminology: ${label} uses مجرور as a case label (project uses مخفوض)`);
  if(requireAgreement){
    for(const [sign,state] of [['رَفْعِهِ','مَرْفُوع'],['نَصْبِهِ','مَنْصُوب'],['خَفْضِهِ','مَخْفُوض'],['جَزْمِهِ','مَجْزُوم']]){
      if(text.includes('عَلَامَةُ '+sign))assert(text.includes(state),`Terminology: ${label} has «علامة ${sign}» without matching state «${state}»`);
    }
  }
}
// Definition simple text + expanded text + example iʿrāb.
for(const item of allDefs){
  checkTerminology(item.ar,`def «${item.enTerm}» ar`,false);
  checkTerminology(item.detailsAr,`def «${item.enTerm}» detailsAr`,false);
  for(const ex of item.examples){checkTerminology(ex.iraabAr,`def «${item.enTerm}» example iʿrāb`,true);terminologyCases++;}
}
// A sample of production exercises' rendered Arabic iʿrāb.
elements.startFilter.value='any';elements.formFilter.value='any';elements.stateFilter.value='any';elements.signFilter.value='any';
for(let i=0;i<400;i++){
  context.nahwGenerate();
  const ex=api.currentExercise();
  for(const tk of ex.tokens){checkTerminology(tk.ar,`exercise token`,false);if(tk.phraseAr)checkTerminology(tk.phraseAr,'exercise phrase',false);}
  terminologyCases++;
}
// The “Why?” explanations are learner-facing too, so they obey the same khafḍ terminology:
// never مجرور as a case label, never عَلَامَةُ جَرِّهِ. «جَارٌّ وَمَجْرُورٌ» stays valid as a construction name.
elements.startFilter.value='any';elements.formFilter.value='any';elements.stateFilter.value='any';elements.signFilter.value='any';
let whyTerminologyLines=0;
for(let i=0;i<400;i++){
  context.nahwGenerate();
  const ex=api.currentExercise();
  for(const tk of ex.tokens){
    tk.why.ar.forEach(line=>{checkTerminology(line,`why «${tk.word}»`,false);whyTerminologyLines++;});
    if(tk.phraseWhy)tk.phraseWhy.ar.forEach(line=>{checkTerminology(line,`construction why «${tk.word}»`,false);whyTerminologyLines++;});
  }
  terminologyCases++;
}
console.log(`Terminology audit passed: ${terminologyCases} checks over definitions, examples, production exercises, and ${whyTerminologyLines} Why-explanation lines.`);

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

const finalResults={
  ...stats,nounEntries,totalVerbFamilies,stressPasses,
  fiveVerbFormCases,fiveVerbExerciseCases,regularVerbMoodCases,nounDeclensionCases,
  deterministicStructureCases:deterministicStructures.length,validatorFaultCases,sourceAuthorizationAttackCases,
  pastVerbCases,pastAdversarialCases,presentVerbCases,presentAdversarialCases,presentHistoryCases,presentPresentationRepairCases,d2RoundTripCases,phase2PersonPresentationRepairCases,unsafeDerivedGuardCases,
  legacyV3PositiveCases,legacyV3AdversarialCases,legacyV3RepersistenceCases,phase2CoordinatedHistoryCases,phase2DowngradeAttackCases,
  coordinatedHistoryAttackCases,samePersonIdentityAttackCases,presentationRepairCases,semanticCompatibilityCases,
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
};

if(auditOutput){
  const registryEntries=Object.entries(api.SOURCE_REGISTRY);
  const rules=registryEntries.map(([ruleId,entry])=>({
    ruleId,
    topic:entry.topic,
    productionStatus:entry.productionEnabled?'enabled':'disabled',
    verificationStatus:entry.status,
    primarySource:entry.primarySource,
    secondarySource:entry.secondarySources,
    conditions:entry.conditions,
    exceptions:entry.exceptions,
    dependentTemplates:[...(templateSourceDependencies.get(ruleId)||[])].sort(),
    dependentTests:[...(testSourceDependencies.get(ruleId)||[])].sort(),
    executionCount:api.grammarDiagnostics.validByRule[ruleId]||0
  }));
  const sourceAudit={
    schemaVersion:1,
    generatedAt:new Date().toISOString(),
    applicationFile:file,
    authorityOrder:[
      'Al-Tuḥfah al-Saniyyah bi-Sharḥ al-Muqaddimah al-Ājurrūmiyyah (primary and final curriculum authority)',
      'Sharḥ Ibn ʿAqīl ʿalā Alfiyyat Ibn Mālik (secondary confirmation)',
      'Existing code, tests, and prior assumptions (never source authority)'
    ],
    summary:{
      totalRegistryRules:rules.length,
      enabledProductionRules:rules.filter(rule=>rule.productionStatus==='enabled').length,
      verifiedDirectlyAgainstTuhfah:rules.filter(rule=>rule.productionStatus==='enabled'&&rule.primarySource).length,
      additionallyConfirmedByIbnAqil:rules.filter(rule=>rule.secondarySource.length).length,
      disabledRules:rules.filter(rule=>rule.productionStatus==='disabled').length,
      unverifiedEnabledRules:rules.filter(rule=>rule.productionStatus==='enabled'&&!api.isSourceAuthorized(rule.ruleId)).length,
      correctedRuleExplanationOrLexicalGroups:7,
      productionTemplates:api.templates.length,
      glossaryDefinitions:definitionItems.length,
      nounEntries,
      verbFamilies:totalVerbFamilies
    },
    corrections:[
      {id:'C01',area:'Prepositional/adverbial khabar',before:'The phrase itself was labeled شِبْهُ جُمْلَةٍ فِي مَحَلِّ رَفْعٍ خَبَرٌ.',after:'The expression is attached to an omitted khabar: مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٍ.',primarySource:{book:'Al-Tuḥfah al-Saniyyah',pdfPages:[103,104,161,167]}},
      {id:'C02',area:'Genitive terminology',before:'Production explanations preferred جَرّ / مَجْرُور / حَرْفُ جَرٍّ.',after:'Production word-level explanations now use Al-Tuḥfah’s الْخَفْضُ / مَخْفُوضٌ / حَرْفُ خَفْضٍ.',primarySource:{book:'Al-Tuḥfah al-Saniyyah',pdfPages:[13,174,175]}},
      {id:'C03',area:'Grammatical causes',before:'Several noun-role explanations named only the role and case.',after:'Mubtadaʾ, khabar, object, iḍāfah, inna, and kāna explanations now name the verified governing cause.',primarySource:{book:'Al-Tuḥfah al-Saniyyah',pdfPages:[19,85,86,105,106,109,140,141,175]}},
      {id:'C04',area:'Meaning of laʿalla',before:'The particle was described only as tarajjī.',after:'Its description now includes tarajjī and tawaqquʿ.',primarySource:{book:'Al-Tuḥfah al-Saniyyah',pdfPages:[110]}},
      {id:'C05',area:'Broken-plural scope',before:'Fourteen definite diptote-pattern plurals were stored in a table whose source rule claimed diptotes were excluded.',after:'Those entries and dependent object lists were replaced by fully declinable broken plurals, keeping the declared production scope truthful.',primarySource:{book:'Al-Tuḥfah al-Saniyyah',pdfPages:[62,63]}},
      {id:'C06',area:'Verb transitivity and object semantics',before:'Several broad object groups allowed semantically unsafe pairings; ظَنَّ was also used as though its ordinary two-object construction were a simple one-object verb.',after:'Object pools were narrowed and the unsafe one-object ظَنَّ record was replaced by قَيَّمَ.',primarySource:null,note:'Lexical audit; not attributed to the grammar books.'},
      {id:'C07',area:'Lexical forms and meanings',before:'وَصَلَ was glossed as direct-object “connect,” مَسَحَ as unqualified “scan,” زَادَ as a uniformly transitive “increase,” and الْخُضْرَةُ as “vegetables.”',after:'Production now uses وَصَّلَ “connect,” مَسَحَ “wipe,” ضَاعَفَ “double,” and الْخُضَارُ “vegetables.”',primarySource:null,note:'Lexical audit; not attributed to the grammar books.'}
    ],
    lexicalAudit:{
      grammarSourceStatus:'The inflection categories and generated endings are grammar-source verified.',
      lexicalStatus:'Lexical spelling, vowel patterns, meanings, and transitivity were reviewed separately and are not falsely attributed to the two grammar books.',
      nounEntriesChecked:nounEntries,
      verbFamiliesChecked:totalVerbFamilies,
      correctedDiptotePatternEntries:14,
      correctedOrNarrowedVerbRecords:48,
      remainingUnsupportedMorphologicalExceptions:0,
      duplicateNounMeanings:0,
      duplicateVerbMeanings:0
    },
    glossary:{definitionCount:definitionItems.length,allHavePrimarySourcePages:definitionItems.every(item=>item.source?.pdfPages?.length)},
    rules,
    intentionallyDisabledMaterial:[...api.GRAMMAR_COVERAGE_MATRIX.deliberatelyNotGenerated,'generic unverified particle fallback'],
    unverifiedQueue:[
      {topic:'Generic particle fallback',status:'disabled',reason:'Every particle needs a specific verified rule.'},
      ...api.GRAMMAR_COVERAGE_MATRIX.deliberatelyNotGenerated.map(topic=>({topic,status:'not-production-verified',reason:'Outside the current source-locked production scope.'}))
    ],
    tests:finalResults
  };
  fs.mkdirSync(require('node:path').dirname(auditOutput),{recursive:true});
  fs.writeFileSync(auditOutput,JSON.stringify(sourceAudit,null,2)+'\n','utf8');
}

console.log(JSON.stringify(finalResults,null,2));
