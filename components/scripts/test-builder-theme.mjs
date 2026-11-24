import assert from 'node:assert/strict';
import {contrast} from '../builder-model.js';
import {rgba,mix,readable,paletteRoles,surface,foreground,edge,controlEdge,bodyText,distinctTint} from '../builder-theme.js';
import {PALETTES} from '../builder-journey.js';
assert.deepEqual(rgba('rgba(20, 30, 40, 0.5)'),[20,30,40,.5]);assert.equal(mix('#000000','#FFFFFF',.5),'#808080');
for(const p of [...PALETTES,{primary:'#FFFFFF',secondary:'#000000',trim:'#FFFFFF'},{primary:'#222222',secondary:'#222222',trim:null},{primary:'#FFFF00',secondary:'#FF00FF',trim:'#00FF00'}]){
 const r=paletteRoles(p);assert(contrast(r.onPrimary,p.primary)>=4.5);assert(contrast(r.onSecondary,p.secondary)>=4.5);assert.equal(surface([20,30,40,1],p),p.primary);assert.equal(surface([240,240,230,1],p),p.secondary);
 for(const old of [[10,20,30,1],[90,80,70,1],[160,150,140,1],[245,245,245,1],[220,40,90,1]]){const bg=surface(old,p);for(const accent of [false,true])assert(contrast(foreground(old,bg,p,{accent}),bg)>=4.5);assert(contrast(edge(old,bg,p,true),bg)>=3)}
 assert(contrast(readable(p.trim||p.primary,p.secondary),p.secondary)>=4.5)
}
console.log('PASS brand palette roles, derived surfaces, optional trim and contrast-safe text/control boundaries across standard and extreme palettes.');

assert.notEqual(distinctTint('#222222','#222222',.2),'#222222');assert.notEqual(distinctTint('#FFFFFF','#FFFFFF',.2),'#FFFFFF');for(const p of PALETTES){assert.equal(surface([20,30,40,1],p,{canvas:true}),p.secondary);assert(contrast(bodyText(p.secondary,p),p.secondary)>=4.5);assert(contrast(controlEdge(p.primary,p.secondary,p),p.secondary)>=3)}console.log('PASS near-equal palette surfaces, canvas role and control boundaries.');
