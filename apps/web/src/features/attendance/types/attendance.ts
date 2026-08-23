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
        leaveType:
          | "vacation"
          | "sick"
          | "emergency"
          | "maternity"
          | "paternity"
          | "unpaid";
      };
    })
  | (BaseDailyAttendance & {
      status: "absent" | "scheduled";
    })
  | (BaseDailyAttendance & {
      status:
        | "in_progress"
        | "late"
        | "late_and_undertime"
        | "undertime"
        | "on_time";
      checkInAt: string;
      checkOutAt: string | null;
      lateMinutes: number;
      undertimeMinutes: number;
    });
