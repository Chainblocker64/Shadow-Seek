import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { LobbyService } from '../lobby/lobby.service';
import { MapsService } from '../maps/maps.service';
import type { Room } from '../lobby/types';
import type { GameState } from './types';
import { Player } from './player/player';
import { DEFAULT_COMBAT_STATS } from './consts';

function createAlice() {
  return new Player({
    clientId: 'player-1',
    name: 'Alice',
    position: { x: 0, y: 0 },
  });
}

const publicGameInformationOfAlice = {
  players: [
    {
      id: 'player-1',
      name: 'Alice',
      health: DEFAULT_COMBAT_STATS.maxHealth,
      maxHealth: DEFAULT_COMBAT_STATS.maxHealth,
    },
  ],
};

describe('GameGateway', () => {
  let gateway: GameGateway;
  let gameService: {
    movePlayer: jest.Mock;
    playerAttack: jest.Mock;
    removePlayer: jest.Mock;
    endGame: jest.Mock;
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
        players: [createAlice()],
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
      expect(emit).toHaveBeenCalledWith('game:ended', {
        ...endedGame,
        publicGameInformation: publicGameInformationOfAlice,
      });
      expect(emit).not.toHaveBeenCalledWith('game:sync', expect.anything());
    });

    it('keeps a waiting game running when only one player remains', () => {
      const { roomId, game } = createRemainingGame('waiting');

      gateway.handleDisconnect({ id: 'player-2' } as Socket);

      expect(gameService.endGame).not.toHaveBeenCalled();
      expect(to).toHaveBeenCalledWith(roomId);
      expect(emit).toHaveBeenCalledWith('game:sync', {
        ...game,
        publicGameInformation: publicGameInformationOfAlice,
      });
    });
  });

  describe('broadcastGamestate', () => {
    it('emits the game state to the room when the game service reports a change', () => {
      const roomId = randomUUID();

      const gameState = {
        roomId,
        status: 'running',
        players: [createAlice()],
      } as unknown as GameState;

      gateway.broadcastGamestate(gameState);

      expect(to).toHaveBeenCalledWith(roomId);
      expect(emit).toHaveBeenCalledWith('game:sync', {
        ...gameState,
        publicGameInformation: publicGameInformationOfAlice,
      });
    });
  });
});
