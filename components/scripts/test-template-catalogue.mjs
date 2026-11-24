import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {discoverTemplates,galleryMembership} from './template-catalogue.mjs';
const root=mkdtempSync(path.join(tmpdir(),'catalogue-growth-'));
try{
 const add=id=>{mkdirSync(path.join(root,'templates',id),{recursive:true});writeFileSync(path.join(root,'templates',id,'index.html'),'<main></main>')};
 const card=id=>'<a class="thumb-link" href="templates/'+id+'/"><span class="live-badge">Preview</span></a>';
 const gallery=ids=>writeFileSync(path.join(root,'index.html'),ids.map(card).join(''));
 writeFileSync(path.join(root,'script.js'),'');
 add('first');gallery(['first']);assert.deepEqual(galleryMembership(root).missing,[]);
 add('new-3d');assert.deepEqual(galleryMembership(root).missing,['new-3d']);
 gallery(['first','new-3d']);assert.deepEqual(galleryMembership(root).missing,[]);assert.equal(galleryMembership(root).source.badgeCount,2);
 gallery(['first','new-3d','new-3d','unknown']);assert.deepEqual(galleryMembership(root).duplicates,['new-3d']);assert.deepEqual(galleryMembership(root).unexpected,['unknown']);
 gallery(['first','new-3d']);rmSync(path.join(root,'templates','first'),{recursive:true});assert.deepEqual(galleryMembership(root).unexpected,['first']);
 mkdirSync(path.join(root,'templates','incomplete'));assert.throws(()=>discoverTemplates(root),/missing index/);
 console.log('PASS: catalogue grows/shrinks, rejects missing, orphan and duplicate routes and incomplete folders.');
}finally{rmSync(root,{recursive:true,force:true})}
