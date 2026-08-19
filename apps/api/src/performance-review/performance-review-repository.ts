import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PerformanceReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PerformanceReviewCreateInput) {
    return this.prisma.performanceReview.create({
      data,
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

        reviewer: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
  findByEmployeeId(employeeId: string) {
    return this.prisma.performanceReview.findMany({
      where: {
        employeeId,
      },

      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            role: true,

            employee: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
        },
      },

      orderBy: {
        reviewDate: 'desc',
      },
    });
  }
  findByEmployeeIds(employeeIds: string[]) {
    return this.prisma.performanceReview.findMany({
      where: {
        employeeId: {
          in: employeeIds,
        },
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

        reviewer: {
          select: {
            id: true,
            email: true,
            role: true,

            employee: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
        },
      },

      orderBy: {
        reviewDate: 'desc',
      },
    });
  }
}
