import { RGBA, XY3, XYZ_3 } from './types';

export class Triangle {
  vertices: XY3;
  color: RGBA;

  constructor(vertices: XY3, color: RGBA) {
    this.vertices = vertices;
    this.color = color;
  }
}
