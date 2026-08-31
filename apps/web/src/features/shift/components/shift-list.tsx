"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { deactivateShift } from "../api/deactivate-shift";
import type { ShiftSummary } from "../types/shift";
import { formatShiftSchedule } from "../utils/shift-formatters";
import { EditShiftDialog } from "./edit-shift-dialog";

interface ShiftListProps {
  shifts: ShiftSummary[];
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

const desktopColumns =
  "md:grid-cols-[minmax(0,1.3fr)_minmax(11rem,1fr)_minmax(6rem,0.55fr)_minmax(10rem,0.7fr)]";

export const ShiftList = ({ shifts }: ShiftListProps) => {
  const router = useRouter();
  const [editingShift, setEditingShift] = useState<ShiftSummary | null>(null);
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

  const handleEditSuccess = (message: string) => {
    setEditingShift(null);
    setFeedback({ type: "success", message });
    router.refresh();
  };

  if (shifts.length === 0) {
    return (
      <div className="rounded-xl border border-foreground/25 px-6 py-12 text-center">
        <p className="font-medium">No shifts found.</p>
        <p className="mt-1 text-sm text-foreground/60">
          Create the first shift to make it available for assignment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {feedback ? (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`rounded-md border border-foreground/20 px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "text-red-700 dark:text-red-400"
                : "text-foreground/70"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}

        <section
          aria-label="Configured shifts"
          className="overflow-hidden rounded-xl border border-foreground/25"
        >
          <div
            className={`hidden gap-4 border-b border-foreground/20 bg-foreground/5 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/55 md:grid ${desktopColumns}`}
          >
            <span>Shift</span>
            <span>Schedule</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <ul className="divide-y divide-foreground/15">
            {shifts.map((shift) => (
              <li
                key={shift.id}
                className={`grid min-w-0 gap-3 px-4 py-4 sm:px-5 md:items-center md:gap-4 ${desktopColumns}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{shift.name}</p>
                  <p className="mt-0.5 text-xs text-foreground/50 md:hidden">
                    Shift
                  </p>
                </div>

                <p className="text-sm text-foreground/70">
                  {formatShiftSchedule(shift.startTime, shift.endTime)}
                </p>

                <div>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                      shift.isActive
                        ? "border-foreground/25 bg-foreground/5 text-foreground"
                        : "border-foreground/15 text-foreground/50"
                    }`}
                  >
                    {shift.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback(null);
                      setEditingShift(shift);
                    }}
                    disabled={pendingDeactivateId !== null}
                    className="rounded-md border border-foreground/25 px-3 py-1.5 text-sm font-medium hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>
                  {shift.isActive ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(shift)}
                      disabled={pendingDeactivateId !== null}
                      className="rounded-md border border-foreground/25 px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pendingDeactivateId === shift.id
                        ? "Deactivating..."
                        : "Deactivate"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <EditShiftDialog
        key={editingShift?.id ?? "closed"}
        shift={editingShift}
        onClose={() => setEditingShift(null)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};
