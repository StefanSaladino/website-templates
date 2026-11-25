import assert from 'node:assert/strict';
import {curveMetrics,curvePoint,pointAtDistance,portCurve} from '../src/connectors.js';
let maxError=0, samples=0;
for(const dx of [-500,-100,-20,0,20,100,500])for(const dy of [-300,-50,0,50,300]){
  const q=portCurve({outX:12,outY:8},{inX:12+dx,inY:8+dy});
  const m=curveMetrics(q);let prev=curvePoint(q,0),ref=0;
  for(let i=1;i<=4096;i++){const pt=curvePoint(q,i/4096);ref+=Math.hypot(pt.x-prev.x,pt.y-prev.y);prev=pt;}
  maxError=Math.max(maxError,Math.abs(ref-m.length));
  assert.deepEqual(pointAtDistance(m,0),curvePoint(q,0));assert.deepEqual(pointAtDistance(m,m.length),curvePoint(q,1));
  for(let j=0;j<=100;j++){const pt=pointAtDistance(m,m.length*j/100);assert(Number.isFinite(pt.x)&&Number.isFinite(pt.y));samples++;}
  assert(Math.abs(ref-m.length)<1 && Math.abs(ref-m.length)/Math.max(1,ref)<.005,`arc error ${ref-m.length}`);
}
console.log(`PASS ${samples} curve samples, maximum length approximation error ${maxError.toFixed(3)} layout px`);
