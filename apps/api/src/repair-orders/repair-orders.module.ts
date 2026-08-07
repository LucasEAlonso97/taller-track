import { Module } from '@nestjs/common';
import { RepairOrdersController } from './repair-orders.controller';
import { RepairOrdersService } from './repair-orders.service';

@Module({
  controllers: [RepairOrdersController],
  providers: [RepairOrdersService],
})
export class RepairOrdersModule {}