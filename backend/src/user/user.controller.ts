import {
  Controller,
  Post,
  Body,
  Patch,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UserResponse, UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as express from 'express';
import { AuthService } from '../auth/auth.service';

interface JwtPayloadUser {
  userId: string;
  username: string;
}

interface RequestWithUser extends Request {
  user: JwtPayloadUser;
}

interface SafeUserResponse {
  id: string;
  username: string;
  email: string;
}

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return await this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async update(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<SafeUserResponse> {
    const updatedUser = await this.userService.update(req.user.userId, dto);

    const token = this.authService.generateToken(updatedUser);

    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
    };
  }
}
