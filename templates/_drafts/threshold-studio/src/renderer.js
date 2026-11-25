import {openingPose,multiply} from './camera.js?v=T12';
import {buildStudy} from './geometry.js?v=T12';
import {bufferSize} from './lifecycle.js?v=T12';
import {createReflection,FLOOR_MIRROR} from './reflection.js?v=T12';
import {LIGHTING_GLSL} from './lighting.js?v=T12';
const VS=`#version 300 es
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aColor;
uniform mat4 uVP;
out vec3 color;
out vec3 world;
void main(){gl_Position=uVP*vec4(aPosition,1.0);color=aColor;world=aPosition;}`;
const FS=`#version 300 es
precision highp float;
in vec3 color;
in vec3 world;
uniform vec3 uViewEye;
uniform float uLighting;
uniform float uAmbientPhase;
out vec4 outColor;
${LIGHTING_GLSL}
void main(){
  if(uLighting<.5){outColor=vec4(color,1.0);return;}
  // Face normal recovered from the original world position; facing is corrected
  // using the actual or mirrored eye, never the mirrored material coordinates.
  vec3 n=normalize(cross(dFdx(world),dFdy(world)));
  if(dot(n,uViewEye-world)<0.0)n=-n;
  vec3 key=normalize(vec3(-4.0,8.5,9.0)-world);
  float diffuse=.35+.65*max(dot(n,key),0.0);
  float isRed=step(.30,color.r)*step(color.g*1.7,color.r)*step(color.b*1.9,color.r);
  float isIvory=step(.40,color.g)*(1.0-isRed);
  float intensity=ambientIntensity(world,uAmbientPhase);
  float spill=apertureSpill(world)*intensity;
  vec3 source=vec3(clamp(world.x,-2.25,2.25),clamp(world.y,.5,5.8),-.65);
  vec3 lightRay=source-world;
  float incidence=.28+.72*max(dot(n,lightRay/max(length(lightRay),.001)),0.0);
  // Obsidian remains near black; modest directional key makes the mass legible.
  vec3 view=normalize(uViewEye-world);
  vec3 halfVector=normalize(key+view);
  float satin=pow(max(dot(n,halfVector),0.0),18.0);
  float contact=1.0-.32*exp(-max(world.y,0.0)*3.2);
  float front=step(.85,abs(n.z))*exp(-abs(world.z)*3.0);
  float edgeDistance=min(abs(abs(world.x)-3.0),abs(world.y-7.2));
  float arris=front*exp(-edgeDistance*45.0)*step(abs(world.x),3.06)*step(world.y,7.26);
  // A restrained satin response and contact darkening give the black mass definition.
  vec3 dark=(color*(.48+.52*diffuse)+vec3(.012,.014,.018)+vec3(.035,.036,.040)*satin
    +vec3(.24,.035,.014)*spill*incidence)*contact+vec3(.065,.056,.052)*arris;
  // The red cut is self-luminous, with a recessed falloff along depth and
  // a subtle lip highlight, not a screen-space glow.
  float recess=clamp((-world.z)/6.0,0.0,1.0);
  float lip=exp(-abs(world.z)*2.0);
  float vertical=.90+.10*sin(clamp(world.y/6.0,0.0,1.0)*3.14159265);
  float innerContact=1.0-.14*exp(-max(world.y,0.0)*2.8);
  float innerArris=exp(-min(abs(world.y-6.0),abs(abs(world.x)-2.4))*18.0);
  vec3 luminous=(vec3(.98,.235,.10)*mix(1.0,.60,recess)*vertical+vec3(.02,.065,.04)*lip
    +vec3(.025,.016,.009)*innerArris)*innerContact;
  // The distant ivory room retains readable light values and modest warmth.
  vec3 ivory=color*(.81+.17*diffuse)+vec3(.055,.027,.012)*spill;
  vec3 result=mix(mix(dark,ivory,isIvory),luminous*intensity,isRed);
  result=haze(result,length(uViewEye-world),mix(.55,.18,isRed));
  outColor=vec4(clamp(result,0.0,1.0),1.0);
}`;
// Only the real ground mesh samples the reflected architecture. No recursive floor.
const FLOOR_FS=`#version 300 es
precision highp float;
in vec3 world;
uniform sampler2D uReflection;
uniform vec2 uScreen;
uniform vec2 uTexel;
uniform vec3 uEye;
uniform float uEnabled;
uniform float uLighting;
uniform float uAmbientPhase;
uniform float uMask;
out vec4 outColor;
${LIGHTING_GLSL}
void main(){
  if(uMask>.5){outColor=vec4(0.0,1.0,0.0,1.0);return;}
  vec2 uv=gl_FragCoord.xy/uScreen;
  vec3 ray=uEye-world;
  float distanceToEye=length(ray);
  float grazing=1.0-clamp(normalize(ray).y,0.0,1.0);
  float roughness=2.2+clamp(distanceToEye*.27,0.0,5.2);
  vec2 stepSize=uTexel*roughness;
  vec3 base=vec3(.105,.108,.115);
  if(uLighting>.5){
    float spill=floorSpill(world)*ambientIntensity(world,uAmbientPhase);
    base=vec3(.069,.073,.080)+vec3(.17,.025,.009)*spill;
  }
  vec3 c=texture(uReflection,uv).rgb*.24;
  c+=(texture(uReflection,uv+vec2(stepSize.x,0)).rgb+texture(uReflection,uv-vec2(stepSize.x,0)).rgb)*.12;
  c+=(texture(uReflection,uv+vec2(0,stepSize.y)).rgb+texture(uReflection,uv-vec2(0,stepSize.y)).rgb)*.12;
  c+=(texture(uReflection,uv+stepSize).rgb+texture(uReflection,uv-stepSize).rgb+texture(uReflection,uv+vec2(stepSize.x,-stepSize.y)).rgb+texture(uReflection,uv+vec2(-stepSize.x,stepSize.y)).rgb)*.07;
  float edge=smoothstep(0.0,.025,min(min(uv.x,1.0-uv.x),min(uv.y,1.0-uv.y)));
  // Reflection fades towards the viewer instead of competing with lower copy.
  float nearFade=mix(1.0,.58,smoothstep(4.0,13.0,world.z));
  float strength=uEnabled*edge*(.15+.42*pow(grazing,2.0))*exp(-distanceToEye*.025)*nearFade;
  // Graphite finish; this is an artistic color-space mix, not a calibrated BRDF.
  vec3 finish=mix(base,c,strength);
  if(uLighting>.5)finish=haze(finish,distanceToEye,.35);
  outColor=vec4(finish,1.0);
}`;
function shader(gl,type,source){
  const s=gl.createShader(type);if(!s)throw Error('shader allocation');
  gl.shaderSource(s,source);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const log=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(log||'shader compile')}
  return s;
}
export function createRenderer(canvas){
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false});
  if(!gl)return null;
  let program=null,floorProgram=null,vao=null,buffer=null,uniform=null,floorUniforms=null,count=0,limit=4096,textureLimit=1024;
  const reflection=createReflection(gl);
  const vertices=buildStudy();
  // Loss invalidates every GPU object. Drop old-generation handles without issuing GL calls.
  function abandon(){reflection.abandon();buffer=vao=program=uniform=floorProgram=floorUniforms=null;count=0}
  function release(){
    reflection.release();
    if(!gl.isContextLost()){if(buffer)gl.deleteBuffer(buffer);if(vao)gl.deleteVertexArray(vao);if(program)gl.deleteProgram(program);if(floorProgram)gl.deleteProgram(floorProgram)}
    abandon();
  }
  function restore(){
    abandon();
    rebuild();
  }
  function rebuild(){
    release();let vs=null,fs=null,floorFS=null;
    try{
      vs=shader(gl,gl.VERTEX_SHADER,VS);fs=shader(gl,gl.FRAGMENT_SHADER,FS);
      program=gl.createProgram();if(!program)throw Error('program allocation');
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'program link');
      uniform=Object.fromEntries(['uVP','uViewEye','uLighting','uAmbientPhase'].map(name=>[name,gl.getUniformLocation(program,name)]));
      if(Object.values(uniform).some(v=>v===null))throw Error('architecture uniform');
      floorFS=shader(gl,gl.FRAGMENT_SHADER,FLOOR_FS);floorProgram=gl.createProgram();if(!floorProgram)throw Error('floor program allocation');
      gl.attachShader(floorProgram,vs);gl.attachShader(floorProgram,floorFS);gl.linkProgram(floorProgram);
      if(!gl.getProgramParameter(floorProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(floorProgram)||'floor program link');
      floorUniforms=Object.fromEntries(['uVP','uReflection','uScreen','uTexel','uEye','uEnabled','uLighting','uMask','uAmbientPhase'].map(name=>[name,gl.getUniformLocation(floorProgram,name)]));
      if(Object.values(floorUniforms).some(v=>v===null))throw Error('floor uniform');
      vao=gl.createVertexArray();buffer=gl.createBuffer();if(!vao||!buffer)throw Error('mesh allocation');
      gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
      gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
      gl.bindVertexArray(null);gl.bindBuffer(gl.ARRAY_BUFFER,null);count=vertices.length/6;
      const v=gl.getParameter(gl.MAX_VIEWPORT_DIMS);
      limit=Math.min(4096,gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),v[0],v[1]);
      textureLimit=Math.min(limit,1024,gl.getParameter(gl.MAX_TEXTURE_SIZE));
      if(gl.getError()!==gl.NO_ERROR)throw Error('GPU initialization error');
    }catch(e){release();throw e}
    finally{if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);if(floorFS)gl.deleteShader(floorFS)}
  }
  function draw(width,height,dpr,reflectionEnabled=true,lightingEnabled=true,floorMask=false,desktopComposition=false,ambientPhase=-1){
    if(!program||gl.isContextLost())return null;
    const size=bufferSize(width,height,dpr,limit);if(!size)return null;
    if(canvas.width!==size.width)canvas.width=size.width;
    if(canvas.height!==size.height)canvas.height=size.height;
    const dw=gl.drawingBufferWidth,dh=gl.drawingBufferHeight,{eye,vp}=openingPose(width/height,desktopComposition);
    const target=reflection.ensure(dw,dh,textureLimit);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
    if(lightingEnabled)gl.clearColor(.045,.047,.052,1);else gl.clearColor(.09,.098,.106,1);
    // Pass 1: mirrored world, without the first six floor vertices. Same VP and aspect.
    gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);
    gl.viewport(0,0,target.width,target.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);gl.uniformMatrix4fv(uniform.uVP,false,multiply(vp,FLOOR_MIRROR));
    gl.uniform3f(uniform.uViewEye,eye[0],-eye[1],eye[2]);gl.uniform1f(uniform.uLighting,lightingEnabled?1:0);gl.uniform1f(uniform.uAmbientPhase,ambientPhase);
    gl.bindVertexArray(vao);
    if(reflectionEnabled)gl.drawArrays(gl.TRIANGLES,6,count-6);
    // Pass 2: direct architecture writes depth, then the ground receives reflection only
    // where it is visible. No reflected pixels can cover solid walls.
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,dw,dh);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(uniform.uVP,false,vp);gl.uniform3fv(uniform.uViewEye,eye);gl.drawArrays(gl.TRIANGLES,6,count-6);
    gl.useProgram(floorProgram);gl.uniformMatrix4fv(floorUniforms.uVP,false,vp);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,target.texture);
    gl.uniform1i(floorUniforms.uReflection,0);gl.uniform2f(floorUniforms.uScreen,dw,dh);
    gl.uniform2f(floorUniforms.uTexel,1/target.width,1/target.height);gl.uniform3fv(floorUniforms.uEye,eye);
    gl.uniform1f(floorUniforms.uEnabled,reflectionEnabled?1:0);
    gl.uniform1f(floorUniforms.uLighting,lightingEnabled?1:0);gl.uniform1f(floorUniforms.uAmbientPhase,ambientPhase);gl.uniform1f(floorUniforms.uMask,floorMask?1:0);
    gl.drawArrays(gl.TRIANGLES,0,6);gl.bindTexture(gl.TEXTURE_2D,null);gl.bindVertexArray(null);
    if(gl.getError()!==gl.NO_ERROR||gl.isContextLost())throw Error('GPU draw error');
    return {width:dw,height:dh,triangles:count/3,reflectionWidth:target.width,reflectionHeight:target.height,reflectionEnabled,lightingEnabled,floorMask};
  }
  rebuild();return {draw,restore,abandon,release};
}
