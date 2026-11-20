const [components, treatments] = await Promise.all([
  fetch('./data/components.json').then(response => { if(!response.ok) throw new Error('Could not load designs'); return response.json(); }),
  fetch('./data/mobile-treatments.json').then(response => { if(!response.ok) throw new Error('Could not load phone layouts'); return response.json(); })
]);
const treatmentMap = new Map(treatments.map(item => [item.id,item]));
const examples = new Map(components.filter(item => item.previewRoute && item.status !== 'draft').map(item => [item.id,item]));
const requested = new URLSearchParams(location.search).get('id') || 'NAV-03';
const design = examples.get(requested) || examples.values().next().value;
if(!design) throw new Error('No preview examples are available');
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
const focusAnchor = focus.focusAnchor ? '#'+encodeURIComponent(focus.focusAnchor) : '';
title.textContent = focus.focus || design.title;
document.title = (focus.focus || design.title) + ' — Explore design';
document.querySelector('#review-id').textContent = 'Example '+design.id+' · Still in development';
document.querySelector('#review-component-label').textContent = focus.label || 'Website section';
document.querySelector('#review-focus-summary').textContent = focus.summary || design.exampleContext;
document.querySelector('#review-focus-desktop').textContent = focus.desktop || 'This design adapts to a wide computer screen.';
document.querySelector('#review-focus-mobile').textContent = focus.mobile || 'This design changes to fit a phone screen.';
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
  const url = './previews/'+design.id+'/index.html'+(phoneStyle === 'alternate' && alternative ? '?mobile='+encodeURIComponent(alternative.id) : '')+focusAnchor;
  if(iframe.getAttribute('src') !== url) iframe.src = url;
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
render();
