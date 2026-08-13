import {
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedRequest } from './guards/auth.guard';

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
}