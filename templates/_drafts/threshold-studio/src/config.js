export const RELEASE = 'T11';
export const DRAFT_ID = 'threshold-studio';
// Architectural storyboard uses forward depth s; WebGL world uses -Z forward.
export function worldPoint(x, y, s) {
  if (![x, y, s].every(Number.isFinite)) throw new TypeError('Expected finite world coordinates');
  return [x, y, s === 0 ? 0 : -s];
}
