import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodeDavid} from '../src/david.js';
import {architecturalSolids} from '../src/geometry.js';
import {revealPose,project} from '../src/camera.js';
test('actual David scan is intact, correctly placed and completely framed',()=>{
 const data=JSON.parse(readFileSync(new URL('../assets/david/david.mesh.json',import.meta.url),'utf8'));
 const vertices=decodeDavid(data);
 assert.equal(vertices.length,18012*27);
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<18000*27;i+=9){
   const p=[vertices[i],vertices[i+1],-vertices[i+2]];
   for(let k=0;k<3;k++){min[k]=Math.min(min[k],p[k]);max[k]=Math.max(max[k],p[k]);}
   assert(Math.abs(Math.hypot(vertices[i+6],vertices[i+7],vertices[i+8])-1)<1e-6,'normalized scan vertex '+i/9);
 }
 assert(min[0]>2.6&&Math.abs(min[1]-.32)<.001&&max[1]<5);
 assert(architecturalSolids().every(s=>!min.every((v,k)=>v<s.max[k]&&max[k]>s.min[k])));
 for(const [w,h] of [[320,568],[320,844],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080],[844,390]]){
   const a=w/h,q=revealPose(a,w>=900&&h>=480&&a>=1.2,1);
   for(let i=0;i<18000*27;i+=9){
     const v=project(q.vp,[vertices[i],vertices[i+1],vertices[i+2]]);
     const x=.5+.5*v[0]/v[3],y=.5-.5*v[1]/v[3];
     assert(v[3]>.08&&x>.04&&x<.96&&y>.06&&y<(a<1.2?.67:.98));
     if(a>=1.2)assert(x>.45);
   }
 }
});
