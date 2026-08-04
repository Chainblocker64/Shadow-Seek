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
import { DEFAULT_COMBAT_STATS, PLAYER_STATUS_ALIVE } from './consts';

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
      status: PLAYER_STATUS_ALIVE,
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
    getFilteredGameStates: jest.Mock;
    getGame: jest.Mock;
  };
  let lobbyService: {
    getPlayerRoom: jest.Mock;
    getRoom: jest.Mock;
    setFinished: jest.Mock;
  };
  let emit: jest.Mock;
  let to: jest.Mock;
  let inRoom: jest.Mock;
  let socketsJoin: jest.Mock;
  let socketsLeave: jest.Mock;

  beforeEach(async () => {
    gameService = {
      movePlayer: jest.fn(),
      playerAttack: jest.fn(),
      removePlayer: jest.fn(),
      endGame: jest.fn(),
      getFilteredGameStates: jest.fn(),
      getGame: jest.fn(),
    };

    lobbyService = {
      getPlayerRoom: jest.fn(),
      getRoom: jest.fn(),
      setFinished: jest.fn(),
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
    socketsJoin = jest.fn();
    socketsLeave = jest.fn();
    inRoom = jest.fn().mockReturnValue({ socketsJoin, socketsLeave });

    gateway.server = {
      to,
      in: inRoom,
    } as unknown as Server;
  });

  describe('handleSpectateGame', () => {
    it('adds an external viewer to the dedicated spectator room and sends the full game state', () => {
      const roomId = randomUUID();
      const room = {
        id: roomId,
        players: [{ id: 'player-1', name: 'Alice' }],
        owner: 'player-1',
        status: 'running',
        maxPlayers: 4,
        map: 'Test map',
      } satisfies Room;
      const game = {
        roomId,
        status: 'running',
        players: [createAlice()],
      } as unknown as GameState;

      lobbyService.getPlayerRoom.mockReturnValue(undefined);
      lobbyService.getRoom.mockReturnValue(room);
      gameService.getGame.mockReturnValue(game);

      gateway.handleSpectateGame({ id: 'viewer-1' } as Socket, { roomId });

      expect(inRoom).toHaveBeenCalledWith('viewer-1');
      expect(socketsJoin).toHaveBeenCalledWith(`spectators:${roomId}`);
      expect(to).toHaveBeenCalledWith('viewer-1');
      expect(emit).toHaveBeenCalledWith('game:spectator:opened');
      expect(emit).toHaveBeenCalledWith('game:spectator:sync', {
        ...game,
        publicGameInformation: publicGameInformationOfAlice,
      });
    });

    it('does not let a room player become a spectator', () => {
      const roomId = randomUUID();
      lobbyService.getPlayerRoom.mockReturnValue({ id: roomId } as Room);

      gateway.handleSpectateGame({ id: 'player-1' } as Socket, { roomId });

      expect(lobbyService.getRoom).not.toHaveBeenCalled();
      expect(socketsJoin).not.toHaveBeenCalled();
    });
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

    it('syncs the spectators so the leaving player disappears for them too', () => {
      const { roomId, game } = createRemainingGame('waiting');

      gateway.handleDisconnect({ id: 'player-2' } as Socket);

      expect(to).toHaveBeenCalledWith(`spectators:${roomId}`);
      expect(emit).toHaveBeenCalledWith('game:spectator:sync', {
        ...game,
        publicGameInformation: publicGameInformationOfAlice,
      });
    });

    it('sends the spectators back to the lobby when the last player leaves', () => {
      const roomId = randomUUID();

      gameService.removePlayer.mockReturnValue({
        roomId,
        status: 'waiting',
        players: [],
      } as unknown as GameState);

      gateway.handleDisconnect({ id: 'player-1' } as Socket);

      expect(to).toHaveBeenCalledWith(`spectators:${roomId}`);
      expect(emit).toHaveBeenCalledWith('game:left');
      expect(inRoom).toHaveBeenCalledWith(`spectators:${roomId}`);
      expect(socketsLeave).toHaveBeenCalledWith(`spectators:${roomId}`);
      expect(emit).not.toHaveBeenCalledWith(
        'game:spectator:sync',
        expect.anything(),
      );
    });
  });

  describe('handleGameEnded', () => {
    it('emits the ended game state to the room', () => {
      const roomId = randomUUID();

      const game = {
        roomId,
        status: 'ended',
        winner: 'player-1',
        players: [createAlice()],
      } as unknown as GameState;

      gateway.handleGameEnded(game);

      expect(to).toHaveBeenCalledWith(roomId);
      expect(emit).toHaveBeenCalledWith('game:ended', {
        ...game,
        publicGameInformation: publicGameInformationOfAlice,
      });
    });

    it('marks the lobby room as finished so it can no longer be spectated', () => {
      const roomId = randomUUID();

      gateway.handleGameEnded({
        roomId,
        status: 'ended',
        winner: 'player-1',
        players: [createAlice()],
      } as unknown as GameState);

      expect(lobbyService.setFinished).toHaveBeenCalledWith(roomId);
    });
  });

  describe('broadcastGamestate', () => {
    it('emits the game state to the player when the game service reports a change', () => {
      const clientId = randomUUID();

      const alice = {
        ...createAlice(),
        clientId,
        toPublicState: jest.fn().mockReturnValue({
          id: 'player-1',
          name: 'Alice',
        }),
      };

      const gameState = {
        roomId: randomUUID(),
        status: 'running',
        players: [alice],
      } as unknown as GameState;

      gameService.getFilteredGameStates.mockReturnValue([
        {
          clientId: clientId,
          gameState: gameState,
        },
      ]);

      gateway.broadcastGamestate(gameState);

      expect(to).toHaveBeenCalledWith(clientId);
      expect(emit).toHaveBeenCalledWith('game:sync', expect.any(Object));
    });
  });
});
