import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class LeaveRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.LeaveRequestCreateInput) {
    return this.prisma.leaveRequest.create({
      data,
      include: {
        employee: true,
      },
    });
  }
  findByEmployeeId(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  update(id: string, data: Prisma.LeaveRequestUpdateInput) {
    return this.prisma.leaveRequest.update({
      where: { id },
      data,
      include: {
        employee: true,
      },
    });
  }
  findById(id: string) {
    return this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });
  }
  findAll() {
    return this.prisma.leaveRequest.findMany({
      include: {
        employee: {
          include: {
            department: true,
            position: true,
            branch: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
