import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  login(user: { id: string; email: string; username: string }): {
    access_token: string;
  } {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user: User | null = await this.userService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  generateToken(user: { id: string; username: string; email: string }) {
    if (!user.id) {
      throw new Error('AuthService.generateToken called without a user id!');
    }
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
