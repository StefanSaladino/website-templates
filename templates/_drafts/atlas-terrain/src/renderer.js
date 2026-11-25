/**
 * ATLAS — Self-Contained WebGL2 Renderer
 * Manages WebGL2 pipeline, adaptive mesh detail & resolution scaling,
 * context loss/restoration recovery, heightmap texture upload,
 * and sky -> terrain -> glacial water -> cloud deck render passes.
 */

import {
  WORLD_SIZE,
  WATER_LEVEL,
  buildTerrainData,
  buildLandscapeDetails,
  buildDetailShadowField,
  buildWaterMesh,
  buildMistVolume,
  buildSummitInversion,
} from './terrain.js?v=25';
import {
  SKY_VERT,
  SKY_FRAG,
  TERRAIN_VERT,
  TERRAIN_FRAG,
  WATER_VERT,
  WATER_FRAG,
  DETAIL_VERT,
  DETAIL_FRAG,
} from './shaders.js?v=25';
import { evaluateWorldState, buildViewProjMatrix } from './camera.js?v=25';

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || 'Unknown shader compile error';
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(gl, vertSrc, fragSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog) || 'Unknown program link error';
    gl.deleteProgram(prog);
    throw new Error(info);
  }
  return prog;
}

function getUniforms(gl, prog, names) {
  const map = {};
  for (const name of names) {
    map[name] = gl.getUniformLocation(prog, name);
  }
  return map;
}

// M_reflected = M_main * reflectionY. Points on the water plane retain
// identical clip coordinates; reflecting the eye and all basis vectors matches sky rays.
export function mirrorLakeView(state,viewProj,plane){
  const matrix=new Float32Array(viewProj);
  for(let i=0;i<4;i++){matrix[4+i]=-viewProj[4+i];matrix[12+i]=viewProj[12+i]+2*plane*viewProj[4+i];}
  const point=v=>[v[0],2*plane-v[1],v[2]],direction=v=>[v[0],-v[1],v[2]];
  return {matrix,state:{...state,pos:point(state.pos),look:point(state.look),right:direction(state.right),up:direction(state.up),forward:direction(state.forward)}};
}
export class AtlasRenderer {
  constructor(canvas, stageEl, options = {}) {
    this.canvas = canvas;
    this.stageEl = stageEl;
    this.onRendererChange = options.onRendererChange || (() => {});

    const initialMobile = typeof window !== 'undefined' && window.innerWidth <= 820;
    this.quality = options.initialQuality || (initialMobile ? 'low' : 'high');
    this.isSoftwareRenderer = false;
    this.contextLost = false;
    this.disposed = false;
    this.drawCount = 0;
    this.lastWidth = 0;
    this.lastHeight = 0;
    this.activeDprScale = 1.0;

    this.terrainData = null;
    this.waterData = buildWaterMesh();

    this.gl = null;
    this.resources = null;

    this._onContextLost = (e) => {
      e.preventDefault();
      this.contextLost = true;
      this.resources = null;
      this.stageEl.setAttribute('data-renderer', 'static');
      this.canvas.hidden = true;
      this.onRendererChange('static', 'context-lost');
    };

    this._onContextRestored = () => {
      this.contextLost = false;
      try {
        this._initResources();
        this.canvas.hidden = false;
        this.stageEl.setAttribute('data-renderer', 'webgl');
        this.stageEl.removeAttribute('data-render-error');
        this.onRendererChange('webgl', 'context-restored');
      } catch (err) {
        this.stageEl.setAttribute('data-renderer', 'static');
        this.stageEl.setAttribute('data-render-error', String(err?.message || err));
        this.canvas.hidden = true;
        this.onRendererChange('static', 'restore-failed');
      }
    };

    canvas.addEventListener('webglcontextlost', this._onContextLost, false);
    canvas.addEventListener('webglcontextrestored', this._onContextRestored, false);
  }

  init() {
    const attrs = {
      alpha: false,
      antialias: true,
      depth: true,
      powerPreference: 'high-performance',
    };
    let gl;try{gl=this.canvas.getContext('webgl2',attrs)}catch{gl=null}
    if (!gl) {
      this.stageEl.setAttribute('data-renderer', 'static');
      this.canvas.hidden = true;
      this.onRendererChange('static', 'no-webgl2');
      return false;
    }

    this.gl = gl;

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      const rendererName = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
      if (/swiftshader|llvmpipe|software|mesa/i.test(rendererName)) {
        this.isSoftwareRenderer = true;
      }
    }

    try {
      this._buildTerrainGeometry();
      this._initResources();
      this.canvas.hidden = false;
      this.stageEl.setAttribute('data-renderer', 'webgl');
      this.stageEl.setAttribute('data-rendered-quality', this.quality);
      this.stageEl.removeAttribute('data-render-error');
      this.onRendererChange('webgl', 'ok');
      return true;
    } catch (err) {
      this.stageEl.setAttribute('data-renderer', 'static');
      this.stageEl.setAttribute('data-render-error', String(err?.message || err));
      this.canvas.hidden = true;
      this.onRendererChange('static', 'init-error');
      return false;
    }
  }

  _buildTerrainGeometry() {
    if(this.terrainData)return;
    this.terrainData=buildTerrainData();
  }

  _initResources() {
    const gl = this.gl;
    if (!gl || gl.isContextLost()) return;

    this._buildTerrainGeometry();
    const td = this.terrainData;

    const skyProg = createProgram(gl, SKY_VERT, SKY_FRAG);
    const terrainProg = createProgram(gl, TERRAIN_VERT, TERRAIN_FRAG);
    const waterProg = createProgram(gl, WATER_VERT, WATER_FRAG);
    const detailProg = createProgram(gl, DETAIL_VERT, DETAIL_FRAG);

    const skyVao = gl.createVertexArray();

    // Terrain VAO + buffers
    const terrainVao = gl.createVertexArray();
    gl.bindVertexArray(terrainVao);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, td.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, td.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const geoBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geoBuf);
    gl.bufferData(gl.ARRAY_BUFFER, td.geoAttr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, td.indices, gl.STATIC_DRAW);

    // Water VAO
    const waterVao = gl.createVertexArray();
    gl.bindVertexArray(waterVao);
    const wPosBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wPosBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.waterData.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const wIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.waterData.indices, gl.STATIC_DRAW);

    // Two instanced batches; instance positions remain fixed across all render qualities.
    const detailBuffers=[];
    const detailBatches=buildLandscapeDetails(td).map(batch=>{
      const vao=gl.createVertexArray();gl.bindVertexArray(vao);
      const vertices=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,batch.vertices,gl.STATIC_DRAW);
      for(let i=0;i<3;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,36,i*12);}
      const instances=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,instances);gl.bufferData(gl.ARRAY_BUFFER,batch.instances,gl.STATIC_DRAW);
      for(let i=3;i<=4;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,4,gl.FLOAT,false,32,(i-3)*16);gl.vertexAttribDivisor(i,1);}
      detailBuffers.push(vertices,instances);
      return {vao,vertexCount:batch.vertices.length/9,count:batch.count};
    });
    gl.bindVertexArray(null);

    // Upload 512x512 16-bit packed RG height + drainage/curvature texture
    const heightTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, heightTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      td.texSize,
      td.texSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      td.heightTexData
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    const detailShadowField=buildDetailShadowField(td);
    const detailShadowTex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,detailShadowTex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RG8,detailShadowField.size,detailShadowField.size,0,gl.RG,gl.UNSIGNED_BYTE,detailShadowField.data);
    gl.generateMipmap(gl.TEXTURE_2D);gl.bindTexture(gl.TEXTURE_2D,null);

    const mist=buildMistVolume(td),mistTex=gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_3D,mistTex);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_R,gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    gl.texImage3D(gl.TEXTURE_3D,0,gl.R8,...mist.dims,0,gl.RED,gl.UNSIGNED_BYTE,mist.data);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,4);
    gl.bindTexture(gl.TEXTURE_3D,null);gl.activeTexture(gl.TEXTURE0);

    const inversion=buildSummitInversion(td),inversionTex=gl.createTexture();
    gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_3D,inversionTex);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D,gl.TEXTURE_WRAP_R,gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    gl.texImage3D(gl.TEXTURE_3D,0,gl.R8,...inversion.dims,0,gl.RED,gl.UNSIGNED_BYTE,inversion.data);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,4);
    gl.bindTexture(gl.TEXTURE_3D,null);gl.activeTexture(gl.TEXTURE0);
    this.resources = {
      inversionTex,inversionOrigin:inversion.origin,inversionExtent:inversion.extent,
      mistTex,mistOrigin:mist.origin,mistExtent:mist.extent,
      detailShadowTex,detailShadowBounds:detailShadowField.bounds,reflection:null,
      skyProg,
      skyU: getUniforms(gl, skyProg, [
        'uCamRight', 'uCamUp', 'uCamForward', 'uTanHalfFov', 'uAspect',
        'uSunDir', 'uMapMix', 'uGolden', 'uValley', 'uSkyZenith', 'uSkyHorizon','uMistEye','uMistVolume','uMistOrigin','uMistExtent','uMistStrength','uMistTime','uSummitInversion','uInversionOrigin','uInversionExtent','uInversionMix',
      ]),
      skyVao,

      terrainProg,
      terrainU: getUniforms(gl, terrainProg, [
        'uViewProj', 'uRelief', 'uCamPos', 'uSunDir', 'uHeightTex',
        'uWorldSize', 'uFolioHalf', 'uMaxTexHeight', 'uWaterLevel', 'uMapMix',
        'uDetailShadows','uDetailShadowBounds','uDetailGrowth','uClipBelow','uMistVolume','uMistOrigin','uMistExtent','uMistStrength','uMistTime','uSummitInversion','uInversionOrigin','uInversionExtent','uInversionMix',
        'uGolden', 'uFogDensity', 'uSkyZenith', 'uSkyHorizon',
      ]),
      terrainVao,
      terrainIndexCount: td.indices.length,
      buffers: [posBuf, normBuf, geoBuf, idxBuf, wPosBuf, wIdxBuf, ...detailBuffers],
      detailProg,detailBatches,
      detailU:getUniforms(gl,detailProg,['uViewProj','uRelief','uGrowth','uCamPos','uSunDir','uSkyHorizon','uGolden','uFogDensity','uWorldSize','uMaxTexHeight','uHeightTex','uClipBelow','uMistVolume','uMistOrigin','uMistExtent','uMistStrength','uMistTime','uSummitInversion','uInversionOrigin','uInversionExtent','uInversionMix']),

      waterProg,
      waterU: getUniforms(gl, waterProg, [
        'uViewProj', 'uRelief', 'uCamPos', 'uSunDir', 'uHeightTex',
        'uWorldSize', 'uMaxTexHeight', 'uWaterLevel', 'uMapMix', 'uGolden',
        'uTime', 'uFogDensity', 'uSkyZenith', 'uSkyHorizon','uReflection','uScreenSize','uReflectionReady','uMistVolume','uMistOrigin','uMistExtent','uMistStrength','uMistTime','uSummitInversion','uInversionOrigin','uInversionExtent','uInversionMix',
      ]),
      waterVao,
      waterIndexCount: this.waterData.indices.length,

      heightTex,
    };
  }

  setQuality(mode) {
    const next = mode === 'low' ? 'low' : 'high';
    if (next === this.quality) return;
    this.quality = next;
    this.stageEl.setAttribute('data-rendered-quality', this.quality);
    // Same mesh, texture, and shader programs: only the drawing-buffer budget changes.
  }

  resizeIfNeeded(isMoving = false) {
    const rect = this.stageEl.getBoundingClientRect();
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height));

    // Stable pixel budget: never change resolution just because scrolling begins.
    const nativeDpr=Math.min(window.devicePixelRatio||1,2);
    const budget=this.isSoftwareRenderer?1050000:this.quality==='low'?1100000:1900000;
    const cap=this.isSoftwareRenderer?1:this.quality==='low'?1.2:1.55;
    const targetDpr=Math.min(nativeDpr,cap,Math.sqrt(budget/(cssW*cssH)));

    const pxW = Math.max(2, Math.round(cssW * targetDpr));
    const pxH = Math.max(2, Math.round(cssH * targetDpr));

    if (this.canvas.width !== pxW || this.canvas.height !== pxH || this.lastWidth !== cssW || this.lastHeight !== cssH) {
      this.canvas.width = pxW;
      this.canvas.height = pxH;
      this.lastWidth = cssW;
      this.lastHeight = cssH;
      this.activeDprScale = targetDpr;
    }
    return { cssW, cssH, pxW, pxH, aspect: cssW / cssH };
  }

  sampleTerrainHeight(x, z) {
    return this.terrainData ? this.terrainData.sampleHeight(x, z) : 0;
  }

  render(progress, timeSec, inspectYaw = 0, inspectPitch = 0, isMoving = false) {
    if (this.disposed || this.contextLost || !this.gl || !this.resources) return null;
    const gl = this.gl;
    if (gl.isContextLost()) return null;

    const { pxW, pxH, aspect } = this.resizeIfNeeded(isMoving);
    const state = evaluateWorldState(
      progress,
      aspect,
      (x, z) => this.sampleTerrainHeight(x, z),
      inspectYaw,
      inspectPitch
    );

    const { viewProj, tanHalfFov } = buildViewProjMatrix(
      state.pos,
      state.look,
      [0, 1, 0],
      state.fovDeg,
      aspect,
      0.4,
      340.0
    );

    const r = this.resources;
    this.environmentTime=timeSec;
    gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_3D,r.mistTex);gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_3D,r.inversionTex);gl.activeTexture(gl.TEXTURE0);
    // Each actual render target is cleared once immediately before drawing it.
    gl.depthMask(true);gl.clearDepth(1);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
    const growth=smooth(.43,.94,state.relief)*(1-smooth(.06,.62,state.mapMix));
    const waterVisible=state.relief>.30&&state.mapMix<.74;
    const lakeInFrame=waterVisible&&this._lakeMayBeVisible(viewProj,state.relief);
    let reflectionReady=false;
    if(lakeInFrame){
      const target=this._ensureReflection(pxW,pxH);
      if(target){
        const plane=WATER_LEVEL*state.relief;
        const mirrored=mirrorLakeView(state,viewProj,plane);
        gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,null);gl.activeTexture(gl.TEXTURE0);
        gl.bindFramebuffer(gl.FRAMEBUFFER,target.fbo);
        gl.viewport(0,0,target.w,target.h);gl.depthMask(true);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        this._drawOpaque(mirrored.state,mirrored.matrix,tanHalfFov,aspect,growth,true);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        reflectionReady=true;
      }
    }
    gl.viewport(0,0,pxW,pxH);gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    this.stageEl.dataset.detailInstances=String(this._drawOpaque(state,viewProj,tanHalfFov,aspect,growth,false));
    this.stageEl.dataset.lakeInFrame=String(lakeInFrame);
    this.stageEl.dataset.reflectionReady=String(reflectionReady);
    this.stageEl.dataset.reflectionSize=reflectionReady?r.reflection.w+'x'+r.reflection.h:'0x0';

    // The same conservative projected bounds used for reflection cover
    // every water mesh vertex. Skip the water draw when entirely off-screen.
    // A visible lake must still render if reflection allocation fails.
    if (lakeInFrame) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);

      gl.useProgram(r.waterProg);
      this._setMist(r.waterU,state);
      gl.bindVertexArray(r.waterVao);
      gl.uniformMatrix4fv(r.waterU.uViewProj, false, viewProj);
      gl.uniform1f(r.waterU.uRelief, state.relief);
      gl.uniform3fv(r.waterU.uCamPos, state.pos);
      gl.uniform3fv(r.waterU.uSunDir, state.sunDir);
      gl.uniform1i(r.waterU.uHeightTex, 0);
      gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,reflectionReady?r.reflection.color:r.heightTex);gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(r.waterU.uReflection,2);gl.uniform2f(r.waterU.uScreenSize,pxW,pxH);gl.uniform1f(r.waterU.uReflectionReady,reflectionReady?1:0);
      gl.uniform1f(r.waterU.uWorldSize, WORLD_SIZE);
      gl.uniform1f(r.waterU.uMaxTexHeight, this.terrainData.maxTexHeight);
      gl.uniform1f(r.waterU.uWaterLevel, WATER_LEVEL);
      gl.uniform1f(r.waterU.uMapMix, state.mapMix);
      gl.uniform1f(r.waterU.uGolden, state.goldenWeight);
      gl.uniform1f(r.waterU.uTime, timeSec);
      gl.uniform1f(r.waterU.uFogDensity, state.fogDensity);
      gl.uniform3fv(r.waterU.uSkyZenith, state.skyZenith);
      gl.uniform3fv(r.waterU.uSkyHorizon, state.skyHorizon);
      gl.drawElements(gl.TRIANGLES, r.waterIndexCount, gl.UNSIGNED_SHORT, 0);

      gl.enable(gl.CULL_FACE);
    }

    this.stageEl.dataset.mistStrength=this._mistStrength(state).toFixed(4);
    this.stageEl.dataset.mistSamples=state.inversionMix>.005?'16':'12';
    this.stageEl.dataset.inversionMix=state.inversionMix.toFixed(4);
    
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);

    this.drawCount++;
    this.stageEl.setAttribute('data-draws', String(this.drawCount));
    this.stageEl.setAttribute('data-rendered-progress', state.progress.toFixed(4));
    this.stageEl.setAttribute('data-rendered-chapter', state.chapter.id);
    this.stageEl.dataset.terrainResolution=String(this.terrainData.resolution);
    this.stageEl.dataset.cameraClearance=(state.pos[1]-this.sampleTerrainHeight(state.pos[0],state.pos[2])*state.relief).toFixed(4);

    // Ambient redraws only at scenic chapters with actual water/mist work.
    state.ambientEligible=(state.chapter.id==='valley'&&lakeInFrame)||(state.chapter.id==='summit'&&this._mistStrength(state)>.15);
    return state;
  }

  _mistStrength(state){
    return state.cloudAlpha*(.42+1.20*state.goldenWeight+.65*state.inversionMix*(1-state.goldenWeight))*(1-state.mapMix);
  }
  _setMist(u,state){
    const gl=this.gl,r=this.resources;
    gl.uniform1i(u.uMistVolume,3);
    gl.uniform3fv(u.uMistOrigin,r.mistOrigin);gl.uniform3fv(u.uMistExtent,r.mistExtent);
    gl.uniform1f(u.uMistStrength,this._mistStrength(state));
    gl.uniform1f(u.uMistTime,this.environmentTime||0);
    gl.uniform1i(u.uSummitInversion,4);gl.uniform3fv(u.uInversionOrigin,r.inversionOrigin);gl.uniform3fv(u.uInversionExtent,r.inversionExtent);gl.uniform1f(u.uInversionMix,state.inversionMix);
  }

  _drawOpaque(state,viewProj,tanHalfFov,aspect,growth,reflected){
    const gl=this.gl,r=this.resources;
    gl.disable(gl.BLEND);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.heightTex);

    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,r.detailShadowTex);gl.activeTexture(gl.TEXTURE0);

    // Mirroring reverses triangle winding, but not the screen-space sky triangle.
    gl.frontFace(reflected?gl.CW:gl.CCW);
    // Opaque terrain and landscape details establish depth before the sky.
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.useProgram(r.terrainProg);
    this._setMist(r.terrainU,state);
    gl.bindVertexArray(r.terrainVao);
    gl.uniformMatrix4fv(r.terrainU.uViewProj, false, viewProj);
    gl.uniform1f(r.terrainU.uRelief, state.relief);
    gl.uniform3fv(r.terrainU.uCamPos, state.pos);
    gl.uniform3fv(r.terrainU.uSunDir, state.sunDir);
    gl.uniform1i(r.terrainU.uHeightTex, 0);
    gl.uniform1i(r.terrainU.uDetailShadows,1);
    gl.uniform4fv(r.terrainU.uDetailShadowBounds,r.detailShadowBounds);
    gl.uniform1f(r.terrainU.uDetailGrowth,growth);
    gl.uniform1f(r.terrainU.uClipBelow,reflected?WATER_LEVEL*state.relief-.012:-1000);
    gl.uniform1f(r.terrainU.uWorldSize, WORLD_SIZE);
    gl.uniform1f(r.terrainU.uFolioHalf, state.folioHalf);
    gl.uniform1f(r.terrainU.uMaxTexHeight, this.terrainData.maxTexHeight);
    gl.uniform1f(r.terrainU.uWaterLevel, WATER_LEVEL);
    gl.uniform1f(r.terrainU.uMapMix, state.mapMix);
    gl.uniform1f(r.terrainU.uGolden, state.goldenWeight);
    gl.uniform1f(r.terrainU.uFogDensity, state.fogDensity);
    gl.uniform3fv(r.terrainU.uSkyZenith, state.skyZenith);
    gl.uniform3fv(r.terrainU.uSkyHorizon, state.skyHorizon);
    gl.drawElements(gl.TRIANGLES, r.terrainIndexCount, gl.UNSIGNED_INT, 0);

    // Reveal physical details and their ground shadows with the same envelope.
    let detailInstances=0;
    if(growth>.001){
      gl.useProgram(r.detailProg);this._setMist(r.detailU,state);gl.disable(gl.CULL_FACE);
      gl.uniformMatrix4fv(r.detailU.uViewProj,false,viewProj);
      gl.uniform1f(r.detailU.uClipBelow,reflected?WATER_LEVEL*state.relief-.012:-1000);
      gl.uniform1f(r.detailU.uRelief,state.relief);gl.uniform1f(r.detailU.uGrowth,growth);
      gl.uniform3fv(r.detailU.uCamPos,state.pos);gl.uniform3fv(r.detailU.uSunDir,state.sunDir);
      gl.uniform3fv(r.detailU.uSkyHorizon,state.skyHorizon);gl.uniform1f(r.detailU.uGolden,state.goldenWeight);
      gl.uniform1f(r.detailU.uFogDensity,state.fogDensity);gl.uniform1f(r.detailU.uWorldSize,WORLD_SIZE);
      gl.uniform1f(r.detailU.uMaxTexHeight,this.terrainData.maxTexHeight);gl.uniform1i(r.detailU.uHeightTex,0);
      for(const batch of r.detailBatches){gl.bindVertexArray(batch.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,batch.vertexCount,batch.count);detailInstances+=batch.count;}
      gl.enable(gl.CULL_FACE);
    }
    gl.frontFace(gl.CCW);
    // Background last: depth 1 and LEQUAL permit only uncovered samples.
    // Apply to both main and mirrored opaque passes; no fragment depth writes.
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(false);
    gl.disable(gl.BLEND);
    gl.useProgram(r.skyProg);
    this._setMist(r.skyU,state);gl.uniform3fv(r.skyU.uMistEye,state.pos);
    gl.bindVertexArray(r.skyVao);
    gl.uniform3fv(r.skyU.uCamRight, state.right);
    gl.uniform3fv(r.skyU.uCamUp, state.up);
    gl.uniform3fv(r.skyU.uCamForward, state.forward);
    gl.uniform1f(r.skyU.uTanHalfFov, tanHalfFov);
    gl.uniform1f(r.skyU.uAspect, aspect);
    gl.uniform3fv(r.skyU.uSunDir, state.sunDir);
    gl.uniform1f(r.skyU.uMapMix, state.mapMix);
    gl.uniform1f(r.skyU.uGolden, state.goldenWeight);
    gl.uniform1f(r.skyU.uValley, state.valleyWeight);
    gl.uniform3fv(r.skyU.uSkyZenith, state.skyZenith);
    gl.uniform3fv(r.skyU.uSkyHorizon, state.skyHorizon);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    return detailInstances;


  }

  // Conservative planar bounding quad rejection. Do not render a reflection for
  // an off-screen lake; near-plane crossings conservatively retain the pass.
  _lakeMayBeVisible(m,relief){
    const corners=[[-24,-14],[20,-14],[-24,18],[20,18]].map(([x,z])=>{
      const y=WATER_LEVEL*relief;
      return [m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[3]*x+m[7]*y+m[11]*z+m[15]];
    });
    if(corners.every(v=>v[2]<=0))return false;
    if(corners.some(v=>v[2]<=0))return true;
    return ![0,1].some(i=>corners.every(v=>v[i]<-v[2])||corners.every(v=>v[i]>v[2]));
  }

  _ensureReflection(pxW,pxH){
    const gl=this.gl,r=this.resources;
    const scale=Math.min(.50,640/Math.max(pxW,pxH),Math.sqrt(230400/(pxW*pxH)));
    const w=Math.max(2,Math.round(pxW*scale)),h=Math.max(2,Math.round(pxH*scale));
    if(r.reflection&&r.reflection.w===w&&r.reflection.h===h)return r.reflection;
    this._deleteReflection();
    const color=gl.createTexture(),depth=gl.createRenderbuffer(),fbo=gl.createFramebuffer();
    gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,color);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,color,0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
    const complete=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindRenderbuffer(gl.RENDERBUFFER,null);
    gl.bindTexture(gl.TEXTURE_2D,null);gl.activeTexture(gl.TEXTURE0);
    if(!complete){gl.deleteFramebuffer(fbo);gl.deleteRenderbuffer(depth);gl.deleteTexture(color);return null;}
    return r.reflection={fbo,color,depth,w,h};
  }

  _deleteReflection(){
    const gl=this.gl,r=this.resources,t=r?.reflection;
    if(!gl||!t)return;
    gl.deleteFramebuffer(t.fbo);gl.deleteRenderbuffer(t.depth);gl.deleteTexture(t.color);r.reflection=null;
  }

  _destroyResources() {
    const gl = this.gl;
    const r = this.resources;
    if (!gl || !r) return;
    this._deleteReflection();
    gl.deleteProgram(r.skyProg);
    gl.deleteProgram(r.terrainProg);
    gl.deleteProgram(r.waterProg);
    gl.deleteProgram(r.detailProg);
    for(const batch of r.detailBatches)gl.deleteVertexArray(batch.vao);
    gl.deleteVertexArray(r.skyVao);
    gl.deleteVertexArray(r.terrainVao);
    gl.deleteVertexArray(r.waterVao);
    for (const buf of r.buffers) gl.deleteBuffer(buf);
    gl.deleteTexture(r.heightTex);
    gl.deleteTexture(r.detailShadowTex);
    gl.deleteTexture(r.mistTex);gl.deleteTexture(r.inversionTex);
    this.resources = null;
  }

  dispose() {
    this.disposed = true;
    this.canvas.removeEventListener('webglcontextlost', this._onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this._onContextRestored);
    this._destroyResources();
  }
}
