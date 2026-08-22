import { Injectable } from '@nestjs/common';
import { successResponse } from '../common/responses/success-response';
import { EmployeeRepository } from '../employee/employee.repository';
import { AttendanceService } from '../attendance/attendance.service';
import { getWorkDate } from '../attendance/attendance-date';
import { AnnouncementsRepository } from '../announcements/announcements.repository';
import { LeaveRepository } from '../leave/leave.repository';
import { NotificationRepository } from '../notification/notification.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceService: AttendanceService,
    private readonly leaveRepository: LeaveRepository,
    private readonly announcementsRepository: AnnouncementsRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getHrDashboard(currentUserId: string) {
    const workDate = getWorkDate();
    const date = workDate.toISOString().slice(0, 10);
    const now = new Date();

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      attendanceToday,
      unreadNotifications,
      recentLeaveRequests,
      pendingLeaveRequests,
      recentAnnouncements,
      activeAnnouncements,
    ] = await Promise.all([
      this.employeeRepository.countAll(),
      this.employeeRepository.countByEmploymentStatus('active'),
      this.employeeRepository.countByEmploymentStatus('inactive'),

      this.attendanceService.buildCompanyDailyAttendance(date),
      this.notificationRepository.countUnreadByUserId(currentUserId),

      this.leaveRepository.findRecent(5),
      this.leaveRepository.countPending(),

      this.announcementsRepository.findRecent(5),
      this.announcementsRepository.countActive(now),
    ]);
    const recentLeaves = recentLeaveRequests.map((leave) => ({
      id: leave.id,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status,
      createdAt: leave.createdAt,

      employee: {
        id: leave.employee.id,
        employeeNumber: leave.employee.employeeNumber,
        name: [
          leave.employee.firstName,
          leave.employee.middleName,
          leave.employee.lastName,
        ]
          .filter(Boolean)
          .join(' '),
      },
    }));

    return successResponse(
      {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
        },
        attendanceToday,
        leaveRequests: {
          pending: pendingLeaveRequests,
          recent: recentLeaves,
        },
        announcements: {
          active: activeAnnouncements,
          recent: recentAnnouncements,
        },
        notifications: {
          unread: unreadNotifications,
        },
      },
      'HR dashboard retrieved successfully.',
    );
  }
}
