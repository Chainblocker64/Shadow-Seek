import { Player } from '../player/player';
import { GameState, MapObject } from '../types';
import { filterGameStateForPlayer } from './filter-state';

describe('filterGameStateForPlayer', () => {
  let viewer: Player;
  let otherPlayerVisible: Player;
  let otherPlayerOutOfRange: Player;
  let otherPlayerBlocked: Player;
  let mockMapObjects: MapObject[];

  beforeEach(() => {
    viewer = new Player({
      clientId: 'viewer-1',
      position: { x: 0, y: 0 },
      visionRange: 5,
    });

    otherPlayerVisible = new Player({
      clientId: 'player-visible',
      position: { x: 3, y: 3 },
    });

    otherPlayerOutOfRange = new Player({
      clientId: 'player-out-of-range',
      position: { x: 10, y: 10 },
    });

    otherPlayerBlocked = new Player({
      clientId: 'player-blocked',
      position: { x: 2, y: 2 },
    });

    mockMapObjects = [{ x: 1, y: 1, type: 'wall' }];
  });

  it('should include the viewer and visible players while filtering out hidden ones', () => {
    const gameState: GameState = {
      roomId: '123e4567-e89b-12d3-a456-426614174000',
      status: 'running',
      map: {
        name: 'test-map',
        width: 20,
        height: 20,
        baseTile: 'floor',
        baseOverrides: [],
        objects: mockMapObjects,
      },
      players: [
        viewer,
        otherPlayerVisible,
        otherPlayerOutOfRange,
        otherPlayerBlocked,
      ],
    };

    const filteredState = filterGameStateForPlayer(gameState, viewer);

    const filteredClientIds = filteredState.players.map((p) => p.clientId);

    expect(filteredClientIds).toContain('viewer-1');
    expect(filteredClientIds).toContain('player-visible');
    expect(filteredClientIds).not.toContain('player-out-of-range');
    expect(filteredClientIds).not.toContain('player-blocked');
    expect(filteredState.players.length).toBe(2);
  });
});
