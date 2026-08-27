const documentDateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

const manilaDatePartsFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Manila",
});

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type EmployeeDocumentExpirationTone =
  | "current"
  | "warning"
  | "expired"
  | "none";

export const formatEmployeeDocumentDate = (value: string | null) =>
  value ? documentDateFormatter.format(new Date(value)) : "—";

export const formatEmployeeDocumentEmployeeName = (employee: {
  firstName: string;
  middleName: string | null;
  lastName: string;
}) =>
  [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");

export const getEmployeeDocumentReferenceDate = (date = new Date()) => {
  const parts = Object.fromEntries(
    manilaDatePartsFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const getEmployeeDocumentExpiration = (
  expiresAt: string | null,
  referenceDate: string,
): { label: string; tone: EmployeeDocumentExpirationTone } => {
  if (!expiresAt) {
    return { label: "No expiration", tone: "none" };
  }

  const expirationDate = expiresAt.slice(0, 10);
  const daysRemaining = Math.round(
    (Date.parse(`${expirationDate}T00:00:00.000Z`) -
      Date.parse(`${referenceDate}T00:00:00.000Z`)) /
      MILLISECONDS_PER_DAY,
  );

  if (daysRemaining < 0) {
    return { label: "Expired", tone: "expired" };
  }

  if (daysRemaining === 0) {
    return { label: "Expires today", tone: "warning" };
  }

  if (daysRemaining === 1) {
    return { label: "1 day left", tone: "warning" };
  }

  if (daysRemaining <= 30) {
    return { label: `${daysRemaining} days left`, tone: "warning" };
  }

  return { label: "Current", tone: "current" };
};
