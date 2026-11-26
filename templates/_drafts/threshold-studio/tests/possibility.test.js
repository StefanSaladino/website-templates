import {test} from 'node:test';
import assert from 'node:assert/strict';
import {closingPose,exhibitionPose,CLOSING_ARRIVE,CLOSING_DEPART,CLOSING_END_Z} from '../src/camera.js';
import {architecturalSolids,buildStudy} from '../src/geometry.js';
test('closing route keeps every earlier pose and a stationary exploration dwell',()=>{
 for(const [w,h] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
  const a=w/h,d=w>=900&&h>=480&&a>=1.2;
  for(let i=0;i<=100;i++){const p=i/100;assert.deepEqual(closingPose(a,d,p*CLOSING_ARRIVE),exhibitionPose(a,d,Math.min(1,p*CLOSING_ARRIVE/CLOSING_ARRIVE)))}
  assert.deepEqual(closingPose(a,d,CLOSING_DEPART),exhibitionPose(a,d,1));
  let prev=-25.5;for(let i=0;i<=1000;i++){const p=CLOSING_DEPART+(1-CLOSING_DEPART)*i/1000,q=closingPose(a,d,p);assert(q.eye[2]<=prev+1e-8&&q.vp.every(Number.isFinite));prev=q.eye[2]}
  assert.equal(prev,CLOSING_END_Z);
 }
 assert.equal(architecturalSolids().length,34);assert.equal(architecturalSolids(true).length,44);
 assert.equal(buildStudy(true).length-buildStudy().length,120*18);
});

test('closing framing stays centered until the passage then settles continuously',()=>{
 for(const [w,h] of [[320,568],[390,844],[768,1024],[1440,900],[844,390]]){
   const aspect=w/h,wide=aspect>=1.2,desktop=w>=900&&h>=480&&wide;
   let previous=0;
   for(let i=0;i<=2000;i++){
     const p=CLOSING_DEPART+(1-CLOSING_DEPART)*i/2000,pose=closingPose(aspect,desktop,p);
     const shift=wide?pose.shiftX:-pose.shiftY;
     if(pose.eye[2]>=-39)assert(Math.abs(shift)<1e-8);
     assert(shift>=previous-1e-8);
     assert(shift<=(wide?.33:.30)+1e-8);
     previous=shift;
   }
   assert(Math.abs(previous-(wide?.33:.30))<1e-8);
 }
});
