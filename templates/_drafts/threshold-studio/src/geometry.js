// T05 geometry preserved: one continuous architectural shell. All authored dimensions use (x,y,s).
// Face colors are flat geometry-study identifiers, not the final light/material model.
import {worldPoint} from './config.js?v=T06';
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
    solid('ivory-far-head',[-9,6.5,20],[9,10,20.4],ivory)
  ];
}
export function buildStudy(){
  const data=[];
  const quad=(a,b,c,d,color)=>{for(const p of [a,b,c,a,c,d])data.push(...worldPoint(...p),...color)};
  // Continuous floor with no sill in the traversable aperture.
  quad([-10.4,0,-18],[10.4,0,-18],[10.4,0,20.4],[-10.4,0,20.4],[.15,.155,.16]);
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
  return new Float32Array(data);
}
