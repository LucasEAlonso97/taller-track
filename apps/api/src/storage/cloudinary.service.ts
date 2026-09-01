import {
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  v2 as cloudinary,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService:
      ConfigService,
  ) {
    cloudinary.config({
      cloud_name:
        this.configService.getOrThrow<string>(
          'CLOUDINARY_CLOUD_NAME',
        ),

      api_key:
        this.configService.getOrThrow<string>(
          'CLOUDINARY_API_KEY',
        ),

      api_secret:
        this.configService.getOrThrow<string>(
          'CLOUDINARY_API_SECRET',
        ),

      secure: true,
    });
  }

  uploadImage(
    file: Express.Multer.File,
  ): Promise<{
    publicId: string;
    url: string;
  }> {
    return new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder:
                'tallertrack/repair-photos',

              resource_type:
                'image',
            },

            (error, result) => {
              if (
                error ||
                !result
              ) {
                reject(
                  error ??
                    new Error(
                      'Cloudinary no devolvió una respuesta.',
                    ),
                );

                return;
              }

              resolve({
                publicId:
                  result.public_id,

                url:
                  result.secure_url,
              });
            },
          );

        uploadStream.end(
          file.buffer,
        );
      },
    );
  }

  async deleteImage(
    publicId: string,
  ): Promise<void> {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type:
          'image',
      },
    );
  }

  getImageUrl(
    publicId: string,
  ): string {
    return cloudinary.url(
      publicId,
      {
        secure: true,
      },
    );
  }
}