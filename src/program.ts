export function configureProgram(
  gl: WebGL2RenderingContext,
  shaders: { vert: string; frag: string }
) {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertShader) {
    throw new Error('Cannot read vert shader');
  }

  gl.shaderSource(vertShader, shaders.vert);
  gl.compileShader(vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragShader) {
    throw new Error('Cannot read frag shader');
  }

  gl.shaderSource(fragShader, shaders.frag);
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
