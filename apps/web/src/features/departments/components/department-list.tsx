"use client";

import { ChevronRight } from "lucide-react";
import type { Department } from "../types/department";
import { formatEmployeeName } from "../utils/department-formatters";

interface DepartmentListProps {
  departments: Department[];
  selectedDepartmentId?: string;
  onSelect: (department: Department, trigger: HTMLButtonElement) => void;
}

const desktopColumns =
  "md:grid-cols-[minmax(6rem,0.55fr)_minmax(11rem,1fr)_minmax(14rem,1.25fr)_minmax(7rem,0.55fr)_1.5rem]";

export function DepartmentList({
  departments,
  selectedDepartmentId,
  onSelect,
}: DepartmentListProps) {
  if (departments.length === 0) {
    return (
      <div className="rounded-xl border border-foreground/25 px-6 py-12 text-center">
        <p className="font-medium">No departments found.</p>
        <p className="mt-1 text-sm text-foreground/60">
          Create a department to begin organizing employee records.
        </p>
      </div>
    );
  }

  return (
    <>
      <section
        aria-label="Departments"
        className="hidden overflow-hidden rounded-xl border border-foreground/25 md:block"
      >
        <div
          className={`grid gap-4 border-b border-foreground/20 bg-foreground/5 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/55 ${desktopColumns}`}
        >
          <span>Code</span>
          <span>Department</span>
          <span>Department head</span>
          <span>Status</span>
          <span className="sr-only">Open</span>
        </div>

        <ul className="divide-y divide-foreground/15">
          {departments.map((department) => {
            const isSelected = selectedDepartmentId === department.id;

            return (
              <li key={department.id}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-controls="department-sheet"
                  aria-expanded={isSelected}
                  onClick={(event) => onSelect(department, event.currentTarget)}
                  className={`group grid w-full min-w-0 gap-4 px-5 py-4 text-left transition md:items-center ${desktopColumns} ${
                    isSelected ? "bg-foreground/10" : "hover:bg-foreground/5"
                  } focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground`}
                >
                  <span className="font-mono text-sm font-medium">
                    {department.code}
                  </span>
                  <span className="truncate text-sm font-medium">
                    {department.name}
                  </span>
                  <HeadSummary department={department} />
                  <StatusBadge isActive={department.isActive} />
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-foreground/45 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/75"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <ul aria-label="Departments" className="grid gap-3 md:hidden">
        {departments.map((department) => {
          const isSelected = selectedDepartmentId === department.id;

          return (
            <li key={department.id}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-controls="department-sheet"
                aria-expanded={isSelected}
                onClick={(event) => onSelect(department, event.currentTarget)}
                className={`group w-full rounded-xl border border-foreground/25 p-4 text-left transition ${
                  isSelected ? "bg-foreground/10" : "hover:bg-foreground/5"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-mono text-xs font-medium text-foreground/55">
                      {department.code}
                    </span>
                    <span className="mt-1 block truncate font-medium">
                      {department.name}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-foreground/45 transition-transform group-hover:translate-x-0.5"
                  />
                </span>

                <span className="mt-4 grid gap-3 border-t border-foreground/15 pt-3">
                  <span>
                    <span className="block text-xs text-foreground/50">
                      Department head
                    </span>
                    <span className="mt-1 block">
                      <HeadSummary department={department} />
                    </span>
                  </span>
                  <span>
                    <span className="block text-xs text-foreground/50">
                      Status
                    </span>
                    <span className="mt-1 block">
                      <StatusBadge isActive={department.isActive} />
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function HeadSummary({ department }: { department: Department }) {
  if (!department.departmentHead) {
    return <span className="text-sm text-foreground/55">Not assigned</span>;
  }

  return (
    <span className="min-w-0 text-sm">
      <span className="block truncate font-medium">
        {formatEmployeeName(department.departmentHead)}
      </span>
      <span className="mt-0.5 block font-mono text-xs text-foreground/55">
        {department.departmentHead.employeeNumber}
      </span>
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium">
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
