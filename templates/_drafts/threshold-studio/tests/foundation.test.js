import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lookAt,perspective,multiply,project,studyCamera} from '../src/camera.js';
import {bufferSize,createScheduler,MAX_PIXELS} from '../src/lifecycle.js';
import {buildStudy,architecturalSolids,PORTAL} from '../src/geometry.js';
test('camera basis and perspective conventions',()=>{
  const m=multiply(perspective(60,1,.1,100),lookAt([0,0,5],[0,0,0]));
  const p=project(m,[0,0,0]);assert.ok(Math.abs(p[0])<1e-6&&Math.abs(p[1])<1e-6&&p[3]>0);
  assert.ok(project(m,[1,0,0])[0]>0);
  const n=project(m,[0,0,4.9]);assert.ok(Math.abs(n[2]/n[3]+1)<1e-4);
  for(const a of [.4,.8,1,1.6,2.2])assert.ok([...studyCamera(a)].every(Number.isFinite));
  assert.throws(()=>lookAt([0,0,0],[0,0,0]),RangeError);
});
test('mesh and bounded buffers',()=>{
  const data=buildStudy();assert.equal(data.length,230*3*6);assert.ok([...data].every(Number.isFinite));
  for(const [w,h,d] of [[320,568,3],[390,844,3],[1920,1080,2],[7680,4320,4],[1,100000,4],[100000,1,4]]){
    const b=bufferSize(w,h,d);assert.ok(b.width*b.height<=MAX_PIXELS&&b.width<=4096&&b.height<=4096);
  }
  assert.equal(bufferSize(0,100,2),null);
});
test('one pending frame, suspend, resume and dispose',()=>{
  const jobs=new Map();let next=0,draws=0,eligible=true;
  const s=createScheduler({request:cb=>{jobs.set(++next,cb);return next},cancel:id=>jobs.delete(id),draw:()=>draws++,eligible:()=>eligible});
  function flush(){for(const [id,cb] of [...jobs]){jobs.delete(id);cb()}}
  s.invalidate();s.invalidate();assert.equal(jobs.size,1);flush();assert.equal(draws,1);assert.equal(jobs.size,0);
  s.invalidate();eligible=false;s.sync();assert.equal(jobs.size,0);flush();assert.equal(draws,1);
  eligible=true;s.sync();assert.equal(jobs.size,1);flush();assert.equal(draws,2);
  s.invalidate();s.dispose();assert.equal(jobs.size,0);s.invalidate();flush();assert.equal(draws,2);
});

test('architectural cut is traversable and all solids have valid dimensions',()=>{
  assert.deepEqual(PORTAL,{width:6,height:7.2,clearWidth:4.8,clearHeight:6,depth:2});
  const solids=architecturalSolids();
  assert.equal(solids.length,19);
  for(const {min,max} of solids)assert.ok(min.every((v,i)=>Number.isFinite(v)&&max[i]>v));
  const find=id=>solids.find(s=>s.id===id);
  assert.deepEqual(find('portal-left').max,[-2.4,6,2]);
  assert.deepEqual(find('portal-right').min,[2.4,0,0]);
  assert.equal(find('portal-head').min[1],6);
  // The entire main center aisle, not just the center point, is clear.
  for(const {id,min,max} of solids)assert.ok(max[0]<=-1.8||min[0]>=1.8||min[1]>=2.95||max[1]<=1.45,id+' intersects route clearance');
  for(const a of [.46,.75,.8,1.33,1.78]){
    const m=studyCamera(a);
    for(const x of [-3,3])for(const y of [0,7.2])for(const s of [0,2]){
      const q=project(m,[x,y,-s]);assert.ok(q[3]>0&&Math.abs(q[0]/q[3])<1&&Math.abs(q[1]/q[3])<1,'portal corner in study frame');
    }
  }
});
