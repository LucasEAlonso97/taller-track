import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { Public } from './decorators/public.decorator';

import type { AuthenticatedRequest } from './guards/auth.guard';

import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { SetupDto } from './dto/setup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('setup')
  setup(
    @Body()
    body: SetupDto,
  ) {
    return this.authService.setup(body);
  }

  @Public()
  @Post('login')
  login(
    @Body()
    body: LoginDto,
  ) {
    return this.authService.login(body);
  }

  @Get('me')
  me(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return {
      user: request.user,
    };
  }

  @Patch('change-password')
  changePassword(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      request.user!.sub,
      body,
    );
  }
}