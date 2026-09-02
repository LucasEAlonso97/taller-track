import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'crypto';

import { promisify } from 'util';

import { PrismaService } from '../database/prisma.service';

const scrypt = promisify(
  scryptCallback,
);

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async findByEmail(
    email: string,
  ) {
    return this.prisma.user.findUnique({
      where: {
        email:
          email
            .trim()
            .toLowerCase(),
      },
    });
  }

  async findById(
    id: string,
  ) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createInitialAdmin(
    input: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    const userCount =
      await this.prisma.user.count();

    if (userCount > 0) {
      throw new ConflictException(
        'La configuración inicial ya fue realizada.',
      );
    }

    const email =
      input.email
        .trim()
        .toLowerCase();

    const passwordHash =
      await this.hashPassword(
        input.password,
      );

    return this.prisma.user.create({
      data: {
        name:
          input.name.trim(),

        email,

        passwordHash,

        role:
          'ADMIN',
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async verifyPassword(
    password: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    const [
      salt,
      storedHash,
    ] =
      storedPasswordHash.split(
        ':',
      );

    if (
      !salt ||
      !storedHash
    ) {
      return false;
    }

    const derivedKey =
      (await scrypt(
        password,
        salt,
        64,
      )) as Buffer;

    const storedHashBuffer =
      Buffer.from(
        storedHash,
        'hex',
      );

    if (
      derivedKey.length !==
      storedHashBuffer.length
    ) {
      return false;
    }

    return timingSafeEqual(
      derivedKey,
      storedHashBuffer,
    );
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt:
          'asc',
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createTechnician(
    input: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    const email =
      input.email
        .trim()
        .toLowerCase();

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con ese email.',
      );
    }

    const passwordHash =
      await this.hashPassword(
        input.password,
      );

    return this.prisma.user.create({
      data: {
        name:
          input.name.trim(),

        email,

        passwordHash,

        role:
          'TECHNICIAN',
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateTechnicianStatus(
    id: string,
    isActive: boolean,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'No se encontró el usuario.',
      );
    }

    if (
      user.role !==
      'TECHNICIAN'
    ) {
      throw new BadRequestException(
        'Solo se puede modificar el estado de usuarios técnicos.',
      );
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        isActive,

        tokenVersion: {
          increment: 1,
        },
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async resetTechnicianPassword(
    id: string,
    newPassword: string,
  ): Promise<void> {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'No se encontró el usuario.',
      );
    }

    if (
      user.role !==
      'TECHNICIAN'
    ) {
      throw new BadRequestException(
        'Solo se puede restablecer la contraseña de usuarios técnicos.',
      );
    }

    const samePassword =
      await this.verifyPassword(
        newPassword,
        user.passwordHash,
      );

    if (samePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual.',
      );
    }

    const passwordHash =
      await this.hashPassword(
        newPassword,
      );

    await this.prisma.user.update({
      where: {
        id,
      },

      data: {
        passwordHash,

        tokenVersion: {
          increment: 1,
        },
      },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id:
            userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'No se encontró el usuario.',
      );
    }

    const currentPasswordIsValid =
      await this.verifyPassword(
        currentPassword,
        user.passwordHash,
      );

    if (
      !currentPasswordIsValid
    ) {
      throw new BadRequestException(
        'La contraseña actual es incorrecta.',
      );
    }

    const samePassword =
      await this.verifyPassword(
        newPassword,
        user.passwordHash,
      );

    if (samePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual.',
      );
    }

    const passwordHash =
      await this.hashPassword(
        newPassword,
      );

    await this.prisma.user.update({
      where: {
        id:
          userId,
      },

      data: {
        passwordHash,

        tokenVersion: {
          increment: 1,
        },
      },
    });
  }

  private async hashPassword(
    password: string,
  ): Promise<string> {
    const salt =
      randomBytes(16)
        .toString(
          'hex',
        );

    const derivedKey =
      (await scrypt(
        password,
        salt,
        64,
      )) as Buffer;

    return `${salt}:${derivedKey.toString(
      'hex',
    )}`;
  }
}