// Column-major matrices; right-handed world, +Y up, -Z forward.
import { worldPoint } from './config.js?v=T07';
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
// T07 static study camera uses the T02 authored endpoints with continuous aspect blending.
// The in-flow surface is not final full-viewport framing (T08/T11).
export function studyPose(aspect){
  const phone=[.6,2.2,-15,0,3.9,0,57], tablet=[.3,2.4,-12.8,-.15,3.65,0,49], desktop=[-2.4,2.4,-12,-.65,2.9,0,47];
  const a=aspect<.75?phone:tablet,b=aspect<.75?tablet:desktop;
  const t=Math.max(0,Math.min(1,aspect<.75?(aspect-.46)/.29:(aspect-.75)/.70));
  const p=a.map((v,i)=>v+(b[i]-v)*t);
  const eye=worldPoint(...p.slice(0,3)),aim=worldPoint(...p.slice(3,6));
  return {eye,vp:multiply(perspective(p[6],aspect),lookAt(eye,aim))};
}
export function studyCamera(aspect){return studyPose(aspect).vp}
