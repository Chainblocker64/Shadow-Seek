import { randomUUID } from 'node:crypto';
import { canMoveToPosition } from './movement-validation';
import { Player } from '../player/player';
import { WAITING } from '../consts';
import type { GameMap, GameState } from '../types';

describe('canMoveToPosition', () => {
  const testMap: GameMap = {
    name: 'Test map',
    width: 5,
    height: 5,
    baseTile: 'floor',
    baseOverrides: [],
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
      {
        x: 2,
        y: 2,
        type: 'bush',
      },
      {
        x: 3,
        y: 2,
        type: 'chest',
      },
      {
        x: 4,
        y: 2,
        type: 'water',
      },
    ],
  };

  function createGameState(players: GameState['players'] = []): GameState {
    return {
      roomId: randomUUID(),
      status: WAITING,
      map: testMap,
      players,
      endsAt: null,
      winner: null,
    };
  }

  it('allows movement to a floor tile', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 0,
      y: 0,
    });

    expect(result).toBe(true);
  });

  it('allows movement to a spawn tile', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 1,
      y: 1,
    });

    expect(result).toBe(true);
  });

  it('allows movement to a bush tile', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 2,
      y: 2,
    });

    expect(result).toBe(true);
  });

  it('rejects movement into a wall tile', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 2,
      y: 1,
    });

    expect(result).toBe(false);
  });

  it('rejects movement into a tree tile', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 3,
      y: 1,
    });

    expect(result).toBe(false);
  });

  it('rejects movement into a rock tile', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 1,
      y: 2,
    });

    expect(result).toBe(false);
  });

  it('rejects movement into a chest tile', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 3,
      y: 2,
    });

    expect(result).toBe(false);
  });

  it('rejects movement into a water tile', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 4,
      y: 2,
    });

    expect(result).toBe(false);
  });

  it('rejects movement outside the left map boundary', () => {
    const result = canMoveToPosition(createGameState(), {
      x: -1,
      y: 0,
    });

    expect(result).toBe(false);
  });

  it('rejects movement outside the top map boundary', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 0,
      y: -1,
    });

    expect(result).toBe(false);
  });

  it('rejects movement outside the right map boundary', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 5,
      y: 0,
    });

    expect(result).toBe(false);
  });

  it('rejects movement outside the bottom map boundary', () => {
    const result = canMoveToPosition(createGameState(), {
      x: 0,
      y: 5,
    });

    expect(result).toBe(false);
  });

  it('rejects movement onto a tile occupied by another player', () => {
    const occupyingPlayer = new Player({
      clientId: 'player-2',
      name: 'Bob',
      position: { x: 0, y: 0 },
      facingDirection: 'down',
    });

    const result = canMoveToPosition(createGameState([occupyingPlayer]), {
      x: 0,
      y: 0,
    });

    expect(result).toBe(false);
  });
});
