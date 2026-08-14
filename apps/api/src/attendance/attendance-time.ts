export function getShiftDateTime(workDate: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);

  if (hours === undefined || minutes === undefined) {
    throw new Error('Invalid shift time');
  }

  return new Date(
    Date.UTC(
      workDate.getUTCFullYear(),
      workDate.getUTCMonth(),
      workDate.getUTCDate(),
      hours - 8,
      minutes,
    ),
  );
}

export function getShiftEndDateTime(
  workDate: Date,
  startTime: string,
  endTime: string,
): Date {
  const start = getShiftDateTime(workDate, startTime);

  const end = getShiftDateTime(workDate, endTime);

  if (end <= start) {
    end.setUTCDate(end.getUTCDate() + 1);
  }

  return end;
}
export function getDatesInRange(from: Date, to: Date): Date[] {
  const dates: Date[] = [];

  const current = new Date(from);

  while (current <= to) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}
