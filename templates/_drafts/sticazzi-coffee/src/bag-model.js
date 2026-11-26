'use strict';
// S08b2: a rigid, closed, textured pouch mesh. No screen-space image warping.
window.createSticazziBag=function(canvas,photo){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:false});
 if(!gl)throw Error('WebGL unavailable');
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const vs=compile(gl.VERTEX_SHADER,`
 attribute vec3 pos;attribute vec3 normal;attribute vec2 uv;
 uniform float yaw;uniform float aspect;uniform vec2 centre;uniform float size;
 varying vec2 tex;varying vec3 norm;
 vec3 rotate(vec3 v){float c=cos(yaw),s=sin(yaw);vec3 q=vec3(c*v.x+s*v.z,v.y,-s*v.x+c*v.z);float a=-.10;return vec3(cos(a)*q.x-sin(a)*q.y,sin(a)*q.x+cos(a)*q.y,q.z);}
 void main(){vec3 q=rotate(pos);norm=rotate(normal);tex=uv;float d=5.6-q.z;gl_Position=vec4(centre*d+vec2(q.x/aspect,q.y)*size, d-1.1,d);}
 `);
 const fs=compile(gl.FRAGMENT_SHADER,`
 precision mediump float;uniform sampler2D atlas;varying vec2 tex;varying vec3 norm;
 void main(){vec3 n=normalize(norm);float light=.77+.23*max(0.,dot(n,normalize(vec3(-.55,.65,1.))));vec3 paper=texture2D(atlas,tex).rgb;gl_FragColor=vec4(paper*light,1.);}
 `);
 const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 // Rectify the actual front packaging from the wide photograph into a
 // texture. The source is only sampled once; it is never distorted during drag.
 const atlas=document.createElement('canvas');atlas.width=1536;atlas.height=1024;
 const a=atlas.getContext('2d');const original=document.createElement('canvas');original.width=photo.naturalWidth;original.height=photo.naturalHeight;
 const oc=original.getContext('2d',{willReadFrequently:true});oc.drawImage(photo,0,0);
 const W=original.width,H=original.height,src=oc.getImageData(0,0,W,H).data;
 function rectify(quad,dx,dy,dw,dh){
  const im=a.createImageData(dw,dh),out=im.data;
  for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
   const u=x/(dw-1),v=y/(dh-1);
   const sx=((1-v)*((1-u)*quad[0][0]+u*quad[1][0])+v*((1-u)*quad[3][0]+u*quad[2][0]))*(W-1);
   const sy=((1-v)*((1-u)*quad[0][1]+u*quad[1][1])+v*((1-u)*quad[3][1]+u*quad[2][1]))*(H-1);
   const ix=Math.max(0,Math.min(W-2,Math.floor(sx))),iy=Math.max(0,Math.min(H-2,Math.floor(sy))),fx=sx-ix,fy=sy-iy,i=(y*dw+x)*4;
   for(let k=0;k<3;k++)out[i+k]=src[(iy*W+ix)*4+k]*(1-fx)*(1-fy)+src[(iy*W+ix+1)*4+k]*fx*(1-fy)+src[((iy+1)*W+ix)*4+k]*(1-fx)*fy+src[((iy+1)*W+ix+1)*4+k]*fx*fy;
   out[i+3]=255;
  }
  a.putImageData(im,dx,dy);
 }
 // Source front and photographed side. Wide photo is the canonical texture.
 rectify([[.716,.069],[.929,.116],[.817,.866],[.574,.787]],0,0,512,1024);
 rectify([[.929,.116],[.941,.126],[.858,.915],[.817,.866]],1024,0,256,1024);
 // Original fictional back design; no commercial claims. Subtle deterministic
 // paper grain sampled from the front texture and broad fold shading.
 const front=a.getImageData(0,0,512,1024).data;
 function paper(dx,dw,base){
  const im=a.createImageData(dw,1024);for(let y=0;y<1024;y++)for(let x=0;x<dw;x++){
   const q=(y*dw+x)*4,n=front[((35+(y%100))*512+45+(x%120))*4]-190;
   const fold=12*Math.sin(x/dw*Math.PI*2)-9*Math.cos(y/1024*Math.PI*4);
   im.data[q]=base[0]+n*.22+fold;im.data[q+1]=base[1]+n*.20+fold;im.data[q+2]=base[2]+n*.16+fold;im.data[q+3]=255;
  }a.putImageData(im,dx,0);
 }
 paper(512,512,[190,153,111]);paper(1280,256,[103,59,36]);
 a.fillStyle='#432619';a.fillRect(552,327,432,430);
 a.textAlign='center';a.fillStyle='#2c1a12';a.font='bold 61px Arial';a.fillText('STICAZZI',768,215);a.font='22px Arial';a.fillText('C O F F E E',768,254);
 a.fillStyle='#e8cba8';a.font='32px Arial';a.fillText('ESPRESSO',768,405);a.font='23px Arial';a.fillText('WHOLE BEAN / 250 G',768,460);a.font='20px Arial';a.fillText('FICTIONAL STUDIO CONCEPT',768,694);
 a.fillStyle='#2c1a12';a.font='22px Arial';a.fillText('STICAZZI COFFEE',768,900);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 // Octagonal cross sections: front/back broad panels, narrow bevels and
 // two gusset panels. Depth tapers into a sealed top, not a flat plane.
 const rings=[[-1.20,.69,.26],[-1.12,.77,.34],[-.94,.80,.38],[-.46,.81,.39],[.18,.78,.34],[.72,.75,.25],[1.04,.72,.08],[1.18,.72,.045],[1.23,.70,.028]];
 const ring=([y,w,d])=>[[-w*.86,y,d],[w*.86,y,d],[w,y,d*.58],[w,y,-d*.58],[w*.86,y,-d],[-w*.86,y,-d],[-w,y,-d*.58],[-w,y,d*.58]];
 const verts=[],tri=(A,B,C,uvA,uvB,uvC)=>{
  const u=B.map((v,i)=>v-A[i]),v=C.map((x,i)=>x-A[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n)||1;
  for(const [q,t] of [[A,uvA],[B,uvB],[C,uvC]])verts.push(...q,...n.map(x=>x/len),...t);
 };
 const tile=[0,2,2,2,1,3,3,3];
 const range=[ [0,512],[512,512],[1024,256],[1280,256] ];
 const uv=(side,u,y)=>{const [x,w]=range[tile[side]];let fraction=u;if(side===1||side===5)fraction=u*.18;if(side===2||side===6)fraction=.18+u*.64;if(side===3||side===7)fraction=.82+u*.18;return [(x+2+fraction*(w-4))/1536,2/1024+(1-(y+1.2)/2.43)*1020/1024];};
 for(let j=0;j<rings.length-1;j++){
  const low=ring(rings[j]),high=ring(rings[j+1]);for(let i=0;i<8;i++){const k=(i+1)%8,A=low[i],B=low[k],C=high[k],D=high[i];tri(A,B,C,uv(i,0,A[1]),uv(i,1,B[1]),uv(i,1,C[1]));tri(A,C,D,uv(i,0,A[1]),uv(i,1,C[1]),uv(i,0,D[1]));}
 }
 for(const [r,flip] of [[rings[0],true],[rings.at(-1),false]]){const pts=ring(r);for(let i=1;i<7;i++){const ids=flip?[0,i+1,i]:[0,i,i+1];tri(...ids.map(k=>pts[k]),...[ids[0],ids[1],ids[2]].map(k=>[(1284+k*20)/1536,.06]));}}
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
 for(const [name,count,offset] of [['pos',3,0],['normal',3,12],['uv',2,24]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,count,gl.FLOAT,false,32,offset);}
 const uniforms=Object.fromEntries(['yaw','aspect','centre','size'].map(n=>[n,gl.getUniformLocation(program,n)]));
 gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 function draw(degrees){
  const b=canvas.getBoundingClientRect();if(!b.width||!b.height)return;
  const ratio=Math.min(devicePixelRatio||1,1.6,Math.sqrt(1800000/(b.width*b.height)));
  const w=Math.max(1,Math.round(b.width*ratio)),h=Math.max(1,Math.round(b.height*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
  const portrait=matchMedia('(max-aspect-ratio: 5/6)').matches,aspect=w/h;
  gl.uniform1f(uniforms.yaw,degrees*Math.PI/180);gl.uniform1f(uniforms.aspect,aspect);
  gl.uniform2f(uniforms.centre,portrait?.12:.48,portrait?.04:.00);gl.uniform1f(uniforms.size,portrait?Math.min(3.45,aspect*5.1):3.65);
  gl.drawArrays(gl.TRIANGLES,0,verts.length/8);
 }
 return {draw,triangles:verts.length/24,depth:.78};
};
