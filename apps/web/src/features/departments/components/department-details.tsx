"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
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
      <div className="border-b border-foreground/15 pb-5">
        <p className="font-mono text-xs font-medium text-foreground/55">
          {department.code}
        </p>
        <h3 className="mt-1 break-words text-lg font-semibold">
          {department.name}
        </h3>
        <span className="mt-3 inline-flex rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium">
          {department.isActive ? "Active" : "Inactive"}
        </span>
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
          className="text-xs font-semibold uppercase tracking-wide text-foreground/50"
        >
          Department head
        </h3>
        {department.departmentHead ? (
          <div className="mt-3">
            <p className="font-medium">
              {formatEmployeeName(department.departmentHead)}
            </p>
            <p className="mt-1 font-mono text-sm text-foreground/60">
              {department.departmentHead.employeeNumber}
            </p>
            <Link
              href={`/employees/${encodeURIComponent(department.departmentHead.id)}`}
              className="mt-3 inline-flex rounded-sm text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View employee record
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm text-foreground/60">Not assigned</p>
        )}
      </section>

      <dl className="grid gap-4 border-t border-foreground/15 pt-5 sm:grid-cols-2">
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
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-2 border-t border-foreground/15 pt-5 sm:grid-cols-2">
        <Link
          href={`/departments/${encodeURIComponent(department.id)}/positions`}
          className="rounded-md border border-foreground/25 px-4 py-2 text-center text-sm font-medium hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:col-span-2"
        >
          Manage positions
        </Link>
        <button
          type="button"
          onClick={onEdit}
          disabled={isChangingStatus}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          Edit department
        </button>
        <button
          type="button"
          onClick={handleStatusChange}
          disabled={isChangingStatus}
          className="rounded-md border border-foreground/25 px-4 py-2 text-sm font-medium hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChangingStatus
            ? department.isActive
              ? "Deactivating..."
              : "Reactivating..."
            : department.isActive
              ? "Deactivate"
              : "Reactivate"}
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm leading-6 [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}
