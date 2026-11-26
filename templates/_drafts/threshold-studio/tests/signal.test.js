import {test} from 'node:test';
import assert from 'node:assert/strict';
import {signalRoute} from '../src/signal.js';
test('shortest available path is computed for every relay combination',()=>{
 for(let mask=0;mask<8;mask++){
  const online={A:!!(mask&1),B:!!(mask&2),C:!!(mask&4)};
  const expected=online.A?['S','A','T']:online.B&&online.C?['S','B','C','T']:[];
  assert.deepEqual(signalRoute(online),expected);
  assert.deepEqual(signalRoute(online),expected);
 }
 const path=signalRoute();path[0]='x';assert.deepEqual(signalRoute(),['S','A','T']);
});
