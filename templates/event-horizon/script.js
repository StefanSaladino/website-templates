(()=>{'use strict';
const stage=document.querySelector('#environment'),canvas=document.querySelector('#space-canvas'),fallback=document.querySelector('.fallback'),chapters=[...document.querySelectorAll('.chapter')],links=[...document.querySelectorAll('[data-jump]')],gravity=document.querySelector('#gravity'),gravityValue=document.querySelector('#gravity-value'),motion=document.querySelector('#motion'),quality=document.querySelector('#quality'),media=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
let gl,program,buffer,uniforms={},frame=0,scrollFrame=0,disposed=false,dirty=true,paused=media.matches,manualMotion=false,low=innerWidth<700,zone='approach',progress=0,mass=1,time=0,last=0;
const vertex=`precision mediump float;attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}`;
const fragment=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uResolution;
uniform float uProgress,uTime,uMass,uQuality;
const float PI=3.14159265;
float hash(vec2 p){p=fract(p*vec2(.1031,.11369));p+=dot(p,p.yx+19.19);return fract(p.x*p.y*17.17);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(1.6,-1.2,1.2,1.6)*p+5.2;a*=.5;}return v;}
float gauss(float x,float width){float q=x/max(width,.001);return exp(-q*q);}
vec3 stars(vec2 p,float density,float seed){
 vec2 q=p*density,cell=floor(q),uv=fract(q);float h=hash(cell+seed);
 vec2 off=vec2(hash(cell+seed+4.),hash(cell+seed+7.))*.68+.16;
 float d=length(uv-off),b=pow(max(0.,1.-d/.11),2.)*step(.965,h);
 float bright=pow(hash(cell+seed+9.),3.);
 vec3 tint=mix(vec3(.65,.76,1.),vec3(1.,.82,.60),hash(cell+seed+12.));
 return tint*b*(.16+.84*bright);
}
vec3 diskColor(float radius,float angle,float time,float extra){
 // Stratified, slowly advected turbulence on an illustrative hot disk.
 float a=angle+time*.17/(.7+radius*radius);
 vec2 swirl=vec2(cos(a),sin(a));
 float grain=fbm(swirl*(5.+radius*2.)+vec2(radius*14.,radius*5.));
 float filament=.5+.5*sin(radius*31.+grain*7.+sin(a*4.)*1.5);
 float filament2=.5+.5*sin(radius*63.+grain*9.);
 float radial=exp(-max(radius-1.12,0.)*1.55);
 float edge=smoothstep(1.03,1.19,radius)*(1.-smoothstep(2.9,3.6,radius));
 float brightness=radial*edge*(.30+.68*grain+.30*pow(filament,2.)+.13*filament2);
 // Stylized approaching-side brightness asymmetry, not a computed spectrum.
 float doppler=.55+.85*pow(.5+.5*cos(angle-.20),2.);
 vec3 hot=mix(vec3(.63,.12,.022),vec3(1.,.73,.39),clamp(radial*1.16,0.,1.));
 hot=mix(hot,vec3(1.,.95,.77),pow(radial,5.)*.72);
 return hot*brightness*doppler*extra;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*uResolution)/uResolution.y;
 float aspect=uResolution.x/uResolution.y,mobile=step(aspect,.93);
 vec2 center=mix(vec2(.15*aspect,.035),vec2(0.,.14),mobile);
 vec2 p=uv-center;
 float approach=smoothstep(0.,.82,uProgress);
 float R=mix(.133,.30,approach)*sqrt(clamp(uMass,.5,1.5));
 R*=mix(1.,min(1.,aspect/.83),mobile);
 float boundary=smoothstep(.77,1.,uProgress);
 R*=1.+boundary*.82;
 vec2 q=p/max(R,.012);float r=length(q),phi=atan(q.y,q.x);
 // Analytic radial lens deflection with finite central denominator.
 // The shadow is occluded separately; no singular ray integration.
 float deflect=(.56*uMass)/(r*r+.32);
 vec2 bent=p*(1.-deflect);
 vec2 sky=bent+vec2(.17,-.19);
 float haze=fbm(sky*7.5)*fbm(sky*2.3+7.);
 vec3 col=vec3(.006,.007,.011)+haze*vec3(.020,.020,.030);
 col+=stars(sky,115.,3.)+stars(sky,211.,13.)*.55;
 if(uQuality>0.5)col+=stars(sky,67.,29.)*.72;
 float lensGlow=gauss(r-1.13,.16)*.055+gauss(r-1.06,.045)*.13;
 col+=vec3(.96,.30,.07)*lensGlow;
 // Lensed far side: narrow near-circular photon arc plus broad asymmetric
 // secondary image. This is an artistic analytic image, not a GR solution.
 float arcRadius=1.16+.10*pow(abs(sin(phi)),1.4);
 float arcWidth=.055+.075*abs(sin(phi));
 float top=.35+.65*smoothstep(-.75,.15,q.y);
 float tex=fbm(vec2(cos(phi),sin(phi))*9.+vec2(r*17.,uTime*.07));
 float arc=gauss(r-arcRadius,arcWidth)*(.35+.65*tex)*top;
 float outer=gauss(r-(1.34+.13*sin(phi)),.18)*(.20+.60*tex)*top;
 float thin=gauss(r-1.046,.018)*(.65+.35*cos(phi-.25));
 col+=vec3(1.0,.36,.085)*(arc*1.15+outer*.48);
 col+=vec3(1.,.83,.57)*thin*.85;
 // Projected disk with narrow vertical extent and radial filament structure.
 float tilt=-.13+.045*sin(uProgress*3.);
 mat2 rot=mat2(cos(tilt),sin(tilt),-sin(tilt),cos(tilt));
 vec2 d=rot*q;
 vec2 disk=vec2(d.x,d.y/.25);
 float dr=length(disk),da=atan(disk.y,disk.x);
 vec3 emission=diskColor(dr,da,uTime,1.65);
 float diskGlow=gauss(d.y,.18)*smoothstep(.85,1.35,abs(d.x))*(1.-smoothstep(2.7,4.2,abs(d.x)));
 // Occlude the background and far half of the disk; foreground may pass
 // across the shadow at the bottom, as an inclined disk would.
 float shadow=smoothstep(.99,1.025,r);
 col*=shadow;
 float foreground=1.-smoothstep(-.035,.025,d.y);
 float visibleDisk=mix(shadow,1.,foreground);
 col+=(emission+vec3(.46,.095,.018)*diskGlow*.25)*visibleDisk;
 // Extended soft atmospheric light and nonuniform exposure.
 col+=vec3(.17,.035,.007)*gauss(r-1.6,.72)*.16*shadow;
 col*=1.-.94*boundary;
 col*=1.-.40*smoothstep(.25,1.1,length(uv*vec2(.72,1.)));
 col=1.-exp(-max(col,vec3(0.))*1.65);
 col=pow(clamp(col,0.,1.),vec3(.86));
 gl_FragColor=vec4(col,1.);
}
`;
function compile(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(sh);gl.deleteShader(sh);throw Error(e)}return sh}
function controls(){motion.textContent=paused?'Play':'Pause';motion.setAttribute('aria-pressed',String(paused));quality.textContent=low?'High detail':'Low detail';quality.setAttribute('aria-pressed',String(low));motion.disabled=media.matches||stage.dataset.renderer!=='webgl';quality.disabled=stage.dataset.renderer!=='webgl';gravity.disabled=stage.dataset.renderer!=='webgl'}
function staticMode(error){if(error)stage.dataset.renderError=String(error.message||error);stage.dataset.renderer='static';canvas.hidden=true;fallback.hidden=false;controls()}
function init(){try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)throw Error('WebGL unavailable');const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);uniforms=Object.fromEntries(['uResolution','uProgress','uTime','uMass','uQuality'].map(k=>[k,gl.getUniformLocation(program,k)]));delete stage.dataset.renderError;stage.dataset.renderer='webgl';canvas.hidden=false;fallback.hidden=true;controls();dirty=true;queue()}catch(e){staticMode(e)}}
function queue(){if(!frame&&!disposed&&!document.hidden&&stage.dataset.renderer==='webgl')frame=requestAnimationFrame(draw)}
function draw(now){frame=0;if(!gl||gl.isContextLost()||document.hidden)return;if(!paused&&!media.matches&&last)time+=Math.min(.05,(now-last)/1000);last=now;if(!dirty&&!paused&&now-(draw.last||0)<40){queue();return}
 const w=innerWidth,h=innerHeight,ratio=Math.min(low?.65:1.15,devicePixelRatio||1,(low?820:1380)/Math.max(w,h));const cw=Math.max(1,Math.round(w*ratio)),ch=Math.max(1,Math.round(h*ratio));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
 gl.viewport(0,0,cw,ch);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const loc=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.uniform2f(uniforms.uResolution,cw,ch);gl.uniform1f(uniforms.uProgress,progress);gl.uniform1f(uniforms.uTime,time);gl.uniform1f(uniforms.uMass,mass);gl.uniform1f(uniforms.uQuality,low?0:1);gl.drawArrays(gl.TRIANGLES,0,3);
 stage.dataset.renderedZone=zone;stage.dataset.renderedProgress=progress.toFixed(3);stage.dataset.renderedMass=String(Math.round(mass*100));stage.dataset.renderedQuality=low?'low':'high';stage.dataset.renderedPaused=String(paused);stage.dataset.frameTime=time.toFixed(3);dirty=false;draw.last=now;if(!paused&&!media.matches)queue()
}
function sync(){scrollFrame=0;const y=scrollY,offsets=chapters.map(el=>el.getBoundingClientRect().top+y),end=chapters.length-1;let i=0;while(i<end&&y>=offsets[i+1]-2)i++;const next=Math.min(i+1,end),t=next===i?0:clamp((y-offsets[i])/Math.max(1,offsets[next]-offsets[i]));progress=mix(Number(chapters[i].dataset.distance),Number(chapters[next].dataset.distance),t);zone=chapters[i].dataset.zone;stage.dataset.zone=zone;stage.dataset.progress=progress.toFixed(3);document.querySelector('#progress').value=Math.round(progress*100)+'%';document.querySelector('#progress-fill').style.setProperty('--progress',progress*100+'%');links.forEach(link=>{if(link.dataset.jump===zone)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});dirty=true;queue()}
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(sync)},{passive:true});window.addEventListener('resize',sync,{passive:true});gravity.addEventListener('input',()=>{mass=Number(gravity.value)/100;gravityValue.value=gravity.value+'%';gravity.setAttribute('aria-valuetext',gravity.value+' percent');dirty=true;queue()});motion.addEventListener('click',()=>{manualMotion=true;paused=!paused;last=0;controls();dirty=true;queue()});quality.addEventListener('click',()=>{low=!low;controls();dirty=true;queue()});
media.addEventListener?.('change',()=>{if(media.matches)paused=true;else if(!manualMotion)paused=false;last=0;controls();dirty=true;queue()});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;staticMode()});canvas.addEventListener('webglcontextrestored',()=>{last=0;init();sync()});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0}else{dirty=true;sync();queue()}});window.addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;cancelAnimationFrame(frame);if(gl&&!gl.isContextLost()){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program)}});sync();init();
})();