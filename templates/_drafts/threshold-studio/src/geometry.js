// T05 geometry preserved: one continuous architectural shell. All authored dimensions use (x,y,s).
// Face colors are flat geometry-study identifiers, not the final light/material model.
import {worldPoint} from './config.js?v=P03';
import {FOLDS,foldTriangles,foldPose} from './sculptures.js?v=P03';
export const PORTAL=Object.freeze({width:6,height:7.2,clearWidth:4.8,clearHeight:6,depth:2});
const coal=[.105,.11,.12], wing=[.055,.06,.068], red=[.80,.18,.115], redDeep=[.53,.105,.07], ivory=[.70,.68,.63], ivorySide=[.59,.57,.53];
const solid=(id,min,max,color,faces={})=>({id,min,max,color,faces});
export function architecturalSolids(){
  return [
    solid('portal-left',[-3,0,0],[-2.4,6,2],coal,{right:red}),
    solid('portal-right',[2.4,0,0],[3,6,2],coal,{left:red}),
    solid('portal-head',[-3,6,0],[3,7.2,2],coal,{bottom:red}),
    solid('left-wing',[-10,0,.35],[-3,11,2],wing),
    solid('right-wing',[3,0,.35],[10,11,2],wing),
    solid('upper-wing',[-3,7.2,.35],[3,11,2],wing),
    solid('arrival-left',[-10.4,0,-18],[-10,11,2],wing),
    solid('arrival-right',[10,0,-18],[10.4,11,2],wing),
    solid('arrival-fin',[-7.6,0,-4],[-6.9,8.8,-1.6],[.09,.095,.105]),
    solid('arrival-overhead',[-10,10.4,-5],[10,11,-.6],[.075,.08,.09]),
    solid('throat-left',[-3,0,2],[-2.4,6,6],coal,{right:redDeep}),
    solid('throat-right',[2.4,0,2],[3,6,6],coal,{left:redDeep}),
    solid('throat-head',[-3,6,2],[3,7.2,6],coal,{bottom:redDeep}),
    solid('ivory-left',[-9.4,0,6],[-9,10,20],ivorySide),
    solid('ivory-right',[9,0,6],[9.4,10,20],ivorySide),
    solid('ivory-ceiling',[-9,10,6],[9,10.4,20],ivory),
    solid('ivory-far-left',[-9,0,20],[-2.8,6.5,20.4],ivory),
    solid('ivory-far-right',[2.8,0,20],[9,6.5,20.4],ivory),
    solid('ivory-far-head',[-9,6.5,20],[9,10,20.4],ivory),
    // T19: asymmetrical stone architecture; all upright masses remain outside
    // the central aisle and leave room for the future independent folded sculptures.
    solid('perspective-left-return',[-9,0,9.8],[-5.8,8.8,10.35],[.74,.72,.67]),
    solid('perspective-right-return',[5.65,0,12.9],[9,8.8,13.65],[.76,.74,.69]),
    solid('perspective-left-deep-return',[-9,0,16.7],[-4.4,9.1,17.35],[.71,.69,.64]),
    solid('perspective-right-fin',[3.45,0,16.65],[4.05,8.4,18.15],[.76,.74,.70]),
    solid('perspective-ceiling-near',[-9,8.85,9.5],[9,10,10.2],[.70,.68,.64]),
    solid('perspective-ceiling-deep',[-9,8.7,14.9],[9,10,15.5],[.73,.71,.67]),
    // T24 basic connector and shell; detailed exhibition bays follow in T25.
    solid('connector-left',[-3.25,0,20.4],[-2.8,6.5,23],[.10,.19,.72]),
    solid('connector-right',[2.8,0,20.4],[3.25,6.5,23],[.10,.19,.72]),
    solid('connector-head',[-3.25,6.5,20.4],[3.25,7.1,23],[.10,.19,.72]),
    solid('cobalt-left',[-11.4,0,23],[-11,11,40],[.12,.22,.80]),
    solid('cobalt-right',[11,0,23],[11.4,11,40],[.12,.22,.80]),
    solid('cobalt-ceiling',[-11,11,23],[11,11.4,40],[.095,.17,.64]),
    solid('cobalt-far-left',[-11,0,40],[-2.8,6.5,40.4],[.10,.19,.72]),
    solid('cobalt-far-right',[2.8,0,40],[11,6.5,40.4],[.10,.19,.72]),
    solid('cobalt-far-head',[-11,6.5,40],[11,11,40.4],[.10,.19,.72])
  ];
}
export function buildStudy(){
  const data=[];
  const quad=(a,b,c,d,color)=>{for(const p of [a,b,c,a,c,d])data.push(...worldPoint(...p),...color)};
  // Continuous floor with no sill in the traversable aperture.
  quad([-11.4,0,-18],[11.4,0,-18],[11.4,0,40.4],[-11.4,0,40.4],[.15,.155,.16]);
  for(const {min,max,color,faces} of architecturalSolids()){
    const [l,b,n]=min,[r,t,f]=max;
    const shade=(face,k)=>faces[face]??color.map(v=>v*k);
    quad([l,b,n],[r,b,n],[r,t,n],[l,t,n],shade('front',1));
    quad([r,b,f],[l,b,f],[l,t,f],[r,t,f],shade('back',.72));
    quad([l,b,f],[l,b,n],[l,t,n],[l,t,f],shade('left',.78));
    quad([r,b,n],[r,b,f],[r,t,f],[r,t,n],shade('right',.82));
    quad([l,t,n],[r,t,n],[r,t,f],[l,t,f],shade('top',1.12));
    quad([l,b,f],[r,b,f],[r,b,n],[l,b,n],shade('bottom',.67));
  }
  // Append installations to the same persistent geometry buffer; both direct
  // and reflected passes use this exact mesh. Existing floor stays first.
  data.push(...buildSculptureVertices(0));
  return new Float32Array(data);
}
export function buildSculptureVertices(progress=0){
  const data=[];
  for(const fold of FOLDS)for(const {points,color} of foldTriangles(foldPose(fold,progress))){
    for(const point of points)data.push(...worldPoint(...point),...color);
  }
  return new Float32Array(data);
}
