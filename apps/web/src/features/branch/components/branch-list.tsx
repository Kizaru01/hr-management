"use client";

import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form-controls";
import { Table, TableShell } from "@/components/ui/table";
import type { Branch } from "../types/branch";
import { formatBranchLocation } from "../utils/branch-formatters";

interface BranchListProps {
  branches: Branch[];
  selectedBranchId?: string;
  onSelect: (branch: Branch, trigger: HTMLElement) => void;
}

type StatusFilter = "all" | "active" | "inactive";

export function BranchList({
  branches,
  selectedBranchId,
  onSelect,
}: BranchListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const filteredBranches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return branches.filter((branch) => {
      const matchesStatus =
        status === "all" ||
        (status === "active" ? branch.isActive : !branch.isActive);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [branch.code, branch.name, formatBranchLocation(branch)].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        );

      return matchesStatus && matchesQuery;
    });
  }, [branches, query, status]);

  if (branches.length === 0) {
    return (
      <EmptyState
        title="No branches found"
        description="Create a branch to begin managing work locations."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="relative block">
          <span className="sr-only">Search branches</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search code, name, or location"
            className="pl-9"
          />
        </label>

        <label>
          <span className="sr-only">Filter by status</span>
          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as StatusFilter)
            }
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </label>
      </div>

      {filteredBranches.length === 0 ? (
        <EmptyState
          title="No matching branches"
          description="Try a different search term or status filter."
        />
      ) : (
        <>
          <TableShell className="hidden md:block">
            <Table aria-label="Branches">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Branch</th>
                  <th scope="col">Location</th>
                  <th scope="col">Active employees</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="w-10">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((branch) => {
                  const isSelected = branch.id === selectedBranchId;

                  return (
                    <tr
                      key={branch.id}
                      tabIndex={0}
                      aria-haspopup="dialog"
                      aria-controls="branch-sheet"
                      aria-selected={isSelected}
                      onClick={(event) => onSelect(branch, event.currentTarget)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelect(branch, event.currentTarget);
                        }
                      }}
                      className={`group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                        isSelected ? "bg-selected" : ""
                      }`}
                    >
                      <td className="font-mono text-sm font-medium">
                        {branch.code}
                      </td>
                      <td className="font-medium">{branch.name}</td>
                      <td className="max-w-sm text-secondary-foreground">
                        <span className="line-clamp-2">
                          {formatBranchLocation(branch)}
                        </span>
                      </td>
                      <td>{branch.activeEmployeeCount}</td>
                      <td>
                        <StatusBadge isActive={branch.isActive} />
                      </td>
                      <td>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 text-disabled-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-secondary-foreground"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableShell>

          <ul aria-label="Branches" className="grid gap-3 md:hidden">
            {filteredBranches.map((branch) => {
              const isSelected = branch.id === selectedBranchId;

              return (
                <li key={branch.id}>
                  <Card className={isSelected ? "bg-selected" : undefined}>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      aria-controls="branch-sheet"
                      aria-expanded={isSelected}
                      onClick={(event) =>
                        onSelect(branch, event.currentTarget)
                      }
                      className="group w-full p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block font-mono text-xs font-medium text-muted-foreground">
                            {branch.code}
                          </span>
                          <span className="mt-1 block truncate font-medium">
                            {branch.name}
                          </span>
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="mt-1 size-5 shrink-0 text-disabled-foreground transition-transform group-hover:translate-x-0.5"
                        />
                      </span>

                      <span className="mt-4 grid gap-3 border-t border-border pt-3 text-sm">
                        <span>
                          <span className="block text-xs text-muted-foreground">
                            Location
                          </span>
                          <span className="mt-1 block text-secondary-foreground">
                            {formatBranchLocation(branch)}
                          </span>
                        </span>
                        <span className="flex items-end justify-between gap-4">
                          <span>
                            <span className="block text-xs text-muted-foreground">
                              Active employees
                            </span>
                            <span className="mt-1 block font-medium">
                              {branch.activeEmployeeCount}
                            </span>
                          </span>
                          <StatusBadge isActive={branch.isActive} />
                        </span>
                      </span>
                    </button>
                  </Card>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "neutral"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
