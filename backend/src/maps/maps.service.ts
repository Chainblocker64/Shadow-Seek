import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameMap } from './entities/map.entity';
import { CreateMapDto } from './dto/create-map.dto';
import { MapResponseDto } from './dto/map-response.dto';

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(GameMap)
    private mapsRepository: Repository<GameMap>,
  ) {}

  async create(createMapDto: CreateMapDto): Promise<MapResponseDto> {
    const { name, tiles, height, width } = createMapDto;
    const tilesWidth = tiles[0].length;
    const tilesHeight = tiles.length;
    if (tilesWidth !== width || tilesHeight !== height) {
      throw new Error(
        `Tiles dimensions (${tilesWidth}x${tilesHeight}) do not match specified width and height (${createMapDto.width}x${createMapDto.height})`,
      );
    }

    const map = this.mapsRepository.create({
      name,
      width,
      height,
      tiles,
    });

    const savedMap = await this.mapsRepository.save(map);

    return {
      id: savedMap.id,
      name: savedMap.name,
      width: savedMap.width,
      height: savedMap.height,
      tiles: savedMap.tiles,
      // TODO: Implement creatorId when user authentication is implemented
      creatorId: null,
      createdAt: savedMap.createdAt,
      updatedAt: savedMap.updatedAt,
    };
  }
}
