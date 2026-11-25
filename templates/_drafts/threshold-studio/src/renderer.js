import {studyPose,multiply} from './camera.js?v=T06';
import {buildStudy} from './geometry.js?v=T06';
import {bufferSize} from './lifecycle.js?v=T06';
import {createReflection,FLOOR_MIRROR} from './reflection.js?v=T06';
const VS=`#version 300 es
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aColor;
uniform mat4 uVP;
out vec3 color;
out vec3 world;
void main(){gl_Position=uVP*vec4(aPosition,1.0);color=aColor;world=aPosition;}`;
const FS=`#version 300 es
precision mediump float;
in vec3 color;
out vec4 outColor;
void main(){outColor=vec4(color,1.0);}`;
// Only the real ground mesh samples the reflected architecture. No recursive floor.
const FLOOR_FS=`#version 300 es
precision highp float;
in vec3 world;
uniform sampler2D uReflection;
uniform vec2 uScreen;
uniform vec2 uTexel;
uniform vec3 uEye;
uniform float uEnabled;
out vec4 outColor;
void main(){
  vec2 uv=gl_FragCoord.xy/uScreen;
  vec3 ray=uEye-world;
  float distanceToEye=length(ray);
  float grazing=1.0-clamp(normalize(ray).y,0.0,1.0);
  float roughness=1.2+clamp(distanceToEye*.16,0.0,3.6);
  vec2 stepSize=uTexel*roughness;
  vec3 base=vec3(.105,.108,.115);
  vec3 c=texture(uReflection,uv).rgb*.24;
  c+=(texture(uReflection,uv+vec2(stepSize.x,0)).rgb+texture(uReflection,uv-vec2(stepSize.x,0)).rgb)*.12;
  c+=(texture(uReflection,uv+vec2(0,stepSize.y)).rgb+texture(uReflection,uv-vec2(0,stepSize.y)).rgb)*.12;
  c+=(texture(uReflection,uv+stepSize).rgb+texture(uReflection,uv-stepSize).rgb+texture(uReflection,uv+vec2(stepSize.x,-stepSize.y)).rgb+texture(uReflection,uv+vec2(-stepSize.x,stepSize.y)).rgb)*.07;
  float edge=smoothstep(0.0,.025,min(min(uv.x,1.0-uv.x),min(uv.y,1.0-uv.y)));
  float strength=uEnabled*edge*(.18+.47*pow(grazing,2.0))*exp(-distanceToEye*.025);
  // Graphite finish; this is an artistic color-space mix, not a calibrated BRDF.
  outColor=vec4(mix(base,c,strength),1.0);
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
      uniform=gl.getUniformLocation(program,'uVP');if(uniform===null)throw Error('camera uniform');
      floorFS=shader(gl,gl.FRAGMENT_SHADER,FLOOR_FS);floorProgram=gl.createProgram();if(!floorProgram)throw Error('floor program allocation');
      gl.attachShader(floorProgram,vs);gl.attachShader(floorProgram,floorFS);gl.linkProgram(floorProgram);
      if(!gl.getProgramParameter(floorProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(floorProgram)||'floor program link');
      floorUniforms=Object.fromEntries(['uVP','uReflection','uScreen','uTexel','uEye','uEnabled'].map(name=>[name,gl.getUniformLocation(floorProgram,name)]));
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
  function draw(width,height,dpr,reflectionEnabled=true){
    if(!program||gl.isContextLost())return null;
    const size=bufferSize(width,height,dpr,limit);if(!size)return null;
    if(canvas.width!==size.width)canvas.width=size.width;
    if(canvas.height!==size.height)canvas.height=size.height;
    const dw=gl.drawingBufferWidth,dh=gl.drawingBufferHeight,{eye,vp}=studyPose(width/height);
    const target=reflection.ensure(dw,dh,textureLimit);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
    gl.clearColor(.09,.098,.106,1);
    // Pass 1: mirrored world, without the first six floor vertices. Same VP and aspect.
    gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);
    gl.viewport(0,0,target.width,target.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);gl.uniformMatrix4fv(uniform,false,multiply(vp,FLOOR_MIRROR));
    gl.bindVertexArray(vao);
    if(reflectionEnabled)gl.drawArrays(gl.TRIANGLES,6,count-6);
    // Pass 2: direct architecture writes depth, then the ground receives reflection only
    // where it is visible. No reflected pixels can cover solid walls.
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,dw,dh);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(uniform,false,vp);gl.drawArrays(gl.TRIANGLES,6,count-6);
    gl.useProgram(floorProgram);gl.uniformMatrix4fv(floorUniforms.uVP,false,vp);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,target.texture);
    gl.uniform1i(floorUniforms.uReflection,0);gl.uniform2f(floorUniforms.uScreen,dw,dh);
    gl.uniform2f(floorUniforms.uTexel,1/target.width,1/target.height);gl.uniform3fv(floorUniforms.uEye,eye);
    gl.uniform1f(floorUniforms.uEnabled,reflectionEnabled?1:0);
    gl.drawArrays(gl.TRIANGLES,0,6);gl.bindTexture(gl.TEXTURE_2D,null);gl.bindVertexArray(null);
    if(gl.getError()!==gl.NO_ERROR||gl.isContextLost())throw Error('GPU draw error');
    return {width:dw,height:dh,triangles:count/3,reflectionWidth:target.width,reflectionHeight:target.height,reflectionEnabled};
  }
  rebuild();return {draw,restore,abandon,release};
}
