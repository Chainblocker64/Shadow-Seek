import { Module } from '@nestjs/common';
import { LobbyModule } from '../lobby/lobby.module';
import { MapsModule } from '../maps/maps.module';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [LobbyModule, MapsModule],
  providers: [GameGateway, GameService],
})
export class GameModule {}
