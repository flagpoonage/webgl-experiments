
#ifdef GL_ES
precision highp float;
#endif

// The texture.
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_pixel;

void main() {
  float mid_step = u_pixel * 0.5;
  float trans_x = 1.0 / u_resolution.x;
  float trans_y = 1.0 / u_resolution.y;
  
  float nearest_x_pixel = (floor(gl_FragCoord.x / u_pixel) * u_pixel) + mid_step;
  float nearest_y_pixel = (floor(gl_FragCoord.y / u_pixel) * u_pixel) + mid_step;

  float alpha = min(
    step(1.0, mod(gl_FragCoord.x, u_pixel)), 
    step(1.0, mod(gl_FragCoord.y, u_pixel)));

  gl_FragColor = texture2D(u_texture, vec2(
    nearest_x_pixel * trans_x, 
    nearest_y_pixel * trans_y)) * alpha;
}