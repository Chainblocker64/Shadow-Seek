import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMap } from './entities/map.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameMap])],
  exports: [TypeOrmModule],
})
export class MapsModule {}