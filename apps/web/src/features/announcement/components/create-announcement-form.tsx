"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncementSchema } from "@hr-management/validation";
import type { LookupOption } from "@/features/employee/types/employee";
import { ApiError } from "@/lib/api/api.client";
import { createAnnouncement } from "../api/create-announcement";
import type { AnnouncementAudience } from "../types/announcement";
import { announcementAudienceLabels } from "../utils/announcement-formatters";

interface CreateAnnouncementFormProps {
  departments: LookupOption[];
  branches: LookupOption[];
  onCancel?: () => void;
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

type FieldErrors = Record<string, string[] | undefined>;

const audiences = Object.keys(
  announcementAudienceLabels,
) as AnnouncementAudience[];

const FieldError = ({ messages }: { messages?: string[] }) =>
  messages?.[0] ? <p className="text-sm text-red-700">{messages[0]}</p> : null;

const toIsoDateTime = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

export const CreateAnnouncementForm = ({
  departments,
  branches,
  onCancel,
}: CreateAnnouncementFormProps) => {
  const router = useRouter();
  const [audience, setAudience] = useState<AnnouncementAudience>("company");
  const [departmentId, setDepartmentId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleAudienceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setAudience(event.target.value as AnnouncementAudience);
    setDepartmentId("");
    setBranchId("");
    setFieldErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const expiresAtValue = String(formData.get("expiresAt") ?? "").trim();
    const result = createAnnouncementSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      audience,
      expiresAt: expiresAtValue ? toIsoDateTime(expiresAtValue) : undefined,
      departmentId:
        audience === "department" && departmentId ? departmentId : undefined,
      branchId: audience === "branch" && branchId ? branchId : undefined,
    });

    setFeedback(null);
    setFieldErrors({});

    if (!result.success) {
      setFeedback({
        type: "error",
        message: "Please correct the highlighted fields.",
      });
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createAnnouncement(result.data);

      form.reset();
      setAudience("company");
      setDepartmentId("");
      setBranchId("");
      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to create announcement.",
      });
      setFieldErrors(
        error instanceof ApiError && error.details ? error.details : {},
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label
        className="grid gap-1 sm:col-span-2"
        htmlFor="announcement-title"
      >
          <span className="text-sm font-medium">Title</span>
          <input
            id="announcement-title"
            name="title"
            type="text"
            data-sheet-initial-focus
            required
            maxLength={150}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.title} />
      </label>

      <label className="grid gap-1" htmlFor="announcement-audience">
          <span className="text-sm font-medium">Audience</span>
          <select
            id="announcement-audience"
            name="audience"
            value={audience}
            onChange={handleAudienceChange}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {audiences.map((value) => (
              <option key={value} value={value}>
                {announcementAudienceLabels[value]}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.audience} />
      </label>

      <label className="grid gap-1" htmlFor="announcement-expires-at">
          <span className="text-sm font-medium">Expires At (optional)</span>
          <input
            id="announcement-expires-at"
            name="expiresAt"
            type="datetime-local"
            step={60}
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.expiresAt} />
      </label>

      {audience === "department" ? (
          <label
            className="grid gap-1 sm:col-span-2"
            htmlFor="announcement-department"
          >
            <span className="text-sm font-medium">Department</span>
            <select
              id="announcement-department"
              name="departmentId"
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              required
              disabled={isSubmitting}
              className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department.value} value={department.value}>
                  {department.label}
                </option>
              ))}
            </select>
            <FieldError messages={fieldErrors.departmentId} />
          </label>
      ) : null}

      {audience === "branch" ? (
          <label
            className="grid gap-1 sm:col-span-2"
            htmlFor="announcement-branch"
          >
            <span className="text-sm font-medium">Branch</span>
            <select
              id="announcement-branch"
              name="branchId"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              required
              disabled={isSubmitting}
              className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.value} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
            <FieldError messages={fieldErrors.branchId} />
          </label>
      ) : null}

      <label
        className="grid gap-1 sm:col-span-2"
        htmlFor="announcement-content"
      >
          <span className="text-sm font-medium">Content</span>
          <textarea
            id="announcement-content"
            name="content"
            rows={6}
            required
            disabled={isSubmitting}
            className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError messages={fieldErrors.content} />
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-foreground/15 pt-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex gap-2">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-md border border-foreground/25 px-4 py-2 text-sm font-medium hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Publishing..." : "Publish announcement"}
            </button>
          </div>
      </div>
    </form>
  );
};
