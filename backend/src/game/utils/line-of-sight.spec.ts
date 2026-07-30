import { hasLineOfSight } from './line-of-sight';
import { MapObject } from '../types';

describe('hasLineOfSight', () => {
  const source = { x: 0, y: 0 };

  it('returns true when there are no objects between source and target', () => {
    const target = { x: 3, y: 0 };
    const objects: MapObject[] = [];

    expect(hasLineOfSight(source, target, objects)).toBe(true);
  });

  it('returns false when a wall blocks the line of sight', () => {
    const target = { x: 3, y: 0 };
    const objects: MapObject[] = [{ x: 1, y: 0, type: 'wall' }];

    expect(hasLineOfSight(source, target, objects)).toBe(false);
  });

  it('returns false when a tree blocks the line of sight', () => {
    const target = { x: 0, y: 3 };
    const objects: MapObject[] = [{ x: 0, y: 2, type: 'tree' }];

    expect(hasLineOfSight(source, target, objects)).toBe(false);
  });

  it('returns false when a rock blocks the line of sight on a diagonal', () => {
    const target = { x: 2, y: 2 };
    const objects: MapObject[] = [{ x: 1, y: 1, type: 'rock' }];

    expect(hasLineOfSight(source, target, objects)).toBe(false);
  });

  it('returns true if a blocking object is off to the side, not in the direct path', () => {
    const target = { x: 3, y: 0 };
    const objects: MapObject[] = [{ x: 1, y: 1, type: 'wall' }];

    expect(hasLineOfSight(source, target, objects)).toBe(true);
  });

  it('returns true when a chest is between source and target', () => {
    const target = { x: 3, y: 0 };
    const objects: MapObject[] = [{ x: 1, y: 0, type: 'chest' }];

    expect(hasLineOfSight(source, target, objects)).toBe(true);
  });

  it('returns true when water is between source and target', () => {
    const target = { x: 3, y: 0 };
    const objects: MapObject[] = [{ x: 1, y: 0, type: 'water' }];

    expect(hasLineOfSight(source, target, objects)).toBe(true);
  });
});
