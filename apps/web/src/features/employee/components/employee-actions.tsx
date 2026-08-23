"use client";

import Link from "next/link";
import { AssignManagerDialog } from "./assign-manager-dialog";
import type { ManagerOption } from "../types/employee";
import { TerminateEmployeeDialog } from "./terminate-dialog";

interface Props {
  employeeId: string;
  managerOptions: ManagerOption[];
  employmentStatus: string;
}

export const EmployeeActions = ({
  employeeId,
  managerOptions,
  employmentStatus,
}: Props) => (
  <div className="flex gap-2">
    <Link
      href={`/employees/${employeeId}/edit`}
      className="rounded-md border px-3 py-2 text-sm"
    >
      Edit
    </Link>
    <AssignManagerDialog employeeId={employeeId} options={managerOptions} />{" "}
    {employmentStatus !== "terminated" && (
      <TerminateEmployeeDialog employeeId={employeeId} />
    )}
  </div>
);
