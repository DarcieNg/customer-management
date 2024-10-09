import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../roles/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) { };

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      // Check required roles
      const roles = this.reflector.get(Roles, context.getHandler());

      if (!roles) return true;

      // If require roles, does user has token
      const request = context.switchToHttp().getRequest();

      const token = this.extractTokenFromHeader(request);

      if (!token) return false;

      // If has token, does user has required role, extract user information using jwt service
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'secrete'
      });

      return roles.some((role) => payload.role?.includes(role));
      
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
