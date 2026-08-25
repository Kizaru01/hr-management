import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({
      data,
    });
  }

  findByUserId(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        resourceId: true,
        resourceType: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string) {
    return this.prisma.notification.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        isRead: true,
        readAt: true,
      },
    });
  }

  markAsRead(id: string) {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      select: {
        id: true,
        readAt: true,
      },
    });
  }
  countUnreadByUserId(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
  markAllAsReadByUserId(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
  createMany(data: Prisma.NotificationCreateManyInput[]) {
    return this.prisma.notification.createMany({
      data,
    });
  }
}
