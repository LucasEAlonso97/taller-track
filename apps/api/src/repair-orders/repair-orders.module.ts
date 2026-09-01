import {
  Module,
} from '@nestjs/common';

import {
  CloudinaryService,
} from '../storage/cloudinary.service';

import {
  RepairOrdersController,
} from './repair-orders.controller';

import {
  RepairOrdersService,
} from './repair-orders.service';

@Module({
  controllers: [
    RepairOrdersController,
  ],

  providers: [
    RepairOrdersService,
    CloudinaryService,
  ],
})
export class RepairOrdersModule {}