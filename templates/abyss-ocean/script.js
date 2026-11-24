(() => {
'use strict';
const ocean=document.querySelector('#environment'),canvas=document.querySelector('#ocean-canvas'),fallback=document.querySelector('.fallback'),readout=document.querySelector('#depth-readout'),pauseButton=document.querySelector('#motion'),qualityButton=document.querySelector('#quality'),chapters=[...document.querySelectorAll('.chapter')],links=[...document.querySelectorAll('[data-jump]')];
const media=matchMedia('(prefers-reduced-motion: reduce)');
let gl,program,buffer,uniforms,frame=0,last=0,waterTime=0,depth=0,progress=0,zone='surface',paused=media.matches,low=matchMedia('(max-width: 700px)').matches,dirty=true,disposed=false,scrollPending=false,manualMotion=false;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
function compile(type,src){const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(msg)}return shader;}
const vertex=`
precision mediump float;
attribute vec2 aPosition;
void main(){gl_Position=vec4(aPosition,0.,1.);}
`;
const fragment=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uResolution;
uniform float uDepth,uTime,uQuality;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 t=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),t.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),t.x),t.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p=mat2(1.6,-1.2,1.2,1.6)*p+1.7;a*=.49;}return v;}
float ridge(vec2 p){return 1.-abs(2.*noise(p)-1.);}
float jelly(vec2 p,float t){
 float pulse=1.+.075*sin(t*1.6);
 p.x/=pulse;
 float dome=length(vec2(p.x,p.y*1.6));
 float bell=exp(-abs(dome-.46)*32.)*smoothstep(-.10,.07,p.y);
 float core=exp(-dome*dome*13.)*smoothstep(-.05,.1,p.y)*.17;
 float tendrils=0.;
 for(int i=0;i<6;i++){float k=float(i),x=(k-2.5)*.115;float bend=.04*sin(p.y*8.+k+t*.8);float line=abs(p.x-x-bend);tendrils+=exp(-line*52.)*smoothstep(-1.5,-.52,p.y)*(1.-smoothstep(-.14,.03,p.y));}
 return bell+core+tendrils*.32;
}
void main(){
 vec2 uv=gl_FragCoord.xy/uResolution, p=(gl_FragCoord.xy-.5*uResolution)/uResolution.y;
 float d=uDepth,t=uTime;
 float daylight=exp(-d*4.8), twilight=exp(-d*2.2);
 vec3 dark=vec3(.0015,.005,.013);
 vec3 shallow=mix(vec3(.006,.06,.11),vec3(.045,.26,.34),pow(uv.y,1.8));
 vec3 color=mix(dark,shallow,twilight);
 // Broad, layered volumes and wave interference: deliberately irregular, not a screen gradient.
 float cloud=fbm(p*2.4+vec2(.05*t,d*.9));
 color+=vec3(.013,.048,.064)*cloud*twilight;
 vec2 sun=vec2(.38,.68);
 vec2 ray=p-sun;
 float angle=atan(ray.x,-ray.y);
 float rays=pow(.5+.5*sin(angle*24.+fbm(vec2(angle*8.,t*.025))*8.),7.);
 rays+=.42*pow(.5+.5*sin(angle*48.-.4*t),9.);
 float scatter;
 // Smooth reversed thresholds are expressed explicitly below for GLSL portability.
 scatter=exp(-length(ray)*1.7)*(1.-smoothstep(.14,.75,p.y));
 color+=vec3(.11,.28,.29)*rays*scatter*daylight;
 float topGlow=exp(-dot(ray*vec2(1.1,1.8),ray*vec2(1.1,1.8))*4.);
 color+=vec3(.13,.35,.36)*topGlow*daylight;
 float surface=pow(ridge(p*vec2(9.,26.)+vec2(t*.07,t*.025)),11.)*smoothstep(.28,.53,p.y)*daylight;
 color+=vec3(.075,.16,.17)*surface;
 // Soft caustic traces bent by two moving wave fields.
 vec2 q=p*vec2(6.,9.)+vec2(sin(p.y*9.+t*.28),cos(p.x*7.-t*.19))*.5;
 float caustic=pow(1.-abs(sin(q.x+sin(q.y))*cos(q.y+sin(q.x))),18.);
 color+=vec3(.015,.065,.073)*caustic*daylight*(.25+.75*uv.y);
 // Layered marine snow, moving slowly at distinct apparent depths.
 for(int i=0;i<4;i++){
  if(float(i)>uQuality+1.)break;
  float z=float(i),scale=17.+z*10.;
  vec2 c=p*scale+vec2(t*(.11+z*.035)+d*(3.+z),-t*(.075+z*.035)+d*scale);
  vec2 cell=floor(c),g=fract(c)-.5;
  vec2 off=vec2(hash(cell+z),hash(cell+18.7+z))*.62-.31;
  float r=length(g-off),size=.028+.035*hash(cell+4.1);
  float mote=(1.-smoothstep(size,size+.065,r))*step(.83,hash(cell+z*3.9));
  float glow=exp(-r*r*38.)*step(.94,hash(cell+z*3.9));
  color+=vec3(.15,.28,.31)*(mote*.27+glow*.035)*(.35+.65*daylight)/(1.+z*.45);
 }
 // Distant schooling fish in the light zone; their silhouettes are tiny and environmental.
 for(int i=0;i<10;i++){
  float k=float(i),r=hash(vec2(k,2.)),s=hash(vec2(k,9.));
  vec2 fp=p-vec2(.42+(r-.5)*.47+sin(t*.1+k)*.025,.12+(s-.5)*.26);
  fp*=vec2(42.,105.);
  float body=(1.-smoothstep(.8,1.1,length(fp)));
  float tail=(1.-smoothstep(.0,.19,abs(fp.y)-(.6-(fp.x-.7)*.35)))*step(.65,fp.x)*step(fp.x,1.36);
  color=mix(color,vec3(.004,.022,.035),clamp((body+tail)*.65*daylight,0.,1.));
 }
 // The primary organic subject emerges in the midnight zone. Analytic luminous
 // bell, interior scattering and filament paths are drawn in the fragment shader.
 float life=smoothstep(.28,.58,d)*(1.-smoothstep(.86,1.,d));
 vec2 jp=(p-vec2(.30,.06+sin(t*.24)*.028))*2.15;
 float j=jelly(jp,t);
 color+=vec3(.045,.37,.42)*j*life;
 float halo=exp(-dot(jp,jp)*3.)*.06*life;
 color+=vec3(.02,.30,.38)*halo;
 vec2 j2=(p-vec2(-.48,.22+sin(t*.19+1.)*.035))*4.6;
 color+=vec3(.03,.17,.22)*jelly(j2,t+2.)*life*.4;
 // Deep ridged terrain: depth-fogged silhouettes, no random floating geometry.
 float floorFade=smoothstep(.66,.98,d);
 float horizon=-.27+noise(vec2(p.x*2.8,4.))*.07+fbm(vec2(p.x*4.5,8.))*.07;
 float ground=1.-smoothstep(horizon-.035,horizon+.01,p.y);
 float rock=fbm(vec2(p.x*8.,p.y*13.));
 color=mix(color,vec3(.005,.014,.022)+rock*vec3(.013,.023,.026),ground*floorFade*.87);
 float vent=exp(-abs(p.x-.44)*32.)*exp(-max(0.,p.y+.36)*7.)*smoothstep(-.36,-.25,p.y)*floorFade;
 color+=vec3(.034,.081,.088)*vent*fbm(p*14.+vec2(0.,-t*.09));
 float vignette=1.-.49*smoothstep(.24,1.02,length(p*vec2(.62,1.0)));
 color*=vignette;
 color+=vec3((hash(gl_FragCoord.xy)-.5)*.006);
 gl_FragColor=vec4(clamp(color,0.,1.),1.);
}
`;
function setButtons(){pauseButton.textContent=paused?'Play water':'Pause water';pauseButton.setAttribute('aria-pressed',String(paused));qualityButton.textContent=low?'High detail':'Low detail';qualityButton.setAttribute('aria-pressed',String(low));pauseButton.disabled=media.matches||ocean.dataset.renderer!=='webgl';qualityButton.disabled=ocean.dataset.renderer!=='webgl';}
function init(){
 try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)throw Error('WebGL unavailable');const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);uniforms=Object.fromEntries(['uResolution','uDepth','uTime','uQuality'].map(k=>[k,gl.getUniformLocation(program,k)]));delete ocean.dataset.renderError;ocean.dataset.renderer='webgl';canvas.hidden=false;fallback.hidden=true;setButtons();dirty=true;requestDraw();}
 catch(e){ocean.dataset.renderError=String(e.message||e);ocean.dataset.renderer='static';canvas.hidden=true;fallback.hidden=false;setButtons();}
}
function requestDraw(){if(disposed||document.hidden||frame||ocean.dataset.renderer!=='webgl')return;frame=requestAnimationFrame(draw);}
function draw(now){frame=0;if(!gl||gl.isContextLost()||document.hidden)return;if(!paused&&!media.matches&&last)waterTime+=Math.min((now-last)/1000,.05);last=now;
 // Deliberate 30fps ceiling for a full-screen effect; static mode renders on demand.
 if(!dirty&&!paused&&!media.matches&&now-(draw.lastDraw||0)<32){requestDraw();return}
 const ratio=low ? .72 :Math.min(devicePixelRatio||1,1.2,1440/Math.max(innerWidth,innerHeight));const w=Math.max(1,Math.round(innerWidth*ratio)),h=Math.max(1,Math.round(innerHeight*ratio));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 gl.viewport(0,0,w,h);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const loc=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.uniform2f(uniforms.uResolution,w,h);gl.uniform1f(uniforms.uDepth,progress);gl.uniform1f(uniforms.uTime,waterTime);gl.uniform1f(uniforms.uQuality,low?0:2);gl.drawArrays(gl.TRIANGLES,0,3);
 ocean.dataset.renderedZone=zone;ocean.dataset.renderedQuality=low?'low':'high';ocean.dataset.renderedDepth=String(Math.round(depth));ocean.dataset.renderedPaused=String(paused);ocean.dataset.frameTime=waterTime.toFixed(3);draw.lastDraw=now;dirty=false;
 if(!paused&&!media.matches)requestDraw();
}
function syncScroll(){
 scrollPending=false;const y=window.scrollY,offsets=chapters.map(el=>el.getBoundingClientRect().top+y),lastIndex=chapters.length-1;
 let i=0;while(i<lastIndex&&y>=offsets[i+1]-3)i++;
 const next=Math.min(i+1,lastIndex),span=Math.max(1,offsets[next]-offsets[i]),t=next===i?0:clamp((y-offsets[i])/span,0,1);
 depth=mix(Number(chapters[i].dataset.depth),Number(chapters[next].dataset.depth),t);
 // Three equally spaced optical keyframes, independently mapped to illustrative depth.
 progress=(i+t)/lastIndex;zone=chapters[i].dataset.zone;ocean.dataset.zone=zone;ocean.dataset.depth=String(Math.round(depth));readout.value=String(Math.round(depth)).padStart(4,'0')+' m';
 for(const link of links){if(link.dataset.jump===zone)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
 dirty=true;requestDraw();
}
window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(syncScroll)}},{passive:true});
window.addEventListener('resize',()=>{syncScroll();dirty=true;requestDraw()},{passive:true});
pauseButton.addEventListener('click',()=>{manualMotion=true;paused=!paused;last=0;setButtons();dirty=true;requestDraw()});
qualityButton.addEventListener('click',()=>{low=!low;setButtons();dirty=true;requestDraw()});
media.addEventListener?.('change',()=>{if(media.matches)paused=true;else if(!manualMotion)paused=false;last=0;setButtons();dirty=true;requestDraw()});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;ocean.dataset.renderer='static';canvas.hidden=true;fallback.hidden=false;setButtons();});
canvas.addEventListener('webglcontextrestored',()=>{last=0;init();syncScroll();});
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0}else{dirty=true;requestDraw()}});
window.addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(frame);if(gl&&!gl.isContextLost()){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program)}});
syncScroll();init();
})();
