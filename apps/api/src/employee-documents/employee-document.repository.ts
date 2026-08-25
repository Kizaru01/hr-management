import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

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
      select: {
        id: true,
        title: true,
        type: true,
        issuedAt: true,
        expiresAt: true,
        createdAt: true,
      },
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
