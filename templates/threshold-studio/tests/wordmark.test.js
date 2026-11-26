import {test} from 'node:test';
import assert from 'node:assert/strict';
import {studyPose,project} from '../src/camera.js';
import {wordmarkOcclusion,WORDMARK_WIDTH,WORDMARK_HEIGHT} from '../src/wordmark.js';
test('wordmark occlusion matches physical front projection at desktop sizes',()=>{
  for(const [w,h] of [[1024,768],[1440,900],[1920,1080]]){
    const {vp}=studyPose(w/h,true);
    const stage={x:0,y:0,width:w,height:h},mark={x:.04*w,y:.12*h,width:.92*w,height:.17*h};
    const points=wordmarkOcclusion(vp,stage,mark).split(' ').map(pair=>pair.split(',').map(Number));
    assert.equal(points.length,4);assert.ok(points.flat().every(Number.isFinite));
    const corners=[[-3,7.2,0],[3,7.2,0],[3,0,0],[-3,0,0]];
    for(let i=0;i<4;i++){
      const q=project(vp,corners[i]),x=mark.x+points[i][0]/WORDMARK_WIDTH*mark.width,y=mark.y+points[i][1]/WORDMARK_HEIGHT*mark.height;
      assert.ok(Math.abs(x-(.5+.5*q[0]/q[3])*w)<.002);
      assert.ok(Math.abs(y-(.5-.5*q[1]/q[3])*h)<.002);
    }
    assert.ok(points[0][0]>250&&points[1][0]<1000&&points[0][0]<points[1][0]);
    assert.ok(Math.min(points[0][1],points[1][1])<103&&Math.max(points[2][1],points[3][1])>130);
  }
  assert.equal(wordmarkOcclusion(studyPose(1.6,true).vp,{width:0,height:0},{width:0,height:0}),'');
});
