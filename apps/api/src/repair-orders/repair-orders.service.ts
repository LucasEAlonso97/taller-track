import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../database/prisma.service';

import type { CreateRepairOrderDto } from './dto/create-repair-order.dto';
import type { UpdateRepairDiagnosisDto } from './dto/update-repair-diagnosis.dto';
import type { UpdateRepairStatusDto } from './dto/update-repair-status.dto';

@Injectable()
export class RepairOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private generateCode(): string {
    const year = new Date().getFullYear();

    const suffix = randomBytes(3)
      .toString('hex')
      .toUpperCase();

    return `TT-${year}-${suffix}`;
  }

  async create(
    createRepairOrderDto: CreateRepairOrderDto,
  ) {
    const device = await this.prisma.device.findUnique({
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

    return this.prisma.$transaction(async (tx) => {
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

        include: {
          device: {
            include: {
              client: true,
            },
          },

          statusHistory: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.repairOrder.findMany({
      include: {
        device: {
          include: {
            client: true,
          },
        },

        statusHistory: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const repairOrder =
      await this.prisma.repairOrder.findUnique({
        where: {
          id,
        },

        include: {
          device: {
            include: {
              client: true,
            },
          },

          statusHistory: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
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
    updateRepairStatusDto: UpdateRepairStatusDto,
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

    return this.prisma.$transaction(async (tx) => {
      await tx.repairOrder.update({
        where: {
          id,
        },

        data: {
          status: updateRepairStatusDto.status,

          deliveredAt:
            updateRepairStatusDto.status ===
            'DELIVERED'
              ? repairOrder.deliveredAt ??
                new Date()
              : null,
        },
      });

      await tx.repairStatusHistory.create({
        data: {
          repairOrderId: id,
          status: updateRepairStatusDto.status,
        },
      });

      return tx.repairOrder.findUniqueOrThrow({
        where: {
          id,
        },

        include: {
          device: {
            include: {
              client: true,
            },
          },

          statusHistory: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    });
  }

  async updateDiagnosis(
    id: string,
    updateRepairDiagnosisDto: UpdateRepairDiagnosisDto,
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

        estimatedCompletionDate:
          updateRepairDiagnosisDto
            .estimatedCompletionDate
            ? new Date(
                updateRepairDiagnosisDto
                  .estimatedCompletionDate,
              )
            : repairOrder.estimatedCompletionDate,
      },

      include: {
        device: {
          include: {
            client: true,
          },
        },

        statusHistory: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }
}