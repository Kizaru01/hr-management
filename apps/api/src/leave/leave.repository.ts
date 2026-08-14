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
  async updatePending(
    id: string,
    data: Prisma.LeaveRequestUpdateManyMutationInput,
  ) {
    const [leave] = await this.prisma.leaveRequest.updateManyAndReturn({
      where: { id, status: 'pending' },
      data,
      include: {
        employee: true,
      },
    });

    return leave ?? null;
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
  findApprovedForDate(employeeId: string, workDate: Date) {
    return this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: 'approved',
        startDate: {
          lte: workDate,
        },
        endDate: {
          gte: workDate,
        },
      },
    });
  }
  findApprovedForDateRange(employeeId: string, from: Date, to: Date) {
    return this.prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'approved',

        startDate: {
          lte: to,
        },

        endDate: {
          gte: from,
        },
      },
    });
  }
}
