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
  DevicesService,
} from './devices.service';

describe('DevicesService', () => {
  let service: DevicesService;

  const prismaMock = {
    device: {
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
      new DevicesService(
        prismaMock as unknown as PrismaService,
      );
  });

  describe('remove', () => {
    it(
      'rejects when the device does not exist',
      async () => {
        prismaMock
          .device
          .findUnique
          .mockResolvedValue(
            null,
          );

        await expect(
          service.remove(
            'device-1',
          ),
        ).rejects.toThrow(
          NotFoundException,
        );

        expect(
          prismaMock.device.delete,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'rejects deletion when the device has repair orders',
      async () => {
        prismaMock
          .device
          .findUnique
          .mockResolvedValue({
            id: 'device-1',
            type: 'Notebook',
            brand: 'Lenovo',
            model: 'ThinkPad',

            _count: {
              repairOrders: 1,
            },
          });

        await expect(
          service.remove(
            'device-1',
          ),
        ).rejects.toThrow(
          BadRequestException,
        );

        expect(
          prismaMock.device.delete,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'deletes a device without repair orders',
      async () => {
        prismaMock
          .device
          .findUnique
          .mockResolvedValue({
            id: 'device-1',
            type: 'Notebook',
            brand: 'Lenovo',
            model: 'ThinkPad',

            _count: {
              repairOrders: 0,
            },
          });

        prismaMock
          .device
          .delete
          .mockResolvedValue({
            id: 'device-1',
          });

        const result =
          await service.remove(
            'device-1',
          );

        expect(
          prismaMock.device.delete,
        ).toHaveBeenCalledWith({
          where: {
            id: 'device-1',
          },
        });

        expect(result).toEqual({
          message:
            'Equipo eliminado correctamente.',

          id: 'device-1',

          device:
            'Lenovo ThinkPad',
        });
      },
    );
  });
});