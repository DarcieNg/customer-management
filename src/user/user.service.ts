import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = new User();
    user.email = createUserDto.email;
    user.username = createUserDto.username;
    user.password = createUserDto.password;
    user.role = createUserDto.role;
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | undefined> {
    const user: User = await this.userRepository.findOne({ where: { id: id } });
    if (user) return user;
    return undefined;
  }

  // Update only for current account
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (user) {
      await this.userRepository.update(id, updateUserDto);
    }
    return this.userRepository.findOne({ where: { id: id } });
  }

  async remove(id: number) {
    await this.userRepository.delete({ id: id });
  }
}
