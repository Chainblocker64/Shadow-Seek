import { Controller, Post, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { UserResponse, UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface JwtPayloadUser {
  sub: string;
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
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return await this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  update(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
  ): Promise<SafeUserResponse> {
    return this.userService.update(req.user.sub, dto);
  }
}
