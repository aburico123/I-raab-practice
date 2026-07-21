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
  templates:templates.map(({id,starts,form,sign})=>({id,starts,form,sign})),
  buildTemplate:id=>completeNominalAnalysis(templates[id].build()),
  completeNominalAnalysis,
  poolFor,
  grammarDefinitionGroups
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
assert(definitionItems.length===58,`Expected 58 grammar definitions, found ${definitionItems.length}`);
assert(definitionItems.every(item=>item.arTerm&&item.enTerm&&item.ar&&item.en),'A grammar definition is incomplete');
assert(new Set(definitionItems.map(item=>item.arTerm)).size===definitionItems.length,'Two Arabic definition terms are duplicated');
assert(new Set(definitionItems.map(item=>item.enTerm)).size===definitionItems.length,'Two English definition terms are duplicated');
for(const required of ['Noun (ism)','Verb (fiʿl)','Particle (ḥarf)','Singular noun','Mubtadaʾ','Khabar','Direct object']){
  assert(definitionItems.some(item=>item.enTerm===required),`Missing required definition: ${required}`);
}
assert(elements.definitionsToggle.textContent==='Simple grammar definitions (58)','Definition count was not rendered');
assert((elements.definitionsList.innerHTML.match(/class="definition-card"/g)||[]).length===58,'Not every definition was rendered');
assert(elements.definitionsList.innerHTML.includes('التُّحْفَة')===false,'Source note was unexpectedly duplicated inside the definition list');
assert(html.includes('https://islamhouse.com/ar/books/334271'),'The Al-Tuhfah al-Saniyyah source link is missing');
elements.definitionsToggle.dispatch('click');
assert(elements.definitionsPanel.classList.contains('open'),'Definitions tab did not open its panel');
assert(elements.definitionsToggle.getAttribute('aria-expanded')==='true','Definitions tab did not expose its open state');

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
expectThrow('mubtada without khabar',{sentence:'زَيْدٌ',translation:'Zayd.',tokens:[{word:'زَيْدٌ',ar:'زَيْدٌ: مُبْتَدَأٌ مَرْفُوعٌ.',en:'mubtada'}]});
expectThrow('khabar without mubtada',{sentence:'قَائِمٌ',translation:'Standing.',tokens:[{word:'قَائِمٌ',ar:'قَائِمٌ: خَبَرٌ مَرْفُوعٌ.',en:'khabar'}]});
expectThrow('inna noun without khabar',{sentence:'إِنَّ زَيْدًا',translation:'Indeed Zayd.',tokens:[{word:'زَيْدًا',ar:'زَيْدًا: اسْمُ «إِنَّ» مَنْصُوبٌ.',en:'ism inna'}]});
expectThrow('delayed mubtada without fronted phrase',{sentence:'زَيْدٌ',translation:'Zayd.',tokens:[{word:'زَيْدٌ',ar:'زَيْدٌ: مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ.',en:'delayed mubtada'}]});

const exact=api.completeNominalAnalysis({
  sentence:'الْخَيَّاطُ يُكْرِمُ الطَّبِيبَاتِ',translation:'The tailor honors the female doctors.',
  tokens:[
    {word:'الْخَيَّاطُ',ar:'الْخَيَّاطُ: مُبْتَدَأٌ مَرْفُوعٌ.',en:'mubtada'},
    {word:'يُكْرِمُ',ar:'يُكْرِمُ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ.',en:'present verb'},
    {word:'الطَّبِيبَاتِ',ar:'الطَّبِيبَاتِ: مَفْعُولٌ بِهِ مَنْصُوبٌ.',en:'object'}
  ]
});
assertNominalPair(exact,'exact tailor/doctors case');
assert(exact.tokens[1].ar.includes('«الْخَيَّاطُ»'),'Exact case does not link huwa back to the tailor');

const exactFronted=api.completeNominalAnalysis({
  sentence:'فِي السُّوقِ مُعَلِّمٌ',translation:'There is a teacher in the market.',
  tokens:[
    {word:'فِي',ar:'فِي: حَرْفُ جَرٍّ مَبْنِيٌّ لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ.',en:'A preposition.'},
    {word:'السُّوقِ',ar:'السُّوقِ: اسْمٌ مَجْرُورٌ بِـ«فِي»، وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ الظَّاهِرَةُ عَلَى آخِرِهِ.',en:'A genitive noun.'},
    {word:'مُعَلِّمٌ',ar:'مُعَلِّمٌ: مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ، وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ عَلَى آخِرِهِ.',en:'A delayed mubtada.'}
  ]
});
assertNominalPair(exactFronted,'exact market/teacher case');
assert(exactFronted.tokens[0].ar.startsWith('فِي: حَرْفُ جَرٍّ'),'Exact fronted case lost the individual preposition analysis');
assert(exactFronted.tokens[0].ar.includes('فِي السُّوقِ: شِبْهُ جُمْلَةٍ'),'Exact fronted case omits the complete phrase');
assert(exactFronted.tokens[0].ar.includes('فِي مَحَلِّ رَفْعٍ خَبَرٌ مُقَدَّمٌ'),'Exact fronted case omits the fronted khabar');
assert(exactFronted.tokens[1].ar.includes('اسْمٌ مَجْرُورٌ بِـ«فِي»'),'Exact fronted case lost the governed noun analysis');
assert(exactFronted.tokens[2].ar.includes('مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ'),'Exact fronted case lost the delayed mubtada analysis');

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

console.log(JSON.stringify({
  ...stats,nounEntries,totalVerbFamilies,stressPasses,
  randomGenerations:randomSentences.length,uniqueRandomSentences,consecutiveRepeats,
  distinctOpeningWords:openingWords.size,distinctOpeningParticles:openingParticles.size,
  additionalPastSeen,additionalPresentSeen,
  stressDurationSeconds:Math.round((Date.now()-started)/1000)
},null,2));
