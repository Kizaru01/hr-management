import type { AuditLogActorRole, AuditLogJsonValue } from "../types/audit-log";

export interface AuditLogMetadataDetail {
  label: string;
  value: string;
}

export interface AuditLogTarget {
  label: string;
  context: string | null;
}

interface AuditLogMetadataOptions {
  includeIdentifiers?: boolean;
}

const timestampFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

const actionLabels: Record<string, string> = {
  "announcement.create": "Announcement created",
  "department.create": "Department created",
  "department.update": "Department updated",
  "department.head.assign": "Department head assigned",
  "department.head.replace": "Department head replaced",
  "department.head.remove": "Department head removed",
  "department.deactivate": "Department deactivated",
  "department.reactivate": "Department reactivated",
  "position.create": "Position created",
  "position.update": "Position updated",
  "position.deactivate": "Position deactivated",
  "position.reactivate": "Position reactivated",
  "employee.update": "Employee updated",
  "employee.terminate": "Employee terminated",
  "employee_document.create": "Employee document created",
  "employee_document.deactivate": "Employee document deactivated",
  "leave.approve": "Leave approved",
  "leave.reject": "Leave rejected",
  "manager.assign": "Manager assigned",
};

const actionStatusLabels: Record<string, string> = {
  "announcement.create": "Created",
  "department.create": "Created",
  "department.update": "Updated",
  "department.head.assign": "Assigned",
  "department.head.replace": "Reassigned",
  "department.head.remove": "Removed",
  "department.deactivate": "Deactivated",
  "department.reactivate": "Reactivated",
  "position.create": "Created",
  "position.update": "Updated",
  "position.deactivate": "Deactivated",
  "position.reactivate": "Reactivated",
  "employee.update": "Updated",
  "employee.terminate": "Terminated",
  "employee_document.create": "Uploaded",
  "employee_document.deactivate": "Deactivated",
  "leave.approve": "Approved",
  "leave.reject": "Rejected",
  "manager.assign": "Assigned",
};

const entityTypeLabels: Record<string, string> = {
  Announcement: "Announcement",
  Department: "Department",
  Employee: "Employee",
  EmployeeDocument: "Employee document",
  LeaveRequest: "Leave request",
  Position: "Position",
};

const roleLabels: Record<AuditLogActorRole, string> = {
  admin: "Admin",
  hr: "HR",
  employee: "Employee",
  manager: "Manager",
};

const metadataLabels: Record<string, string> = {
  audience: "Audience",
  branchId: "Branch ID",
  code: "Code",
  departmentHeadEmployeeId: "Department head employee ID",
  departmentId: "Department ID",
  departmentName: "Department",
  employeeId: "Employee ID",
  newStatus: "New status",
  previousStatus: "Previous status",
  previousHeadEmployeeId: "Previous head employee ID",
  reason: "Reason",
  terminationDate: "Termination date",
  title: "Title",
  type: "Document type",
  userDeactivated: "User deactivated",
};

const identifierMetadataKeys = new Set([
  "branchId",
  "departmentHeadEmployeeId",
  "departmentId",
  "employeeId",
  "previousHeadEmployeeId",
]);

const humanizedMetadataKeys = new Set([
  "audience",
  "newStatus",
  "previousStatus",
  "type",
]);

const sensitiveKeyFragments = [
  "apikey",
  "authorization",
  "cookie",
  "credential",
  "jwt",
  "password",
  "privatekey",
  "secret",
  "session",
  "token",
];

const sensitiveValuePatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /\b(?:bearer|basic)\s+[a-z0-9._~+/=-]+/i,
  /\b(?:api[-_ ]?key|authorization|cookie|credential|password|secret|session|token)\b\s*[:=]\s*\S+/i,
  /\beyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+\b/i,
];

const maximumMetadataValueLength = 160;

export const formatAuditLogTimestamp = (value: string) =>
  formatDate(value, timestampFormatter);

export const formatAuditLogAction = (action: string) =>
  actionLabels[action] ?? humanizeIdentifier(action);

export const formatAuditLogStatus = (action: string) =>
  actionStatusLabels[action] ?? null;

export const formatAuditLogEntityType = (entityType: string) =>
  entityTypeLabels[entityType] ?? humanizeIdentifier(entityType);

export const formatAuditLogRole = (role: AuditLogActorRole) => roleLabels[role];

export function formatAuditLogTarget(
  entityType: string,
  metadata: AuditLogJsonValue,
): AuditLogTarget {
  const entityLabel = formatAuditLogEntityType(entityType);

  if (
    (entityType === "Announcement" ||
      entityType === "Department" ||
      entityType === "EmployeeDocument" ||
      entityType === "Position") &&
    isJsonObject(metadata)
  ) {
    const titleValue =
      entityType === "Department" || entityType === "Position"
        ? metadata.name
        : metadata.title;
    const title = titleValue === undefined ? null : formatScalar(titleValue);

    if (title && title !== "Redacted") {
      return {
        label: title,
        context: entityLabel,
      };
    }
  }

  return {
    label: entityLabel,
    context: null,
  };
}

export function formatAuditLogMetadata(
  metadata: AuditLogJsonValue,
  options: AuditLogMetadataOptions = {},
): AuditLogMetadataDetail[] {
  if (!isJsonObject(metadata)) {
    return [];
  }

  return Object.entries(metadata).flatMap(([key, value]) => {
    if (isSensitiveKey(key)) {
      return [];
    }

    if (key === "changedFields") {
      const changedFields = formatChangedFields(value);

      return changedFields
        ? [{ label: "Changed fields", value: changedFields }]
        : [];
    }

    if (key === "changes") {
      return formatChanges(value);
    }

    if (identifierMetadataKeys.has(key) && !options.includeIdentifiers) {
      return [];
    }

    const label = metadataLabels[key];

    if (!label) {
      return [];
    }

    const formattedValue = formatKnownMetadataValue(key, value);

    return formattedValue ? [{ label, value: formattedValue }] : [];
  });
}

function formatKnownMetadataValue(
  key: string,
  value: AuditLogJsonValue,
): string | null {
  if (key === "terminationDate" && typeof value === "string") {
    return formatDate(value, dateFormatter);
  }

  if (humanizedMetadataKeys.has(key) && typeof value === "string") {
    return humanizeIdentifier(value);
  }

  return formatScalar(value);
}

function formatChangedFields(value: AuditLogJsonValue): string | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const fields = value
    .filter((field): field is string => typeof field === "string")
    .filter((field) => !isSensitiveKey(field))
    .map((field) => humanizeIdentifier(field.replace(/Id$/, "")));

  return fields.length > 0 ? truncate([...new Set(fields)].join(", ")) : null;
}

function formatChanges(value: AuditLogJsonValue): AuditLogMetadataDetail[] {
  if (!isJsonObject(value)) {
    return [];
  }

  const managerChange = value.managerId;

  if (!isJsonObject(managerChange)) {
    return [];
  }

  const from = formatAssignmentState(managerChange.from);
  const to = formatAssignmentState(managerChange.to);

  if (!from && !to) {
    return [];
  }

  return [
    {
      label: "Manager change",
      value: `${from ?? "Not assigned"} → ${to ?? "Not assigned"}`,
    },
  ];
}

function formatAssignmentState(value: AuditLogJsonValue | undefined) {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return "Not assigned";
  }

  return typeof value === "string" && value.trim() ? "Assigned" : null;
}

function formatScalar(value: AuditLogJsonValue): string | null {
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    return isSensitiveValue(trimmedValue) ? "Redacted" : truncate(trimmedValue);
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-PH");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return null;
}

function humanizeIdentifier(value: string) {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim()
    .toLowerCase();

  if (!words) {
    return "Unknown";
  }

  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`.replace(
    /\bid\b/gi,
    "ID",
  );
}

function isSensitiveKey(key: string) {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

  return sensitiveKeyFragments.some((fragment) =>
    normalizedKey.includes(fragment),
  );
}

function isSensitiveValue(value: string) {
  return sensitiveValuePatterns.some((pattern) => pattern.test(value));
}

function isJsonObject(
  value: unknown,
): value is { [key: string]: AuditLogJsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatDate(value: string, formatter: Intl.DateTimeFormat) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

function truncate(value: string) {
  return value.length > maximumMetadataValueLength
    ? `${value.slice(0, maximumMetadataValueLength - 1)}…`
    : value;
}
