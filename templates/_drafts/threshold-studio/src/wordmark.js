// The editorial wordmark stays legible above the cut; only its lower glyph band
// is occluded using the projected physical portal front silhouette.
import {project} from './camera.js?v=P08e';
import {PORTAL} from './geometry.js?v=P08e';
export const WORDMARK_WIDTH=1000, WORDMARK_HEIGHT=155;
export function wordmarkOcclusion(vp,stage,mark){
  if(!stage||!mark||![stage.width,stage.height,mark.width,mark.height].every(v=>Number.isFinite(v)&&v>0))return '';
  const half=PORTAL.width/2;
  const corners=[[-half,PORTAL.height,0],[half,PORTAL.height,0],[half,0,0],[-half,0,0]];
  const points=[];
  for(const p of corners){
    const q=project(vp,p);
    if(q[3]<=0||!q.every(Number.isFinite))return '';
    const screenX=stage.x+(.5+.5*q[0]/q[3])*stage.width;
    const screenY=stage.y+(.5-.5*q[1]/q[3])*stage.height;
    points.push(((screenX-mark.x)/mark.width*WORDMARK_WIDTH).toFixed(3)+','+((screenY-mark.y)/mark.height*WORDMARK_HEIGHT).toFixed(3));
  }
  return points.join(' ');
}
