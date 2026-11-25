import {RELEASE} from './config.js?v=T16';
import {createRenderer} from './renderer.js?v=T16';
import {DESKTOP_COMPOSITION_QUERY,approachPose,crossingPose,approachProgress,openingComposition} from './camera.js?v=T16';
import {createScheduler} from './lifecycle.js?v=T16';
import {wordmarkOcclusion} from './wordmark.js?v=T16';
import {createAmbientClock} from './ambient.js?v=T16';
import {readProgress} from './scroll.js?v=T16';
import {typographyPose} from './typography.js?v=T16';
const root=document.documentElement;
if(root.dataset.release===RELEASE){root.dataset.shell='ready';start()}
function start(){
  const study=document.querySelector('#scene-study'),surface=study.querySelector('.scene-surface'),canvas=study.querySelector('canvas');
  const mark=document.querySelector('.display-wordmark'),occluder=document.querySelector('#wordmark-occluder');
  const stage=document.querySelector('.journey-stage'),header=stage.querySelector('.masthead'),footer=stage.querySelector('footer');
  let lastType='';
  function applyTypography(progress,width,height,rect=null){
    const wide=desktopComposition.matches||width/height>=1.2;
    const t=typographyPose(progress,wide);
    const values={
      '--mark-rise':(t.markY*height).toFixed(3)+'px',
      '--mark-opacity':t.markOpacity.toFixed(6),
      '--copy-x':(t.copyX*width).toFixed(3)+'px',
      '--copy-y':(t.copyY*height).toFixed(3)+'px',
      '--copy-opacity':t.copyOpacity.toFixed(6),
      '--footer-opacity':t.footerOpacity.toFixed(6),
      '--type-top':rect?Math.max(0,header.getBoundingClientRect().bottom-rect.top).toFixed(3)+'px':'0px',
      '--type-bottom':rect?Math.max(0,rect.bottom-footer.getBoundingClientRect().top).toFixed(3)+'px':'0px'
    };
    const key=Object.values(values).join(',');
    if(key!==lastType){for(const [name,value] of Object.entries(values))stage.style.setProperty(name,value);lastType=key}
    return t;
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),desktopComposition=matchMedia(DESKTOP_COMPOSITION_QUERY);
  const flags=new URLSearchParams(location.search);
  const reflectionEnabled=flags.get('reflection')!=='off',lightingEnabled=flags.get('lighting')!=='off',floorMask=flags.get('floorMask')==='on';
  const ambientEnabled=flags.get('ambient')!=='off'&&lightingEnabled&&!floorMask;
  const journeyRequested=flags.get('journey')!=='off'&&!floorMask;
  const approachOnly=flags.get('track')==='approach';
  let journeyActive=false;
  function setJourney(active){
    if(journeyActive===active&&root.dataset.journey)return;
    journeyActive=active;root.dataset.journey=active?'on':'off';
    if(!active)study.dataset.progress='0.000000';
  }
  setJourney(false);
  const clock=createAmbientClock();let forceDraw=true;
  let renderer=null,visible=false,lost=false,failed=false,disposed=false,suspended=false,frames=0;
  function staticView(reason){clock.pause();applyTypography(0,1,1);if(reason!=='context-lost')setJourney(false);canvas.hidden=true;study.dataset.renderer='static';study.dataset.reason=reason;occluder.setAttribute('points','');mark.dataset.depth='flat'}
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
    const sample=ambientEnabled?clock.sample(performance.now(),forceDraw):{render:true,phase:-1,elapsed:0};
    forceDraw=false;
    if(!sample.render){scheduler.invalidate();return}
    try{
      if(!renderer)renderer=createRenderer(canvas);
      if(!renderer){failed=true;staticView('graphics-unavailable');return}
      const r=surface.getBoundingClientRect();
      const progress=journeyActive?readProgress(document.scrollingElement):0;
      const pose=(approachOnly?approachPose:crossingPose)(r.width/r.height,desktopComposition.matches,progress);
      const result=renderer.draw(r.width,r.height,devicePixelRatio,reflectionEnabled,lightingEnabled,floorMask,desktopComposition.matches,sample.phase,pose);
      if(!result){staticView('not-ready');return}
      // The rendered pose and the reported progress always belong to the same sample.
      const wasActive=journeyActive;
      setJourney(journeyRequested&&!reduced.matches);
      if(wasActive!==journeyActive)invalidate();
      study.dataset.progress=progress.toFixed(6);
      study.dataset.eye=pose.eye.map(v=>v.toFixed(6)).join(',');
      study.dataset.fov=pose.fov.toFixed(6);
      study.dataset.frames=String(++frames);
      study.dataset.ambient=ambientEnabled?'on':'off';study.dataset.ambientElapsed=sample.elapsed.toFixed(2);
      study.dataset.buffer=result.width+'x'+result.height;
      study.dataset.triangles=String(result.triangles);
      study.dataset.reflectionBuffer=result.reflectionWidth+'x'+result.reflectionHeight;
      study.dataset.reflection=result.reflectionEnabled?'on':'off';
      study.dataset.lighting=result.lightingEnabled?'on':'off';
      study.dataset.floorMask=result.floorMask?'on':'off';
      study.dataset.composition=openingComposition(r.width/r.height,desktopComposition.matches);
      // Apply text displacement before deriving the portal mask in its new local coordinates.
      const type=applyTypography(approachOnly?progress:approachProgress(progress),r.width,r.height,r);
      const points=desktopComposition.matches&&type.markOpacity>0?wordmarkOcclusion(pose.vp,r,mark.getBoundingClientRect()):'';
      occluder.setAttribute('points',points);mark.dataset.depth=points?'projected':'flat';
      study.dataset.renderer='webgl';delete study.dataset.reason;canvas.hidden=false;
      if(ambientEnabled)scheduler.invalidate();
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
  const resize=new ResizeObserver(invalidate);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)invalidate();else suspend()});
  function dispose(){
    if(disposed)return;disposed=true;scheduler.dispose();resize.disconnect();intersection.disconnect();
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
  resize.observe(surface);intersection.observe(surface);preference();
}
