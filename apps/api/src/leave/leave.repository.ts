import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class LeaveRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.LeaveRequestCreateInput) {
    return this.prisma.leaveRequest.create({
      data,
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
    });

    return leave ?? null;
  }
  findById(id: string) {
    return this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            userId: true,
            managerId: true,
          },
        },
      },
    });
  }
  findAll() {
    return this.prisma.leaveRequest.findMany({
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
  findApprovedForDateAll(workDate: Date) {
    return this.prisma.leaveRequest.findMany({
      where: {
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
  findByManagerId(managerId: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        employee: {
          managerId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  countApprovedForDate(workDate: Date) {
    return this.prisma.leaveRequest.count({
      where: {
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
  countPending() {
    return this.prisma.leaveRequest.count({
      where: {
        status: 'pending',
      },
    });
  }
  findRecent(limit = 5) {
    return this.prisma.leaveRequest.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
