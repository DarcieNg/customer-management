import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Res, HttpException, HttpStatus, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from 'src/auth/role/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Role } from 'src/enum/roles.enum';
import { Request, Response } from 'express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiBearerAuth()
  @ApiBody({
    type: CreateUserDto,
    examples: {
      user_1: {
        value: {
          "username": "Duong",
          "email": "duongnguyen@gmail.com",
          "password": "Duong@123",
          "role": "admin"
        }, 
      },
      user_2: {
        value: {
          "username": "An",
          "email": "an.trung@gmail.com",
          "password": "Matkhau@1122",
          "role": "sale company"
        }
      },
      user_3: {
        value: {
          "username": "Tu",
          "email": "tu.vylam@gmail.com",
          "password": "Matkhau@1122",
          "role": "sale personal"
        }
      },
    }
  })
  @ApiCreatedResponse({
    description: "Created successfully",
    type: User
  })
  @ApiBadRequestResponse({
    description: "Invalid request"
  })
  @ApiForbiddenResponse({
    description: "Error creating user"
  })
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    try {
      const newUser = this.userService.create(createUserDto);

      if (!newUser) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: "Invalid request"
        });
      }

      return res.status(HttpStatus.CREATED).json({
        message: "Created successfully",
        user: newUser
      });
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'Error creating user',
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Get()
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({summary: "Get all users - Apply only with user's role admin"})
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "Read users successfully",
    type: [User]
  })
  @ApiBadRequestResponse({
    description: "Invalid request"
  })
  @ApiForbiddenResponse({
    description: "Error getting users"
  })
  async findAll(@Res() res: Response) {
    try {
      const users = await this.userService.findAll();

      if (users.length > 0) {
        return res.status(HttpStatus.OK).json({
          message: "Read users successfully",
          users: users
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: "Invalid request",
        });
      }
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'Error getting users',
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Get(':id')
  @Roles([Role.ADMIN, Role.SALE_COMPANY, Role.SALE_PERSONAL])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: "Get user by id - Apply only with user's role admin and get information of current user" })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: `Get user by id successfully`,
    type: User
  })
  @ApiNotFoundResponse({
    description: `User id not found`
  })
  @ApiForbiddenResponse({
    description: `Error getting user by id`
  })
  async findOne(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const currentUser = req.user;

      const user = await this.userService.findOne(+id);

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: `User ${id} not found`,
        });
      }

      if (currentUser["id"] !== user.id && currentUser["role"] !== "admin") {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: `Current user cannot get information of another account with id ${id}`,
        });
      }

      return res.status(HttpStatus.OK).json({
        message: `Get user by id ${id} successfully`,
        user: user
      });
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Error getting user by id ${id}`,
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Patch(':id')
  @Roles([Role.ADMIN, Role.SALE_COMPANY, Role.SALE_PERSONAL])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: "Update user by id - Apply only for update current user's account" })
  @ApiBearerAuth()
  @ApiBody({
    type: CreateUserDto,
    examples: {
      user_1: {
        value: {
          "username": "Duong",
          "email": "duongnguyen@gmail.com",
          "password": "Duong@update1",
          "role": "admin"
        }
      }
    }
  })
  @ApiOkResponse({
    description: `Update user by id successfully`,
    type: User
  })
  @ApiNotFoundResponse({
    description: `User id not found`
  })
  @ApiUnauthorizedResponse({
    description: "Current user cannot modify another account with id ${id}"
  })
  @ApiBadRequestResponse({
    description: `Could not update user id`,
  })
  @ApiForbiddenResponse({
    description: `Error updating user by id`
  })
  async update(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    try {
      const currentUserId = req.user['id'];

      const user = await this.userService.findOne(+id);

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: `User ${id} not found`,
        });
      }

      if (currentUserId !== user.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: `Current user cannot modify another account with id ${id}`,
        });
      }

      const updateUser = await this.userService.update(+id, updateUserDto);

      if (!updateUser) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Could not update user ${id}`,
        });
      }

      return res.status(HttpStatus.OK).json(updateUser);
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Error updating user by id ${id}`,
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Delete(':id')
  @Roles([Role.ADMIN])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({summary: 'Delete user - Only apply for user delete their own account'})
  @ApiBearerAuth()
  @ApiOkResponse({
    description: `Delete user by id successfully`,
    type: User
  })
  @ApiNotFoundResponse({
    description: `User id not found`
  })
  @ApiForbiddenResponse({
    description: `Error deleting user by id`
  })
  async remove(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const currentUserId = req.user["id"];

      const user = await this.userService.findOne(+id);

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: `User ${id} not found`,
        });
      }

      if (currentUserId !== id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: `Current user cannot delete another account with id ${id}`,
        });
      }

      const deleteUser = await this.userService.remove(+id);

      return res.status(HttpStatus.OK).json({
        message: `Delete user by id ${id} successfully`,
        user: deleteUser
      });
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Error deleting user by id ${id}`,
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }
}
