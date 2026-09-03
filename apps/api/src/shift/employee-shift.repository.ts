import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EmployeeShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EmployeeShiftCreateInput) {
    return this.prisma.employeeShift.create({
      data,
      include: {
        shift: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.employeeShift.findUnique({
      where: { id },
    });
  }

  delete(id: string) {
    return this.prisma.employeeShift.delete({
      where: { id },
    });
  }

  existingSchedule(
    employeeId: string,
    effectiveFrom: Date,
    effectiveTo?: Date,
  ) {
    return this.prisma.employeeShift.findFirst({
      where: {
        employeeId,
        AND: [
          {
            effectiveFrom: {
              lte: effectiveTo ?? new Date('9999-12-31'),
            },
          },
          {
            OR: [
              {
                effectiveTo: null,
              },
              {
                effectiveTo: {
                  gte: effectiveFrom,
                },
              },
            ],
          },
        ],
      },
    });
  }
  findForDateRange(employeeId: string, from: Date, to: Date) {
    return this.prisma.employeeShift.findMany({
      where: {
        employeeId,

        effectiveFrom: {
          lte: to,
        },

        OR: [
          {
            effectiveTo: null,
          },
          {
            effectiveTo: {
              gte: from,
            },
          },
        ],
      },

      include: {
        shift: true,
      },

      orderBy: {
        effectiveFrom: 'asc',
      },
    });
  }
  findActiveAssignment(employeeId: string, workDate: Date) {
    return this.prisma.employeeShift.findFirst({
      where: {
        employeeId,
        effectiveFrom: {
          lte: workDate,
        },
        OR: [
          {
            effectiveTo: null,
          },
          {
            effectiveTo: {
              gte: workDate,
            },
          },
        ],
      },
      include: {
        shift: true,
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });
  }
  findByEmployeeId(employeeId: string) {
    return this.prisma.employeeShift.findMany({
      where: {
        employeeId,
      },
      include: {
        shift: true,
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });
  }
  findActiveAssignmentsForDate(workDate: Date) {
    return this.prisma.employeeShift.findMany({
      where: {
        effectiveFrom: {
          lte: workDate,
        },
        OR: [
          {
            effectiveTo: null,
          },
          {
            effectiveTo: {
              gte: workDate,
            },
          },
        ],
      },
      include: {
        shift: true,
      },
    });
  }
}
