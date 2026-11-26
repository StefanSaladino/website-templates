import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parallaxPose,ALIGNMENT_VIEW,DEPTHS} from '../src/parallax.js';
test('pinhole depth layers align at exactly one viewpoint and remain reversible',()=>{
 assert.deepEqual(parallaxPose(ALIGNMENT_VIEW).offsets,[0,0,0]);
 for(let v=-100;v<=100;v++){
  const p=parallaxPose(v);assert.equal(p.aligned,v===ALIGNMENT_VIEW);
  assert.deepEqual(p,parallaxPose(v));
  for(let i=0;i<DEPTHS.length;i++)assert(Math.abs(p.offsets[i]*DEPTHS[i]-(ALIGNMENT_VIEW-v)*240)<1e-8);
  for(const x of p.offsets)assert(240+x-79>=0&&240+x+79<=480);
 }
 assert.deepEqual(parallaxPose(Infinity),parallaxPose(0));assert.deepEqual(parallaxPose(200),parallaxPose(100));
});
