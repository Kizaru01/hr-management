"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Sheet, useSheetController } from "@/components/sheet";
import { Button } from "@/components/ui/button";
import { Feedback as FeedbackMessage } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
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
    <section className="page-stack">
      <PageHeader
        title="Departments"
        description="Organize departments, assign department heads, and manage their active lifecycle."
        actions={
          <Button
            type="button"
            aria-haspopup="dialog"
            aria-controls="department-sheet"
            onClick={(event) => {
              setFeedback(null);
              sheet.openSheet({ type: "create" }, event.currentTarget);
            }}
          >
            <Plus aria-hidden="true" size={17} />
            Create department
          </Button>
        }
      />

      {feedback ? (
        <FeedbackMessage tone={feedback.type}>
          {feedback.message}
        </FeedbackMessage>
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
