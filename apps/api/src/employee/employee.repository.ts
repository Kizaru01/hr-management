import { Injectable } from '@nestjs/common';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from '@hr-management/validation';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
        position: true,
        branch: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { email },
    });
  }

  findByEmployeeId(employeeId: string) {
    return this.prisma.employee.findUnique({
      where: { employeeId },
    });
  }

  create(
    input: CreateEmployeeInput & {
      employeeId: string;
    },
  ) {
    return this.prisma.employee.create({
      data: input,
      include: {
        department: true,
        position: true,
        branch: true,
      },
    });
  }

  update(id: string, input: UpdateEmployeeInput) {
    return this.prisma.employee.update({
      where: { id },
      data: input,
      include: {
        department: true,
        position: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
  async generateEmployeeId() {
    const counter = await this.prisma.counter.upsert({
      where: {
        key: 'employeeId',
      },
      update: {
        value: {
          increment: 1,
        },
      },
      create: {
        key: 'employeeId',
        value: 1,
      },
    });

    return `EMP-${counter.value.toString().padStart(4, '0')}`;
  }
  linkUser(employeeId: string, userId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        userId,
      },
    });
  }
}
