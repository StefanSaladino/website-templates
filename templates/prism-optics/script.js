(()=>{'use strict';
const stage=document.querySelector('#environment'),canvas=document.querySelector('#lens'),fallback=document.querySelector('.fallback'),chapters=[...document.querySelectorAll('.chapter')],links=[...document.querySelectorAll('[data-jump]')],controls=document.querySelector('#config'),rotation=document.querySelector('#rotation'),angleLabel=document.querySelector('#angle'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t),norm=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)},dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],sub=(a,b)=>a.map((x,i)=>x-b[i]);
let gl,program,meshes=[],uniforms={},frame=0,disposed=false,scene='reveal',finish='graphite',angle=0,position=0,pose={yaw:.75,pitch:.16,distance:7.2,explode:0},scrollQueued=false;
const keyframes=[{yaw:.76,pitch:.16,distance:7.4,explode:0},{yaw:1.26,pitch:.20,distance:5.9,explode:0},{yaw:1.23,pitch:.27,distance:11.2,explode:1},{yaw:.65,pitch:.10,distance:7.6,explode:0}];
const colors={graphite:[.115,.132,.155],silver:[.55,.58,.60],bronze:[.39,.24,.15]};
function model(){
 const groups=new Map(),get=(name,shift,kind)=>{const k=name+'|'+kind;if(!groups.has(k))groups.set(k,{name,shift,kind,data:[]});return groups.get(k).data};
 const color={metal:0,black:1,edge:2,glass:3,blade:4,white:5};
 function vertex(out,p,n){out.push(...p,...n)}
 function tri(out,a,b,c,n){vertex(out,a,n);vertex(out,b,n);vertex(out,c,n)}
 function quad(out,a,b,c,d,n){tri(out,a,b,c,n);tri(out,a,c,d,n)}
 // A closed radial cross-section: outward normal computed from the slope,
 // with geometry physically sharing the same optical axis.
 function lathe(out,profile,segments=96){
  for(let j=0;j<profile.length-1;j++){
   const [r,z]=profile[j],[r2,z2]=profile[j+1],n=norm([z2-z,r-r2]);
   for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;
    const v=(r,z,t)=>[r*Math.cos(t),r*Math.sin(t),z],nn=t=>[n[0]*Math.cos(t),n[0]*Math.sin(t),n[1]];
    const p=v(r,z,a),q=v(r2,z2,a),s=v(r2,z2,b),t=v(r,z,b);
    vertex(out,p,nn(a));vertex(out,q,nn(a));vertex(out,s,nn(b));vertex(out,p,nn(a));vertex(out,s,nn(b));vertex(out,t,nn(b));
   }
  }
 }
 function ring(name,shift,z0,z1,r,inner,kind=color.metal){lathe(get(name,shift,kind),[[inner,z0],[r-.035,z0],[r,z0+.035],[r,z1-.035],[r-.035,z1],[inner,z1],[inner,z0]]);}
 function ridge(name,shift,r,z0,z1,count){
  const out=get(name,shift,color.metal);
  for(let i=0;i<count;i++){
   const a=i*2*Math.PI/count,b=a+.019,mid=(a+b)/2,point=(r,t,z)=>[r*Math.cos(t),r*Math.sin(t),z];
   const p=point(r,a,z0),q=point(r+.035,a,z0),s=point(r+.035,b,z0),t=point(r,b,z0),P=point(r,a,z1),Q=point(r+.035,a,z1),S=point(r+.035,b,z1),T=point(r,b,z1);
   quad(out,q,s,S,Q,[Math.cos(mid),Math.sin(mid),0]);quad(out,p,q,Q,P,[Math.sin(a),-Math.cos(a),0]);quad(out,s,t,T,S,[-Math.sin(b),Math.cos(b),0]);quad(out,p,t,s,q,[0,0,-1]);quad(out,P,Q,S,T,[0,0,1]);
  }
 }
 function ticks(name,shift,r,z,count){
  const out=get(name,shift,color.white);
  for(let i=0;i<count;i++){
   const a=i*2*Math.PI/count,b=a+.012,point=(t,z)=>[(r+.004)*Math.cos(t),(r+.004)*Math.sin(t),z],len=i%5===0?.10:.045;
   quad(out,point(a,z),point(b,z),point(b,z+len),point(a,z+len),[Math.cos(a),Math.sin(a),0]);
  }
 }
 function lens(name,shift,z,r,curve){
  const profile=[[0,z-curve*.7],[r*.4,z-curve*.55],[r*.75,z-curve*.2],[r,z],[r,z+.045],[r*.75,z+.045+curve*.4],[r*.4,z+.045+curve*.8],[0,z+.045+curve]];
  lathe(get(name,shift,color.glass),profile,128);
  ring(name,shift,z-.035,z+.085,r+.052,r-.015,color.edge);
 }
 // Separate axial housings have open centres. No solid cylinders hiding the optics.
 ring('mount',-1.1,-1.52,-1.23,.73,.51,color.edge);
 ring('rear',-.85,-1.25,-.56,.87,.67);
 ring('rear',-.85,-1.19,-1.07,.90,.70,color.black);
 ridge('rear',-.85,.866,-1.03,-.65,100);
 ring('rear',-.85,-.64,-.54,.91,.67,color.edge);
 ring('focus',-.37,-.54,.20,.96,.75);
 ridge('focus',-.37,.956,-.40,.06,124);
 ticks('focus',-.37,.961,.073,50);
 ring('focus',-.37,.12,.22,.97,.75,color.black);
 ring('front',1.03,.22,1.41,1.02,.84);
 ridge('front',1.03,1.017,.34,1.08,144);
 ring('front',1.03,1.10,1.20,1.055,.84,color.edge);
 ring('front',1.03,1.20,1.46,1.06,.88,color.black);
 ring('front',1.03,1.43,1.49,1.035,.90,color.edge);
 // Independent optics; shifts increase monotonically down the axis.
 lens('rear-glass',-.55,-.97,.56,.12);
 lens('middle-glass',.04,-.23,.66,.16);
 ring('iris',.30,.06,.17,.77,.52,color.edge);
 const blades=get('iris',.30,color.blade),opening=.27;
 for(let i=0;i<9;i++){const a=i*2*Math.PI/9,b=a+2*Math.PI/9+.10,point=(r,t)=>[r*Math.cos(t),r*Math.sin(t),.176+i*.001];quad(blades,point(.55,a),point(.55,b),point(opening,b+.28),point(opening,a+.28),[0,0,1]);}
 lens('forward-glass',.65,.48,.77,.19);
 lens('front-glass',1.03,1.23,.89,.115);
 // Front concentric engraved-style rings and radial index ticks.
 ring('front',1.03,1.37,1.40,.94,.915,color.edge);
 ring('front',1.03,1.39,1.42,.90,.875,color.black);
 return [...groups.values()];
}
function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(e)}return s}
const vs=`precision mediump float;
attribute vec3 aPosition,aNormal;
uniform vec3 uEye,uRight,uUp,uForward;
uniform float uAspect,uShift,uFocal;
uniform vec2 uOffset;
varying vec3 vPosition,vNormal,vLocal;
void main(){vec3 p=aPosition+vec3(0.,0.,uShift);vec3 d=p-uEye;float z=dot(d,uForward);
vPosition=p;vNormal=aNormal;vLocal=aPosition;
gl_Position=vec4(dot(d,uRight)*uFocal/uAspect+uOffset.x*z,dot(d,uUp)*uFocal+uOffset.y*z,1.006*z-.20,z);}`;
const fs=`precision mediump float;
uniform vec3 uEye,uColor;
uniform float uKind;
varying vec3 vPosition,vNormal,vLocal;
float band(float v,float center,float width){return exp(-pow((v-center)/width,2.));}
void main(){
 vec3 n=normalize(vNormal),v=normalize(uEye-vPosition),r=reflect(-v,n);
 vec3 key=normalize(vec3(-.7,.8,.9)),fill=normalize(vec3(.8,.3,-.5));
 float diffuse=max(dot(n,key),0.),side=max(dot(n,fill),0.);
 float fresnel=pow(1.-abs(dot(n,v)),3.);
 // Broad studio strip reflections follow the actual curved surface normal.
 float az=atan(r.y,r.x);
 float strip=band(az,1.2,.26)*band(r.z,.35,.82)+band(az,-1.7,.15)*band(r.z,.0,.9);
 float rim=band(az,2.7,.22)*band(r.z,-.1,.85);
 float broad=band(az,.2,.55)*band(r.z,.55,.75);
 float metalGrain=sin(vLocal.z*460.)*.022;
 vec3 cool=vec3(.24,.43,.91),warm=vec3(.91,.83,.69);
 vec3 c;
 if(uKind<.5){c=uColor*(.52+.53*diffuse+.24*side)+vec3(.66,.78,.97)*strip*.48+cool*rim*.29+warm*broad*.13+fresnel*vec3(.055)+metalGrain;}
 else if(uKind<1.5){c=vec3(.018,.022,.030)*(.75+diffuse)+strip*vec3(.17,.21,.29)+rim*cool*.11+vec3(.022)*fresnel;}
 else if(uKind<2.5){c=vec3(.29,.32,.36)*(.5+.55*diffuse)+strip*vec3(.72,.82,.96)*.73+cool*rim*.30+warm*broad*.20;}
 else if(uKind<3.5){
  float radial=length(vLocal.xy),ring=pow(.5+.5*cos(radial*25.+vLocal.z*11.),12.);
  float interference=.5+.5*sin(radial*8.+r.z*4.);
  vec3 coating=mix(vec3(.025,.045,.115),vec3(.09,.035,.105),interference);
  c=coating*(.65+.5*diffuse)+cool*strip*.55+vec3(.14,.54,.54)*broad*.20+vec3(.36,.19,.48)*rim*.48+ring*vec3(.025,.04,.06)+fresnel*vec3(.08,.12,.18);
 }
 else if(uKind<4.5){c=vec3(.095,.11,.15)*(.7+.6*diffuse)+vec3(.36,.44,.59)*strip*.36;}
 else{c=vec3(.67,.72,.78)*(.55+.45*diffuse);}
 // Filmic soft roll-off retains detail in specular highlights.
 c=pow(max(c,vec3(0.)),vec3(.82));gl_FragColor=vec4(clamp(c,0.,1.),1.);
}`;
function setFallback(error){if(error)stage.dataset.renderError=String(error.message||error);stage.dataset.renderer='static';canvas.hidden=true;fallback.hidden=false;rotation.disabled=true;document.querySelector('#renderer').textContent='CONCEPT ILLUSTRATION';}
function init(){
 try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl)throw Error('WebGL unavailable');const a=compile(gl.VERTEX_SHADER,vs),b=compile(gl.FRAGMENT_SHADER,fs);program=gl.createProgram();gl.attachShader(program,a);gl.attachShader(program,b);gl.linkProgram(program);gl.deleteShader(a);gl.deleteShader(b);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 uniforms=Object.fromEntries(['uEye','uRight','uUp','uForward','uAspect','uShift','uFocal','uOffset','uColor','uKind'].map(k=>[k,gl.getUniformLocation(program,k)]));
 meshes=model().map(m=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m.data),gl.STATIC_DRAW);return{buffer,count:m.data.length/6,shift:m.shift,kind:m.kind};});
 gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);delete stage.dataset.renderError;stage.dataset.renderer='webgl';canvas.hidden=false;fallback.hidden=true;rotation.disabled=false;document.querySelector('#renderer').textContent='LIVE / REAL-TIME 3D';queue();
 }catch(e){setFallback(e)}
}
function queue(){if(!frame&&!disposed&&!document.hidden&&stage.dataset.renderer==='webgl')frame=requestAnimationFrame(draw)}
function draw(){
 frame=0;if(!gl||gl.isContextLost()||document.hidden)return;
 const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,1.45,1450/Math.max(w,h)),cw=Math.max(1,Math.round(w*dpr)),ch=Math.max(1,Math.round(h*dpr));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
 const aspect=cw/ch,mobile=w<801;
 const yaw=pose.yaw+(scene==='inspect'?angle*Math.PI/180:0),pitch=pose.pitch,dist=pose.distance*(mobile?Math.max(1,1.02/aspect):1);
 const eye=[Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist],forward=norm(eye.map(x=>-x)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
 const focal=mobile?2.3:2.65,offset=mobile?[0,.30]:[.36,.03];
 gl.viewport(0,0,cw,ch);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
 for(const [k,v] of Object.entries({uEye:eye,uRight:right,uUp:up,uForward:forward,uColor:colors[finish]}))gl.uniform3fv(uniforms[k],v);
 gl.uniform1f(uniforms.uAspect,aspect);gl.uniform1f(uniforms.uFocal,focal);gl.uniform2fv(uniforms.uOffset,offset);
 const p=gl.getAttribLocation(program,'aPosition'),n=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(p);gl.enableVertexAttribArray(n);
 for(const m of meshes){gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);gl.vertexAttribPointer(p,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(n,3,gl.FLOAT,false,24,12);gl.uniform1f(uniforms.uShift,m.shift*pose.explode*1.6);gl.uniform1f(uniforms.uKind,m.kind);gl.drawArrays(gl.TRIANGLES,0,m.count);}
 stage.dataset.renderedScene=scene;stage.dataset.renderedFinish=finish;stage.dataset.renderedAngle=String(angle);stage.dataset.renderedExplode=pose.explode.toFixed(3);stage.dataset.drawCalls=String(meshes.length);
}
function sync(){
 scrollQueued=false;const y=scrollY,offsets=chapters.map(el=>el.getBoundingClientRect().top+y),last=chapters.length-1;
 let i=0;while(i<last&&y>=offsets[i+1]-2)i++;
 const next=Math.min(i+1,last),t=next===i?0:clamp((y-offsets[i])/Math.max(1,offsets[next]-offsets[i])),e=reduced.matches?0:ease(clamp((t-.44)/.56));
 position=i+t;scene=chapters[i].dataset.scene;stage.dataset.scene=scene;
 pose=Object.fromEntries(Object.keys(keyframes[i]).map(k=>[k,mix(keyframes[i][k],keyframes[next][k],e)]));
 document.querySelector('#count').textContent=String(i+1).padStart(2,'0')+' / 04';document.querySelector('#progress').style.setProperty('--progress',Math.min(100,position/last*100)+'%');
 links.forEach(link=>{if(link.dataset.jump===scene)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});queue();
}
function syncFinish(){stage.dataset.finish=finish;stage.dataset.angle=String(angle);rotation.value=String(angle);angleLabel.value=angle+'°';rotation.setAttribute('aria-valuetext',angle+' degrees');controls.querySelectorAll('button[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.finish===finish)));queue();}
controls.disabled=false;controls.querySelectorAll('button[data-finish]').forEach(b=>b.addEventListener('click',()=>{finish=b.dataset.finish;syncFinish()}));
rotation.addEventListener('input',()=>{angle=Number(rotation.value);syncFinish()});
document.querySelector('#reset').addEventListener('click',()=>{finish='graphite';angle=0;syncFinish()});
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(sync)}},{passive:true});window.addEventListener('resize',sync,{passive:true});reduced.addEventListener?.('change',sync);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;setFallback()});canvas.addEventListener('webglcontextrestored',()=>{meshes=[];init();sync()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else{sync();queue()}});
window.addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(frame);if(gl&&!gl.isContextLost()){for(const m of meshes)gl.deleteBuffer(m.buffer);if(program)gl.deleteProgram(program)}});
sync();syncFinish();init();
})();