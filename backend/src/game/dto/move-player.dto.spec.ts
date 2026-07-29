import { validate } from 'class-validator';
import { MovePlayerDto } from './move-player.dto';

describe('MovePlayerDto', () => {
  it('accepts a supported movement direction', async () => {
    const dto = Object.assign(new MovePlayerDto(), {
      direction: 'up',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an unsupported movement direction', async () => {
    const dto = Object.assign(new MovePlayerDto(), {
      direction: 'teleport',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('direction');
  });

  it('rejects a missing movement direction', async () => {
    const dto = new MovePlayerDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('direction');
  });
});
