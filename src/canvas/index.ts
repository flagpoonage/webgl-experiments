import { getCanvas } from './element';
import vertShaderContent from './shaders/a.vert';
import fragShaderContent from './shaders/a.frag';
import { Color } from './color';

console.log('Vert shader', vertShaderContent);
console.log('Frag shader', fragShaderContent);

const dims = {
  width: 0,
  height: 0,
};

export interface ProgramData {
  program: WebGLProgram;
  context: WebGL2RenderingContext;
}

export function runTriangle() {
  const cx = getCanvas();
  const gl = cx.getContext('webgl2');

  if (!gl) {
    return console.error('Unable to load webgl2 contex in canvas');
  }

  dims.width = cx.width;
  dims.height = cx.height;

  gl.viewport(0, 0, cx.height, cx.width);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.enable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);

  const program = configureProgram(gl);

  if (!program) {
    throw new Error('Missing program');
  }

  const data: ProgramData = {
    program,
    context: gl,
  };

  draw(data);
}

function configureProgram(gl: WebGL2RenderingContext) {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertShader) {
    console.error('Unable to created vertex shader');
    return;
  }

  gl.shaderSource(vertShader, vertShaderContent);
  gl.compileShader(vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragShader) {
    console.error('Unable to create fragment shader');
    return;
  }

  gl.shaderSource(fragShader, fragShaderContent);
  gl.compileShader(fragShader);

  const program = gl.createProgram();

  if (!program) {
    throw new Error('Unable to create GL program');
  }

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  return program;
}

/*
 0, 0 => -1, -1
 250, 250 => 0, 0
 500, 500 => 1, 1
 125, 125 => -0.5, -0.5;
 325, 325 => 0.5, 0.5

 Given [a,b] -> Shift backwards (width / 2)
 [125, 125] -> Shift backwards (250) -> [-125, -125]
 Given shifted [a,b] -> Divide by hald space (width / 2)
 [-125, -125] -> Divide by (250) -> [-0.5, -0.5];

 */

function draw(data: ProgramData) {
  const { context: gl, program } = data;

  // look up where the vertex data needs to go.
  const color_uniform = gl.getUniformLocation(program, 'uColor');
  const positionAttributeLocation = gl.getAttribLocation(
    program,
    'aVertexPosition'
  );

  // Create a buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [0, 0, 0, 0.5, 0.7, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.uniform4fv(color_uniform, Color.GREEN);
  // code above this line is initialization code.
  // code below this line is rendering code.

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2; // 2 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    0
  );
  // draw
  const primitiveType = gl.TRIANGLES;

  const count = 3;
  gl.drawArrays(primitiveType, 0, count);
}
