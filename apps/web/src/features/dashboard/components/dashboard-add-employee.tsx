"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Sheet, useSheetController } from "@/components/sheet";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/ui/feedback";
import { CreateEmployeeForm } from "@/features/employee/components/create-employee-form";
import { ResendInvitationButton } from "@/features/user/components/resend-invitation-button";
import type {
  CreatedEmployee,
  LookupOption,
} from "@/features/employee/types/employee";

export function DashboardAddEmployee({
  departments,
  branches,
}: {
  departments: LookupOption[] | null;
  branches: LookupOption[] | null;
}) {
  const sheet = useSheetController<"create">();
  const router = useRouter();
  const [created, setCreated] = useState<CreatedEmployee | null>(null);
  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button
        aria-haspopup="dialog"
        aria-controls="dashboard-create-employee"
        onClick={(event) => sheet.openSheet("create", event.currentTarget)}
      >
        <Plus aria-hidden="true" className="size-4" />
        Add employee
      </Button>
      {created ? (
        <Feedback tone={created.invitationSent ? "success" : "warning"}>
          <Link
            className="underline underline-offset-4"
            href={`/employees/${encodeURIComponent(created.id)}`}
          >
            View {created.firstName}’s employee record
          </Link>
          {!created.invitationSent ? (
            <div className="mt-2">
              <p className="mb-2">Employee created; invitation was not sent.</p>
              <ResendInvitationButton userId={created.userId} />
            </div>
          ) : null}
        </Feedback>
      ) : null}
      <Sheet
        id="dashboard-create-employee"
        title="Create employee"
        description="Add an employee record and assign their organization details."
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
        bodyClassName="p-0"
      >
        {sheet.content === "create" ? (
          departments && branches ? (
            <CreateEmployeeForm
              departments={departments}
              branches={branches}
              onCancel={sheet.requestClose}
              onCreated={(employee) => {
                setCreated(employee);
                sheet.requestClose();
                router.refresh();
              }}
            />
          ) : (
            <div className="p-6">
              <p className="mb-3 text-sm text-muted-foreground">
                Employee setup options could not be loaded.
              </p>
              <Link href="/employees" className="text-info underline">
                Open employee management to retry
              </Link>
            </div>
          )
        ) : null}
      </Sheet>
    </div>
  );
}
