import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ThrottlerBehindProxyGuard,
} from './guards/throttler-behind-proxy.guard';

import { AuthService } from './auth.service';

import { Public } from './decorators/public.decorator';

import {
  ChangePasswordDto,
} from './dto/change-password.dto';
import {
  LoginDto,
} from './dto/login.dto';
import {
  SetupDto,
} from './dto/setup.dto';

import type {
  AuthenticatedRequest,
} from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,
  ) {}

  @Public()
  @Post('setup')
  setup(
    @Body()
    body: SetupDto,
  ) {
    return this.authService.setup(
      body,
    );
  }

  @Public()
 @UseGuards(
  ThrottlerBehindProxyGuard,
)
  @Post('login')
  login(
    @Body()
    body: LoginDto,
  ) {
    return this.authService.login(
      body,
    );
  }

  @Get('me')
  me(
    @Req()
    request:
      AuthenticatedRequest,
  ) {
    return {
      user:
        request.user,
    };
  }

  @Patch('change-password')
  changePassword(
    @Req()
    request:
      AuthenticatedRequest,

    @Body()
    body:
      ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      request.user!.sub,
      body,
    );
  }
}