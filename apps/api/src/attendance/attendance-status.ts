export type AttendanceStatus =
  'on_time' | 'late' | 'undertime' | 'late_and_undertime' | 'in_progress';
export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

const WEEKDAYS: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function getWeekday(workDate: Date): Weekday {
  return WEEKDAYS[workDate.getUTCDay()] ?? 'monday';
}

interface AttendanceStatusInput {
  checkOutAt: Date | null;
  lateMinutes: number;
  undertimeMinutes: number;
}

export function getAttendanceStatus({
  checkOutAt,
  lateMinutes,
  undertimeMinutes,
}: AttendanceStatusInput): AttendanceStatus {
  if (!checkOutAt) {
    return lateMinutes > 0 ? 'late' : 'in_progress';
  }

  const isLate = lateMinutes > 0;
  const hasUndertime = undertimeMinutes > 0;

  if (isLate && hasUndertime) {
    return 'late_and_undertime';
  }

  if (isLate) {
    return 'late';
  }

  if (hasUndertime) {
    return 'undertime';
  }

  return 'on_time';
}
