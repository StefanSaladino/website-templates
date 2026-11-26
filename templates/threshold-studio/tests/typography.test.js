import {test} from 'node:test';
import assert from 'node:assert/strict';
import {typographyPose} from '../src/typography.js';
const sizes=[[320,568],[390,844],[768,1024],[844,390],[1440,900],[1920,1080]];
test('opening preserved, monotone continuous text departure and exact reversal',()=>{
  for(const [w,h] of sizes){
    const wide=w/h>=1.2,initial=typographyPose(0,wide);
    assert.equal(initial.markOpacity,1);assert.equal(initial.copyOpacity,1);
    const states=Array.from({length:1001},(_,i)=>typographyPose(i/1000,wide));
    assert.deepEqual(states,Array.from({length:1001},(_,i)=>typographyPose((1000-i)/1000,wide)).reverse());
    for(let i=1;i<states.length;i++){
      const a=states[i-1],b=states[i];
      for(const key of Object.keys(a))assert.ok(Number.isFinite(b[key])&&Math.abs(a[key]-b[key])<.01,key);
      assert.ok(b.markY<=a.markY&&b.markOpacity<=a.markOpacity&&b.copyOpacity<=a.copyOpacity);
      assert.ok(b.copyX<=a.copyX&&b.copyY>=a.copyY);
    }
    assert.deepEqual(typographyPose(.12,wide),initial);
    assert.equal(typographyPose(.65,wide).markOpacity,0);
    const end=typographyPose(.76,wide);
    assert.equal(end.copyOpacity,0);assert.equal(end.footerOpacity,0);
    assert.deepEqual(end,typographyPose(1,wide));
    assert.ok(wide?end.copyX<0&&end.copyY===0:end.copyY>0&&end.copyX===0);
  }
});
test('clamping, smooth boundaries and static fallback',()=>{
  for(const wide of [false,true]){
    assert.deepEqual(typographyPose(-1,wide),typographyPose(0,wide));
    assert.deepEqual(typographyPose(NaN,wide),typographyPose(0,wide));
    assert.deepEqual(typographyPose(2,wide),typographyPose(1,wide));
    for(const p of [.12,.28,.36,.46,.65,.76]){
      const a=typographyPose(p-.0001,wide),b=typographyPose(p+.0001,wide);
      for(const k of Object.keys(a))assert.ok(Math.abs(a[k]-b[k])<.002,k);
    }
  }
});
