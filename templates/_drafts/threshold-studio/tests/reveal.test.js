import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingPose,crossingPose,revealPose,REVEAL_JOIN,REVEAL_VELOCITY,REVEAL_END_Z,project,multiply} from '../src/camera.js';
import {architecturalSolids} from '../src/geometry.js';
import {FLOOR_MIRROR} from '../src/reflection.js';
const sizes=[[320,568],[320,844],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080],[844,390]];
const solids=architecturalSolids(),unit=v=>v.map(x=>x/Math.hypot(...v)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function clearance(eye){const p=[eye[0],eye[1],-eye[2]];return Math.min(eye[1],...solids.map(s=>Math.hypot(...p.map((v,k)=>Math.max(s.min[k]-v,0,v-s.max[k])))))}
test('continuous reveal traverses throat into existing ivory room with actual geometry clearance',()=>{
  for(const [w,h] of sizes){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2;
    assert.deepEqual(revealPose(a,d,0),openingPose(a,d));
    assert.deepEqual(revealPose(a,d,REVEAL_JOIN),crossingPose(a,d,1,REVEAL_JOIN*REVEAL_VELOCITY));
    let previous=Infinity;
    for(let i=0;i<=2000;i++){
      const q=revealPose(a,d,i/2000),[x,y,z]=q.eye;
      assert.ok(z<=previous+1e-8&&z-q.aim[2]>1&&q.vp.every(Number.isFinite));previous=z;
      assert.ok(Math.abs(x)<=2.4+1e-8&&y>=1.8&&y<=2.6&&clearance(q.eye)>=.35);
      const forward=unit(q.aim.map((v,k)=>v-q.eye[k])),right=unit(cross(forward,[0,1,0])),up=cross(right,forward);
      const near=.08,hh=near*Math.tan(q.fov*Math.PI/360),hw=hh*a;
      for(const u of [-1,1])for(const v of [-1,1]){
        const point=q.eye.map((n,k)=>n+near*forward[k]+(u+q.shiftX)*hw*right[k]+(v+q.shiftY)*hh*up[k]);
        assert.ok(clearance(point)>=.35);
      }
    }
    assert.ok(Math.abs(previous-REVEAL_END_Z)<1e-8);
    const ps=[0,.15,.324,.5,.72,.8,.9,1];
    assert.deepEqual(ps.map(p=>revealPose(a,d,p)),ps.slice().reverse().map(p=>revealPose(a,d,p)).reverse());
  }
});
test('nonzero matched velocity at reveal boundary, forward aim and continuous reflection projection',()=>{
  for(const [w,h] of sizes){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2,e=.00001;
    for(const boundary of [.45*REVEAL_JOIN,REVEAL_JOIN]){
      const l=revealPose(a,d,boundary-e),c=revealPose(a,d,boundary),r=revealPose(a,d,boundary+e);
      const vl=(c.eye[2]-l.eye[2])/e,vr=(r.eye[2]-c.eye[2])/e;
      assert.ok(vl<-1&&Math.abs(vl-vr)<.02,'matched forward tangent');
      const ld=c.aim.map((n,k)=>(n-c.eye[k])-(l.aim[k]-l.eye[k])),rd=r.aim.map((n,k)=>(n-r.eye[k])-(c.aim[k]-c.eye[k]));
      assert.ok(Math.hypot(...ld.map((v,k)=>v-rd[k]))<.001);
    }
    for(const p of [0,.324,.55,.72,.8,.9,1]){
      const {eye,vp}=revealPose(a,d,p),source=[2.8,3,-19.8],mirror=[2.8,-3,-19.8];
      const t=eye[1]/(eye[1]-mirror[1]),hit=eye.map((n,i)=>n+(mirror[i]-n)*t);
      const x=project(multiply(vp,FLOOR_MIRROR),source),y=project(vp,hit);
      for(let i=0;i<2;i++)assert.ok(Math.abs(x[i]/x[3]-y[i]/y[3])<1e-5);
    }
  }
});
