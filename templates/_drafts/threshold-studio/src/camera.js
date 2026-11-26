// Column-major matrices; right-handed world, +Y up, -Z forward.
import { worldPoint } from './config.js?v=P05';
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

// T16: physically traverse the red cut and stop inside its throat, before
// the ivory reveal. Hermite depth has matching nonzero tangent at the join.
export const APPROACH_END=.45, THROAT_END_Z=-4.8;
export function approachProgress(progress){
  return clamp01((Number.isFinite(progress)?progress:0)/APPROACH_END);
}
function hermite(t,m0,m1){
  return t*t*(3-2*t)+m0*t*(1-t)*(1-t)+m1*t*t*(t-1);
}
export function crossingPose(aspect,desktopComposition=false,progress=0,exitVelocity=0){
  const p=Number.isFinite(progress)?clamp01(progress):0;
  const first=openingPose(aspect,desktopComposition);
  if(p===0)return first;
  const middle=approachPose(aspect,desktopComposition,1);
  const a=first.eye[2]-middle.eye[2],b=middle.eye[2]-THROAT_END_Z;
  const velocity=Math.min(2*a/APPROACH_END,2*b/(1-APPROACH_END),(a+b)*1.1);
  let eye,aim,fov,shiftX,shiftY;
  if(p<=APPROACH_END){
    const t=p/APPROACH_END,prior=approachPose(aspect,desktopComposition,t);
    eye=[...prior.eye];
    eye[2]=first.eye[2]-a*hermite(t,0,velocity*APPROACH_END/a);
    ({aim,fov,shiftX,shiftY}=prior);
  }else{
    const t=(p-APPROACH_END)/(1-APPROACH_END),e=t*t*(3-2*t);
    const travel=b*hermite(t,velocity*(1-APPROACH_END)/b,Math.max(0,exitVelocity)*(1-APPROACH_END)/b);
    const r=clamp01(travel/2),ramp=r*r*(3-2*r);
    eye=[0,2.25,middle.eye[2]-travel];
    // Aim moves into the same room; no look-at reversal as Z passes zero.
    aim=[0,3-.35*e,-travel*ramp];
    fov=middle.fov;shiftX=shiftY=0;
  }
  const lens=perspective(fov,aspect);
  lens[8]=shiftX;lens[9]=shiftY;
  return {eye,aim,fov,shiftX:lens[8],shiftY:lens[9],vp:multiply(lens,lookAt(eye,aim))};
}

// T17: continuous extension from the enclosed throat into Perspective.
// Temporary draft allocation, before the exhibition and final room are built.
export const REVEAL_JOIN=.72,REVEAL_END_Z=-11.5,REVEAL_VELOCITY=17;
export function revealPose(aspect,desktopComposition=false,progress=0,exitVelocity=0){
  const p=Number.isFinite(progress)?clamp01(progress):0;
  const localVelocity=REVEAL_VELOCITY*REVEAL_JOIN;
  if(p<=REVEAL_JOIN)return crossingPose(aspect,desktopComposition,p/REVEAL_JOIN,localVelocity);
  const start=crossingPose(aspect,desktopComposition,1,localVelocity),t=(p-REVEAL_JOIN)/(1-REVEAL_JOIN),e=t*t*(3-2*t),distance=start.eye[2]-REVEAL_END_Z;
  const travel=distance*hermite(t,REVEAL_VELOCITY*(1-REVEAL_JOIN)/distance,Math.max(0,exitVelocity)*(1-REVEAL_JOIN)/distance);
  const wide=desktopComposition||aspect>=1.2,eye=[mix(start.eye[0],wide?-.8:-1.1,e),mix(start.eye[1],wide?2.5:2.3,e),start.eye[2]-travel];
  const offset=start.aim.map((v,i)=>v-start.eye[i]),targetAim=wide?[4.1,2.5,-16.5]:[4.6,1.6,-15.8],targetEye=[wide?-.8:-1.1,wide?2.5:2.3,REVEAL_END_Z];
  const aim=eye.map((v,i)=>v+mix(offset[i],targetAim[i]-targetEye[i],e));
  let endFov=wide?64:83;if(!wide&&aspect<.46)endFov=2*Math.atan(Math.tan(endFov*Math.PI/360)*.46/aspect)*180/Math.PI;
  const fov=mix(start.fov,endFov,e),lens=perspective(fov,aspect);
  return {eye,aim,fov,shiftX:0,shiftY:0,vp:multiply(lens,lookAt(eye,aim))};
}

// T24: physical exit from Perspective, with continuous depth velocity.
export const EXHIBITION_JOIN=.60,EXHIBITION_END_Z=-25.5,EXHIBITION_VELOCITY=12;
export function exhibitionPose(aspect,desktopComposition=false,progress=0){
  const p=Number.isFinite(progress)?clamp01(progress):0;
  if(p<=EXHIBITION_JOIN)return revealPose(aspect,desktopComposition,p/EXHIBITION_JOIN,EXHIBITION_VELOCITY*EXHIBITION_JOIN);
  const start=revealPose(aspect,desktopComposition,1,EXHIBITION_VELOCITY*EXHIBITION_JOIN),t=(p-EXHIBITION_JOIN)/(1-EXHIBITION_JOIN);
  const d=start.eye[2]-EXHIBITION_END_Z,travel=d*hermite(t,EXHIBITION_VELOCITY*(1-EXHIBITION_JOIN)/d,0);
  const centering=clamp01(t/.48),e=centering*centering*(3-2*centering),wide=desktopComposition||aspect>=1.2;
  const eye=[mix(start.eye[0],0,e),mix(start.eye[1],2.3,e),start.eye[2]-travel];
  const offset=start.aim.map((v,i)=>v-start.eye[i]),aim=eye.map((v,i)=>v+mix(offset[i],[0,.8,-9][i],e));
  let fovTarget=wide?54:65;if(!wide&&aspect<.46)fovTarget=2*Math.atan(Math.tan(fovTarget*Math.PI/360)*.46/aspect)*180/Math.PI;
  const fov=mix(start.fov,fovTarget,e);
  return {eye,aim,fov,shiftX:0,shiftY:0,vp:multiply(perspective(fov,aspect),lookAt(eye,aim))};
}

// P02: moving editorial spread; optical shift only, physical path unchanged.
export function graphicComposition(pose,aspect,localProgress,presence=1){
  const t=clamp01((localProgress-.72)/.14);
  const amount=t*t*(3-2*t)*clamp01(presence);
  if(amount===0)return pose;
  const shift=aspect>=1.2?.36:.10;
  const lens=perspective(pose.fov,aspect);
  lens[8]=pose.shiftX+shift*amount;lens[9]=pose.shiftY;
  return {...pose,shiftX:lens[8],vp:multiply(lens,lookAt(pose.eye,pose.aim))};
}
