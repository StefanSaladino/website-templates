(()=>{'use strict';
const M=globalThis.CalibreMechanism,stage=document.querySelector('#environment'),canvas=document.querySelector('#watch'),fallback=document.querySelector('.fallback'),chapters=[...document.querySelectorAll('.chapter')],links=[...document.querySelectorAll('[data-jump]')],controls=document.querySelector('#config'),run=document.querySelector('#run'),advance=document.querySelector('#advance'),rotation=document.querySelector('#rotation'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t),norm=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)},dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const keyframes=[{yaw:.32,pitch:.10,dist:8.8,explode:0,roll:-.12},{yaw:.12,pitch:.08,dist:4.9,explode:0,roll:.08},{yaw:1.05,pitch:.38,dist:10.1,explode:1,roll:-.15},{yaw:.32,pitch:.10,dist:8.5,explode:0,roll:-.10}];
let gl,program,meshes=[],uniforms={},frame=0,disposed=false,scene='reveal',angle=0,seconds=0,running=!reduced.matches,last=0,dirty=true,pose=keyframes[0],scrollQueued=false;
function model(){
 const groups=new Map();
 function get(name,layer,kind,pivot=[0,0,0],motion=''){const key=name+'|'+kind;if(!groups.has(key))groups.set(key,{layer,kind,pivot,motion,data:[]});return groups.get(key).data}
 const P=(r,t,z,x=0,y=0)=>[x+r*Math.cos(t),y+r*Math.sin(t),z];
 function tri(g,a,b,c,n){for(const p of [a,b,c])g.push(...p,...n)}
 function quad(g,a,b,c,d,n){tri(g,a,b,c,n);tri(g,a,c,d,n)}
 function lathe(g,profile,x=0,y=0,segments=96){
  for(let j=0;j<profile.length-1;j++){const [r,z]=profile[j],[rr,zz]=profile[j+1],n=norm([zz-z,r-rr]);for(let i=0;i<segments;i++){const t=i*2*Math.PI/segments,u=(i+1)*2*Math.PI/segments,a=P(r,t,z,x,y),b=P(rr,t,zz,x,y),c=P(rr,u,zz,x,y),d=P(r,u,z,x,y),na=[n[0]*Math.cos(t),n[0]*Math.sin(t),n[1]],nb=[n[0]*Math.cos(u),n[0]*Math.sin(u),n[1]];g.push(...a,...na,...b,...na,...c,...nb,...a,...na,...c,...nb,...d,...nb)}}
 }
 function ring(g,r,inner,z,h,x=0,y=0,segments=96){const b=Math.min(.025,h*.24,(r-inner)*.24);lathe(g,[[inner,z],[r-b,z],[r,z+b],[r,z+h-b],[r-b,z+h],[inner,z+h],[inner,z]],x,y,segments)}
 function box(g,x,y,z,w,h,d){const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z+d;quad(g,[a,c,z],[b,c,z],[b,e,z],[a,e,z],[0,0,-1]);quad(g,[a,c,f],[a,e,f],[b,e,f],[b,c,f],[0,0,1]);quad(g,[a,c,z],[a,c,f],[b,c,f],[b,c,z],[0,-1,0]);quad(g,[a,e,z],[b,e,z],[b,e,f],[a,e,f],[0,1,0]);quad(g,[a,c,z],[a,e,z],[a,e,f],[a,c,f],[-1,0,0]);quad(g,[b,c,z],[b,c,f],[b,e,f],[b,e,z],[1,0,0]);}
 function spoke(g,x,y,z,len,width,t,h){const p=(a,b,zz)=>[x+a*Math.cos(t)-b*Math.sin(t),y+a*Math.sin(t)+b*Math.cos(t),zz];quad(g,p(0,-width,z+h),p(len,-width,z+h),p(len,width,z+h),p(0,width,z+h),[0,0,1]);quad(g,p(0,-width,z),p(len,-width,z),p(len,-width,z+h),p(0,-width,z+h),[Math.sin(t),-Math.cos(t),0]);quad(g,p(0,width,z),p(0,width,z+h),p(len,width,z+h),p(len,width,z),[-Math.sin(t),Math.cos(t),0]);}
 // Mechanical housing and bracelet remain anchored when the optical axis separates.
 const caseMetal=get('case',0,0),back=get('back',-1.35,0),strap=get('strap',0,3);
 ring(caseMetal,1.50,1.27,-.26,.48);
 ring(back,1.44,.01,-.34,.09);
 ring(caseMetal,1.53,1.40,-.10,.15);
 for(const side of [-1,1]){for(const x of [-.59,.59])box(caseMetal,x,side*1.53,-.22,.26,.57,.33);for(let i=0;i<8;i++){const y=side*(1.82+i*.26);box(strap,0,y,-.19,1.13-i*.021,.245,.17);for(const x of [-.38,.38])box(get('strap-metal',0,1),x,y,-.02,.16,.225,.038);}}
 // Crown on the right side; concentric side ridges formed by individual blocks.
 box(caseMetal,1.56,0,-.11,.25,.37,.23);
 for(let i=0;i<11;i++)box(get('crown',0,1),1.66,-.165+i*.033,-.10,.16,.017,.24);
 const plate=get('plate',-.78,3);ring(plate,1.25,.01,-.16,.075);
 const dial=get('dial',1.25,0),indices=get('dial-indices',1.25,1);ring(dial,1.38,1.14,.30,.08);ring(get('bezel',1.75,0),1.51,1.37,.27,.16);ring(get('bezel-edge',1.75,1),1.47,1.43,.42,.035);
 for(let i=0;i<60;i++){const t=Math.PI/2-i*2*Math.PI/60;// Only the final segment is an index, not a full spoke.
  const r=i%5===0?1.16:1.25,L=1.33-r,w=i%5===0?.019:.008,x=r*Math.cos(t),y=r*Math.sin(t);spoke(indices,x,y,.394,L,w,t,.016);
 }
 // Gears share pitch radii and tooth phases from the pure mechanism module.
 function gear(g,x,y,z,r,teeth,h,hub){
  const root=r-M.moduleSize*.54,tip=r+M.moduleSize*.54,inner=Math.max(.035,r*.74),outline=[];
  for(let i=0;i<teeth;i++)for(const [off,rad] of [[-.5,root],[-.29,root],[-.19,tip],[.19,tip],[.29,root]])outline.push({a:(i+off)*2*Math.PI/teeth,r:rad});
  for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length],lo=P(a.r,a.a,z,x,y),hi=P(b.r,b.a,z,x,y),lt=P(a.r,a.a,z+h,x,y),ht=P(b.r,b.a,z+h,x,y),il=P(inner,a.a,z,x,y),ih=P(inner,b.a,z,x,y),it=P(inner,a.a,z+h,x,y),jt=P(inner,b.a,z+h,x,y);quad(g,lt,ht,jt,it,[0,0,1]);quad(g,lo,il,ih,hi,[0,0,-1]);const n=norm([hi[1]-lo[1],lo[0]-hi[0],0]);quad(g,lo,hi,ht,lt,n);}
  ring(g,hub,.025,z,h,x,y,32);for(let i=0;i<5;i++)spoke(g,x,y,z,inner+.01,r*.075,i*2*Math.PI/5,h);
 }
 M.gears.forEach((q,i)=>{const pivot=[q.x,q.y,0],g=get('gear'+i,-.20,i%2===0?2:1,pivot,'gear'+i);gear(g,q.x,q.y,-.02,q.radius,q.teeth,.11,q.radius*.23);ring(get('jewel'+i,-.20,4),.053,.005,.105,.032,q.x,q.y,24);ring(get('axle'+i,-.20,0),.026,0,-.09,.25,q.x,q.y,24)});
 const bx=-.58,by=-.59,bal=get('balance',-.20,2,[bx,by,0],'balance');
 ring(bal,.30,.265,.04,.085,bx,by,64);ring(bal,.067,.02,.04,.085,bx,by,32);for(let i=0;i<3;i++)spoke(bal,bx,by,.04,.28,.017,i*2*Math.PI/3,.085);
 const escape=get('escape',-.20,1,[-.05,-.83,0],'escapement');gear(escape,-.05,-.83,.015,.12,15,.065,.04);
 // Two decorative bridges routed around the rotating assembly, with bearings.
 const bridge=get('bridge',.50,1);ring(bridge,1.18,1.10,.16,.065);box(bridge,-.87,.76,.16,.47,.105,.065);box(bridge,.52,.85,.16,.53,.095,.065);
 for(const [x,y] of [[-.97,.76],[.78,.85],[.79,-.84],[-.83,-.84]]){ring(get('screws',.50,0),.065,0,.229,.035,x,y,24);box(get('slots',.50,3),x,y,.264,.077,.012,.005)}
 for(const [i,len,w,offset,kind] of [[0,1.03,.009,0,2],[1,.94,.026,-.95,1],[2,.70,.034,.83,1]]){const out=get('hand'+i,1.25,kind,[0,0,0],'hand'+i);spoke(out,0,0,.47+i*.019,len,w,Math.PI/2+offset,.018);spoke(out,0,0,.47+i*.019,.15,w*.6,Math.PI*1.5+offset,.018)}
 ring(get('pin',1.25,2),.055,0,.55,.035,0,0,32);
 return [...groups.values()];
}
function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(msg)}return s}
const vs=`precision mediump float;
attribute vec3 aPosition,aNormal;
uniform vec3 uEye,uRight,uUp,uForward,uPivot;uniform float uAspect,uShift,uFocal,uSpin,uRoll;uniform vec2 uOffset;varying vec3 vPosition,vNormal,vLocal;
vec3 rotateZ(vec3 p,float t){float c=cos(t),s=sin(t);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
void main(){vec3 p=rotateZ(aPosition-uPivot,uSpin)+uPivot+vec3(0.,0.,uShift);p=rotateZ(p,uRoll);vec3 d=p-uEye;float z=dot(d,uForward);vPosition=p;vNormal=rotateZ(rotateZ(aNormal,uSpin),uRoll);vLocal=aPosition;gl_Position=vec4(dot(d,uRight)*uFocal/uAspect+uOffset.x*z,dot(d,uUp)*uFocal+uOffset.y*z,1.006*z-.2,z);}`;
const fs=`precision mediump float;
uniform vec3 uEye;uniform float uKind;varying vec3 vPosition,vNormal,vLocal;
float band(float a,float b,float w){float x=(a-b)/w;return exp(-x*x);}
void main(){vec3 n=normalize(vNormal),v=normalize(uEye-vPosition),r=reflect(-v,n);float diffuse=max(dot(n,normalize(vec3(-.7,.8,1.))),0.),fill=max(dot(n,normalize(vec3(.8,-.3,.45))),0.),az=atan(r.y,r.x),strip=band(az,1.7,.38)*band(r.z,.7,.65)+band(az,-1.9,.25)*band(r.z,.3,.8),fresnel=pow(1.-abs(dot(n,v)),3.);vec3 c;
float brushed=.012*sin(vLocal.x*380.+vLocal.y*260.);
if(uKind<.5)c=vec3(.38,.35,.29)*(.50+.70*diffuse+.22*fill)+vec3(.83,.76,.62)*strip*.55+vec3(.13,.11,.09)*fresnel+brushed;
else if(uKind<1.5)c=vec3(.56,.53,.47)*(.55+.62*diffuse+.2*fill)+vec3(.97,.91,.78)*strip*.6+brushed;
else if(uKind<2.5)c=vec3(.61,.38,.14)*(.58+.72*diffuse+.24*fill)+vec3(1.,.78,.38)*strip*.50+vec3(.08,.05,.02)*fresnel+brushed;
else if(uKind<3.5)c=vec3(.065,.059,.046)*(.65+.7*diffuse)+vec3(.25,.22,.17)*strip*.2+brushed;
else c=vec3(.29,.045,.075)*(.6+.8*diffuse)+vec3(.8,.38,.45)*strip*.6;
gl_FragColor=vec4(pow(clamp(c,0.,1.),vec3(.86)),1.);}`;
function setFallback(error){if(error)stage.dataset.renderError=String(error.message||error);stage.dataset.renderer='static';canvas.hidden=true;fallback.hidden=false;rotation.disabled=true;run.disabled=true;advance.disabled=true;document.querySelector('#renderer').textContent='CONCEPT ILLUSTRATION';}
function init(){try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl)throw Error('WebGL unavailable');const a=compile(gl.VERTEX_SHADER,vs),b=compile(gl.FRAGMENT_SHADER,fs);program=gl.createProgram();gl.attachShader(program,a);gl.attachShader(program,b);gl.linkProgram(program);gl.deleteShader(a);gl.deleteShader(b);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));uniforms=Object.fromEntries(['uEye','uRight','uUp','uForward','uPivot','uAspect','uShift','uFocal','uSpin','uRoll','uOffset','uKind'].map(k=>[k,gl.getUniformLocation(program,k)]));meshes=model().map(m=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m.data),gl.STATIC_DRAW);return{...m,data:null,buffer,count:m.data.length/6}});gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);delete stage.dataset.renderError;stage.dataset.renderer='webgl';canvas.hidden=false;fallback.hidden=true;rotation.disabled=false;advance.disabled=false;run.disabled=reduced.matches;document.querySelector('#renderer').textContent='LIVE MECHANISM';dirty=true;queue()}catch(e){setFallback(e)}}
function queue(){if(!frame&&!disposed&&!document.hidden&&stage.dataset.renderer==='webgl')frame=requestAnimationFrame(draw)}
function draw(now){frame=0;if(!gl||gl.isContextLost()||document.hidden)return;if(running&&!reduced.matches&&last)seconds+=Math.min((now-last)/1000,.06);last=now;if(!dirty&&running&&now-(draw.last||0)<32){queue();return}
 const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,1.4,1400/Math.max(w,h)),cw=Math.max(1,Math.round(w*dpr)),ch=Math.max(1,Math.round(h*dpr));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}
 const aspect=cw/ch,mobile=w<821,yaw=pose.yaw+(scene==='inspect'?angle*Math.PI/180:0),pitch=pose.pitch,dist=pose.dist*(mobile?Math.max(1,.83/aspect):1),eye=[Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist],forward=norm(eye.map(x=>-x)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward),offset=mobile?[0,.22]:[.14,-.025],focal=mobile?2.15:2.4;
 const s=M.state(seconds),spins={balance:s.balance,escapement:s.escapement};s.gears.forEach((v,i)=>spins['gear'+i]=v);s.hands.forEach((v,i)=>spins['hand'+i]=v);
 gl.viewport(0,0,cw,ch);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
 for(const [k,v] of Object.entries({uEye:eye,uRight:right,uUp:up,uForward:forward}))gl.uniform3fv(uniforms[k],v);
 gl.uniform1f(uniforms.uAspect,aspect);gl.uniform1f(uniforms.uFocal,focal);gl.uniform1f(uniforms.uRoll,pose.roll);gl.uniform2fv(uniforms.uOffset,offset);
 const p=gl.getAttribLocation(program,'aPosition'),n=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(p);gl.enableVertexAttribArray(n);
 for(const m of meshes){gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);gl.vertexAttribPointer(p,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(n,3,gl.FLOAT,false,24,12);gl.uniform3fv(uniforms.uPivot,m.pivot);gl.uniform1f(uniforms.uSpin,spins[m.motion]||0);gl.uniform1f(uniforms.uShift,m.layer*pose.explode*1.25);gl.uniform1f(uniforms.uKind,m.kind);gl.drawArrays(gl.TRIANGLES,0,m.count)}
 stage.dataset.renderedScene=scene;stage.dataset.renderedExplode=pose.explode.toFixed(3);stage.dataset.renderedAngle=String(angle);stage.dataset.renderedTime=seconds.toFixed(3);stage.dataset.renderedRunning=String(running&&!reduced.matches);stage.dataset.gearAngles=JSON.stringify(s.gears);stage.dataset.drawCalls=String(meshes.length);document.querySelector('#time').value=seconds.toFixed(1)+' s';dirty=false;draw.last=now;if(running&&!reduced.matches)queue();
}
function sync(){scrollQueued=false;const y=scrollY,offsets=chapters.map(el=>el.getBoundingClientRect().top+y),lastIndex=chapters.length-1;let i=0;while(i<lastIndex&&y>=offsets[i+1]-2)i++;const next=Math.min(i+1,lastIndex),t=i===lastIndex?0:clamp((y-offsets[i])/Math.max(1,offsets[next]-offsets[i])),e=reduced.matches?0:ease(clamp((t-.42)/.58));scene=chapters[i].dataset.scene;stage.dataset.scene=scene;pose=Object.fromEntries(Object.keys(keyframes[i]).map(k=>[k,mix(keyframes[i][k],keyframes[next][k],e)]));document.querySelector('#count').textContent=String(i+1).padStart(2,'0')+' / 04';links.forEach(link=>{if(link.dataset.jump===scene)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});dirty=true;queue()}
function syncControls(){run.textContent=running?'Pause movement':'Run movement';run.setAttribute('aria-pressed',String(!running));rotation.value=String(angle);document.querySelector('#angle').value=angle+'°';rotation.setAttribute('aria-valuetext',angle+' degrees');stage.dataset.angle=String(angle);dirty=true;queue()}
controls.disabled=false;run.addEventListener('click',()=>{running=!running;last=0;syncControls()});advance.addEventListener('click',()=>{seconds+=10;last=0;dirty=true;queue()});rotation.addEventListener('input',()=>{angle=Number(rotation.value);syncControls()});document.querySelector('#reset').addEventListener('click',()=>{seconds=0;angle=0;running=false;last=0;syncControls()});
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(sync)}},{passive:true});window.addEventListener('resize',sync,{passive:true});reduced.addEventListener?.('change',()=>{if(reduced.matches){running=false;last=0}run.disabled=reduced.matches||stage.dataset.renderer!=='webgl';syncControls();sync()});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;last=0;setFallback()});canvas.addEventListener('webglcontextrestored',()=>{meshes=[];init();sync()});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0}else{dirty=true;queue()}});window.addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(frame);if(gl&&!gl.isContextLost()){for(const m of meshes)gl.deleteBuffer(m.buffer);if(program)gl.deleteProgram(program)}});sync();syncControls();init();
})();