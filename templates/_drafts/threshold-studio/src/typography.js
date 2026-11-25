const clamp=v=>Math.max(0,Math.min(1,v));
const ease=(v,a,b)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
export function typographyPose(progress,wide=false){
  const p=Number.isFinite(progress)?clamp(progress):0;
  const rise=ease(p,.12,.65),retreat=ease(p,.28,.76);
  return {
    markY:-rise*1.04,
    markOpacity:1-ease(p,.28,.65),
    copyX:wide?-retreat*.39:0,
    copyY:wide?0:retreat*.25,
    copyOpacity:1-ease(p,.36,.76),
    footerOpacity:1-ease(p,.46,.76)
  };
}
