import { randomUUID } from 'node:crypto';
import { toGameStatePayload } from './game-state-payload';
import { Player } from './player/player';
import { DEFAULT_COMBAT_STATS, RUNNING } from './consts';
import type { GameMap, GameState } from './types';

describe('toGameStatePayload', () => {
  const map: GameMap = {
    name: 'Test map',
    width: 4,
    height: 4,
    baseTile: 'floor',
    baseOverrides: [],
    objects: [],
  };

  function createGameState(players: Player[]): GameState {
    return {
      roomId: randomUUID(),
      status: RUNNING,
      map,
      players,
      endsAt: null,
    };
  }

  it('adds the name and health of every player to the public game information', () => {
    const alice = new Player({
      clientId: 'player-1',
      name: 'Alice',
      position: { x: 0, y: 0 },
    });
    const bob = new Player({
      clientId: 'player-2',
      name: 'Bob',
      position: { x: 3, y: 3 },
    });

    bob.takeDamage(1);

    const payload = toGameStatePayload(createGameState([alice, bob]));

    expect(payload.publicGameInformation.players).toEqual([
      {
        id: 'player-1',
        name: 'Alice',
        health: DEFAULT_COMBAT_STATS.maxHealth,
        maxHealth: DEFAULT_COMBAT_STATS.maxHealth,
      },
      {
        id: 'player-2',
        name: 'Bob',
        health: DEFAULT_COMBAT_STATS.maxHealth - 1,
        maxHealth: DEFAULT_COMBAT_STATS.maxHealth,
      },
    ]);
  });

  it('keeps positions out of the public game information', () => {
    const player = new Player({
      clientId: 'player-1',
      name: 'Alice',
      position: { x: 2, y: 1 },
    });

    const payload = toGameStatePayload(createGameState([player]));

    expect(payload.publicGameInformation.players[0]).not.toHaveProperty(
      'position',
    );
  });

  it('keeps the game state untouched', () => {
    const player = new Player({
      clientId: 'player-1',
      name: 'Alice',
      position: { x: 0, y: 0 },
    });
    const game = createGameState([player]);

    const payload = toGameStatePayload(game);

    expect(game).not.toHaveProperty('publicGameInformation');
    expect(payload.players).toEqual(game.players);
    expect(payload.roomId).toBe(game.roomId);
    expect(payload.status).toBe(game.status);
    expect(payload.map).toBe(game.map);
  });

  it('includes defeated players', () => {
    const player = new Player({
      clientId: 'player-1',
      name: 'Alice',
      position: { x: 0, y: 0 },
    });

    player.takeDamage(DEFAULT_COMBAT_STATS.maxHealth);

    const payload = toGameStatePayload(createGameState([player]));

    expect(payload.publicGameInformation.players).toEqual([
      {
        id: 'player-1',
        name: 'Alice',
        health: 0,
        maxHealth: DEFAULT_COMBAT_STATS.maxHealth,
      },
    ]);
  });
});
