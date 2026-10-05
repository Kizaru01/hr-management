import type { AttendanceService } from '../attendance/attendance.service';
import type { mapActiveAnnouncement } from '../announcements/announcement.mapper';

export interface HrDashboardData {
  date: string;
  employees: {
    total: number;
    active: number;
    inactive: number;
    other: number;
  } | null;
  attendanceToday: Awaited<
    ReturnType<AttendanceService['buildCompanyDailyAttendance']>
  > | null;
  leaveRequests: { pending: number | null };
  documents: {
    expiring: number | null;
    from: string;
    through: string;
    days: number;
  };
  activations: { authorized: boolean; pending: number | null };
  announcements: ReturnType<typeof mapActiveAnnouncement>[] | null;
}
