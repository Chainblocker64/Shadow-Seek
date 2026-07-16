import { ConflictException, Injectable } from '@nestjs/common';
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

  /**
   * Creates a new user
   *
   * @param createUserDto
   * @returns UserResponse
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { email, username, password } = createUserDto;

    // check for existing user - throw exception if one exists
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // create User object and save it
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    // remove password from savedUser and return it
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
