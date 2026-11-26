import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingPose,approachPose,project,multiply} from '../src/camera.js';
import {architecturalSolids} from '../src/geometry.js';
import {FLOOR_MIRROR} from '../src/reflection.js';
const sizes=[[320,568],[390,844],[768,1024],[1440,900],[844,390],[320,844],[1920,1080]];
function apertureWidth(vp){
  const xs=[];
  for(const x of [-2.4,2.4])for(const y of [0,6]){
    const q=project(vp,[x,y,0]);assert.ok(q[3]>.08);xs.push(q[0]/q[3]);
  }
  return (Math.max(...xs)-Math.min(...xs))/2;
}
test('approved start, forward-only clear approach and exact reversible poses',()=>{
  const solids=architecturalSolids();
  for(const [w,h] of sizes){
    const a=w/h,desktop=w>=900&&h>=480&&a>=1.2;
    assert.deepEqual(approachPose(a,desktop,0),openingPose(a,desktop));
    let previous=Infinity,prevWidth=0;
    for(let i=0;i<=1000;i++){
      const p=i/1000,q=approachPose(a,desktop,p),[x,y,z]=q.eye;
      assert.ok(z<=previous+1e-8&&z>=5.8-1e-8&&y>=1.8&&y<=2.6);
      previous=z;
      const point=[x,y,-z];
      for(const solid of solids){
        const d=Math.hypot(...point.map((v,k)=>Math.max(solid.min[k]-v,0,v-solid.max[k])));
        assert.ok(d>=.35,solid.id+' clearance');
      }
      assert.ok([...q.vp].every(Number.isFinite));
      const width=apertureWidth(q.vp);assert.ok(width>=prevWidth-1e-6,'monotone aperture scale');prevWidth=width;
    }
    const end=approachPose(a,desktop,1);
    assert.ok(Math.abs(end.eye[0])<1e-9&&end.eye[2]>0);
    assert.ok(apertureWidth(end.vp)>apertureWidth(openingPose(a,desktop).vp)*1.3);
    const samples=[0,.25,.5,.75,1];
    assert.deepEqual(samples.map(t=>approachPose(a,desktop,t)),samples.slice().reverse().map(t=>approachPose(a,desktop,t)).reverse());
  }
});
test('endpoint derivatives bounded and reflections use the same moving projection',()=>{
  for(const [w,h] of sizes){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2;
    for(const endpoint of [0,1]){
      const u=approachPose(a,d,endpoint),v=approachPose(a,d,endpoint===0?.001:.999);
      assert.ok(Math.hypot(...u.eye.map((n,i)=>n-v.eye[i]))<.0001);
    }
    for(const t of [0,.2,.5,.8,1]){
      const {eye,vp}=approachPose(a,d,t),source=[2.4,3,-1],mirror=[2.4,-3,-1];
      const k=eye[1]/(eye[1]-mirror[1]),hit=eye.map((v,i)=>v+(mirror[i]-v)*k);
      const r=project(multiply(vp,FLOOR_MIRROR),source),q=project(vp,hit);
      for(let i=0;i<2;i++)assert.ok(Math.abs(r[i]/r[3]-q[i]/q[3])<1e-6);
    }
  }
});
