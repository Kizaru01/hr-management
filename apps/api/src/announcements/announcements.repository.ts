import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AnnouncementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AnnouncementCreateInput) {
    return this.prisma.announcement.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.announcement.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Prisma.AnnouncementUpdateInput) {
    return this.prisma.announcement.update({
      where: { id },
      data,
    });
  }

  findActive(now: Date) {
    return this.prisma.announcement.findMany({
      where: {
        isActive: true,
        publishedAt: {
          lte: now,
        },
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gte: now,
            },
          },
        ],
      },
      include: {
        createdBy: {
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
        publishedAt: 'desc',
      },
    });
  }
  findVisibleForEmployee(
    now: Date,
    departmentId: string,
    branchId: string | null,
  ) {
    return this.prisma.announcement.findMany({
      where: {
        isActive: true,

        publishedAt: {
          lte: now,
        },

        AND: [
          {
            OR: [
              {
                expiresAt: null,
              },
              {
                expiresAt: {
                  gte: now,
                },
              },
            ],
          },

          {
            OR: [
              {
                audience: 'company',
              },
              {
                audience: 'department',
                departmentId,
              },
              ...(branchId
                ? [
                    {
                      audience: 'branch' as const,
                      branchId,
                    },
                  ]
                : []),
            ],
          },
        ],
      },

      include: {
        createdBy: {
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

        department: {
          select: {
            id: true,
            name: true,
          },
        },

        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        publishedAt: 'desc',
      },
    });
  }
  findAllForManagement() {
    return this.prisma.announcement.findMany({
      include: {
        createdBy: {
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

        department: {
          select: {
            id: true,
            name: true,
          },
        },

        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
