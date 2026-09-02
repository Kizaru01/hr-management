"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDepartmentSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { createDepartment } from "../api/create-department";
import { updateDepartment } from "../api/update-department";
import type { Department, DepartmentHeadOption } from "../types/department";

interface DepartmentFormProps {
  mode: "create" | "edit";
  department?: Department;
  departmentHeadOptions: DepartmentHeadOption[];
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

type FieldErrors = Record<string, string[] | undefined>;

export function DepartmentForm({
  mode,
  department,
  departmentHeadOptions,
  onCancel,
  onSuccess,
}: DepartmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description") ?? "").trim();
    const departmentHeadId = String(
      formData.get("departmentHeadId") ?? "",
    ).trim();
    const rawInput = {
      code: formData.get("code"),
      name: formData.get("name"),
      description: description || null,
      departmentHeadId: departmentHeadId || null,
    };
    const result = createDepartmentSchema.safeParse(rawInput);

    setFeedback(null);
    setFieldErrors({});

    if (!result.success) {
      setFeedback("Please correct the highlighted fields.");
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    if (mode === "edit" && !department) {
      setFeedback("The selected department is no longer available.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        mode === "create"
          ? await createDepartment(result.data)
          : await updateDepartment(department!.id, result.data);

      router.refresh();
      onSuccess(response.message);
    } catch (error) {
      const backendFieldErrors =
        error instanceof ApiError && error.details ? error.details : {};

      setFieldErrors(backendFieldErrors);
      setFeedback(
        Object.keys(backendFieldErrors).length > 0
          ? "Please correct the highlighted fields."
          : error instanceof ApiError
            ? error.message
            : `Unable to ${mode === "create" ? "create" : "update"} department.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormField
        id={`${mode}-department-code`}
        name="code"
        label="Department code"
        defaultValue={department?.code}
        maxLength={50}
        error={fieldErrors.code?.[0]}
        disabled={isSubmitting}
        autoFocus
      />

      <FormField
        id={`${mode}-department-name`}
        name="name"
        label="Department name"
        defaultValue={department?.name}
        maxLength={100}
        error={fieldErrors.name?.[0]}
        disabled={isSubmitting}
      />

      <label
        className="grid gap-1.5"
        htmlFor={`${mode}-department-description`}
      >
        <span className="text-sm font-medium">Description</span>
        <textarea
          id={`${mode}-department-description`}
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={department?.description ?? ""}
          disabled={isSubmitting}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={
            fieldErrors.description
              ? `${mode}-department-description-error`
              : undefined
          }
          className="resize-y rounded-md border border-border-strong bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        />
        <FieldError
          id={`${mode}-department-description-error`}
          message={fieldErrors.description?.[0]}
        />
      </label>

      <label className="grid gap-1.5" htmlFor={`${mode}-department-head`}>
        <span className="text-sm font-medium">Department head</span>
        <select
          id={`${mode}-department-head`}
          name="departmentHeadId"
          defaultValue={department?.departmentHead?.id ?? ""}
          disabled={isSubmitting}
          aria-invalid={fieldErrors.departmentHeadId ? true : undefined}
          aria-describedby={
            fieldErrors.departmentHeadId
              ? `${mode}-department-head-error`
              : `${mode}-department-head-help`
          }
          className="min-w-0 rounded-md border border-border-strong bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Not assigned</option>
          {departmentHeadOptions.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.label}
            </option>
          ))}
        </select>
        <p
          id={`${mode}-department-head-help`}
          className="text-xs leading-5 text-muted-foreground"
        >
          Only active employees who are not heading another department are
          available.
        </p>
        <FieldError
          id={`${mode}-department-head-error`}
          message={fieldErrors.departmentHeadId?.[0]}
        />
      </label>

      {feedback ? (
        <p role="alert" className="text-sm text-destructive">
          {feedback}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[38px] rounded-control border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create department"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  maxLength: number;
  error?: string;
  disabled: boolean;
  autoFocus?: boolean;
}

function FormField({
  id,
  name,
  label,
  defaultValue,
  maxLength,
  error,
  disabled,
  autoFocus = false,
}: FormFieldProps) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-sm font-medium">{label}</span>
      <input
        id={id}
        name={name}
        type="text"
        required
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        data-sheet-initial-focus={autoFocus ? "" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      />
      <FieldError id={`${id}-error`} message={error} />
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  ) : null;
}
