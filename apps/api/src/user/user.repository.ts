import { Injectable } from '@nestjs/common';
import type { Prisma, UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const managedUserSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  employee: {
    select: {
      id: true,
      employeeNumber: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      employmentStatus: true,
    },
  },
} satisfies Prisma.UserSelect;

export type ManagedUserRecord = Prisma.UserGetPayload<{
  select: typeof managedUserSelect;
}>;

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
      },
    });
  }

  findByEmail(email: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.user.findUnique({
      where: { email },
    });
  }

  findAllForManagement() {
    return this.prisma.user.findMany({
      select: managedUserSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findForManagementById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.user.findUnique({
      where: { id },
      select: managedUserSelect,
    });
  }

  create(
    data: {
      email: string;
      role: UserRole;
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
      },
      include: {
        employee: {
          select: {
            employmentStatus: true,
          },
        },
      },
    });
  }
  activate(id: string, activationTokenHash: string, passwordHash: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const result = await tx.user.updateMany({
          where: {
            id,
            status: 'pending',
            activationTokenHash,
          },
          data: {
            isActive: true,
            passwordHash,
            status: 'active',
          },
        });

        if (result.count !== 1) {
          return null;
        }

        return tx.user.findUnique({ where: { id } });
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }

  rotateActivationTokenForPending(
    id: string,
    activationTokenHash: string,
    activationExpiresAt: Date,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return client.user.updateMany({
      where: { id, status: 'pending' },
      data: {
        activationTokenHash,
        activationExpiresAt,
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
  countActiveAdministrators(tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.user.count({
      where: {
        role: 'admin',
        status: 'active',
        isActive: true,
      },
    });
  }

  updateRole(id: string, role: UserRole, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.user.update({
      where: { id },
      data: { role },
      select: managedUserSelect,
    });
  }

  updateAccess(id: string, isActive: boolean, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.user.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      select: managedUserSelect,
    });
  }
}
