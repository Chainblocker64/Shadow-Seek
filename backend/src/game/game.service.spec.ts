import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { GameService } from './game.service';
import { ENDED, GAME_DURATION_MS, RUNNING, WAITING } from './consts';
import type { GameMap } from './types';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a waiting game and assigns each player a spawn position', () => {
    const roomId = randomUUID();
    const map: GameMap = {
      name: 'Test map',
      width: 4,
      height: 4,
      baseTile: 'floor',
      objects: [
        { x: 0, y: 0, type: 'spawn' },
        { x: 3, y: 3, type: 'spawn' },
        { x: 1, y: 1, type: 'wall' },
      ],
    };

    const game = service.createGame(roomId, ['player-1', 'player-2'], map);

    expect(game).toEqual({
      roomId,
      status: WAITING,
      map,
      players: [
        { id: 'player-1', position: { x: 0, y: 0 } },
        { id: 'player-2', position: { x: 3, y: 3 } },
      ],
      endsAt: null,
    });
    expect(service.getGame(roomId)).toBe(game);
  });

  it('rejects a game when there are not enough spawn positions', () => {
    const roomId = randomUUID();
    const map: GameMap = {
      name: 'Test map',
      width: 4,
      height: 4,
      baseTile: 'floor',
      objects: [{ x: 0, y: 0, type: 'spawn' }],
    };

    expect(() => {
      service.createGame(roomId, ['player-1', 'player-2'], map);
    }).toThrow('Map does not have enough spawn positions for all players');
    expect(service.getGame(roomId)).toBeUndefined();
  });

  it('starts a waiting game', () => {
    const roomId = randomUUID();
    const map: GameMap = {
      name: 'Test map',
      width: 2,
      height: 2,
      baseTile: 'floor',
      baseOverrides: [],
      objects: [{ x: 0, y: 0, type: 'spawn' }],
    };
    service.createGame(roomId, ['player-1'], map);

    const game = service.startGame(roomId);

    expect(game).toMatchObject({ roomId, status: RUNNING });
    expect(game?.endsAt).toBeGreaterThan(Date.now());
    expect(game?.endsAt).toBeLessThanOrEqual(Date.now() + GAME_DURATION_MS);
    expect(service.getGame(roomId)).toBe(game);
  });

  it('ends a running game and clears its end timestamp', () => {
    const roomId = randomUUID();
    const map: GameMap = {
      name: 'Test map',
      width: 2,
      height: 2,
      baseTile: 'floor',
      baseOverrides: [],
      objects: [{ x: 0, y: 0, type: 'spawn' }],
    };
    service.createGame(roomId, ['player-1'], map);
    service.startGame(roomId);

    const game = service.endGame(roomId);

    expect(game).toMatchObject({ roomId, status: ENDED, endsAt: null });
    expect(service.getGame(roomId)).toBe(game);
  });

  it('removes a leaving player and keeps the game for the others', () => {
    const roomId = randomUUID();
    const map: GameMap = {
      name: 'Test map',
      width: 4,
      height: 4,
      baseTile: 'floor',
      baseOverrides: [],
      objects: [
        { x: 0, y: 0, type: 'spawn' },
        { x: 3, y: 3, type: 'spawn' },
      ],
    };
    service.createGame(roomId, ['player-1', 'player-2'], map);

    const game = service.removePlayer('player-1');

    expect(game?.players).toEqual([
      { id: 'player-2', position: { x: 3, y: 3 } },
    ]);
    expect(service.getGame(roomId)).toBe(game);
    expect(service.getPlayerGame('player-1')).toBeUndefined();
    expect(service.getPlayerGame('player-2')).toBe(game);
  });

  it('drops the game once its last player leaves', () => {
    const roomId = randomUUID();
    const map: GameMap = {
      name: 'Test map',
      width: 2,
      height: 2,
      baseTile: 'floor',
      baseOverrides: [],
      objects: [{ x: 0, y: 0, type: 'spawn' }],
    };
    service.createGame(roomId, ['player-1'], map);

    const game = service.removePlayer('player-1');

    expect(game?.players).toEqual([]);
    expect(service.getGame(roomId)).toBeUndefined();
  });

  it('ignores a leave from a player that is not in a game', () => {
    expect(service.removePlayer('unknown-player')).toBeUndefined();
  });
});
