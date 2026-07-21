import { Body, Controller, Post } from '@nestjs/common';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Post('create')
  async create(@Body createMapDto: CreateMapDto): Promise<MapResponseDto> {
    return await this.mapsService.create(createMapDto);
  }
}
