// A pinhole projection with a horizontal viewpoint and three physical depths.
// World arc radii scale with depth, so all three project to the same radius.
export const ALIGNMENT_VIEW=25;
export const DEPTHS=Object.freeze([200,320,480]);
const FOCAL=240;
export function parallaxPose(value){
  const view=Number.isFinite(value)?Math.max(-100,Math.min(100,value)):0;
  const offsets=DEPTHS.map(depth=>(ALIGNMENT_VIEW-view)*FOCAL/depth);
  return {view,offsets,aligned:view===ALIGNMENT_VIEW};
}
export function mountParallax(section){
  const launch=section.querySelector('[data-parallax-launch]'),back=section.querySelector('[data-parallax-return]');
  const study=section.querySelector('.parallax-study'),slider=study.querySelector('input'),output=study.querySelector('output');
  const layers=[...study.querySelectorAll('[data-depth]')],reset=study.querySelector('[data-parallax-reset]');
  function update(){
    const p=parallaxPose(Number(slider.value));
    layers.forEach((layer,i)=>layer.setAttribute('transform','translate('+p.offsets[i].toFixed(3)+' 0)'));
    output.value=p.view+' · '+(p.aligned?'Aligned':'Misaligned');
    study.dataset.aligned=String(p.aligned);
  }
  function open(){
    study.hidden=false;section.dataset.study='parallax';update();back.focus({preventScroll:true});
  }
  function close(){
    delete section.dataset.study;study.hidden=true;launch.focus({preventScroll:true});
  }
  function restore(){slider.value='0';update();slider.focus({preventScroll:true})}
  function key(e){if(e.key==='Escape'&&!study.hidden){e.preventDefault();close()}}
  launch.addEventListener('click',open);back.addEventListener('click',close);
  slider.addEventListener('input',update);reset.addEventListener('click',restore);section.addEventListener('keydown',key);
  launch.hidden=false;update();
  return {dispose(){launch.removeEventListener('click',open);back.removeEventListener('click',close);slider.removeEventListener('input',update);reset.removeEventListener('click',restore);section.removeEventListener('keydown',key)}};
}
