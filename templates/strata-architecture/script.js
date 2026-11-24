(() => {
'use strict';
const stage=document.querySelector('.stage'),canvas=document.querySelector('#architecture'),fallback=document.querySelector('.fallback'),controls=document.querySelector('#views'),caption=document.querySelector('#render-caption'),label=document.querySelector('#scene-label'),description=document.querySelector('#scene-description');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const views={
 exterior:{label:'Exterior',eye:[9.6,7.1,11.5],target:[0,.25,0],span:11.5,copy:'Two wings enclose a terrace and reflecting pool. A continuous roof establishes a horizontal line against the landscape.'},
 courtyard:{label:'Courtyard',eye:[4.1,2.55,8.4],target:[-.65,1.05,-1.2],span:8.6,copy:'From the terrace, the timber screens and deep overhang shelter a glazed living room. Water forms the foreground.'},
 plan:{label:'Roof-off plan',eye:[0,15,.0001],target:[0,0,0],span:11.1,copy:'The roof is hidden in this drawing view. The L-shaped arrangement encloses the garden; interior furniture indicates how each wing is occupied.'}
};
let view='exterior',light='day',gl,program,uniforms,buffers=[],frame=0,visible=true,observer,resizeObserver,transition=null,pose=views.exterior,manual=false,disposed=false;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),mix=(a,b,t)=>a+(b-a)*t;
const norm=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n)},sub=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const palette={concrete:[.74,.69,.59],roof:[.84,.80,.70],edge:[.56,.52,.44],wood:[.53,.39,.26],dark:[.19,.23,.20],glass:[.34,.44,.40],interior:[.65,.60,.49],linen:[.83,.78,.68],water:[.29,.49,.47],soil:[.55,.53,.43],grass:[.39,.45,.31],leaf:[.30,.39,.26],trunk:[.37,.30,.22],paving:[.71,.67,.57],gravel:[.61,.58,.49]};
let seed=83419;
const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
function scene(){
 seed=83419;
 const groups={ground:[],shadow:[],fixed:[],roof:[],detail:[]},casts=[];
 function tri(g,a,b,c,n,col,kind=0){for(const p of [a,b,c])g.push(...p,...n,...col,kind);}
 function quad(g,a,b,c,d,n,col,kind=0){tri(g,a,b,c,n,col,kind);tri(g,a,c,d,n,col,kind);}
 function box(g,x,y,z,w,h,d,col,kind=0,cast=false){
  const a=x-w/2,b=x+w/2,c=y,dY=y+h,e=z-d/2,f=z+d/2;
  quad(g,[a,c,e],[b,c,e],[b,dY,e],[a,dY,e],[0,0,-1],col,kind);
  quad(g,[b,c,f],[a,c,f],[a,dY,f],[b,dY,f],[0,0,1],col,kind);
  quad(g,[a,c,f],[a,c,e],[a,dY,e],[a,dY,f],[-1,0,0],col,kind);
  quad(g,[b,c,e],[b,c,f],[b,dY,f],[b,dY,e],[1,0,0],col,kind);
  quad(g,[a,dY,e],[b,dY,e],[b,dY,f],[a,dY,f],[0,1,0],col,kind);
  quad(g,[a,c,f],[b,c,f],[b,c,e],[a,c,e],[0,-1,0],col,kind);
  if(cast)casts.push({x,y:dY,z,w,d});
 }
 function cone(g,x,y,z,r,h,col,segments=12){
  for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments,p=[x+r*Math.cos(a),y,z+r*Math.sin(a)],q=[x+r*Math.cos(b),y,z+r*Math.sin(b)],top=[x,y+h,z];tri(g,p,q,top,norm(cross(sub(q,p),sub(top,p))).map(v=>-v),col);}
 }
 const G=groups.ground,B=groups.fixed,R=groups.roof,D=groups.detail,S=groups.shadow;
 // The house is an original 9 x 8 unit L-shaped courtyard composition.
 box(G,0,-.60,0,11,.28,9.2,palette.soil);
 box(G,0,-.32,0,10.2,.32,8.4,palette.paving);
 box(G,0,-.05,0,9.7,.08,7.9,palette.gravel);
 box(G,-.45,.03,.10,8.1,.065,6.8,palette.paving);
 // Low terrace, steps and reflecting pool: genuine recessed basin.
 box(B,-.45,.095,1.85,4.4,.10,2.45,palette.edge);
 box(B,-.45,.195,1.85,4.13,.014,2.18,palette.water,2);
 for(const [x,z,w,d] of [[-2.59,1.85,.18,2.45],[1.69,1.85,.18,2.45],[-.45,.71,4.13,.18],[-.45,2.99,4.13,.18]])box(B,x,.195,z,w,.12,d,palette.roof);
 for(let j=0;j<4;j++)box(B,-.7,.03+j*.045,3.45-j*.18,3.7,.045,.25,palette.concrete);
 // Main north wing, service/bedroom east wing, and a recessed glass facade.
 box(B,-.25,.10,-2.55,8.15,.18,2.50,palette.concrete);
 box(B,3.0,.10,.65,2.1,.18,5.8,palette.concrete);
 box(B,-.25,.28,-3.70,8.15,1.91,.20,palette.concrete,0,true);
 box(B,-4.25,.28,-2.55,.20,1.91,2.50,palette.concrete,0,true);
 box(B,4.02,.28,.65,.20,1.91,5.8,palette.concrete,0,true);
 box(B,3.0,.28,3.46,2.1,1.91,.20,palette.concrete,0,true);
 // Timber-lined volumes and internal partitions.
 box(B,-2.2,.28,-2.65,.14,1.90,1.95,palette.concrete);
 box(B,1.18,.28,-2.65,.14,1.90,1.95,palette.concrete);
 box(B,3.0,.28,.38,1.98,1.90,.14,palette.concrete);
 box(B,3.0,.28,2.0,1.98,1.90,.14,palette.concrete);
 // Glass reads as translucent-looking coloured panels with warm reflected highlights;
 // no fake photographic textures or downloaded environment maps.
 for(let i=0;i<8;i++){
  const x=-3.84+i*.90;
  box(B,x,.30,-1.39,.85,1.80,.035,palette.glass,3);
  box(B,x-.45,.28,-1.35,.045,1.91,.075,palette.dark);
  box(B,x,.30,-1.35,.85,.045,.075,palette.dark);
 }
 box(B,3.35,.28,-1.35,.055,1.91,.075,palette.dark);
 for(let i=0;i<7;i++){
  const z=-.85+i*.59;
  box(B,1.98,.30,z,.036,1.80,.55,palette.glass,3);
  box(B,1.95,.28,z-.295,.065,1.91,.045,palette.dark);
 }
 // Timber privacy screen, columns and roof lines.
 for(let i=0;i<15;i++)box(B,-4.18+i*.106,.28,-1.12,.045,1.91,.16,palette.wood,0,true);
 for(let i=0;i<12;i++)box(B,1.75,.28,1.33+i*.165,.15,1.91,.052,palette.wood,0,true);
 for(const [x,z] of [[-4.35,-.95],[-1.12,-.95],[1.2,-.95],[1.70,3.5]])box(B,x,.28,z,.09,1.91,.09,palette.dark,0,true);
 box(R,-.25,2.19,-2.55,8.85,.20,3.05,palette.roof,0,true);
 box(R,3.0,2.19,.77,2.65,.20,6.2,palette.roof,0,true);
 box(R,-.25,2.39,-3.94,8.85,.09,.14,palette.edge);
 box(R,4.26,2.39,.77,.14,.09,6.2,palette.edge);
 // Furniture and built-in cabinetry retained when the roof is hidden in plan mode.
 box(D,-.65,.29,-2.84,1.65,.34,.70,palette.linen);box(D,-.65,.63,-3.11,1.65,.27,.16,palette.linen);
 box(D,-1.43,.63,-2.84,.15,.25,.70,palette.linen);box(D,.13,.63,-2.84,.15,.25,.70,palette.linen);
 box(D,-.58,.30,-2.10,1.13,.24,.47,palette.wood);
 box(D,-3.20,.29,-2.80,1.15,.34,1.16,palette.wood);box(D,-3.20,.63,-2.80,1.06,.13,1.08,palette.linen);
 box(D,2.90,.28,1.25,1.22,.30,1.30,palette.wood);box(D,2.90,.58,1.25,1.13,.16,1.20,palette.linen);
 for(let i=0;i<4;i++)box(D,2.98,.28,-2.99+i*.38,.55,.84,.35,palette.wood);
 box(D,2.99,1.12,-2.43,.63,.06,1.45,palette.roof);
 box(D,-3.42,.10,1.75,.56,.42,1.34,palette.wood);
 box(D,-3.42,.52,1.75,.52,.08,1.26,palette.linen);
 // Gravel beds and seeded shrubs / trees provide scale, not random ornament.
 for(const [x,z,w,d] of [[-3.65,2.55,1.1,2.4],[.65,3.37,2.5,.62],[4.5,.50,.55,5.6],[-.8,-4.02,5.3,.45]]){
  box(G,x,.035,z,w,.07,d,palette.grass);
  for(let i=0;i<Math.floor(w*d*5);i++){
   const px=x+(rand()-.5)*w*.82,pz=z+(rand()-.5)*d*.8,r=.065+rand()*.12;
   cone(D,px,.10,pz,r,.10+rand()*.15,palette.leaf,7);
  }
 }
 for(const [x,z,h] of [[-3.85,2.55,1.30],[4.55,2.6,1.58],[-3.68,-3.92,1.65]]){
  box(D,x,.09,z,.07,h,.07,palette.trunk);
  for(let j=0;j<4;j++){const r=.34-j*.046;cone(D,x,.09+h*.36+j*h*.15,z,r,h*.46,[.29+j*.025,.36+j*.025,.23+j*.02],12);}
 }
 // Projected soft-edged architectural shade, drawn as transparent ground polygons.
 // A roof never floats: plan switches roof visibility and its projected shadows.
 const col=[.26,.28,.23];
 for(const o of casts){const x=o.x+o.y*.38,z=o.z+o.y*.42,y=.101;
  quad(S,[x-o.w/2,y,z-o.d/2],[x+o.w/2,y,z-o.d/2],[x+o.w/2,y,z+o.d/2],[x-o.w/2,y,z+o.d/2],[0,1,0],col,4);
 }
 return groups;
}
function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(msg)}return s}
function fallbackMode(){stage.dataset.renderer='static';canvas.hidden=true;fallback.hidden=false;caption.textContent='Original architectural illustration';}
function init(){
 try{
 gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl)throw Error('WebGL unavailable');
 const vs=compile(gl.VERTEX_SHADER,`
 attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;attribute float aKind;
 uniform vec3 uEye,uRight,uUp,uForward;uniform vec2 uSpan;uniform float uPlan;
 varying vec3 vPos,vNormal,vColor;varying float vKind;
 void main(){
  vec3 d=aPosition-uEye;
  vPos=aPosition;vNormal=aNormal;vColor=aColor;vKind=aKind;
  float depth=dot(d,uForward);
  float perspective=mix(1.0,clamp(depth/13.0,.65,1.5),1.0-uPlan);
  gl_Position=vec4(dot(d,uRight)*2.0/uSpan.x,dot(d,uUp)*2.0/uSpan.y,(depth-15.0)/25.0*perspective,perspective);
 }`);
 const fs=compile(gl.FRAGMENT_SHADER,`
 precision mediump float;
 uniform float uDusk;uniform vec3 uEye;
 varying vec3 vPos,vNormal,vColor;varying float vKind;
 void main(){
  if(vKind>3.5){gl_FragColor=vec4(.17,.19,.15,mix(.15,.24,uDusk));return;}
  vec3 n=normalize(vNormal),sun=normalize(vec3(-.65,.9,-.48)),view=normalize(uEye-vPos);
  float diffuse=max(dot(n,sun),0.);
  vec3 daylight=vec3(.58,.59,.53)+diffuse*vec3(.51,.47,.38);
  vec3 evening=vec3(.37,.43,.48)+diffuse*vec3(.52,.31,.16);
  vec3 lit=vColor*mix(daylight,evening,uDusk);
  float grain=fract(sin(dot(floor(vPos*90.),vec3(12.9898,78.233,37.719)))*43758.5453);
  lit+=(grain-.5)*.018;
  if(vKind>1.5&&vKind<2.5){
   float ripple=sin(vPos.x*38.+sin(vPos.z*14.)*1.8)*sin(vPos.z*33.);
   float sheen=pow(1.-abs(dot(n,view)),2.);
   lit+=vec3(.10,.16,.14)*sheen+vec3(.035)*ripple;
  }
  if(vKind>2.5&&vKind<3.5){float reflection=pow(1.-abs(dot(n,view)),3.);lit=mix(lit,vec3(.70,.74,.68),reflection*.38);lit=mix(lit,vec3(.67,.48,.25),uDusk*.75);}
  gl_FragColor=vec4(clamp(lit,0.,1.),1.);
 }`);
 program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 uniforms=Object.fromEntries(['uEye','uRight','uUp','uForward','uSpan','uPlan','uDusk'].map(k=>[k,gl.getUniformLocation(program,k)]));
 buffers=Object.entries(scene()).map(([name,data])=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return{name,buffer,count:data.length/10}});
 gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);stage.dataset.renderer='webgl';canvas.hidden=false;fallback.hidden=true;caption.textContent='Live procedural 3D / no imported model';requestDraw();
 }catch{fallbackMode();}
}
function requestDraw(){if(disposed||!gl||stage.dataset.renderer!=='webgl'||!visible||document.hidden||frame)return;frame=requestAnimationFrame(draw);}
function draw(now){
 frame=0;if(!gl||gl.isContextLost()||stage.dataset.renderer!=='webgl')return;
 if(transition){
  const t=clamp((now-transition.start)/650,0,1),e=t*t*(3-2*t),a=transition.from,b=transition.to;
  pose={eye:a.eye.map((x,i)=>mix(x,b.eye[i],e)),target:a.target.map((x,i)=>mix(x,b.target[i],e)),span:mix(a.span,b.span,e)};
  if(t>=1){pose=b;transition=null}
 }
 const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.55,1200/Math.max(rect.width,rect.height,1)),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const forward=norm(sub(pose.target,pose.eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward),aspect=w/h;
 const span=pose.span*Math.max(1,1.20/aspect),horizontal=span*aspect;
 gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
 for(const [k,v] of Object.entries({uEye:pose.eye,uRight:right,uUp:up,uForward:forward}))gl.uniform3fv(uniforms[k],v);
 gl.uniform2f(uniforms.uSpan,horizontal,span);gl.uniform1f(uniforms.uPlan,view==='plan'?1:0);gl.uniform1f(uniforms.uDusk,light==='dusk'?1:0);
 for(const item of buffers){
  if(view==='plan'&&(item.name==='roof'||item.name==='shadow'))continue;
  gl.bindBuffer(gl.ARRAY_BUFFER,item.buffer);
  for(const [key,size,offset] of [['aPosition',3,0],['aNormal',3,12],['aColor',3,24],['aKind',1,36]]){const loc=gl.getAttribLocation(program,key);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,40,offset);}
  if(item.name==='shadow'){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}
  gl.drawArrays(gl.TRIANGLES,0,item.count);
  if(item.name==='shadow'){gl.depthMask(true);gl.disable(gl.BLEND);}
 }
 if(transition)requestDraw();else{stage.dataset.renderedView=view;stage.dataset.renderedLight=light;}
}
function update(next=view,nextLight=light,animate=true){
 const changed=next!==view;view=next;light=nextLight;stage.dataset.view=view;stage.dataset.light=light;
 label.textContent=views[view].label;description.textContent=views[view].copy+(light==='dusk'?' In the evening study, warmer glazing contrasts with cool stone.':'');
 for(const b of controls.querySelectorAll('button[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===view));
 for(const b of controls.querySelectorAll('button[data-light]'))b.setAttribute('aria-pressed',String(b.dataset.light===light));
 for(const key of Object.keys(views))fallback.querySelector('.fallback-'+key).setAttribute('display',key===view?'inline':'none');
 if(changed&&animate&&!motion.matches&&stage.dataset.renderer==='webgl'&&view!=='plan'&&pose!==views.plan)transition={from:pose,to:views[view],start:performance.now()};
 else if(changed||!animate){pose=views[view];transition=null}
 requestDraw();
}
controls.disabled=false;update('exterior','day',false);init();
for(const b of controls.querySelectorAll('button[data-view]'))b.addEventListener('click',()=>{manual=true;update(b.dataset.view,light)});
for(const b of controls.querySelectorAll('button[data-light]'))b.addEventListener('click',()=>update(view,b.dataset.light));
document.querySelector('#reset').addEventListener('click',()=>{manual=true;update('exterior','day',false)});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;transition=null;pose=views[view];fallbackMode()});
canvas.addEventListener('webglcontextrestored',()=>{buffers=[];init();update(view,light,false)});
if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw()});observer.observe(stage)}
if('ResizeObserver'in window){resizeObserver=new ResizeObserver(requestDraw);resizeObserver.observe(stage)}else window.addEventListener('resize',requestDraw,{passive:true});
motion.addEventListener?.('change',()=>{if(motion.matches){pose=views[view];transition=null;requestDraw()}});
window.addEventListener('scroll',()=>{if(manual||motion.matches||view!=='exterior'||!visible||transition)return;const t=clamp(-stage.getBoundingClientRect().top/stage.offsetHeight,0,1);pose={...views.exterior,eye:[9.6-1.6*t,7.1-.6*t,11.5+.8*t]};requestDraw()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else requestDraw()});
window.addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(frame);observer?.disconnect();resizeObserver?.disconnect();if(gl&&!gl.isContextLost()){for(const item of buffers)gl.deleteBuffer(item.buffer);if(program)gl.deleteProgram(program)}});
})();
