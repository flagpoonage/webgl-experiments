attribute vec2 aVertexPosition;
// out vec2 fragment_coord;

void main() {
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
  // fragment_coord = aVertexPosition;
}