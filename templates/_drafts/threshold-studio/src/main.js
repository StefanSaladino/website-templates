import {graphicAmount} from './graphic.js?v=P08c';
import {RELEASE} from './config.js?v=P08c';
import {createRenderer} from './renderer.js?v=P08c';
import {DESKTOP_COMPOSITION_QUERY,approachPose,crossingPose,revealPose,exhibitionPose,EXHIBITION_JOIN,REVEAL_JOIN,approachProgress,openingComposition,graphicComposition,closingPose,CLOSING_ARRIVE,CLOSING_DEPART} from './camera.js?v=P08c';
import {createScheduler} from './lifecycle.js?v=P08c';
import {wordmarkOcclusion} from './wordmark.js?v=P08c';
import {createAmbientClock} from './ambient.js?v=P08c';
import {readProgress} from './scroll.js?v=P08c';
import {typographyPose} from './typography.js?v=P08c';
import {FOLDS,foldAmount} from './sculptures.js?v=P08c';
import {perspectivePose,perspectivePresence,explorationPose} from './editorial.js?v=P08c';
import {mountParallax} from './parallax.js?v=P08c';
import {mountForm} from './form.js?v=P08c';
import {mountSignal} from './signal.js?v=P08c';
import {mountPossibility} from './possibility.js?v=P08c';
const root=document.documentElement;
if(root.dataset.release===RELEASE){root.dataset.shell='ready';start()}
function start(){
  const study=document.querySelector('#scene-study'),surface=study.querySelector('.scene-surface'),canvas=study.querySelector('canvas');
  const mark=document.querySelector('.display-wordmark'),occluder=document.querySelector('#wordmark-occluder');
  const stage=document.querySelector('.journey-stage'),header=stage.querySelector('.masthead'),footer=stage.querySelector('footer');
  const exploration=stage.querySelector('.exploration');
  const parallax=mountParallax(exploration);
  const form=mountForm(exploration);
  const signal=mountSignal(exploration);
  const possibility=mountPossibility(stage.querySelector('.possibility'));
  let lastType='',lastEditorial='',lastExploration='',typeBounds=null;
  function applyExploration(progress,available,staticMode=false,presence=1){
    const pose=explorationPose(progress,available),opacity=pose.opacity*presence,active=pose.active&&presence===1;
    const mode=staticMode?'static':active?'active':opacity>0?'entering':'off';
    const key=mode+'|'+opacity.toFixed(6);
    if(key===lastExploration)return;
    if(!staticMode&&!active&&exploration.contains(document.activeElement))header.querySelector('.wordmark').focus({preventScroll:true});
    exploration.inert=!staticMode&&!active;
    stage.dataset.exploration=mode;
    stage.style.setProperty('--exploration-opacity',opacity.toFixed(6));
    study.dataset.exploration=mode;
    lastExploration=key;
  }
  function applyEditorial(progress,presence=1){
    const t=perspectivePose(progress),opacity=(t.opacity*presence).toFixed(6),rise=(t.rise+20*(1-presence)).toFixed(3)+'px';
    const key=opacity+'|'+rise;
    if(key!==lastEditorial){stage.style.setProperty('--perspective-opacity',opacity);stage.style.setProperty('--perspective-rise',rise);lastEditorial=key}
    study.dataset.editorial=opacity;
  }
  function applyTypography(progress,width,height,rect=null){
    const wide=desktopComposition.matches||width/height>=1.2;
    const t=typographyPose(progress,wide);
    // Read safe-zone geometry once per actual viewport/layout change, before
    // writing CSS variables. The sticky stage shares these relative bounds.
    if(rect&&(!typeBounds||typeBounds.width!==width||typeBounds.height!==height))typeBounds={width,height,top:Math.max(0,header.getBoundingClientRect().bottom-rect.top),bottom:Math.max(0,rect.bottom-footer.getBoundingClientRect().top)};
    const values={
      '--mark-rise':(t.markY*height).toFixed(3)+'px',
      '--mark-opacity':t.markOpacity.toFixed(6),
      '--copy-x':(t.copyX*width).toFixed(3)+'px',
      '--copy-y':(t.copyY*height).toFixed(3)+'px',
      '--copy-opacity':t.copyOpacity.toFixed(6),
      '--footer-opacity':t.footerOpacity.toFixed(6),
      '--type-top':rect&&typeBounds?typeBounds.top.toFixed(3)+'px':'0px',
      '--type-bottom':rect&&typeBounds?typeBounds.bottom.toFixed(3)+'px':'0px'
    };
    const key=Object.values(values).join(',');
    if(key!==lastType){for(const [name,value] of Object.entries(values))stage.style.setProperty(name,value);lastType=key}
    return t;
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),desktopComposition=matchMedia(DESKTOP_COMPOSITION_QUERY);
  const flags=new URLSearchParams(location.search);
  // Full-quality diagnostics preserve the exact existing evidence baseline.
  // Balanced is the default on high-DPR screens; use quality=full to compare.
  const quality=flags.get('quality')==='full'?'full':flags.get('quality')==='balanced'||devicePixelRatio>1.5?'balanced':'full';
  study.dataset.quality=quality;
  const fpsDebug=['1','collect'].includes(flags.get('fps'));
  const meter=flags.get('fps')==='1'?document.createElement('output'):null;
  let meterUpdated=0;
  if(meter){
    meter.setAttribute('aria-hidden','true');
    meter.style.cssText='position:fixed;top:env(safe-area-inset-top,0px);left:50%;transform:translateX(-50%);z-index:100;pointer-events:none;padding:4px 8px;background:#090909;color:#eeece5;font:11px monospace;white-space:nowrap';
    meter.textContent=quality+' / measuring';
    document.body.append(meter);
  }
  let perfSamples=[],lastSubmit=null;
  if(fpsDebug)window.__thresholdPerf={reset(){perfSamples=[];lastSubmit=null},read(){return perfSamples.map(s=>({...s}))}};
  function recordFrame(start,progress){
    if(!fpsDebug)return;
    const now=performance.now();
    perfSamples.push({time:now,interval:lastSubmit===null?null:now-lastSubmit,cpuMs:now-start,progress});
    lastSubmit=now;
    if(perfSamples.length>1800)perfSamples.shift();
    if(meter&&now-meterUpdated>=250){
      const recent=perfSamples.filter(s=>s.time>=now-1000);
      const span=recent.at(-1)?.time-recent[0]?.time;
      meter.textContent=quality+' / '+(recent.length>=2&&span>0?Math.round((recent.length-1)*1000/span)+' submit fps':'idle / measuring');
      meterUpdated=now;
    }
  }
  const graphic=flags.get('sculpture')!=='folds'&&flags.get('journey')!=='off'&&flags.get('floorMask')!=='on'&&!['approach','crossing'].includes(flags.get('track'));
  stage.dataset.direction=graphic?'graphic':'legacy';
  const reflectionEnabled=flags.get('reflection')!=='off',lightingEnabled=flags.get('lighting')!=='off',floorMask=flags.get('floorMask')==='on';
  const ambientEnabled=flags.get('ambient')!=='off'&&lightingEnabled&&!floorMask;
  const journeyRequested=flags.get('journey')!=='off'&&!floorMask;
  const approachOnly=flags.get('track')==='approach',crossingOnly=flags.get('track')==='crossing',perspectiveOnly=flags.get('track')==='perspective';
  const fullTrack=!approachOnly&&!crossingOnly&&!perspectiveOnly;
  const closingTrack=graphic&&fullTrack&&flags.get('track')!=='exhibition';
  if(closingTrack)root.dataset.closing='on';
  possibility.enable(closingTrack);
  const nextChapter=stage.querySelector('[data-journey-next]'),backChapter=stage.querySelector('[data-journey-back]');
  let pendingChapter='';
  function jumpChapter(which){
    const s=document.scrollingElement;
    if(!closingTrack||!journeyActive)return;
    pendingChapter=which;
    s.scrollTop=Math.round((s.scrollHeight-s.clientHeight)*(which==='closing'?1:.70));
    invalidate();
  }
  const goClosing=()=>jumpChapter('closing'),goExploration=()=>jumpChapter('exploration');
  nextChapter.addEventListener('click',goClosing);
  backChapter.addEventListener('click',goExploration);
  const smooth=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v)};
  const foldsEnabled=flags.get('fold')!=='off';
  let journeyActive=false;
  function setJourney(active){
    if(journeyActive===active&&root.dataset.journey)return;
    journeyActive=active;root.dataset.journey=active?'on':'off';
    if(!active)study.dataset.progress='0.000000';
  }
  setJourney(false);
  const clock=createAmbientClock();let forceDraw=true;
  let renderer=null,visible=false,lost=false,failed=false,disposed=false,suspended=false,frames=0;
  function staticView(reason){clock.pause();stage.dataset.room='arrival';applyTypography(0,1,1);applyEditorial(0);if(reason!=='context-lost')setJourney(false);applyExploration(0,false,!journeyActive);pendingChapter='';nextChapter.hidden=true;backChapter.hidden=true;possibility.show(0,!journeyActive&&closingTrack);canvas.hidden=true;study.dataset.renderer='static';study.dataset.reason=reason;occluder.setAttribute('points','');mark.dataset.depth='flat'}
  // A preference change can become visible to the frame scheduler before the
  // MediaQueryList change callback is delivered. Never silently stop on a live canvas.
  function eligible(){
    if(disposed||suspended)return false;
    if(reduced.matches){
      if(study.dataset.reason!=='reduced-motion')staticView('reduced-motion');
      return false;
    }
    return !failed&&!lost&&!document.hidden&&visible;
  }
  function draw(){
    const started=performance.now();
    const progress=journeyActive?readProgress(document.scrollingElement):0;
    const localProgress=closingTrack?Math.min(1,progress/CLOSING_ARRIVE):progress;
    // The ambient source is the red entrance. Stop invisible idle GPU work
    // once the camera clears it, but never throttle input-triggered frames.
    const ambientVisible=ambientEnabled&&(!journeyActive||localProgress<.44);
    const sample=ambientVisible?clock.sample(started,forceDraw):{render:true,phase:-1,elapsed:clock.elapsed};
    if(!ambientVisible)clock.pause();
    forceDraw=false;
    if(!sample.render){scheduler.invalidate();return}
    try{
      if(!renderer)renderer=createRenderer(canvas,graphic,closingTrack,quality);
      if(!renderer){failed=true;staticView('graphics-unavailable');return}
      const r=surface.getBoundingClientRect();
      const physicalPose=(closingTrack?closingPose:approachOnly?approachPose:crossingOnly?crossingPose:perspectiveOnly?revealPose:exhibitionPose)(r.width/r.height,desktopComposition.matches,progress);
      const perspectiveProgress=fullTrack?Math.min(1,localProgress/EXHIBITION_JOIN):progress;
      const presence=fullTrack?perspectivePresence(localProgress):1;
      const pose=graphic?graphicComposition(physicalPose,r.width/r.height,perspectiveProgress,presence):physicalPose;
      const foldProgress=!graphic&&foldsEnabled&&!approachOnly&&!crossingOnly?perspectiveProgress:0;
      const result=renderer.draw(r.width,r.height,devicePixelRatio,reflectionEnabled,lightingEnabled,floorMask,desktopComposition.matches,sample.phase,pose,foldProgress,graphic?perspectiveProgress:0);
      if(!result){staticView('not-ready');return}
      // The rendered pose and the reported progress always belong to the same sample.
      const wasActive=journeyActive;
      setJourney(journeyRequested&&!reduced.matches);
      if(wasActive!==journeyActive){typeBounds=null;invalidate()}
      study.dataset.progress=progress.toFixed(6);
      // The navigation adopts ink only after the camera has cleared the red throat.
      stage.dataset.room=pose.eye[2]<=-43?'possibility':pose.eye[2]<=-20.4?'exploration':pose.eye[2]<=-7.2?'perspective':'arrival';
      applyEditorial(!approachOnly&&!crossingOnly&&journeyActive?perspectiveProgress:0,presence);
      const explorationExit=closingTrack?1-smooth((progress-.75)/(CLOSING_DEPART-.75)):1;
      applyExploration(localProgress,graphic&&fullTrack&&journeyActive&&stage.dataset.room==='exploration',false,explorationExit);
      const closingAmount=closingTrack&&journeyActive&&stage.dataset.room==='possibility'?smooth((progress-.96)/.03):0;
      possibility.show(closingAmount);
      const indexReady=closingTrack&&journeyActive&&stage.dataset.exploration==='active';
      nextChapter.hidden=!indexReady;
      backChapter.hidden=!(closingTrack&&journeyActive&&closingAmount===1);
      if(pendingChapter==='closing'&&closingAmount===1){
        pendingChapter='';stage.querySelector('.possibility:not([hidden]) [data-journey-back]').focus({preventScroll:true});
        if(stage.querySelector('.possibility-contact:not([hidden])'))stage.querySelector('[data-possibility-return]').focus({preventScroll:true});
      }else if(pendingChapter==='exploration'&&indexReady){
        pendingChapter='';const target=exploration.dataset.study?exploration.querySelector('section:not([hidden]) .study-return'):nextChapter;target?.focus({preventScroll:true});
      }
      study.dataset.graphic=graphic?'on':'off';study.dataset.graphicAmount=(graphic?graphicAmount(perspectiveProgress):0).toFixed(6);
      study.dataset.folds=FOLDS.map(f=>foldAmount(f,foldProgress).toFixed(6)).join(',');
      study.dataset.sculptureUploads=String(result.sculptureUploads);
      study.dataset.eye=pose.eye.map(v=>v.toFixed(6)).join(',');
      study.dataset.fov=pose.fov.toFixed(6);study.dataset.shiftX=pose.shiftX.toFixed(6);
      study.dataset.frames=String(++frames);
      study.dataset.ambient=ambientVisible?'on':'off';study.dataset.ambientElapsed=sample.elapsed.toFixed(2);
      study.dataset.buffer=result.width+'x'+result.height;
      study.dataset.triangles=String(result.triangles);
      study.dataset.reflectionBuffer=result.reflectionWidth+'x'+result.reflectionHeight;
      study.dataset.reflection=result.reflectionEnabled?'on':'off';
      study.dataset.lighting=result.lightingEnabled?'on':'off';
      study.dataset.floorMask=result.floorMask?'on':'off';
      study.dataset.composition=openingComposition(r.width/r.height,desktopComposition.matches);
      // Apply text displacement before deriving the portal mask in its new local coordinates.
      const type=applyTypography(approachOnly?progress:approachProgress(crossingOnly?progress:perspectiveProgress/REVEAL_JOIN),r.width,r.height,r);
      const points=desktopComposition.matches&&type.markOpacity>0?wordmarkOcclusion(pose.vp,r,mark.getBoundingClientRect()):'';
      if(occluder.getAttribute('points')!==points)occluder.setAttribute('points',points);
      const depth=points?'projected':'flat';if(mark.dataset.depth!==depth)mark.dataset.depth=depth;
      study.dataset.renderer='webgl';delete study.dataset.reason;canvas.hidden=false;
      recordFrame(started,progress);
      if(ambientVisible)scheduler.invalidate();
    }catch(e){failed=true;renderer?.release();renderer=null;staticView('graphics-error');console.warn('THRESHOLD renderer:',e)}
  }
  const scheduler=createScheduler({request:cb=>requestAnimationFrame(cb),cancel:id=>cancelAnimationFrame(id),draw,eligible});
  const invalidate=()=>{forceDraw=true;scheduler.invalidate()};
  function scrollChanged(){if(journeyActive)invalidate()}
  function suspend(){clock.pause();scheduler.sync()}
  function preference(){if(disposed)return;if(reduced.matches)staticView('reduced-motion');invalidate()}
  function visibility(){if(document.hidden)suspend();else invalidate()}
  function contextLost(e){e.preventDefault();lost=true;suspend();renderer?.abandon();staticView('context-lost')}
  function contextRestored(){
    if(disposed)return;lost=false;
    try{if(renderer)renderer.restore();failed=false;invalidate()}
    catch(e){failed=true;staticView('graphics-error');console.warn('THRESHOLD restore:',e)}
  }
  const resize=new ResizeObserver(()=>{typeBounds=null;invalidate()});
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)invalidate();else suspend()});
  function dispose(){
    if(disposed)return;disposed=true;meter?.remove();parallax.dispose();form.dispose();signal.dispose();possibility.dispose();nextChapter.removeEventListener('click',goClosing);backChapter.removeEventListener('click',goExploration);scheduler.dispose();resize.disconnect();intersection.disconnect();
    reduced.removeEventListener('change',preference);desktopComposition.removeEventListener('change',invalidate);document.removeEventListener('visibilitychange',visibility);
    window.removeEventListener('scroll',scrollChanged);window.visualViewport?.removeEventListener('resize',invalidate);
    window.removeEventListener('resize',invalidate);window.removeEventListener('pagehide',pageHide);window.removeEventListener('pageshow',pageShow);
    canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
    renderer?.release();renderer=null;staticView('disposed');
  }
  function pageHide(e){if(!e.persisted)dispose();else{suspended=true;suspend()}}
  function pageShow(e){if(e.persisted){suspended=false;invalidate()}}
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  reduced.addEventListener('change',preference);desktopComposition.addEventListener('change',invalidate);document.addEventListener('visibilitychange',visibility);
  window.addEventListener('scroll',scrollChanged,{passive:true});window.visualViewport?.addEventListener('resize',invalidate,{passive:true});
  window.addEventListener('resize',invalidate);window.addEventListener('pagehide',pageHide);window.addEventListener('pageshow',pageShow);
  resize.observe(surface);resize.observe(header);resize.observe(footer);intersection.observe(surface);
  preference();
}
