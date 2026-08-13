import { BadRequestException } from '@nestjs/common';

import { randomUUID } from 'crypto';

import {
  existsSync,
  mkdirSync,
} from 'fs';

import { extname, join } from 'path';

import { diskStorage } from 'multer';

const uploadDirectory = join(
  process.cwd(),
  'uploads',
  'repair-photos',
);

if (!existsSync(uploadDirectory)) {
  mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const repairPhotoUploadOptions = {
  storage: diskStorage({
    destination: uploadDirectory,

    filename: (
      _request: Express.Request,
      file: Express.Multer.File,
      callback: (
        error: Error | null,
        filename: string,
      ) => void,
    ): void => {
      const extension = extname(
        file.originalname,
      ).toLowerCase();

      callback(
        null,
        `${randomUUID()}${extension}`,
      );
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
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