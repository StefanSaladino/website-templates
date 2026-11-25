import {test} from 'node:test';
import assert from 'node:assert/strict';
import {revealPose,project} from '../src/camera.js';
import {FOLDS,foldPose,foldTriangles} from '../src/sculptures.js';
test('final OFFSET composition fits wide and portrait frames, leaving the mobile editorial margin',()=>{
  const offset=FOLDS.find(f=>f.id==='offset'),points=foldTriangles(foldPose(offset,1)).flatMap(t=>t.points);
  for(const [w,h] of [[320,568],[320,844],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080],[844,390]]){
    const a=w/h,d=w>=900&&h>=480&&a>=1.2,q=revealPose(a,d,1);
    const xy=points.map(([x,y,s])=>{const v=project(q.vp,[x,y,-s]);assert.ok(v[3]>.08);return [.5+.5*v[0]/v[3],.5-.5*v[1]/v[3]]});
    const minX=Math.min(...xy.map(p=>p[0])),maxX=Math.max(...xy.map(p=>p[0])),minY=Math.min(...xy.map(p=>p[1])),maxY=Math.max(...xy.map(p=>p[1]));
    assert.ok(minX>.04&&maxX<.96&&minY>.06&&maxY<.98,'complete framing '+w+'x'+h);
    if(a<1.2)assert.ok(maxY<.67,'reserve lower editorial margin');
    else assert.ok(minX>.45,'reserve left editorial margin');
  }
});
