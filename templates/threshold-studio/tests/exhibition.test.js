import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingPose,revealPose,exhibitionPose,EXHIBITION_JOIN,EXHIBITION_END_Z,EXHIBITION_VELOCITY} from '../src/camera.js';
import {architecturalSolids,buildStudy} from '../src/geometry.js';
import {FOLDS,foldPose,sculptureBounds} from '../src/sculptures.js';
import {perspectivePresence} from '../src/editorial.js';
const sizes=[[320,568],[320,844],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080],[844,390]];
const unit=v=>v.map(x=>x/Math.hypot(...v)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const boxes=[...architecturalSolids(),...FOLDS.map(f=>sculptureBounds(foldPose(f,1)))];
function clearance(point){
  const p=[point[0],point[1],-point[2]];
  return Math.min(point[1],...boxes.map(s=>Math.hypot(...p.map((v,k)=>Math.max(s.min[k]-v,0,v-s.max[k])))));
}
test('exhibition path preserves near-plane clearance, matched velocity and exact reversal',()=>{
  for(const [w,h] of sizes){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2;
    assert.deepEqual(exhibitionPose(a,d,0),openingPose(a,d));
    assert.deepEqual(exhibitionPose(a,d,EXHIBITION_JOIN),revealPose(a,d,1,EXHIBITION_VELOCITY*EXHIBITION_JOIN));
    let prior=Infinity;
    for(let i=0;i<=3000;i++){
      const q=exhibitionPose(a,d,i/3000);
      assert.ok(q.eye[2]<=prior+1e-8&&q.eye[2]-q.aim[2]>1&&q.vp.every(Number.isFinite));
      prior=q.eye[2];assert.ok(clearance(q.eye)>=.35);
      const forward=unit(q.aim.map((v,k)=>v-q.eye[k])),right=unit(cross(forward,[0,1,0])),up=cross(right,forward);
      const hh=.08*Math.tan(q.fov*Math.PI/360),hw=hh*a;
      for(const u of [-1,1])for(const v of [-1,1]){
        const point=q.eye.map((n,k)=>n+.08*forward[k]+(u+q.shiftX)*hw*right[k]+(v+q.shiftY)*hh*up[k]);
        assert.ok(clearance(point)>=.35);
      }
      if(q.eye[2]<=-20.4&&q.eye[2]>=-23)assert.ok(Math.abs(q.eye[0])<.3);
    }
    assert.equal(prior,EXHIBITION_END_Z);
    const ps=[0,.25,.5,.6,.68,.8,.9,1];
    assert.deepEqual(ps.map(p=>exhibitionPose(a,d,p)),ps.slice().reverse().map(p=>exhibitionPose(a,d,p)).reverse());
    const e=.00001,l=exhibitionPose(a,d,EXHIBITION_JOIN-e),m=exhibitionPose(a,d,EXHIBITION_JOIN),r=exhibitionPose(a,d,EXHIBITION_JOIN+e);
    const vl=(m.eye[2]-l.eye[2])/e,vr=(r.eye[2]-m.eye[2])/e;
    assert.ok(vl<-1&&Math.abs(vl-vr)<.02);
  }
});
test('cobalt shell preserves aisle and editorial exits before connector',()=>{
  const solids=architecturalSolids(),blue=solids.filter(s=>/^(connector|cobalt)-/.test(s.id));
  assert.equal(blue.length,9);assert.equal(solids.length,34);assert.equal(buildStudy().length,466*18);
  for(const s of blue){assert.ok(s.min[2]>=20.4&&s.max[2]<=40.4);assert.ok(s.max[0]<=-2.8||s.min[0]>=2.8||s.min[1]>=6.5)}
  assert.equal(perspectivePresence(.6),1);assert.equal(perspectivePresence(.68),0);
  for(let i=1;i<=1000;i++)assert.ok(perspectivePresence(i/1000)<=perspectivePresence((i-1)/1000));
  for(const [w,h] of sizes)assert.ok(exhibitionPose(w/h,w>=900&&h>=480&&w/h>=1.2,.68).eye[2]>-20.4);
});
