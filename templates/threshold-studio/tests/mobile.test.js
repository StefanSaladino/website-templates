import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingPose,openingComposition,project,multiply,studyPose} from '../src/camera.js';
import {FLOOR_MIRROR} from '../src/reflection.js';
test('independent portrait opening has safe portal bounds at narrow, phone and tablet aspects',()=>{
  for(const [w,h] of [[320,568],[320,844],[390,844],[390,720],[430,932],[768,1024]]){
    const a=w/h,{vp}=openingPose(a),xs=[],ys=[];
    assert.equal(openingComposition(a),'portrait');
    for(const x of [-3,3])for(const y of [0,7.2])for(const s of [0,2]){
      const q=project(vp,[x,y,-s]);assert.ok(q[3]>0);
      xs.push(.5+.5*q[0]/q[3]);ys.push(.5-.5*q[1]/q[3]);
    }
    assert.ok(Math.min(...xs)>.06&&Math.max(...xs)<.95,'horizontal clearance');
    assert.ok(Math.min(...ys)>.25&&Math.max(...ys)<.76,'vertical safe bands');
    const center=(Math.min(...xs)+Math.max(...xs))/2;
    assert.ok(center>.47&&center<.53,'centered portrait');
  }
});
test('landscape and desktop keep rightward aperture and reflection alignment',()=>{
  assert.equal(openingComposition(844/390),'landscape');
  assert.equal(openingComposition(16/9,true),'desktop');
  assert.deepEqual(openingPose(16/9,true).vp,studyPose(16/9,true).vp);
  for(const [a,desktop] of [[844/390,false],[390/844,false],[16/9,true]]){
    const {eye,vp}=openingPose(a,desktop),source=[2.4,3,-1],mirror=[2.4,-3,-1];
    const t=eye[1]/(eye[1]-mirror[1]),hit=eye.map((v,i)=>v+(mirror[i]-v)*t);
    const r=project(multiply(vp,FLOOR_MIRROR),source),p=project(vp,hit);
    for(let i=0;i<2;i++)assert.ok(Math.abs(r[i]/r[3]-p[i]/p[3])<1e-6);
  }
});
