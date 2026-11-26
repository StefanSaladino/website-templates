// Four original modular glyphs; only their position and scale change.
const layouts={
 wordmark:{label:'01 / Wordmark',description:'horizontal wordmark',poses:[[44,70,1],[151,70,1],[258,70,1],[365,70,1]]},
 stack:{label:'02 / Stack',description:'two by two stacked mark',poses:[[150,14,.94],[246,14,.94],[150,132,.94],[246,132,.94]]},
 poster:{label:'03 / Poster',description:'asymmetric poster with enlarged F',poses:[[42,30,1.8],[206,82,.9],[288,82,.9],[370,82,.9]]}
};
export function formPose(name){
 const key=Object.hasOwn(layouts,name)?name:'wordmark',layout=layouts[key];
 return {key,label:layout.label,description:layout.description,poses:layout.poses.map(p=>[...p])};
}
export function mountForm(section){
 const launch=section.querySelector('[data-form-launch]'),study=section.querySelector('.form-study');
 const back=study.querySelector('[data-form-return]'),output=study.querySelector('output'),art=study.querySelector('svg');
 const glyphs=[...study.querySelectorAll('[data-glyph]')],buttons=[...study.querySelectorAll('[data-form-layout]')];
 let current='wordmark';
 function select(name){
  const p=formPose(name);current=p.key;
  glyphs.forEach((g,i)=>{const [x,y,s]=p.poses[i];g.style.transform='translate('+x+'px, '+y+'px) scale('+s+')'});
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.formLayout===current)));
  output.value=p.label;art.setAttribute('aria-label','FORM modular glyphs: '+p.description);study.dataset.layout=current;
 }
 function open(){study.hidden=false;section.dataset.study='form';select(current);back.focus({preventScroll:true})}
 function close(){delete section.dataset.study;study.hidden=true;launch.focus({preventScroll:true})}
 function choose(e){select(e.currentTarget.dataset.formLayout)}
 function key(e){if(e.key==='Escape'&&!study.hidden){e.preventDefault();close()}}
 launch.addEventListener('click',open);back.addEventListener('click',close);
 buttons.forEach(b=>b.addEventListener('click',choose));section.addEventListener('keydown',key);
 launch.hidden=false;select(current);
 return {dispose(){launch.removeEventListener('click',open);back.removeEventListener('click',close);buttons.forEach(b=>b.removeEventListener('click',choose));section.removeEventListener('keydown',key)}};
}
