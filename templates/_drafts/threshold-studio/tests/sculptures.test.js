import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FOLDS,foldTriangles,sculptureBounds} from '../src/sculptures.js';
import {architecturalSolids,buildStudy} from '../src/geometry.js';
import {revealPose,project} from '../src/camera.js';
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const overlap=(a,b)=>a.min.every((v,k)=>v<b.max[k]&&a.max[k]>b.min[k]);
test('folded installations are closed, nondegenerate and isolated from architecture and aisle',()=>{
  assert.equal(FOLDS.length,2);
  for(const fold of FOLDS){
    const tris=foldTriangles(fold),edges=new Map(),bounds=sculptureBounds(fold);
    assert.equal(tris.length,28);
    for(const {points,color} of tris){
      const [a,b,c]=points;
      assert.ok(Math.hypot(...cross(b.map((x,i)=>x-a[i]),c.map((x,i)=>x-a[i])))>1e-6);
      assert.ok(color.every(x=>x>=0&&x<=1));
      for(let i=0;i<3;i++){
        const key=[points[i].join(','),points[(i+1)%3].join(',')].sort().join('|');
        edges.set(key,(edges.get(key)||0)+1);
      }
    }
    assert.ok([...edges.values()].every(n=>n===2),'closed manifold');
    assert.ok(bounds.min[1]===0&&bounds.max[1]<8.5);
    assert.ok(bounds.max[0]<-2.6||bounds.min[0]>2.6);
    assert.ok(bounds.min[2]>6&&bounds.max[2]<20);
    assert.ok(architecturalSolids().every(s=>!overlap(bounds,s)),fold.id+' architectural clearance');
  }
  assert.ok(!overlap(...FOLDS.map(sculptureBounds)));
  assert.equal(buildStudy().length,358*18);
});
test('both folded forms have projected sightlines along the actual responsive reveal track',()=>{
  for(const [w,h] of [[320,568],[320,844],[390,844],[768,1024],[1440,900],[844,390]]){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2;
    for(const fold of FOLDS){
      const points=foldTriangles(fold).flatMap(t=>t.points);
      let best=0;
      for(let i=45;i<=100;i++){
        const q=revealPose(a,d,i/100);
        const visible=points.filter(([x,y,s])=>{const v=project(q.vp,[x,y,-s]);return v[3]>.08&&Math.abs(v[0]/v[3])<1&&Math.abs(v[1]/v[3])<1}).length;
        best=Math.max(best,visible);
      }
      assert.ok(best>=12,fold.id+' projected sightline '+w+'x'+h);
    }
  }
});
