// T22: the existing native scroll sample owns the exhibition label.
const clamp=v=>Math.max(0,Math.min(1,v));
export function perspectivePose(progress){
  const p=Number.isFinite(progress)?clamp(progress):0;
  const t=clamp((p-.83)/.13);
  const e=t*t*(3-2*t);
  return {opacity:e,rise:20*(1-e)};
}

// Retire the Perspective label before the connector.
export function perspectivePresence(progress){
  const p=Number.isFinite(progress)?clamp(progress):0;
  const t=clamp((p-.60)/.08);
  return 1-t*t*(3-2*t);
}

 // P03: the index belongs to the cobalt room, not the connector.
export function explorationPose(progress,inRoom=true){
  const p=Number.isFinite(progress)?clamp(progress):0;
  const t=inRoom?clamp((p-.88)/.10):0;
  const opacity=t*t*(3-2*t);
  return {opacity,active:t===1};
}
