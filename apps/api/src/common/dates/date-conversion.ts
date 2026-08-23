export function dateOnlyToUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function isoDateTimeToDate(dateTime: string): Date {
  return new Date(dateTime);
}
