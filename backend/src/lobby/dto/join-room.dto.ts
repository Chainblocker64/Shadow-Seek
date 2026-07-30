import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import type { RoomId } from '../../shared/types';

export class JoinRoomDto {
  @IsUUID()
  roomId!: RoomId;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  username!: string;
}
