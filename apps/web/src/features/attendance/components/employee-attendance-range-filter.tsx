"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

interface EmployeeAttendanceRangeFilterProps {
  from?: string;
  to?: string;
}

export const EmployeeAttendanceRangeFilter = ({
  from: initialFrom,
  to: initialTo,
}: EmployeeAttendanceRangeFilterProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(initialFrom ?? "");
  const [to, setTo] = useState(initialTo ?? "");
  const canApply = from !== "" && to !== "" && from <= to;

  const applyRange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canApply) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from);
    params.set("to", to);

    router.push(`${pathname}?${params}`, { scroll: false });
  };

  return (
    <form onSubmit={applyRange} className="flex flex-wrap items-end gap-2">
      <label className="grid gap-1" htmlFor="attendance-from">
        <span className="text-sm text-muted-foreground">From</span>
        <input
          id="attendance-from"
          type="date"
          required
          value={from}
          max={to || undefined}
          onChange={(event) => setFrom(event.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-1" htmlFor="attendance-to">
        <span className="text-sm text-muted-foreground">To</span>
        <input
          id="attendance-to"
          type="date"
          required
          value={to}
          min={from || undefined}
          onChange={(event) => setTo(event.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={!canApply}
        className="rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        Apply
      </button>
    </form>
  );
};
