import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnnouncementsRepository } from './announcements.repository';
import { CreateAnnouncementInput } from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response';
import { DepartmentRepository } from '../department/department.repository';
import { BranchRepository } from '../branch/branch.respository';
import { EmployeeRepository } from '../employee/employee.repository';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly announcementsRepository: AnnouncementsRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly branchRepository: BranchRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async create(currentUserId: string, input: CreateAnnouncementInput) {
    if (input.audience === 'department' && !input.departmentId) {
      throw new BadRequestException(
        'Department is required for department announcements.',
      );
    }

    if (input.audience === 'branch' && !input.branchId) {
      throw new BadRequestException(
        'Branch is required for branch announcements.',
      );
    }
    if (input.audience !== 'department' && input.departmentId) {
      throw new BadRequestException(
        'Department can only be set for department announcements.',
      );
    }

    if (input.audience !== 'branch' && input.branchId) {
      throw new BadRequestException(
        'Branch can only be set for branch announcements.',
      );
    }
    if (input.departmentId) {
      const department = await this.departmentRepository.findById(
        input.departmentId,
      );

      if (!department) {
        throw new NotFoundException('Department not found.');
      }
    }

    if (input.branchId) {
      const branch = await this.branchRepository.findById(input.branchId);

      if (!branch) {
        throw new NotFoundException('Branch not found.');
      }
    }
    const announcement = await this.announcementsRepository.create({
      title: input.title.trim(),
      content: input.content.trim(),
      audience: input.audience,
      expiresAt: input.expiresAt,

      createdBy: {
        connect: {
          id: currentUserId,
        },
      },
      ...(input.departmentId && {
        department: {
          connect: {
            id: input.departmentId,
          },
        },
      }),

      ...(input.branchId && {
        branch: {
          connect: {
            id: input.branchId,
          },
        },
      }),
    });
    const recipients = await this.employeeRepository.findNotificationRecipients(
      input.audience,
      input.departmentId,
      input.branchId,
    );
    const notifications = recipients
      .filter(
        (recipient): recipient is { userId: string } =>
          recipient.userId !== null,
      )
      .map((recipient) => ({
        userId: recipient.userId,
        title: 'New announcement',
        message: announcement.title,
        type: 'announcement' as const,
        resourceType: 'announcement',
        resourceId: announcement.id,
      }));

    await this.notificationService.createMany(notifications);

    return successResponse(announcement, 'Announcement created successfully.');
  }

  async findActive(currentUserId: string) {
    const employee = await this.employeeRepository.findByUserId(currentUserId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const announcements =
      await this.announcementsRepository.findVisibleForEmployee(
        new Date(),
        employee.departmentId,
        employee.branchId,
      );

    const data = announcements.map((announcement) => {
      const employeeProfile = announcement.createdBy.employee;

      const name = employeeProfile
        ? [
            employeeProfile.firstName,
            employeeProfile.middleName,
            employeeProfile.lastName,
          ]
            .filter(Boolean)
            .join(' ')
        : announcement.createdBy.email;

      return {
        ...announcement,

        createdBy: {
          id: announcement.createdBy.id,
          email: announcement.createdBy.email,
          role: announcement.createdBy.role,
          name,
        },
      };
    });

    return successResponse(data, 'Announcements retrieved successfully.');
  }
  async findAllForManagement() {
    const announcements =
      await this.announcementsRepository.findAllForManagement();

    const data = announcements.map((announcement) => {
      const employee = announcement.createdBy.employee;

      const name = employee
        ? [employee.firstName, employee.middleName, employee.lastName]
            .filter(Boolean)
            .join(' ')
        : announcement.createdBy.email;

      return {
        ...announcement,

        createdBy: {
          id: announcement.createdBy.id,
          email: announcement.createdBy.email,
          role: announcement.createdBy.role,
          name,
        },
      };
    });

    return successResponse(data, 'Announcements retrieved successfully.');
  }
}
