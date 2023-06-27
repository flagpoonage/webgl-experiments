import { Triangle } from './triangle';
import { RGBA, XY4, XYZ_4 } from './types';

export class Rectangle {
  coordinates: XY4;
  color: RGBA;

  private _triangles: [Triangle, Triangle] | null = null;

  constructor(coordinates: XY4, color: RGBA) {
    this.coordinates = coordinates;
    this.color = color;
  }

  get triangles() {
    if (!this._triangles) {
      this._triangles = this.createTriangles();
    }

    return this._triangles;
  }

  private createTriangles(): [Triangle, Triangle] {
    return [
      new Triangle(
        [this.coordinates[0], this.coordinates[1], this.coordinates[2]],
        this.color
      ),
      new Triangle(
        [this.coordinates[1], this.coordinates[2], this.coordinates[3]],
        this.color
      ),
    ];
  }
}
