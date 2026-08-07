import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRepairOrderDto } from './dto/create-repair-order.dto';
import { UpdateRepairStatusDto } from './dto/update-repair-status.dto';
import { RepairOrdersService } from './repair-orders.service';

@Controller('repair-orders')
export class RepairOrdersController {
  constructor(
    private readonly repairOrdersService:
      RepairOrdersService,
  ) {}

  @Post()
  create(
    @Body()
    createRepairOrderDto: CreateRepairOrderDto,
  ) {
    return this.repairOrdersService.create(
      createRepairOrderDto,
    );
  }

  @Get()
  findAll() {
    return this.repairOrdersService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.repairOrdersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,

    @Body()
    updateRepairStatusDto: UpdateRepairStatusDto,
  ) {
    return this.repairOrdersService.updateStatus(
      id,
      updateRepairStatusDto,
    );
  }
}