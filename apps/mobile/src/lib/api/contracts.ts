import { USER_ROLES } from "@hr-management/constants";
import { ApiError } from "./client";

export interface CurrentUser {
  id: string;
  email: string;
  role: (typeof USER_ROLES)[number];
}
export interface LoginResponse extends CurrentUser {
  accessToken: string;
  lastLoginAt: string | null;
}
// Wire dates are strings. Shared domain Employee/User types are not wire contracts.
export interface WorkProfile {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  hireDate: string;
  employmentType: string;
  employmentStatus: string;
  department: { name: string };
  position: { name: string };
  branch: { name: string } | null;
}
export type AttendanceStatus =
  | { workDate: string; status: "holiday"; name: string }
  | { workDate: string; status: "rest_day" | "scheduled" | "absent" }
  | {
      workDate: string;
      status: "on_leave";
      leave: { id: string; leaveType: string };
    }
  | {
      workDate: string;
      status:
        "on_time" | "late" | "undertime" | "late_and_undertime" | "in_progress";
      checkInAt: string;
      checkOutAt: string | null;
      lateMinutes: number;
      undertimeMinutes: number;
    };
export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
}

export function parseCurrentUser(value: unknown): CurrentUser {
  const v = record(value);
  if (!USER_ROLES.some((role) => role === v.role)) throw invalidResponse();
  return {
    id: text(v.id),
    email: text(v.email),
    role: v.role as CurrentUser["role"],
  };
}
export function parseLogin(value: unknown): LoginResponse {
  const v = record(value);
  return {
    ...parseCurrentUser(value),
    accessToken: text(v.accessToken),
    lastLoginAt: v.lastLoginAt == null ? null : text(v.lastLoginAt),
  };
}
export function parseProfile(value: unknown): WorkProfile {
  const v = record(value);
  // Deliberately discard address, birthday, emergency contacts, subordinates and other private fields.
  return {
    id: text(v.id),
    employeeNumber: text(v.employeeNumber),
    firstName: text(v.firstName),
    middleName: v.middleName == null ? null : text(v.middleName),
    lastName: text(v.lastName),
    email: text(v.email),
    hireDate: text(v.hireDate),
    employmentType: text(v.employmentType),
    employmentStatus: text(v.employmentStatus),
    department: { name: text(record(v.department).name) },
    position: { name: text(record(v.position).name) },
    branch: v.branch == null ? null : { name: text(record(v.branch).name) },
  };
}
export function parseAttendance(value: unknown): AttendanceStatus {
  const v = record(value);
  const workDate = text(v.workDate);
  switch (v.status) {
    case "holiday":
      return { workDate, status: v.status, name: text(v.name) };
    case "rest_day":
    case "scheduled":
    case "absent":
      return { workDate, status: v.status };
    case "on_leave": {
      const leave = record(v.leave);
      return {
        workDate,
        status: v.status,
        leave: { id: text(leave.id), leaveType: text(leave.leaveType) },
      };
    }
    case "on_time":
    case "late":
    case "undertime":
    case "late_and_undertime":
    case "in_progress":
      return {
        workDate,
        status: v.status,
        checkInAt: text(v.checkInAt),
        checkOutAt: v.checkOutAt == null ? null : text(v.checkOutAt),
        lateMinutes: count(v.lateMinutes),
        undertimeMinutes: count(v.undertimeMinutes),
      };
    default:
      throw invalidResponse();
  }
}
export function parseAnnouncements(value: unknown): Announcement[] {
  if (!Array.isArray(value)) throw invalidResponse();
  return value.slice(0, 3).map((item) => {
    const v = record(item);
    return {
      id: text(v.id),
      title: text(v.title),
      content: text(v.content),
      publishedAt: text(v.publishedAt),
    };
  });
}
export function parseUnread(value: unknown) {
  return count(record(value).count);
}
function invalidResponse() {
  return new ApiError(
    "response",
    "The server returned unexpected information. Please try again.",
  );
}
function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw invalidResponse();
  return value as Record<string, unknown>;
}
function text(value: unknown) {
  if (typeof value !== "string") throw invalidResponse();
  return value;
}
function count(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0)
    throw invalidResponse();
  return value;
}
