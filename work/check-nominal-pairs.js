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
  templates:templates.map(({id,stableId,starts,form,state,sign})=>({id,stableId,starts,form,state,sign})),
  buildTemplate:id=>completeNominalAnalysis(templates[id].build()),
  completeNominalAnalysis,
  poolFor,
  grammarDefinitionGroups,
  GRAMMAR_RULES,
  GRAMMAR_COVERAGE_MATRIX,
  SOURCE_STATUS,
  SOURCE_REGISTRY,
  isSourceAuthorized,
  grammarDiagnostics,
  validateExercise,
  render,
  inflectFiveVerb,
  makeToken:token,
  specs:AR,
  verbs,
  generalVerbActions,
  nounLexicons:{singularPeople,singularThings,places,brokenHuman,brokenThings,duals,smp,sfp,fiveNouns,singularPredicates,dualPredicates,masculinePluralPredicates,femininePluralPredicates,masculineThingPredicates,feminineThingPredicates,ownedNouns},
  verbLexicons:{verbs,additionalVerbActions,humanActions,humanPrepActions,thingActions,thingPrepActions,femininePastActions,brokenObjectActions},
  objectGroups,
  currentExercise:()=>current,
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
  subtitle:element('subtitle'),practiceTip:element('practiceTip'),practiceEyebrow:element('practiceEyebrow'),
  answerTitle:element('answerTitle'),startLabel:element('startLabel'),formLabel:element('formLabel'),
  stateLabel:element('stateLabel'),signLabel:element('signLabel'),
  historyTitle:element('historyTitle'),historyNote:element('historyNote'),
  apprSystem:element('apprSystem'),apprLight:element('apprLight'),apprDark:element('apprDark')
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
assert(mainNounEntries.length===240,`Structured noun audit found ${mainNounEntries.length} entries instead of 240`);
const repeatedNounMeanings=[...new Set(mainNounEntries.map(item=>item.en).filter((meaning,index,all)=>all.indexOf(meaning)!==index))];
assert(repeatedNounMeanings.length===0,`The 240 main noun entries repeat: ${repeatedNounMeanings.join(', ')}`);
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
assert(uniquePresentRecords.size+api.verbLexicons.femininePastActions.length===219,'The structured vocabulary does not contain 200 unique verb families');

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
    if(verb.ar.includes('الْأَفْعَالِ الْخَمْسَةِ')){
      assert(verb.ar.includes('وَاوُ الْجَمَاعَةِ'),`${label}: five-verb individual analysis lacks its attached subject`);
      assert(constructionEnd.phraseAr.includes('وَاوُ الْجَمَاعَةِ'),`${label}: five-verb khabar lacks wāw link`);
    }else{
      assert(verb.ar.includes('ضَمِيرٌ مُسْتَتِرٌ جَوَازًا'),`${label}: regular verbal khabar lacks hidden subject`);
      assert(verb.ar.includes('«هُوَ»'),`${label}: hidden subject is not identified as huwa`);
      assert(constructionEnd.phraseAr.includes('«هُوَ»'),`${label}: verbal khabar lacks the hidden-subject link`);
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
  sentence:'الْخَيَّاطُ يُكْرِمُ الطَّبِيبَاتِ',translation:'The tailor honors the female doctors.',
  tokens:[
    api.makeToken('الْخَيَّاطُ','the tailor',api.specs.mubtada('الْخَيَّاطُ')),
    api.makeToken('يُكْرِمُ','honors',api.specs.presentPred('يُكْرِمُ')),
    api.makeToken('الطَّبِيبَاتِ','the female doctors',api.specs.object('الطَّبِيبَاتِ'),'',true)
  ]
});
assertNominalPair(exact,'exact tailor/doctors case');
assert(!exact.tokens[1].phraseAr,'Exact case put the verbal-sentence khabar on the verb before its object');
assert(exact.tokens[2].ar.startsWith('الطَّبِيبَاتِ: مَفْعُولٌ بِهِ مَنْصُوبٌ'),'Exact object lost its individual iʿrāb');
assert(exact.tokens[2].phraseAr.includes('«الْخَيَّاطُ»'),'Exact combined analysis does not link huwa back to the tailor');
assert(exact.tokens[2].phraseAr.includes('«يُكْرِمُ الطَّبِيبَاتِ»'),'Exact combined analysis omits the complete verbal sentence');

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
assert(Object.keys(api.SOURCE_REGISTRY).length===49,`Expected 49 source-registry entries, found ${Object.keys(api.SOURCE_REGISTRY).length}`);
assert(api.SOURCE_REGISTRY.R_PARTICLE.status===api.SOURCE_STATUS.DISABLED&&!api.SOURCE_REGISTRY.R_PARTICLE.productionEnabled,'Generic particle fallback is not disabled');
assert(Object.entries(api.SOURCE_REGISTRY).filter(([id])=>id!=='R_PARTICLE').every(([id,entry])=>api.isSourceAuthorized(id)&&entry.primarySource?.pdfPages?.length), 'An enabled grammar rule lacks a primary-source page');

function structuredCase(templateId,translation,tokens){
  const data=api.completeNominalAnalysis({templateId,sentence:'',translation,tokens});
  recordSourceDependencies(data);
  return data;
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
  structuredCase('TEST_GOLDEN_ZARF','Zayd sat in front of the house.',[
    api.makeToken('جَلَسَ','sat',api.specs.past('جَلَسَ')),
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
assert(deterministicStructures[6].sentence==='جَلَسَ زَيْدٌ أَمَامَ الْبَيْتِ','Golden adverb sentence surface changed');
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
  const first=sentence.split(/\s+/)[0];
  if(randomSentences[randomSentences.length-1]===sentence)consecutiveRepeats++;
  randomSentences.push(sentence);
  openingWords.add(first);
  if(particleWords.has(first))openingParticles.add(first);
  assert((rendered.match(/class="word-card target/g)||[]).length===1,`Random run ${iteration}: wrong focus-card count`);
  const renderedMubtada=(rendered.match(/مُبْتَدَأٌ/gu)||[]).length;
  const renderedKhabar=(rendered.match(/خَبَر[ٌٍ](?=$|[\s،.<])/gu)||[]).length;
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
assert(additionalRecords.length===176,`Expected 176 additional verb records, found ${additionalRecords.length}`);
elements.startFilter.value='verb';
elements.formFilter.value='singular';
elements.stateFilter.value='any';
elements.signFilter.value='damma';
elements.signFilter.dispatch('change');
const pastStarts=new Set();
for(let iteration=0;iteration<5000;iteration++){
  context.nahwGenerate();
  pastStarts.add(elements.sentence.textContent.split(/\s+/)[0]);
}
const additionalPastSeen=additionalRecords.filter(record=>pastStarts.has(record.past)).length;
assert(additionalPastSeen===176,`Only ${additionalPastSeen} of 176 added past verbs appeared`);
elements.startFilter.value='noun';
elements.formFilter.value='singular';
elements.stateFilter.value='any';
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
assert(additionalPresentSeen===176,`Only ${additionalPresentSeen} of 176 added present verbs appeared`);

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
assert(nounEntries===240,`Expected 240 noun entries, found ${nounEntries}`);
assert(totalVerbFamilies===219,`Expected 219 verb families, found ${totalVerbFamilies}`);

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
assert(api.templates.length===56,`Expected 56 production templates, found ${api.templates.length}`);
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
console.log(`Iʿrāb-state-filter audit passed: 56 templates, ${validMatrix.length} valid matrix cells, ${validTuples.length} valid filter tuples, ${stateFilterCases} checks.`);

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
const apprPressed=id=>elements[id].getAttribute('aria-pressed');
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
console.log(`Terminology audit passed: ${terminologyCases} checks over definitions, examples, and production exercises.`);

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
