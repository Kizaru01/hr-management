import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AssignShiftInput,
  CreateShiftInput,
  UpdateShiftInput,
} from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response.js';
import { ShiftRepository } from './shift.repository.js';
import { EmployeeRepository } from '../employee/employee.repository.js';
import { EmployeeShiftRepository } from './employee-shift.repository.js';
import { dateOnlyToUtc } from '../common/dates/date-conversion.js';

@Injectable()
export class ShiftService {
  constructor(
    private readonly shiftRepository: ShiftRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly employeeShiftRepository: EmployeeShiftRepository,
  ) {}

  async create(input: CreateShiftInput) {
    const name = input.name.trim();

    const existingShift = await this.shiftRepository.findByName(name);

    if (existingShift) {
      throw new ConflictException('Shift name already exists.');
    }

    const shift = await this.shiftRepository.create({
      name,
      startTime: input.startTime,
      endTime: input.endTime,
    });

    return successResponse(shift, 'Shift created successfully.');
  }

  async findAll() {
    const shifts = await this.shiftRepository.findAll();

    return successResponse(shifts, 'Shifts retrieved successfully.');
  }

  async findOne(shiftId: string) {
    const shift = await this.shiftRepository.findById(shiftId);

    if (!shift) {
      throw new NotFoundException('Shift not found.');
    }

    return successResponse(shift, 'Shift retrieved successfully.');
  }

  async findEmployeeShifts(employeeId: string) {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const assignments = await this.employeeShiftRepository.findByEmployeeId(
      employee.id,
    );

    return successResponse(
      assignments,
      'Employee shift assignments retrieved successfully.',
    );
  }

  async update(id: string, input: UpdateShiftInput) {
    const existingShift = await this.shiftRepository.findById(id);

    if (!existingShift) {
      throw new NotFoundException('Shift not found.');
    }

    const nextName = input.name?.trim() ?? existingShift.name;

    if (input.name !== undefined) {
      const duplicate = await this.shiftRepository.findByName(nextName);

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Shift name already exists.');
      }
    }

    const shift = await this.shiftRepository.update(id, {
      ...input,
      ...(input.name !== undefined && {
        name: nextName,
      }),
    });

    return successResponse(shift, 'Shift updated successfully.');
  }

  async assignToEmployee(employeeId: string, input: AssignShiftInput) {
    const effectiveFrom = dateOnlyToUtc(input.effectiveFrom);
    const effectiveTo = input.effectiveTo
      ? dateOnlyToUtc(input.effectiveTo)
      : undefined;

    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const shift = await this.shiftRepository.findById(input.shiftId);

    if (!shift) {
      throw new NotFoundException('Shift not found.');
    }

    if (!shift.isActive) {
      throw new BadRequestException('Inactive shifts cannot be assigned.');
    }

    if (effectiveTo && effectiveTo < effectiveFrom) {
      throw new BadRequestException(
        'Effective end date cannot be before the start date.',
      );
    }

    const existingSchedule =
      await this.employeeShiftRepository.existingSchedule(
        employee.id,
        effectiveFrom,
        effectiveTo,
      );

    if (existingSchedule) {
      throw new ConflictException(
        'Employee already has a shift assignment during this period.',
      );
    }

    const assignment = await this.employeeShiftRepository.create({
      employee: {
        connect: {
          id: employee.id,
        },
      },
      shift: {
        connect: {
          id: shift.id,
        },
      },
      workDays: input.workDays,
      effectiveFrom,
      effectiveTo,
    });

    return successResponse(
      assignment,
      'Shift assigned to employee successfully.',
    );
  }

  async deactivate(id: string) {
    const shift = await this.shiftRepository.findById(id);

    if (!shift) {
      throw new NotFoundException('Shift not found.');
    }

    if (!shift.isActive) {
      throw new BadRequestException('Shift is already inactive.');
    }

    const updatedShift = await this.shiftRepository.update(id, {
      isActive: false,
    });

    return successResponse(updatedShift, 'Shift deactivated successfully.');
  }
}
