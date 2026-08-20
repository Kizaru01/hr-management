import { Injectable } from '@nestjs/common';
import { successResponse } from '../common/responses/success-response';
import { EmployeeRepository } from '../employee/employee.repository';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { LeaveRepository } from '../leave/leave.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly leaveRepository: LeaveRepository,
  ) {}

  async getHrDashboard() {
    const now = new Date();

    const workDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      attendanceStats,
      lateEmployees,
      undertimeEmployees,
      employeesOnLeave,
    ] = await Promise.all([
      this.employeeRepository.countAll(),
      this.employeeRepository.countByEmploymentStatus('active'),
      this.employeeRepository.countByEmploymentStatus('inactive'),
      this.attendanceRepository.getDailyStats(workDate),
      this.attendanceRepository.countLateByDate(workDate),
      this.attendanceRepository.countUndertimeByDate(workDate),
      this.leaveRepository.countApprovedForDate(workDate),
    ]);

    const present = attendanceStats._count.id;

    return successResponse(
      {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
        },

        attendanceToday: {
          present,
          late: lateEmployees,
          undertime: undertimeEmployees,
          onLeave: employeesOnLeave,
          totalLateMinutes: attendanceStats._sum.lateMinutes ?? 0,
          totalUndertimeMinutes: attendanceStats._sum.undertimeMinutes ?? 0,
        },
      },
      'HR dashboard retrieved successfully.',
    );
  }
}
