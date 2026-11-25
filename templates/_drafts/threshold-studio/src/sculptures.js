// T20: two grounded folded sculptures. Cross-sections use authored x,y,s.
// Mitered pairs are explicit, allowing later fixed-hinge choreography without
// regenerating topology. These are closed solids, not double-sided flat cards.
export const FOLDS=[
  {id:'crease',sections:[[-4.8088,13.7306,-4.5912,13.4694,4.6],[-3.7723,14.5943,-3.2277,14.6057,5.15],[-4.9757,15.5151,-4.3243,15.4449,3.15],[-3.2921,16.3039,-3.1479,15.9961,4.15]],outer:[.83,.81,.76],inner:[.65,.63,.58],edge:[.72,.70,.65]},
  {id:'offset',sections:[[5.3423,13.8901,5.4577,14.2099,3.15],[3.1721,14.6738,4.0279,14.7262,4.65],[4.754,15.4754,5.406,15.4246,5.35],[4.0506,15.9821,4.2494,16.2579,3.75]],outer:[.64,.66,.65],inner:[.48,.50,.49],edge:[.73,.74,.72]}
];
export function foldTriangles(fold){
  const triangles=[];
  const quad=(a,b,c,d,color)=>{triangles.push({points:[a,b,c],color},{points:[a,c,d],color})};
  const rings=fold.sections.map(([ax,as,bx,bs,h])=>[[ax,0,as],[bx,0,bs],[bx,h,bs],[ax,h,as]]);
  for(let i=0;i<rings.length-1;i++){
    const a=rings[i],b=rings[i+1];
    for(let k=0;k<4;k++){
      const next=(k+1)%4;
      quad(a[k],a[next],b[next],b[k],k===1?fold.inner:k===3?fold.outer:fold.edge);
    }
  }
  quad(rings[0][3],rings[0][2],rings[0][1],rings[0][0],fold.edge);
  const last=rings.at(-1);
  quad(last[0],last[1],last[2],last[3],fold.edge);
  return triangles;
}
export function sculptureBounds(fold){
  const points=foldTriangles(fold).flatMap(t=>t.points);
  return {id:fold.id,min:[0,1,2].map(k=>Math.min(...points.map(v=>v[k]))),max:[0,1,2].map(k=>Math.max(...points.map(v=>v[k])))};
}

// T21: fixed terminal cross-sections and a continuous reshape of the
// intermediate folds. Both sides of every ring move together, preserving
// thickness and connectivity; this is an authored morph, not rigid hinges.
const SHIFTS=Object.freeze({crease:[0,-.65,.80,0],offset:[0,.85,-.70,0]});
export function foldAmount(fold,progress){
  const [start,end]=fold.id==='crease'?[.76,.96]:[.80,1];
  const t=Math.max(0,Math.min(1,((Number.isFinite(progress)?progress:0)-start)/(end-start)));
  return t*t*(3-2*t);
}
export function foldPose(fold,progress){
  const e=foldAmount(fold,progress);
  if(e===0)return fold;
  return {...fold,sections:fold.sections.map(([ax,as,bx,bs,h],i)=>{
    const dx=SHIFTS[fold.id][i]*e;
    return [ax+dx,as,bx+dx,bs,h];
  })};
}
