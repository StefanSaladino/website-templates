import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {perspectivePose} from '../src/editorial.js';
test('editorial reveal is continuous, reversible and finishes after entering Perspective',()=>{
  assert.deepEqual(perspectivePose(0),{opacity:0,rise:20});
  assert.deepEqual(perspectivePose(.83),{opacity:0,rise:20});
  assert.deepEqual(perspectivePose(1),{opacity:1,rise:0});
  assert.deepEqual(perspectivePose(NaN),perspectivePose(0));
  const states=Array.from({length:2001},(_,i)=>perspectivePose(i/2000));
  assert.deepEqual(states,Array.from({length:2001},(_,i)=>perspectivePose((2000-i)/2000)).reverse());
  for(let i=1;i<states.length;i++){assert.ok(states[i].opacity>=states[i-1].opacity&&states[i].rise<=states[i-1].rise);assert.ok(states[i].opacity-states[i-1].opacity<.01)}
});
test('one semantic editorial section with three capabilities, not duplicated fallback content',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.equal((html.match(/id="perspective-heading"/g)||[]).length,1);
  assert.match(html,/<section class="perspective-editorial" aria-labelledby="perspective-heading">/);
  assert.match(html,/<h2 id="perspective-heading">/);
  const list=html.match(/<ul class="perspective-capabilities"[\s\S]*?<\/ul>/)?.[0];
  assert.equal((list?.match(/<li>/g)||[]).length,3);
});
