import { Reflector } from '@nestjs/core';
import { Role } from 'src/enum/roles.enum';

export const Roles = Reflector.createDecorator<Role[]>();