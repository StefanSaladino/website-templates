import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingPose,approachPose,crossingPose,approachProgress,APPROACH_END,THROAT_END_Z,project,multiply} from '../src/camera.js';
import {architecturalSolids} from '../src/geometry.js';
import {FLOOR_MIRROR} from '../src/reflection.js';
const sizes=[[320,568],[320,844],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080],[844,390]];
const unit=v=>v.map(x=>x/Math.hypot(...v));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function clearance(point){
  const authored=[point[0],point[1],-point[2]];
  return Math.min(point[1],...architecturalSolids().map(s=>Math.hypot(...authored.map((v,k)=>Math.max(s.min[k]-v,0,v-s.max[k])))));
}
test('continuous physical crossing: solid clearance, near plane, forward aim and reversal',()=>{
  for(const [w,h] of sizes){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2;
    assert.deepEqual(crossingPose(a,d,0),openingPose(a,d));
    const start=approachPose(a,d,1),join=crossingPose(a,d,APPROACH_END);
    assert.ok(Math.abs(start.eye[2]-join.eye[2])<1e-8);
    let previous=Infinity;
    for(let i=0;i<=2000;i++){
      const q=crossingPose(a,d,i/2000),[x,y,z]=q.eye;
      assert.ok(z<=previous+1e-8&&y>=1.8&&y<=2.6&&q.vp.every(Number.isFinite));
      assert.ok(z-q.aim[2]>1);
      if(z<=0)assert.ok(Math.abs(x)<=1.2&&z>=THROAT_END_Z-1e-8);
      previous=z;assert.ok(clearance(q.eye)>=.35);
      const forward=unit(q.aim.map((v,k)=>v-q.eye[k])),right=unit(cross(forward,[0,1,0])),up=cross(right,forward);
      const near=.08,halfH=near*Math.tan(q.fov*Math.PI/360),halfW=halfH*a;
      for(const u of [-1,1])for(const v of [-1,1]){
        const corner=q.eye.map((n,k)=>n+near*forward[k]+(u+q.shiftX)*halfW*right[k]+(v+q.shiftY)*halfH*up[k]);
        assert.ok(clearance(corner)>=.35,'near-plane clearance');
      }
    }
    assert.ok(Math.abs(previous-THROAT_END_Z)<1e-8);
    const ps=[0,.15,.35,.45,.55,.7,.85,1];
    assert.deepEqual(ps.map(p=>crossingPose(a,d,p)),ps.slice().reverse().map(p=>crossingPose(a,d,p)).reverse());
    assert.equal(approachProgress(0),0);assert.equal(approachProgress(APPROACH_END),1);assert.equal(approachProgress(1),1);
  }
});
test('matched nonzero tangent at approach junction; moving reflection remains aligned',()=>{
  for(const [w,h] of sizes){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2,e=.00001;
    const l=crossingPose(a,d,APPROACH_END-e),c=crossingPose(a,d,APPROACH_END),r=crossingPose(a,d,APPROACH_END+e);
    const vl=(c.eye[2]-l.eye[2])/e,vr=(r.eye[2]-c.eye[2])/e;
    assert.ok(vl<-1&&Math.abs(vl-vr)<.01);
    for(const p of [0,.35,.45,.6,.8,1]){
      const {eye,vp}=crossingPose(a,d,p),source=[2.4,3,-5.8],mirror=[2.4,-3,-5.8];
      const t=eye[1]/(eye[1]-mirror[1]),hit=eye.map((n,i)=>n+(mirror[i]-n)*t);
      const x=project(multiply(vp,FLOOR_MIRROR),source),y=project(vp,hit);
      for(let i=0;i<2;i++)assert.ok(Math.abs(x[i]/x[3]-y[i]/y[3])<1e-5);
    }
  }
});
