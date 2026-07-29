import { Position } from '../types';

export function isWithinVisionRange(
  source: Position,
  target: Position,
  visionRange: number,
): boolean {
  const dx = Math.abs(source.x - target.x);
  const dy = Math.abs(source.y - target.y);

  return Math.max(dx, dy) <= visionRange;
}
