import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scrollProgress,readProgress} from '../src/scroll.js';
test('measured endpoints, clamping and no unreachable progress',()=>{
  for(const h of [390,568,844,900,1080]){
    const total=h*5+13;
    assert.equal(scrollProgress(0,total,h),0);
    assert.equal(scrollProgress(total-h,total,h),1);
    assert.equal(scrollProgress(-30,total,h),0);
    assert.equal(scrollProgress(total,total,h),1);
  }
  assert.equal(scrollProgress(100,600,600),0);
  assert.equal(scrollProgress(NaN,600,200),0);
});
test('same native position gives same progress in either direction',()=>{
  const positions=[0,100,223.5,500,1000,1200];
  const forward=positions.map(y=>scrollProgress(y,1500,300));
  const reverse=positions.slice().reverse().map(y=>scrollProgress(y,1500,300)).reverse();
  assert.deepEqual(forward,reverse);
  assert.equal(readProgress({scrollTop:300,scrollHeight:1200,clientHeight:600}),.5);
  assert.equal(readProgress(null),0);
});
