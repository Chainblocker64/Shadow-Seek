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
import { UpdateMapDto } from './dto/update-map.dto';
import { MIN_SPAWN_TILES } from './types';

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(GameMap)
    private mapsRepository: Repository<GameMap>,
  ) {}

  async create(createMapDto: CreateMapDto): Promise<MapResponseDto> {
    const { name, baseTile, baseOverrides, objects, height, width } =
      createMapDto;
    this.validateCoordinates(width, height, baseOverrides, objects);
    this.validateSpawnTiles(objects);

    const map = this.mapsRepository.create({
      name,
      width,
      height,
      baseTile,
      baseOverrides,
      objects,
      // TODO: Implement creator when user authentication is implemented
      creator: null,
    });

    const savedMap = await this.mapsRepository.save(map);

    return {
      id: savedMap.id,
      name: savedMap.name,
      width: savedMap.width,
      height: savedMap.height,
      baseTile: savedMap.baseTile,
      baseOverrides: savedMap.baseOverrides,
      objects: savedMap.objects,
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
      baseTile: map.baseTile,
      baseOverrides: map.baseOverrides,
      objects: map.objects,
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
      baseTile: map.baseTile,
      baseOverrides: map.baseOverrides,
      objects: map.objects,
      // TODO: Implement creatorId when user authentication is implemented
      creatorId: null,
      createdAt: map.createdAt,
      updatedAt: map.updatedAt,
    };
  }

  async findOneByName(name: string): Promise<MapResponseDto> {
    const map = await this.mapsRepository.findOne({
      where: { name },
    });

    if (!map) {
      throw new NotFoundException(`Map with name "${name}" not found`);
    }

    return {
      id: map.id,
      name: map.name,
      width: map.width,
      height: map.height,
      baseTile: map.baseTile,
      baseOverrides: map.baseOverrides,
      objects: map.objects,
      creatorId: null,
      createdAt: map.createdAt,
      updatedAt: map.updatedAt,
    };
  }

  async update(
    id: number,
    updateMapDto: UpdateMapDto,
  ): Promise<MapResponseDto> {
    const map = await this.mapsRepository.findOne({
      where: { id },
    });

    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }

    const name = updateMapDto.name ?? map.name;
    const width = updateMapDto.width ?? map.width;
    const height = updateMapDto.height ?? map.height;
    const baseTile = updateMapDto.baseTile ?? map.baseTile;
    const baseOverrides = updateMapDto.baseOverrides ?? map.baseOverrides;
    const objects = updateMapDto.objects ?? map.objects;

    this.validateCoordinates(width, height, baseOverrides, objects);
    this.validateSpawnTiles(objects);

    map.name = name;
    map.width = width;
    map.height = height;
    map.baseTile = baseTile;
    map.baseOverrides = baseOverrides;
    map.objects = objects;

    const updatedMap = await this.mapsRepository.save(map);

    return {
      id: updatedMap.id,
      name: updatedMap.name,
      width: updatedMap.width,
      height: updatedMap.height,
      baseTile: updatedMap.baseTile,
      baseOverrides: updatedMap.baseOverrides,
      objects: updatedMap.objects,
      creatorId: null,
      createdAt: updatedMap.createdAt,
      updatedAt: updatedMap.updatedAt,
    };
  }

  async delete(id: number): Promise<void> {
    const result = await this.mapsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }
  }

  private validateCoordinates(
    width: number,
    height: number,
    baseOverrides: Array<{ x: number; y: number }>,
    objects: Array<{ x: number; y: number }>,
  ) {
    for (const tile of [...baseOverrides, ...objects]) {
      if (tile.x < 0 || tile.y < 0 || tile.x >= width || tile.y >= height) {
        throw new BadRequestException(
          `Map coordinate (${tile.x},${tile.y}) is outside the map dimensions`,
        );
      }
    }
  }

  private validateSpawnTiles(objects: Array<{ type: string }>) {
    const spawnCount = objects.filter(
      (object) => object.type === 'spawn',
    ).length;
    if (spawnCount < MIN_SPAWN_TILES) {
      throw new BadRequestException(
        `Map must contain at least ${MIN_SPAWN_TILES} spawn points, but found ${spawnCount}`,
      );
    }
  }
}
