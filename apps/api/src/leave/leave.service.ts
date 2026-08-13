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

@Injectable()
export class LeaveService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly leaveRepository: LeaveRepository,
  ) {}
  async create(userId: string, input: CreateLeaveInput) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const leave = await this.leaveRepository.create({
      employee: {
        connect: {
          id: employee.id,
        },
      },
      leaveType: input.leaveType,
      reason: input.reason,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    return successResponse(leave, 'Leave request submitted successfully.');
  }

  async findMine(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const leaves = await this.leaveRepository.findByEmployeeId(employee.id);

    return successResponse(leaves, 'Leave requests retrieved successfully.');
  }

  async findAll() {
    const leaves = await this.leaveRepository.findAll();

    return successResponse(leaves, 'Leave requests retrieved successfully.');
  }
  async approve(leaveRequestId: string, approverUserId: string) {
    const leave = await this.leaveRepository.findById(leaveRequestId);

    if (!leave) {
      throw new NotFoundException('Leave request not found.');
    }

    if (leave.status !== 'pending') {
      throw new BadRequestException(
        'Only pending leave requests can be approved.',
      );
    }

    const approver = await this.employeeRepository.findByUserId(approverUserId);

    if (!approver) {
      throw new NotFoundException('Approver employee profile not found.');
    }

    const approvedLeave = await this.leaveRepository.update(leaveRequestId, {
      status: 'approved',
      approvedAt: new Date(),
      approvedById: approver.id,
    });

    return successResponse(
      approvedLeave,
      'Leave request approved successfully.',
    );
  }
  async reject(
    leaveRequestId: string,
    approverUserId: string,
    input: RejectLeaveInput,
  ) {
    const leave = await this.leaveRepository.findById(leaveRequestId);

    if (!leave) {
      throw new NotFoundException('Leave request not found.');
    }

    if (leave.status !== 'pending') {
      throw new BadRequestException(
        'Only pending leave requests can be rejected.',
      );
    }

    const approver = await this.employeeRepository.findByUserId(approverUserId);

    if (!approver) {
      throw new NotFoundException('Approver employee profile not found.');
    }

    const rejectedLeave = await this.leaveRepository.update(leaveRequestId, {
      status: 'rejected',
      approvedById: approver.id,
      approvedAt: new Date(),
      remarks: input.remarks,
    });

    return successResponse(
      rejectedLeave,
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

    const cancelledLeave = await this.leaveRepository.update(leaveRequestId, {
      status: 'cancelled',
    });

    return successResponse(
      cancelledLeave,
      'Leave request cancelled successfully.',
    );
  }
}
