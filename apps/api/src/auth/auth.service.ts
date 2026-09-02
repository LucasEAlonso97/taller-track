import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async setup(input: SetupDto) {
    const userCount =
      await this.usersService.count();

    if (userCount > 0) {
      throw new ConflictException(
        'La configuración inicial ya fue realizada.',
      );
    }

    const user =
      await this.usersService.createInitialAdmin(
        input,
      );

    return {
      user,
    };
  }

  async login(input: LoginDto) {
    const user =
      await this.usersService.findByEmail(
        input.email,
      );

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Email o contraseña incorrectos.',
      );
    }

    const passwordIsValid =
      await this.usersService.verifyPassword(
        input.password,
        user.passwordHash,
      );

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'Email o contraseña incorrectos.',
      );
    }

    const accessToken =
  await this.jwtService.signAsync({
    sub: user.id,
    email: user.email,
    role: user.role,
    tokenVersion:
      user.tokenVersion,
  });

    return {
      accessToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async changePassword(
    userId: string,
    input: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      userId,
      input.currentPassword,
      input.newPassword,
    );

    return {
      message:
        'Contraseña actualizada correctamente.',
    };
  }
}