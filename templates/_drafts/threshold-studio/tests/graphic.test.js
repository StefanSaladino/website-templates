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

// Review the actual aligned installation against the unchanged Perspective camera.
// Projection is geometric evidence, not a substitute for rendered contrast/occlusion.
import {revealPose,project,graphicComposition,exhibitionPose} from '../src/camera.js';
test('aligned graphic fits the final viewport and reserves portrait editorial space',()=>{
 for(const [w,h] of [[320,568],[390,844],[430,932],[768,1024],[1440,900],[844,390],[1024,768]]){
  const aspect=w/h,pose=revealPose(aspect,w>=900&&h>=480&&aspect>=1.2,1);
  const mesh=graphicMesh(1),xs=[],ys=[];
  for(let i=0;i<mesh.length;i+=6){
   const q=project(pose.vp,Array.from(mesh.slice(i,i+3)));
   assert(q[3]>0);
   xs.push((q[0]/q[3]+1)/2);ys.push((1-q[1]/q[3])/2);
  }
  assert(Math.min(...xs)>.03&&Math.max(...xs)<.98,'horizontal frame '+w);
  assert(Math.min(...ys)>.07&&Math.max(...ys)<.90,'vertical frame '+w);
  if(aspect<1.2)assert(Math.max(...ys)<.67,'portrait editorial reservation '+w);
  else assert(Math.min(...xs)>.40,'wide graphic to right of copy '+w);
 }
});

test('graphic editorial composition creates a dedicated right column or centered portrait',()=>{
 for(const [w,h] of [[320,568],[390,844],[430,932],[768,1024],[1440,900],[844,390],[1024,768],[1920,1080],[1280,1024]]){
  const aspect=w/h,desktop=w>=900&&h>=480&&aspect>=1.2;
  const opening=revealPose(aspect,desktop,.72);
  assert.equal(graphicComposition(opening,aspect,.72),opening);
  const physical=revealPose(aspect,desktop,1),pose=graphicComposition(physical,aspect,1);
  assert.deepEqual(pose.eye,physical.eye);assert.deepEqual(pose.aim,physical.aim);assert.equal(pose.fov,physical.fov);
  assert.equal(graphicComposition(physical,aspect,1,0),physical);
  assert.deepEqual(pose,graphicComposition(physical,aspect,1));
  const mesh=graphicMesh(1),xs=[],ys=[];
  for(let i=0;i<mesh.length;i+=6){
   const q=project(pose.vp,Array.from(mesh.slice(i,i+3)));
   xs.push((q[0]/q[3]+1)/2);ys.push((1-q[1]/q[3])/2);
  }
  assert(Math.min(...xs)>.03&&Math.max(...xs)<.98,'installation framed '+w);
  if(aspect>=1.2)assert(Math.max(...xs)<.70,'right editorial reservation '+w);
  else assert(Math.max(...ys)<.67,'portrait editorial reservation '+w);
  const connector=exhibitionPose(aspect,desktop,.68);
  assert.equal(graphicComposition(connector,aspect,1,0),connector);
 }
});
