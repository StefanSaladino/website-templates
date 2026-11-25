// T22: the existing native scroll sample owns the exhibition label.
const clamp=v=>Math.max(0,Math.min(1,v));
export function perspectivePose(progress){
  const p=Number.isFinite(progress)?clamp(progress):0;
  const t=clamp((p-.83)/.13);
  const e=t*t*(3-2*t);
  return {opacity:e,rise:20*(1-e)};
}
