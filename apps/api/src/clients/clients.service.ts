import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

import type { CreateClientDto } from './dto/create-client.dto';
import type { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  create(
    createClientDto: CreateClientDto,
  ) {
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  findAll() {
    return this.prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const client =
      await this.prisma.client.findUnique({
        where: {
          id,
        },
      });

    if (!client) {
      throw new NotFoundException(
        `No se encontró un cliente con el id ${id}`,
      );
    }

    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
  ) {
    await this.findOne(id);

    return this.prisma.client.update({
      where: {
        id,
      },

      data: updateClientDto,
    });
  }

  async remove(id: string) {
    const client =
      await this.prisma.client.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          firstName: true,
          lastName: true,

          _count: {
            select: {
              devices: true,
            },
          },
        },
      });

    if (!client) {
      throw new NotFoundException(
        `No se encontró un cliente con el id ${id}`,
      );
    }

    if (
      client._count.devices > 0
    ) {
      throw new BadRequestException(
        `No se puede eliminar este cliente porque tiene ${client._count.devices} ${
          client._count.devices === 1
            ? 'equipo asociado'
            : 'equipos asociados'
        }.`,
      );
    }

    await this.prisma.client.delete({
      where: {
        id,
      },
    });

    return {
      message:
        'Cliente eliminado correctamente.',
      id: client.id,
      client:
        `${client.firstName} ${client.lastName}`,
    };
  }
}