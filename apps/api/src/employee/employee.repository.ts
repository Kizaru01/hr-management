import { Injectable } from '@nestjs/common';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  UpdateMyProfileInput,
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
  findByUserId(userId: string) {
    return this.prisma.employee.findUnique({
      where: {
        userId,
      },
      include: {
        department: true,
        position: true,
        branch: true,
      },
    });
  }
  findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { email },
    });
  }

  findByEmployeeNumber(employeeNumber: string) {
    return this.prisma.employee.findUnique({
      where: { employeeNumber },
    });
  }

  create(
    input: CreateEmployeeInput & {
      employeeNumber: string;
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
  updateByUserId(userId: string, input: UpdateMyProfileInput) {
    return this.prisma.employee.update({
      where: {
        userId,
      },
      data: input,
      include: {
        department: true,
        position: true,
        branch: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
  async generateEmployeeNumber() {
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
  linkUser(id: string, userId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;

    return client.employee.update({
      where: {
        id,
      },
      data: {
        userId,
      },
    });
  }
}
