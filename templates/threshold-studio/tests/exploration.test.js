import {test} from 'node:test';
import assert from 'node:assert/strict';
import {explorationPose} from '../src/editorial.js';
test('index reveals only inside the cobalt room, with deterministic reversible progress',()=>{
  for(const p of [0,.6,.8,.88,1])assert.deepEqual(explorationPose(p,false),{opacity:0,active:false});
  assert.deepEqual(explorationPose(.88),{opacity:0,active:false});
  assert.deepEqual(explorationPose(1),{opacity:1,active:true});
  let prior=0;
  for(let i=0;i<=1000;i++){const p=i/1000,s=explorationPose(p);assert(s.opacity>=prior&&s.opacity<=1);assert.deepEqual(s,explorationPose(p));prior=s.opacity;}
  assert.equal(explorationPose(.95).active,false);
});
