import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('Role Guard Debug:', {
      requiredRoles,
      userRole: user?.role,
      user: user,
    });

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    
    console.log('Role check result:', { hasRole, userRole: user.role, requiredRoles });
    
    if (!hasRole) {
      throw new ForbiddenException('Access Denied - Insufficient permissions');
    }

    return true;
  }
}
