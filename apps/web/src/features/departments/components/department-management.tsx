"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Sheet, useSheetController } from "@/components/sheet";
import type { Department, DepartmentHeadOption } from "../types/department";
import { DepartmentDetails } from "./department-details";
import { DepartmentForm } from "./department-form";
import { DepartmentList } from "./department-list";

interface DepartmentManagementProps {
  departments: Department[];
  departmentHeadOptions: DepartmentHeadOption[];
}

type DepartmentSheetContent =
  | { type: "create" }
  | { type: "details"; department: Department }
  | { type: "edit"; department: Department };

type Feedback = {
  type: "success" | "error";
  message: string;
};

export function DepartmentManagement({
  departments,
  departmentHeadOptions,
}: DepartmentManagementProps) {
  const sheet = useSheetController<DepartmentSheetContent>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const selectedDepartment =
    sheet.content?.type === "details" || sheet.content?.type === "edit"
      ? sheet.content.department
      : null;
  const availableDepartmentHeads = getAvailableDepartmentHeads(
    departments,
    departmentHeadOptions,
    selectedDepartment?.id,
  );

  const handleMutationSuccess = (message: string) => {
    setFeedback({ type: "success", message });
    sheet.requestClose();
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground/60">
            Organize departments, assign department heads, and manage their
            active lifecycle.
          </p>
        </div>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls="department-sheet"
          onClick={(event) => {
            setFeedback(null);
            sheet.openSheet({ type: "create" }, event.currentTarget);
          }}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus aria-hidden="true" size={17} />
          Create department
        </button>
      </header>

      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className="rounded-md border border-foreground/20 px-4 py-3 text-sm text-foreground/70"
        >
          {feedback.message}
        </p>
      ) : null}

      <DepartmentList
        departments={departments}
        selectedDepartmentId={selectedDepartment?.id}
        onSelect={(department, trigger) => {
          setFeedback(null);
          sheet.openSheet({ type: "details", department }, trigger);
        }}
      />

      <Sheet
        id="department-sheet"
        title={
          sheet.content?.type === "create"
            ? "Create department"
            : sheet.content?.type === "edit"
              ? "Edit department"
              : "Department details"
        }
        description={
          sheet.content?.type === "create"
            ? "Add a department with an optional active employee as its head."
            : sheet.content?.type === "edit"
              ? "Update department information or change its assigned head."
              : "Review department information and lifecycle status."
        }
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
        autoFocusClose={sheet.content?.type === "details"}
      >
        {sheet.content?.type === "create" ? (
          <DepartmentForm
            mode="create"
            departmentHeadOptions={availableDepartmentHeads}
            onCancel={sheet.requestClose}
            onSuccess={handleMutationSuccess}
          />
        ) : sheet.content?.type === "edit" ? (
          <DepartmentForm
            key={sheet.content.department.id}
            mode="edit"
            department={sheet.content.department}
            departmentHeadOptions={availableDepartmentHeads}
            onCancel={() =>
              sheet.replaceContent({
                type: "details",
                department: selectedDepartment!,
              })
            }
            onSuccess={handleMutationSuccess}
          />
        ) : sheet.content?.type === "details" ? (
          <DepartmentDetails
            department={sheet.content.department}
            onEdit={() =>
              sheet.replaceContent({
                type: "edit",
                department: selectedDepartment!,
              })
            }
            onMutationSuccess={handleMutationSuccess}
          />
        ) : null}
      </Sheet>
    </section>
  );
}

function getAvailableDepartmentHeads(
  departments: Department[],
  employees: DepartmentHeadOption[],
  currentDepartmentId?: string,
) {
  const assignedElsewhere = new Set(
    departments
      .filter((department) => department.id !== currentDepartmentId)
      .map((department) => department.departmentHead?.id)
      .filter((employeeId): employeeId is string => Boolean(employeeId)),
  );

  return employees.filter((employee) => !assignedElsewhere.has(employee.id));
}
