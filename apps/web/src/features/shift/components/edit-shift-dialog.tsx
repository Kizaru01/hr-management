"use client";

import { useState } from "react";
import { updateShiftSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { updateShift } from "../api/update-shift";
import type { ShiftSummary } from "../types/shift";
import { normalizeFieldErrors } from "../utils/validation-errors";
import { FieldError } from "./field-error";

interface EditShiftDialogProps {
  shift: ShiftSummary | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const EditShiftDialog = ({
  shift,
  onClose,
  onSuccess,
}: EditShiftDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (!shift) {
    return null;
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const result = updateShiftSchema.safeParse({
      name: formData.get("name"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
    });

    setErrorMessage(null);
    setFieldErrors({});

    if (!result.success) {
      setErrorMessage("Please correct the highlighted fields.");
      setFieldErrors(normalizeFieldErrors(result.error.flatten().fieldErrors));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateShift(shift.id, result.data);

      onSuccess(response.message);
    } catch (error) {
      const backendFieldErrors =
        error instanceof ApiError && error.details ? error.details : {};

      setErrorMessage(
        Object.keys(backendFieldErrors).length > 0
          ? "Please correct the highlighted fields."
          : error instanceof ApiError
            ? error.message
            : "Unable to update shift.",
      );
      setFieldErrors(backendFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-shift-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <section className="w-full max-w-lg rounded-xl border border-foreground/25 bg-background p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-shift-title" className="text-lg font-semibold">
              Edit shift
            </h2>
            <p className="mt-1 text-sm text-foreground/60">
              Update the name and scheduled hours.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close edit shift dialog"
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-foreground/20 text-lg leading-none hover:bg-foreground/5 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <label className="grid gap-1" htmlFor="edit-shift-name">
            <span className="text-sm font-medium">Name</span>
            <input
              id="edit-shift-name"
              name="name"
              type="text"
              required
              maxLength={100}
              defaultValue={shift.name}
              disabled={isSubmitting}
              aria-invalid={fieldErrors.name ? true : undefined}
              className="rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
            <FieldError messages={fieldErrors.name} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1" htmlFor="edit-shift-start-time">
              <span className="text-sm font-medium">Start time</span>
              <input
                id="edit-shift-start-time"
                name="startTime"
                type="time"
                required
                defaultValue={shift.startTime}
                disabled={isSubmitting}
                aria-invalid={fieldErrors.startTime ? true : undefined}
                className="rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              />
              <FieldError messages={fieldErrors.startTime} />
            </label>

            <label className="grid gap-1" htmlFor="edit-shift-end-time">
              <span className="text-sm font-medium">End time</span>
              <input
                id="edit-shift-end-time"
                name="endTime"
                type="time"
                required
                defaultValue={shift.endTime}
                disabled={isSubmitting}
                aria-invalid={fieldErrors.endTime ? true : undefined}
                className="rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              />
              <FieldError messages={fieldErrors.endTime} />
            </label>
          </div>

          {errorMessage ? (
            <p role="alert" className="text-sm text-red-700 dark:text-red-400">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-md border border-foreground/25 px-4 py-2 text-sm font-medium hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
