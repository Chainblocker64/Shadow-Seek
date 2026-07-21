import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    if (tiles.length === 0 || tiles[0].length === 0) {
      throw new BadRequestException('Tiles array cannot be empty');
    }
    const tilesWidth = tiles[0].length;
    const tilesHeight = tiles.length;
    if (tilesWidth !== width || tilesHeight !== height) {
      throw new BadRequestException(
        `Tiles dimensions (${tilesWidth}x${tilesHeight}) do not match specified width and height (${createMapDto.width}x${createMapDto.height})`,
      );
    }

    const map = this.mapsRepository.create({
      name,
      width,
      height,
      tiles,
      // TODO: Implement creator when user authentication is implemented
      creator: null,
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

  async findAll(): Promise<MapResponseDto[]> {
    const maps = await this.mapsRepository.find();

    return maps.map((map) => ({
      id: map.id,
      name: map.name,
      width: map.width,
      height: map.height,
      tiles: map.tiles,
      // TODO: Implement creatorId when user authentication is implemented
      creatorId: null,
      createdAt: map.createdAt,
      updatedAt: map.updatedAt,
    }));
  }

  async findOne(id: number): Promise<MapResponseDto> {
    const map = await this.mapsRepository.findOne({
      where: { id },
    });

    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }

    return {
      id: map.id,
      name: map.name,
      width: map.width,
      height: map.height,
      tiles: map.tiles,
      // TODO: Implement creatorId when user authentication is implemented
      creatorId: null,
      createdAt: map.createdAt,
      updatedAt: map.updatedAt,
    };
  }
}
