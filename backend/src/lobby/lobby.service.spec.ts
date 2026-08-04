import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
  let service: LobbyService;
  let emit: jest.Mock;

  beforeEach(async () => {
    emit = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbyService,
        {
          provide: EventEmitter2,
          useValue: { emit },
        },
      ],
    }).compile();

    service = module.get<LobbyService>(LobbyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setFinished', () => {
    function createRunningRoom() {
      const room = service.createRoom('player-1', 'Alice')!;

      service.setRunning(room.id);

      return room.id;
    }

    it('marks the room as finished and broadcasts the change', () => {
      const roomId = createRunningRoom();

      emit.mockClear();
      service.setFinished(roomId);

      expect(service.getRoom(roomId)?.status).toBe('finished');
      expect(emit).toHaveBeenCalledWith('room.broadcast');
    });

    it('keeps a finished room finished when a player leaves', () => {
      const room = service.createRoom('player-1', 'Alice')!;
      const roomId = room.id;

      // Joining is only possible before the game starts.
      service.addPlayer('player-2', roomId, 'Bob');
      service.setRunning(roomId);
      service.setFinished(roomId);
      service.removePlayer('player-2');

      expect(service.getRoom(roomId)?.status).toBe('finished');
    });

    it('does not broadcast when the room is already finished', () => {
      const roomId = createRunningRoom();

      service.setFinished(roomId);
      emit.mockClear();
      service.setFinished(roomId);

      expect(emit).not.toHaveBeenCalled();
    });
  });
});
