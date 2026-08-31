import type { ShiftWeekday } from "../types/shift";

export const shiftWeekdays: ShiftWeekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const shiftWeekdayLabels: Record<ShiftWeekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

export const formatShiftTime = (value: string) => {
  const [hourValue, minuteValue] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return value;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
};

export const formatShiftSchedule = (startTime: string, endTime: string) => {
  const crossesMidnight = endTime <= startTime;

  return `${formatShiftTime(startTime)} – ${formatShiftTime(endTime)}${
    crossesMidnight ? " next day" : ""
  }`;
};

export const formatShiftDate = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
};

export const formatShiftDateRange = (
  effectiveFrom: string,
  effectiveTo: string | null,
) =>
  effectiveTo
    ? `${formatShiftDate(effectiveFrom)} – ${formatShiftDate(effectiveTo)}`
    : `${formatShiftDate(effectiveFrom)} – No end date`;

export const formatShiftWorkDays = (workDays: ShiftWeekday[]) =>
  workDays.map((day) => shiftWeekdayLabels[day].slice(0, 3)).join(", ");
