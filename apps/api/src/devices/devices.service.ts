import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    const client = await this.prisma.client.findUnique({
      where: {
        id: createDeviceDto.clientId,
      },
    });

    if (!client) {
      throw new NotFoundException(
        `No se encontró un cliente con el id ${createDeviceDto.clientId}`,
      );
    }

    const {
      clientId,
      ...deviceData
    } = createDeviceDto;

    return this.prisma.device.create({
      data: {
        ...deviceData,
        client: {
          connect: {
            id: clientId,
          },
        },
      },

      include: {
        client: true,
      },
    });
  }

  findAll() {
    return this.prisma.device.findMany({
      include: {
        client: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findUnique({
      where: {
        id,
      },

      include: {
        client: true,
      },
    });

    if (!device) {
      throw new NotFoundException(
        `No se encontró un equipo con el id ${id}`,
      );
    }

    return device;
  }
}