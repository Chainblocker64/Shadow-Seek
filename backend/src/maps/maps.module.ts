import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMap } from './entities/map.entity';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameMap])],
  exports: [TypeOrmModule],
  providers: [MapsService],
  controllers: [MapsController],
})
export class MapsModule {}
