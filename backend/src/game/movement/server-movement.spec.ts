import { calculateNextPosition, handlePlayerMovement } from './server-movement';
import { describe, expect, it } from '@jest/globals';
import { randomUUID } from 'node:crypto';
import type { GameState, MovementDirection, Position } from '../types';
import { WAITING } from '../consts';

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
        {
          id: 'player-1',
          position: {
            x: 2,
            y: 2,
          },
          facingDirection: 'down',
        },
      ],
    };
  }

  it('updates the player position when movement is valid', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'up');

    expect(result).toEqual({
      player: {
        id: 'player-1',
        position: {
          x: 2,
          y: 1,
        },
        facingDirection: 'up',
      },
      moved: true,
    });

    expect(gameState.players[0].position).toEqual({
      x: 2,
      y: 1,
    });

    expect(gameState.players[0].facingDirection).toBe('up');
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
      expect(result.player.position).toEqual(expectedPosition);
      expect(result.player.facingDirection).toBe(direction);
      expect(gameState.players[0].facingDirection).toBe(direction);
    },
  );

  it('keeps the old player position when movement is invalid', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'right');

    expect(result).toEqual({
      player: {
        id: 'player-1',
        position: {
          x: 2,
          y: 2,
        },
        facingDirection: 'right',
      },
      moved: false,
    });

    expect(gameState.players[0].position).toEqual({
      x: 2,
      y: 2,
    });

    expect(gameState.players[0].facingDirection).toBe('right');
  });

  it('allows movement to a spawn tile', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'left');

    expect(result).toEqual({
      player: {
        id: 'player-1',
        position: {
          x: 1,
          y: 2,
        },
        facingDirection: 'left',
      },
      moved: true,
    });

    expect(gameState.players[0].position).toEqual({
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

    gameState.players[0].position = {
      x: 0,
      y: 2,
    };

    const result = handlePlayerMovement(gameState, 'player-1', 'left');

    expect(result).toEqual({
      player: {
        id: 'player-1',
        position: {
          x: 0,
          y: 2,
        },
        facingDirection: 'left',
      },
      moved: false,
    });

    expect(gameState.players[0].position).toEqual({
      x: 0,
      y: 2,
    });
    expect(gameState.players[0].facingDirection).toBe('left');
  });
  it('keeps the player position when another player occupies the target tile', () => {
    const gameState = createTestGameState();

    gameState.players.push({
      id: 'player-2',
      position: {
        x: 2,
        y: 1,
      },
      facingDirection: 'down',
    });

    const result = handlePlayerMovement(gameState, 'player-1', 'up');

    expect(result).toEqual({
      player: {
        id: 'player-1',
        position: {
          x: 2,
          y: 2,
        },
        facingDirection: 'up',
      },
      moved: false,
    });

    expect(gameState.players[0].position).toEqual({
      x: 2,
      y: 2,
    });
    expect(gameState.players[0].facingDirection).toBe('up');
  });
});
