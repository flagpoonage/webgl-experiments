
#ifdef GL_ES
precision highp float;
#endif

// uniform vec2 u_rotation;
uniform vec2 u_resolution;

void main() {
  float x_step = 1.0 / u_resolution.x;
  float y_step = 1.0 / u_resolution.y;

  float rgb_step = 1.0 / 255.0;

gl_FragColor = vec4(
  x_step * gl_FragCoord.x, 
  y_step * gl_FragCoord.y, 
  max(x_step * gl_FragCoord.x, y_step * gl_FragCoord.y),
  1.0
);

  // gl_FragColor = vec4(
  //   181.0 * rgb_step,
  //   0.0,
  //   1381.0 * rgb_step,
  //   1.0);
} 