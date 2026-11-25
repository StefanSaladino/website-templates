/**
 * ATLAS opt-in, local-only device review. Loaded only with ?device-review=1.
 * Draw observations and rAF callback cadence are not GPU completion or display FPS.
 */
export function summarizeDeviceSamples(samples){
  const rafGaps=[],drawGaps=[],steps=[];
  let previousDraw=null,missedDraws=0,maxLag=0,reversals=0;
  const direction=samples[0]?.phase==='forward'?1:samples[0]?.phase==='reverse'?-1:0;
  for(let i=0;i<samples.length;i++){
    const s=samples[i];
    maxLag=Math.max(maxLag,Math.abs(s.target-s.progress));
    if(i)rafGaps.push(s.ms-samples[i-1].ms);
    if(!previousDraw){previousDraw=s;continue;}
    if(s.draws<=previousDraw.draws)continue;
    const delta=s.progress-previousDraw.progress;
    missedDraws+=Math.max(0,s.draws-previousDraw.draws-1);
    drawGaps.push(s.ms-previousDraw.ms);
    steps.push(Math.abs(delta));
    if(direction*delta<-.006)reversals++;
    previousDraw=s;
  }
  const stats=values=>{
    const sorted=[...values].sort((a,b)=>a-b);
    const percentile=p=>sorted[Math.max(0,Math.ceil(sorted.length*p)-1)]??null;
    return {p50:percentile(.5),p95:percentile(.95),max:sorted.at(-1)??null};
  };
  return {durationMs:samples.length?samples.at(-1).ms-samples[0].ms:0,
    callbacks:samples.length,observedDrawIntervals:drawGaps.length,missedDraws,
    callbackGapMs:stats(rafGaps),drawGapMs:stats(drawGaps),progressStep:stats(steps),
    maxTargetLag:maxLag,reversals};
}

export function mountDeviceReview({stage,canvas,getState,scrollToProgress}){
  const root=document.documentElement;
  if(document.getElementById('atlas-device-review'))return;
  const panel=document.createElement('aside');panel.id='atlas-device-review';
  panel.setAttribute('aria-label','Local device review');
  Object.assign(panel.style,{position:'fixed',zIndex:'10000',right:'12px',top:'max(72px, env(safe-area-inset-top))',
    maxWidth:'min(300px, calc(100vw - 24px))',padding:'12px',borderRadius:'6px',background:'#17212b',
    color:'#fff',font:'13px/1.45 system-ui,sans-serif',boxShadow:'0 3px 14px #0006'});
  const label=document.createElement('strong');label.textContent='ATLAS device review';
  const status=document.createElement('p');status.setAttribute('role','status');status.style.margin='6px 0 8px';
  const controls=document.createElement('div');Object.assign(controls.style,{display:'flex',flexWrap:'wrap',gap:'6px'});
  const button=(text,handler)=>{const b=document.createElement('button');b.type='button';b.textContent=text;
    Object.assign(b.style,{font:'inherit',minHeight:'44px',padding:'6px 10px',border:'1px solid #a5afb9',borderRadius:'3px',background:'#f3f5f6',color:'#18212a',cursor:'pointer'});
    b.addEventListener('click',handler);controls.append(b);return b;};
  let active=false,raf=0,timeout=0,phase='',started=0,phaseStarted=0,records=[],report=null,meta=null;
  const live=()=>stage.dataset.renderer==='webgl'&&root.dataset.still!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const details=()=>({release:root.dataset.atlasRelease,viewport:[innerWidth,innerHeight],
    canvas:[canvas.width,canvas.height],devicePixelRatio:window.devicePixelRatio,
    quality:stage.dataset.renderedQuality||null,renderer:stage.dataset.renderer,
    browser:navigator.userAgent,softwareHint:stage.dataset.softwareRenderer||null});
  const sync=()=>{auto.disabled=manual.disabled=active||!live();stop.disabled=!active;save.disabled=active||!report;};
  function finish(reason){
    if(!active)return;
    active=false;cancelAnimationFrame(raf);clearTimeout(timeout);raf=timeout=0;
    const groups={};
    for(const s of records){(groups[s.phase]??=[]).push(s);}
    report={schema:1,note:'Local-only rAF and draw-counter observations. Not GPU completion, display FPS or an artistic acceptance test.',
      reason,start:meta,end:details(),elapsedMs:Math.round(performance.now()-started),
      phases:Object.fromEntries(Object.entries(groups).map(([name,samples])=>[name,{summary:summarizeDeviceSamples(samples),samples}]))};
    status.textContent='Recording '+reason+'. '+records.length+' observations. Save the JSON report.';
    sync();
  }
  function begin(mode){
    if(active||!live()||document.hidden)return;
    report=null;records=[];meta=details();active=true;started=phaseStarted=performance.now();
    phase=mode==='auto'?'prepare':'manual';
    status.textContent=mode==='auto'?'Preparing valley-to-archive sweep. Do not scroll.':'Recording. Scroll naturally, then press Stop.';
    sync();
    if(mode==='auto')scrollToProgress(.64,true);
    timeout=setTimeout(()=>finish(mode==='auto'?'time limit reached':'manual time limit reached'),mode==='auto'?90000:45000);
    raf=requestAnimationFrame(tick);
  }
  function tick(){
    if(!active)return;
    if(document.hidden||!live()){finish('interrupted: hidden or static renderer');return;}
    if(innerWidth!==meta.viewport[0]||stage.dataset.renderedQuality!==meta.quality){finish('interrupted: orientation or quality changed');return;}
    const now=performance.now(),state=getState(),progress=Number(stage.dataset.renderedProgress),draws=Number(stage.dataset.draws);
    if(!Number.isFinite(progress)||!Number.isFinite(draws)||!Number.isFinite(state.targetProgress)){finish('invalid renderer observation');return;}
    if(records.length>=12000){finish('sample limit reached');return;}
    const sample={phase,ms:Math.round(now-started),progress,target:state.targetProgress,draws,
      settled:state.settled,ambient:state.ambientRunning,canvas:[canvas.width,canvas.height],viewport:[innerWidth,innerHeight]};
    records.push(sample);
    const at=p=>Math.abs(progress-p)<.006&&Math.abs(state.targetProgress-p)<.006&&state.settled;
    const next=(name,destination)=>{
      phase=name;phaseStarted=now;
      records.push({...sample,phase:name}); // actual initial pose, before native scroll
      status.textContent=name==='forward'?'Measuring forward sweep…':'Measuring reverse sweep…';
      scrollToProgress(destination,false);
    };
    if(phase==='prepare'&&at(.64))next('forward',.96);
    else if(phase==='forward'&&at(.96))next('reverse',.64);
    else if(phase==='reverse'&&at(.64)){finish('complete');return;}
    else if(phase!=='manual'&&now-phaseStarted>30000){finish('phase timeout: '+phase);return;}
    raf=requestAnimationFrame(tick);
  }
  function exportReport(){
    if(!report||active)return;
    const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='atlas-'+report.start.release.toLowerCase()+'-device-review.json';
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  const auto=button('Run sweep',()=>begin('auto')),manual=button('Record scroll',()=>begin('manual'));
  const stop=button('Stop',()=>finish('stopped by reviewer')),save=button('Save JSON',exportReport);
  button('Close',()=>{finish('closed');observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('pagehide',onPageHide);panel.remove();});
  panel.append(label,status,controls);document.body.append(panel);
  function onVisibility(){if(document.hidden)finish('interrupted: page hidden');}
  function onPageHide(){finish('interrupted: page exit');}
  document.addEventListener('visibilitychange',onVisibility);window.addEventListener('pagehide',onPageHide);
  const observer=new MutationObserver(()=>{if(active&&!live())finish('interrupted: static renderer');else if(!active)sync();});
  observer.observe(stage,{attributes:true,attributeFilter:['data-renderer']});
  observer.observe(root,{attributes:true,attributeFilter:['data-still']});
  status.textContent=live()?'Run a controlled forward/reverse sweep or record your own scrolling. Nothing is uploaded.':'Live WebGL is required; still/reduced-motion mode is respected.';
  sync();
}
