import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationRepository } from './notification.repository.js';
import { successResponse } from '../common/responses/success-response.js';
import type { NotificationType } from '../generated/prisma/client.js';
import {
  mapNotification,
  mapNotificationReadResult,
} from './notification.mapper.js';

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  resourceId?: string;
  resourceType?: string;
}
interface CreateManyNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  resourceId?: string;
  resourceType?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  create(input: CreateNotificationInput) {
    return this.notificationRepository.create({
      user: {
        connect: {
          id: input.userId,
        },
      },

      title: input.title,
      message: input.message,
      type: input.type,

      resourceId: input.resourceId,
      resourceType: input.resourceType,
    });
  }

  async findMine(userId: string) {
    const notifications =
      await this.notificationRepository.findByUserId(userId);
    const data = notifications.map(mapNotification);

    return successResponse(data, 'Notifications retrieved successfully.');
  }

  async markAsRead(notificationId: string, currentUserId: string) {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    if (notification.userId !== currentUserId) {
      throw new ForbiddenException(
        'You are not authorized to access this notification.',
      );
    }

    if (notification.isRead) {
      if (!notification.readAt) {
        throw new InternalServerErrorException(
          'Read notification is missing its read timestamp.',
        );
      }

      return successResponse(
        mapNotificationReadResult({
          id: notification.id,
          readAt: notification.readAt,
        }),
        'Notification already read.',
      );
    }

    const updatedNotification = await this.notificationRepository.markAsRead(
      notification.id,
    );

    if (!updatedNotification.readAt) {
      throw new InternalServerErrorException(
        'Read notification is missing its read timestamp.',
      );
    }

    return successResponse(
      mapNotificationReadResult({
        id: updatedNotification.id,
        readAt: updatedNotification.readAt,
      }),
      'Notification marked as read.',
    );
  }
  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.countUnreadByUserId(userId);

    return successResponse(
      {
        count,
      },
      'Unread notification count retrieved successfully.',
    );
  }
  async markAllAsRead(userId: string) {
    const result =
      await this.notificationRepository.markAllAsReadByUserId(userId);

    return successResponse(
      {
        updatedCount: result.count,
      },
      'All notifications marked as read.',
    );
  }
  createMany(notifications: CreateManyNotificationInput[]) {
    if (notifications.length === 0) {
      return;
    }

    return this.notificationRepository.createMany(notifications);
  }
}
