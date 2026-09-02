import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { UsersService } from '../../users/users.service';

import {
  IS_PUBLIC_KEY,
} from '../decorators/public.decorator';

export interface AuthUser {
  sub: string;
  email: string;
  role: 'ADMIN' | 'TECHNICIAN';
  tokenVersion: number;
}

export interface AuthenticatedRequest
  extends Request {
  user?: AuthUser;
}

@Injectable()
export class AuthGuard
  implements CanActivate
{
  constructor(
  private readonly jwtService: JwtService,
  private readonly reflector: Reflector,
  private readonly usersService: UsersService,
) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const isPublic =
      this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (isPublic) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    const token =
      this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Autenticación requerida.',
      );
    }

    try {
  const payload =
    await this.jwtService.verifyAsync<AuthUser>(
      token,
    );

  const user =
    await this.usersService.findById(
      payload.sub,
    );

  if (!user || !user.isActive) {
    throw new UnauthorizedException(
      'El usuario está desactivado.',
    );
  }

  if (
  payload.tokenVersion !==
  user.tokenVersion
) {
  throw new UnauthorizedException(
    'La sesión ya no es válida.',
  );
}

request.user = {
  sub: user.id,
  email: user.email,
  role: user.role,
  tokenVersion:
    user.tokenVersion,
};
} catch (error) {
  if (
    error instanceof UnauthorizedException
  ) {
    throw error;
  }

  throw new UnauthorizedException(
    'Token inválido o vencido.',
  );
}

    return true;
  }

  private extractTokenFromHeader(
    request: Request,
  ): string | undefined {
    const [type, token] =
      request.headers.authorization
        ?.split(' ') ?? [];

    return type === 'Bearer'
      ? token
      : undefined;
  }
}