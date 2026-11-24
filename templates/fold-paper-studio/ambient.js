// Original animated contour field: analytic 3D terrain projected to canvas.
// No reference footage, image assets, external dependencies or copied artwork.
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
export function projectContour(x,z,phase,w,h,centerX,centerY){
 const p=1/(1+.67*z);
 // Two asymmetric peaks with a quiet central valley for the actual paper.
 const left=Math.exp(-((x+.49)*(x+.49))/.075);
 const right=Math.exp(-((x-.53)*(x-.53))/.095);
 const crest=left*.86+right*.73;
 const envelope=smooth(1.08,.72,Math.abs(x));
 const ripple=.09*Math.sin(x*21+z*7+phase)+.044*Math.sin(x*39-z*11-phase*.7);
 const height=(crest*(.87+.14*Math.sin(z*6+x*4+phase)) + ripple*crest)*envelope;
 const span=w*.5;
 return {x:centerX+(x*span+Math.sin(z*3+phase)*w*.013)*p,
 y:centerY+(z-.48)*h*.25-height*h*.49*p,depth:z};
}
export function createContourField(node){
 const canvas=node.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:true});
 let w=0,h=0,ratio=1,frames=0;
 if(!ctx)return null;
 function size(){const b=node.getBoundingClientRect();if(b.width<1||b.height<1)return false;
  // Cap actual pixel budget, particularly on high-DPR phones.
  w=b.width;h=b.height;ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt(1250000/(w*h)));
  canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));return true;}
 function draw(phase=0){
  if(!w||!h)return;
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
  const compact=innerWidth<=1000,ink=node.id==='ink-space';
  const span=w*(compact?1.08: .78),centerX=w*(ink?.55:compact?.5:.72);
  const centerY=h*(ink?.58:compact?.68:.60);
  const extent=Math.min(h*(compact?.56:.83),span*.79);
  const rows=compact?18:25,cols=compact?68:96;
  const points=Array.from({length:rows},(_,j)=>Array.from({length:cols+1},(_,i)=>projectContour(-1.12+i*2.24/cols,j/(rows-1),phase,span,extent,centerX,centerY)));
  // Far-to-near curves. Thin translucent silver strands have depth-dependent
  // contrast, with no filled mesh or opaque wall behind the object.
  ctx.lineJoin='round';ctx.lineCap='round';
  for(let j=rows-1;j>=0;j--){
   const opacity=.05+.20*(1-j/(rows-1));
   ctx.strokeStyle='rgba(182,190,205,'+opacity+')';ctx.lineWidth=j===0?1.3:.72;
   ctx.beginPath();points[j].forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  }
  // Sparse longitudinal threads describe the actual changing surface.
  for(let i=4;i<cols;i+=6){ctx.beginPath();ctx.strokeStyle='rgba(148,158,176,.08)';ctx.lineWidth=.6;for(let j=rows-1;j>=0;j--){const p=points[j][i];j===rows-1?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)}ctx.stroke()}
  // Restrained crest highlights, fragmented by surface height, not a neon glow.
  for(const j of [0,3,7]){
   const a=points[j];ctx.strokeStyle='rgba(224,228,232,'+(.44-j*.035)+')';ctx.lineWidth=1.05;
   for(const [lo,hi] of [[.18,.43],[.58,.82]]){ctx.beginPath();for(let i=Math.floor(cols*lo);i<=Math.floor(cols*hi);i++){const p=a[i];i===Math.floor(cols*lo)?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)}ctx.stroke()}
  }
  node.dataset.ready='true';node.dataset.frames=String(++frames);node.dataset.phase=phase.toFixed(5);
 }
 return {node,size,draw};
}
