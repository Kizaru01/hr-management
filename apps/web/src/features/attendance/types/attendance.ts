export interface AttendanceSummaryData {
  totalEmployees: number;
  present: number;
  onTime: number;
  late: number;
  undertime: number;
  absent: number;
  onLeave: number;
  restDays: number;
  scheduled: number;
}

export interface EmployeeAttendanceSummary {
  totalWorkDays: number;
  present: number;
  onTime: number;
  late: number;
  undertime: number;
  absent: number;
  onLeave: number;
  holidays: number;
  restDays: number;
  totalLateMinutes: number;
  totalUndertimeMinutes: number;
}

export type AttendanceRecordStatus =
  | "in_progress"
  | "late"
  | "late_and_undertime"
  | "undertime"
  | "on_time";

export type AttendanceLeaveType =
  | "vacation"
  | "sick"
  | "emergency"
  | "maternity"
  | "paternity"
  | "unpaid";

export interface EmployeeAttendanceHistoryRecord {
  workDate: string;
  checkInAt: string;
  checkOutAt: string | null;
  lateMinutes: number;
  undertimeMinutes: number;
  status: AttendanceRecordStatus;
}

export type AttendanceMutationData = EmployeeAttendanceHistoryRecord;

export type MyAttendanceStatus =
  | {
      workDate: string;
      status: "holiday";
      name: string;
    }
  | {
      workDate: string;
      status: "rest_day";
    }
  | {
      workDate: string;
      status: "on_leave";
      leave: {
        id: string;
        leaveType: AttendanceLeaveType;
      };
    }
  | {
      workDate: string;
      status: "scheduled" | "absent";
    }
  | EmployeeAttendanceHistoryRecord;

export interface AttendanceEmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
}

interface BaseDailyAttendance {
  employee: AttendanceEmployee;
  workDate: string;
}

export type DailyAttendanceRecord =
  | (BaseDailyAttendance & {
      status: "holiday";
      holiday: {
        id: string;
        name: string;
      };
    })
  | (BaseDailyAttendance & {
      status: "rest_day";
    })
  | (BaseDailyAttendance & {
      status: "on_leave";
      leave: {
        id: string;
        leaveType: AttendanceLeaveType;
      };
    })
  | (BaseDailyAttendance & {
      status: "absent" | "scheduled";
    })
  | (BaseDailyAttendance & {
      status: AttendanceRecordStatus;
      checkInAt: string;
      checkOutAt: string | null;
      lateMinutes: number;
      undertimeMinutes: number;
    });
