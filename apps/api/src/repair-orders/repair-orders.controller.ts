import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
UseInterceptors,
StreamableFile,
NotFoundException,
} from '@nestjs/common';

import { CreateRepairOrderDto } from './dto/create-repair-order.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { UpdateRepairDiagnosisDto } from './dto/update-repair-diagnosis.dto';
import { UpdateRepairQuoteDto } from './dto/update-repair-quote.dto';
import { UpdateRepairStatusDto } from './dto/update-repair-status.dto';
import { CreateRepairNoteDto } from './dto/create-repair-note.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  createReadStream,
  existsSync,
} from 'fs';

import { join } from 'path';


import { repairPhotoUploadOptions } from './repair-photo-upload.config';

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
    @Param('id', new ParseUUIDPipe())
    id: string,
  ) {
    return this.repairOrdersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @Body()
    updateRepairStatusDto: UpdateRepairStatusDto,
  ) {
    return this.repairOrdersService.updateStatus(
      id,
      updateRepairStatusDto,
    );
  }

  @Patch(':id/diagnosis')
  updateDiagnosis(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @Body()
    updateRepairDiagnosisDto: UpdateRepairDiagnosisDto,
  ) {
    return this.repairOrdersService.updateDiagnosis(
      id,
      updateRepairDiagnosisDto,
    );
  }

  @Patch(':id/quote')
  updateQuote(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @Body()
    updateRepairQuoteDto: UpdateRepairQuoteDto,
  ) {
    return this.repairOrdersService.updateQuote(
      id,
      updateRepairQuoteDto,
    );
  }

  @Patch(':id/quote/status')
  updateQuoteStatus(
    @Param('id', new ParseUUIDPipe())
    id: string,

    @Body()
    updateQuoteStatusDto: UpdateQuoteStatusDto,
  ) {
    return this.repairOrdersService.updateQuoteStatus(
      id,
      updateQuoteStatusDto,
    );
  }
  @Post(':id/notes')
addInternalNote(
  @Param('id', new ParseUUIDPipe())
  id: string,

  @Body()
  body: CreateRepairNoteDto,
) {
  return this.repairOrdersService.addInternalNote(
    id,
    body.content,
  );
}
@Post(':id/photos')
@UseInterceptors(
  FilesInterceptor(
    'files',
    6,
    repairPhotoUploadOptions,
  ),
)
addPhotos(
  @Param('id', new ParseUUIDPipe())
  id: string,

  @UploadedFiles()
  files: Express.Multer.File[],
) {
  return this.repairOrdersService.addPhotos(
    id,
    files,
  );
}

@Get(':id/photos/:photoId/file')
async getPhotoFile(
  @Param('id', new ParseUUIDPipe())
  id: string,

  @Param('photoId', new ParseUUIDPipe())
  photoId: string,
): Promise<StreamableFile> {
  const photo =
    await this.repairOrdersService.getPhoto(
      id,
      photoId,
    );

  const filePath = join(
    process.cwd(),
    'uploads',
    'repair-photos',
    photo.storageKey,
  );

  if (!existsSync(filePath)) {
    throw new NotFoundException(
      'El archivo de la foto no existe',
    );
  }

  return new StreamableFile(
    createReadStream(filePath),
    {
      type: photo.mimeType,
      disposition: 'inline',
    },
  );
}
}