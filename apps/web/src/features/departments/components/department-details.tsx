"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { changeDepartmentStatus } from "../api/change-department-status";
import type { Department } from "../types/department";
import {
  formatDepartmentDate,
  formatEmployeeName,
} from "../utils/department-formatters";

interface DepartmentDetailsProps {
  department: Department;
  onEdit: () => void;
  onMutationSuccess: (message: string) => void;
}

export function DepartmentDetails({
  department,
  onEdit,
  onMutationSuccess,
}: DepartmentDetailsProps) {
  const router = useRouter();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const action = department.isActive ? "deactivate" : "reactivate";

  const handleStatusChange = async () => {
    if (isChangingStatus) {
      return;
    }

    const confirmed = window.confirm(
      department.isActive
        ? `Deactivate ${department.name}? Employee and historical records will remain intact.`
        : `Reactivate ${department.name}? The department will become available for active use again.`,
    );

    if (!confirmed) {
      return;
    }

    setIsChangingStatus(true);
    setErrorMessage(null);

    try {
      const response = await changeDepartmentStatus(department.id, action);

      router.refresh();
      onMutationSuccess(response.message);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : `Unable to ${action} department.`,
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <p className="font-mono text-xs font-medium text-muted-foreground">
          {department.code}
        </p>
        <h3 className="mt-1 break-words text-lg font-semibold">
          {department.name}
        </h3>
        <Badge
          variant={department.isActive ? "success" : "neutral"}
          className="mt-3"
        >
          {department.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <dl>
        <Detail
          label="Description"
          value={department.description ?? "Not provided"}
        />
      </dl>

      <section aria-labelledby="department-head-heading">
        <h3
          id="department-head-heading"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Department head
        </h3>
        {department.departmentHead ? (
          <div className="mt-3">
            <p className="font-medium">
              {formatEmployeeName(department.departmentHead)}
            </p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {department.departmentHead.employeeNumber}
            </p>
            <Link
              href={`/employees/${encodeURIComponent(department.departmentHead.id)}`}
              className="mt-3 inline-flex rounded-sm text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View employee record
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Not assigned</p>
        )}
      </section>

      <dl className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <Detail
          label="Active employees"
          value={String(department.activeEmployeeCount)}
        />
        <Detail
          label="Created"
          value={formatDepartmentDate(department.createdAt)}
        />
        <Detail
          label="Last updated"
          value={formatDepartmentDate(department.updatedAt)}
        />
      </dl>

      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-2 border-t border-border pt-5 sm:grid-cols-2">
        <Link
          href={`/departments/${encodeURIComponent(department.id)}/positions`}
          className="rounded-md border border-border-strong px-4 py-2 text-center text-sm font-medium hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-2"
        >
          Manage positions
        </Link>
        <Button type="button" onClick={onEdit} disabled={isChangingStatus}>
          Edit department
        </Button>
        <Button
          type="button"
          variant={department.isActive ? "destructive" : "secondary"}
          onClick={handleStatusChange}
          disabled={isChangingStatus}
        >
          {isChangingStatus
            ? department.isActive
              ? "Deactivating..."
              : "Reactivating..."
            : department.isActive
              ? "Deactivate"
              : "Reactivate"}
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm leading-6 [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}
