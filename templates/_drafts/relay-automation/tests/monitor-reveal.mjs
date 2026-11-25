import assert from 'node:assert/strict';
import { evaluateSceneState } from '../src/scenes.js';
let samples=0;
for(const mobile of [false,true]){
 for(let i=0;i<=20000;i++){
  const p=i/20000,s=evaluateSceneState(p,mobile);
  const partial=s.light>1e-9&&s.light<1-1e-9;
  if(partial)assert(s.copyWeights.every(w=>w<1e-9),`narrative over moving backdrop: ${p}`);
  if(s.copyWeights[4]>1e-9)assert.equal(s.light,1,`monitoring copy needs full light plane: ${p}`);
  if(s.monitor>1e-9)assert(Math.abs(s.sep)<1e-9,`monitor intersects separated planes: ${p}`);
  if(s.copyWeights[3]>1e-9||s.copyWeights[5]>1e-9)assert.equal(s.light,0,`dark copy needs dark plane: ${p}`);
  samples++;
 }
}
console.log(`PASS ${samples} reveal states; narrative/backdrop isolation and collapsed workspace depth`);
