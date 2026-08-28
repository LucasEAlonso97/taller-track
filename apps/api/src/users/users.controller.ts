import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';

import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

import { UsersService } from './users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  createTechnician(
    @Body()
    body: CreateTechnicianDto,
  ) {
    return this.usersService.createTechnician(
      body,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @Body()
    body: UpdateUserStatusDto,
  ) {
    return this.usersService.updateTechnicianStatus(
      id,
      body.isActive,
    );
  }

  @Patch(':id/reset-password')
resetPassword(
  @Param('id', new ParseUUIDPipe())
  id: string,

  @Body()
  body: ResetPasswordDto,
) {
  return this.usersService
    .resetTechnicianPassword(
      id,
      body.newPassword,
    )
    .then(() => ({
      message:
        'Contraseña restablecida correctamente.',
    }));
}
}