// One continuous path, evaluated by native scroll position. No scene swaps.
export const CHAPTERS=['opening','object','finish','everyday','final'];
export const DESKTOP=[
 {x:.71,y:.45,scale:.40,yaw:-22,pitch:14,roll:27,light:-40,distance:6.5,studio:0},
 {x:.70,y:.53,scale:.46,yaw:-42,pitch:8,roll:-24,light:-18,distance:5.2,studio:.18},
 {x:.69,y:.50,scale:.51,yaw:26,pitch:-10,roll:32,light:64,distance:4.9,studio:1},
 {x:.72,y:.50,scale:.41,yaw:14,pitch:8,roll:82,light:14,distance:6.3,studio:.12},
 {x:.72,y:.49,scale:.38,yaw:0,pitch:4,roll:89,light:-30,distance:6.8,studio:0}
];
export const BRIDGES=[
 {x:.705,y:.49,scale:.43,yaw:-32,pitch:11,roll:2,light:-29,distance:5.8,studio:.08},
 {x:.695,y:.51,scale:.485,yaw:-9,pitch:-1,roll:4,light:23,distance:5.05,studio:.58},
 {x:.705,y:.50,scale:.46,yaw:20,pitch:-1,roll:58,light:39,distance:5.6,studio:.5},
 {x:.72,y:.495,scale:.395,yaw:7,pitch:6,roll:85.5,light:-8,distance:6.55,studio:.06}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>t*t*(3-2*t);
const TRACK=DESKTOP.flatMap((pose,i)=>i<BRIDGES.length?[pose,BRIDGES[i]]:[pose]);
function slope(a,b){return a*b<=0?0:2*a*b/(a+b)}
// Shape-preserving C1 curve: no forced stop at intermediate chapter boundaries,
// no unnecessary rotational overshoot, exact authored poses.
export function interpolatePose(progress,frames=DESKTOP){const track=frames===DESKTOP?TRACK:frames,p=clamp(progress*(frames===DESKTOP?2:1),0,track.length-1),i=Math.min(track.length-2,Math.floor(p)),t=p-i,a=track[i],b=track[i+1];return Object.fromEntries(Object.keys(a).map(k=>{const d=b[k]-a[k],m0=i?slope(a[k]-track[i-1][k],d):0,m1=i+2<track.length?slope(d,track[i+2][k]-b[k]):0;if(t===0)return [k,a[k]];if(t===1)return [k,b[k]];return [k,(2*t*t*t-3*t*t+1)*a[k]+(t*t*t-2*t*t+t)*m0+(-2*t*t*t+3*t*t)*b[k]+(t*t*t-t*t)*m1]}))}
export function chapterProgress(scroll,anchors){if(anchors.length!==CHAPTERS.length)throw Error('Expected five chapter anchors');for(let i=1;i<anchors.length;i++)if(anchors[i]<=anchors[i-1])throw Error('Nonascending chapter anchors');if(scroll<=anchors[0])return 0;for(let i=1;i<anchors.length;i++)if(scroll<=anchors[i])return i-1+(scroll-anchors[i-1])/(anchors[i]-anchors[i-1]);return anchors.length-1}
// Card stays within one stage. A continuous cap replaces the old binary size threshold.
// Account for rotation so the final vertical pose fits without cropping.
export function stageFrame(pose,w,h,compact=false){const rad=Math.PI/180,roll=pose.roll*rad,aspect=1.766/2.8,extentX=Math.abs(Math.cos(roll))+aspect*Math.abs(Math.sin(roll)),extentY=Math.abs(Math.sin(roll))+aspect*Math.abs(Math.cos(roll));const cx=compact?w*(.5+(pose.x-.71)*.55):w*pose.x,cy=compact?h*(.5+(pose.y-.5)*.35):h*pose.y;const desired=compact?Math.min(w*(.71+(pose.scale-.40)*.6),h*.89):Math.min(w*pose.scale,h*(.83+.24*clamp(pose.studio,0,1)));const xMargin=compact?12:Math.min(76,w*.065),yMargin=compact?12:18;const safeWidth=Math.min(2*Math.max(1,Math.min(cx-xMargin,w-cx-xMargin))/(extentX*1.12),2*Math.max(1,Math.min(cy-yMargin,h-cy-yMargin))/(extentY*1.12));return {cx,cy,size:Math.max(1,Math.min(desired,safeWidth))}}
const PAINT=[[240,239,234],[240,239,234],[21,21,28],[240,239,234],[216,245,75]];
export function stageColour(progress){const p=clamp(progress,0,4),i=Math.min(3,Math.floor(p)),t=ease(p-i);return PAINT[i].map((v,k)=>Math.round(v+(PAINT[i+1][k]-v)*t))}
export function advanceProgress(current,target,dt){if(!Number.isFinite(current)||Math.abs(target-current)<.0005)return target;const next=current+(target-current)*(1-Math.exp(-Math.max(1,Math.min(80,dt))/48));return Math.abs(target-next)<.0005?target:next}
