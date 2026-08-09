import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly trackingService:
      TrackingService,
  ) {}

  @Get(':token')
  findByToken(
    @Param(
      'token',
      new ParseUUIDPipe(),
    )
    token: string,
  ) {
    return this.trackingService.findByToken(
      token,
    );
  }
}