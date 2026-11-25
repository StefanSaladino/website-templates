import {test} from 'node:test';
import assert from 'node:assert/strict';
import {architecturalSolids,buildStudy} from '../src/geometry.js';
import {revealPose,project} from '../src/camera.js';
test('six architectural gallery masses preserve lane, original shell and future sculpture space',()=>{
  const solids=architecturalSolids(),gallery=solids.filter(s=>s.id.startsWith('perspective-'));
  assert.equal(gallery.length,6);assert.equal(solids.length,25);assert.equal(buildStudy().length,358*18);
  for(const s of gallery){
    assert.ok(s.min[2]>=6&&s.max[2]<=20&&s.min[1]>=0&&s.max[1]<=10);
    assert.ok(s.max[0]<=-2.6||s.min[0]>=2.6||s.min[1]>=8.5,s.id);
  }
  // Reframe toward the interior, not the dark exit: the right fin face is
  // visible in the final portrait and wide view, with a forward camera basis.
  for(const [w,h] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2,q=revealPose(a,d,1);
    const point=project(q.vp,[3.75,3.8,-16.65]);
    assert.ok(point[3]>.08&&Math.abs(point[0]/point[3])<1&&Math.abs(point[1]/point[3])<1,'visible architectural fin');
    assert.ok(q.aim[0]>2&&q.eye[2]-q.aim[2]>1);
  }
});
