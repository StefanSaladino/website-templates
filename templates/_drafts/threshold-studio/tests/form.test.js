import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formPose} from '../src/form.js';
test('the same four glyphs fit each distinct composition without overlap',()=>{
 const names=['wordmark','stack','poster'];const seen=new Set();
 for(const name of names){
  const p=formPose(name);assert.equal(p.key,name);assert.equal(p.poses.length,4);
  seen.add(JSON.stringify(p.poses));
  const boxes=p.poses.map(([x,y,s])=>{assert(s>0);assert(x>=20&&y>=0&&x+70*s<=460&&y+100*s<=240);return [x,y,x+70*s,y+100*s]});
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const [a,b,c,d]=boxes[i],[e,f,g,h]=boxes[j];assert(c<=e||g<=a||d<=f||h<=b);}
  p.poses[0][0]=-1;assert.notEqual(formPose(name).poses[0][0],-1);
 }
 assert.equal(seen.size,3);assert.deepEqual(formPose('bad'),formPose('wordmark'));
});
