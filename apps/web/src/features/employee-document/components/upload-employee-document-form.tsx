"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployeeDocumentSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { uploadEmployeeDocument } from "../api/upload-employee-document";

interface UploadEmployeeDocumentFormProps {
  employeeId: string;
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

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

const FieldError = ({ messages }: { messages?: string[] }) =>
  messages?.[0] ? (
    <p className="text-sm text-destructive">{messages[0]}</p>
  ) : null;

export const UploadEmployeeDocumentForm = ({
  employeeId,
}: UploadEmployeeDocumentFormProps) => {
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
    const file = formData.get("file");
    const issuedAt = String(formData.get("issuedAt") ?? "").trim();
    const expiresAt = String(formData.get("expiresAt") ?? "").trim();
    const result = createEmployeeDocumentSchema.safeParse({
      title: formData.get("title"),
      type: formData.get("type"),
      issuedAt: issuedAt || undefined,
      expiresAt: expiresAt || undefined,
    });
    const nextFieldErrors = result.success
      ? {}
      : normalizeFieldErrors(result.error.flatten().fieldErrors);

    if (!(file instanceof File) || file.size === 0) {
      nextFieldErrors.file = ["Document file is required."];
    } else if (!ALLOWED_FILE_TYPES.has(file.type)) {
      nextFieldErrors.file = ["Only PDF, JPEG, and PNG files are allowed."];
    } else if (file.size > MAX_FILE_SIZE) {
      nextFieldErrors.file = ["Document file must be 10 MB or smaller."];
    }

    setFeedback(null);
    setFieldErrors(nextFieldErrors);

    if (!result.success || !(file instanceof File) || nextFieldErrors.file) {
      setFeedback({
        type: "error",
        message: "Please correct the highlighted fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await uploadEmployeeDocument(
        employeeId,
        file,
        result.data,
      );

      form.reset();
      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to upload employee document.",
      });
      setFieldErrors(
        error instanceof ApiError && error.details ? error.details : {},
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div>
        <h2 className="text-lg font-semibold">Upload Document</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a PDF, JPEG, or PNG file up to 10 MB.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 sm:col-span-2" htmlFor="document-file">
          <span className="text-sm font-medium">File</span>
          <input
            id="document-file"
            name="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            required
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.file} />
        </label>

        <label className="grid gap-1" htmlFor="document-title">
          <span className="text-sm font-medium">Title</span>
          <input
            id="document-title"
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={150}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.title} />
        </label>

        <label className="grid gap-1" htmlFor="document-type">
          <span className="text-sm font-medium">Document Type</span>
          <input
            id="document-type"
            name="type"
            type="text"
            required
            minLength={2}
            maxLength={50}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.type} />
        </label>

        <label className="grid gap-1" htmlFor="document-issued-at">
          <span className="text-sm font-medium">Issued Date (optional)</span>
          <input
            id="document-issued-at"
            name="issuedAt"
            type="date"
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.issuedAt} />
        </label>

        <label className="grid gap-1" htmlFor="document-expires-at">
          <span className="text-sm font-medium">
            Expiration Date (optional)
          </span>
          <input
            id="document-expires-at"
            name="expiresAt"
            type="date"
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.expiresAt} />
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
            {isSubmitting ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </form>
    </section>
  );
};
