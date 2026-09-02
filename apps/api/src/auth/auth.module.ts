import { Module } from '@nestjs/common';
import {
  ConfigService,
} from '@nestjs/config';
import {
  APP_GUARD,
} from '@nestjs/core';
import {
  JwtModule,
} from '@nestjs/jwt';
import {
  ThrottlerModule,
} from '@nestjs/throttler';

import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 5,
      },
    ]),

    JwtModule.registerAsync({
      inject: [
        ConfigService,
      ],

      useFactory: (
        configService:
          ConfigService,
      ) => ({
        secret:
          configService.getOrThrow<string>(
            'JWT_SECRET',
          ),

        signOptions: {
          expiresIn:
            60 * 60 * 8,
        },
      }),
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,

    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],

  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule {}