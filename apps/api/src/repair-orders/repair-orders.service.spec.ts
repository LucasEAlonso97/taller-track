import {
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
  QuoteStatus,
  RepairStatus,
} from '../generated/prisma/enums';

import {
  PrismaService,
} from '../database/prisma.service';

import {
  CloudinaryService,
} from '../storage/cloudinary.service';

import {
  RepairOrdersService,
} from './repair-orders.service';

describe('RepairOrdersService', () => {
  let service: RepairOrdersService;

  const txMock = {
    repairOrder: {
      update:
        jest.fn<
          (args: any) => Promise<any>
        >(),

      findUniqueOrThrow:
        jest.fn<
          (args: any) => Promise<any>
        >(),
    },

    repairStatusHistory: {
      create:
        jest.fn<
          (args: any) => Promise<any>
        >(),
    },

    repairQuote: {
      upsert:
        jest.fn<
          (args: any) => Promise<any>
        >(),

      update:
        jest.fn<
          (args: any) => Promise<any>
        >(),
    },
  };

  const prismaMock = {
    repairOrder: {
      findUnique:
        jest.fn<
          (args: any) => Promise<any>
        >(),

      update:
        jest.fn<
          (args: any) => Promise<any>
        >(),

      delete:
        jest.fn<
          (args: any) => Promise<any>
        >(),
    },

    $transaction:
      jest.fn<
        (
          callback:
            (tx: any) => Promise<any>,
        ) => Promise<any>
      >(),
  };

  const cloudinaryMock = {
    deleteImage:
      jest.fn<
        (
          storageKey: string,
        ) => Promise<any>
      >(),

    uploadImage:
      jest.fn(),

    getImageUrl:
      jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock
      .$transaction
      .mockImplementation(
        async (callback) =>
          callback(txMock),
      );

    service =
      new RepairOrdersService(
        prismaMock as unknown as PrismaService,
        cloudinaryMock as unknown as CloudinaryService,
      );
  });

  describe('updateStatus', () => {
    it(
      'rejects when the repair order does not exist',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue(
            null,
          );

        await expect(
          service.updateStatus(
            'repair-1',
            {
              status:
                RepairStatus.IN_DIAGNOSIS,
            },
            'user-1',
          ),
        ).rejects.toThrow(
          NotFoundException,
        );

        expect(
          prismaMock.$transaction,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'updates the status and creates a history entry',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue({
            id: 'repair-1',

            status:
              RepairStatus.RECEIVED,

            deliveredAt:
              null,
          });

        txMock
          .repairOrder
          .update
          .mockResolvedValue({
            id: 'repair-1',
          });

        txMock
          .repairStatusHistory
          .create
          .mockResolvedValue({
            id: 'history-1',
          });

        const updatedOrder = {
          id: 'repair-1',

          status:
            RepairStatus.IN_DIAGNOSIS,
        };

        txMock
          .repairOrder
          .findUniqueOrThrow
          .mockResolvedValue(
            updatedOrder,
          );

        const result =
          await service.updateStatus(
            'repair-1',
            {
              status:
                RepairStatus.IN_DIAGNOSIS,
            },
            'user-1',
          );

        expect(
          txMock
            .repairOrder
            .update,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              id: 'repair-1',
            },

            data:
              expect.objectContaining({
                status:
                  RepairStatus.IN_DIAGNOSIS,

                deliveredAt:
                  null,
              }),
          }),
        );

        expect(
          txMock
            .repairStatusHistory
            .create,
        ).toHaveBeenCalledWith({
          data: {
            repairOrderId:
              'repair-1',

            status:
              RepairStatus.IN_DIAGNOSIS,

            changedById:
              'user-1',
          },
        });

        expect(result).toBe(
          updatedOrder,
        );
      },
    );

    it(
      'sets deliveredAt when the repair is delivered',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue({
            id: 'repair-1',

            status:
              RepairStatus.READY_FOR_PICKUP,

            deliveredAt:
              null,
          });

        txMock
          .repairOrder
          .update
          .mockResolvedValue({
            id: 'repair-1',
          });

        txMock
          .repairStatusHistory
          .create
          .mockResolvedValue({
            id: 'history-1',
          });

        txMock
          .repairOrder
          .findUniqueOrThrow
          .mockResolvedValue({
            id: 'repair-1',

            status:
              RepairStatus.DELIVERED,
          });

        await service.updateStatus(
          'repair-1',
          {
            status:
              RepairStatus.DELIVERED,
          },
          'user-1',
        );

        expect(
          txMock
            .repairOrder
            .update,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            data:
              expect.objectContaining({
                status:
                  RepairStatus.DELIVERED,

                deliveredAt:
                  expect.any(Date),
              }),
          }),
        );
      },
    );
  });

  describe('updateDiagnosis', () => {
    it(
      'updates the diagnosis and records who changed it',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue({
            id: 'repair-1',

            estimatedCompletionDate:
              null,
          });

        const updatedOrder = {
          id: 'repair-1',

          diagnosis:
            'Fuente de alimentación dañada',
        };

        prismaMock
          .repairOrder
          .update
          .mockResolvedValue(
            updatedOrder,
          );

        const result =
          await service.updateDiagnosis(
            'repair-1',
            {
              diagnosis:
                'Fuente de alimentación dañada',

              estimatedCompletionDate:
                '2026-09-10',
            },
            'user-1',
          );

        expect(
          prismaMock
            .repairOrder
            .update,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              id: 'repair-1',
            },

            data:
              expect.objectContaining({
                diagnosis:
                  'Fuente de alimentación dañada',

                diagnosisUpdatedById:
                  'user-1',

                diagnosisUpdatedAt:
                  expect.any(Date),

                estimatedCompletionDate:
                  expect.any(Date),
              }),
          }),
        );

        expect(result).toBe(
          updatedOrder,
        );
      },
    );
  });

  describe('updateQuote', () => {
    it(
      'saves a pending quote and moves the repair to waiting approval',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue({
            id: 'repair-1',

            status:
              RepairStatus.IN_DIAGNOSIS,

            quote:
              null,
          });

        txMock
          .repairQuote
          .upsert
          .mockResolvedValue({
            id: 'quote-1',
          });

        txMock
          .repairOrder
          .update
          .mockResolvedValue({
            id: 'repair-1',
          });

        txMock
          .repairStatusHistory
          .create
          .mockResolvedValue({
            id: 'history-1',
          });

        const updatedOrder = {
          id: 'repair-1',

          status:
            RepairStatus.WAITING_APPROVAL,
        };

        txMock
          .repairOrder
          .findUniqueOrThrow
          .mockResolvedValue(
            updatedOrder,
          );

        const result =
          await service.updateQuote(
            'repair-1',
            {
              amount:
                45000,

              description:
                'Cambio de fuente',
            },
            'user-1',
          );

        expect(
          txMock
            .repairQuote
            .upsert,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              repairOrderId:
                'repair-1',
            },

            create:
              expect.objectContaining({
                amount:
                  45000,

                description:
                  'Cambio de fuente',

                status:
                  QuoteStatus.PENDING,

                updatedById:
                  'user-1',
              }),
          }),
        );

        expect(
          txMock
            .repairOrder
            .update,
        ).toHaveBeenCalledWith({
          where: {
            id: 'repair-1',
          },

          data: {
            status:
              RepairStatus.WAITING_APPROVAL,
          },
        });

        expect(
          txMock
            .repairStatusHistory
            .create,
        ).toHaveBeenCalledWith({
          data: {
            repairOrderId:
              'repair-1',

            status:
              RepairStatus.WAITING_APPROVAL,

            changedById:
              'user-1',
          },
        });

        expect(result).toBe(
          updatedOrder,
        );
      },
    );
  });

  describe('updateQuoteStatus', () => {
    it(
      'moves the repair to in repair when the quote is approved',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue({
            id: 'repair-1',

            status:
              RepairStatus.WAITING_APPROVAL,

            quote: {
              id: 'quote-1',

              status:
                QuoteStatus.PENDING,
            },
          });

        txMock
          .repairQuote
          .update
          .mockResolvedValue({
            id: 'quote-1',
          });

        txMock
          .repairOrder
          .update
          .mockResolvedValue({
            id: 'repair-1',
          });

        txMock
          .repairStatusHistory
          .create
          .mockResolvedValue({
            id: 'history-1',
          });

        txMock
          .repairOrder
          .findUniqueOrThrow
          .mockResolvedValue({
            id: 'repair-1',

            status:
              RepairStatus.IN_REPAIR,
          });

        await service
          .updateQuoteStatus(
            'repair-1',
            {
              status:
                QuoteStatus.APPROVED,
            },
            'user-1',
          );

        expect(
          txMock
            .repairQuote
            .update,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              repairOrderId:
                'repair-1',
            },

            data:
              expect.objectContaining({
                status:
                  QuoteStatus.APPROVED,

                respondedAt:
                  expect.any(Date),

                respondedById:
                  'user-1',
              }),
          }),
        );

        expect(
          txMock
            .repairOrder
            .update,
        ).toHaveBeenCalledWith({
          where: {
            id: 'repair-1',
          },

          data: {
            status:
              RepairStatus.IN_REPAIR,
          },
        });

        expect(
          txMock
            .repairStatusHistory
            .create,
        ).toHaveBeenCalledWith({
          data: {
            repairOrderId:
              'repair-1',

            status:
              RepairStatus.IN_REPAIR,

            changedById:
              'user-1',
          },
        });
      },
    );

    it(
      'rejects quote response when the repair has no quote',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue({
            id: 'repair-1',

            status:
              RepairStatus.WAITING_APPROVAL,

            quote:
              null,
          });

        await expect(
          service.updateQuoteStatus(
            'repair-1',
            {
              status:
                QuoteStatus.APPROVED,
            },
            'user-1',
          ),
        ).rejects.toThrow(
          NotFoundException,
        );

        expect(
          prismaMock.$transaction,
        ).not.toHaveBeenCalled();
      },
    );
  });

  describe('remove', () => {
    it(
      'rejects when the repair order does not exist',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue(
            null,
          );

        await expect(
          service.remove(
            'repair-1',
          ),
        ).rejects.toThrow(
          NotFoundException,
        );

        expect(
          prismaMock
            .repairOrder
            .delete,
        ).not.toHaveBeenCalled();

        expect(
          cloudinaryMock
            .deleteImage,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'deletes the repair order and its Cloudinary photos',
      async () => {
        prismaMock
          .repairOrder
          .findUnique
          .mockResolvedValue({
            id: 'repair-1',

            code:
              'TT-2026-ABC123',

            photos: [
              {
                storageKey:
                  'tallertrack/repair-photos/photo-1',
              },

              {
                storageKey:
                  'tallertrack/repair-photos/photo-2',
              },
            ],
          });

        prismaMock
          .repairOrder
          .delete
          .mockResolvedValue({
            id: 'repair-1',
          });

        cloudinaryMock
          .deleteImage
          .mockResolvedValue(
            undefined,
          );

        const result =
          await service.remove(
            'repair-1',
          );

        expect(
          prismaMock
            .repairOrder
            .delete,
        ).toHaveBeenCalledWith({
          where: {
            id: 'repair-1',
          },
        });

        expect(
          cloudinaryMock
            .deleteImage,
        ).toHaveBeenCalledTimes(
          2,
        );

        expect(
          cloudinaryMock
            .deleteImage,
        ).toHaveBeenCalledWith(
          'tallertrack/repair-photos/photo-1',
        );

        expect(
          cloudinaryMock
            .deleteImage,
        ).toHaveBeenCalledWith(
          'tallertrack/repair-photos/photo-2',
        );

        expect(result).toEqual({
          message:
            'Reparación eliminada correctamente.',

          id:
            'repair-1',

          code:
            'TT-2026-ABC123',
        });
      },
    );
  });
});