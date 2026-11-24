(() => {
  'use strict';
  const stage = document.querySelector('.stage');
  const canvas = document.querySelector('#lamp-canvas');
  const fallback = document.querySelector('.fallback');
  const controls = document.querySelector('#model-controls');
  const rotation = document.querySelector('#rotation');
  const assembly = document.querySelector('#assembly');
  const status = document.querySelector('#model-status');
  const mode = document.querySelector('#view-mode');
  const finishes = {ochre: [0.72,0.36,0.14], chalk:[0.88,0.85,0.77], graphite:[0.23,0.25,0.22]};
  const fallbackColors = {ochre:'#b96530',chalk:'#e1d8c4',graphite:'#41443e'};
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let finish = 'ochre', angle = -25, exploded = 0, userRotated = false, frame = 0, visible = true;
  let gl, program, meshes = [], uniforms, dragging = null, observer, resizeObserver;
  const TAU = 2 * Math.PI;
  const clamp = (v, min, max) => Math.min(max, Math.max(min,v));
  const normalize = v => { const len = Math.hypot(...v)||1; return v.map(x=>x/len); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  // Closed, beveled rotational meshes. Positions and normals are generated in
  // this file from original profiles; no external model or texture is loaded.
  function lathe(profile, offset=[0,0,0], segments=56) {
    const out=[];
    const vertex=(r,y,t,n)=>[offset[0]+r*Math.cos(t),offset[1]+y,offset[2]+r*Math.sin(t),n[0]*Math.cos(t),n[1],n[0]*Math.sin(t)];
    for(let j=0;j<profile.length-1;j++){
      const [r0,y0]=profile[j], [r1,y1]=profile[j+1];
      const n=normalize([y1-y0,r0-r1]);
      for(let i=0;i<segments;i++){
        const t0=i*TAU/segments,t1=(i+1)*TAU/segments;
        const a=vertex(r0,y0,t0,n),b=vertex(r1,y1,t0,n),c=vertex(r1,y1,t1,n),d=vertex(r0,y0,t1,n);
        out.push(...a,...b,...c,...a,...c,...d);
      }
    }
    return out;
  }
  function rod(a,b,r) {
    const d=b.map((v,i)=>v-a[i]), len=Math.hypot(...d), y=normalize(d);
    const x=normalize(cross(Math.abs(y[1])>.95?[1,0,0]:[0,1,0],y)),z=cross(y,x);
    const src=lathe([[0,0],[r*.88,0],[r,.025],[r,len-.025],[r*.88,len],[0,len]],[0,0,0],32);
    const out=[];
    for(let i=0;i<src.length;i+=6){
      const v=src.slice(i,i+3),n=src.slice(i+3,i+6);
      for(let j=0;j<3;j++)out.push(a[j]+x[j]*v[0]+y[j]*v[1]+z[j]*v[2]);
      for(let j=0;j<3;j++)out.push(x[j]*n[0]+y[j]*n[1]+z[j]*n[2]);
    }
    return out;
  }
  function sphere(center,r) {
    const profile=Array.from({length:21},(_,i)=>[r*Math.sin(i*Math.PI/20),-r*Math.cos(i*Math.PI/20)]);
    return lathe(profile,center,40);
  }
  function compile(kind,source){
    const shader=gl.createShader(kind);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const reason=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(reason);}
    return shader;
  }
  function mesh(data, material, shift){
    const buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    meshes.push({buffer,count:data.length/6,material,shift});
  }
  function useFallback(){
    stage.dataset.renderer='static';canvas.hidden=true;fallback.hidden=false;
    mode.textContent='Static product illustration';rotation.disabled=true;
  }
  function init(){
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
      if(!gl)throw Error('WebGL unavailable');
      const vs=compile(gl.VERTEX_SHADER,`
        attribute vec3 aPosition;attribute vec3 aNormal;
        uniform float uAngle;uniform float uAspect;uniform float uShift;
        varying vec3 vNormal;varying vec3 vPosition;
        vec3 yaw(vec3 p,float t){return vec3(cos(t)*p.x+sin(t)*p.z,p.y,-sin(t)*p.x+cos(t)*p.z);}
        vec3 tilt(vec3 p){return vec3(p.x,.976*p.y+.218*p.z,-.218*p.y+.976*p.z);}
        void main(){
          vec3 p=tilt(yaw(aPosition+vec3(0.,uShift,0.),uAngle));
          vPosition=p;vNormal=tilt(yaw(aNormal,uAngle));
          float depth=6.6-p.z;
          gl_Position=vec4(p.x*2.5/uAspect,p.y*2.5,depth*1.018-.22,depth);
        }`);
      const fs=compile(gl.FRAGMENT_SHADER,`
        precision mediump float;
        uniform vec3 uColor;uniform float uGloss;
        varying vec3 vNormal;varying vec3 vPosition;
        void main(){
          vec3 n=normalize(vNormal),l=normalize(vec3(-.8,1.1,1.4)),r=normalize(vec3(.8,.15,-.5));
          vec3 eye=normalize(vec3(0.,0.,6.6)-vPosition);
          float diff=max(dot(n,l),0.), rim=max(dot(n,r),0.);
          float spec=pow(max(dot(n,normalize(l+eye)),0.),mix(9.,40.,uGloss))*(.12+.24*uGloss);
          vec3 color=uColor*(.37+.61*diff+.16*rim)+vec3(spec);
          gl_FragColor=vec4(clamp(color,0.,1.),1.);
        }`);
      program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      uniforms=Object.fromEntries(['uAngle','uAspect','uShift','uColor','uGloss'].map(k=>[k,gl.getUniformLocation(program,k)]));
      const baseX=-.53, headX=.62;
      mesh(lathe([[0,-1.46],[.75,-1.46],[.84,-1.40],[.84,-1.25],[.76,-1.20],[0,-1.20]],[baseX,0,0]),'paint',-.13);
      mesh(lathe([[0,-1.48],[.71,-1.48],[.75,-1.46],[0,-1.46]],[baseX,0,0]),'dark',-.13);
      mesh(rod([baseX,-1.20,0],[baseX,1.02,0],.085),'metal',.02);
      mesh(rod([baseX,1.02,0],[headX,1.02,0],.069),'metal',.02);
      mesh(sphere([baseX,1.02,0],.13),'dark',.02);
      mesh(rod([headX,1.02,0],[headX,.80,0],.085),'metal',.02);
      mesh(lathe([[.76,.16],[.78,.18],[.40,.77],[.34,.80],[.17,.81],[.17,.76],[.32,.73],[.70,.19],[.76,.16]],[headX,0,0]),'paint',.36);
      mesh(lathe([[.70,.19],[.31,.70],[.13,.72]],[headX,0,0]),'inside',.36);
      mesh(sphere([headX,.40,0],.145),'bulb',.22);
      gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
      stage.dataset.renderer='webgl';canvas.hidden=false;fallback.hidden=true;rotation.disabled=false;
      mode.textContent='Interactive 3D · drag to rotate';
      requestDraw();
    }catch{useFallback();}
  }
  function requestDraw(){
    if(!gl||stage.dataset.renderer!=='webgl'||!visible||document.hidden||frame)return;
    frame=requestAnimationFrame(()=>{frame=0;draw();});
  }
  function draw(){
    if(!gl||gl.isContextLost()||stage.dataset.renderer!=='webgl')return;
    const rect=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.6,1100/Math.max(rect.width,rect.height,1));
    const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    gl.uniform1f(uniforms.uAngle,angle*Math.PI/180);gl.uniform1f(uniforms.uAspect,w/h);
    const p=gl.getAttribLocation(program,'aPosition'),n=gl.getAttribLocation(program,'aNormal');
    gl.enableVertexAttribArray(p);gl.enableVertexAttribArray(n);
    const materials={paint:finishes[finish],metal:[.49,.46,.39],dark:[.19,.18,.15],inside:[.84,.78,.59],bulb:[.97,.91,.72]};
    for(const item of meshes){
      gl.bindBuffer(gl.ARRAY_BUFFER,item.buffer);
      gl.vertexAttribPointer(p,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(n,3,gl.FLOAT,false,24,12);
      gl.uniform3fv(uniforms.uColor,materials[item.material]);gl.uniform1f(uniforms.uGloss,item.material==='metal'?.8:.25);
      gl.uniform1f(uniforms.uShift,item.shift*exploded/100);gl.drawArrays(gl.TRIANGLES,0,item.count);
    }
    stage.dataset.renderedAngle=String(Math.round(angle));stage.dataset.renderedFinish=finish;stage.dataset.renderedAssembly=String(exploded);
  }
  function update(announce=true){
    stage.style.setProperty('--fallback-paint',fallbackColors[finish]);
    stage.style.setProperty('--head-shift',(-exploded*.55)+'px');
    stage.style.setProperty('--post-shift',(-exploded*.10)+'px');
    stage.style.setProperty('--base-shift',(exploded*.18)+'px');
    stage.dataset.finish=finish;stage.dataset.assembly=String(exploded);
    rotation.value=String(Math.round(angle));assembly.value=String(exploded);
    assembly.setAttribute('aria-valuetext',exploded===0?'Assembled':exploded===100?'Fully separated':exploded+' percent separated');
    for(const b of document.querySelectorAll('[data-finish]'))b.setAttribute('aria-pressed',String(b.dataset.finish===finish));
    if(announce)status.textContent=finish[0].toUpperCase()+finish.slice(1)+' finish, '+assembly.getAttribute('aria-valuetext').toLowerCase()+'.';
    requestDraw();
  }
  controls.disabled=false;init();update(false);
  for(const b of document.querySelectorAll('[data-finish]'))b.addEventListener('click',()=>{finish=b.dataset.finish;update();});
  rotation.addEventListener('input',()=>{userRotated=true;angle=Number(rotation.value);update(false);});
  assembly.addEventListener('input',()=>{exploded=Number(assembly.value);update();});
  document.querySelector('#reset').addEventListener('click',()=>{finish='ochre';angle=-25;exploded=0;userRotated=true;update();});
  document.querySelector('#explore-assembly').addEventListener('click',()=>{exploded=100;userRotated=true;update();});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0||stage.dataset.renderer!=='webgl')return;dragging={id:e.pointerId,x:e.clientX,angle};userRotated=true;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!dragging||dragging.id!==e.pointerId)return;angle=clamp(dragging.angle+(e.clientX-dragging.x)*.65,-180,180);update(false);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{dragging=null;});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;useFallback();});
  canvas.addEventListener('webglcontextrestored',()=>{meshes=[];init();update(false);});
  if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();},{threshold:0});observer.observe(stage);}
  if('ResizeObserver'in window){resizeObserver=new ResizeObserver(requestDraw);resizeObserver.observe(stage);}
  else window.addEventListener('resize',requestDraw,{passive:true});
  // Native scrolling gently rotates the actual model once; no pinning or hijack.
  window.addEventListener('scroll',()=>{if(!visible||motion.matches||userRotated||stage.dataset.renderer!=='webgl')return;const top=document.querySelector('.hero').getBoundingClientRect().top;angle=clamp(-25+Math.max(0,-top)*.11,-25,40);update(false);},{passive:true});
  motion.addEventListener?.('change',()=>{if(motion.matches&&!userRotated){angle=-25;update(false);}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestDraw();});
  window.addEventListener('pagehide',e=>{if(e.persisted)return;cancelAnimationFrame(frame);observer?.disconnect();resizeObserver?.disconnect();if(gl&&!gl.isContextLost()){for(const m of meshes)gl.deleteBuffer(m.buffer);if(program)gl.deleteProgram(program);}});
})();
