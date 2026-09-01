"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPositionSchema,
  type CreatePositionInput,
  updatePositionSchema,
} from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { createPosition } from "../api/create-position";
import { updatePosition } from "../api/update-position";
import type { Position, PositionDepartmentSummary } from "../types/position";

interface PositionFormProps {
  mode: "create" | "edit";
  department: PositionDepartmentSummary;
  position?: Position;
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

type FieldErrors = Record<string, string[] | undefined>;

export function PositionForm({
  mode,
  department,
  position,
  onCancel,
  onSuccess,
}: PositionFormProps) {
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
    const sharedInput = {
      name: formData.get("name"),
      description: description || undefined,
    };
    const result =
      mode === "create"
        ? createPositionSchema.safeParse({
            ...sharedInput,
            salary: parseRequiredNumber(formData.get("salary")),
            allowance: 0,
            departmentId: department.id,
          })
        : updatePositionSchema.safeParse(sharedInput);

    setFeedback(null);
    setFieldErrors({});

    if (!result.success) {
      setFeedback("Please correct the highlighted fields.");
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    if (mode === "edit" && !position) {
      setFeedback("The selected position is no longer available.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createInput = result.data as CreatePositionInput;
      const response =
        mode === "create"
          ? await createPosition(department.id, {
              name: createInput.name,
              description: createInput.description,
              salary: createInput.salary,
              allowance: createInput.allowance,
            })
          : await updatePosition(position!.id, result.data);

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
            : `Unable to ${mode === "create" ? "create" : "update"} position.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="rounded-md border border-border bg-hover px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Department
        </p>
        <p className="mt-1 font-medium">{department.name}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {department.code}
        </p>
      </div>

      <FormField
        id={`${mode}-position-name`}
        name="name"
        label="Position name"
        defaultValue={position?.name}
        error={fieldErrors.name?.[0]}
        disabled={isSubmitting}
        autoFocus
      />

      <label className="grid gap-1.5" htmlFor={`${mode}-position-description`}>
        <span className="text-sm font-medium">Description</span>
        <textarea
          id={`${mode}-position-description`}
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={position?.description ?? ""}
          disabled={isSubmitting}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={
            fieldErrors.description
              ? `${mode}-position-description-error`
              : undefined
          }
          className="resize-y rounded-md border border-border-strong bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        />
        <FieldError
          id={`${mode}-position-description-error`}
          message={fieldErrors.description?.[0]}
        />
      </label>

      {mode === "create" ? (
        <label className="grid gap-1.5" htmlFor="create-position-salary">
          <span className="text-sm font-medium">Base salary</span>
          <input
            id="create-position-salary"
            name="salary"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            required
            disabled={isSubmitting}
            aria-invalid={fieldErrors.salary ? true : undefined}
            aria-describedby={
              fieldErrors.salary ? "create-position-salary-error" : undefined
            }
            className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          />
          <FieldError
            id="create-position-salary-error"
            message={fieldErrors.salary?.[0]}
          />
        </label>
      ) : null}

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
              ? "Create position"
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
  error?: string;
  disabled: boolean;
  autoFocus?: boolean;
}

function FormField({
  id,
  name,
  label,
  defaultValue,
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
        maxLength={100}
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

function parseRequiredNumber(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "").trim();

  return rawValue ? Number(rawValue) : Number.NaN;
}
