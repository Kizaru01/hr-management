"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignShiftSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { assignShift } from "../api/assign-shift";
import type { ShiftOption } from "../types/shift";
import {
  formatShiftSchedule,
  shiftWeekdayLabels,
  shiftWeekdays,
} from "../utils/shift-formatters";
import { normalizeFieldErrors } from "../utils/validation-errors";
import { FieldError } from "./field-error";

interface AssignShiftFormProps {
  employeeId: string;
  shifts: ShiftOption[];
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

const defaultWorkDays = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
]);

export const AssignShiftForm = ({
  employeeId,
  shifts,
}: AssignShiftFormProps) => {
  const router = useRouter();
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const hasActiveShifts = shifts.length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || !hasActiveShifts) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const effectiveTo = String(formData.get("effectiveTo") ?? "").trim();
    const result = assignShiftSchema.safeParse({
      shiftId: formData.get("shiftId"),
      workDays: formData.getAll("workDays"),
      effectiveFrom: formData.get("effectiveFrom"),
      effectiveTo: effectiveTo || undefined,
    });

    setFeedback(null);
    setFieldErrors({});

    if (!result.success) {
      setFeedback({
        type: "error",
        message: "Please correct the highlighted fields.",
      });
      setFieldErrors(normalizeFieldErrors(result.error.flatten().fieldErrors));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await assignShift(employeeId, result.data);

      form.reset();
      setEffectiveFrom("");
      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      const backendFieldErrors =
        error instanceof ApiError && error.details ? error.details : {};

      setFeedback({
        type: "error",
        message:
          Object.keys(backendFieldErrors).length > 0
            ? "Please correct the highlighted fields."
            : error instanceof ApiError
              ? error.message
              : "Unable to assign shift.",
      });
      setFieldErrors(backendFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-foreground/25 p-4 sm:p-5">
      <div>
        <h3 className="font-semibold">Assign shift</h3>
        <p className="mt-1 text-sm text-foreground/60">
          Add a non-overlapping schedule period for this employee.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-1" htmlFor="employee-shift-id">
          <span className="text-sm font-medium">Shift</span>
          <select
            id="employee-shift-id"
            name="shiftId"
            defaultValue={shifts[0]?.id ?? ""}
            required
            disabled={isSubmitting || !hasActiveShifts}
            aria-invalid={fieldErrors.shiftId ? true : undefined}
            className="min-w-0 rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!hasActiveShifts ? (
              <option value="">No active shifts available</option>
            ) : null}
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name} · {formatShiftSchedule(shift.startTime, shift.endTime)}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.shiftId} />
        </label>

        <fieldset
          disabled={isSubmitting || !hasActiveShifts}
          className="grid gap-2"
        >
          <legend className="text-sm font-medium">Work days</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            {shiftWeekdays.map((day) => (
              <label
                key={day}
                className="flex items-center gap-2 rounded-md border border-foreground/20 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="workDays"
                  value={day}
                  defaultChecked={defaultWorkDays.has(day)}
                  className="size-4 accent-foreground"
                />
                <span>{shiftWeekdayLabels[day].slice(0, 3)}</span>
              </label>
            ))}
          </div>
          <FieldError messages={fieldErrors.workDays} />
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <label className="grid gap-1" htmlFor="shift-effective-from">
            <span className="text-sm font-medium">Effective from</span>
            <input
              id="shift-effective-from"
              name="effectiveFrom"
              type="date"
              required
              value={effectiveFrom}
              onChange={(event) => setEffectiveFrom(event.target.value)}
              disabled={isSubmitting || !hasActiveShifts}
              aria-invalid={fieldErrors.effectiveFrom ? true : undefined}
              className="rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
            <FieldError messages={fieldErrors.effectiveFrom} />
          </label>

          <label className="grid gap-1" htmlFor="shift-effective-to">
            <span className="text-sm font-medium">Effective to</span>
            <input
              id="shift-effective-to"
              name="effectiveTo"
              type="date"
              min={effectiveFrom || undefined}
              disabled={isSubmitting || !hasActiveShifts}
              aria-invalid={fieldErrors.effectiveTo ? true : undefined}
              className="rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="text-xs text-foreground/50">
              Optional; leave blank for no end date.
            </span>
            <FieldError messages={fieldErrors.effectiveTo} />
          </label>
        </div>

        {!hasActiveShifts ? (
          <p className="text-sm text-foreground/60">
            Create an active shift before assigning a schedule.
          </p>
        ) : null}

        {feedback ? (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`text-sm ${
              feedback.type === "error"
                ? "text-red-700 dark:text-red-400"
                : "text-foreground/70"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !hasActiveShifts}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Assigning..." : "Assign shift"}
        </button>
      </form>
    </section>
  );
};
