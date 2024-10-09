import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Res, HttpStatus, HttpException, Query, Req } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Role } from 'src/enum/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuard } from 'src/auth/role/role.guard';
import { Request, Response } from 'express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Customer } from './entities/customer.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
  ) { }

  @Post()
  @Roles([Role.ADMIN, Role.SALE_COMPANY, Role.SALE_PERSONAL])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiBody({
    type: CreateUserDto,
    examples: {
      customer_1: {
        value: {
          "name": "Customer A",
          "address": [
            "IDMC Building, Hanoi",
          ],
          "type": "company"
        }
      },
      customer_2: {
        value: {
          "name": "Customer B Personal",
          "address": [
            "Nguyen Van Linh street, District 7, Hochiminh city",
          ],
          "type": "personal"
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: "Customer created successfully",
    type: Customer
  })
  @ApiBadRequestResponse({
    description: "Invalid request"
  })
  @ApiForbiddenResponse({
    description: "Error creating user"
  })
  async create(@Res() res: Response, @Body() createCustomerDto: CreateCustomerDto) {
    try {
      const newCustomer = await this.customerService.create(createCustomerDto);

      if (!newCustomer) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: "Invalid request"
        });
      }

      return res.status(HttpStatus.CREATED).json({
        message: "Customer created successfully",
        customer: newCustomer
      });
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'Error creating customer',
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Get('type')
  @Roles([Role.ADMIN, Role.SALE_COMPANY, Role.SALE_PERSONAL])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get all customers by customer\'s type' })
  @ApiBearerAuth()
  @ApiQuery(
    {
      name: 'type',
      type: 'string'
    }
  )
  @ApiOkResponse({
    description: "Read customers successfully",
    type: [Customer]
  })
  @ApiBadRequestResponse({
    description: "Invalid request"
  })
  @ApiForbiddenResponse({
    description: "Error getting customers by type"
  })
  async findAllByType(@Req() req: Request, @Res() res: Response, @Query('type') type: string) {
    try {
      const role = req.user["role"];

      console.log("Role", role);

      if ((role === Role.SALE_PERSONAL && type === "company") || (role === Role.SALE_COMPANY && type === "personal")) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Invalid request, customer type ${type} conflict with user role ${role}`,
        });
      }

      const customers = await this.customerService.findAll(type);

      if (customers.length > 0) {
        return res.status(HttpStatus.OK).json({
          message: "Read customers successfully",
          customers: customers
        });
      } else if (customers.length === 0) {
        return res.status(HttpStatus.OK).json({
          message: "No customers found",
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: "Invalid request",
        });
      }
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Error getting customers by ${type}`,
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Get()
  @Roles([Role.ADMIN, Role.SALE_COMPANY, Role.SALE_PERSONAL])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get all customers based on user\'s role - e.g., role=\"sale personal\", only get customer type=personal' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "Read customers successfully",
    type: [Customer]
  })
  @ApiBadRequestResponse({
    description: "Invalid request"
  })
  @ApiForbiddenResponse({
    description: "Error getting customers"
  })
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const role = req.user["role"];

      console.log("role", role);

      let type = null;

      if (role === Role.SALE_PERSONAL) {
        type = "personal";
      } else if (role === Role.SALE_COMPANY) {
        type = "company";
      }

      const customers = await this.customerService.findAll(type);

      if (customers.length > 0) {
        return res.status(HttpStatus.OK).json(customers);
      } else if (customers.length === 0) {
        return res.status(HttpStatus.OK).json({
          message: "No customers found",
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: "Invalid request",
        });
      }
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'Error getting customers',
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Get(':id')
  @Roles([Role.ADMIN, Role.SALE_COMPANY, Role.SALE_PERSONAL])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get customer by id based on role' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "Read customer by id successfully",
    type: Customer
  })
  @ApiNotFoundResponse({
    description: "Customer id not found"
  })
  @ApiBadRequestResponse({
    description: "Invalid request, customer id ${id}, type ${customer.type} conflict with user role ${role}"
  })
  @ApiForbiddenResponse({
    description: "Error getting customer by id"
  })
  async findOne(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const role = req.user["role"];

      const customer = await this.customerService.findOne(+id);

      if (!customer) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: `Customer ${id} not found`,
        });
      }

      if ((customer.type === "personal" && role === Role.SALE_COMPANY) || (customer.type === "company" && role === Role.SALE_PERSONAL)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Invalid request, customer id ${id}, type ${customer.type} conflict with user role ${role}`,
        });
      }

      return res.status(HttpStatus.OK).json(customer);
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Error getting customer by id ${id}`,
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Patch(':id')
  @Roles([Role.ADMIN, Role.SALE_COMPANY, Role.SALE_PERSONAL])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Update customer based on role' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      customer_1: {
        value: {
          "name": "Customer A",
          "address": [
            "IDMC Building, Hanoi",
            "TTC Building, Hanoi"
          ],
          "type": "company"
        }
      }
    }
  })
  @ApiOkResponse({
    description: "Update customer by id successfully",
    type: Customer
  })
  @ApiNotFoundResponse({
    description: "Customer id not found"
  })
  @ApiBadRequestResponse({
    description: "Could not update customer ${id}"
  })
  @ApiForbiddenResponse({
    description: "Error getting customer by id"
  })
  async update(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number, @Body() updateCustomerDto: UpdateCustomerDto) {
    try {
      const customer = await this.findOne(req, res, +id);

      if (!customer) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: `Customer ${id} not found`,
        });
      }

      const updateCustomer = await this.customerService.update(+id, updateCustomerDto);

      if (!updateCustomer) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Could not update customer ${id}`,
        });
      }

      return res.status(HttpStatus.OK).json({
        message: `Update customer by ${id} successfully`,
        customer: updateCustomer
      });
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Error updating customer by id ${id}`,
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }

  @Delete(':id')
  @Roles([Role.ADMIN, Role.SALE_COMPANY, Role.SALE_PERSONAL])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Delete customer based on role' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "Delete customer id successfully",
    type: Customer
  })
  @ApiNotFoundResponse({
    description: "Customer id not found"
  })
  @ApiForbiddenResponse({
    description: "Error deleting customer by id"
  })
  async remove(@Req() req: Request, @Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const customer = await this.findOne(req, res, +id);

      if (!customer) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: `Customer ${id} not found`,
        });
      }

      const deleteCustomer = await this.customerService.remove(+id);

      return res.status(HttpStatus.OK).json({
        message: `Delete customer id ${id} successfully`,
        customer: deleteCustomer
      });
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Error deleting customer by id ${id}`,
      }, HttpStatus.FORBIDDEN, {
        cause: err
      });
    }
  }
}
