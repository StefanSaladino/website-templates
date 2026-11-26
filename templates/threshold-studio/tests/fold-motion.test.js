import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FOLDS,foldPose,foldAmount,foldTriangles,sculptureBounds} from '../src/sculptures.js';
import {architecturalSolids,buildStudy,buildSculptureVertices} from '../src/geometry.js';
const overlap=(a,b)=>a.min.every((v,k)=>v<b.max[k]&&a.max[k]>b.min[k]);
const orient=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function intersect(a,b,c,d){return orient(a,b,c)*orient(a,b,d)<-1e-10&&orient(c,d,a)*orient(c,d,b)<-1e-10}
test('continuous grounded fold morph preserves terminal sections, topology, aisle and architecture',()=>{
  const solids=architecturalSolids();
  for(const fold of FOLDS){
    const states=Array.from({length:2001},(_,i)=>foldPose(fold,i/2000));
    assert.deepEqual(states[0],fold);
    assert.notDeepEqual(states.at(-1),fold);
    assert.deepEqual(states,Array.from({length:2001},(_,i)=>foldPose(fold,(2000-i)/2000)).reverse());
    for(const f of states){
      const bounds=sculptureBounds(f),tris=foldTriangles(f);
      assert.equal(tris.length,28);assert.deepEqual(f.sections[0],fold.sections[0]);assert.deepEqual(f.sections.at(-1),fold.sections.at(-1));
      assert.ok(bounds.min[1]===0&&(bounds.max[0]<-2.6||bounds.min[0]>2.6));
      assert.ok(solids.every(s=>!overlap(bounds,s)));
      const polygon=[...f.sections.map(s=>s.slice(0,2)),...f.sections.slice().reverse().map(s=>s.slice(2,4))];
      for(let i=0;i<polygon.length;i++)for(let j=i+2;j<polygon.length;j++){
        if(i===0&&j===polygon.length-1)continue;
        assert.ok(!intersect(polygon[i],polygon[(i+1)%polygon.length],polygon[j],polygon[(j+1)%polygon.length]));
      }
      const edges=new Map();
      for(const {points} of tris){
        const [a,b,c]=points,u=b.map((n,i)=>n-a[i]),v=c.map((n,i)=>n-a[i]);
        assert.ok(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])>1e-6);
        for(let i=0;i<3;i++){const key=[points[i].join(','),points[(i+1)%3].join(',')].sort().join('|');edges.set(key,(edges.get(key)||0)+1)}
      }
      assert.ok([...edges.values()].every(n=>n===2));
    }
  }
});
test('sculpture-only buffer tail, smooth endpoint velocities and deterministic restore',()=>{
  const base=buildStudy(),initial=buildSculptureVertices(0),end=buildSculptureVertices(1);
  assert.equal(base.length,466*18);assert.equal(initial.length,56*18);assert.deepEqual(base.slice(-initial.length),initial);
  assert.notDeepEqual(initial,end);assert.deepEqual(initial,buildSculptureVertices(.75));
  for(const p of [0,.76,.8,.88,.96,1])assert.deepEqual(buildSculptureVertices(p),buildSculptureVertices(p));
  for(const f of FOLDS){
    const [start,end]=f.id==='crease'?[.76,.96]:[.80,1];
    assert.equal(foldAmount(f,start),0);assert.equal(foldAmount(f,end),1);
    assert.ok(foldAmount(f,start+.00001)<.000001&&1-foldAmount(f,end-.00001)<.000001);
  }
});
