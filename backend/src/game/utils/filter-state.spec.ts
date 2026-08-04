import { filterGameStateForPlayer } from './filter-state';
import { Player } from '../player/player';
import { GameState, MapObject } from '../types';

describe('filterGameStateForPlayer', () => {
  let viewer: Player;
  let otherPlayerVisible: Player;
  let otherPlayerOutOfRange: Player;
  let otherPlayerBlocked: Player;
  let mockMapObjects: MapObject[];

  beforeEach(() => {
    // Viewer at (0, 0) with a vision range of 5
    viewer = new Player({
      clientId: 'viewer-1',
      name: 'Viewer',
      position: { x: 0, y: 0 },
      visionRange: 5,
    });

    // Player within range and clear line of sight at (1, 1)
    otherPlayerVisible = new Player({
      clientId: 'player-visible',
      name: 'Visible Player',
      position: { x: 1, y: 1 },
    });

    // Player outside vision range at (10, 10)
    otherPlayerOutOfRange = new Player({
      clientId: 'player-out-of-range',
      name: 'Far Player',
      position: { x: 10, y: 10 },
    });

    // Player within range at (3, 3), but blocked by a wall at (2, 2)
    otherPlayerBlocked = new Player({
      clientId: 'player-blocked',
      name: 'Blocked Player',
      position: { x: 3, y: 3 },
    });

    mockMapObjects = [
      { x: 2, y: 2, type: 'wall' }, // Blocks line of sight to (3, 3)
    ];
  });

  it('should include the viewer and visible players while filtering out hidden ones', () => {
    const gameState: GameState = {
      roomId: '123e4567-e89b-12d3-a456-426614174000',
      status: 'running',
      endsAt: null,
      winner: null,
      winnerName: null,
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

    // Expect to find viewer and the visible player, but NOT the out-of-range or blocked player
    const filteredClientIds = filteredState.players.map((p) => p.clientId);

    expect(filteredClientIds).toContain('viewer-1');
    expect(filteredClientIds).toContain('player-visible');
    expect(filteredClientIds).not.toContain('player-out-of-range');
    expect(filteredClientIds).not.toContain('player-blocked');
    expect(filteredState.players.length).toBe(2);
  });
});
