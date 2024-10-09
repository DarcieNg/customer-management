import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticateDto } from './dto/auth.dto';
import { AuthenticateInterface } from './interface/auth.interface';
import { UserService } from 'src/user/user.service';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService
  ) { };

  async authenticate(authenticateDto: AuthenticateDto): Promise<AuthenticateInterface> {
    const users = await this.userService.findAll();

    const user = users.find((u) => {
      return (
        u.username == authenticateDto.username
        && u.password == authenticateDto.password
      );
    });

    if (!user) throw new NotFoundException('Invalid credentials');

    const token = sign({...user}, 'secrete');

    return {
      user: user,
      token: token
    };
  }
}
