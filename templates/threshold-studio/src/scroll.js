// The browser's reachable native scroll range is the only progress authority.
export function scrollProgress(offset,contentHeight,viewportHeight){
  if(![offset,contentHeight,viewportHeight].every(Number.isFinite))return 0;
  const range=Math.max(0,contentHeight-viewportHeight);
  return range===0?0:Math.min(1,Math.max(0,offset/range));
}
export function readProgress(scroller){
  return scroller?scrollProgress(scroller.scrollTop,scroller.scrollHeight,scroller.clientHeight):0;
}
