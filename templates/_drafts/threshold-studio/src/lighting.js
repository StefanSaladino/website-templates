// T07: restrained architectural light study, in display color space.
// Analytic aperture spill, not ray-traced global illumination or volumetric fog.
export const LIGHTING_GLSL=`
float apertureSpill(vec3 p){
  float x=max(abs(p.x)-2.05,0.0);
  float z=abs(p.z+.6);
  return exp(-x*x*.36-z*.24)*exp(-max(p.y-6.0,0.0)*.7);
}
float floorSpill(vec3 p){
  return apertureSpill(p)*exp(-abs(p.z)*.055);
}
vec3 haze(vec3 c,float distanceToEye,float amount){
  float t=clamp(1.0-exp(-distanceToEye*.012),0.0,.36)*amount;
  return mix(c,vec3(.045,.035,.037),t);
}
`;
