import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TrackingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByToken(
    trackingToken: string,
  ) {
    const order =
      await this.prisma.repairOrder.findUnique({
        where: {
          trackingToken,
        },

        select: {
          code: true,
          status: true,
          reportedIssue: true,
          diagnosis: true,
          estimatedCompletionDate: true,
          createdAt: true,
          updatedAt: true,

          device: {
            select: {
              type: true,
              brand: true,
              model: true,
            },
          },

          quote: {
            select: {
              amount: true,
              description: true,
              status: true,
              respondedAt: true,
            },
          },

          statusHistory: {
            select: {
              status: true,
              createdAt: true,
            },

            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        'No se encontró una reparación con ese código de seguimiento',
      );
    }

    return order;
  }
}