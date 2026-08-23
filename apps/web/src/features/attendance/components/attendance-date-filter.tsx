"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface AttendanceDateFilterProps {
  selectedDate?: string;
}

export const AttendanceDateFilter = ({
  selectedDate,
}: AttendanceDateFilterProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateDate = (date?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (date) {
      params.set("date", date);
    } else {
      params.delete("date");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="flex items-end gap-2">
      <label className="grid gap-1" htmlFor="attendance-date">
        <span className="text-sm text-muted-foreground">Work date</span>
        <input
          id="attendance-date"
          type="date"
          value={selectedDate ?? ""}
          onChange={(event) => updateDate(event.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </label>

      <button
        type="button"
        onClick={() => updateDate()}
        className="rounded-lg border px-3 py-2 text-sm font-medium"
      >
        Today
      </button>
    </div>
  );
};
