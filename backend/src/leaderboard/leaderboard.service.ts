import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { MoreThan, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import type { GameState } from '../game/types';

export type LeaderboardEntry = Pick<User, 'username' | 'wins'>;

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @OnEvent('game.ended')
  async handleGameEnded(gameState: GameState): Promise<void> {
    if (!gameState.winnerName) {
      return;
    }

    await this.userRepository.increment(
      { username: gameState.winnerName },
      'wins',
      1,
    );
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.userRepository.find({
      select: { username: true, wins: true },
      where: { wins: MoreThan(0) },
      order: { wins: 'DESC' },
    });
  }
}
