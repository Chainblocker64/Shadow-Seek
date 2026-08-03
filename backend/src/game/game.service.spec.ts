import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameService } from './game.service';
import {
  DEFAULT_COMBAT_STATS,
  ENDED,
  GAME_DURATION_MS,
  RUNNING,
  WAITING,
} from './consts';
import type { GameMap } from './types';

describe('GameService', () => {
  let service: GameService;
  let eventEmitter: { emit: jest.Mock };

  beforeEach(async () => {
    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: EventEmitter2, useValue: eventEmitter },
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

    expect(game).toMatchObject({
      roomId,
      status: WAITING,
      map,
      endsAt: null,
    });
    expect(game.players.map((player) => player.toJSON())).toMatchObject([
      {
        id: 'player-1',
        name: 'Alice',
        spriteIndex: 0,
        position: { x: 0, y: 0 },
        facingDirection: 'down',
        health: DEFAULT_COMBAT_STATS.maxHealth,
        maxHealth: DEFAULT_COMBAT_STATS.maxHealth,
      },
      {
        id: 'player-2',
        name: 'Bob',
        spriteIndex: 1,
        position: { x: 3, y: 3 },
        facingDirection: 'down',
        health: DEFAULT_COMBAT_STATS.maxHealth,
        maxHealth: DEFAULT_COMBAT_STATS.maxHealth,
      },
    ]);
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

  describe('endGame winner', () => {
    function createEndableGame() {
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

      const game = service.createGame(
        roomId,
        [
          { id: 'player-1', name: 'Alice' },
          { id: 'player-2', name: 'Bob' },
        ],
        map,
      );

      service.startGame(roomId);

      return { roomId, game };
    }

    it('declares the player with the most health the winner', () => {
      const { roomId, game } = createEndableGame();

      game.players[1].takeDamage(10);

      expect(service.endGame(roomId)?.winner).toBe('player-1');
    });

    it('declares no winner when the highest health is tied', () => {
      const { roomId, game } = createEndableGame();

      game.players[0].takeDamage(10);
      game.players[1].takeDamage(10);

      expect(service.endGame(roomId)?.winner).toBeNull();
    });

    it('declares no winner when the game has no players left', () => {
      const { roomId, game } = createEndableGame();

      game.players.length = 0;

      expect(service.endGame(roomId)?.winner).toBeNull();
    });
  });

  describe('playerAttack', () => {
    function createCombatGame() {
      const roomId = randomUUID();
      const map: GameMap = {
        name: 'Combat test map',
        width: 3,
        height: 3,
        baseTile: 'floor',
        baseOverrides: [],
        objects: [
          { x: 1, y: 0, type: 'spawn' },
          { x: 1, y: 1, type: 'spawn' },
          { x: 2, y: 2, type: 'spawn' },
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

      service.startGame(roomId);

      return { roomId, game };
    }

    it('broadcasts the game state while the opponent survives the attack', () => {
      const { roomId, game } = createCombatGame();

      service.playerAttack(roomId, 'player-1');

      expect(game.players[1].getHealth()).toBe(
        DEFAULT_COMBAT_STATS.maxHealth - DEFAULT_COMBAT_STATS.attackValue,
      );
      expect(game.status).toBe(RUNNING);
      expect(eventEmitter.emit).toHaveBeenCalledWith('game.broadcast', game);
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'game.ended',
        expect.anything(),
      );
    });

    it('ends the game once the attack defeats the last opponent', () => {
      const { roomId, game } = createCombatGame();

      game.players[1].takeDamage(
        DEFAULT_COMBAT_STATS.maxHealth - DEFAULT_COMBAT_STATS.attackValue,
      );

      service.playerAttack(roomId, 'player-1');

      expect(game.players[1].getHealth()).toBe(0);
      expect(game).toMatchObject({
        status: ENDED,
        endsAt: null,
        winner: 'player-1',
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('game.ended', game);
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'game.broadcast',
        expect.anything(),
      );
    });

    it('keeps the game running while two opponents are still alive', () => {
      const { roomId, game } = createCombatGame();

      service.addPlayer(roomId, { id: 'player-3', name: 'Carol' });

      game.players[1].takeDamage(
        DEFAULT_COMBAT_STATS.maxHealth - DEFAULT_COMBAT_STATS.attackValue,
      );

      service.playerAttack(roomId, 'player-1');

      expect(game.players[1].getHealth()).toBe(0);
      expect(game.status).toBe(RUNNING);
      expect(eventEmitter.emit).toHaveBeenCalledWith('game.broadcast', game);
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'game.ended',
        expect.anything(),
      );
    });

    it('does not end the game when the attack misses', () => {
      const { roomId, game } = createCombatGame();

      service.movePlayer(roomId, 'player-1', 'up');
      service.playerAttack(roomId, 'player-1');

      expect(game.players[1].getHealth()).toBe(DEFAULT_COMBAT_STATS.maxHealth);
      expect(game.status).toBe(RUNNING);
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'game.ended',
        expect.anything(),
      );
    });
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

      service.movePlayer(roomId, 'player-1', 'right');

      expect(game.players[0].getPosition()).toEqual({
        x: 1,
        y: 1,
      });
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('moves a player and broadcasts the updated game state after the game starts', () => {
      const { roomId, game } = createMovementGame();

      service.startGame(roomId);

      service.movePlayer(roomId, 'player-1', 'right');

      expect(game.players[0].getPosition()).toEqual({
        x: 2,
        y: 1,
      });
      expect(game.players[0].toJSON()).toMatchObject({
        facingDirection: 'right',
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('game.broadcast', game);
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
