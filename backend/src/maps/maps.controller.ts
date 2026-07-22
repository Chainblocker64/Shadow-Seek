import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMapDto } from './dto/create-map.dto';
import { MapResponseDto } from './dto/map-response.dto';
import { MapsService } from './maps.service';
import { UpdateMapDto } from './dto/update-map.dto';

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

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMapDto: UpdateMapDto,
  ): Promise<MapResponseDto> {
    return await this.mapsService.update(id, updateMapDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.mapsService.delete(id);
  }
}
