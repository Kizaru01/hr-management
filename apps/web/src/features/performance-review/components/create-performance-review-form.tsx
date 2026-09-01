"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPerformanceReviewSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { createPerformanceReview } from "../api/create-performance-review";

interface CreatePerformanceReviewFormProps {
  employeeId: string;
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

const normalizeFieldErrors = (errors: Record<string, string[] | undefined>) =>
  Object.entries(errors).reduce<Record<string, string[]>>(
    (normalized, [field, messages]) => {
      if (messages) {
        normalized[field] = messages;
      }

      return normalized;
    },
    {},
  );

const optionalText = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue || undefined;
};

const FieldError = ({ messages }: { messages?: string[] }) =>
  messages?.[0] ? (
    <p className="text-sm text-destructive">{messages[0]}</p>
  ) : null;

export const CreatePerformanceReviewForm = ({
  employeeId,
}: CreatePerformanceReviewFormProps) => {
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
    const result = createPerformanceReviewSchema.safeParse({
      reviewDate: formData.get("reviewDate"),
      rating: Number(formData.get("rating")),
      strengths: optionalText(formData.get("strengths")),
      improvements: optionalText(formData.get("improvements")),
      comments: optionalText(formData.get("comments")),
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
      const response = await createPerformanceReview(employeeId, result.data);

      form.reset();
      setFeedback({ type: "success", message: response.message });
      // router.refresh();
      router.push(`/employees/${employeeId}`);
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
              : "Unable to create performance review.",
      });
      setFieldErrors(backendFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div>
        <h3 className="text-lg font-semibold">Create Performance Review</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Record the employee&apos;s review date, rating, and feedback.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1" htmlFor="performance-review-date">
          <span className="text-sm font-medium">Review Date</span>
          <input
            id="performance-review-date"
            name="reviewDate"
            type="date"
            required
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.reviewDate} />
        </label>

        <label className="grid gap-1" htmlFor="performance-review-rating">
          <span className="text-sm font-medium">Rating</span>
          <select
            id="performance-review-rating"
            name="rating"
            defaultValue=""
            required
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="" disabled>
              Select a rating
            </option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.rating} />
        </label>

        <label
          className="grid gap-1 sm:col-span-2"
          htmlFor="performance-review-strengths"
        >
          <span className="text-sm font-medium">Strengths (optional)</span>
          <textarea
            id="performance-review-strengths"
            name="strengths"
            rows={4}
            maxLength={2000}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.strengths} />
        </label>

        <label
          className="grid gap-1 sm:col-span-2"
          htmlFor="performance-review-improvements"
        >
          <span className="text-sm font-medium">
            Areas for Improvement (optional)
          </span>
          <textarea
            id="performance-review-improvements"
            name="improvements"
            rows={4}
            maxLength={2000}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.improvements} />
        </label>

        <label
          className="grid gap-1 sm:col-span-2"
          htmlFor="performance-review-comments"
        >
          <span className="text-sm font-medium">Comments (optional)</span>
          <textarea
            id="performance-review-comments"
            name="comments"
            rows={5}
            maxLength={3000}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.comments} />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          {feedback ? (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className={`text-sm ${
                feedback.type === "error" ? "text-destructive" : "text-success"
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
            className="h-[38px] rounded-control border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Review"}
          </button>
        </div>
      </form>
    </section>
  );
};
