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
  buildWaterMesh,
  buildCloudDeckMesh,
} from './terrain.js';
import {
  SKY_VERT,
  SKY_FRAG,
  TERRAIN_VERT,
  TERRAIN_FRAG,
  WATER_VERT,
  WATER_FRAG,
  CLOUD_VERT,
  CLOUD_FRAG,
} from './shaders.js';
import { evaluateWorldState, buildViewProjMatrix } from './camera.js';

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

    // Terrain CPU data built cleanly per quality tier (never rebuilt during scroll)
    this.terrainData = null;
    this.waterData = buildWaterMesh();
    this.cloudLower = buildCloudDeckMesh(8.2, 130);
    this.cloudUpper = buildCloudDeckMesh(10.8, 132);

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

    // Detect software rasterizer so mobile/headless environments stay crisp and responsive
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
    const res = this.quality === 'high' && !this.isSoftwareRenderer ? 192 : 128;
    if (this.terrainData && this.terrainData.resolution === res) return;
    this.terrainData = buildTerrainData(res);
  }

  _initResources() {
    const gl = this.gl;
    if (!gl || gl.isContextLost()) return;

    this._buildTerrainGeometry();
    const td = this.terrainData;

    const skyProg = createProgram(gl, SKY_VERT, SKY_FRAG);
    const terrainProg = createProgram(gl, TERRAIN_VERT, TERRAIN_FRAG);
    const waterProg = createProgram(gl, WATER_VERT, WATER_FRAG);
    const cloudProg = createProgram(gl, CLOUD_VERT, CLOUD_FRAG);

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

    // Cloud Deck VAO (shared quad geometry positioned in vertex shader via uAltitudeOffset)
    const cloudVao = gl.createVertexArray();
    gl.bindVertexArray(cloudVao);
    const cPosBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cPosBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.cloudLower.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const cIdxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cIdxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.cloudLower.indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    // Upload 16-bit packed RG heightmap texture
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

    this.resources = {
      skyProg,
      skyU: getUniforms(gl, skyProg, [
        'uCamRight', 'uCamUp', 'uCamForward', 'uTanHalfFov', 'uAspect',
        'uSunDir', 'uMapMix', 'uGolden', 'uValley', 'uSkyZenith', 'uSkyHorizon',
      ]),
      skyVao,

      terrainProg,
      terrainU: getUniforms(gl, terrainProg, [
        'uViewProj', 'uRelief', 'uCamPos', 'uSunDir', 'uHeightTex',
        'uWorldSize', 'uMaxTexHeight', 'uWaterLevel', 'uMapMix', 'uGolden',
        'uFogDensity', 'uSkyZenith', 'uSkyHorizon',
      ]),
      terrainVao,
      terrainIndexCount: td.indices.length,
      buffers: [posBuf, normBuf, geoBuf, idxBuf, wPosBuf, wIdxBuf, cPosBuf, cIdxBuf],

      waterProg,
      waterU: getUniforms(gl, waterProg, [
        'uViewProj', 'uRelief', 'uCamPos', 'uSunDir', 'uHeightTex',
        'uWorldSize', 'uMaxTexHeight', 'uWaterLevel', 'uMapMix', 'uGolden',
        'uTime', 'uFogDensity', 'uSkyZenith', 'uSkyHorizon',
      ]),
      waterVao,
      waterIndexCount: this.waterData.indices.length,

      cloudProg,
      cloudU: getUniforms(gl, cloudProg, [
        'uViewProj', 'uAltitudeOffset', 'uCamPos', 'uSunDir', 'uHeightTex',
        'uWorldSize', 'uMaxTexHeight', 'uRelief', 'uMapMix', 'uGolden',
        'uTime', 'uCloudAlpha', 'uLayerSeed',
      ]),
      cloudVao,
      cloudIndexCount: this.cloudLower.indices.length,

      heightTex,
    };
  }

  setQuality(mode) {
    const next = mode === 'low' ? 'low' : 'high';
    if (next === this.quality) return;
    this.quality = next;
    this.stageEl.setAttribute('data-rendered-quality', this.quality);
    if (this.gl && !this.contextLost) {
      this._destroyResources();
      this._initResources();
    }
  }

  resizeIfNeeded(isMoving = false) {
    const rect = this.stageEl.getBoundingClientRect();
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height));

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
      0.35,
      240.0
    );

    const r = this.resources;
    gl.viewport(0, 0, pxW, pxH);
    gl.depthMask(true);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // 1. Sky Pass (depth test off, write off)
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.BLEND);
    gl.useProgram(r.skyProg);
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

    // Bind shared heightfield texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, r.heightTex);

    // 2. Terrain Pass
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.useProgram(r.terrainProg);
    gl.bindVertexArray(r.terrainVao);
    gl.uniformMatrix4fv(r.terrainU.uViewProj, false, viewProj);
    gl.uniform1f(r.terrainU.uRelief, state.relief);
    gl.uniform3fv(r.terrainU.uCamPos, state.pos);
    gl.uniform3fv(r.terrainU.uSunDir, state.sunDir);
    gl.uniform1i(r.terrainU.uHeightTex, 0);
    gl.uniform1f(r.terrainU.uWorldSize, WORLD_SIZE);
    gl.uniform1f(r.terrainU.uMaxTexHeight, this.terrainData.maxTexHeight);
    gl.uniform1f(r.terrainU.uWaterLevel, WATER_LEVEL);
    gl.uniform1f(r.terrainU.uMapMix, state.mapMix);
    gl.uniform1f(r.terrainU.uGolden, state.goldenWeight);
    gl.uniform1f(r.terrainU.uFogDensity, state.fogDensity);
    gl.uniform3fv(r.terrainU.uSkyZenith, state.skyZenith);
    gl.uniform3fv(r.terrainU.uSkyHorizon, state.skyHorizon);
    gl.drawElements(gl.TRIANGLES, r.terrainIndexCount, gl.UNSIGNED_INT, 0);

    // 3. Glacial Lake Water Pass
    if (state.relief > 0.27 && state.mapMix < 0.78) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);

      gl.useProgram(r.waterProg);
      gl.bindVertexArray(r.waterVao);
      gl.uniformMatrix4fv(r.waterU.uViewProj, false, viewProj);
      gl.uniform1f(r.waterU.uRelief, state.relief);
      gl.uniform3fv(r.waterU.uCamPos, state.pos);
      gl.uniform3fv(r.waterU.uSunDir, state.sunDir);
      gl.uniform1i(r.waterU.uHeightTex, 0);
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

    // 4. Layered Atmospheric Cloud Deck Pass
    if (state.cloudAlpha > 0.01 && state.relief > 0.45 && state.mapMix < 0.65) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);

      gl.useProgram(r.cloudProg);
      gl.bindVertexArray(r.cloudVao);
      gl.uniformMatrix4fv(r.cloudU.uViewProj, false, viewProj);
      gl.uniform3fv(r.cloudU.uCamPos, state.pos);
      gl.uniform3fv(r.cloudU.uSunDir, state.sunDir);
      gl.uniform1i(r.cloudU.uHeightTex, 0);
      gl.uniform1f(r.cloudU.uWorldSize, WORLD_SIZE);
      gl.uniform1f(r.cloudU.uMaxTexHeight, this.terrainData.maxTexHeight);
      gl.uniform1f(r.cloudU.uRelief, state.relief);
      gl.uniform1f(r.cloudU.uMapMix, state.mapMix);
      gl.uniform1f(r.cloudU.uGolden, state.goldenWeight);
      gl.uniform1f(r.cloudU.uTime, timeSec);
      gl.uniform1f(r.cloudU.uCloudAlpha, state.cloudAlpha);

      // Lower valley stratus layer
      gl.uniform1f(r.cloudU.uAltitudeOffset, 0.0);
      gl.uniform1f(r.cloudU.uLayerSeed, 1.0);
      gl.drawElements(gl.TRIANGLES, r.cloudIndexCount, gl.UNSIGNED_SHORT, 0);

      // Upper ridge stratus layer
      gl.uniform1f(r.cloudU.uAltitudeOffset, 2.6);
      gl.uniform1f(r.cloudU.uLayerSeed, 2.7);
      gl.drawElements(gl.TRIANGLES, r.cloudIndexCount, gl.UNSIGNED_SHORT, 0);

      gl.enable(gl.CULL_FACE);
    }

    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);

    this.drawCount++;
    this.stageEl.setAttribute('data-draws', String(this.drawCount));
    this.stageEl.setAttribute('data-rendered-progress', state.progress.toFixed(4));
    this.stageEl.setAttribute('data-rendered-chapter', state.chapter.id);
    this.stageEl.dataset.cameraClearance=(state.pos[1]-this.sampleTerrainHeight(state.pos[0],state.pos[2])*state.relief).toFixed(4);

    return state;
  }

  _destroyResources() {
    const gl = this.gl;
    const r = this.resources;
    if (!gl || !r) return;
    gl.deleteProgram(r.skyProg);
    gl.deleteProgram(r.terrainProg);
    gl.deleteProgram(r.waterProg);
    gl.deleteProgram(r.cloudProg);
    gl.deleteVertexArray(r.skyVao);
    gl.deleteVertexArray(r.terrainVao);
    gl.deleteVertexArray(r.waterVao);
    gl.deleteVertexArray(r.cloudVao);
    for (const buf of r.buffers) gl.deleteBuffer(buf);
    gl.deleteTexture(r.heightTex);
    this.resources = null;
  }

  dispose() {
    this.disposed = true;
    this.canvas.removeEventListener('webglcontextlost', this._onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this._onContextRestored);
    this._destroyResources();
  }
}
