import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import type {
  AuthenticatedRequest,
} from './auth.guard';

import {
  type AppRole,
  ROLES_KEY,
} from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<
        AppRole[]
      >(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (
      !requiredRoles ||
      requiredRoles.length === 0
    ) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'Autenticación requerida.',
      );
    }

    if (
      !requiredRoles.includes(
        user.role,
      )
    ) {
      throw new ForbiddenException(
        'No tenés permisos para realizar esta acción.',
      );
    }

    return true;
  }
}