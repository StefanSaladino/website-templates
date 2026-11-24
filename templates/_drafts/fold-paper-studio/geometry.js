// Geometry is a continuous strip of eight hinged planes, not a rotating
// product or a raster image. Angles alternate about the vertical crease axis.
export const PANELS=8;
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export function geometry(openness,panelWidth){
 const angle=(1-clamp(openness,0,1))*Math.PI*0.385,dx=panelWidth*Math.cos(angle),dz=panelWidth*Math.sin(angle),start=-PANELS*dx/2;
 return Array.from({length:PANELS},(_,i)=>({x:start+i*dx,z:(i%2? -1:1)*dz/2,angle:(i%2?-1:1)*angle,shade:(i%2?.29:.035)*Math.sin(angle)}));
}
export function endOfPanel(panel,width){return {x:panel.x+width*Math.cos(panel.angle),z:panel.z-width*Math.sin(panel.angle)}}
export function advance(current,target,dt){const next=current+(target-current)*(-Math.expm1(-Math.min(48,Math.max(1,dt))/75));return Math.abs(next-target)<.0003?target:next}
