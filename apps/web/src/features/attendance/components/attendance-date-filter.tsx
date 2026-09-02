"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";

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
        <span className="control-label">Work date</span>
        <Input
          id="attendance-date"
          type="date"
          value={selectedDate ?? ""}
          onChange={(event) => updateDate(event.target.value)}
          className="w-auto"
        />
      </label>

      <Button type="button" variant="secondary" onClick={() => updateDate()}>
        Today
      </Button>
    </div>
  );
};
