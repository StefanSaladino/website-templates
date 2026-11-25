/** RELAY R4 — persistent, weighted SVG topology and port-locked curves. */
const SVG_NS = 'http://www.w3.org/2000/svg';
const clamp = x => Math.max(0, Math.min(1, x));
const mix = (a,b,t) => a+(b-a)*t;
export const edgeIdentity = e => `${e.from}-${e.to}-${e.dashed?1:0}-${e.primary?1:0}`;

// A directed edge shared by adjacent scenarios retains full weight and identity.
// Retiring edges retract; arriving edges grow, without changing DOM topology.
export function blendEdges(from, to, fraction) {
  const t=clamp(fraction), a=new Map(from.map(e=>[edgeIdentity(e),e])), b=new Map(to.map(e=>[edgeIdentity(e),e]));
  return [...new Set([...a.keys(),...b.keys()])].sort().map(key=>{
    const x=a.get(key), y=b.get(key);
    return {...(y||x),weight:mix(x?(x.weight??1):0,y?(y.weight??1):0,t)};
  });
}

// Always use the actual right output and left input ports. The horizontal
// tangents vary continuously, including when the nodes swap relative order.
export function portCurve(a,b) {
  const x1=a.outX??a.x+a.w, y1=a.outY??a.y+a.h/2;
  const x2=b.inX??b.x, y2=b.inY??b.y+b.h/2;
  const span=Math.hypot(x2-x1,y2-y1);
  const handle=Math.max(14,Math.min(110,span*.38));
  return [x1,y1,x1+handle,y1,x2-handle,y2,x2,y2];
}

// Sample arc length in JavaScript; evaluate the actual cubic for signal positions.
// Avoid synchronous SVG geometry queries during scroll and ambient RAFs.
export function curvePoint(q,t) {
  const u=1-t, a=u*u*u, b=3*u*u*t, c=3*u*t*t, d=t*t*t;
  return {x:a*q[0]+b*q[2]+c*q[4]+d*q[6],y:a*q[1]+b*q[3]+c*q[5]+d*q[7]};
}
export function curveMetrics(q) {
  const n=48, distances=new Float64Array(n+1);
  let prev=curvePoint(q,0);
  for(let i=1;i<=n;i++) {const pt=curvePoint(q,i/n);distances[i]=distances[i-1]+Math.hypot(pt.x-prev.x,pt.y-prev.y);prev=pt;}
  return {q,distances,length:distances[n]};
}
export function pointAtDistance(metrics,distance) {
  const {q,distances,length}=metrics,n=distances.length-1;
  const d=Math.max(0,Math.min(length,distance));
  if(d===0)return curvePoint(q,0);
  if(d===length)return curvePoint(q,1);
  let lo=0,hi=n;while(hi-lo>1){const mid=(lo+hi)>>1;if(distances[mid]<d)lo=mid;else hi=mid;}
  const span=distances[hi]-distances[lo];
  return curvePoint(q,(lo+(span>0?(d-distances[lo])/span:0))/n);
}
const setStyle=(el,key,value)=>{if(el.style[key]!==value)el.style[key]=value;};
export class ConnectorEngine {
  constructor(svgEl,boardEl) {
    this.svgEl=svgEl; this.boardEl=boardEl;
    this.entries=new Map(); this.edgePaths=[];
    this.drawProgress=1; this.activeNodeIdx=-1;
    this.reducedMotion=false; this.isAmbientPaused=false;
    this.rafId=null; this.lastTime=0; this.signalPhase=0;
  }
  setReducedMotion(flag) {
    this.reducedMotion=Boolean(flag);
    for(const e of this.edgePaths) e.signal.style.display=this.reducedMotion?'none':'';
    this._syncAmbientLoop();
  }
  setAmbientPaused(paused) { this.isAmbientPaused=Boolean(paused); this._syncAmbientLoop(); }
  setEdgeCatalog(edges) {
    if(!this.svgEl)return;
    // The entire small graph vocabulary is mounted exactly once at startup.
    const fragment=document.createDocumentFragment();
    for(const edge of [...new Map(edges.map(e=>[edgeIdentity(e),e])).values()].sort((a,b)=>edgeIdentity(a).localeCompare(edgeIdentity(b)))) {
      const key=edgeIdentity(edge);
      if(this.entries.has(key))continue;
      const group=document.createElementNS(SVG_NS,'g');
      group.dataset.edgeKey=key; group.dataset.weight='0'; group.style.opacity='0';
      const basePath=document.createElementNS(SVG_NS,'path');
      basePath.setAttribute('class',edge.dashed?'connector-path is-secondary':'connector-path');
      const activePath=document.createElementNS(SVG_NS,'path');
      activePath.setAttribute('class','connector-path-active');
      const signal=document.createElementNS(SVG_NS,'circle');
      signal.setAttribute('class','connector-signal'); signal.setAttribute('r',edge.primary?'3.4':'2.2');
      signal.style.display=this.reducedMotion?'none':'';
      group.append(basePath,activePath,signal); fragment.append(group);
      const entry={edge,group,basePath,activePath,signal,length:0,d:'',weight:0,visibleLength:0};
      this.entries.set(key,entry); this.edgePaths.push(entry);
    }
    this.svgEl.append(fragment);
  }
  setEdges(edges) {
    this.setEdgeCatalog(edges);
    const weights=new Map(edges.map(e=>[edgeIdentity(e),clamp(e.weight??1)]));
    for(const [key,entry] of this.entries){
      const weight=weights.get(key)??0;
      if(entry.weight===weight)continue;
      entry.weight=weight;
      entry.group.dataset.weight=weight.toFixed(5);
      entry.group.style.opacity=String(weight);
    }
  }
  updateFromBoxes(boxes,opts={}) {
    if(!this.svgEl||!boxes?.length)return;
    const bw=opts.boardW||this.boardEl?.clientWidth||720,bh=opts.boardH||this.boardEl?.clientHeight||380;
    this.drawProgress=clamp(opts.drawProgress??1);this.activeNodeIdx=opts.activeNodeIdx??-1;
    const vb=`0 0 ${bw} ${bh}`;if(this.svgEl.getAttribute('viewBox')!==vb)this.svgEl.setAttribute('viewBox',vb);
    for(const entry of this.edgePaths) {
      if(entry.weight<=0)continue;
      const a=boxes[entry.edge.from],b=boxes[entry.edge.to];if(!a||!b)continue;
      const q=portCurve(a,b).map(v=>v.toFixed(2));
      const d=`M ${q[0]} ${q[1]} C ${q[2]} ${q[3]}, ${q[4]} ${q[5]}, ${q[6]} ${q[7]}`;
      if(d!==entry.d){entry.d=d;entry.basePath.setAttribute('d',d);entry.activePath.setAttribute('d',d);entry.metrics=curveMetrics(q.map(Number));entry.length=entry.metrics.length;}
      const len=entry.length||1;
      const visible=entry.edge.dashed?len:len*this.drawProgress*entry.weight;
      entry.visibleLength=visible;
      setStyle(entry.basePath,'strokeDasharray',entry.edge.dashed?'4 4':`${visible.toFixed(3)} ${len.toFixed(3)}`);
      const active=this.activeNodeIdx>=0&&entry.edge.primary&&(entry.edge.to<=this.activeNodeIdx||entry.edge.from===this.activeNodeIdx-1);
      entry.activePath.classList.toggle('is-active',active);
      setStyle(entry.activePath,'strokeDasharray',`${visible.toFixed(3)} ${len.toFixed(3)}`);
    }
    this._updateSignals();this._syncAmbientLoop();
  }
  _updateSignals(){
    if(this.reducedMotion)return;
    this.edgePaths.forEach((entry,idx)=>{
      if(entry.weight<=0||entry.visibleLength<=0)return;
      const active=this.activeNodeIdx<0||(entry.edge.primary&&entry.edge.to<=Math.max(1,this.activeNodeIdx+1));
      setStyle(entry.signal,'opacity',!active&&entry.edge.dashed?'0.2':entry.edge.primary?'0.96':'0.42');
      const t=(this.signalPhase+idx*.21)%1;
      const pt=pointAtDistance(entry.metrics,t*entry.visibleLength);
      entry.signal.setAttribute('cx',pt.x.toFixed(2));entry.signal.setAttribute('cy',pt.y.toFixed(2));
    });
  }
  _syncAmbientLoop(){
    const shouldRun=!this.reducedMotion&&!this.isAmbientPaused&&this.edgePaths.some(e=>e.weight>0);
    if(shouldRun&&this.rafId===null){
      this.lastTime=performance.now();
      const tick=now=>{this.rafId=null;const dt=Math.min(.05,(now-this.lastTime)/1000);this.lastTime=now;this.signalPhase+=dt*(this.activeNodeIdx>=0?.65:.40);this._updateSignals();
        if(!this.reducedMotion&&!this.isAmbientPaused)this.rafId=requestAnimationFrame(tick);};
      this.rafId=requestAnimationFrame(tick);
    }else if(!shouldRun&&this.rafId!==null){cancelAnimationFrame(this.rafId);this.rafId=null;}
  }
}
