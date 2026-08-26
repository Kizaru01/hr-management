"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createShiftSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { createShift } from "../api/create-shift";
import { normalizeFieldErrors } from "../utils/validation-errors";
import { FieldError } from "./field-error";

type Feedback = {
  type: "success" | "error";
  message: string;
};

export const CreateShiftForm = () => {
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
    const result = createShiftSchema.safeParse({
      name: formData.get("name"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
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
      const response = await createShift(result.data);

      form.reset();
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
              : "Unable to create shift.",
      });
      setFieldErrors(backendFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-foreground/25 p-4 sm:p-5">
      <div>
        <h2 className="font-semibold">Create shift</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Add a reusable work schedule for employee assignments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-1" htmlFor="shift-name">
          <span className="text-sm font-medium">Name</span>
          <input
            id="shift-name"
            name="name"
            type="text"
            required
            maxLength={100}
            disabled={isSubmitting}
            aria-invalid={fieldErrors.name ? true : undefined}
            className="rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.name} />
        </label>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <label className="grid gap-1" htmlFor="shift-start-time">
            <span className="text-sm font-medium">Start time</span>
            <input
              id="shift-start-time"
              name="startTime"
              type="time"
              required
              disabled={isSubmitting}
              aria-invalid={fieldErrors.startTime ? true : undefined}
              className="rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
            <FieldError messages={fieldErrors.startTime} />
          </label>

          <label className="grid gap-1" htmlFor="shift-end-time">
            <span className="text-sm font-medium">End time</span>
            <input
              id="shift-end-time"
              name="endTime"
              type="time"
              required
              disabled={isSubmitting}
              aria-invalid={fieldErrors.endTime ? true : undefined}
              className="rounded-md border border-foreground/25 bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
            <FieldError messages={fieldErrors.endTime} />
          </label>
        </div>

        <p className="text-xs leading-5 text-foreground/55">
          An end time at or before the start time is treated as an overnight
          shift.
        </p>

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
          disabled={isSubmitting}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create shift"}
        </button>
      </form>
    </section>
  );
};
