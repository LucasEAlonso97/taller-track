import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { randomBytes } from 'node:crypto';

import {
  QuoteStatus,
  RepairStatus,
} from '../generated/prisma/enums';

import { PrismaService } from '../database/prisma.service';

import type { CreateRepairOrderDto } from './dto/create-repair-order.dto';
import type { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import type { UpdateRepairDiagnosisDto } from './dto/update-repair-diagnosis.dto';
import type { UpdateRepairQuoteDto } from './dto/update-repair-quote.dto';
import type { UpdateRepairStatusDto } from './dto/update-repair-status.dto';

@Injectable()
export class RepairOrdersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private generateCode(): string {
    const year = new Date().getFullYear();

    const suffix = randomBytes(3)
      .toString('hex')
      .toUpperCase();

    return `TT-${year}-${suffix}`;
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
        createdAt: 'desc' as const,
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
        createdAt: 'desc' as const,
      },
    },

    statusHistory: {
      orderBy: {
        createdAt: 'asc' as const,
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
      await this.prisma.repairPhoto.findFirst({
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

  async create(
    createRepairOrderDto: CreateRepairOrderDto,
  ) {
    const device =
      await this.prisma.device.findUnique({
        where: {
          id: createRepairOrderDto.deviceId,
        },
      });

    if (!device) {
      throw new NotFoundException(
        `No se encontró un equipo con el id ${createRepairOrderDto.deviceId}`,
      );
    }

    const code = this.generateCode();

    return this.prisma.$transaction(
      async (tx) => {
        const repairOrder =
          await tx.repairOrder.create({
            data: {
              code,

              reportedIssue:
                createRepairOrderDto.reportedIssue,

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
                  id: createRepairOrderDto.deviceId,
                },
              },
            },
          });

        await tx.repairStatusHistory.create({
          data: {
            repairOrderId: repairOrder.id,
            status: repairOrder.status,
          },
        });

        return tx.repairOrder.findUniqueOrThrow({
          where: {
            id: repairOrder.id,
          },

          include: this.fullOrderInclude,
        });
      },
    );
  }

  findAll() {
    return this.prisma.repairOrder.findMany({
      include: this.fullOrderInclude,

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async addPhotos(
    repairOrderId: string,
    files: Express.Multer.File[],
  ) {
    const repairOrder =
      await this.prisma.repairOrder.findUnique({
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

    if (files.length === 0) {
      throw new BadRequestException(
        'Tenés que seleccionar al menos una foto.',
      );
    }

    await this.prisma.repairPhoto.createMany({
      data: files.map((file) => ({
        repairOrderId,
        storageKey: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      })),
    });

    return this.prisma.repairOrder.findUnique({
      where: {
        id: repairOrderId,
      },

      include: this.fullOrderInclude,
    });
  }

  async findOne(id: string) {
    const repairOrder =
      await this.prisma.repairOrder.findUnique({
        where: {
          id,
        },

        include: this.fullOrderInclude,
      });

    if (!repairOrder) {
      throw new NotFoundException(
        `No se encontró una orden con el id ${id}`,
      );
    }

    return repairOrder;
  }

  async updateStatus(
    id: string,
    updateRepairStatusDto:
      UpdateRepairStatusDto,
    userId: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder.findUnique({
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
      updateRepairStatusDto.status
    ) {
      return this.findOne(id);
    }

    return this.prisma.$transaction(
      async (tx) => {
        await tx.repairOrder.update({
          where: {
            id,
          },

          data: {
            status:
              updateRepairStatusDto.status,

            deliveredAt:
              updateRepairStatusDto.status ===
              RepairStatus.DELIVERED
                ? repairOrder.deliveredAt ??
                  new Date()
                : null,
          },
        });

        await tx.repairStatusHistory.create({
          data: {
            repairOrderId: id,

            status:
              updateRepairStatusDto.status,

            changedById: userId,
          },
        });

        return tx.repairOrder.findUniqueOrThrow({
          where: {
            id,
          },

          include: this.fullOrderInclude,
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
      await this.prisma.repairOrder.findUnique({
        where: {
          id: repairOrderId,
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

    await this.prisma.repairInternalNote.create({
      data: {
        repairOrderId,
        content: content.trim(),
        createdById: userId,
      },
    });

    return this.prisma.repairOrder.findUnique({
      where: {
        id: repairOrderId,
      },

      include: this.fullOrderInclude,
    });
  }

  async updateDiagnosis(
    id: string,
    updateRepairDiagnosisDto:
      UpdateRepairDiagnosisDto,
    userId: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder.findUnique({
        where: {
          id,
        },
      });

    if (!repairOrder) {
      throw new NotFoundException(
        `No se encontró una orden con el id ${id}`,
      );
    }

    return this.prisma.repairOrder.update({
      where: {
        id,
      },

      data: {
        diagnosis:
          updateRepairDiagnosisDto.diagnosis,

        diagnosisUpdatedById: userId,

        diagnosisUpdatedAt:
          new Date(),

        estimatedCompletionDate:
          updateRepairDiagnosisDto
            .estimatedCompletionDate
            ? new Date(
                updateRepairDiagnosisDto
                  .estimatedCompletionDate,
              )
            : repairOrder.estimatedCompletionDate,
      },

      include: this.fullOrderInclude,
    });
  }

  async updateQuote(
    id: string,
    updateRepairQuoteDto:
      UpdateRepairQuoteDto,
    userId: string,
  ) {
    const repairOrder =
      await this.prisma.repairOrder.findUnique({
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
            repairOrderId: id,
          },

          create: {
            repairOrderId: id,

            amount:
              updateRepairQuoteDto.amount,

            description:
              updateRepairQuoteDto.description,

            status:
              QuoteStatus.PENDING,

            updatedById:
              userId,
          },

          update: {
            amount:
              updateRepairQuoteDto.amount,

            description:
              updateRepairQuoteDto.description,

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
          RepairStatus.WAITING_APPROVAL
        ) {
          await tx.repairOrder.update({
            where: {
              id,
            },

            data: {
              status:
                RepairStatus.WAITING_APPROVAL,
            },
          });

          await tx.repairStatusHistory.create({
            data: {
              repairOrderId: id,

              status:
                RepairStatus.WAITING_APPROVAL,

              changedById:
                userId,
            },
          });
        }

        return tx.repairOrder.findUniqueOrThrow({
          where: {
            id,
          },

          include: this.fullOrderInclude,
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
      await this.prisma.repairOrder.findUnique({
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

    if (!repairOrder.quote) {
      throw new NotFoundException(
        'La orden todavía no tiene un presupuesto',
      );
    }

    const nextRepairStatus =
      updateQuoteStatusDto.status ===
      QuoteStatus.APPROVED
        ? RepairStatus.IN_REPAIR
        : RepairStatus.UNREPAIRED;

    return this.prisma.$transaction(
      async (tx) => {
        await tx.repairQuote.update({
          where: {
            repairOrderId: id,
          },

          data: {
            status:
              updateQuoteStatusDto.status,

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
          await tx.repairOrder.update({
            where: {
              id,
            },

            data: {
              status:
                nextRepairStatus,
            },
          });

          await tx.repairStatusHistory.create({
            data: {
              repairOrderId: id,

              status:
                nextRepairStatus,

              changedById:
                userId,
            },
          });
        }

        return tx.repairOrder.findUniqueOrThrow({
          where: {
            id,
          },

          include: this.fullOrderInclude,
        });
      },
    );
  }
}