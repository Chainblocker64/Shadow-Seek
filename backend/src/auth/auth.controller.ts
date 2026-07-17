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
import { LoginUserDto } from '../user/dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './types/jwt-payload';
import type { Response } from 'express';
import * as express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(loginDto);

    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 3600000, // 1h
    });

    return { message: 'Logged in successfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: { user: JwtPayload }) {
    return req.user;
  }
}
