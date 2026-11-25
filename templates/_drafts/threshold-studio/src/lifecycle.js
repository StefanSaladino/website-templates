// One outstanding frame, no perpetual idle loop.
export function createScheduler({request,cancel,draw,eligible}){
  let pending=null,dirty=true,disposed=false;
  function flush(){pending=null;if(disposed||!eligible()||!dirty)return;dirty=false;draw()}
  function sync(){
    if(disposed||!eligible()){if(pending!==null){cancel(pending);pending=null}return}
    if(dirty&&pending===null)pending=request(flush);
  }
  return {invalidate(){if(!disposed){dirty=true;sync()}},sync,dispose(){disposed=true;sync()},get pending(){return pending!==null}};
}
export const MAX_PIXELS=1500000,MAX_DPR=1.75;
export function bufferSize(width,height,dpr=1,maxEdge=4096){
  if(![width,height,dpr,maxEdge].every(Number.isFinite)||width<=0||height<=0||maxEdge<1)return null;
  const scale=Math.min(Math.max(.1,dpr),MAX_DPR,Math.sqrt(MAX_PIXELS/(width*height)),maxEdge/width,maxEdge/height);
  const w=Math.max(1,Math.floor(width*scale)),h=Math.max(1,Math.floor(height*scale));
  return {width:Math.min(w,MAX_PIXELS),height:Math.min(h,Math.max(1,Math.floor(MAX_PIXELS/w)))};
}
