import type { Announcement } from "@/features/announcement/types/announcement";

export interface HrDashboardData {
  date: string;
  employees: {
    total: number;
    active: number;
    inactive: number;
    other: number;
  } | null;
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
    holiday?: { id: string; name: string };
  } | null;
  leaveRequests: { pending: number | null };
  documents: {
    expiring: number | null;
    from: string;
    through: string;
    days: number;
  };
  activations: { authorized: boolean; pending: number | null };
  announcements: Announcement[] | null;
}
