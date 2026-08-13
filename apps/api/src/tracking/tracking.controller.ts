import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
  ) {}

  @Public()
  @Get(':token')
  getTracking(
    @Param('token', new ParseUUIDPipe())
    token: string,
  ) {
    return this.trackingService.findByToken(token);
  }
}