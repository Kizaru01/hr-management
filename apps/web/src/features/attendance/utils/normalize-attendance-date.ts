const datePattern = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function normalizeAttendanceDate(
  value: string | string[] | undefined,
) {
  if (typeof value !== "string") {
    return undefined;
  }

  const match = datePattern.exec(value);

  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const maximumDay = month === 2 && isLeapYear ? 29 : daysInMonth[month];

  return year > 0 && maximumDay !== undefined && day <= maximumDay
    ? value
    : undefined;
}
