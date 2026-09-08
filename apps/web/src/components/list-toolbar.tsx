"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/empty-state";
import type { useListFilters } from "@/hooks/use-list-filters";

export interface ListFilterControl {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

interface ListToolbarProps {
  label: string;
  placeholder: string;
  filters: ListFilterControl[];
  state: ReturnType<typeof useListFilters>;
  onFilterChange?: (key: string, value: string) => void;
  noMatchingResults?: boolean;
}

export function ListToolbar({
  label,
  placeholder,
  filters,
  state,
  onFilterChange,
  noMatchingResults,
}: ListToolbarProps) {
  const id = useId();
  return (
    <div className="space-y-4">
      <div
        role="search"
        aria-label={label}
        className="flex flex-wrap items-end gap-3"
      >
        <label htmlFor={id + "-search"} className="grid min-w-48 flex-1 gap-1">
          <span className="control-label">Search</span>
          <Input
            id={id + "-search"}
            type="search"
            maxLength={200}
            placeholder={placeholder}
            value={state.values.q ?? ""}
            onChange={(event) => state.search(event.target.value)}
          />
        </label>
        {filters.map((filter) => (
          <label
            key={filter.key}
            htmlFor={id + filter.key}
            className="grid min-w-36 gap-1"
          >
            <span className="control-label">{filter.label}</span>
            <Select
              id={id + filter.key}
              value={state.values[filter.key] ?? ""}
              disabled={filter.disabled}
              onChange={(event) =>
                onFilterChange
                  ? onFilterChange(filter.key, event.target.value)
                  : state.change({
                      [filter.key]: event.target.value || undefined,
                    })
              }
            >
              <option value="">All</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        ))}
        <Button type="button" variant="secondary" onClick={state.clear}>
          Clear filters
        </Button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        {state.isPending || state.isSearching
          ? "Updating results…"
          : "Filters applied."}
      </p>
      {noMatchingResults ? (
        <EmptyState
          title="No matching results"
          description="Try another search or clear the filters to see all records."
          action={
            <Button type="button" variant="secondary" onClick={state.clear}>
              Clear filters
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
