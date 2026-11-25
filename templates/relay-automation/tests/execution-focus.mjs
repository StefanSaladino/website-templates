import assert from 'node:assert/strict';
import { evaluateExecutionFocus, executionNodeWeight, evaluateSceneState } from '../src/scenes.js';
for (const mobile of [true, false]) {
  let prev = null;
  for (let i = 0; i <= 10000; i++) {
    const p = i / 10000, s = evaluateSceneState(p, mobile);
    const weights = Array.from({ length: 6 }, (_, n) => executionNodeWeight(n, s.focus));
    assert(weights.every(x => x >= 0 && x <= 1));
    assert(Math.abs(weights.reduce((a,b) => a+b, 0) - s.focus.amount) < 1e-9);
    assert.deepEqual(s, evaluateSceneState(p, mobile));
    if (prev) assert(Math.max(...weights.map((x,j) => Math.abs(x-prev[j]))) < .01);
    prev = weights;
  }
}
assert.equal(evaluateExecutionFocus(0).amount, 0);
assert.equal(evaluateExecutionFocus(1).amount, 0);
console.log('PASS 20,002 deterministic scene states; bounded and complementary focus weights');
