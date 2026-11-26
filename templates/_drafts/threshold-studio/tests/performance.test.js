import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bufferSize} from '../src/lifecycle.js';
import {reflectionSize} from '../src/reflection.js';
test('balanced quality lowers pixel work while preserving aspect',()=>{
 for(const [w,h,dpr] of [[390,844,3],[430,932,3],[1440,900,2],[844,390,3]]){
  const old=bufferSize(w,h,dpr),now=bufferSize(w,h,dpr,4096,'balanced');
  assert(now.width*now.height<old.width*old.height);
  assert(now.width*now.height<=850000);
  assert(Math.abs(now.width/now.height-w/h)<.01);
  const r=reflectionSize(now.width,now.height,1024,'balanced');
  assert(r.width<=Math.max(1,now.width*.35)&&r.height<=Math.max(1,now.height*.35));
 }
});
