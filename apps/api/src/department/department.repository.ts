import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';

export const departmentRecordSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  isActive: true,
  departmentHeadId: true,
  departmentHead: {
    select: {
      id: true,
      employeeNumber: true,
      firstName: true,
      middleName: true,
      lastName: true,
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
} satisfies Prisma.DepartmentSelect;

export type DepartmentRecord = Prisma.DepartmentGetPayload<{
  select: typeof departmentRecordSelect;
}>;

@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.department.findMany({
      select: departmentRecordSelect,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  findById(id: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.department.findUnique({
      where: { id },
      select: departmentRecordSelect,
    });
  }

  create(
    data: Prisma.DepartmentCreateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.department.create({
      data,
      select: departmentRecordSelect,
    });
  }

  update(
    id: string,
    data: Prisma.DepartmentUpdateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.department.update({
      where: { id },
      data,
      select: departmentRecordSelect,
    });
  }

  findByCode(code: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.department.findUnique({
      where: { code },
      select: { id: true },
    });
  }

  findByName(nameKey: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.department.findUnique({
      where: { nameKey },
      select: { id: true },
    });
  }

  findEmployeeForHead(id: string, transaction?: Prisma.TransactionClient) {
    const client = transaction ?? this.prisma;

    return client.employee.findUnique({
      where: { id },
      select: {
        id: true,
        employeeNumber: true,
        employmentStatus: true,
        headedDepartment: {
          select: {
            id: true,
          },
        },
      },
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
