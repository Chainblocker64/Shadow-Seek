import { attack } from './attack';
import { describe, expect, it } from '@jest/globals';
import { randomUUID } from 'node:crypto';
import type { GameState } from '../types';
import { WAITING } from '../consts';
import { Player } from '../player/player';

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
      objects: [],
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
    winner: null,
  };
}

describe('attack', () => {
  it('returns false when the player does not exist', () => {
    const gameState = createTestGameState();

    expect(attack(gameState, 'unknown-player')).toBe(false);
  });

  it("returns false when the player's health is 0", () => {
    const gameState = createTestGameState();
    const player = gameState.players[0];

    player.takeDamage(player.getCombatStats().maxHealth);

    expect(player.isAlive()).toBe(false);
    expect(attack(gameState, 'player-1')).toBe(false);
  });

  it('returns false when the attack is still on cooldown', () => {
    const gameState = createTestGameState();

    expect(attack(gameState, 'player-1')).toBe(true);
    expect(attack(gameState, 'player-1')).toBe(false);
  });

  it('returns true and damages the target when a player is in range', () => {
    const gameState = createTestGameState();
    const { attackValue } = gameState.players[0].getCombatStats();

    gameState.players.push(
      new Player({
        clientId: 'player-2',
        name: 'Bob',
        position: { x: 2, y: 3 },
        facingDirection: 'up',
        combatStats: {
          maxHealth: attackValue,
          attackValue: 10,
          attackRange: 1,
          attackCooldown: 1000,
        },
      }),
    );

    const target = gameState.players[1];

    expect(attack(gameState, 'player-1')).toBe(true);
    expect(target.isAlive()).toBe(false);
  });

  it('does not damage other players when no one is in range', () => {
    const gameState = createTestGameState();
    const { attackValue } = gameState.players[0].getCombatStats();

    gameState.players.push(
      new Player({
        clientId: 'player-2',
        name: 'Bob',
        position: { x: 4, y: 4 },
        facingDirection: 'up',
        combatStats: {
          maxHealth: attackValue,
          attackValue: 10,
          attackRange: 1,
          attackCooldown: 1000,
        },
      }),
    );

    const target = gameState.players[1];

    expect(attack(gameState, 'player-1')).toBe(true);
    expect(target.isAlive()).toBe(true);
  });

  it('updates the attack timestamp on a successful attack', () => {
    const gameState = createTestGameState();
    const player = gameState.players[0];

    expect(player.getActionTimestamps().attack).toBe(0);

    attack(gameState, 'player-1');

    expect(player.getActionTimestamps().attack).toBeGreaterThan(0);
  });
});
