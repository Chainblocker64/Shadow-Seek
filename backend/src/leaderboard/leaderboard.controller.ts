import { Controller, Get } from '@nestjs/common';
import { LeaderboardEntry, LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async findAll(): Promise<LeaderboardEntry[]> {
    return this.leaderboardService.getLeaderboard();
  }
}
