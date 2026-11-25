// Neutral diagnostic meshes; final portal begins at T05.
export function buildStudy(){
  const data=[];
  const quad=(a,b,c,d,color)=>{for(const p of [a,b,c,a,c,d])data.push(...p,...color)};
  function box(x,y,z,w,h,d,color){
    const l=x-w/2,r=x+w/2,b=y,t=y+h,n=z+d/2,f=z-d/2;
    const shade=k=>color.map(v=>v*k);
    quad([l,b,n],[r,b,n],[r,t,n],[l,t,n],color);
    quad([r,b,f],[l,b,f],[l,t,f],[r,t,f],shade(.65));
    quad([l,b,f],[l,b,n],[l,t,n],[l,t,f],shade(.78));
    quad([r,b,n],[r,b,f],[r,t,f],[r,t,n],shade(.65));
    quad([l,t,n],[r,t,n],[r,t,f],[l,t,f],shade(1.16));
    quad([l,b,f],[r,b,f],[r,b,n],[l,b,n],shade(.5));
  }
  quad([-9,0,8],[9,0,8],[9,0,-12],[-9,0,-12],[.20,.21,.22]);
  box(-.9,0,0,1.65,3.7,1.5,[.72,.34,.26]);
  box(1.5,0,-.75,1.5,1.8,1.4,[.64,.67,.63]);
  return new Float32Array(data);
}
