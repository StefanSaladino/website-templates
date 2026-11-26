// Mirror geometry in the actual Y=0 floor plane. Same camera/projection as direct view.
export const MAX_REFLECTION_PIXELS=375000,MAX_REFLECTION_EDGE=1024;
export const FLOOR_MIRROR=new Float32Array([1,0,0,0,0,-1,0,0,0,0,1,0,0,0,0,1]);
export function reflectionSize(w,h,limit=MAX_REFLECTION_EDGE,quality='full'){
  if(![w,h,limit].every(Number.isFinite)||w<1||h<1||limit<1)return null;
  const edge=Math.min(limit,MAX_REFLECTION_EDGE);
  const s=Math.min(quality==='balanced'?.35:.5,Math.sqrt(MAX_REFLECTION_PIXELS/(w*h)),edge/w,edge/h);
  const width=Math.max(1,Math.floor(w*s)),height=Math.max(1,Math.floor(h*s));
  return {width,height};
}
// Owns exactly one color texture, depth renderbuffer and framebuffer per live generation.
export function createReflection(gl){
  let tex=null,depth=null,fbo=null,w=0,h=0;
  function abandon(){tex=depth=fbo=null;w=h=0}
  function release(){
    if(!gl.isContextLost()){
      if(tex)gl.deleteTexture(tex);if(depth)gl.deleteRenderbuffer(depth);if(fbo)gl.deleteFramebuffer(fbo);
    }
    abandon();
  }
  function ensure(width,height,limit,quality='full'){
    const size=reflectionSize(width,height,limit,quality);if(!size)throw Error('Invalid reflection dimensions');
    if(fbo&&w===size.width&&h===size.height)return {texture:tex,framebuffer:fbo,width:w,height:h};
    release();w=size.width;h=size.height;
    try{
      tex=gl.createTexture();depth=gl.createRenderbuffer();fbo=gl.createFramebuffer();
      if(!tex||!depth||!fbo)throw Error('Reflection allocation');
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
      gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
      if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Reflection framebuffer incomplete');
      return {texture:tex,framebuffer:fbo,width:w,height:h};
    }catch(e){release();throw e}
    finally{gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindRenderbuffer(gl.RENDERBUFFER,null);gl.bindTexture(gl.TEXTURE_2D,null)}
  }
  return {ensure,release,abandon};
}
