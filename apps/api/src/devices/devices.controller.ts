import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';

import { CreateDeviceDto } from './dto/create-device.dto';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
  ) {}

  @Post()
  create(
    @Body()
    createDeviceDto: CreateDeviceDto,
  ) {
    return this.devicesService.create(
      createDeviceDto,
    );
  }

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.devicesService.findOne(id);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.devicesService.remove(id);
  }
}