attribute vec2 aVertexPosition;

uniform vec2 u_rotation;

void main() {
  vec2 rotatedPosition = vec2(
    aVertexPosition.x * u_rotation.y +
          aVertexPosition.y * u_rotation.x,
    aVertexPosition.y * u_rotation.y -
          aVertexPosition.x * u_rotation.x
  );

  gl_Position = vec4(rotatedPosition, 0.0, 1.0);
  // gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}