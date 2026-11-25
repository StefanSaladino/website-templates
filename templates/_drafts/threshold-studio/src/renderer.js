import {studyCamera} from './camera.js?v=T04';
import {buildStudy} from './geometry.js?v=T04';
import {bufferSize} from './lifecycle.js?v=T04';
const VS=`#version 300 es
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aColor;
uniform mat4 uVP;
out vec3 color;
void main(){gl_Position=uVP*vec4(aPosition,1.0);color=aColor;}`;
const FS=`#version 300 es
precision mediump float;
in vec3 color;
out vec4 outColor;
void main(){outColor=vec4(color,1.0);}`;
function shader(gl,type,source){
  const s=gl.createShader(type);if(!s)throw Error('shader allocation');
  gl.shaderSource(s,source);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const log=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(log||'shader compile')}
  return s;
}
export function createRenderer(canvas){
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false});
  if(!gl)return null;
  let program=null,vao=null,buffer=null,uniform=null,count=0,limit=4096;
  const vertices=buildStudy();
  function release(){
    if(!gl.isContextLost()){if(buffer)gl.deleteBuffer(buffer);if(vao)gl.deleteVertexArray(vao);if(program)gl.deleteProgram(program)}
    buffer=vao=program=uniform=null;count=0;
  }
  function rebuild(){
    release();let vs=null,fs=null;
    try{
      vs=shader(gl,gl.VERTEX_SHADER,VS);fs=shader(gl,gl.FRAGMENT_SHADER,FS);
      program=gl.createProgram();if(!program)throw Error('program allocation');
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'program link');
      uniform=gl.getUniformLocation(program,'uVP');if(uniform===null)throw Error('camera uniform');
      vao=gl.createVertexArray();buffer=gl.createBuffer();if(!vao||!buffer)throw Error('mesh allocation');
      gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
      gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
      gl.bindVertexArray(null);gl.bindBuffer(gl.ARRAY_BUFFER,null);count=vertices.length/6;
      const v=gl.getParameter(gl.MAX_VIEWPORT_DIMS);
      limit=Math.min(4096,gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),v[0],v[1]);
      if(gl.getError()!==gl.NO_ERROR)throw Error('GPU initialization error');
    }catch(e){release();throw e}
    finally{if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs)}
  }
  function draw(width,height,dpr){
    if(!program||gl.isContextLost())return null;
    const size=bufferSize(width,height,dpr,limit);if(!size)return null;
    if(canvas.width!==size.width)canvas.width=size.width;
    if(canvas.height!==size.height)canvas.height=size.height;
    gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.BLEND);
    gl.clearColor(.09,.098,.106,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);gl.uniformMatrix4fv(uniform,false,studyCamera(width/height));
    gl.bindVertexArray(vao);gl.drawArrays(gl.TRIANGLES,0,count);gl.bindVertexArray(null);
    if(gl.getError()!==gl.NO_ERROR||gl.isContextLost())throw Error('GPU draw error');
    return {width:gl.drawingBufferWidth,height:gl.drawingBufferHeight,triangles:count/3};
  }
  rebuild();return {draw,rebuild,release};
}
