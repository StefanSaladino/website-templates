import assert from 'node:assert/strict';
import {blendEdges,edgeIdentity,portCurve} from '../src/connectors.js';
import {SCENARIOS} from '../src/workflow.js';
const ids=Object.keys(SCENARIOS);let states=0;
for(const a of ids)for(const b of ids){
  const A=SCENARIOS[a].edges,B=SCENARIOS[b].edges;
  const keysA=new Set(A.map(edgeIdentity)),keysB=new Set(B.map(edgeIdentity));
  let last=null;
  for(let i=0;i<=1000;i++){
    const t=i/1000,edges=blendEdges(A,B,t),reverse=blendEdges(B,A,1-t);
    assert.equal(edges.length,new Set([...keysA,...keysB]).size);
    for(let j=0;j<edges.length;j++){
      const e=edges[j],k=edgeIdentity(e),expected=(keysA.has(k)?1-t:0)+(keysB.has(k)?t:0);
      assert(Math.abs(e.weight-expected)<1e-9);assert(Math.abs(e.weight-reverse[j].weight)<1e-9);
      if(last)assert(Math.abs(e.weight-last[j].weight)<=.00100001);
    }
    last=edges;states++;
  }
  const mid=blendEdges(A,B,.37);assert.deepEqual(blendEdges(mid,B,0).filter(e=>e.weight>0),mid.filter(e=>e.weight>0));
}
let last=null;
for(let i=0;i<=2000;i++){
  const a={x:40,y:40,w:100,h:60,outX:140.5,outY:70},b={x:220-i*.1,y:80+i*.04,w:110,h:60,inX:219.5-i*.1,inY:110+i*.04};
  const curve=portCurve(a,b);assert.deepEqual(curve.slice(0,2),[a.outX,a.outY]);assert.deepEqual(curve.slice(-2),[b.inX,b.inY]);
  if(last)assert(Math.max(...curve.map((v,j)=>Math.abs(v-last[j])))<.2);
  last=curve;
}
console.log(`PASS ${states} topology blends; 2001 continuous fixed-port curves; interruption starts at captured weights`);
