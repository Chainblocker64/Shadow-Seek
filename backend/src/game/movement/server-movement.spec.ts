import {
  calculateNextPosition,
  handlePlayerMovement,
  ServerGameState,
} from './server-movement';
import { describe, expect, it } from '@jest/globals';

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
  function createTestGameState(): ServerGameState {
    return {
      map: {
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
        },
      ],
    };
  }

  it('updates the player position when movement is valid', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'up');

    expect(result).toEqual({
      playerId: 'player-1',
      position: {
        x: 2,
        y: 1,
      },
      moved: true,
    });

    expect(gameState.players[0].position).toEqual({
      x: 2,
      y: 1,
    });
  });

  it('keeps the old player position when movement is invalid', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'right');

    expect(result).toEqual({
      playerId: 'player-1',
      position: {
        x: 2,
        y: 2,
      },
      moved: false,
    });

    expect(gameState.players[0].position).toEqual({
      x: 2,
      y: 2,
    });
  });

  it('allows movement to a spawn tile', () => {
    const gameState = createTestGameState();

    const result = handlePlayerMovement(gameState, 'player-1', 'left');

    expect(result).toEqual({
      playerId: 'player-1',
      position: {
        x: 1,
        y: 2,
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
});
