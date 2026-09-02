import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const positionRecordSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  departmentId: true,
  department: {
    select: {
      id: true,
      code: true,
      name: true,
      isActive: true,
    },
  },
  _count: {
    select: {
      employees: {
        where: {
          employmentStatus: 'active',
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PositionSelect;

export type PositionRecord = Prisma.PositionGetPayload<{
  select: typeof positionRecordSelect;
}>;

@Injectable()
export class PositionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllForDepartment(
    departmentId: string,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.position.findMany({
      where: { departmentId },
      select: positionRecordSelect,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  findActiveLookup(departmentId?: string) {
    return this.prisma.position.findMany({
      where: {
        isActive: true,
        ...(departmentId && { departmentId }),
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.position.findUnique({
      where: { id },
      select: positionRecordSelect,
    });
  }

  create(
    data: Prisma.PositionUncheckedCreateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.position.create({
      data,
      select: positionRecordSelect,
    });
  }

  update(
    id: string,
    data: Prisma.PositionUpdateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.position.update({
      where: { id },
      data,
      select: positionRecordSelect,
    });
  }

  findByDepartmentAndName(
    departmentId: string,
    name: string,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.position.findUnique({
      where: {
        departmentId_name: {
          departmentId,
          name,
        },
      },
      select: { id: true },
    });
  }

  transaction<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ) {
    return this.prisma.$transaction(operation, {
      isolationLevel: 'Serializable',
    });
  }
}
