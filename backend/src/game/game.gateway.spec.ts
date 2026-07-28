import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { LobbyService } from '../lobby/lobby.service';
import { MapsService } from '../maps/maps.service';
import type { Room } from '../lobby/types';

describe('GameGateway movement', () => {
  let gateway: GameGateway;
  let gameService: {
    movePlayer: jest.Mock;
  };
  let lobbyService: {
    getPlayerRoom: jest.Mock;
  };
  let emit: jest.Mock;
  let to: jest.Mock;

  beforeEach(async () => {
    gameService = {
      movePlayer: jest.fn(),
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

  it('broadcasts the server-confirmed movement result to the room', () => {
    const roomId = randomUUID();

    const room: Room = {
      id: roomId,
      players: ['player-1'],
      owner: 'player-1',
      status: 'waiting',
      maxPlayers: 4,
      map: 'Test map',
    };

    const result = {
      player: {
        id: 'player-1',
        position: {
          x: 1,
          y: 1,
        },
      },
      moved: false,
    };

    lobbyService.getPlayerRoom.mockReturnValue(room);
    gameService.movePlayer.mockReturnValue(result);

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

    expect(to).toHaveBeenCalledWith(roomId);
    expect(emit).toHaveBeenCalledWith('movement:confirmed', result);
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
    expect(emit).not.toHaveBeenCalled();
  });

  it('does not emit when the game rejects the request', () => {
    const roomId = randomUUID();

    const room: Room = {
      id: roomId,
      players: ['player-1'],
      owner: 'player-1',
      status: 'waiting',
      maxPlayers: 4,
      map: 'Test map',
    };

    lobbyService.getPlayerRoom.mockReturnValue(room);
    gameService.movePlayer.mockReturnValue(undefined);

    gateway.handleMovePlayer(
      {
        id: 'player-1',
      } as Socket,
      {
        direction: 'right',
      },
    );

    expect(gameService.movePlayer).toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
