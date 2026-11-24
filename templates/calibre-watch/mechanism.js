/* A deterministic illustrative external-gear train, not a certified movement. */
(() => {
'use strict';
const moduleSize=.036;
const teeth=[24,16,20,12],radii=teeth.map(n=>n*moduleSize/2);
const positions=[[-.55,.38],[-.55+radii[0]+radii[1],.38],[-.55+radii[0]+radii[1],.38-radii[1]-radii[2]],[-.55+radii[0]+radii[1]+radii[2]+radii[3],.38-radii[1]-radii[2]]];
const gears=teeth.map((n,i)=>Object.freeze({teeth:n,radius:radii[i],x:positions[i][0],y:positions[i][1]}));
function angles(seconds){
 const a=[seconds*.55];
 for(let i=1;i<gears.length;i++){
  const p=gears[i-1],q=gears[i],phi=Math.atan2(q.y-p.y,q.x-p.x);
  a.push(phi+Math.PI-(Math.PI-p.teeth*(phi-a[i-1]))/q.teeth);
 }
 return a;
}
function state(seconds){
 const s=Number.isFinite(seconds)?Math.max(0,seconds):0;
 return {seconds:s,gears:angles(s),balance:.46*Math.sin(s*2*Math.PI*2.5),escapement:Math.floor(s*5)*Math.PI/15,hands:[-s*Math.PI/30,-s*Math.PI/1800,-s*Math.PI/21600]};
}
globalThis.CalibreMechanism=Object.freeze({moduleSize,gears:Object.freeze(gears),state});
})();
