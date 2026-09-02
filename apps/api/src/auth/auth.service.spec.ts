import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  JwtService,
} from '@nestjs/jwt';

import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

jest.mock(
  '../users/users.service',
  () => ({
    UsersService: class {},
  }),
);

import {
  AuthService,
} from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  const usersServiceMock = {
    count:
      jest.fn<
        () => Promise<number>
      >(),

    createInitialAdmin:
      jest.fn<
        (input: {
          name: string;
          email: string;
          password: string;
        }) => Promise<unknown>
      >(),

    findByEmail:
      jest.fn<
        (
          email: string,
        ) => Promise<any>
      >(),

    verifyPassword:
      jest.fn<
        (
          password: string,
          passwordHash: string,
        ) => Promise<boolean>
      >(),

    changePassword:
      jest.fn<
        (
          userId: string,
          currentPassword: string,
          newPassword: string,
        ) => Promise<void>
      >(),
  };

  const jwtServiceMock = {
    signAsync:
      jest.fn<
        (
          payload:
            Record<string, unknown>,
        ) => Promise<string>
      >(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authService =
      new AuthService(
        usersServiceMock as never,
        jwtServiceMock as unknown as JwtService,
      );
  });

  it(
    'logs in an active user and includes tokenVersion',
    async () => {
      const user = {
        id: 'user-1',
        name: 'Lucas',
        email:
          'lucas@tallertrack.local',
        passwordHash:
          'stored-hash',
        role: 'ADMIN',
        isActive: true,
        tokenVersion: 3,
      };

      usersServiceMock
        .findByEmail
        .mockResolvedValue(
          user,
        );

      usersServiceMock
        .verifyPassword
        .mockResolvedValue(
          true,
        );

      jwtServiceMock
        .signAsync
        .mockResolvedValue(
          'jwt-token',
        );

      const result =
        await authService.login({
          email:
            user.email,
          password:
            'TallerTrack123!',
        });

      expect(
        jwtServiceMock.signAsync,
      ).toHaveBeenCalledWith({
        sub: 'user-1',
        email:
          'lucas@tallertrack.local',
        role: 'ADMIN',
        tokenVersion: 3,
      });

      expect(
        result.accessToken,
      ).toBe(
        'jwt-token',
      );
    },
  );

  it(
    'rejects an unknown user',
    async () => {
      usersServiceMock
        .findByEmail
        .mockResolvedValue(
          null,
        );

      await expect(
        authService.login({
          email:
            'noexiste@tallertrack.local',
          password:
            'incorrecta',
        }),
      ).rejects.toThrow(
        UnauthorizedException,
      );
    },
  );

  it(
    'rejects an inactive user',
    async () => {
      usersServiceMock
        .findByEmail
        .mockResolvedValue({
          id: 'user-1',
          name: 'Lucas',
          email:
            'lucas@tallertrack.local',
          passwordHash:
            'stored-hash',
          role: 'ADMIN',
          isActive: false,
          tokenVersion: 0,
        });

      await expect(
        authService.login({
          email:
            'lucas@tallertrack.local',
          password:
            'TallerTrack123!',
        }),
      ).rejects.toThrow(
        UnauthorizedException,
      );
    },
  );

  it(
    'rejects an incorrect password',
    async () => {
      usersServiceMock
        .findByEmail
        .mockResolvedValue({
          id: 'user-1',
          name: 'Lucas',
          email:
            'lucas@tallertrack.local',
          passwordHash:
            'stored-hash',
          role: 'ADMIN',
          isActive: true,
          tokenVersion: 0,
        });

      usersServiceMock
        .verifyPassword
        .mockResolvedValue(
          false,
        );

      await expect(
        authService.login({
          email:
            'lucas@tallertrack.local',
          password:
            'incorrecta',
        }),
      ).rejects.toThrow(
        UnauthorizedException,
      );
    },
  );

  it(
    'rejects setup when users already exist',
    async () => {
      usersServiceMock
        .count
        .mockResolvedValue(
          1,
        );

      await expect(
        authService.setup({
          name: 'Lucas',
          email:
            'lucas@tallertrack.local',
          password:
            'TallerTrack123!',
        }),
      ).rejects.toThrow(
        ConflictException,
      );
    },
  );

  it(
    'changes password through UsersService',
    async () => {
      usersServiceMock
        .changePassword
        .mockResolvedValue(
          undefined,
        );

      const result =
        await authService.changePassword(
          'user-1',
          {
            currentPassword:
              'old-password',
            newPassword:
              'new-password',
          },
        );

      expect(
        usersServiceMock
          .changePassword,
      ).toHaveBeenCalledWith(
        'user-1',
        'old-password',
        'new-password',
      );

      expect(result).toEqual({
        message:
          'Contraseña actualizada correctamente.',
      });
    },
  );
});