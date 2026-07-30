import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameService } from './game.service';
import { ENDED, GAME_DURATION_MS, RUNNING, WAITING } from './consts';
import type { GameMap } from './types';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
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
      baseOverrides: [],
      objects: [
        { x: 0, y: 0, type: 'spawn' },
        { x: 3, y: 3, type: 'spawn' },
        { x: 1, y: 1, type: 'wall' },
      ],
    };

    const game = service.createGame(
      roomId,
      [
        { id: 'player-1', name: 'Alice' },
        { id: 'player-2', name: 'Bob' },
      ],
      map,
    );

    expect({
      ...game,
      players: game.players.map((player) => player.toJSON()),
    }).toEqual({
      roomId,
      status: WAITING,
      map,
      players: [
        {
          id: 'player-1',
          name: 'Alice',
          spriteIndex: 0,
          position: { x: 0, y: 0 },
          facingDirection: 'down',
        },
        {
          id: 'player-2',
          name: 'Bob',
          spriteIndex: 1,
          position: { x: 3, y: 3 },
          facingDirection: 'down',
        },
      ],
      endsAt: null,
    });
    expect(game.players).toMatchObject([
      { clientId: 'player-1', name: 'Alice', position: { x: 0, y: 0 } },
      { clientId: 'player-2', name: 'Bob', position: { x: 3, y: 3 } },
    ]);
    expect(service.getGame(roomId)).toBe(game);
  });

  it('rejects a game when there are not enough spawn positions', () => {
    const roomId = randomUUID();
    const map: GameMap = {
      name: 'Test map',
      width: 4,
      height: 4,
      baseTile: 'floor',
      baseOverrides: [],
      objects: [{ x: 0, y: 0, type: 'spawn' }],
    };

    expect(() => {
      service.createGame(
        roomId,
        [
          { id: 'player-1', name: 'Alice' },
          { id: 'player-2', name: 'Bob' },
        ],
        map,
      );
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
    service.createGame(roomId, [{ id: 'player-1', name: 'Alice' }], map);

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
    service.createGame(roomId, [{ id: 'player-1', name: 'Alice' }], map);
    service.startGame(roomId);

    const game = service.endGame(roomId);

    expect(game).toMatchObject({ roomId, status: ENDED, endsAt: null });
    expect(service.getGame(roomId)).toBe(game);
  });

  describe('movePlayer', () => {
    function createMovementGame() {
      const roomId = randomUUID();

      const map: GameMap = {
        name: 'Movement test map',
        width: 3,
        height: 3,
        baseTile: 'floor',
        baseOverrides: [],
        objects: [
          {
            x: 1,
            y: 1,
            type: 'spawn',
          },
        ],
      };

      const game = service.createGame(
        roomId,
        [{ id: 'player-1', name: 'Alice' }],
        map,
      );

      return {
        roomId,
        game,
      };
    }

    it('does not move a player before the game starts', () => {
      const { roomId, game } = createMovementGame();

      const result = service.movePlayer(roomId, 'player-1', 'right');

      expect(result).toBeUndefined();
      expect(game.players[0].getPosition()).toEqual({
        x: 1,
        y: 1,
      });
    });

    it('moves a player after the game starts', () => {
      const { roomId } = createMovementGame();

      service.startGame(roomId);

      const result = service.movePlayer(roomId, 'player-1', 'right');

      expect({
        player: result?.player.toJSON(),
        moved: result?.moved,
      }).toEqual({
        player: {
          id: 'player-1',
          name: 'Alice',
          position: {
            x: 2,
            y: 1,
          },
          facingDirection: 'right',
          spriteIndex: 0,
        },
        moved: true,
      });

      expect(service.getGame(roomId)?.players[0].getPosition()).toEqual({
        x: 2,
        y: 1,
      });
    });
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
    service.createGame(
      roomId,
      [
        { id: 'player-1', name: 'Alice' },
        { id: 'player-2', name: 'Bob' },
      ],
      map,
    );

    const game = service.removePlayer('player-1');

    expect(game?.players).toMatchObject([
      { clientId: 'player-2', name: 'Bob', position: { x: 3, y: 3 } },
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
    service.createGame(roomId, [{ id: 'player-1', name: 'Alice' }], map);

    const game = service.removePlayer('player-1');

    expect(game?.players).toEqual([]);
    expect(service.getGame(roomId)).toBeUndefined();
  });

  it('ignores a leave from a player that is not in a game', () => {
    expect(service.removePlayer('unknown-player')).toBeUndefined();
  });
});
