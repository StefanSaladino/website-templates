import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reflectionSize,MAX_REFLECTION_PIXELS,FLOOR_MIRROR} from '../src/reflection.js';
import {studyPose,multiply,project} from '../src/camera.js';
test('reflection target bounded by pixel count, half scale and hardware edge',()=>{
  for(const [w,h,limit] of [[320,400,1024],[390,488,1024],[1920,1080,1024],[4096,4096,1024],[1,4096,512],[100,100,64]]){
    const r=reflectionSize(w,h,limit);assert.ok(r.width*r.height<=MAX_REFLECTION_PIXELS&&r.width<=limit&&r.height<=limit);
    assert.ok(r.width<=Math.max(1,w*.5)&&r.height<=Math.max(1,h*.5));
  }
  assert.equal(reflectionSize(0,20),null);
});
test('mirror projection meets actual floor reflection point',()=>{
  for(const aspect of [.46,.75,1.78]){
    const {eye,vp}=studyPose(aspect),source=[2.4,3,-1],mirrored=[source[0],-source[1],source[2]];
    const t=eye[1]/(eye[1]-mirrored[1]),hit=eye.map((v,i)=>v+(mirrored[i]-v)*t);
    assert.ok(Math.abs(hit[1])<1e-9);
    const a=project(multiply(vp,FLOOR_MIRROR),source),b=project(vp,hit);
    for(let i=0;i<2;i++)assert.ok(Math.abs(a[i]/a[3]-b[i]/b[3])<1e-6);
    const onFloor=[1,0,3],c=project(multiply(vp,FLOOR_MIRROR),onFloor),d=project(vp,onFloor);
    assert.deepEqual(c,d);
  }
});
