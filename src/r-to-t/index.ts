import screenPointVert from './shaders/screen-point.vert';
import screenPointFrag from './shaders/screen-point.frag';
import pixelateFrag from './shaders/pixelate.frag';
import pixelateVert from './shaders/pixelate.vert';
import { configureProgram } from '../program';
import { getCanvas } from '../canvas/element';

interface SceneData {
  gl: WebGL2RenderingContext;
  geoProgram: WebGLProgram;
  pixelateProgram: WebGLProgram;
  geoTexture: WebGLTexture;
  geoFramebuffer: WebGLFramebuffer;
  geometry: WebGLBuffer;
  canvasBuffer: WebGLBuffer;
  width: number;
  height: number;
  start_time: number;
  current_angle: number;
  attribs: {
    geometryVertexPosition: number;
    canvasVertexPosition: number;
    canvasTexturePosition: WebGLUniformLocation;
    rotationVectorPosition: WebGLUniformLocation;
    geoResVectorPosition: WebGLUniformLocation;
    pixelResVectorPosition: WebGLUniformLocation;
    pixelSizePosition: WebGLUniformLocation;
  };
}

const state = {
  scene: null as SceneData | null,
  pixelation: 3,
};

export function runRenderToTexture() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      state.pixelation += 2;
    } else if (e.key === 'ArrowDown') {
      state.pixelation -= 2;
      state.pixelation = state.pixelation < 3 ? 3 : state.pixelation;
    }
  });
  const cx = getCanvas();
  const gl = cx.getContext('webgl2');

  if (!gl) {
    return console.error('Unable to load webgl2 contex in canvas');
  }

  gl.enable(gl.BLEND);

  const rect = cx.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // gl.viewport(0, 0, cx.height, cx.width);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  // gl.enable(gl.BLEND);

  const geoProgram = configureProgram(gl, {
    vert: screenPointVert,
    frag: screenPointFrag,
  });

  if (!geoProgram) {
    throw new Error('Failed to create the geometry program');
  }

  const pixelateProgram = configureProgram(gl, {
    vert: pixelateVert,
    frag: pixelateFrag,
  });

  if (!pixelateProgram) {
    console.error('Failed creating the pixellate program');
    return;
  }
  // gl.disable(gl.DEPTH_TEST);

  const geometryVertexPosition = gl.getAttribLocation(
    geoProgram,
    'aVertexPosition'
  );

  const canvasVertexPosition = gl.getAttribLocation(
    pixelateProgram,
    'aVertexPosition'
  );

  const canvasTexturePosition = gl.getUniformLocation(
    pixelateProgram,
    'u_texture'
  );

  const rotationVectorPosition = gl.getUniformLocation(
    geoProgram,
    'u_rotation'
  );

  const pixelResVectorPosition = gl.getUniformLocation(
    pixelateProgram,
    'u_resolution'
  );

  const geoResVectorPosition = gl.getUniformLocation(
    geoProgram,
    'u_resolution'
  );

  const pixelSizePosition = gl.getUniformLocation(pixelateProgram, 'u_pixel');

  if (
    !canvasTexturePosition ||
    !rotationVectorPosition ||
    !pixelResVectorPosition ||
    !geoResVectorPosition ||
    !pixelSizePosition
  ) {
    throw new Error('Missing location information');
  }

  const canvasBuffer = createCanvasBuffer(gl);
  const geometry = createGeometryBuffer(gl);
  const texture = createTexture(gl, width, height);
  const framebuffer = createFramebuffer(gl, texture);

  state.scene = {
    gl: gl,
    geoProgram,
    pixelateProgram,
    canvasBuffer,
    geoTexture: texture,
    geoFramebuffer: framebuffer,
    geometry,
    width,
    height,
    start_time: 0,
    current_angle: 0,
    attribs: {
      canvasTexturePosition,
      geometryVertexPosition,
      canvasVertexPosition,
      rotationVectorPosition,
      pixelSizePosition,
      pixelResVectorPosition,
      geoResVectorPosition,
    },
  };

  loop();
}

function createTexture(
  gl: WebGL2RenderingContext,
  width: number,
  height: number
) {
  const texture = gl.createTexture();

  if (!texture) {
    throw new Error('Failed ot create texture');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return texture;
}

function createFramebuffer(gl: WebGL2RenderingContext, texture: WebGLTexture) {
  const fb = gl.createFramebuffer();

  if (!fb) {
    throw new Error('Failed to create framebuffer');
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    attachmentPoint,
    gl.TEXTURE_2D,
    texture,
    0
  );

  return fb;
}

export function createGeometryBuffer(gl: WebGL2RenderingContext) {
  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();

  if (!positionBuffer) {
    throw new Error('Failed to create geometry buffer');
  }

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // const positions = [-0.1, 0, 0, 0.5, 0.7, 0.1];
  const positions = [
    0, 0, 0, -0.7, -0.7, -0.7,

    0, 0, 0, 0.7, 0.7, 0.7,

    0, 0, -0.7, 0, -0.7, 0.7,

    0, 0, 0.7, -0.7, 0.7, 0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

export function createCanvasBuffer(gl: WebGL2RenderingContext) {
  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();

  if (!positionBuffer) {
    throw new Error('Failed to create canvas buffer');
  }

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

export function loop() {
  const scene = state.scene;

  if (!scene) {
    throw new Error('Missing scene information');
  }

  const current_time = new Date().getTime();

  if (scene.start_time === 0) {
    scene.start_time = current_time;
  }

  const next_time = current_time - scene.start_time;
  scene.start_time = current_time;

  const DEGREES_PER_SECOND = 20;
  const next_time_seconds = next_time * 0.001;

  const delta_angle = next_time_seconds * DEGREES_PER_SECOND;
  const new_angle = (scene.current_angle + delta_angle) % 360;

  scene.current_angle = new_angle;

  drawTriangle(scene);
  drawCanvas(scene);
  requestAnimationFrame(loop);
}

export function drawCanvas(scene: SceneData) {
  const { gl } = scene;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, scene.geoTexture);
  gl.viewport(0, 0, scene.width, scene.height);
  gl.clearColor(1, 1, 1, 1); // clear to white
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(scene.pixelateProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, scene.canvasBuffer);
  gl.enableVertexAttribArray(scene.attribs.canvasVertexPosition);
  gl.vertexAttribPointer(
    scene.attribs.canvasVertexPosition,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  const primitiveType = gl.TRIANGLES;

  // Tell the shader to use texture unit 0 for u_texture
  gl.uniform1i(scene.attribs.canvasTexturePosition, 0);
  gl.uniform2fv(
    scene.attribs.pixelResVectorPosition,
    new Float32Array([scene.width, scene.height])
  );
  gl.uniform1f(scene.attribs.pixelSizePosition, state.pixelation);

  const count = 6;
  gl.drawArrays(primitiveType, 0, count);
}

export function drawTriangle(scene: SceneData) {
  const { gl, geoProgram } = scene;
  gl.bindFramebuffer(gl.FRAMEBUFFER, scene.geoFramebuffer);
  // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, scene.width, scene.height);
  gl.clearColor(0, 0, 0, 1); // clear to blue
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(geoProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, scene.geometry);
  gl.enableVertexAttribArray(scene.attribs.geometryVertexPosition);
  gl.vertexAttribPointer(
    scene.attribs.geometryVertexPosition,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  const radians = (scene.current_angle * Math.PI) / 180.0;

  gl.uniform2fv(
    scene.attribs.rotationVectorPosition,
    new Float32Array([Math.sin(radians), Math.cos(radians)])
  );
  gl.uniform2fv(
    scene.attribs.geoResVectorPosition,
    new Float32Array([scene.width, scene.height])
  );
  gl.drawArrays(gl.TRIANGLES, 0, 12);
}
