
#ifdef GL_ES
precision highp float;
#endif

// uniform vec4 uColor;
// in vec2 fragment_coord;

// gl_FragColor should be [0-1]
// fl_FragCoord will be like [0-500] 

void main() {
  float colorstep = 1.0 / 500.0;
  float y_transp = step(1.0, mod(gl_FragCoord.y, 5.0)); 
  float x_transp = step(1.0, mod(gl_FragCoord.x, 5.0));
  float transp = min(y_transp, x_transp);

  gl_FragColor = vec4(gl_FragCoord.x * colorstep, gl_FragCoord.y * colorstep, gl_FragCoord.y * colorstep, transp);
  // gl_FragColor = gl_Position
}