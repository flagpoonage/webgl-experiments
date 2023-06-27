// src/r-to-t/shaders/screen-point.vert
var screen_point_default = "attribute vec2 aVertexPosition;\n\nuniform vec2 u_rotation;\n\nvoid main() {\n  vec2 rotatedPosition = vec2(\n    aVertexPosition.x * u_rotation.y +\n          aVertexPosition.y * u_rotation.x,\n    aVertexPosition.y * u_rotation.y -\n          aVertexPosition.x * u_rotation.x\n  );\n\n  gl_Position = vec4(rotatedPosition, 0.0, 1.0);\n  // gl_Position = vec4(aVertexPosition, 0.0, 1.0);\n}";

// src/r-to-t/shaders/screen-point.frag
var screen_point_default2 = "\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform vec2 u_rotation;\nuniform vec2 u_resolution;\n\nvoid main() {\n  float x_step = 1.0 / u_resolution.x;\n  float y_step = 1.0 / u_resolution.y;\n\n  float rgb_step = 1.0 / 255.0;\n\ngl_FragColor = vec4(\n  x_step * gl_FragCoord.x, \n  y_step * gl_FragCoord.y, \n  max(x_step * gl_FragCoord.x, y_step * gl_FragCoord.y),\n  1.0\n);\n\n  // gl_FragColor = vec4(\n  //   181.0 * rgb_step,\n  //   0.0,\n  //   1381.0 * rgb_step,\n  //   1.0);\n} ";

// src/r-to-t/shaders/pixelate.frag
var pixelate_default = "\n#ifdef GL_ES\nprecision highp float;\n#endif\n\n// The texture.\nuniform sampler2D u_texture;\nuniform vec2 u_resolution;\nuniform float u_pixel;\n\nvoid main() {\n  float mid_step = u_pixel * 0.5;\n  float trans_x = 1.0 / u_resolution.x;\n  float trans_y = 1.0 / u_resolution.y;\n  \n  float nearest_x_pixel = (floor(gl_FragCoord.x / u_pixel) * u_pixel) + mid_step;\n  float nearest_y_pixel = (floor(gl_FragCoord.y / u_pixel) * u_pixel) + mid_step;\n\n  float alpha = min(\n    step(1.0, mod(gl_FragCoord.x, u_pixel)), \n    step(1.0, mod(gl_FragCoord.y, u_pixel)));\n\n  gl_FragColor = texture2D(u_texture, vec2(\n    nearest_x_pixel * trans_x, \n    nearest_y_pixel * trans_y)) * alpha;\n}";

// src/r-to-t/shaders/pixelate.vert
var pixelate_default2 = "\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nattribute vec2 aVertexPosition;\n\nvoid main() {\n  gl_Position = vec4(aVertexPosition, 0.0, 1.0);\n}";

// src/program.ts
function configureProgram(gl, shaders) {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertShader) {
    throw new Error("Cannot read vert shader");
  }
  gl.shaderSource(vertShader, shaders.vert);
  gl.compileShader(vertShader);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragShader) {
    throw new Error("Cannot read frag shader");
  }
  gl.shaderSource(fragShader, shaders.frag);
  gl.compileShader(fragShader);
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Unable to create GL program");
  }
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  return program;
}

// src/canvas/element.ts
var CANVAS_ID = "canvas";
function getCanvas() {
  const existing_canvas = document.getElementById(CANVAS_ID);
  if (existing_canvas && existing_canvas instanceof HTMLCanvasElement) {
    return existing_canvas;
  }
  if (existing_canvas) {
    existing_canvas.remove();
  }
  const rect = document.documentElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const cx = document.createElement("canvas");
  cx.height = height;
  cx.width = width;
  cx.id = CANVAS_ID;
  document.body.appendChild(cx);
  return cx;
}

// src/r-to-t/index.ts
var state = {
  scene: null,
  pixelation: 3
};
function runRenderToTexture() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      state.pixelation += 2;
    } else if (e.key === "ArrowDown") {
      state.pixelation -= 2;
      state.pixelation = state.pixelation < 3 ? 3 : state.pixelation;
    }
  });
  const cx = getCanvas();
  const gl = cx.getContext("webgl2");
  if (!gl) {
    return console.error("Unable to load webgl2 contex in canvas");
  }
  gl.enable(gl.BLEND);
  const rect = cx.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const geoProgram = configureProgram(gl, {
    vert: screen_point_default,
    frag: screen_point_default2
  });
  if (!geoProgram) {
    throw new Error("Failed to create the geometry program");
  }
  const pixelateProgram = configureProgram(gl, {
    vert: pixelate_default2,
    frag: pixelate_default
  });
  if (!pixelateProgram) {
    console.error("Failed creating the pixellate program");
    return;
  }
  const geometryVertexPosition = gl.getAttribLocation(
    geoProgram,
    "aVertexPosition"
  );
  const canvasVertexPosition = gl.getAttribLocation(
    pixelateProgram,
    "aVertexPosition"
  );
  const canvasTexturePosition = gl.getUniformLocation(
    pixelateProgram,
    "u_texture"
  );
  const rotationVectorPosition = gl.getUniformLocation(
    geoProgram,
    "u_rotation"
  );
  const pixelResVectorPosition = gl.getUniformLocation(
    pixelateProgram,
    "u_resolution"
  );
  const geoResVectorPosition = gl.getUniformLocation(
    geoProgram,
    "u_resolution"
  );
  const pixelSizePosition = gl.getUniformLocation(pixelateProgram, "u_pixel");
  if (!canvasTexturePosition || !rotationVectorPosition || !pixelResVectorPosition || !geoResVectorPosition || !pixelSizePosition) {
    throw new Error("Missing location information");
  }
  const canvasBuffer = createCanvasBuffer(gl);
  const geometry = createGeometryBuffer(gl);
  const texture = createTexture(gl, width, height);
  const framebuffer = createFramebuffer(gl, texture);
  state.scene = {
    gl,
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
      geoResVectorPosition
    }
  };
  loop();
}
function createTexture(gl, width, height) {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error("Failed ot create texture");
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
function createFramebuffer(gl, texture) {
  const fb = gl.createFramebuffer();
  if (!fb) {
    throw new Error("Failed to create framebuffer");
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
function createGeometryBuffer(gl) {
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    throw new Error("Failed to create geometry buffer");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    0,
    0,
    0,
    -0.7,
    -0.7,
    -0.7,
    0,
    0,
    0,
    0.7,
    0.7,
    0.7,
    0,
    0,
    -0.7,
    0,
    -0.7,
    0.7,
    0,
    0,
    0.7,
    -0.7,
    0.7,
    0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
}
function createCanvasBuffer(gl) {
  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    throw new Error("Failed to create canvas buffer");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
}
function loop() {
  const scene = state.scene;
  if (!scene) {
    throw new Error("Missing scene information");
  }
  const current_time = (/* @__PURE__ */ new Date()).getTime();
  if (scene.start_time === 0) {
    scene.start_time = current_time;
  }
  const next_time = current_time - scene.start_time;
  scene.start_time = current_time;
  const DEGREES_PER_SECOND = 20;
  const next_time_seconds = next_time * 1e-3;
  const delta_angle = next_time_seconds * DEGREES_PER_SECOND;
  const new_angle = (scene.current_angle + delta_angle) % 360;
  scene.current_angle = new_angle;
  drawTriangle(scene);
  drawCanvas(scene);
  requestAnimationFrame(loop);
}
function drawCanvas(scene) {
  const { gl } = scene;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, scene.geoTexture);
  gl.viewport(0, 0, scene.width, scene.height);
  gl.clearColor(1, 1, 1, 1);
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
  gl.uniform1i(scene.attribs.canvasTexturePosition, 0);
  gl.uniform2fv(
    scene.attribs.pixelResVectorPosition,
    new Float32Array([scene.width, scene.height])
  );
  gl.uniform1f(scene.attribs.pixelSizePosition, state.pixelation);
  const count = 6;
  gl.drawArrays(primitiveType, 0, count);
}
function drawTriangle(scene) {
  const { gl, geoProgram } = scene;
  gl.bindFramebuffer(gl.FRAMEBUFFER, scene.geoFramebuffer);
  gl.viewport(0, 0, scene.width, scene.height);
  gl.clearColor(0, 0, 0, 1);
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
  const radians = scene.current_angle * Math.PI / 180;
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

// src/index.ts
document.addEventListener("DOMContentLoaded", () => {
  runRenderToTexture();
});
