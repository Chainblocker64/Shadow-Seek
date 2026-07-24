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
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload';
import { CreateMapDto } from './dto/create-map.dto';
import { MapResponseDto } from './dto/map-response.dto';
import { MapsService } from './maps.service';
import { UpdateMapDto } from './dto/update-map.dto';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createMapDto: CreateMapDto,
    @Request() req: { user: JwtPayload },
  ): Promise<MapResponseDto> {
    return await this.mapsService.create(createMapDto, req.user.username);
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
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMapDto: UpdateMapDto,
  ): Promise<MapResponseDto> {
    return await this.mapsService.update(id, updateMapDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.mapsService.delete(id);
  }
}
