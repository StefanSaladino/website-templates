try {
const [components, treatments] = await Promise.all([
  fetch('./data/components.json?v20261120h',{cache:'no-store'}).then(response => { if(!response.ok) throw new Error('Could not load designs'); return response.json(); }),
  fetch('./data/mobile-treatments.json?v20261120h',{cache:'no-store'}).then(response => { if(!response.ok) throw new Error('Could not load phone layouts'); return response.json(); })
]);
const treatmentMap = new Map(treatments.map(item => [item.id,item]));
const examples = new Map(components.filter(item => item.previewRoute && item.status !== 'draft').map(item => [item.id,item]));
const requested = new URLSearchParams(location.search).get('id') || 'NAV-03';
const design = examples.get(requested) || examples.values().next().value;
if(!design) throw new Error('No preview examples are available');
const loading = document.querySelector('#review-loading');
const errorPanel = document.querySelector('#review-error');
const alternativeId = (design.mobileTreatmentIds || []).find(id => treatmentMap.has(id) && treatmentMap.get(id).status !== 'draft');
const alternative = alternativeId ? treatmentMap.get(alternativeId) : null;
const title = document.querySelector('#review-title');
const frame = document.querySelector('#review-frame');
const iframe = document.querySelector('#review-iframe');
const viewport = document.querySelector('#review-viewport');
const shell = document.querySelector('#review-frame-shell');
const viewStatus = document.querySelector('#review-view-status');
const viewTip = document.querySelector('#review-tip');
const panControls = document.querySelector('#review-pan-controls');
const panLeft = document.querySelector('#review-pan-left');
const panRight = document.querySelector('#review-pan-right');
const replayHighlight = document.querySelector('#review-highlight');
const highlightFeedback = document.querySelector('#review-highlight-feedback');
const spotlight=document.querySelector('#review-spotlight');
const stage=document.querySelector('.review-stage');
const phoneChoices = document.querySelector('#review-mobile-choices');
const alternateChoice = document.querySelector('#review-alt-choice');
const sizes = {desktop:{width:1440,height:900,name:'computer'}, tablet:{width:768,height:900,name:'tablet'}, phone:{width:390,height:780,name:'phone'}};
const deviceControls = [...document.querySelectorAll('input[name=device]')];
const zoomControls = [...document.querySelectorAll('input[name=zoom]')];
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const selectedValue = name => document.querySelector('input[name='+name+']:checked').value;
const focus = design.showcase || {};
const focusId = focus.focusAnchor || null;
// Never add section hashes to iframe URLs: lazy iframe fragment navigation can
// unexpectedly scroll the containing showroom as several examples load.
const failureLink = document.querySelector('#review-error a');
if(failureLink) failureLink.href = './review.html?id='+encodeURIComponent(design.id)+'&v20261120h';
title.textContent = focus.focus || design.title;
document.title = (focus.focus || design.title) + ' — Explore design';
document.querySelector('#review-id').textContent = 'Example '+design.id+' · Still in development';
document.querySelector('#review-component-label').textContent = focus.label || 'Website section';
document.querySelector('#review-focus-summary').textContent = focus.summary || design.exampleContext;
document.querySelector('#review-about-text').textContent = focus.explain || focus.summary || design.exampleContext;
document.querySelector('#review-best-for-reason').textContent = focus.fitReason || 'This layout may suit businesses that want to present this part of a website clearly.';
const bestForList = document.querySelector('#review-best-for-list');
for(const useCase of focus.bestFor || []){
  const li = document.createElement('li');
  li.textContent = useCase;
  bestForList.append(li);
}
document.querySelector('#review-phone-text').textContent = focus.mobile || 'This design changes to fit smaller screens.';
if(alternative){
  alternateChoice.hidden = false;
  document.querySelector('#review-alt-name').textContent = 'Style 2 · '+alternative.title;
}
const defaultDevice = window.innerWidth < 640 ? 'phone' : 'desktop';
document.querySelector('input[name=device][value='+defaultDevice+']').checked = true;
let lastDevice = null, lastZoom = null;
function updatePanButtons(){
  panLeft.disabled = viewport.scrollLeft <= 2;
  panRight.disabled = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 2;
}
function sizeFrame(){
  const device = selectedValue('device'), zoom = selectedValue('zoom');
  const preset = sizes[device];
  const available = Math.max(1,viewport.clientWidth - 2);
  const scale = zoom === 'fit' ? Math.min(1,available/preset.width) : 1;
  frame.dataset.device = device;
  frame.dataset.zoom = zoom;
  frame.style.width = preset.width+'px';
  frame.style.height = preset.height+'px';
  frame.style.transform = 'scale('+scale+')';
  shell.style.width = (preset.width*scale)+'px';
  shell.style.height = (preset.height*scale)+'px';
  const requiresPan = zoom === 'actual' && preset.width > available + 3;
  viewStatus.textContent = 'Showing the '+preset.name+' version';
  viewTip.textContent = (requiresPan
    ? 'You are looking at a close-up. Use the buttons below or swipe left and right to see more.'
    : zoom === 'actual'
      ? 'You are seeing the design at its normal size. You can interact with the example below.'
      : 'The full '+preset.name+' design is fitted into this space. Choose “Look closer” for more detail.')+' Use “Highlight this section” to find the featured part.';
  panControls.hidden = !requiresPan;
  const deviceChanged=lastDevice!==null && lastDevice!==device;
  if(deviceChanged && highlightTarget && highlightWindow){
    requestAnimationFrame(()=>positionInsideFrame(highlightTarget.ownerDocument,highlightWindow,highlightTarget));
  }
  if(lastDevice !== device || lastZoom !== zoom) viewport.scrollLeft = 0;
  lastDevice = device; lastZoom = zoom;
  updatePanButtons();
  if(!spotlight.hidden)requestAnimationFrame(updateSpotlightGeometry);
}
function render(){
  const device = selectedValue('device');
  const phoneStyle = device === 'phone' ? selectedValue('mobile') : 'default';
  const url = './previews/'+design.id+'/index.html'+(phoneStyle === 'alternate' && alternative ? '?mobile='+encodeURIComponent(alternative.id) : '');
  if(iframe.getAttribute('src') !== url) {
    loading.hidden = false;
    spotlight.hidden=true;
    spotlight.classList.remove('review-spotlight--active');
    replayHighlight.disabled=true;
    highlightTarget=null;
    highlightWindow=null;
    highlightFeedback.textContent='';
    iframe.src = url;
  }
  document.querySelector('#review-open').href = url;
  phoneChoices.hidden = device !== 'phone' || !alternative;
  sizeFrame();
}
[...deviceControls, ...document.querySelectorAll('input[name=mobile]'), ...zoomControls].forEach(input => input.addEventListener('change',render));
panLeft.addEventListener('click',()=>viewport.scrollBy({left:-Math.max(180,viewport.clientWidth*.75),behavior:prefersReducedMotion.matches?'instant':'smooth'}));
panRight.addEventListener('click',()=>viewport.scrollBy({left:Math.max(180,viewport.clientWidth*.75),behavior:prefersReducedMotion.matches?'instant':'smooth'}));
viewport.addEventListener('scroll',()=>{
  updatePanButtons();
  if(!spotlight.hidden)updateSpotlightGeometry();
},{passive:true});
window.addEventListener('scroll',()=>{
  if(!spotlight.hidden)updateSpotlightGeometry();
},{passive:true});
if('ResizeObserver' in window) new ResizeObserver(sizeFrame).observe(viewport);
else window.addEventListener('resize',sizeFrame);
// Position the embedded document itself without changing the host page's scroll position.
// Avoid helpers that scroll ancestor documents; move only the inner preview.
let showcasedOnce = false;
let highlightTarget = null;
let highlightWindow = null;
let highlightClear = null;
function positionInsideFrame(doc, win, target) {
  if(!target)return;
  const root=doc.documentElement;
  const previous=root.style.scrollBehavior;
  root.style.scrollBehavior='auto';
  const header=doc.querySelector('header');
  const sticky=header && ['sticky','fixed'].includes(win.getComputedStyle(header).position);
  const offset=target.tagName==='HEADER'?0:(sticky?Math.min(100,header.getBoundingClientRect().height+16):16);
  const y=Math.max(0,Math.round(target.getBoundingClientRect().top+win.scrollY-offset));
  win.scrollTo(0,y);
  root.style.scrollBehavior=previous;
}
// Paint the overlay in the PARENT, at true screen pixels (not CSS pixels
// subsequently shrunk with the desktop iframe). Clip tall sections to the
// visible part of the preview so every highlight has four visible sides.
function updateSpotlightGeometry(){
  if(!highlightTarget||!highlightWindow||spotlight.hidden)return false;
  const stageRect=stage.getBoundingClientRect();
  const viewRect=viewport.getBoundingClientRect();
  const frameRect=iframe.getBoundingClientRect();
  const targetRect=highlightTarget.getBoundingClientRect();
  const scale=frameRect.width/highlightWindow.innerWidth;
  if(!Number.isFinite(scale)||scale<=0)return false;
  const clipLeft=Math.max(stageRect.left+5,viewRect.left+5,frameRect.left+3);
  const clipRight=Math.min(stageRect.right-5,viewRect.right-5,frameRect.right-3);
  const clipTop=Math.max(stageRect.top+5,viewRect.top+5,frameRect.top+3);
  const clipBottom=Math.min(stageRect.bottom-5,viewRect.bottom-5,frameRect.bottom-3);
  const left=Math.max(clipLeft,frameRect.left+targetRect.left*scale);
  const right=Math.min(clipRight,frameRect.left+targetRect.right*scale);
  let top=Math.max(clipTop,frameRect.top+targetRect.top*scale);
  let bottom=Math.min(clipBottom,frameRect.top+targetRect.bottom*scale);
  // A compact bar can shrink below 12 real pixels on a phone when a
  // desktop preview is fitted. Give the overlay an unclipped visible stroke.
  if(bottom>top && bottom-top<18){
    const center=(top+bottom)/2;
    top=Math.max(clipTop,center-10);
    bottom=Math.min(clipBottom,center+10);
    if(bottom-top<12){
      if(top<=clipTop+1)bottom=Math.min(clipBottom,top+12);
      else top=Math.max(clipTop,bottom-12);
    }
  }
  if(right-left<14||bottom-top<12){
    spotlight.hidden=true;
    return false;
  }
  spotlight.style.left=Math.round(left-stageRect.left)+'px';
  spotlight.style.top=Math.round(top-stageRect.top)+'px';
  spotlight.style.width=Math.round(right-left)+'px';
  spotlight.style.height=Math.round(bottom-top)+'px';
  spotlight.classList.toggle('review-spotlight--compact',bottom-top<55);
  spotlight.classList.toggle('review-spotlight--bottom',clipBottom-bottom<35);
  return true;
}
function flashShowcase({reveal=false}={}){
  if(!highlightTarget||!highlightWindow)return false;
  const target=highlightTarget,win=highlightWindow;
  if(reveal)positionInsideFrame(target.ownerDocument,win,target);
  if(highlightClear!==null)win.clearTimeout(highlightClear);
  target.classList.remove('ba-showcase-pulse');
  void target.offsetWidth;
  target.classList.add('ba-showcase-pulse');
  spotlight.hidden=false;
  spotlight.classList.remove('review-spotlight--active');
  // Re-layout after scrolling, then restart a visible, 2.4-second frame.
  const valid=updateSpotlightGeometry();
  if(valid){
    void spotlight.offsetWidth;
    spotlight.classList.add('review-spotlight--active');
    requestAnimationFrame(updateSpotlightGeometry);
  }
  highlightClear=win.setTimeout(()=>{
    target.classList.remove('ba-showcase-pulse');
    spotlight.classList.remove('review-spotlight--active');
    spotlight.hidden=true;
    highlightClear=null;
  },2450);
  showcasedOnce=true;
  return valid;
}
replayHighlight.addEventListener('click',()=>{
  if(flashShowcase({reveal:true})){
    highlightFeedback.textContent='Highlighted the section shown in this example.';
  }else{
    highlightFeedback.textContent='The example is still loading. Try again shortly.';
  }
});
function connectShowcase() {
  let doc,win;
  try{doc=iframe.contentDocument;win=iframe.contentWindow;}catch{return;}
  if(!doc||!win||!doc.body)return;
  const target=focusId?doc.getElementById(focusId):null;
  if(!target)return;
  highlightWindow=win;
  highlightTarget=target;
  win.addEventListener('scroll',()=>{if(!spotlight.hidden)updateSpotlightGeometry();},{passive:true});
  win.addEventListener('resize',()=>{if(!spotlight.hidden)updateSpotlightGeometry();},{passive:true});
  showcasedOnce=false;
  replayHighlight.disabled=false;
  highlightFeedback.textContent='';
  positionInsideFrame(doc,win,target);
  const style=doc.createElement('style');
  style.textContent=[
    '@keyframes baShowcasePulse{0%,100%{outline-color:transparent;box-shadow:none}15%,72%{outline-color:#ffcf58;box-shadow:inset 0 0 0 9px rgba(255,207,88,.94),0 0 0 4px rgba(67,40,11,.62)}}',
    '.ba-showcase-pulse{outline:7px solid transparent!important;outline-offset:-7px!important;animation:baShowcasePulse 2.4s ease-in-out 1!important;}',
    '@media(prefers-reduced-motion:reduce){.ba-showcase-pulse{animation:none!important;outline-color:#ffba4c!important;box-shadow:inset 0 0 0 9px rgba(255,207,88,.94)!important}}'
  ].join('\n');
  doc.head.append(style);
  const onInitialInteraction=()=>{
    if(showcasedOnce)return;
    flashShowcase();
  };
  // The first real click/touch/key action highlights without blocking the action.
  doc.addEventListener('pointerdown',onInitialInteraction,{capture:true,once:true});
  doc.addEventListener('keydown',event=>{
    if(['Shift','Control','Alt','Meta'].includes(event.key))return;
    onInitialInteraction();
  },{capture:true});
}
iframe.addEventListener('load',()=>{
  loading.hidden=true;
  connectShowcase();
});
render();
} catch(error) {
 console.error('Component review could not initialize',error);
 const loading=document.querySelector('#review-loading');
 if(loading)loading.hidden=true;
 const panel=document.querySelector('#review-error');
 if(panel)panel.hidden=false;
 const title=document.querySelector('#review-title');
 if(title)title.textContent='This design could not be loaded';
 const summary=document.querySelector('#review-focus-summary');
 if(summary)summary.textContent='Please try again. The other designs are available from All designs.';
}
