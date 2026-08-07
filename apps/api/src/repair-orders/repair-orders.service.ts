import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { CreateRepairOrderDto } from './dto/create-repair-order.dto';
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

    return this.prisma.repairOrder.create({
      data: {
        code,
        reportedIssue:
          createRepairOrderDto.reportedIssue,

        estimatedCompletionDate:
          createRepairOrderDto.estimatedCompletionDate
            ? new Date(
                createRepairOrderDto.estimatedCompletionDate,
              )
            : undefined,

        device: {
          connect: {
            id: createRepairOrderDto.deviceId,
          },
        },
      },

      include: {
        device: {
          include: {
            client: true,
          },
        },
      },
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
    await this.findOne(id);

    const deliveredAt =
      updateRepairStatusDto.status === 'DELIVERED'
        ? new Date()
        : undefined;

    return this.prisma.repairOrder.update({
      where: {
        id,
      },

      data: {
        status: updateRepairStatusDto.status,
        deliveredAt,
      },

      include: {
        device: {
          include: {
            client: true,
          },
        },
      },
    });
  }
}