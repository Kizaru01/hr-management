"use client";

import type { EmployeeQueryInput } from "@hr-management/validation";
import { ListToolbar } from "@/components/list-toolbar";
import { useListFilters } from "@/hooks/use-list-filters";
import {
  employeeFilterControls,
  employeeQueryKeys,
} from "../utils/list-filters";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Sheet, useSheetController } from "@/components/sheet";
import { Button, buttonStyles } from "@/components/ui/button";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import type { EmployeeListItem, LookupOption } from "../types/employee";
import { CreateEmployeeForm } from "./create-employee-form";
import { EmployeeTable } from "./employee-table";
import { ResendInvitationButton } from "@/features/user/components/resend-invitation-button";

interface EmployeeManagementProps {
  query: EmployeeQueryInput;
  noMatchingResults: boolean;
  employees: EmployeeListItem[];
  filterDepartments: LookupOption[];
  filterBranches: LookupOption[];
  filterPositions: LookupOption[];
  departments: LookupOption[];
  branches: LookupOption[];
}

interface CreatedEmployeeNotice {
  id: string;
  name: string;
  message: string;
  userId: string;
  invitationSent: boolean;
}

export function EmployeeManagement({
  query,
  noMatchingResults,
  filterDepartments,
  filterBranches,
  filterPositions,
  employees,
  departments,
  branches,
}: EmployeeManagementProps) {
  const router = useRouter();
  const filters = useListFilters(query, employeeQueryKeys);
  const sheet = useSheetController<"create">();
  const [createdEmployee, setCreatedEmployee] =
    useState<CreatedEmployeeNotice | null>(null);

  return (
    <section className="page-stack">
      <PageHeader
        title="Employees"
        description="Manage company employee records and assignments."
        actions={
          <Button
            type="button"
            aria-haspopup="dialog"
            aria-controls="create-employee-sheet"
            onClick={(event) => sheet.openSheet("create", event.currentTarget)}
          >
            <Plus aria-hidden="true" className="size-4" />
            Create employee
          </Button>
        }
      />

      {createdEmployee ? (
        <Feedback tone={createdEmployee.invitationSent ? "success" : "warning"}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{createdEmployee.message}</span>
            <Link
              href={`/employees/${encodeURIComponent(createdEmployee.id)}`}
              className={buttonStyles({
                variant: "ghost",
                size: "small",
                className:
                  "h-auto px-0 text-success underline underline-offset-4",
              })}
            >
              View {createdEmployee.name}
            </Link>
          </div>
          {!createdEmployee.invitationSent ? (
            <div className="mt-3">
              <ResendInvitationButton userId={createdEmployee.userId} />
            </div>
          ) : null}
        </Feedback>
      ) : null}

      <ListToolbar
        label="Filter employees"
        placeholder="Name, email, or employee number"
        filters={employeeFilterControls(
          filterDepartments,
          filterBranches,
          filterPositions,
          Boolean(filters.values.departmentId) &&
            filters.values.departmentId === query.departmentId,
        )}
        state={filters}
        noMatchingResults={noMatchingResults}
        onFilterChange={(key, value) =>
          filters.change({
            [key]: value || undefined,
            ...(key === "departmentId" ? { positionId: undefined } : {}),
          })
        }
      />

      {!noMatchingResults ? <EmployeeTable employees={employees} /> : null}

      <Sheet
        id="create-employee-sheet"
        title="Create employee"
        description="Add an employee record and assign their organization details."
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
        bodyClassName="p-0"
      >
        {sheet.content === "create" ? (
          <CreateEmployeeForm
            departments={departments}
            branches={branches}
            onCancel={sheet.requestClose}
            onCreated={(employee, message) => {
              const name = [
                employee.firstName,
                employee.middleName,
                employee.lastName,
              ]
                .filter(Boolean)
                .join(" ");

              setCreatedEmployee({
                id: employee.id,
                name,
                message,
                userId: employee.userId,
                invitationSent: employee.invitationSent,
              });
              sheet.requestClose();
              router.refresh();
            }}
          />
        ) : null}
      </Sheet>
    </section>
  );
}
