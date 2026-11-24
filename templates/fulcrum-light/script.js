(() => {
  'use strict';
  const stage = document.querySelector('.stage');
  const canvas = document.querySelector('#lamp-canvas');
  const fallback = document.querySelector('.fallback');
  const controls = document.querySelector('#model-controls');
  const rotation = document.querySelector('#rotation');
  const brightness = document.querySelector('#brightness');
  const status = document.querySelector('#model-status');
  const mode = document.querySelector('#view-mode');
  const finishes = {ochre: [0.65,0.34,0.20], chalk:[0.87,0.84,0.78], graphite:[0.24,0.26,0.24]};
  const fallbackColors = {ochre:'#a55d3b',chalk:'#e3ded2',graphite:'#393d39'};
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let finish = 'ochre', angle = -25, lightLevel = 60, userRotated = false, frame = 0, visible = true;
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
      const adjacent=k=>normalize([profile[k+1][1]-profile[k][1],profile[k][0]-profile[k+1][0]]);
      const smooth=k=>{if(k<0||k>=profile.length-1)return n;const q=adjacent(k);return n[0]*q[0]+n[1]*q[1]>.73?normalize([n[0]+q[0],n[1]+q[1]]):n;};
      const lo=smooth(j-1),hi=smooth(j+1);
      for(let i=0;i<segments;i++){
        const t0=i*TAU/segments,t1=(i+1)*TAU/segments;
        const a=vertex(r0,y0,t0,lo),b=vertex(r1,y1,t0,hi),c=vertex(r1,y1,t1,hi),d=vertex(r0,y0,t1,lo);
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
  function mesh(data, material){
    const buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    meshes.push({buffer,count:data.length/6,material});
  }
  function useFallback(){
    stage.dataset.renderer='static';canvas.hidden=true;fallback.hidden=false;
    mode.textContent='Static illustration';rotation.disabled=true;
  }
  function init(){
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
      if(!gl)throw Error('WebGL unavailable');
      const vs=compile(gl.VERTEX_SHADER,`
        attribute vec3 aPosition;attribute vec3 aNormal;
        uniform float uAngle;uniform float uAspect;
        varying vec3 vNormal;varying vec3 vPosition;varying vec3 vLocal;
        vec3 yaw(vec3 p,float t){return vec3(cos(t)*p.x+sin(t)*p.z,p.y,-sin(t)*p.x+cos(t)*p.z);}
        vec3 tilt(vec3 p){return vec3(p.x,.960*p.y-.280*p.z,.280*p.y+.960*p.z);}
        void main(){
          vec3 p=tilt(yaw(aPosition,uAngle));
          vPosition=p;vLocal=aPosition;vNormal=tilt(yaw(aNormal,uAngle));
          float depth=6.6-p.z;
          float scale=min(3.12,3.25*uAspect);
          gl_Position=vec4(p.x*scale/uAspect,(p.y+.13)*scale,depth*1.018-.22,depth);
        }`);
      const fs=compile(gl.FRAGMENT_SHADER,`
        precision mediump float;
        uniform vec3 uColor;uniform float uGloss;uniform float uShadow;uniform float uLight;uniform float uEmitter;
        varying vec3 vNormal;varying vec3 vPosition;varying vec3 vLocal;
        void main(){
          if(uShadow>1.5){
            vec2 q=(vLocal.xz-vec2(.64,0.))/vec2(1.6,1.45);
            float d=length(q);
            float a=.57*uLight*exp(-2.6*d*d)*(1.-smoothstep(.65,1.,d));
            gl_FragColor=vec4(1.,.76,.43,a);return;
          }
          if(uShadow>.5){
            vec2 q=(vLocal.xz-vec2(-.58,0.))/vec2(1.28,1.03);
            float d=length(q);
            float a=.38*exp(-3.5*d*d)*(1.-smoothstep(.72,1.,d));
            gl_FragColor=vec4(.04,.05,.04,a);return;
          }
          vec3 n=normalize(vNormal),l=normalize(vec3(-.85,1.35,1.55)),r=normalize(vec3(1.1,.40,-.65));
          vec3 eye=normalize(vec3(0.,0.,6.6)-vPosition);
          float diff=max(dot(n,l),0.), rim=max(dot(n,r),0.);
          float spec=pow(max(dot(n,normalize(l+eye)),0.),mix(15.,56.,uGloss))*(.10+.25*uGloss);
          float edge=pow(1.-max(dot(n,eye),0.),3.);
          vec3 color=uColor*(.55+.68*diff+.24*rim)+vec3(spec+.06*edge);
          if(uEmitter>.5)color=mix(vec3(.45,.44,.40),vec3(1.,.92,.72),uLight);
          gl_FragColor=vec4(clamp(color,0.,1.),1.);
        }`);
      program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      uniforms=Object.fromEntries(['uAngle','uAspect','uColor','uGloss','uShadow','uLight','uEmitter'].map(k=>[k,gl.getUniformLocation(program,k)]));
      // Permanently assembled geometry. Brightness alters illumination, never transforms.
      const baseX=-.58, headX=.64;
      const shadowVerts=[[-2.0,-1.486,-1.12],[.84,-1.486,-1.12],[.84,-1.486,1.12],[-2.0,-1.486,-1.12],[.84,-1.486,1.12],[-2.0,-1.486,1.12]].flatMap(v=>[...v,0,1,0]);
      const poolVerts=[[-.96,-1.49,-1.45],[2.24,-1.49,-1.45],[2.24,-1.49,1.45],[-.96,-1.49,-1.45],[2.24,-1.49,1.45],[-.96,-1.49,1.45]].flatMap(v=>[...v,0,1,0]);
      mesh(poolVerts,'pool');
      mesh(shadowVerts,'shadow');
      mesh(lathe([[0,-1.48],[.79,-1.48],[.85,-1.46],[.87,-1.42],[.87,-1.35],[.85,-1.32],[.81,-1.30],[0,-1.30]],[baseX,0,0],96),'paint');
      mesh(lathe([[0,-1.486],[.77,-1.486],[.79,-1.48],[0,-1.48]],[baseX,0,0],96),'dark');
      mesh(lathe([[0,-1.30],[.13,-1.30],[.14,-1.28],[.12,-1.24],[0,-1.24]],[baseX,0,0],64),'metal');
      mesh(rod([baseX,-1.26,0],[baseX,.92,0],.057),'metal');
      mesh(sphere([baseX,.92,0],.062),'metal');
      mesh(rod([baseX,.92,0],[headX,.92,0],.054),'metal');
      mesh(rod([headX,.92,0],[headX,.74,0],.061),'metal');
      mesh(lathe([[0,.66],[.095,.66],[.105,.68],[.105,.77],[.08,.80],[0,.80]],[headX,0,0],56),'dark');
      // Rolled rim, shallow curved shell and continuous inner surface.
      mesh(lathe([[.77,.39],[.795,.405],[.80,.425],[.77,.48],[.69,.57],[.55,.665],[.39,.727],[.22,.765],[.12,.77],[.10,.75],[.20,.745],[.38,.706],[.54,.64],[.67,.548],[.75,.46],[.77,.425],[.755,.411],[.77,.39]],[headX,0,0],96),'paint');
      mesh(lathe([[0,.405],[.68,.405],[.73,.412],[.74,.425],[.72,.445],[0,.445]],[headX,0,0],96),'diffuser');
      mesh(lathe([[.70,.41],[.74,.41],[.75,.42],[.74,.44],[.70,.44],[.70,.41]],[headX,0,0],96),'dark');
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
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.6,1100/Math.max(rect.width,rect.height,1));
    const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    gl.uniform1f(uniforms.uAngle,angle*Math.PI/180);gl.uniform1f(uniforms.uAspect,w/h);
    const p=gl.getAttribLocation(program,'aPosition'),n=gl.getAttribLocation(program,'aNormal');
    gl.enableVertexAttribArray(p);gl.enableVertexAttribArray(n);
    const materials={paint:finishes[finish],metal:[.34,.36,.34],dark:[.18,.19,.17],diffuser:[.91,.88,.79],shadow:[0,0,0],pool:[1,.76,.43]};
    gl.uniform1f(uniforms.uLight,lightLevel/100);
    for(const item of meshes){
      gl.bindBuffer(gl.ARRAY_BUFFER,item.buffer);
      gl.vertexAttribPointer(p,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(n,3,gl.FLOAT,false,24,12);
      const isShadow=item.material==='shadow'||item.material==='pool';
      gl.uniform1f(uniforms.uShadow,item.material==='pool'?2:isShadow?1:0);
      gl.uniform1f(uniforms.uEmitter,item.material==='diffuser'?1:0);
      gl.uniform3fv(uniforms.uColor,materials[item.material]);gl.uniform1f(uniforms.uGloss,item.material==='metal'?.72:.38);
      if(isShadow){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}
      gl.drawArrays(gl.TRIANGLES,0,item.count);
      if(isShadow){gl.depthMask(true);gl.disable(gl.BLEND);}

    }
    stage.dataset.renderedAngle=String(Math.round(angle));stage.dataset.renderedFinish=finish;stage.dataset.renderedBrightness=String(lightLevel);
  }
  function update(announce=true){
    stage.style.setProperty('--fallback-paint',fallbackColors[finish]);
    stage.style.setProperty('--light-level',String(lightLevel/100));
    const t=lightLevel/100;stage.style.setProperty('--diffuser-color','rgb('+[115+140*t,112+123*t,102+82*t].map(Math.round).join(',')+')');
    stage.dataset.finish=finish;stage.dataset.brightness=String(lightLevel);
    rotation.value=String(Math.round(angle));brightness.value=String(lightLevel);
    document.querySelector('#rotation-value').value=Math.round(angle)+'°';document.querySelector('#brightness-value').value=lightLevel+'%';
    brightness.setAttribute('aria-valuetext',lightLevel===0?'Off':lightLevel+' percent brightness');
    for(const b of controls.querySelectorAll('button[data-finish]'))b.setAttribute('aria-pressed',String(b.dataset.finish===finish));
    if(announce)status.textContent=finish[0].toUpperCase()+finish.slice(1)+' finish, '+brightness.getAttribute('aria-valuetext').toLowerCase()+'.';
    requestDraw();
  }
  controls.disabled=false;init();update(false);
  for(const b of controls.querySelectorAll('button[data-finish]'))b.addEventListener('click',()=>{finish=b.dataset.finish;update();});
  rotation.addEventListener('input',()=>{userRotated=true;angle=Number(rotation.value);update(false);});
  brightness.addEventListener('input',()=>{lightLevel=Number(brightness.value);userRotated=true;update();});
  document.querySelector('#reset').addEventListener('click',()=>{finish='ochre';angle=-25;lightLevel=60;userRotated=true;update();});
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
