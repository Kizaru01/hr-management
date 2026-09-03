import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const branchRecordSelect = {
  id: true,
  code: true,
  name: true,
  address: true,
  city: true,
  province: true,
  latitude: true,
  longitude: true,
  allowedRadius: true,
  isActive: true,
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
} satisfies Prisma.BranchSelect;

export type BranchRecord = Prisma.BranchGetPayload<{
  select: typeof branchRecordSelect;
}>;

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.branch.findMany({
      select: branchRecordSelect,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  findById(id: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.branch.findUnique({
      where: { id },
      select: branchRecordSelect,
    });
  }

  findByCode(code: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.branch.findUnique({
      where: { code },
      select: { id: true },
    });
  }

  findByName(name: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.branch.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });
  }

  create(
    data: Prisma.BranchCreateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.branch.create({
      data,
      select: branchRecordSelect,
    });
  }

  update(
    id: string,
    data: Prisma.BranchUpdateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.branch.update({
      where: { id },
      data,
      select: branchRecordSelect,
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
