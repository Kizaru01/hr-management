import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeRepository } from '../employee/employee.repository';
import { CreateLeaveInput } from '@hr-management/validation';
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
}
