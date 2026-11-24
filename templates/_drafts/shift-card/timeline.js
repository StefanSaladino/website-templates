// Deterministic scroll choreography. No frame-count or direction-dependent state.
export const CHAPTERS=['opening','object','finish','everyday','final'];
export const DESKTOP=[
 {x:.77,y:.49,scale:.36,yaw:-22,pitch:14,roll:27,light:-40,distance:6.5,studio:0},
 {x:.75,y:.53,scale:.49,yaw:-42,pitch:8,roll:-24,light:-18,distance:5.2,studio:.18},
 {x:.74,y:.50,scale:.62,yaw:26,pitch:-10,roll:32,light:64,distance:4.6,studio:1},
 {x:.76,y:.50,scale:.43,yaw:14,pitch:8,roll:82,light:14,distance:6.3,studio:.12},
 {x:.76,y:.50,scale:.35,yaw:0,pitch:4,roll:89,light:-30,distance:6.8,studio:0}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>t*t*(3-2*t);
export function interpolatePose(progress,frames=DESKTOP){const p=clamp(progress,0,frames.length-1),i=Math.min(frames.length-2,Math.floor(p)),t=ease(p-i);return Object.fromEntries(Object.keys(frames[i]).map(k=>[k,frames[i][k]+(frames[i+1][k]-frames[i][k])*t]))}
export function chapterProgress(scroll,anchors){if(anchors.length!==CHAPTERS.length)throw Error('Expected five chapter anchors');for(let i=1;i<anchors.length;i++)if(anchors[i]<=anchors[i-1])throw Error('Nonascending chapter anchors');if(scroll<=anchors[0])return 0;for(let i=1;i<anchors.length;i++)if(scroll<=anchors[i])return i-1+(scroll-anchors[i-1])/(anchors[i]-anchors[i-1]);return anchors.length-1}
