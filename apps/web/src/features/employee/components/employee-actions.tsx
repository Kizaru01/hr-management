"use client";

import Link from "next/link";
import { AssignManagerDialog } from "./assign-manager-dialog";
import type { ManagerOption } from "../types/employee";
import { TerminateEmployeeDialog } from "./terminate-dialog";
import { buttonStyles } from "@/components/ui/button";
import { ResendInvitationButton } from "@/features/user/components/resend-invitation-button";

interface Props {
  employeeId: string;
  managerOptions: ManagerOption[];
  employmentStatus: string;
  user: {
    id: string;
    status: "pending" | "active" | "suspended" | "disabled";
  } | null;
}

export const EmployeeActions = ({
  employeeId,
  managerOptions,
  employmentStatus,
  user,
}: Props) => (
  <div className="flex flex-wrap gap-2">
    <Link
      href={`/employees/${employeeId}/edit`}
      className={buttonStyles({ variant: "secondary" })}
    >
      Edit
    </Link>
    <AssignManagerDialog employeeId={employeeId} options={managerOptions} />{" "}
    {employmentStatus !== "terminated" && (
      <TerminateEmployeeDialog employeeId={employeeId} />
    )}
    {employmentStatus !== "terminated" && user?.status === "pending" ? (
      <ResendInvitationButton userId={user.id} />
    ) : null}
  </div>
);
