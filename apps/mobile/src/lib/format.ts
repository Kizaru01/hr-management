const businessZone = "Asia/Manila";
export function businessDate(value = new Date().toISOString()) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-PH", {
        timeZone: businessZone,
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}
export function businessTime(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : new Intl.DateTimeFormat("en-PH", {
        timeZone: businessZone,
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}
export function dateOnly(value: string) {
  return businessDate(`${value.slice(0, 10)}T00:00:00+08:00`);
}
export function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
