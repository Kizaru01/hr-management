import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { CreateDepartmentData } from '@hr-management/validation';

@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
    });
  }

  create(data: CreateDepartmentData) {
    return this.prisma.department.create({
      data,
    });
  }

  update(id: string, data: Prisma.DepartmentUpdateInput) {
    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.department.delete({
      where: {
        id,
      },
    });
  }

  findByCode(code: string) {
    return this.prisma.department.findUnique({
      where: { code },
    });
  }

  findByName(nameKey: string) {
    return this.prisma.department.findUnique({
      where: { nameKey },
    });
  }
}
