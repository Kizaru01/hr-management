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
import { EmployeeShiftRepository } from '../shift/employee-shift.repository';
import {
  getDatesInRange,
  getShiftDateTime,
  getShiftEndDateTime,
} from './attendance-time';
import { getAttendanceStatus, getWeekday } from './attendance-status';
import { LeaveRepository } from '../leave/leave.repository';
import { mapAttendanceEmployee } from './attendance.mapper';
import { HolidayRepository } from '../holliday/holliday.repository';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly employeeShiftRepository: EmployeeShiftRepository,
    private readonly leaveRepository: LeaveRepository,
    private readonly holidayRepository: HolidayRepository,
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

    const assignment = await this.employeeShiftRepository.findActiveAssignment(
      employee.id,
      workDate,
    );

    if (!assignment) {
      throw new BadRequestException('No active shift is assigned for today.');
    }

    const expectedStart = getShiftDateTime(
      workDate,
      assignment.shift.startTime,
    );

    const lateMilliseconds = now.getTime() - expectedStart.getTime();

    const lateMinutes = Math.max(0, Math.floor(lateMilliseconds / 60_000));
    try {
      const attendance = await this.attendanceRepository.create({
        employee: {
          connect: {
            id: employee.id,
          },
        },
        workDate,
        checkInAt: now,
        lateMinutes,
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

    const assignment = await this.employeeShiftRepository.findActiveAssignment(
      employee.id,
      workDate,
    );

    if (!assignment) {
      throw new BadRequestException('No active shift is assigned for today.');
    }

    const expectedEnd = getShiftEndDateTime(
      workDate,
      assignment.shift.startTime,
      assignment.shift.endTime,
    );

    const undertimeMilliseconds = expectedEnd.getTime() - now.getTime();

    const undertimeMinutes = Math.max(
      0,
      Math.floor(undertimeMilliseconds / 60_000),
    );

    const updatedAttendance = await this.attendanceRepository.update(
      attendance.id,
      {
        checkOutAt: now,
        undertimeMinutes,
      },
    );

    return successResponse(updatedAttendance, 'Checked out successfully.');
  }
  async findMine(userId: string, from?: string, to?: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }
    if ((from && !to) || (!from && to)) {
      throw new BadRequestException('Both from and to dates are required.');
    }
    if (from && to && from > to) {
      throw new BadRequestException('From date cannot be after to date.');
    }
    const attendances =
      from && to
        ? await this.attendanceRepository.findByEmployeeAndDateRange(
            employee.id,
            new Date(`${from}T00:00:00.000Z`),
            new Date(`${to}T00:00:00.000Z`),
          )
        : await this.attendanceRepository.findByEmployeeId(employee.id);

    const data = attendances.map((attendance) => ({
      ...attendance,

      status: getAttendanceStatus({
        checkOutAt: attendance.checkOutAt,
        lateMinutes: attendance.lateMinutes,
        undertimeMinutes: attendance.undertimeMinutes,
      }),
    }));

    return successResponse(data, 'Attendance records retrieved successfully.');
  }
  async findAll(input: AttendanceQueryInput) {
    const workDate = input.date
      ? new Date(`${input.date}T00:00:00.000Z`)
      : getWorkDate();

    const attendances =
      await this.attendanceRepository.findAllByWorkDate(workDate);

    const data = attendances.map((attendance) => ({
      ...attendance,
      status: getAttendanceStatus({
        checkOutAt: attendance.checkOutAt,
        lateMinutes: attendance.lateMinutes,
        undertimeMinutes: attendance.undertimeMinutes,
      }),
    }));

    return successResponse(data, 'Attendance records retrieved successfully.');
  }
  async getDailyStatus(userId: string, workDate: Date) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const holiday = await this.holidayRepository.findByDate(workDate);

    if (holiday?.isActive) {
      return successResponse(
        {
          workDate,
          status: 'holiday',
          name: holiday.name,
        },
        'Daily attendance status retrieved successfully.',
      );
    }

    const assignment = await this.employeeShiftRepository.findActiveAssignment(
      employee.id,
      workDate,
    );

    if (!assignment) {
      return successResponse(
        {
          workDate,
          status: 'rest_day',
        },
        'Daily attendance status retrieved successfully.',
      );
    }

    const weekday = getWeekday(workDate);

    if (!assignment.workDays.includes(weekday)) {
      return successResponse(
        {
          workDate,
          status: 'rest_day',
        },
        'Daily attendance status retrieved successfully.',
      );
    }

    const approvedLeave = await this.leaveRepository.findApprovedForDate(
      employee.id,
      workDate,
    );

    if (approvedLeave) {
      return successResponse(
        {
          workDate,
          status: 'on_leave',
          leave: approvedLeave,
        },
        'Daily attendance status retrieved successfully.',
      );
    }

    const attendance =
      await this.attendanceRepository.findByEmployeeAndWorkDate(
        employee.id,
        workDate,
      );

    if (attendance) {
      return successResponse(
        {
          ...attendance,
          status: getAttendanceStatus({
            checkOutAt: attendance.checkOutAt,
            lateMinutes: attendance.lateMinutes,
            undertimeMinutes: attendance.undertimeMinutes,
          }),
        },
        'Daily attendance status retrieved successfully.',
      );
    }

    const expectedEnd = getShiftEndDateTime(
      workDate,
      assignment.shift.startTime,
      assignment.shift.endTime,
    );

    const status = new Date() > expectedEnd ? 'absent' : 'scheduled';

    return successResponse(
      {
        workDate,
        status,
      },
      'Daily attendance status retrieved successfully.',
    );
  }
  async getMySummary(userId: string, from: string, to: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const { fromDate, toDate } = this.parseDateRange(from, to);

    const summary = await this.buildSummary(employee.id, fromDate, toDate);

    return successResponse(
      summary,
      'Attendance summary retrieved successfully.',
    );
  }
  async getEmployeeSummary(employeeId: string, from: string, to: string) {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const { fromDate, toDate } = this.parseDateRange(from, to);

    const summary = await this.buildSummary(employee.id, fromDate, toDate);

    return successResponse(
      summary,
      'Employee attendance summary retrieved successfully.',
    );
  }
  async buildCompanyDailyAttendance(date: string) {
    const workDate = new Date(`${date}T00:00:00.000Z`);

    const [holiday, employees, assignments, approvedLeaves, attendances] =
      await Promise.all([
        this.holidayRepository.findByDate(workDate),

        this.employeeRepository.findAllForAttendance(),

        this.employeeShiftRepository.findActiveAssignmentsForDate(workDate),

        this.leaveRepository.findApprovedForDateAll(workDate),

        this.attendanceRepository.findAllByWorkDate(workDate),
      ]);

    const summary = {
      totalEmployees: employees.length,
      present: 0,
      onTime: 0,
      late: 0,
      undertime: 0,
      absent: 0,
      onLeave: 0,
      restDays: 0,
      scheduled: 0,
    };

    if (holiday?.isActive) {
      return successResponse(
        {
          ...summary,
          holiday: {
            id: holiday.id,
            name: holiday.name,
          },
        },
        'Company attendance summary retrieved successfully.',
      );
    }

    const weekday = getWeekday(workDate);
    const now = new Date();

    for (const employee of employees) {
      const assignment = assignments.find(
        (assignment) => assignment.employeeId === employee.id,
      );

      if (!assignment || !assignment.workDays.includes(weekday)) {
        summary.restDays++;
        continue;
      }

      const approvedLeave = approvedLeaves.find(
        (leave) => leave.employeeId === employee.id,
      );

      if (approvedLeave) {
        summary.onLeave++;
        continue;
      }

      const attendance = attendances.find(
        (attendance) => attendance.employeeId === employee.id,
      );

      if (attendance) {
        summary.present++;

        if (attendance.lateMinutes > 0) {
          summary.late++;
        }

        if (attendance.undertimeMinutes > 0) {
          summary.undertime++;
        }

        if (
          attendance.lateMinutes === 0 &&
          attendance.undertimeMinutes === 0 &&
          attendance.checkOutAt
        ) {
          summary.onTime++;
        }

        continue;
      }

      const expectedEnd = getShiftEndDateTime(
        workDate,
        assignment.shift.startTime,
        assignment.shift.endTime,
      );

      if (now > expectedEnd) {
        summary.absent++;
      } else {
        summary.scheduled++;
      }
    }

    return summary;
  }
  async getCompanyDailySummary(date: string) {
    const summary = await this.buildCompanyDailyAttendance(date);

    return successResponse(
      summary,
      'Company attendance summary retrieved successfully.',
    );
  }
  async getCompanyDailyAttendance(date: string) {
    const workDate = new Date(`${date}T00:00:00.000Z`);

    const holiday = await this.holidayRepository.findByDate(workDate);
    const [employees, assignments, approvedLeaves, attendances] =
      await Promise.all([
        this.employeeRepository.findAllForAttendance(),

        this.employeeShiftRepository.findActiveAssignmentsForDate(workDate),

        this.leaveRepository.findApprovedForDateAll(workDate),

        this.attendanceRepository.findAllByWorkDate(workDate),
      ]);

    const weekday = getWeekday(workDate);
    const now = new Date();

    const data = employees.map((employee) => {
      const assignment = assignments.find(
        (assignment) => assignment.employeeId === employee.id,
      );

      const employeeData = mapAttendanceEmployee(employee);

      if (holiday?.isActive) {
        return {
          employee: employeeData,
          workDate,
          status: 'holiday',
          holiday: {
            id: holiday.id,
            name: holiday.name,
          },
        };
      }

      if (!assignment || !assignment.workDays.includes(weekday)) {
        return {
          employee: employeeData,
          workDate,
          status: 'rest_day',
        };
      }

      const approvedLeave = approvedLeaves.find(
        (leave) => leave.employeeId === employee.id,
      );

      if (approvedLeave) {
        return {
          employee: employeeData,
          workDate,
          status: 'on_leave',
          leave: approvedLeave,
        };
      }

      const attendance = attendances.find(
        (attendance) => attendance.employeeId === employee.id,
      );

      if (attendance) {
        return {
          employee: employeeData,
          ...attendance,
          status: getAttendanceStatus({
            checkOutAt: attendance.checkOutAt,
            lateMinutes: attendance.lateMinutes,
            undertimeMinutes: attendance.undertimeMinutes,
          }),
        };
      }

      const expectedEnd = getShiftEndDateTime(
        workDate,
        assignment.shift.startTime,
        assignment.shift.endTime,
      );

      return {
        employee: employeeData,
        workDate,
        status: now > expectedEnd ? 'absent' : 'scheduled',
      };
    });

    return successResponse(data, 'Daily attendance retrieved successfully.');
  }
  async getMyTeamDailyAttendance(userId: string, date: string) {
    const manager = await this.employeeRepository.findByUserId(userId);

    if (!manager) {
      throw new NotFoundException('Employee profile not found.');
    }

    const workDate = new Date(`${date}T00:00:00.000Z`);

    const holiday = await this.holidayRepository.findByDate(workDate);

    const [employees, assignments, approvedLeaves, attendances] =
      await Promise.all([
        this.employeeRepository.findByManagerId(manager.id),

        this.employeeShiftRepository.findActiveAssignmentsForDate(workDate),

        this.leaveRepository.findApprovedForDateAll(workDate),

        this.attendanceRepository.findAllByWorkDate(workDate),
      ]);

    const weekday = getWeekday(workDate);
    const now = new Date();

    const data = employees.map((employee) => {
      const employeeData = mapAttendanceEmployee(employee);

      if (holiday?.isActive) {
        return {
          employee: employeeData,
          workDate,
          status: 'holiday',
          holiday: {
            id: holiday.id,
            name: holiday.name,
          },
        };
      }

      const assignment = assignments.find(
        (assignment) => assignment.employeeId === employee.id,
      );

      if (!assignment || !assignment.workDays.includes(weekday)) {
        return {
          employee: employeeData,
          workDate,
          status: 'rest_day',
        };
      }

      const approvedLeave = approvedLeaves.find(
        (leave) => leave.employeeId === employee.id,
      );

      if (approvedLeave) {
        return {
          employee: employeeData,
          workDate,
          status: 'on_leave',
        };
      }

      const attendance = attendances.find(
        (attendance) => attendance.employeeId === employee.id,
      );

      if (attendance) {
        return {
          employee: employeeData,
          ...attendance,

          status: getAttendanceStatus({
            checkOutAt: attendance.checkOutAt,
            lateMinutes: attendance.lateMinutes,
            undertimeMinutes: attendance.undertimeMinutes,
          }),
        };
      }

      const expectedEnd = getShiftEndDateTime(
        workDate,
        assignment.shift.startTime,
        assignment.shift.endTime,
      );

      return {
        employee: employeeData,
        workDate,
        status: now > expectedEnd ? 'absent' : 'scheduled',
      };
    });

    return successResponse(data, 'Team attendance retrieved successfully.');
  }
  private async buildSummary(employeeId: string, fromDate: Date, toDate: Date) {
    const [assignments, attendances, approvedLeaves, holidays] =
      await Promise.all([
        this.employeeShiftRepository.findForDateRange(
          employeeId,
          fromDate,
          toDate,
        ),

        this.attendanceRepository.findByEmployeeAndDateRange(
          employeeId,
          fromDate,
          toDate,
        ),

        this.leaveRepository.findApprovedForDateRange(
          employeeId,
          fromDate,
          toDate,
        ),
        this.holidayRepository.findForDateRange(fromDate, toDate),
      ]);

    const dates = getDatesInRange(fromDate, toDate);

    const summary = {
      totalWorkDays: 0,
      present: 0,
      onTime: 0,
      late: 0,
      undertime: 0,
      absent: 0,
      onLeave: 0,
      holidays: 0,
      restDays: 0,
      totalLateMinutes: 0,
      totalUndertimeMinutes: 0,
    };

    const now = new Date();

    for (const workDate of dates) {
      const holiday = holidays.find(
        (holiday) => holiday.date.getTime() === workDate.getTime(),
      );

      if (holiday) {
        summary.holidays++;
        continue;
      }

      const assignment = assignments.find(
        (assignment) =>
          assignment.effectiveFrom <= workDate &&
          (assignment.effectiveTo === null ||
            assignment.effectiveTo >= workDate),
      );

      if (!assignment) {
        summary.restDays++;
        continue;
      }

      const weekday = getWeekday(workDate);

      if (!assignment.workDays.includes(weekday)) {
        summary.restDays++;
        continue;
      }

      summary.totalWorkDays++;

      const approvedLeave = approvedLeaves.find(
        (leave) => leave.startDate <= workDate && leave.endDate >= workDate,
      );

      if (approvedLeave) {
        summary.onLeave++;
        continue;
      }

      const attendance = attendances.find(
        (attendance) => attendance.workDate.getTime() === workDate.getTime(),
      );

      if (!attendance) {
        const expectedEnd = getShiftEndDateTime(
          workDate,
          assignment.shift.startTime,
          assignment.shift.endTime,
        );

        if (now > expectedEnd) {
          summary.absent++;
        }

        continue;
      }

      summary.present++;

      summary.totalLateMinutes += attendance.lateMinutes;

      summary.totalUndertimeMinutes += attendance.undertimeMinutes;

      if (attendance.lateMinutes > 0) {
        summary.late++;
      }

      if (attendance.undertimeMinutes > 0) {
        summary.undertime++;
      }

      if (
        attendance.lateMinutes === 0 &&
        attendance.undertimeMinutes === 0 &&
        attendance.checkOutAt
      ) {
        summary.onTime++;
      }
    }

    return summary;
  }
  private parseDateRange(from: string, to: string) {
    if (!from || !to) {
      throw new BadRequestException('Both from and to dates are required.');
    }

    const fromDate = new Date(`${from}T00:00:00.000Z`);

    const toDate = new Date(`${to}T00:00:00.000Z`);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }

    if (fromDate > toDate) {
      throw new BadRequestException('From date cannot be after to date.');
    }

    return {
      fromDate,
      toDate,
    };
  }
}
