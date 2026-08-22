export interface HrDashboardData {
  employees: {
    total: number;
    active: number;
    inactive: number;
  };

  attendanceToday: {
    totalEmployees: number;
    present: number;
    onTime: number;
    late: number;
    undertime: number;
    absent: number;
    onLeave: number;
    restDays: number;
    scheduled: number;
  };

  leaveRequests: {
    pending: number;
  };

  announcements: {
    active: number;
  };

  notifications: {
    unread: number;
  };
}
