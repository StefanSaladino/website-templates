import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAmbientClock,localIntensity,AMBIENT_PERIOD} from '../src/ambient.js';
test('ambient active clock wraps seamlessly and never catches up from suspension',()=>{
  const c=createAmbientClock();
  assert.equal(c.sample(0).elapsed,0);
  for(let t=20;t<=AMBIENT_PERIOD;t+=20)c.sample(t);
  assert.equal(c.elapsed,0);
  c.sample(AMBIENT_PERIOD+20);
  c.pause();const elapsed=c.elapsed;
  assert.equal(c.sample(100000).elapsed,elapsed);
  assert.equal(c.sample(100100).elapsed,elapsed+50);
});
test('local illumination bounded, spatial and periodic; draws throttled independently of phase',()=>{
  const c=createAmbientClock();
  assert.equal(c.sample(0).render,true);assert.equal(c.sample(16).render,false);
  assert.equal(c.sample(34).render,true);assert.equal(c.sample(35,true).render,true);
  for(let p=0;p<=Math.PI*2;p+=.025){
    const v=localIntensity(p,1,2);
    assert.ok(v>=.955-1e-12&&v<=1.045+1e-12);
    assert.ok(Math.abs(v-localIntensity(p+2*Math.PI,1,2))<1e-12);
  }
  assert.notEqual(localIntensity(0,0,0),localIntensity(0,2,0));
  assert.equal(localIntensity(-1,0,0),1);
});
