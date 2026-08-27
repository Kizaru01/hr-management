import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const employeeDocumentListSelect = {
  id: true,
  title: true,
  type: true,
  issuedAt: true,
  expiresAt: true,
  createdAt: true,
} satisfies Prisma.EmployeeDocumentSelect;

const managedEmployeeDocumentListSelect = {
  ...employeeDocumentListSelect,
  employeeId: true,
  employee: {
    select: {
      id: true,
      employeeNumber: true,
      firstName: true,
      middleName: true,
      lastName: true,
    },
  },
} satisfies Prisma.EmployeeDocumentSelect;

@Injectable()
export class EmployeeDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EmployeeDocumentCreateInput) {
    return this.prisma.employeeDocument.create({
      data,
      select: {
        id: true,
        title: true,
        type: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.employeeDocument.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        employeeId: true,
        fileUrl: true,
        isActive: true,
      },
    });
  }

  findByEmployeeId(employeeId: string) {
    return this.prisma.employeeDocument.findMany({
      where: {
        employeeId,
        isActive: true,
      },
      select: employeeDocumentListSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findAllActive() {
    return this.prisma.employeeDocument.findMany({
      where: {
        isActive: true,
      },
      select: managedEmployeeDocumentListSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  update(id: string, data: Prisma.EmployeeDocumentUpdateInput) {
    return this.prisma.employeeDocument.update({
      where: { id },
      data,
      select: {
        id: true,
        isActive: true,
      },
    });
  }
}
