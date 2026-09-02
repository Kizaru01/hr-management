"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createShiftSchema,
  updateShiftSchema,
} from "@hr-management/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { ApiError } from "@/lib/api/api.client";
import { createShift } from "../api/create-shift";
import { updateShift } from "../api/update-shift";
import type { ShiftSummary } from "../types/shift";
import { normalizeFieldErrors } from "../utils/validation-errors";
import { FieldError } from "./field-error";

type Feedback = {
  type: "success" | "error";
  message: string;
};

interface ShiftFormProps {
  mode: "create" | "edit";
  shift?: ShiftSummary;
  onCancel?: () => void;
  onSuccess?: (message: string) => void;
}

export const ShiftForm = ({
  mode,
  shift,
  onCancel,
  onSuccess,
}: ShiftFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const input = {
      name: formData.get("name"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
    };
    const validation =
      mode === "create"
        ? {
            mode: "create" as const,
            result: createShiftSchema.safeParse(input),
          }
        : {
            mode: "edit" as const,
            result: updateShiftSchema.safeParse(input),
          };

    setFeedback(null);
    setFieldErrors({});

    if (!validation.result.success) {
      setFeedback({
        type: "error",
        message: "Please correct the highlighted fields.",
      });
      setFieldErrors(
        normalizeFieldErrors(validation.result.error.flatten().fieldErrors),
      );
      return;
    }

    if (validation.mode === "edit" && !shift) {
      setFeedback({
        type: "error",
        message: "The selected shift is no longer available.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        validation.mode === "create"
          ? await createShift(validation.result.data)
          : await updateShift(shift!.id, validation.result.data);

      if (mode === "create") {
        form.reset();
      }
      router.refresh();

      if (onSuccess) {
        onSuccess(response.message);
      } else {
        setFeedback({ type: "success", message: response.message });
      }
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
              : `Unable to ${mode === "create" ? "create" : "update"} shift.`,
      });
      setFieldErrors(backendFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="grid gap-1" htmlFor={`${mode}-shift-name`}>
        <span className="text-sm font-medium">Name</span>
        <Input
          id={`${mode}-shift-name`}
          name="name"
          type="text"
          required
          maxLength={100}
          defaultValue={shift?.name ?? ""}
          disabled={isSubmitting}
          aria-invalid={fieldErrors.name ? true : undefined}
          data-sheet-initial-focus
          data-dialog-initial-focus
        />
        <FieldError messages={fieldErrors.name} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1" htmlFor={`${mode}-shift-start-time`}>
          <span className="text-sm font-medium">Start time</span>
          <Input
            id={`${mode}-shift-start-time`}
            name="startTime"
            type="time"
            required
            defaultValue={shift?.startTime ?? ""}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.startTime ? true : undefined}
          />
          <FieldError messages={fieldErrors.startTime} />
        </label>

        <label className="grid gap-1" htmlFor={`${mode}-shift-end-time`}>
          <span className="text-sm font-medium">End time</span>
          <Input
            id={`${mode}-shift-end-time`}
            name="endTime"
            type="time"
            required
            defaultValue={shift?.endTime ?? ""}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.endTime ? true : undefined}
          />
          <FieldError messages={fieldErrors.endTime} />
        </label>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        An end time at or before the start time is treated as an overnight
        shift.
      </p>

      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`text-sm ${
            feedback.type === "error" ? "text-destructive" : "text-success"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create shift"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
};

export const CreateShiftForm = (
  props: Omit<ShiftFormProps, "mode" | "shift"> = {},
) => <ShiftForm mode="create" {...props} />;
