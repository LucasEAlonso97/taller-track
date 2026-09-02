import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  PrismaService,
} from '../database/prisma.service';

import {
  ClientsService,
} from './clients.service';

describe('ClientsService', () => {
  let service: ClientsService;

  const prismaMock = {
    client: {
      findUnique:
        jest.fn<
          (args: any) => Promise<any>
        >(),

      delete:
        jest.fn<
          (args: any) => Promise<any>
        >(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service =
      new ClientsService(
        prismaMock as unknown as PrismaService,
      );
  });

  describe('remove', () => {
    it(
      'rejects when the client does not exist',
      async () => {
        prismaMock
          .client
          .findUnique
          .mockResolvedValue(
            null,
          );

        await expect(
          service.remove(
            'client-1',
          ),
        ).rejects.toThrow(
          NotFoundException,
        );

        expect(
          prismaMock.client.delete,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects deletion when the client has associated devices',
      async () => {
        prismaMock
          .client
          .findUnique
          .mockResolvedValue({
            id: 'client-1',
            firstName: 'Juan',
            lastName: 'Pérez',

            _count: {
              devices: 2,
            },
          });

        await expect(
          service.remove(
            'client-1',
          ),
        ).rejects.toThrow(
          BadRequestException,
        );

        expect(
          prismaMock.client.delete,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'deletes a client without associated devices',
      async () => {
        prismaMock
          .client
          .findUnique
          .mockResolvedValue({
            id: 'client-1',
            firstName: 'Juan',
            lastName: 'Pérez',

            _count: {
              devices: 0,
            },
          });

        prismaMock
          .client
          .delete
          .mockResolvedValue({
            id: 'client-1',
          });

        const result =
          await service.remove(
            'client-1',
          );

        expect(
          prismaMock.client.delete,
        ).toHaveBeenCalledWith({
          where: {
            id: 'client-1',
          },
        });

        expect(result).toEqual({
          message:
            'Cliente eliminado correctamente.',

          id: 'client-1',

          client:
            'Juan Pérez',
        });
      },
    );
  });
});