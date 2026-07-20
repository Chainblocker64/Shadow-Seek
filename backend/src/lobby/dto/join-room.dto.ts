import { IsUUID } from 'class-validator';
import type { RoomId } from '../types';

export class JoinRoomDto {
  @IsUUID()
  roomId!: RoomId;
}
