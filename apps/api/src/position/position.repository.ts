import { Injectable } from '@nestjs/common';
import type {
  CreatePositionInput,
  UpdatePositionInput,
} from '@hr-management/validation';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PositionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.position.findMany({
      include: {
        department: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.position.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });
  }

  create(input: CreatePositionInput) {
    return this.prisma.position.create({
      data: input,
      include: {
        department: true,
      },
    });
  }

  update(id: string, data: UpdatePositionInput) {
    return this.prisma.position.update({
      where: {
        id,
      },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.position.delete({
      where: { id },
    });
  }

  findByDepartmentAndName(departmentId: string, name: string) {
    return this.prisma.position.findFirst({
      where: {
        departmentId,
        name,
      },
    });
  }
}
