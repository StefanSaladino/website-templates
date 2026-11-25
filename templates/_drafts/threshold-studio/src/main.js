import { RELEASE } from './config.js?v=T03';
// Shell only. No canvas, GPU context, animation loop or scroll listener in T03.
if (document.documentElement.dataset.release === RELEASE) {
  document.documentElement.dataset.shell = 'ready';
}
