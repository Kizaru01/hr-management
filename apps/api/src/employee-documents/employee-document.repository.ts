import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EmployeeDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EmployeeDocumentCreateInput) {
    return this.prisma.employeeDocument.create({
      data,
    });
  }

  findById(id: string) {
    return this.prisma.employeeDocument.findUnique({
      where: {
        id,
      },
    });
  }

  findByEmployeeId(employeeId: string) {
    return this.prisma.employeeDocument.findMany({
      where: {
        employeeId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
