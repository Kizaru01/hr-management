import Link from "next/link";
import type { EmployeeListItem } from "../types/employee";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";

interface EmployeeRowProps {
  employee: EmployeeListItem;
}

export const EmployeeRow = ({ employee }: EmployeeRowProps) => {
  const name = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");
  const statusVariant: BadgeVariant =
    employee.employmentStatus === "active"
      ? "success"
      : employee.employmentStatus === "terminated"
        ? "destructive"
        : "neutral";

  return (
    <tr>
      <td>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {employee.employeeNumber}
        </p>
      </td>

      <td>{employee.department.name}</td>
      <td>{employee.position.name}</td>
      <td>{employee.branch?.name ?? "—"}</td>
      <td>
        <Badge variant={statusVariant} className="capitalize">
          {employee.employmentStatus}
        </Badge>
      </td>

      <td>
        <Link
          href={`/employees/${employee.id}`}
          className={buttonStyles({ variant: "ghost", size: "small" })}
        >
          View
        </Link>
      </td>
    </tr>
  );
};
