// P02: original, intentionally graphic modular letterforms, not a sculpture scan.
// Three floor-to-ceiling visual planes use one consistent spatial axis.
// S and E are bespoke rectilinear stencil forms: the voids are real negative space.
const clamp=v=>Math.max(0,Math.min(1,v));
const bone=[.91,.90,.86],ink=[.035,.035,.041],red=[1,.22,.137],edge=[.68,.67,.64];
const letters=[
 [[0,.75,1,1],[0,.46,.27,.75],[0,.39,1,.62],[.73,.24,1,.39],[0,0,1,.24]],
 [[0,0,.27,1],[.27,.75,1,1],[.27,.39,.86,.62],[.27,0,1,.24]],
 [[0,0,.27,1],[.27,.75,1,1],[.27,.39,.86,.62],[.27,0,1,.24]]
];
export function graphicAmount(progress){
 const t=clamp(((Number.isFinite(progress)?progress:0)-.75)/.24);
 return t*t*(3-2*t);
}
export function graphicMesh(progress=0){
 const e=graphicAmount(progress),out=[];
 const quad=(a,b,c,d,color)=>{for(const p of [a,b,c,a,c,d])out.push(...p,...color)};
 // Local U runs diagonally through the room; N points toward the approaching eye.
 // Each slab is rooted at the floor, and only translates along its own normal.
 for(let i=0;i<3;i++){
  const center=(i-1)*1.23,offset=[-.36,.45,-.30][i]*(1-e);
  const point=(u,y,n)=>[4.12+.64*u-.768*(n+offset),y,-14.98+.768*u+.64*(n+offset)];
  const l=center-.595,r=center+.595,b=0,t=5.2,front=.10,back=-.10;
  const q=(a,b,c,d,col)=>quad(point(...a),point(...b),point(...c),point(...d),col);
  q([l,b,front],[r,b,front],[r,t,front],[l,t,front],i===1?ink:bone);
  q([r,b,back],[l,b,back],[l,t,back],[r,t,back],edge);
  q([l,b,back],[l,b,front],[l,t,front],[l,t,back],red);
  q([r,b,front],[r,b,back],[r,t,back],[r,t,front],red);
  q([l,t,front],[r,t,front],[r,t,back],[l,t,back],edge);
  q([l,b,back],[r,b,back],[r,b,front],[l,b,front],edge);
  // Ink shares the slab transform and sits on its surface, not in screen space.
  for(const [x0,y0,x1,y1] of letters[i]){
    const a=center-.49+x0*.98,c=center-.49+x1*.98,d=1.05+y0*3.55,g=1.05+y1*3.55;
    q([a,d,front+.003],[c,d,front+.003],[c,g,front+.003],[a,g,front+.003],i===1?bone:ink);
  }
 }
 return new Float32Array(out);
}
export const GRAPHIC_TRIANGLES=62;
