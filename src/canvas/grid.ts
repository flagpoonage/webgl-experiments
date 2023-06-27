// import { Color } from './color';

import { Pixel } from './pixel';
import { XY } from './types';

// export function getGrid() {
//   return [
//     [Color.RED, null, null, null, null],
//     [null, Color.RED, null, Color.GREEN, Color.GREEN],
//     [null, null, Color.RED, null, Color.GREEN],
//     [Color.BLUE, null, null, Color.RED, Color.GREEN],
//     [Color.BLUE, null, null, null, Color.GREEN],
//   ] as (number[] | null)[][];
// }

// export function randomGrid(gridSize: number) {
//   const grid = [];
//   for (let y = 0; y < gridSize; y++) {
//     const row: (number[] | null)[] = [];
//     grid.push(row);
//     for (let x = 0; x < gridSize; x++) {
//       const rand = Math.random() * 4;
//       if (rand < 1) {
//         row.push(Color.RED);
//       }
//       if (rand < 2) {
//         row.push(Color.GREEN);
//       }
//       if (rand < 3) {
//         row.push(Color.BLUE);
//       } else {
//         row.push(null);
//       }
//     }
//     grid.push(row);
//   }

//   return grid;
// }

// export function getColor(v: number[]) {
//   if (v[0] === 1) {
//     return 'RED';
//   }
//   if (v[1] === 1) {
//     return 'GREEN';
//   }

//   if (v[2] === 1) {
//     return 'BLUE';
//   }

//   return 'NONE';
// }

export class ScreenGrid {
  private _screenSize: XY;
  private _gridSize: XY;
  private _pixelSize: number;
  private _grid: Pixel[][];

  get pixelSize() {
    return this._pixelSize;
  }

  get screenSize() {
    return this._screenSize;
  }

  get gridSize() {
    return this._gridSize;
  }

  constructor(gridSize: XY, screenSize: XY) {
    this._gridSize = gridSize;
    this._screenSize = screenSize;
    const [screenWidth, screenHeight] = this._screenSize;
    const [gridWidth, gridHeight] = this._gridSize;

    this._pixelSize = this.getPixelSize();
    this._grid = this.createGrid();
  }

  private getPixelSize = () => {
    const max_width = this._screenSize[0] / this._gridSize[0];
    const max_height = this._screenSize[1] / this._gridSize[1];

    return Math.min(max_width, max_height);
  };

  private createGrid = () => {
    const grid: Pixel[][] = [];

    const [grid_w, grid_h] = this._gridSize;

    for (let y = 0; y < grid_h; y++) {
      for (let x = 0; x < grid_w; x++) {
        grid[x] = grid[x] ?? [];
        grid[x][y] = new Pixel([x, y], this._screenSize, this._pixelSize);
      }
    }

    return grid;
  };
}
