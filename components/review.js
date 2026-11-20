try {
const [components, treatments] = await Promise.all([
  fetch('./data/components.json?v20261120d',{cache:'no-store'}).then(response => { if(!response.ok) throw new Error('Could not load designs'); return response.json(); }),
  fetch('./data/mobile-treatments.json?v20261120d',{cache:'no-store'}).then(response => { if(!response.ok) throw new Error('Could not load phone layouts'); return response.json(); })
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
if(failureLink) failureLink.href = './review.html?id='+encodeURIComponent(design.id)+'&v20261120d';
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
  viewTip.textContent = requiresPan
    ? 'You are looking at a close-up. Use the buttons below or swipe left and right to see more.'
    : zoom === 'actual'
      ? 'You are seeing the design at its normal size. You can interact with the example below.'
      : 'The full '+preset.name+' design is fitted into this space. Choose “Look closer” for more detail.';
  panControls.hidden = !requiresPan;
  if(lastDevice !== device || lastZoom !== zoom) viewport.scrollLeft = 0;
  lastDevice = device; lastZoom = zoom;
  updatePanButtons();
}
function render(){
  const device = selectedValue('device');
  const phoneStyle = device === 'phone' ? selectedValue('mobile') : 'default';
  const url = './previews/'+design.id+'/index.html'+(phoneStyle === 'alternate' && alternative ? '?mobile='+encodeURIComponent(alternative.id) : '');
  if(iframe.getAttribute('src') !== url) {
    loading.hidden = false;
    iframe.src = url;
  }
  document.querySelector('#review-open').href = url;
  phoneChoices.hidden = device !== 'phone' || !alternative;
  sizeFrame();
}
[...deviceControls, ...document.querySelectorAll('input[name=mobile]'), ...zoomControls].forEach(input => input.addEventListener('change',render));
panLeft.addEventListener('click',()=>viewport.scrollBy({left:-Math.max(180,viewport.clientWidth*.75),behavior:prefersReducedMotion.matches?'instant':'smooth'}));
panRight.addEventListener('click',()=>viewport.scrollBy({left:Math.max(180,viewport.clientWidth*.75),behavior:prefersReducedMotion.matches?'instant':'smooth'}));
viewport.addEventListener('scroll',updatePanButtons,{passive:true});
if('ResizeObserver' in window) new ResizeObserver(sizeFrame).observe(viewport);
else window.addEventListener('resize',sizeFrame);
// Position the embedded document itself without changing the host page's scroll position.
// Using element.scrollIntoView() here can also scroll the outer document, so avoid it.
let showcaseFlashed=false;
function positionInsideFrame(doc, win, target){
  if(!target)return;
  const root=doc.documentElement;
  const previous=root.style.scrollBehavior;
  root.style.scrollBehavior='auto';
  const y=Math.max(0,Math.round(target.getBoundingClientRect().top+win.scrollY-(target.tagName==='HEADER'?0:12)));
  win.scrollTo(0,y);
  root.style.scrollBehavior=previous;
}
function enableShowcaseFlash(){
  let doc,win;
  try{doc=iframe.contentDocument;win=iframe.contentWindow;}catch(error){return;}
  if(!doc||!win||!doc.body)return;
  const target=focusId?doc.getElementById(focusId):null;
  if(!target)return;
  positionInsideFrame(doc,win,target);
  const style=doc.createElement('style');
  style.textContent=[
    '@keyframes baShowcasePulse{0%,100%{outline-color:transparent;box-shadow:none}18%,65%{outline-color:#ffba4c;box-shadow:inset 0 0 0 5px rgba(255,186,76,.85),0 0 0 3px rgba(73,39,9,.48)}}',
    '.ba-showcase-pulse{outline:5px solid transparent!important;outline-offset:-5px!important;animation:baShowcasePulse 2.4s ease-in-out 1!important;}',
    '@media(prefers-reduced-motion:reduce){.ba-showcase-pulse{animation:none!important;outline-color:#ffba4c!important;box-shadow:inset 0 0 0 5px rgba(255,186,76,.9)!important}}'
  ].join('\n');
  doc.head.append(style);
  const flash=()=>{
    if(showcaseFlashed)return;
    showcaseFlashed=true;
    target.classList.add('ba-showcase-pulse');
    win.setTimeout(()=>{target.classList.remove('ba-showcase-pulse');style.remove();},2450);
  };
  // Capture the first *real* interaction inside the sample without swallowing
  // a click, trapping focus, or navigating to another component.
  doc.addEventListener('pointerdown',flash,{capture:true,once:true});
  doc.addEventListener('keydown',event=>{
    if(['Shift','Control','Alt','Meta'].includes(event.key))return;
    flash();
  },{capture:true,once:true});
}
iframe.addEventListener('load',()=>{
  loading.hidden=true;
  enableShowcaseFlash();
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
