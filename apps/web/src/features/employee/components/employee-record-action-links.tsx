import Link from "next/link";

export const employeeRecordActions = [
  {
    action: "upload-document",
    label: "Upload document",
  },
  {
    action: "assign-shift",
    label: "Assign shift",
  },
  {
    action: "create-review",
    label: "Create performance review",
  },
] as const;

export type EmployeeRecordAction =
  (typeof employeeRecordActions)[number]["action"];

export const isEmployeeRecordAction = (
  value: string,
): value is EmployeeRecordAction =>
  employeeRecordActions.some(({ action }) => action === value);

interface EmployeeRecordActionLinksProps {
  employeeId: string;
  currentAction?: EmployeeRecordAction;
}

export const EmployeeRecordActionLinks = ({
  employeeId,
  currentAction,
}: EmployeeRecordActionLinksProps) => (
  <nav aria-label="Employee record actions" className="flex flex-wrap gap-2">
    {employeeRecordActions
      .filter(({ action }) => action !== currentAction)
      .map(({ action, label }) => (
        <Link
          key={action}
          href={`/employees/${encodeURIComponent(employeeId)}/actions/${action}`}
          className="rounded-md border border-border-strong px-3 py-2 text-sm font-medium transition-colors hover:bg-hover"
        >
          {label}
        </Link>
      ))}
  </nav>
);
