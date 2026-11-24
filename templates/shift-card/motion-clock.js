// Time-based scroll following. One shared presentation value; no scroll hijacking.
// The small terminal epsilon snaps to the exact target, so the renderer goes idle.
export function followProgress(current,target,dt,compact=false){if(!Number.isFinite(current))return target;const delta=target-current;if(Math.abs(delta)<.00018)return target;const elapsed=Math.max(1,Math.min(48,dt||16.667)),tau=compact?48:40;const next=current+delta*(-Math.expm1(-elapsed/tau));return Math.abs(target-next)<.00018?target:next}
