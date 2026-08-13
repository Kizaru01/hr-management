import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRepository } from '../employee/employee.repository';
import { successResponse } from '../common/responses/success-response';
import { getWorkDate } from './attendance-date';
import { AttendanceRepository } from './attendance.repository';
import { Prisma } from '../generated/prisma/client.js';
import { AttendanceQueryInput } from '@hr-management/validation';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceRepository: AttendanceRepository,
  ) {}

  async checkIn(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const now = new Date();
    const workDate = getWorkDate(now);

    const existingAttendance =
      await this.attendanceRepository.findByEmployeeAndWorkDate(
        employee.id,
        workDate,
      );

    if (existingAttendance) {
      throw new ConflictException('You have already checked in today.');
    }

    try {
      const attendance = await this.attendanceRepository.create({
        employee: {
          connect: {
            id: employee.id,
          },
        },
        workDate,
        checkInAt: now,
      });

      return successResponse(attendance, 'Checked in successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You have already checked in today.');
      }

      throw error;
    }
  }

  async checkOut(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const now = new Date();
    const workDate = getWorkDate(now);

    const attendance =
      await this.attendanceRepository.findByEmployeeAndWorkDate(
        employee.id,
        workDate,
      );

    if (!attendance) {
      throw new BadRequestException('You must check in before checking out.');
    }

    if (attendance.checkOutAt) {
      throw new ConflictException('You have already checked out today.');
    }

    const updatedAttendance = await this.attendanceRepository.update(
      attendance.id,
      {
        checkOutAt: now,
      },
    );

    return successResponse(updatedAttendance, 'Checked out successfully.');
  }

  async findMine(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const attendances = await this.attendanceRepository.findByEmployeeId(
      employee.id,
    );

    return successResponse(
      attendances,
      'Attendance records retrieved successfully.',
    );
  }
  async findAll(input: AttendanceQueryInput) {
    const workDate = input.date
      ? new Date(`${input.date}T00:00:00.000Z`)
      : getWorkDate();

    const attendances =
      await this.attendanceRepository.findAllByWorkDate(workDate);

    return successResponse(
      attendances,
      'Attendance records retrieved successfully.',
    );
  }
}
