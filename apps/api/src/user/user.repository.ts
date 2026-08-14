import { Injectable } from '@nestjs/common';
import type { Prisma, UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        employee: true,
      },
    });
  }
  create(
    data: {
      email: string;
      role: UserRole;
      /** Internal Employee.id reference, not the business employee number. */
      employeeId?: string;
      activationTokenHash: string;
      activationExpiresAt: Date;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return client.user.create({
      data,
    });
  }
  updateEmployee(id: string, userId: string) {
    return this.prisma.employee.update({
      where: {
        id,
      },
      data: {
        userId,
      },
    });
  }
  findByActivationTokenHash(activationTokenHash: string) {
    return this.prisma.user.findFirst({
      where: {
        activationTokenHash,
        status: 'pending',
      },
    });
  }
  activate(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        status: 'active',
        activationTokenHash: null,
        activationExpiresAt: null,
      },
    });
  }
  updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}
