// One active-time clock; no catch-up after suspension and no camera ownership.
export const AMBIENT_PERIOD=16000,MAX_STEP=50,FRAME_INTERVAL=1000/30;
export function createAmbientClock(){
  let elapsed=0,last=null,lastRender=null;
  return {
    sample(now,force=false){
      if(!Number.isFinite(now))throw new TypeError('Invalid ambient timestamp');
      if(last!==null)elapsed=(elapsed+Math.min(MAX_STEP,Math.max(0,now-last)))%AMBIENT_PERIOD;
      last=now;
      const render=force||lastRender===null||now-lastRender>=FRAME_INTERVAL-1;
      if(render)lastRender=now;
      return {render,phase:elapsed/AMBIENT_PERIOD*2*Math.PI,elapsed};
    },
    pause(){last=lastRender=null},
    get elapsed(){return elapsed}
  };
}
export function localIntensity(phase,z,y){
  return phase<0?1:1+.045*Math.sin(phase+z*.75+y*.26);
}
