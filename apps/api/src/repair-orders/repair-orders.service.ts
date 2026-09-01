import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  randomBytes,
} from 'node:crypto';

import {
  rm,
} from 'node:fs/promises';

import {
  join,
} from 'node:path';

import {
  QuoteStatus,
  RepairStatus,
} from '../generated/prisma/enums';

import {
  PrismaService,
} from '../database/prisma.service';

import {
  CloudinaryService,
} from '../storage/cloudinary.service';

import type {
  CreateRepairOrderDto,
} from './dto/create-repair-order.dto';

import type {
  UpdateQuoteStatusDto,
} from './dto/update-quote-status.dto';

import type {
  UpdateRepairDiagnosisDto,
} from './dto/update-repair-diagnosis.dto';

import type {
  UpdateRepairQuoteDto,
} from './dto/update-repair-quote.dto';

import type {
  UpdateRepairStatusDto,
} from './dto/update-repair-status.dto';

@Injectable()
export class RepairOrdersService {
  private readonly logger =
    new Logger(
      RepairOrdersService.name,
    );

  constructor(
    private readonly prisma:
      PrismaService,

    private readonly cloudinary:
      CloudinaryService,
  ) {}

  private generateCode(): string {
    const year =
      new Date().getFullYear();

    const suffix =
      randomBytes(3)
        .toString('hex')
        .toUpperCase();

    return `TT-${year}-${suffix}`;
  }

  private isCloudinaryPhoto(
    storageKey: string,
  ): boolean {
    return storageKey.startsWith(
      'tallertrack/repair-photos/',
    );
  }

  getPhotoUrl(
    storageKey: string,
  ): string | null {
    if (
      !this.isCloudinaryPhoto(
        storageKey,
      )
    ) {
      return null;
    }

    return this.cloudinary.getImageUrl(
      storageKey,
    );
  }

  private async deleteStoredPhoto(
    storageKey: string,
  ): Promise<void> {
    if (
      this.isCloudinaryPhoto(
        storageKey,
      )
    ) {
      await this.cloudinary.deleteImage(
        storageKey,
      );

      return;
    }

    const filePath = join(
      process.cwd(),
      'uploads',
      'repair-photos',
      storageKey,
    );

    await rm(
      filePath,
      {
        force: true,
      },
    );
  }

  private readonly fullOrderInclude = {
    device: {
      include: {
        client: true,
      },
    },

    diagnosisUpdatedBy: {
      select: {
        id: true,
        name: true,
        role: true,
      },
    },

    internalNotes: {
      orderBy: {
        createdAt:
          'desc' as const,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    },

    photos: {
      orderBy: {
        createdAt:
          'desc' as const,
      },
    },

    statusHistory: {
      orderBy: {
        createdAt:
          'asc' as const,
      },

      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    },

    quote: {
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },

        respondedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    },
  };

  async getPhoto(
    repairOrderId: string,
    photoId: string,
  ) {
    const photo =
      await this.prisma.repairPhoto
        .findFirst({
          where: {
            id: photoId,
            repairOrderId,
          },
        });

    if (!photo) {
      throw new NotFoundException(
        'No se encontró la foto de la reparación',
      );
    }

    return photo;
  }

  async removePhoto(
    repairOrderId: string,
    photoId: string,
  ) {
    const photo =
      await this.getPhoto(
        repairOrderId,
        photoId,
      );

    await this.prisma.repairPhoto.delete({
      where: {
        id: photo.id,
      },
    });

    try {
      await this.deleteStoredPhoto(
        photo.storageKey,
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo eliminar la foto ${photo.storageKey}: ${
          error instanceof Error
            ? error.message
            : 'error desconocido'
        }`,
      );
    }

    return {
      message:
        'Foto eliminada correctamente.',

      id: photo.id,
    };
  }

  async create(
    createRepairOrderDto:
      CreateRepairOrderDto,
  ) {
    const device =
      await this.prisma.device.findUnique({
        where: {
          id:
            createRepairOrderDto
              .deviceId,
        },
      });

    if (!device) {
      throw new NotFoundException(
        `No se encontró un equipo con el id ${createRepairOrderDto.deviceId}`,
      );
    }

    const code =
      this.generateCode();

    return this.prisma.$transaction(
      async (tx) => {
        const repairOrder =
          await tx.repairOrder.create({
            data: {
              code,

              reportedIssue:
                createRepairOrderDto
                  .reportedIssue,

              estimatedCompletionDate:
                createRepairOrderDto
                  .estimatedCompletionDate
                  ? new Date(
                      createRepairOrderDto
                        .estimatedCompletionDate,
                    )
                  : undefined,

              device: {
                connect: {
                  id:
                    createRepairOrderDto
                      .deviceId,
                },
              },
            },
          });

        await tx.repairStatusHistory
          .create({
            data: {
              repairOrderId:
                repairOrder.id,

              status:
                repairOrder.status,
            },
          });

        return tx.repairOrder
          .findUniqueOrThrow({
            where: {
              id:
                repairOrder.id,
            },

            include:
              this.fullOrderInclude,
          });
      },
    );
  }

  findAll() {
    return this.prisma.repairOrder
      .findMany({
        include:
          this.fullOrderInclude,

        orderBy: {
          createdAt: 'desc',
        },
      });
  }

  async addPhotos(
    repairOrderId: string,
    files:
      Express.Multer.File[],
  ) {
    const repairOrder =
      await this.prisma.repairOrder
        .findUnique({
          where: {
            id: repairOrderId,
          },

          select: {
            id: true,

            _count: {
              select: {
                photos: true,
              },
            },
          },
        });

    if (!repairOrder) {
      throw new NotFoundException(
        'No se encontró la orden de reparación',
      );
    }

    if (
      repairOrder._count.photos +
        files.length >
      6
    ) {
      throw new BadRequestException(
        'Una reparación puede tener como máximo 6 fotos.',
      );
    }

    if (
      files.length === 0
    ) {
      throw new BadRequestException(
        'Tenés que seleccionar al menos una foto.',
      );
    }

    const uploadedPhotos: Array<{
      publicId: string;

      file:
        Express.Multer.File;
    }> = [];

    try {
      for (
        const file of files
      ) {
        const uploaded =
          await this.cloudinary
            .uploadImage(
              file,
            );

        uploadedPhotos.push({
          publicId:
            uploaded.publicId,

          file,
        });
      }

      await this.prisma.repairPhoto
        .createMany({
          data:
            uploadedPhotos.map(
              ({
                publicId,
                file,
              }) => ({
                repairOrderId,

                storageKey:
                  publicId,

                originalName:
                  file.originalname,

                mimeType:
                  file.mimetype,

                size:
                  file.size,
              }),
            ),
        });
    } catch (error) {
      await Promise.allSettled(
        uploadedPhotos.map(
          ({ publicId }) =>
            this.cloudinary
              .deleteImage(
                publicId,
              ),
        ),
      );

      throw error;
    }

    return this.prisma.repairOrder
      .findUnique({
        where: {
          id:
            repairOrderId,
        },

        include:
          this.fullOrderInclude,
      });
  }

  async findOne(
    id: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder
        .findUnique({
          where: {
            id,
          },

          include:
            this.fullOrderInclude,
        });

    if (!repairOrder) {
      throw new NotFoundException(
        `No se encontró una orden con el id ${id}`,
      );
    }

    return repairOrder;
  }

  async remove(
    id: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder
        .findUnique({
          where: {
            id,
          },

          select: {
            id: true,
            code: true,

            photos: {
              select: {
                storageKey:
                  true,
              },
            },
          },
        });

    if (!repairOrder) {
      throw new NotFoundException(
        `No se encontró una orden con el id ${id}`,
      );
    }

    await this.prisma.repairOrder
      .delete({
        where: {
          id,
        },
      });

    await Promise.all(
      repairOrder.photos.map(
        async (photo) => {
          try {
            await this
              .deleteStoredPhoto(
                photo.storageKey,
              );
          } catch (error) {
            this.logger.warn(
              `No se pudo eliminar la foto ${photo.storageKey}: ${
                error instanceof Error
                  ? error.message
                  : 'error desconocido'
              }`,
            );
          }
        },
      ),
    );

    return {
      message:
        'Reparación eliminada correctamente.',

      id:
        repairOrder.id,

      code:
        repairOrder.code,
    };
  }

  async updateStatus(
    id: string,

    updateRepairStatusDto:
      UpdateRepairStatusDto,

    userId: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder
        .findUnique({
          where: {
            id,
          },
        });

    if (!repairOrder) {
      throw new NotFoundException(
        `No se encontró una orden con el id ${id}`,
      );
    }

    if (
      repairOrder.status ===
      updateRepairStatusDto
        .status
    ) {
      return this.findOne(
        id,
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        await tx.repairOrder.update({
          where: {
            id,
          },

          data: {
            status:
              updateRepairStatusDto
                .status,

            deliveredAt:
              updateRepairStatusDto
                .status ===
              RepairStatus.DELIVERED
                ? repairOrder
                    .deliveredAt ??
                  new Date()
                : null,
          },
        });

        await tx.repairStatusHistory
          .create({
            data: {
              repairOrderId:
                id,

              status:
                updateRepairStatusDto
                  .status,

              changedById:
                userId,
            },
          });

        return tx.repairOrder
          .findUniqueOrThrow({
            where: {
              id,
            },

            include:
              this.fullOrderInclude,
          });
      },
    );
  }

  async addInternalNote(
    repairOrderId: string,
    content: string,
    userId: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder
        .findUnique({
          where: {
            id:
              repairOrderId,
          },

          select: {
            id: true,
          },
        });

    if (!repairOrder) {
      throw new NotFoundException(
        'No se encontró la orden de reparación',
      );
    }

    await this.prisma
      .repairInternalNote
      .create({
        data: {
          repairOrderId,

          content:
            content.trim(),

          createdById:
            userId,
        },
      });

    return this.prisma.repairOrder
      .findUnique({
        where: {
          id:
            repairOrderId,
        },

        include:
          this.fullOrderInclude,
      });
  }

  async updateDiagnosis(
    id: string,

    updateRepairDiagnosisDto:
      UpdateRepairDiagnosisDto,

    userId: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder
        .findUnique({
          where: {
            id,
          },
        });

    if (!repairOrder) {
      throw new NotFoundException(
        `No se encontró una orden con el id ${id}`,
      );
    }

    return this.prisma.repairOrder
      .update({
        where: {
          id,
        },

        data: {
          diagnosis:
            updateRepairDiagnosisDto
              .diagnosis,

          diagnosisUpdatedById:
            userId,

          diagnosisUpdatedAt:
            new Date(),

          estimatedCompletionDate:
            updateRepairDiagnosisDto
              .estimatedCompletionDate
              ? new Date(
                  updateRepairDiagnosisDto
                    .estimatedCompletionDate,
                )
              : repairOrder
                  .estimatedCompletionDate,
        },

        include:
          this.fullOrderInclude,
      });
  }

  async updateQuote(
    id: string,

    updateRepairQuoteDto:
      UpdateRepairQuoteDto,

    userId: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder
        .findUnique({
          where: {
            id,
          },

          include: {
            quote: true,
          },
        });

    if (!repairOrder) {
      throw new NotFoundException(
        `No se encontró una orden con el id ${id}`,
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        await tx.repairQuote.upsert({
          where: {
            repairOrderId:
              id,
          },

          create: {
            repairOrderId:
              id,

            amount:
              updateRepairQuoteDto
                .amount,

            description:
              updateRepairQuoteDto
                .description,

            status:
              QuoteStatus.PENDING,

            updatedById:
              userId,
          },

          update: {
            amount:
              updateRepairQuoteDto
                .amount,

            description:
              updateRepairQuoteDto
                .description,

            status:
              QuoteStatus.PENDING,

            respondedAt:
              null,

            respondedById:
              null,

            updatedById:
              userId,
          },
        });

        if (
          repairOrder.status !==
          RepairStatus
            .WAITING_APPROVAL
        ) {
          await tx.repairOrder
            .update({
              where: {
                id,
              },

              data: {
                status:
                  RepairStatus
                    .WAITING_APPROVAL,
              },
            });

          await tx
            .repairStatusHistory
            .create({
              data: {
                repairOrderId:
                  id,

                status:
                  RepairStatus
                    .WAITING_APPROVAL,

                changedById:
                  userId,
              },
            });
        }

        return tx.repairOrder
          .findUniqueOrThrow({
            where: {
              id,
            },

            include:
              this.fullOrderInclude,
          });
      },
    );
  }

  async updateQuoteStatus(
    id: string,

    updateQuoteStatusDto:
      UpdateQuoteStatusDto,

    userId: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder
        .findUnique({
          where: {
            id,
          },

          include: {
            quote: true,
          },
        });

    if (!repairOrder) {
      throw new NotFoundException(
        `No se encontró una orden con el id ${id}`,
      );
    }

    if (
      !repairOrder.quote
    ) {
      throw new NotFoundException(
        'La orden todavía no tiene un presupuesto',
      );
    }

    const nextRepairStatus =
      updateQuoteStatusDto
        .status ===
      QuoteStatus.APPROVED
        ? RepairStatus.IN_REPAIR
        : RepairStatus.UNREPAIRED;

    return this.prisma.$transaction(
      async (tx) => {
        await tx.repairQuote.update({
          where: {
            repairOrderId:
              id,
          },

          data: {
            status:
              updateQuoteStatusDto
                .status,

            respondedAt:
              new Date(),

            respondedById:
              userId,
          },
        });

        if (
          repairOrder.status !==
          nextRepairStatus
        ) {
          await tx.repairOrder
            .update({
              where: {
                id,
              },

              data: {
                status:
                  nextRepairStatus,
              },
            });

          await tx
            .repairStatusHistory
            .create({
              data: {
                repairOrderId:
                  id,

                status:
                  nextRepairStatus,

                changedById:
                  userId,
              },
            });
        }

        return tx.repairOrder
          .findUniqueOrThrow({
            where: {
              id,
            },

            include:
              this.fullOrderInclude,
          });
      },
    );
  }
}