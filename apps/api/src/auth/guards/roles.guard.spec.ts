import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

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
  RolesGuard,
} from './roles.guard';

import type {
  AuthenticatedRequest,
} from './auth.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const reflectorMock = {
    getAllAndOverride:
      jest.fn<
        () => Array<
          'ADMIN' | 'TECHNICIAN'
        > | undefined
      >(),
  };

  const createContext = (
    user?: AuthenticatedRequest['user'],
  ) => {
    const request = {
      user,
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

    return context;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    guard =
      new RolesGuard(
        reflectorMock as unknown as Reflector,
      );
  });

  it(
    'allows access when no roles are required',
    () => {
      reflectorMock
        .getAllAndOverride
        .mockReturnValue(
          undefined,
        );

      const result =
        guard.canActivate(
          createContext(),
        );

      expect(result).toBe(true);
    },
  );

  it(
    'rejects when a protected route has no authenticated user',
    () => {
      reflectorMock
        .getAllAndOverride
        .mockReturnValue([
          'ADMIN',
        ]);

      expect(() =>
        guard.canActivate(
          createContext(),
        ),
      ).toThrow(
        UnauthorizedException,
      );
    },
  );

  it(
    'allows ADMIN on an ADMIN route',
    () => {
      reflectorMock
        .getAllAndOverride
        .mockReturnValue([
          'ADMIN',
        ]);

      const result =
        guard.canActivate(
          createContext({
            sub: 'admin-1',
            email:
              'admin@tallertrack.local',
            role: 'ADMIN',
            tokenVersion: 1,
          }),
        );

      expect(result).toBe(true);
    },
  );

  it(
    'rejects TECHNICIAN on an ADMIN route',
    () => {
      reflectorMock
        .getAllAndOverride
        .mockReturnValue([
          'ADMIN',
        ]);

      expect(() =>
        guard.canActivate(
          createContext({
            sub: 'tech-1',
            email:
              'tecnico@tallertrack.local',
            role: 'TECHNICIAN',
            tokenVersion: 1,
          }),
        ),
      ).toThrow(
        ForbiddenException,
      );
    },
  );

  it(
    'allows TECHNICIAN on a TECHNICIAN route',
    () => {
      reflectorMock
        .getAllAndOverride
        .mockReturnValue([
          'TECHNICIAN',
        ]);

      const result =
        guard.canActivate(
          createContext({
            sub: 'tech-1',
            email:
              'tecnico@tallertrack.local',
            role: 'TECHNICIAN',
            tokenVersion: 1,
          }),
        );

      expect(result).toBe(true);
    },
  );

  it(
    'allows either role when both are accepted',
    () => {
      reflectorMock
        .getAllAndOverride
        .mockReturnValue([
          'ADMIN',
          'TECHNICIAN',
        ]);

      const result =
        guard.canActivate(
          createContext({
            sub: 'tech-1',
            email:
              'tecnico@tallertrack.local',
            role: 'TECHNICIAN',
            tokenVersion: 1,
          }),
        );

      expect(result).toBe(true);
    },
  );
});