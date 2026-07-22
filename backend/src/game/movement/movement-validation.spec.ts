import { canMoveToPosition } from './movement-validation';
import type { GameMap } from '../types';

describe('canMoveToPosition', () => {
  const testMap: GameMap = {
    width: 5,
    height: 5,
    baseTile: 'floor',
    objects: [
      {
        x: 1,
        y: 1,
        type: 'spawn',
      },
      {
        x: 2,
        y: 1,
        type: 'wall',
      },
      {
        x: 3,
        y: 1,
        type: 'tree',
      },
      {
        x: 1,
        y: 2,
        type: 'rock',
      },
    ],
  };

  it('allows movement to a floor tile', () => {
    const result = canMoveToPosition(testMap, {
      x: 0,
      y: 0,
    });

    expect(result).toBe(true);
  });

  it('allows movement to a spawn tile', () => {
    const result = canMoveToPosition(testMap, {
      x: 1,
      y: 1,
    });

    expect(result).toBe(true);
  });

  it('rejects movement into a wall tile', () => {
    const result = canMoveToPosition(testMap, {
      x: 2,
      y: 1,
    });

    expect(result).toBe(false);
  });

  it('rejects movement into a tree tile', () => {
    const result = canMoveToPosition(testMap, {
      x: 3,
      y: 1,
    });

    expect(result).toBe(false);
  });

  it('rejects movement into a rock tile', () => {
    const result = canMoveToPosition(testMap, {
      x: 1,
      y: 2,
    });

    expect(result).toBe(false);
  });

  it('rejects movement outside the left map boundary', () => {
    const result = canMoveToPosition(testMap, {
      x: -1,
      y: 0,
    });

    expect(result).toBe(false);
  });

  it('rejects movement outside the top map boundary', () => {
    const result = canMoveToPosition(testMap, {
      x: 0,
      y: -1,
    });

    expect(result).toBe(false);
  });

  it('rejects movement outside the right map boundary', () => {
    const result = canMoveToPosition(testMap, {
      x: 5,
      y: 0,
    });

    expect(result).toBe(false);
  });

  it('rejects movement outside the bottom map boundary', () => {
    const result = canMoveToPosition(testMap, {
      x: 0,
      y: 5,
    });

    expect(result).toBe(false);
  });
});
