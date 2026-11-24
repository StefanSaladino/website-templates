// Deterministic scroll choreography. No frame-count or direction-dependent state.
export const CHAPTERS=['opening','object','finish','everyday','final'];
export const DESKTOP=[
 {x:.73,y:.45,scale:.43,yaw:-22,pitch:14,roll:27,light:-40,distance:6.5,studio:0},
 {x:.75,y:.53,scale:.49,yaw:-42,pitch:8,roll:-24,light:-18,distance:5.2,studio:.18},
 {x:.74,y:.50,scale:.62,yaw:26,pitch:-10,roll:32,light:64,distance:4.6,studio:1},
 {x:.76,y:.50,scale:.43,yaw:14,pitch:8,roll:82,light:14,distance:6.3,studio:.12},
 {x:.73,y:.49,scale:.38,yaw:0,pitch:4,roll:89,light:-30,distance:6.8,studio:0}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>t*t*(3-2*t);
// Extra authored poses create purposeful camera arcs between chapter endpoints.
export const BRIDGES=[
 {x:.76,y:.49,scale:.46,yaw:-63,pitch:5,roll:4,light:-6,distance:5.6,studio:.08},
 {x:.77,y:.51,scale:.52,yaw:-9,pitch:-16,roll:4,light:27,distance:5.0,studio:.58},
 {x:.75,y:.50,scale:.50,yaw:46,pitch:-4,roll:58,light:40,distance:5.7,studio:.5},
 {x:.73,y:.49,scale:.41,yaw:-14,pitch:12,roll:100,light:-12,distance:6.5,studio:.06}
];
export function interpolatePose(progress,frames=DESKTOP){const p=clamp(progress,0,frames.length-1),i=Math.min(frames.length-2,Math.floor(p)),t=ease(p-i),a=frames[i],b=frames[i+1],m=frames===DESKTOP?BRIDGES[i]:null;return Object.fromEntries(Object.keys(a).map(k=>{const linear=a[k]+(b[k]-a[k])*t;return [k,m?linear+4*t*(1-t)*(m[k]-(a[k]+b[k])/2):linear]}))}
export function chapterProgress(scroll,anchors){if(anchors.length!==CHAPTERS.length)throw Error('Expected five chapter anchors');for(let i=1;i<anchors.length;i++)if(anchors[i]<=anchors[i-1])throw Error('Nonascending chapter anchors');if(scroll<=anchors[0])return 0;for(let i=1;i<anchors.length;i++)if(scroll<=anchors[i])return i-1+(scroll-anchors[i-1])/(anchors[i]-anchors[i-1]);return anchors.length-1}
