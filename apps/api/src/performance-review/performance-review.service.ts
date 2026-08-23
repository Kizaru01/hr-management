import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PerformanceReviewRepository } from './performance-review-repository';
import { CreatePerformanceReviewInput } from '@hr-management/validation';
import { AuthenticatedUser } from '../auth/types/user.type';
import { successResponse } from '../common/responses/success-response';
import { EmployeeRepository } from '../employee/employee.repository';
import { NotificationService } from '../notification/notification.service';
import { dateOnlyToUtc } from '../common/dates/date-conversion.js';

@Injectable()
export class PerformanceReviewService {
  constructor(
    private readonly performanceReviewRepository: PerformanceReviewRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly notificationService: NotificationService,
  ) {}
  async create(
    employeeId: string,
    currentUser: AuthenticatedUser,
    input: CreatePerformanceReviewInput,
  ) {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      const reviewer = await this.employeeRepository.findByUserId(
        currentUser.id,
      );

      if (!reviewer || employee.managerId !== reviewer.id) {
        throw new ForbiddenException(
          'You are not authorized to review this employee.',
        );
      }
    }

    const review = await this.performanceReviewRepository.create({
      reviewDate: dateOnlyToUtc(input.reviewDate),
      rating: input.rating,
      strengths: input.strengths,
      improvements: input.improvements,
      comments: input.comments,

      employee: {
        connect: {
          id: employee.id,
        },
      },

      reviewer: {
        connect: {
          id: currentUser.id,
        },
      },
    });

    if (employee.userId) {
      await this.notificationService.create({
        userId: employee.userId,
        title: 'New performance review',
        message: 'A new performance review has been added to your profile.',
        type: 'performance_review',
        resourceType: 'performance_review',
        resourceId: review.id,
      });
    }
    return successResponse(review, 'Performance review created successfully.');
  }
  async findMyReviews(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const reviews = await this.performanceReviewRepository.findByEmployeeId(
      employee.id,
    );

    const data = reviews.map((review) => {
      const reviewerEmployee = review.reviewer.employee;

      const reviewerName = reviewerEmployee
        ? [
            reviewerEmployee.firstName,
            reviewerEmployee.middleName,
            reviewerEmployee.lastName,
          ]
            .filter(Boolean)
            .join(' ')
        : review.reviewer.email;

      return {
        id: review.id,
        reviewDate: review.reviewDate,
        rating: review.rating,
        strengths: review.strengths,
        improvements: review.improvements,
        comments: review.comments,

        reviewer: {
          id: review.reviewer.id,
          name: reviewerName,
          role: review.reviewer.role,
        },

        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

    return successResponse(data, 'Performance reviews retrieved successfully.');
  }
  async findByEmployeeId(employeeId: string) {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const reviews = await this.performanceReviewRepository.findByEmployeeId(
      employee.id,
    );

    const data = reviews.map((review) => {
      const reviewerEmployee = review.reviewer.employee;

      const reviewerName = reviewerEmployee
        ? [
            reviewerEmployee.firstName,
            reviewerEmployee.middleName,
            reviewerEmployee.lastName,
          ]
            .filter(Boolean)
            .join(' ')
        : review.reviewer.email;

      return {
        id: review.id,
        reviewDate: review.reviewDate,
        rating: review.rating,
        strengths: review.strengths,
        improvements: review.improvements,
        comments: review.comments,

        reviewer: {
          id: review.reviewer.id,
          name: reviewerName,
          role: review.reviewer.role,
        },

        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

    return successResponse(
      data,
      'Employee performance reviews retrieved successfully.',
    );
  }
  async findMyTeamReviews(userId: string) {
    const manager = await this.employeeRepository.findByUserId(userId);

    if (!manager) {
      throw new NotFoundException('Employee profile not found.');
    }

    const team = await this.employeeRepository.findByManagerId(manager.id);

    if (team.length === 0) {
      return successResponse(
        [],
        'Team performance reviews retrieved successfully.',
      );
    }

    const employeeIds = team.map((employee) => employee.id);

    const reviews =
      await this.performanceReviewRepository.findByEmployeeIds(employeeIds);

    const data = reviews.map((review) => {
      const employeeName = [
        review.employee.firstName,
        review.employee.middleName,
        review.employee.lastName,
      ]
        .filter(Boolean)
        .join(' ');

      const reviewerEmployee = review.reviewer.employee;

      const reviewerName = reviewerEmployee
        ? [
            reviewerEmployee.firstName,
            reviewerEmployee.middleName,
            reviewerEmployee.lastName,
          ]
            .filter(Boolean)
            .join(' ')
        : review.reviewer.email;

      return {
        id: review.id,
        reviewDate: review.reviewDate,
        rating: review.rating,
        strengths: review.strengths,
        improvements: review.improvements,
        comments: review.comments,

        employee: {
          id: review.employee.id,
          employeeNumber: review.employee.employeeNumber,
          name: employeeName,
        },

        reviewer: {
          id: review.reviewer.id,
          name: reviewerName,
          role: review.reviewer.role,
        },

        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

    return successResponse(
      data,
      'Team performance reviews retrieved successfully.',
    );
  }
}
