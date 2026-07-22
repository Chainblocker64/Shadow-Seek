import { IsUUID } from 'class-validator';
import type { RoomId } from '../../shared/types';

export class JoinRoomDto {
  @IsUUID()
  roomId!: RoomId;
}
