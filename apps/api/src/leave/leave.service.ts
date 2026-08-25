import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRepository } from '../employee/employee.repository';
import { CreateLeaveInput, RejectLeaveInput } from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response';
import { LeaveRepository } from './leave.repository';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { dateOnlyToUtc } from '../common/dates/date-conversion.js';
import { mapEmployeeLeave, mapManagedLeave } from './leave.mapper.js';
import { getWorkDate } from '../attendance/attendance-date.js';
import { getLeaveFilingPolicyError } from './leave-filing-policy.js';

@Injectable()
export class LeaveService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly leaveRepository: LeaveRepository,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {}
  async create(userId: string, input: CreateLeaveInput) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const startDate = dateOnlyToUtc(input.startDate);
    const filingPolicyError = getLeaveFilingPolicyError(
      input.leaveType,
      startDate,
      getWorkDate(),
    );

    if (filingPolicyError) {
      throw new BadRequestException(filingPolicyError);
    }

    const leave = await this.leaveRepository.create({
      employee: {
        connect: {
          id: employee.id,
        },
      },
      leaveType: input.leaveType,
      reason: input.reason,
      startDate,
      endDate: dateOnlyToUtc(input.endDate),
    });

    return successResponse(
      mapEmployeeLeave(leave),
      'Leave request submitted successfully.',
    );
  }
  async findMine(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const leaves = await this.leaveRepository.findByEmployeeId(employee.id);

    return successResponse(
      leaves.map(mapEmployeeLeave),
      'Leave requests retrieved successfully.',
    );
  }
  async findAll() {
    const leaves = await this.leaveRepository.findAll();

    return successResponse(
      leaves.map(mapManagedLeave),
      'Leave requests retrieved successfully.',
    );
  }
  async approve(
    leaveRequestId: string,
    currentUserId: string,
    currentUserRole: string,
  ) {
    const leave = await this.leaveRepository.findById(leaveRequestId);

    if (!leave) {
      throw new NotFoundException('Leave request not found.');
    }

    const approver = await this.employeeRepository.findByUserId(currentUserId);

    if (!approver) {
      throw new NotFoundException('Approver employee profile not found.');
    }

    this.validateLeaveApprover(leave, approver.id, currentUserRole);

    if (leave.status !== 'pending') {
      throw new BadRequestException(
        'Only pending leave requests can be approved.',
      );
    }

    const approvedLeave = await this.leaveRepository.updatePending(
      leaveRequestId,
      {
        status: 'approved',
        approvedAt: new Date(),
        approvedById: approver.id,
      },
    );

    if (!approvedLeave) {
      throw new BadRequestException(
        'Only pending leave requests can be approved.',
      );
    }

    if (leave.employee.userId) {
      await this.notificationService.create({
        userId: leave.employee.userId,
        title: 'Leave request approved',
        message: 'Your leave request has been approved.',
        type: 'leave',
        resourceType: 'leave_request',
        resourceId: leave.id,
      });
    }
    await this.auditLogService.create({
      actorUserId: currentUserId,
      action: 'leave.approve',
      entityType: 'LeaveRequest',
      entityId: leave.id,
      metadata: {
        previousStatus: leave.status,
        newStatus: 'approved',
      },
    });
    return successResponse(
      {
        id: approvedLeave.id,
        status: approvedLeave.status,
        remarks: approvedLeave.remarks,
      },
      'Leave request approved successfully.',
    );
  }
  async reject(
    leaveRequestId: string,
    approverUserId: string,
    currentUserRole: string,
    input: RejectLeaveInput,
  ) {
    const leave = await this.leaveRepository.findById(leaveRequestId);

    if (!leave) {
      throw new NotFoundException('Leave request not found.');
    }
    const approver = await this.employeeRepository.findByUserId(approverUserId);

    if (!approver) {
      throw new NotFoundException('Approver employee profile not found.');
    }

    this.validateLeaveApprover(leave, approver.id, currentUserRole);

    if (leave.status !== 'pending') {
      throw new BadRequestException(
        'Only pending leave requests can be rejected.',
      );
    }

    const rejectedLeave = await this.leaveRepository.updatePending(
      leaveRequestId,
      {
        status: 'rejected',
        approvedById: approver.id,
        approvedAt: new Date(),
        remarks: input.remarks,
      },
    );

    if (!rejectedLeave) {
      throw new BadRequestException(
        'Only pending leave requests can be rejected.',
      );
    }

    if (leave.employee.userId) {
      await this.notificationService.create({
        userId: leave.employee.userId,
        title: 'Leave request rejected',
        message: 'Your leave request has been rejected.',
        type: 'leave',
        resourceType: 'leave_request',
        resourceId: leave.id,
      });
    }

    await this.auditLogService.create({
      actorUserId: approverUserId,
      action: 'leave.reject',
      entityType: 'LeaveRequest',
      entityId: leave.id,
      metadata: {
        previousStatus: leave.status,
        newStatus: 'rejected',
      },
    });

    return successResponse(
      {
        id: rejectedLeave.id,
        status: rejectedLeave.status,
        remarks: rejectedLeave.remarks,
      },
      'Leave request rejected successfully.',
    );
  }
  async cancel(leaveRequestId: string, currentUserId: string) {
    const leave = await this.leaveRepository.findById(leaveRequestId);

    if (!leave) {
      throw new NotFoundException('Leave request not found.');
    }

    const employee = await this.employeeRepository.findByUserId(currentUserId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    if (leave.employeeId !== employee.id) {
      throw new ForbiddenException(
        "You cannot cancel another employee's leave request.",
      );
    }

    if (leave.status !== 'pending') {
      throw new BadRequestException(
        'Only pending leave requests can be cancelled.',
      );
    }

    const cancelledLeave = await this.leaveRepository.updatePending(
      leaveRequestId,
      {
        status: 'cancelled',
      },
    );

    if (!cancelledLeave) {
      throw new BadRequestException(
        'Only pending leave requests can be cancelled.',
      );
    }

    if (leave.employee.userId) {
      await this.notificationService.create({
        userId: leave.employee.userId,

        title: 'Leave request cancelled',

        message: 'Your leave request has been cancelled.',

        type: 'leave',

        resourceType: 'leave_request',
        resourceId: leave.id,
      });
    }

    return successResponse(
      mapEmployeeLeave(cancelledLeave),
      'Leave request cancelled successfully.',
    );
  }
  async findMyTeamLeaveRequests(userId: string) {
    const manager = await this.employeeRepository.findByUserId(userId);

    if (!manager) {
      throw new NotFoundException('Employee profile not found.');
    }

    const leaves = await this.leaveRepository.findByManagerId(manager.id);

    return successResponse(
      leaves.map(mapManagedLeave),
      'Team leave requests retrieved successfully.',
    );
  }
  private validateLeaveApprover(
    leave: {
      employee: {
        managerId: string | null;
      };
    },
    approverEmployeeId: string,
    currentUserRole: string,
  ) {
    if (currentUserRole === 'admin' || currentUserRole === 'hr') {
      return;
    }

    if (leave.employee.managerId !== approverEmployeeId) {
      throw new ForbiddenException(
        'You are not authorized to manage this leave request.',
      );
    }
  }
}
