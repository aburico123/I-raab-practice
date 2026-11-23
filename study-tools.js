/* Application study aids; no additions to, or substitutions in, the lesson corpus. */
(() => {
 'use strict';
 const unique=(values,test)=>Array.isArray(values)?[...new Set(values.filter(test))]:[];
 const scopes=['whole','babs','chapters','saved'],filters=['all','quran','ordinary'];
 const matchFilter=(exercise,filter)=>filter==='all'||(filter==='quran'?!!exercise.quran:!exercise.quran);
 function create(babs,chapters){
  const active=new Map(chapters.flatMap(chapter=>chapter.book.flatMap((exercise,index)=>
   exercise.held?[]:[[exercise.id,{chapter,exercise,index}]])));
  const chapterIds=new Set(chapters.map(chapter=>chapter.id));
  const parent=new Map(babs.map(bab=>[bab.id,bab.parentId]));
  const have=id=>active.has(id);
  function normalize(value){
   const raw=value||{},cfg=raw.config||{};
   const config={scope:scopes.includes(cfg.scope)?cfg.scope:'whole',filter:filters.includes(cfg.filter)?cfg.filter:'all',
    babs:unique(cfg.babs,id=>parent.has(id)),chapters:unique(cfg.chapters,id=>chapterIds.has(id))};
   const saved=unique(raw.saved,have),old=raw.session;
   let session=null;
   if(old&&Array.isArray(old.queue)&&Number.isInteger(old.index)){
    const index=Math.max(0,Math.min(old.index,old.queue.length));
    // A saved-list test is a snapshot: an un-save does not cause a repeat or replace a draw.
    const allowed=config.scope==='saved'?null:new Set(pool(config,saved));
    const eligible=id=>have(id)&&matchFilter(active.get(id).exercise,config.filter)&&(!allowed||allowed.has(id));
    const queue=unique(old.queue,eligible);
    const cursor=unique(old.queue.slice(0,index),eligible).length;
    session={queue,index:cursor,revealed:queue[cursor]===old.queue[index]&&cursor<queue.length&&old.revealed===true};
   }
   return {config,saved,session};
  }
  function pool(config,saved){
   const {scope,filter}=config,selectedBabs=new Set(config.babs),selectedChapters=new Set(config.chapters);
   const savedIds=new Set(saved);
   return [...active].filter(([id,{chapter,exercise}])=>matchFilter(exercise,filter)&&(
    scope==='whole'||scope==='saved'&&savedIds.has(id)||scope==='chapters'&&selectedChapters.has(chapter.id)||
    scope==='babs'&&(selectedBabs.has(chapter.babId)||selectedBabs.has(parent.get(chapter.babId)))
   )).map(([id])=>id);
  }
  function start(config,saved,random=Math.random){
   const queue=pool(config,saved);
   for(let i=queue.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}
   return {queue,index:0,revealed:false};
  }
  return {active,normalize,pool,start};
 }
 const terms={
  rafSlot:{ar:'فِي مَحَلِّ رَفْعٍ',en:'In a nominative position',
   aliasesAr:['في محل رفع'],aliasesEn:['in the nominative syntactic position','in a nominative syntactic position','in the nominative position','in a nominative position','nominative slot','nominative syntactic position'],
   meaningAr:'لِلْكَلِمَةِ أَوِ التَّرْكِيبِ وَظِيفَةٌ تَقْتَضِي الرَّفْعَ، مِنْ غَيْرِ عَلَامَةِ رَفْعٍ فِي آخِرِهِ.',
   meaningEn:'A word or construction fills a nominative role without taking a nominative ending.',
   exampleAr:'هُوَ قَائِمٌ — «هُوَ» ضَمِيرٌ مَبْنِيٌّ فِي مَحَلِّ رَفْعٍ مُبْتَدَأٌ.',exampleEn:'Huwa qāʾimun: the fixed pronoun huwa fills the nominative position of the mubtadaʾ.'},
  mubtada:{ar:'مُبْتَدَأٌ',en:'Mubtadaʾ · nominal subject',
   aliasesAr:['مبتدأ','المبتدأ'],aliasesEn:['mubtadaʾ','nominal subject'],
   meaningAr:'الِاسْمُ الَّذِي نُخْبِرُ عَنْهُ فِي مِثْلِ هَذِهِ الْجُمْلَةِ الِاسْمِيَّةِ.',
   meaningEn:'In a basic nominal sentence, the noun or pronoun we say something about.',
   exampleAr:'زَيْدٌ قَائِمٌ — «زَيْدٌ» مُبْتَدَأٌ.',exampleEn:'Zaydun qāʾimun: Zayd is who the sentence is about.'},
  khabar:{ar:'خَبَرٌ',en:'Khabar · predicate',
   aliasesAr:['خبر','الخبر'],aliasesEn:['khabar','predicate'],
   meaningAr:'الْجُزْءُ الَّذِي يُخْبِرُ عَنِ الْمُبْتَدَإِ وَيُتِمُّ الْمَعْنَى.',
   meaningEn:'The part that tells us something about the mubtadaʾ and completes the statement.',
   exampleAr:'زَيْدٌ قَائِمٌ — «قَائِمٌ» خَبَرٌ.',exampleEn:'Zaydun qāʾimun: qāʾimun tells us that Zayd is standing.'},
  shibh:{ar:'شِبْهُ جُمْلَةٍ',en:'Shibh jumlah · prepositional or adverbial phrase',
   aliasesAr:['شبه جملة','شبه الجملة'],aliasesEn:['shibh jumlah','quasi-sentence','prepositional or adverbial phrase'],
   meaningAr:'جَارٌّ وَمَجْرُورٌ أَوْ ظَرْفٌ، وَلَيْسَ جُمْلَةً تَامَّةً.',
   meaningEn:'A prepositional phrase or an adverbial of time or place, not a complete clause.',
   exampleAr:'زَيْدٌ فِي الدَّارِ — «فِي الدَّارِ» شِبْهُ جُمْلَةٍ.',exampleEn:'Zaydun fī al-dāri: “in the house” is the prepositional phrase.'}
 };
 const mark=/[\u064b-\u0652\u0670]/u,word=/[\p{L}\p{M}\p{N}_]/u;
 const alternatives=Object.fromEntries(['ar','en'].map(lang=>[lang,Object.entries(terms).flatMap(([id,term])=>
  term[lang==='ar'?'aliasesAr':'aliasesEn'].map(alias=>[alias,id])).sort((a,b)=>b[0].length-a[0].length)]));
 // Offsets are in the original text. Retain combining marks and never cross word boundaries
 // or enter a quoted span, even when the renderer split it into several text nodes.
 function termRanges(text,lang){
  const input=[],starts=[],ends=[];
  for(let i=0;i<text.length;i++){
   const ch=text[i];
   if(lang==='ar'&&mark.test(ch)){if(ends.length)ends[ends.length-1]=i+1;continue;}
   const val=/\s/u.test(ch)?' ':ch.toLowerCase();
   if(val===' '&&input.at(-1)===' '){ends[ends.length-1]=i+1;continue;}
   input.push(val);starts.push(i);ends.push(i+1);
  }
  const normalized=input.join(''),quotes=[...text.matchAll(/«[^»]*»|﴿[^﴾]*﴾|“[^”]*”|"[^"]*"/gu)];
  const found=[];
  for(let i=0;i<normalized.length;i++){
   if(i&&word.test(normalized[i-1]))continue;
   for(const [alias,id] of alternatives[lang]||[]){
    const end=i+alias.length;
    if(!normalized.startsWith(alias,i)||end<normalized.length&&word.test(normalized[end]))continue;
    const start=starts[i],stop=ends[end-1];
    if(quotes.some(q=>start<q.index+q[0].length&&stop>q.index))continue;
    found.push({start,end:stop,id});i=end-1;break;
   }
  }
  return found;
 }
 window.MIFTAH_STUDY={create,terms,termRanges};
})();
