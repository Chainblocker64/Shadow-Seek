import { calculateNextPosition, handlePlayerMovement } from './server-movement';
import { describe, expect, it } from '@jest/globals';
import { randomUUID } from 'node:crypto';
import type { GameState, MovementDirection, Position } from '../types';
import { WAITING } from '../consts';
import { Player } from '../player/player';

describe('calculateNextPosition', () => {
  it('calculates the next position for up', () => {
    const result = calculateNextPosition(
      {
        x: 2,
        y: 2,
      },
      'up',
    );

    expect(result).toEqual({
      x: 2,
      y: 1,
    });
  });

  it('calculates the next position for down', () => {
    const result = calculateNextPosition(
      {
        x: 2,
        y: 2,
      },
      'down',
    );

    expect(result).toEqual({
      x: 2,
      y: 3,
    });
  });

  it('calculates the next position for left', () => {
    const result = calculateNextPosition(
      {
        x: 2,
        y: 2,
      },
      'left',
    );

    expect(result).toEqual({
      x: 1,
      y: 2,
    });
  });

  it('calculates the next position for right', () => {
    const result = calculateNextPosition(
      {
        x: 2,
        y: 2,
      },
      'right',
    );

    expect(result).toEqual({
      x: 3,
      y: 2,
    });
  });
});

describe('handlePlayerMovement', () => {
  function createTestGameState(): GameState {
    return {
      roomId: randomUUID(),
      status: WAITING,
      map: {
        name: 'Test map',
        width: 5,
        height: 5,
        baseTile: 'floor',
        baseOverrides: [],
        objects: [
          {
            x: 3,
            y: 2,
            type: 'wall',
          },
          {
            x: 1,
            y: 2,
            type: 'spawn',
          },
        ],
      },
      players: [
        new Player({
          clientId: 'player-1',
          name: 'Alice',
          position: { x: 2, y: 2 },
          facingDirection: 'down',
        }),
      ],
      endsAt: null,
    };
  }

  it('updates the player position when movement is valid', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'up');

    expect({
      player: result.player.toJSON(),
      moved: result.moved,
    }).toEqual({
      player: {
        id: 'player-1',
        name: 'Alice',
        spriteIndex: 0,
        position: {
          x: 2,
          y: 1,
        },
        facingDirection: 'up',
      },
      moved: true,
    });

    expect(gameState.players[0].getPosition()).toEqual({
      x: 2,
      y: 1,
    });

    expect(gameState.players[0].getFacingDirection()).toBe('up');
  });

  it.each<{
    direction: MovementDirection;
    expectedPosition: Position;
  }>([
    {
      direction: 'up',
      expectedPosition: { x: 2, y: 1 },
    },
    {
      direction: 'down',
      expectedPosition: { x: 2, y: 3 },
    },
    {
      direction: 'left',
      expectedPosition: { x: 1, y: 2 },
    },
    {
      direction: 'right',
      expectedPosition: { x: 3, y: 2 },
    },
  ])(
    'sets facingDirection to $direction after successful movement',
    ({ direction, expectedPosition }) => {
      const gameState = createTestGameState();

      gameState.map.objects = [];

      const result = handlePlayerMovement(gameState, 'player-1', direction);

      expect(result.moved).toBe(true);
      expect(result.player.getPosition()).toEqual(expectedPosition);
      expect(result.player.getFacingDirection()).toBe(direction);
      expect(gameState.players[0].getFacingDirection()).toBe(direction);
    },
  );

  it('keeps the old player position when movement is invalid', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'right');

    expect({
      player: result.player.toJSON(),
      moved: result.moved,
    }).toEqual({
      player: {
        id: 'player-1',
        name: 'Alice',
        spriteIndex: 0,
        position: {
          x: 2,
          y: 2,
        },
        facingDirection: 'right',
      },
      moved: false,
    });

    expect(gameState.players[0].getPosition()).toEqual({
      x: 2,
      y: 2,
    });

    expect(gameState.players[0].getFacingDirection()).toBe('right');
  });

  it('allows movement to a spawn tile', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'left');

    expect({
      player: result.player.toJSON(),
      moved: result.moved,
    }).toEqual({
      player: {
        id: 'player-1',
        name: 'Alice',
        spriteIndex: 0,
        position: {
          x: 1,
          y: 2,
        },
        facingDirection: 'left',
      },
      moved: true,
    });

    expect(gameState.players[0].getPosition()).toEqual({
      x: 1,
      y: 2,
    });
  });

  it('throws an error when the player does not exist', () => {
    const gameState = createTestGameState();

    expect(() => {
      handlePlayerMovement(gameState, 'unknown-player', 'up');
    }).toThrow('Player not found');
  });
  it('keeps the player position when movement leaves the map', () => {
    const gameState = createTestGameState();

    gameState.players[0].setPosition({
      x: 0,
      y: 2,
    });

    const result = handlePlayerMovement(gameState, 'player-1', 'left');

    expect({
      player: result.player.toJSON(),
      moved: result.moved,
    }).toEqual({
      player: {
        id: 'player-1',
        name: 'Alice',
        spriteIndex: 0,
        position: {
          x: 0,
          y: 2,
        },
        facingDirection: 'left',
      },
      moved: false,
    });

    expect(gameState.players[0].getPosition()).toEqual({
      x: 0,
      y: 2,
    });
    expect(gameState.players[0].getFacingDirection()).toBe('left');
  });
  it('keeps the player position when another player occupies the target tile', () => {
    const gameState = createTestGameState();

    gameState.players.push(
      new Player({
        clientId: 'player-2',
        name: 'Bob',
        position: {
          x: 2,
          y: 1,
        },
        facingDirection: 'down',
      }),
    );

    const result = handlePlayerMovement(gameState, 'player-1', 'up');

    expect({
      player: result.player.toJSON(),
      moved: result.moved,
    }).toEqual({
      player: {
        id: 'player-1',
        name: 'Alice',
        spriteIndex: 0,
        position: {
          x: 2,
          y: 2,
        },
        facingDirection: 'up',
      },
      moved: false,
    });

    expect(gameState.players[0].getPosition()).toEqual({
      x: 2,
      y: 2,
    });
    expect(gameState.players[0].getFacingDirection()).toBe('up');
  });
});
