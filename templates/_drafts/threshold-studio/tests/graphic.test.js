import {test} from 'node:test';
import assert from 'node:assert/strict';
import {graphicMesh,graphicAmount,GRAPHIC_TRIANGLES} from '../src/graphic.js';
test('typographic planes remain grounded, reversible and outside the travel lane',()=>{
 const initial=graphicMesh(0),final=graphicMesh(1);
 assert.equal(initial.length,GRAPHIC_TRIANGLES*18);
 assert.notDeepEqual(initial,final);
 assert.deepEqual(initial,graphicMesh(.75));
 for(let i=0;i<=1000;i++){
  const p=i/1000,v=graphicMesh(p);
  assert.deepEqual(v,graphicMesh(p));
  for(let j=0;j<v.length;j+=6){assert(v[j]>2.5&&v[j+1]>=0&&v[j+1]<=5.201&&-v[j+2]>12&&-v[j+2]<17);assert(v.slice(j,j+6).every(Number.isFinite))}
 }
 assert.equal(graphicAmount(0),0);assert.equal(graphicAmount(1),1);
});
