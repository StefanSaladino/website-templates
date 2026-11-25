import {RELEASE} from './config.js?v=T07';
import {createRenderer} from './renderer.js?v=T07';
import {createScheduler} from './lifecycle.js?v=T07';
const root=document.documentElement;
if(root.dataset.release===RELEASE){root.dataset.shell='ready';start()}
function start(){
  const study=document.querySelector('#scene-study'),surface=study.querySelector('.scene-surface'),canvas=study.querySelector('canvas');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const flags=new URLSearchParams(location.search);
  const reflectionEnabled=flags.get('reflection')!=='off',lightingEnabled=flags.get('lighting')!=='off',floorMask=flags.get('floorMask')==='on';
  let renderer=null,visible=false,lost=false,failed=false,disposed=false,suspended=false,frames=0;
  function staticView(reason){canvas.hidden=true;study.dataset.renderer='static';study.dataset.reason=reason}
  function eligible(){return !disposed&&!suspended&&!failed&&!lost&&!reduced.matches&&!document.hidden&&visible}
  function draw(){
    try{
      if(!renderer)renderer=createRenderer(canvas);
      if(!renderer){failed=true;staticView('graphics-unavailable');return}
      const r=surface.getBoundingClientRect(),result=renderer.draw(r.width,r.height,devicePixelRatio,reflectionEnabled,lightingEnabled,floorMask);
      if(!result){staticView('not-ready');return}
      study.dataset.frames=String(++frames);
      study.dataset.buffer=result.width+'x'+result.height;
      study.dataset.triangles=String(result.triangles);
      study.dataset.reflectionBuffer=result.reflectionWidth+'x'+result.reflectionHeight;
      study.dataset.reflection=result.reflectionEnabled?'on':'off';
      study.dataset.lighting=result.lightingEnabled?'on':'off';
      study.dataset.floorMask=result.floorMask?'on':'off';
      study.dataset.renderer='webgl';delete study.dataset.reason;canvas.hidden=false;
    }catch(e){failed=true;renderer?.release();renderer=null;staticView('graphics-error');console.warn('THRESHOLD renderer:',e)}
  }
  const scheduler=createScheduler({request:cb=>requestAnimationFrame(cb),cancel:id=>cancelAnimationFrame(id),draw,eligible});
  const invalidate=()=>scheduler.invalidate();
  function preference(){if(reduced.matches)staticView('reduced-motion');invalidate()}
  function visibility(){if(document.hidden)scheduler.sync();else invalidate()}
  function contextLost(e){e.preventDefault();lost=true;scheduler.sync();renderer?.abandon();staticView('context-lost')}
  function contextRestored(){
    if(disposed)return;lost=false;
    try{if(renderer)renderer.restore();failed=false;invalidate()}
    catch(e){failed=true;staticView('graphics-error');console.warn('THRESHOLD restore:',e)}
  }
  const resize=new ResizeObserver(invalidate);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)invalidate();else scheduler.sync()});
  function dispose(){
    if(disposed)return;disposed=true;scheduler.dispose();resize.disconnect();intersection.disconnect();
    reduced.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);
    window.removeEventListener('resize',invalidate);window.removeEventListener('pagehide',pageHide);window.removeEventListener('pageshow',pageShow);
    canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
    renderer?.release();renderer=null;staticView('disposed');
  }
  function pageHide(e){if(!e.persisted)dispose();else{suspended=true;scheduler.sync()}}
  function pageShow(e){if(e.persisted){suspended=false;invalidate()}}
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  reduced.addEventListener('change',preference);document.addEventListener('visibilitychange',visibility);
  window.addEventListener('resize',invalidate);window.addEventListener('pagehide',pageHide);window.addEventListener('pageshow',pageShow);
  resize.observe(surface);intersection.observe(surface);preference();
}
