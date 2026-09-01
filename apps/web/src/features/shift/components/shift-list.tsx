"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { deactivateShift } from "../api/deactivate-shift";
import type { ShiftSummary } from "../types/shift";
import { formatShiftSchedule } from "../utils/shift-formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback as FeedbackMessage } from "@/components/ui/feedback";

interface ShiftListProps {
  shifts: ShiftSummary[];
  onEdit: (shift: ShiftSummary, trigger: HTMLButtonElement) => void;
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

const desktopColumns =
  "md:grid-cols-[minmax(0,1.3fr)_minmax(11rem,1fr)_minmax(6rem,0.55fr)_minmax(10rem,0.7fr)]";

export const ShiftList = ({ shifts, onEdit }: ShiftListProps) => {
  const router = useRouter();
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleDeactivate = async (shift: ShiftSummary) => {
    if (pendingDeactivateId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate “${shift.name}”? It will no longer be available for new assignments. Existing assignment records will remain unchanged.`,
    );

    if (!confirmed) {
      return;
    }

    setPendingDeactivateId(shift.id);
    setFeedback(null);

    try {
      const response = await deactivateShift(shift.id);

      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to deactivate shift.",
      });
    } finally {
      setPendingDeactivateId(null);
    }
  };

  if (shifts.length === 0) {
    return (
      <EmptyState
        title="No shifts found"
        description="Create the first shift to make it available for assignment."
      />
    );
  }

  return (
    <div className="space-y-3">
      {feedback ? (
        <FeedbackMessage tone={feedback.type}>
          {feedback.message}
        </FeedbackMessage>
      ) : null}

      <section aria-label="Configured shifts" className="table-shell">
        <div
          className={`hidden gap-4 border-b border-border bg-hover px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid ${desktopColumns}`}
        >
          <span>Shift</span>
          <span>Schedule</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        <ul className="divide-y divide-border">
          {shifts.map((shift) => (
            <li
              key={shift.id}
              className={`grid min-w-0 gap-3 px-4 py-4 sm:px-5 md:items-center md:gap-4 ${desktopColumns}`}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{shift.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                  Shift
                </p>
              </div>

              <p className="text-sm text-secondary-foreground">
                {formatShiftSchedule(shift.startTime, shift.endTime)}
              </p>

              <div>
                <Badge variant={shift.isActive ? "success" : "neutral"}>
                  {shift.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  aria-haspopup="dialog"
                  aria-controls="shift-sheet"
                  onClick={(event) => {
                    setFeedback(null);
                    onEdit(shift, event.currentTarget);
                  }}
                  disabled={pendingDeactivateId !== null}
                >
                  Edit
                </Button>
                {shift.isActive ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="small"
                    onClick={() => handleDeactivate(shift)}
                    disabled={pendingDeactivateId !== null}
                  >
                    {pendingDeactivateId === shift.id
                      ? "Deactivating..."
                      : "Deactivate"}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
