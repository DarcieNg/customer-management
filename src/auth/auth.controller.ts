import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticateDto } from './dto/auth.dto';
import { Response } from 'express';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth - Login')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiBody({
    type: AuthenticateDto,
    examples: {
      user_1: {
        value: {
          "username": "Duong",
          "password": "Duong@123"
        }
      },
      user_2: {
        value: {
          "username": "An",
          "password": "Matkhau@1122"
        }
      },
      user_3: {
        value: {
          "username": "Tu",
          "password": "Matkhau@1122",
        }
      }
    }
  })
  async login(@Res() res: Response, @Body() authenticateDto: AuthenticateDto) {
    try {
      const response = await this.authService.authenticate(authenticateDto);
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      return res.status(e.status).json(e.response);
    }
  }
}
