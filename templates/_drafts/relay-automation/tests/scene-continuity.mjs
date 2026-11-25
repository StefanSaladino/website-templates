import assert from 'node:assert/strict';
import { evaluateSceneState } from '../src/scenes.js';
const fields=['xPct','yPct','scale','rotX','rotY','sep','light','monitor','portraitRoom','edgeDraw'];
const bounds=[.035,.035,.003,.03,.03,.004,.004,.004,.004,.004];
let count=0;
for(const mobile of [false,true]){
 let before=evaluateSceneState(0,mobile);
 for(let i=1;i<=20000;i++){
  const p=i/20000,now=evaluateSceneState(p,mobile);
  fields.forEach((k,j)=>assert(Math.abs(now[k]-before[k])<bounds[j],`${k} discontinuity at ${p}`));
  assert(now.copyWeights.filter(x=>x>0).length<=1);
  assert.deepEqual(now,evaluateSceneState(p,mobile));
  before=now;count++;
 }
}
console.log(`PASS ${count} adjacent scene-state comparisons across desktop and portrait`);
