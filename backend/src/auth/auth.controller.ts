import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './types/jwt-payload';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import * as express from 'express';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Request() req: { user: Omit<User, 'password'> },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(req.user);

    // auth token cookie
    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000, // 1h
    });

    return { message: 'Logged in successfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(
    @Request() req: { user: JwtPayload },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    // create clean cookie for rolling session
    const token = this.authService.generateToken({
      id: req.user.id,
      username: req.user.username,
    });

    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000, // 1h
    });

    return req.user;
  }
}
