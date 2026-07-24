import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

export type UserResponse = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { email, username, password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = this.userRepository.create({
        email,
        username,
        password: hashedPassword,
      });
      const savedUser = await this.userRepository.save(user);

      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error: unknown) {
      const dbError = error as { code?: string; detail?: string };

      if (dbError.code === '23505') {
        if (dbError.detail?.includes('email')) {
          throw new ConflictException('Email already registered');
        }
        throw new ConflictException('Username already taken');
      }
      throw error;
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async update(userId: string, dto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username) {
      user.username = dto.username;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      await this.userRepository.save(user);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Username is already taken');
      }
      throw err;
    }

    const { password: _, ...result } = user;
    return result;
  }
}
