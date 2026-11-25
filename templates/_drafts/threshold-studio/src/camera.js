// Column-major matrices; right-handed world, +Y up, -Z forward.
import { worldPoint } from './config.js?v=T14';
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function unit(v){const n=Math.hypot(...v);if(!Number.isFinite(n)||n<1e-8)throw new RangeError('Degenerate camera basis');return v.map(x=>x/n)}
export function lookAt(eye,aim){
  const z=unit(sub(eye,aim)),x=unit(cross([0,1,0],z)),y=cross(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
export function perspective(fov,aspect,near=.08,far=80){
  if(![fov,aspect,near,far].every(Number.isFinite)||fov<=0||fov>=180||aspect<=0||near<=0||far<=near)throw new RangeError('Invalid frustum');
  const f=1/Math.tan(fov*Math.PI/360),d=1/(near-far);
  return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*d,-1,0,0,2*far*near*d,0]);
}
export function multiply(a,b){
  const out=new Float32Array(16);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];
  return out;
}
export function project(m,p){
  const v=[...p,1],q=[0,0,0,0];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)q[r]+=m[c*4+r]*v[c];return q;
}
// T02 endpoints retained; T08 applies a desktop-only off-axis composition.
// T11 runtime openingPose below supplies independently authored portrait/landscape cameras.
export const DESKTOP_COMPOSITION_QUERY='(min-width: 900px) and (min-height: 480px) and (min-aspect-ratio: 6/5)';
export function studyPose(aspect,desktopComposition=false){
  const phone=[.6,2.2,-15,0,3.9,0,57], tablet=[.3,2.4,-12.8,-.15,3.65,0,49], desktop=[-2.4,2.4,-12,-.65,2.9,0,47];
  const a=aspect<.75?phone:tablet,b=aspect<.75?tablet:desktop;
  const t=Math.max(0,Math.min(1,aspect<.75?(aspect-.46)/.29:(aspect-.75)/.70));
  const p=desktopComposition?desktop:a.map((v,i)=>v+(b[i]-v)*t);
  const eye=worldPoint(...p.slice(0,3)),aim=worldPoint(...p.slice(3,6));
  const lens=perspective(p[6],aspect);
  // Off-axis projection preserves the world and all reflection alignment.
  if(desktopComposition)lens[8]=-.27;
  return {eye,aim,fov:p[6],shiftX:lens[8],shiftY:lens[9],vp:multiply(lens,lookAt(eye,aim))};
}
export function studyCamera(aspect,desktopComposition=false){return studyPose(aspect,desktopComposition).vp}

// Full-viewport opening camera. Keep legacy studyPose for foundational math tests.
export function openingPose(aspect,desktopComposition=false){
  if(desktopComposition)return studyPose(aspect,true);
  if(aspect>=1.2)return studyPose(aspect,true);
  const phone=[.6,2.2,-15,0,3.9,0,57],tablet=[.3,2.4,-15.5,-.15,3.9,0,54];
  const t=Math.max(0,Math.min(1,(aspect-.46)/.29));
  const p=phone.map((v,i)=>v+(tablet[i]-v)*t);
  const eye=worldPoint(...p.slice(0,3)),aim=worldPoint(...p.slice(3,6));
  // For especially tall/narrow devices preserve horizontal clearance, not crop.
  const fov=aspect<.46?2*Math.atan(Math.tan(p[6]*Math.PI/360)*.46/aspect)*180/Math.PI:p[6];
  const lens=perspective(fov,aspect);
  lens[9]=-.03; // portrait optical shift: 1.5% upward, reflection stays aligned
  return {eye,aim,fov,shiftX:lens[8],shiftY:lens[9],vp:multiply(lens,lookAt(eye,aim))};
}
export function openingComposition(aspect,desktopComposition=false){
  return desktopComposition?'desktop':aspect>=1.2?'landscape':'portrait';
}

// T14: approach-only track. Its local 0–1 interval temporarily spans the
// reachable draft scroll range; later journey chapters will extend the track.
const clamp01=v=>Math.max(0,Math.min(1,v));
const mix=(a,b,t)=>a+(b-a)*t;
export function approachPose(aspect,desktopComposition=false,progress=0){
  const start=openingPose(aspect,desktopComposition);
  const t=Number.isFinite(progress)?clamp01(progress):0;
  if(t===0)return start;
  const wide=desktopComposition||aspect>=1.2;
  const tablet=clamp01((aspect-.46)/.29);
  const targetEye=wide?[0,2.25,5.8]:[0,2.25,mix(8.1,6.5,tablet)];
  const targetAim=[0,3,0];
  let targetFov=wide?52:mix(68,58,tablet);
  if(!wide&&aspect<.46)targetFov=2*Math.atan(Math.tan(targetFov*Math.PI/360)*.46/aspect)*180/Math.PI;
  // Smoothstep produces zero endpoint velocity and the same pose on reversal.
  const e=t*t*(3-2*t);
  const eye=start.eye.map((v,i)=>mix(v,targetEye[i],e));
  const aim=start.aim.map((v,i)=>mix(v,targetAim[i],e));
  const fov=mix(start.fov,targetFov,e);
  const lens=perspective(fov,aspect);
  lens[8]=mix(start.shiftX,0,e);lens[9]=mix(start.shiftY,0,e);
  return {eye,aim,fov,shiftX:lens[8],shiftY:lens[9],vp:multiply(lens,lookAt(eye,aim))};
}
