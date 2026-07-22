import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { GameService } from './game.service';
import { WAITING } from './consts';
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
    });
    expect(service.getGame(roomId)).toBe(game);
  });

  it('rejects a game when there are not enough spawn positions', () => {
    const roomId = randomUUID();
    const map: GameMap = {
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
});
