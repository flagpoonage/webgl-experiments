import { RGBA } from './types';

export type ColorName = 'RED' | 'GREEN' | 'BLUE' | 'BLACK' | 'WHITE';

export const Color: Record<ColorName, RGBA> = {
  RED: [1, 0, 0, 1],
  GREEN: [0, 1, 0, 1],
  BLUE: [0, 0, 1, 1],
  BLACK: [0, 0, 0, 1],
  WHITE: [1, 1, 1, 1],
};
