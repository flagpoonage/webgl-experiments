import { Color } from './color';
import { Rectangle } from './rectangle';
import { RGBA, XY, XY4 } from './types';

export class Pixel {
  private _position: XY;
  private _pixelSize: number;
  private _screenDimensions: XY;
  private _rectangle: Rectangle;
  private _coordinates: XY4;
  private _color: RGBA;

  get position() {
    return this._position;
  }

  constructor(position: XY, screenDimensions: XY, pixelSize: number) {
    this._color = Color.WHITE;
    this._position = position;
    this._pixelSize = pixelSize;
    this._screenDimensions = screenDimensions;
    this._coordinates = this.getCoordinates();
    this._rectangle = new Rectangle(this._coordinates, this._color);
  }

  setColor = (color: RGBA) => {
    this._color = color;
    this._rectangle.color = this._color;
  };

  private getCoordinates = (): XY4 => {
    const [grid_x, grid_y] = this._position;

    const coord_x = -1 + this._pixelSize / 2 + grid_x * this._pixelSize;
    const coord_y = 1 - this._pixelSize / 2 - grid_y * this._pixelSize;

    return [
      [coord_x, coord_y],
      [coord_x + this._pixelSize, coord_y],
      [coord_x + this._pixelSize, coord_y + this._pixelSize],
      [coord_x, coord_y + this._pixelSize],
    ];
  };
}

// [
//   [0, 0], [1, 0], [2, 0], [3, 0],
//   [0, 1], [1, 1], [2, 1], [3, 1],
//   [0, 2], [1, 2], [2, 2], [3, 2],
//   [0, 3], [1, 3], [2, 3], [3, 3],
// ]

// [
//   [-1, -1], [-0.5, -1], [0, -1], [0.5, -1],
//   [-1, -0.5], [-0.5, -0.5], [0, -0.5], [0.5, -0.5],
//   [-1, 0], [-0.5, 0], [0, 0], [0.5, 0],
//   [-1, 0.5], [-0.5, 0.5], [0, 0.5], [0.5, 0.5],
// ]
