import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { successResponse } from '../common/responses/success-response';
import { EmployeeRepository } from '../employee/employee.repository';
import { AttendanceService } from '../attendance/attendance.service';
import { getWorkDate } from '../attendance/attendance-date';
import { AnnouncementsRepository } from '../announcements/announcements.repository';
import { mapActiveAnnouncement } from '../announcements/announcement.mapper';
import { LeaveRepository } from '../leave/leave.repository';
import type { AuthenticatedUser } from '../auth/types/user.type';
import { DashboardRepository } from './dashboard.repository';
import type { HrDashboardData } from './dashboard.types';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceService: AttendanceService,
    private readonly leaveRepository: LeaveRepository,
    private readonly announcementsRepository: AnnouncementsRepository,
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async getHrDashboard(user: AuthenticatedUser) {
    const workDate = getWorkDate();
    const date = workDate.toISOString().slice(0, 10);
    // Date-only values: today plus the next 29 days, inclusive.
    const through = new Date(workDate);
    through.setUTCDate(through.getUTCDate() + 29);
    const canManageAccounts = user.role === 'admin';
    const [
      employees,
      attendanceToday,
      pending,
      documents,
      activations,
      announcements,
    ] = await Promise.all([
      this.section('employees', () =>
        this.dashboardRepository.employeeCounts(),
      ),
      this.section('attendance', () =>
        this.attendanceService.buildCompanyDailyAttendance(date),
      ),
      this.section('leave', () => this.leaveRepository.countPending()),
      this.section('documents', () =>
        this.dashboardRepository.countExpiringDocuments(workDate, through),
      ),
      canManageAccounts
        ? this.section('activations', () =>
            this.dashboardRepository.countPendingEmployeeAccounts(),
          )
        : Promise.resolve(null),
      this.section('announcements', async () => {
        const employee = await this.employeeRepository.findByUserId(user.id);
        if (!employee)
          throw new NotFoundException('Employee profile not found.');
        const records =
          await this.announcementsRepository.findVisibleForEmployee(
            new Date(),
            employee.departmentId,
            employee.branchId,
            3,
          );
        return records.map(mapActiveAnnouncement);
      }),
    ]);

    const data: HrDashboardData = {
      date,
      employees,
      attendanceToday,
      leaveRequests: { pending },
      documents: {
        expiring: documents,
        from: date,
        through: through.toISOString().slice(0, 10),
        days: 30,
      },
      activations: { authorized: canManageAccounts, pending: activations },
      announcements,
    };
    return successResponse(data, 'HR dashboard retrieved successfully.');
  }

  private async section<T>(
    name: string,
    read: () => Promise<T>,
  ): Promise<T | null> {
    try {
      return await read();
    } catch {
      this.logger.warn(`Dashboard section unavailable: ${name}`);
      return null;
    }
  }
}
