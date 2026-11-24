import assert from 'node:assert/strict';
import '../../templates/calibre-watch/mechanism.js';
const M=globalThis.CalibreMechanism,near=(a,b)=>assert(Math.abs(a-b)<1e-9,a+' != '+b);
const a=M.state(0),b=M.state(10),c=M.state(23.5);
for(let i=1;i<M.gears.length;i++){const p=M.gears[i-1],q=M.gears[i];near(Math.hypot(q.x-p.x,q.y-p.y),p.radius+q.radius);near((b.gears[i]-a.gears[i])*q.teeth,-(b.gears[i-1]-a.gears[i-1])*p.teeth);near((c.gears[i]-b.gears[i])*q.teeth,-(c.gears[i-1]-b.gears[i-1])*p.teeth);const phi=Math.atan2(q.y-p.y,q.x-p.x),phase=p.teeth*(phi-a.gears[i-1])+q.teeth*(phi+Math.PI-a.gears[i]);near(Math.cos(phase),-1);}
near(b.hands[0],-Math.PI/3);near(b.hands[1],b.hands[0]/60);near(b.hands[2],b.hands[1]/12);
assert.deepEqual(M.state(-1),a);assert.deepEqual(M.state(NaN),a);assert.deepEqual(M.state(10),b);for(let t=0;t<2;t+=.01)assert(Math.abs(M.state(t).balance)<=.460000001);
console.log('PASS: CALIBRE pitch distances, signed tooth ratios, contact phase, common clock, hands, bounded balance, deterministic state');
