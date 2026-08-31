import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.AuditLogCreateInput,
    transaction?: Prisma.TransactionClient,
  ) {
    const client = transaction ?? this.prisma;

    return client.auditLog.create({
      data,
    });
  }

  findRecent(limit = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actorUser: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
