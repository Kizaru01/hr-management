"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Position } from "../types/position";

interface PositionListProps {
  positions: Position[];
  selectedPositionId?: string;
  onSelect: (position: Position, trigger: HTMLButtonElement) => void;
}

const desktopColumns =
  "md:grid-cols-[minmax(10rem,1fr)_minmax(14rem,1.4fr)_minmax(7rem,0.55fr)_minmax(6rem,0.5fr)_1.5rem]";

export function PositionList({
  positions,
  selectedPositionId,
  onSelect,
}: PositionListProps) {
  if (positions.length === 0) {
    return (
      <EmptyState
        title="No positions found"
        description="Create this department's first position to get started."
      />
    );
  }

  return (
    <>
      <section aria-label="Positions" className="table-shell hidden md:block">
        <div
          className={`grid gap-4 border-b border-border bg-hover px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${desktopColumns}`}
        >
          <span>Position</span>
          <span>Description</span>
          <span>Active employees</span>
          <span>Status</span>
          <span className="sr-only">Open</span>
        </div>

        <ul className="divide-y divide-border">
          {positions.map((position) => {
            const isSelected = selectedPositionId === position.id;

            return (
              <li key={position.id}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-controls="position-sheet"
                  aria-expanded={isSelected}
                  onClick={(event) => onSelect(position, event.currentTarget)}
                  className={`group grid w-full min-w-0 gap-4 px-5 py-4 text-left transition md:items-center ${desktopColumns} ${
                    isSelected ? "bg-selected" : "hover:bg-hover"
                  } focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring`}
                >
                  <span className="truncate text-sm font-medium">
                    {position.name}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {position.description ?? "Not provided"}
                  </span>
                  <span className="text-sm">
                    {position.activeEmployeeCount}
                  </span>
                  <StatusBadge isActive={position.isActive} />
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-disabled-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-secondary-foreground"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <ul aria-label="Positions" className="grid gap-3 md:hidden">
        {positions.map((position) => {
          const isSelected = selectedPositionId === position.id;

          return (
            <li key={position.id}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-controls="position-sheet"
                aria-expanded={isSelected}
                onClick={(event) => onSelect(position, event.currentTarget)}
                className={`group w-full rounded-card border border-border-strong bg-surface p-4 text-left shadow-card transition ${
                  isSelected ? "bg-selected" : "hover:bg-hover"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {position.name}
                    </span>
                    {position.description ? (
                      <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                        {position.description}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-disabled-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </span>

                <span className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">
                    {position.activeEmployeeCount} active{" "}
                    {position.activeEmployeeCount === 1
                      ? "employee"
                      : "employees"}
                  </span>
                  <StatusBadge isActive={position.isActive} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "neutral"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
