import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameMap } from './entities/map.entity';

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(GameMap)
    private userRepository: Repository<GameMap>,
  ) {}

  async create(createMapDto: CreateMapDto): Promise<MapResponseDto> {}
}
