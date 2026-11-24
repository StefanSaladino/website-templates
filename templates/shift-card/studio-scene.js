import {FINISHES} from './materials.js';
// Recovery-only studio renderer. Geometry/projection API retained; registered scene unchanged.
// Original rounded rectangular card, closed solid with separate face, bevel and edge surfaces.
export const MOTION_PIXEL_LIMIT={compact:200000,wide:130000};
export function bufferSize(width,height,dpr=1,compact=false,pixelLimit=Infinity){if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw Error('Invalid canvas bounds');const limit=Math.min(compact?1250000:2500000,Number.isFinite(pixelLimit)&&pixelLimit>0?Math.floor(pixelLimit):Infinity),ratio=Math.min(Math.max(.25,Number.isFinite(dpr)?dpr:1),compact?1.5:2,Math.sqrt(limit/(width*height)));return {width:Math.max(1,Math.floor(width*ratio)),height:Math.max(1,Math.floor(height*ratio)),limit}}
export const DIMENSIONS={width:2.8,height:1.766,depth:.052,radius:.115,bevel:.016};
const norm=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function cardGeometry(d=DIMENSIONS){
 const {width:w,height:h,depth:z,radius:r,bevel:b}=d,segments=16,rings=[];
 const profiles=[[-z/2,b,-1],[-z/2+b,0,0],[z/2-b,0,0],[z/2,b,1]];
 for(const [depth,inset,side] of profiles){const ring=[];for(let corner=0;corner<4;corner++){const cx=(corner===0||corner===3?1:-1)*(w/2-r),cy=(corner<2?1:-1)*(h/2-r);for(let i=0;i<=segments;i++){const a=(corner*90+i*90/segments)*Math.PI/180;const x=Math.cos(a),y=Math.sin(a),n=side?norm([x,y,side]):[x,y,0];ring.push({p:[cx+x*(r-inset),cy+y*(r-inset),depth],n})}}rings.push(ring)}
 const data=[];function v(p,n,kind){data.push(...p,...n,p[0]/w+.5,p[1]/h+.5,kind)}
 function tri(a,b,c,kind){for(const x of [a,b,c])v(x.p,x.n,kind)}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<rings[j].length;i++){const k=(i+1)%rings[j].length,A=rings[j][i],B=rings[j][k],C=rings[j+1][k],D=rings[j+1][i];tri(A,B,C,1);tri(A,C,D,1)}
 for(const [j,sign,kind] of [[0,-1,2],[3,1,0]]){const ring=rings[j],center={p:[0,0,sign*z/2],n:[0,0,sign]};for(let i=0;i<ring.length;i++){const a={p:ring[i].p,n:center.n},b={p:ring[(i+1)%ring.length].p,n:center.n};tri(center,...(sign>0?[a,b]:[b,a]),kind)}}
 return new Float32Array(data);
}
// Original printed surface texture; no baked lighting, external imagery or financial identifiers.
function artwork(back=false,finish='ultramarine'){const material=FINISHES[finish]||FINISHES.ultramarine;const c=document.createElement('canvas');c.width=1024;c.height=1024;const x=c.getContext('2d');x.scale(1,1024/646);x.fillStyle=back?material.back:material.face;x.fillRect(0,0,1024,646);x.strokeStyle=material.line;x.globalAlpha=.34;x.lineWidth=1.7;for(let i=0;i<11;i++){x.beginPath();x.moveTo(-100,450+i*23);x.bezierCurveTo(150,390+i*23,240,80+i*23,540,92+i*23);x.bezierCurveTo(780,82+i*23,900,250+i*23,1120,35+i*23);x.stroke()}x.globalAlpha=1;
 x.fillStyle=material.ink;x.font='900 116px Arial';x.fillText('SHIFT.',88,532);x.font='bold 17px Arial';x.fillText('DESIGN CONCEPT / 001',94,570);x.font='15px Arial';x.textAlign='right';x.fillText('NOT FOR PAYMENT',938,75);x.textAlign='left';
 if(back){x.fillStyle=material.band;x.fillRect(0,126,1024,112);x.fillStyle=material.chip;x.font='bold 20px Arial';x.fillText('FICTIONAL PRODUCT STUDY',94,310)}else{x.fillStyle=material.chip;x.beginPath();x.roundRect(90,118,124,92,12);x.fill();x.strokeStyle=material.chipLine;x.lineWidth=2.6;for(const y of [149,181]){x.beginPath();x.moveTo(90,y);x.lineTo(127,y);x.lineTo(143,165);x.lineTo(161,165);x.lineTo(177,y);x.lineTo(214,y);x.stroke()}for(const a of [127,177]){x.beginPath();x.moveTo(a,118);x.lineTo(a,149);x.moveTo(a,181);x.lineTo(a,210);x.stroke()}}
 x.fillStyle=material.chip;for(const k of [0,32]){x.beginPath();x.moveTo(906+k,500);x.lineTo(929+k,500);x.lineTo(900+k,555);x.lineTo(877+k,555);x.fill()}return c}
const vs=`precision mediump float;
attribute vec3 aPosition,aNormal;attribute vec2 aUV;attribute float aKind;
uniform vec3 uEye,uRight,uUp,uForward;uniform vec2 uTilt,uOffset;uniform float uAspect,uFocal,uRoll;
varying vec3 vPosition,vNormal;varying vec2 vUV;varying float vKind;
vec3 rotate(vec3 p){float c=cos(uTilt.x),s=sin(uTilt.x);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);c=cos(uTilt.y);s=sin(uTilt.y);p=vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);c=cos(uRoll);s=sin(uRoll);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
void main(){vec3 p=rotate(aPosition),d=p-uEye;float z=dot(d,uForward);vPosition=p;vNormal=rotate(aNormal);vUV=aUV;vKind=aKind;gl_Position=vec4(dot(d,uRight)*uFocal/uAspect+uOffset.x*z,dot(d,uUp)*uFocal+uOffset.y*z,1.006*z-.2,z);}`;
const fs=`precision mediump float;
uniform sampler2D uFront,uBack;
uniform vec3 uEye,uLight,uEdge;
uniform vec3 uMotionLight,uMotionKey,uMotionAxis,uMotionUp;
uniform float uMotionPass;
uniform float uRoughness,uSpecular,uStrip,uStudio;
varying vec3 vPosition,vNormal;varying vec2 vUV;varying float vKind;
const float PI=3.14159265;
// Approximate two broad photographic light panels and a weaker reflected fill.
// All lighting is evaluated in linear colour; printed artwork is sampled as sRGB.
vec3 linearize(vec3 x){return pow(max(x,vec3(0.)),vec3(2.2));}
vec3 displayColour(vec3 x){return pow(clamp(x,0.,1.),vec3(1./2.2));}
float panel(vec3 r,vec3 center,vec3 axisA,vec3 axisB,vec2 widths){
 vec3 d=r-center;vec2 q=vec2(dot(d,axisA),dot(d,axisB))/widths;
 return exp(-dot(q,q))*smoothstep(-.12,.32,dot(r,center));
}
void main(){
 vec3 n=normalize(vNormal),v=normalize(uEye-vPosition),l=uMotionPass>.5?uMotionLight:normalize(uLight);
 float edge=step(.5,vKind)*(1.-step(1.5,vKind));
 vec2 uv=vKind>1.5?vec2(1.-vUV.x,vUV.y):vUV;
 vec3 printed=vKind<.5?texture2D(uFront,uv).rgb:texture2D(uBack,uv).rgb;
 vec3 base=linearize(mix(printed,uEdge,edge));
 // Rounded chip mask gives the actual inlay its own specular response.
 vec2 chipQ=abs((vUV-vec2(.1484,.7461))/vec2(.06055,.0712))-vec2(.82,.80);
 float chip=(1.-smoothstep(.12,.22,length(max(chipQ,vec2(0.)))+min(max(chipQ.x,chipQ.y),0.)))*(1.-step(.5,vKind));
 float metal=max(edge,chip*.76);
 float satin=clamp(1.-(uRoughness-19.)/65.,.48,1.);
 vec3 r=reflect(-v,n);
 vec3 softKey=uMotionPass>.5?uMotionKey:normalize(vec3(l.x*.72,.62,.86));
 vec3 softSide=normalize(vec3(.82,-.18,.58));
 vec3 axisKey=uMotionPass>.5?uMotionAxis:normalize(cross(vec3(0.,1.,0.),softKey));
 vec3 axisUp=uMotionPass>.5?uMotionUp:cross(softKey,axisKey);
 float primary=panel(r,softKey,axisKey,axisUp,vec2(.24+.16*satin,.78));
 float secondary=panel(r,softSide,normalize(cross(vec3(0.,1.,0.),softSide)),vec3(0.,1.,0.),vec2(.18,.55));
 float ndl=max(dot(n,l),0.),fill=max(dot(n,normalize(vec3(-.65,-.32,.8))),0.);
 float ndv=clamp(dot(n,v),0.,1.),q=1.-ndv,q2=q*q,fresnel=uMotionPass>.5?q2*q2*q:pow(q,5.);
 // Keep ultramarine saturated: reflections are restrained, not a white wash.
 float ambient=mix(.62,.24,uStudio);
 vec3 diffuse=base*(ambient+mix(.48,.88,uStudio)*ndl+.20*fill)*(1.-.32*metal);
 float faceSpec=(.025+.05*uSpecular+.018*uStrip)*primary+.013*secondary;
 float metalSpec=(.12+.40*primary+.15*secondary);
 vec3 tint=mix(vec3(.94,.96,1.),mix(base,vec3(1.),.58),metal*.65);
 vec3 reflected=tint*(mix(faceSpec,metalSpec,metal)+fresnel*mix(.015,.14,metal));
 // Small continuous satin variation; no coarse high-frequency screen-space noise.
 float grain=sin(uv.x*205.+sin(uv.y*63.)*.65)*sin(uv.y*139.);
 diffuse*=1.+grain*.018*(1.-metal);
 vec3 color=diffuse+reflected*mix(.85,1.35,uStudio);
 gl_FragColor=vec4(displayColour(color),1.);
}`;
export function createCardScene(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)throw Error('WebGL unavailable');
 let program,buffer,textures=[],shaders=[];const dispose=()=>{for(const t of textures)gl.deleteTexture(t);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);for(const s of shaders)gl.deleteShader(s)};
 try{function shader(type,code){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const data=cardGeometry();buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.useProgram(program);
 for(const [name,size,offset] of [['aPosition',3,0],['aNormal',3,12],['aUV',2,24],['aKind',1,32]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,36,offset)}
 for(let i=0;i<2;i++){const t=gl.createTexture();textures.push(t);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,artwork(i===1));gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(program,i?'uBack':'uFront'),i)}
 let activeFinish='ultramarine',bufferKey='',renderWidth=0,renderHeight=0,motionPass=false;
 function setFinish(id){if(!Object.hasOwn(FINISHES,id))id='ultramarine';if(id!==activeFinish){for(let i=0;i<textures.length;i++){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,textures[i]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,artwork(i===1,id));gl.generateMipmap(gl.TEXTURE_2D)}activeFinish=id}return FINISHES[id]}
 const u=Object.fromEntries(['uEye','uRight','uUp','uForward','uTilt','uAspect','uFocal','uRoll','uLight','uMotionLight','uMotionKey','uMotionAxis','uMotionUp','uMotionPass','uOffset','uEdge','uRoughness','uSpecular','uStrip','uStudio'].map(k=>[k,gl.getUniformLocation(program,k)]));gl.enable(gl.DEPTH_TEST);gl.frontFace(gl.CCW);gl.cullFace(gl.BACK);gl.clearColor(0,0,0,0);
 function draw({yaw=-28,pitch=13,roll=-19,light=-35,distance=6,offset=[0,0],cardWidth=null,finish='ultramarine',studio=0,viewport=null}={}){if(gl.isContextLost())return false;const rect=viewport||canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return false;const dpr=viewport?.dpr??(devicePixelRatio||1),compact=viewport?.compact??(innerWidth<=700||(innerWidth<1000&&innerHeight>innerWidth)),pixelLimit=viewport?.pixelLimit??Infinity,key=[rect.width,rect.height,dpr,compact,pixelLimit].join(':');if(key!==bufferKey){const size=bufferSize(rect.width,rect.height,dpr,compact,pixelLimit);renderWidth=size.width;renderHeight=size.height;if(canvas.width!==renderWidth||canvas.height!==renderHeight){canvas.width=renderWidth;canvas.height=renderHeight}gl.viewport(0,0,renderWidth,renderHeight);bufferKey=key}const fast=viewport?.motionPass===true;if(fast!==motionPass){motionPass=fast;if(fast)gl.enable(gl.CULL_FACE);else gl.disable(gl.CULL_FACE)}gl.uniform1f(u.uMotionPass,fast?1:0);const aspect=rect.width/rect.height,rad=Math.PI/180,eye=[0,0,distance],forward=[0,0,-1],right=norm(cross(forward,[0,1,0])),up=cross(right,forward);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform3fv(u.uEye,eye);gl.uniform3fv(u.uRight,right);gl.uniform3fv(u.uUp,up);gl.uniform3fv(u.uForward,forward);gl.uniform2f(u.uTilt,yaw*rad,pitch*rad);gl.uniform1f(u.uAspect,aspect);gl.uniform1f(u.uFocal,cardWidth===null?Math.min(4.1,4.5*aspect):2*distance*cardWidth/(rect.height*DIMENSIONS.width));gl.uniform2fv(u.uOffset,offset);gl.uniform1f(u.uRoll,roll*rad);const lightVector=[Math.sin(light*rad),.52,Math.cos(light*rad)];gl.uniform3fv(u.uLight,lightVector);if(fast){const ll=norm(lightVector),keyLight=norm([ll[0]*.72,.62,.86]),keyAxis=norm(cross([0,1,0],keyLight));gl.uniform3fv(u.uMotionLight,ll);gl.uniform3fv(u.uMotionKey,keyLight);gl.uniform3fv(u.uMotionAxis,keyAxis);gl.uniform3fv(u.uMotionUp,cross(keyLight,keyAxis))}const material=setFinish(finish);gl.uniform3fv(u.uEdge,material.edge);gl.uniform1f(u.uRoughness,material.roughness);gl.uniform1f(u.uSpecular,material.specular);gl.uniform1f(u.uStrip,material.strip);gl.uniform1f(u.uStudio,studio);gl.drawArrays(gl.TRIANGLES,0,data.length/9);return !gl.isContextLost()}
 return {draw,dispose,vertices:data.length/9,meshBytes:data.byteLength,textureBytes:Math.ceil(2*1024*1024*4*4/3),gl};}catch(e){dispose();throw e}
}
