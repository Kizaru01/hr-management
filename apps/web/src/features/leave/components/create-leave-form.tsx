"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLeaveSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { createLeave } from "../api/create-leave";
import type { LeaveType } from "../types/leave";
import { leaveTypeLabels } from "../utils/leave-formatters";

const leaveTypes = Object.keys(leaveTypeLabels) as LeaveType[];

type Feedback = {
  type: "success" | "error";
  message: string;
};

const normalizeFieldErrors = (
  errors: Record<string, string[] | undefined>,
) =>
  Object.entries(errors).reduce<Record<string, string[]>>(
    (normalized, [field, messages]) => {
      if (messages) {
        normalized[field] = messages;
      }

      return normalized;
    },
    {},
  );

const FieldError = ({ messages }: { messages?: string[] }) =>
  messages?.[0] ? (
    <p className="text-sm text-red-700">{messages[0]}</p>
  ) : null;

export const CreateLeaveForm = () => {
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
    const result = createLeaveSchema.safeParse({
      leaveType: formData.get("leaveType"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      reason: formData.get("reason"),
    });

    setFeedback(null);
    setFieldErrors({});

    if (!result.success) {
      setFeedback({
        type: "error",
        message: "Please correct the highlighted fields.",
      });
      setFieldErrors(
        normalizeFieldErrors(result.error.flatten().fieldErrors),
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createLeave(result.data);

      form.reset();
      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to submit leave request.",
      });
      setFieldErrors(
        error instanceof ApiError && error.details ? error.details : {},
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg border p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Submit a Leave Request</h2>
        <p className="mt-1 text-sm text-gray-600">
          Provide the leave dates and a brief reason for your request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1" htmlFor="leave-type">
          <span className="text-sm font-medium">Leave Type</span>
          <select
            id="leave-type"
            name="leaveType"
            defaultValue="vacation"
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {leaveTypes.map((leaveType) => (
              <option key={leaveType} value={leaveType}>
                {leaveTypeLabels[leaveType]}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.leaveType} />
        </label>

        <div className="hidden sm:block" aria-hidden="true" />

        <label className="grid gap-1" htmlFor="leave-start-date">
          <span className="text-sm font-medium">Start Date</span>
          <input
            id="leave-start-date"
            name="startDate"
            type="date"
            required
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.startDate} />
        </label>

        <label className="grid gap-1" htmlFor="leave-end-date">
          <span className="text-sm font-medium">End Date</span>
          <input
            id="leave-end-date"
            name="endDate"
            type="date"
            required
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.endDate} />
        </label>

        <label className="grid gap-1 sm:col-span-2" htmlFor="leave-reason">
          <span className="text-sm font-medium">Reason</span>
          <textarea
            id="leave-reason"
            name="reason"
            rows={4}
            required
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.reason} />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          {feedback ? (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className={`text-sm ${
                feedback.type === "error" ? "text-red-700" : "text-green-700"
              }`}
            >
              {feedback.message}
            </p>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </section>
  );
};
