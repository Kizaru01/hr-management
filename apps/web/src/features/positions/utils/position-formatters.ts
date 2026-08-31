const positionDateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

export function formatPositionDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : positionDateFormatter.format(date);
}
