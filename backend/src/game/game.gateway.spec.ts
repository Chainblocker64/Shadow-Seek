import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { LobbyService } from '../lobby/lobby.service';
import { MapsService } from '../maps/maps.service';
import type { Room } from '../lobby/types';
import type { GameState } from './types';

describe('GameGateway', () => {
  let gateway: GameGateway;
  let gameService: {
    movePlayer: jest.Mock;
    playerAttack: jest.Mock;
    removePlayer: jest.Mock;
    endGame: jest.Mock;
    getFilteredGameStates: jest.Mock;
  };
  let lobbyService: {
    getPlayerRoom: jest.Mock;
  };
  let emit: jest.Mock;
  let to: jest.Mock;

  beforeEach(async () => {
    gameService = {
      movePlayer: jest.fn(),
      playerAttack: jest.fn(),
      removePlayer: jest.fn(),
      endGame: jest.fn(),
      getFilteredGameStates: jest.fn(),
    };

    lobbyService = {
      getPlayerRoom: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameGateway,
        {
          provide: GameService,
          useValue: gameService,
        },
        {
          provide: LobbyService,
          useValue: lobbyService,
        },
        {
          provide: MapsService,
          useValue: {},
        },
      ],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);

    emit = jest.fn();
    to = jest.fn().mockReturnValue({
      emit,
    });

    gateway.server = {
      to,
    } as unknown as Server;
  });

  describe('handleMovePlayer', () => {
    it("forwards the movement request to the game service using the player's room", () => {
      const roomId = randomUUID();

      const room: Room = {
        id: roomId,
        players: [{ id: 'player-1', name: 'Alice' }],
        owner: 'player-1',
        status: 'waiting',
        maxPlayers: 4,
        map: 'Test map',
      };

      lobbyService.getPlayerRoom.mockReturnValue(room);

      gateway.handleMovePlayer(
        {
          id: 'player-1',
        } as Socket,
        {
          direction: 'right',
        },
      );

      expect(lobbyService.getPlayerRoom).toHaveBeenCalledWith('player-1');
      expect(gameService.movePlayer).toHaveBeenCalledWith(
        roomId,
        'player-1',
        'right',
      );
    });

    it('does not process movement when the player has no room', () => {
      lobbyService.getPlayerRoom.mockReturnValue(undefined);

      gateway.handleMovePlayer(
        {
          id: 'player-1',
        } as Socket,
        {
          direction: 'right',
        },
      );

      expect(gameService.movePlayer).not.toHaveBeenCalled();
    });
  });

  describe('handlePlayerAttack', () => {
    it("forwards the attack request to the game service using the player's room", () => {
      const roomId = randomUUID();

      const room: Room = {
        id: roomId,
        players: [{ id: 'player-1', name: 'Alice' }],
        owner: 'player-1',
        status: 'waiting',
        maxPlayers: 4,
        map: 'Test map',
      };

      lobbyService.getPlayerRoom.mockReturnValue(room);

      gateway.handlePlayerAttack({ id: 'player-1' } as Socket);

      expect(lobbyService.getPlayerRoom).toHaveBeenCalledWith('player-1');
      expect(gameService.playerAttack).toHaveBeenCalledWith(roomId, 'player-1');
    });

    it('does not process an attack when the player has no room', () => {
      lobbyService.getPlayerRoom.mockReturnValue(undefined);

      gateway.handlePlayerAttack({ id: 'player-1' } as Socket);

      expect(gameService.playerAttack).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    function createRemainingGame(status: GameState['status']) {
      const roomId = randomUUID();

      const game = {
        roomId,
        status,
        players: [{ clientId: 'player-1' }],
      } as unknown as GameState;

      gameService.removePlayer.mockReturnValue(game);

      return { roomId, game };
    }

    it('ends a running game when only one player remains', () => {
      const { roomId, game } = createRemainingGame('running');

      const endedGame = { ...game, status: 'ended', winner: 'player-1' };

      gameService.endGame.mockReturnValue(endedGame);

      gateway.handleDisconnect({ id: 'player-2' } as Socket);

      expect(gameService.endGame).toHaveBeenCalledWith(roomId);
      expect(to).toHaveBeenCalledWith(roomId);
      expect(emit).toHaveBeenCalledWith('game:ended', endedGame);
      expect(emit).not.toHaveBeenCalledWith('game:sync', expect.anything());
    });

    it('keeps a waiting game running when only one player remains', () => {
      const { roomId, game } = createRemainingGame('waiting');

      gateway.handleDisconnect({ id: 'player-2' } as Socket);

      expect(gameService.endGame).not.toHaveBeenCalled();
      expect(to).toHaveBeenCalledWith(roomId);
      expect(emit).toHaveBeenCalledWith('game:sync', game);
    });
  });

  describe('broadcastGamestate', () => {
    it('emits the game state to the player when the game service reports a change', () => {
      const clientId = randomUUID();

      const gameState = {
        clientId,
        status: 'running',
        players: [{ clientId }],
      } as unknown as GameState;

      gameService.getFilteredGameStates.mockReturnValue([
        {
          clientId: clientId,
          gameState: gameState,
        },
      ]);

      gateway.broadcastGamestate(gameState);

      expect(to).toHaveBeenCalledWith(clientId);
      expect(emit).toHaveBeenCalledWith('game:sync', gameState);
    });
  });
});
