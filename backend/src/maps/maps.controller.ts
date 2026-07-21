import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateMapDto } from './dto/create-map.dto';
import { MapResponseDto } from './dto/map-response.dto';
import { MapsService } from './maps.service';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Post('create')
  async create(@Body() createMapDto: CreateMapDto): Promise<MapResponseDto> {
    return await this.mapsService.create(createMapDto);
  }

  @Get()
  async findAll(): Promise<MapResponseDto[]> {
    return await this.mapsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MapResponseDto> {
    return await this.mapsService.findOne(id);
  }
}
