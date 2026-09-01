import {
  BadRequestException,
} from '@nestjs/common';

import {
  memoryStorage,
} from 'multer';

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const repairPhotoUploadOptions = {
  storage: memoryStorage(),

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter: (
    _request: Express.Request,
    file: Express.Multer.File,
    callback: (
      error: Error | null,
      acceptFile: boolean,
    ) => void,
  ): void => {
    if (
      !allowedMimeTypes.includes(
        file.mimetype,
      )
    ) {
      callback(
        new BadRequestException(
          'Solo se permiten imágenes JPG, PNG o WEBP.',
        ),
        false,
      );

      return;
    }

    callback(null, true);
  },
};