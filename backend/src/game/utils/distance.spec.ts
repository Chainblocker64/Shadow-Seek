import { isWithinVisionRange } from './distance';
import { Position } from '../types';

describe('isWithinVisionRange', () => {
  const center: Position = { x: 5, y: 5 };
  const visionRange = 3;

  it('returns true for position at center', () => {
    expect(isWithinVisionRange(center, { x: 5, y: 5 }, visionRange)).toBe(true);
  });

  it('returns true for positions inside range', () => {
    expect(isWithinVisionRange(center, { x: 8, y: 5 }, visionRange)).toBe(true);
    expect(isWithinVisionRange(center, { x: 2, y: 2 }, visionRange)).toBe(true);
  });

  it('returns false for positions outside range', () => {
    expect(isWithinVisionRange(center, { x: 9, y: 5 }, visionRange)).toBe(
      false,
    );
    expect(isWithinVisionRange(center, { x: 8, y: 9 }, visionRange)).toBe(
      false,
    );
  });
});
