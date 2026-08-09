import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        employee: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        employee: true,
      },
    });
  }
  create(data: {
    email: string;
    role: 'admin' | 'hr' | 'employee';
    employeeId?: string;
    activationTokenHash: string;
    activationExpiresAt: Date;
  }) {
    return this.prisma.user.create({
      data,
    });
  }
  updateEmployee(employeeId: string, userId: string) {
    return this.prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        userId,
      },
    });
  }
}
