(()=>{const download=document.querySelector('#download-pdf'),status=document.querySelector('#download-status');const rows=[['ATELIER / TABLE','24','690'],['FICTIONAL SAMPLE MENU - NOT AN ACTUAL RESTAURANT','13','654'],['SMALL PLATES','17','596'],['Warm orchard vegetables - CAD 14 (example)','13','565'],['Fictional roasted seasonal vegetables and herbs','11','545'],['FOR THE TABLE','17','495'],['Garden grain selection - CAD 22 (example)','13','464'],['Fictional grains, greens and citrus','11','444'],['SWEET FINISH','17','394'],['Little chocolate cake - CAD 12 (example)','13','363'],['Fictional cake and preserved fruit','11','343'],['IMPORTANT DISCLAIMER','14','276'],['All dishes and prices are fictional. Nothing is sold.','12','250'],['No ingredients, allergens, kitchen or venue are verified.','12','230'],['Do not use this example for dietary or purchasing decisions.','12','210'],['Original text-only PDF generated in your browser.','11','160']];function pdfEscape(s){return s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');}function makePDF(){
 const kind=i=>i===0?'H1':[2,5,8,11].includes(i)?'H2':'P';
 const ops=['/Artifact BMC','0.98 0.96 0.92 rg','0 0 612 792 re f','0.19 0.22 0.22 rg','48 720 516 4 re f','EMC'];
 rows.forEach(([name,size,y],i)=>{
   ops.push('/'+kind(i)+' <</MCID '+i+'>> BDC');
   ops.push('BT /F1 '+size+' Tf '+(Number(y)>300?'0.15 0.23 0.22':'0.35 0.25 0.30')+' rg 48 '+y+' Td ('+pdfEscape(name)+') Tj ET');
   ops.push('EMC');
 });
 const stream=ops.join('\n')+'\n';
 const children=rows.map((_,i)=>8+i),parentId=8+rows.length,unicodeId=parentId+1,infoId=unicodeId+1;
 const objects=Array(infoId+1).fill('');
 objects[1]='<< /Type /Catalog /Pages 2 0 R /StructTreeRoot 6 0 R /MarkInfo << /Marked true >> /Lang (en-CA) /ViewerPreferences << /DisplayDocTitle true >> >>';
 objects[2]='<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
 objects[3]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /StructParents 0 /Tabs /S /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>';
 objects[4]='<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream';
 objects[5]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding /ToUnicode '+unicodeId+' 0 R >>';
 objects[6]='<< /Type /StructTreeRoot /K 7 0 R /ParentTree '+parentId+' 0 R /ParentTreeNextKey 1 >>';
 objects[7]='<< /Type /StructElem /S /Document /P 6 0 R /K ['+children.map(n=>n+' 0 R').join(' ')+'] >>';
 rows.forEach((_,i)=>objects[children[i]]='<< /Type /StructElem /S /'+kind(i)+' /P 7 0 R /Pg 3 0 R /K '+i+' >>');
 objects[parentId]='<< /Nums [0 ['+children.map(n=>n+' 0 R').join(' ')+']] >>';
 const cmap=['/CIDInit /ProcSet findresource begin','12 dict begin','begincmap','/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def','/CMapName /Adobe-Identity-UCS def','/CMapType 2 def','1 begincodespacerange','<00> <FF>','endcodespacerange','1 beginbfrange','<20> <7E> <0020>','endbfrange','endcmap','CMapName currentdict /CMap defineresource pop','end','end'].join('\n')+'\n';
 objects[unicodeId]='<< /Length '+cmap.length+' >>\nstream\n'+cmap+'endstream';
 objects[infoId]='<< /Title (Atelier Table - fictional sample menu) /Subject (Illustrative menu only, with no verified dietary information) >>';
 // All generated strings are ASCII, ensuring PDF offsets match byte offsets.
 let doc='%PDF-1.7\n%TAGGED-TEXT-SAMPLE\n';
 const offsets=[0];
 for(let n=1;n<objects.length;n++){offsets[n]=doc.length;doc+=n+' 0 obj\n'+objects[n]+'\nendobj\n';}
 const startxref=doc.length;
 doc+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';
 for(let n=1;n<offsets.length;n++)doc+=String(offsets[n]).padStart(10,'0')+' 00000 n \n';
 doc+='trailer\n<< /Size '+objects.length+' /Root 1 0 R /Info '+infoId+' 0 R >>\nstartxref\n'+startxref+'\n%%EOF\n';
 return new Blob([doc],{type:'application/pdf'});
}
download.addEventListener('click',()=>{try{const blob=makePDF(),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='atelier-table-fictional-sample-menu.pdf';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);status.textContent='Generated a tagged text PDF locally; the same menu is readable below in HTML. No request was sent. PDF accessibility certification remains pending.';}catch(e){status.textContent='The sample PDF could not be generated in this browser. The identical fictional menu remains readable below.';}});})();
