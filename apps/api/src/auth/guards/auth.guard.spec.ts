import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  Reflector,
} from '@nestjs/core';

import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  AuthGuard,
  AuthenticatedRequest,
} from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

const jwtServiceMock = {
  verifyAsync:
    jest.fn<
      (
        token: string,
      ) => Promise<any>
    >(),
};

const reflectorMock = {
  getAllAndOverride:
    jest.fn<
      () => boolean
    >(),
};

const usersServiceMock = {
  findById:
    jest.fn<
      (
        id: string,
      ) => Promise<any>
    >(),
};

  const createContext = (
    authorization?: string,
  ) => {
    const request = {
      headers: {
        authorization,
      },
    } as AuthenticatedRequest;

    const context = {
      getHandler:
        jest.fn(),

      getClass:
        jest.fn(),

      switchToHttp:
        jest.fn(() => ({
          getRequest:
            () => request,
        })),
    } as unknown as ExecutionContext;

    return {
      context,
      request,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    reflectorMock
      .getAllAndOverride
      .mockReturnValue(false);

    guard =
      new AuthGuard(
        jwtServiceMock as unknown as JwtService,
        reflectorMock as unknown as Reflector,
        usersServiceMock as never,
      );
  });

  it(
    'allows public routes without authentication',
    async () => {
      reflectorMock
        .getAllAndOverride
        .mockReturnValue(true);

      const {
        context,
      } = createContext();

      const result =
        await guard.canActivate(
          context,
        );

      expect(result).toBe(true);

      expect(
        jwtServiceMock.verifyAsync,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    'rejects requests without a bearer token',
    async () => {
      const {
        context,
      } = createContext();

      await expect(
        guard.canActivate(
          context,
        ),
      ).rejects.toThrow(
        UnauthorizedException,
      );
    },
  );

  it(
    'allows a valid token with current tokenVersion',
    async () => {
      const {
        context,
        request,
      } = createContext(
        'Bearer valid-token',
      );

      jwtServiceMock
        .verifyAsync
        .mockResolvedValue({
          sub: 'user-1',
          email:
            'lucas@tallertrack.local',
          role: 'ADMIN',
          tokenVersion: 3,
        });

      usersServiceMock
        .findById
        .mockResolvedValue({
          id: 'user-1',
          email:
            'lucas@tallertrack.local',
          role: 'ADMIN',
          isActive: true,
          tokenVersion: 3,
        });

      const result =
        await guard.canActivate(
          context,
        );

      expect(result).toBe(true);

      expect(
        request.user,
      ).toEqual({
        sub: 'user-1',
        email:
          'lucas@tallertrack.local',
        role: 'ADMIN',
        tokenVersion: 3,
      });
    },
  );

  it(
    'rejects a token with an outdated tokenVersion',
    async () => {
      const {
        context,
      } = createContext(
        'Bearer old-token',
      );

      jwtServiceMock
        .verifyAsync
        .mockResolvedValue({
          sub: 'user-1',
          email:
            'lucas@tallertrack.local',
          role: 'ADMIN',
          tokenVersion: 2,
        });

      usersServiceMock
        .findById
        .mockResolvedValue({
          id: 'user-1',
          email:
            'lucas@tallertrack.local',
          role: 'ADMIN',
          isActive: true,
          tokenVersion: 3,
        });

      await expect(
        guard.canActivate(
          context,
        ),
      ).rejects.toThrow(
        'La sesión ya no es válida.',
      );
    },
  );

  it(
    'rejects an inactive user',
    async () => {
      const {
        context,
      } = createContext(
        'Bearer valid-token',
      );

      jwtServiceMock
        .verifyAsync
        .mockResolvedValue({
          sub: 'user-1',
          email:
            'lucas@tallertrack.local',
          role: 'ADMIN',
          tokenVersion: 3,
        });

      usersServiceMock
        .findById
        .mockResolvedValue({
          id: 'user-1',
          email:
            'lucas@tallertrack.local',
          role: 'ADMIN',
          isActive: false,
          tokenVersion: 3,
        });

      await expect(
        guard.canActivate(
          context,
        ),
      ).rejects.toThrow(
        'El usuario está desactivado.',
      );
    },
  );

  it(
    'rejects an invalid JWT',
    async () => {
      const {
        context,
      } = createContext(
        'Bearer invalid-token',
      );

      jwtServiceMock
        .verifyAsync
        .mockRejectedValue(
          new Error(
            'invalid signature',
          ),
        );

      await expect(
        guard.canActivate(
          context,
        ),
      ).rejects.toThrow(
        'Token inválido o vencido.',
      );
    },
  );
});