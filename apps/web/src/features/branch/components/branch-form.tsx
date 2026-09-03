"use client";

import { createBranchSchema } from "@hr-management/validation";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/ui/feedback";
import { Input, Textarea } from "@/components/ui/form-controls";
import { ApiError } from "@/lib/api/api.client";
import { createBranch } from "../api/create-branch";
import { updateBranch } from "../api/update-branch";
import type { Branch } from "../types/branch";

interface BranchFormProps {
  mode: "create" | "edit";
  branch?: Branch;
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

type FieldErrors = Record<string, string[] | undefined>;

export function BranchForm({
  mode,
  branch,
  onCancel,
  onSuccess,
}: BranchFormProps) {
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
    const rawInput = {
      code: formData.get("code"),
      name: formData.get("name"),
      address: formData.get("address"),
      city: String(formData.get("city") ?? ""),
      province: String(formData.get("province") ?? ""),
      latitude: optionalNumber(formData.get("latitude")),
      longitude: optionalNumber(formData.get("longitude")),
      allowedRadius: optionalNumber(formData.get("allowedRadius")),
    };
    const result = createBranchSchema.safeParse(rawInput);

    setFeedback(null);
    setFieldErrors({});

    if (!result.success) {
      setFeedback("Please correct the highlighted fields.");
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    if (mode === "edit" && !branch) {
      setFeedback("The selected branch is no longer available.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        mode === "create"
          ? await createBranch(result.data)
          : await updateBranch(branch!.id, result.data);

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
            : `Unable to ${mode === "create" ? "create" : "update"} branch.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <BranchField
          id={`${mode}-branch-code`}
          name="code"
          label="Branch code"
          defaultValue={branch?.code}
          error={fieldErrors.code?.[0]}
          disabled={isSubmitting}
          autoFocus
          required
        />
        <BranchField
          id={`${mode}-branch-name`}
          name="name"
          label="Branch name"
          defaultValue={branch?.name}
          error={fieldErrors.name?.[0]}
          disabled={isSubmitting}
          required
        />
      </div>

      <label className="grid gap-1.5" htmlFor={`${mode}-branch-address`}>
        <span className="control-label">Address</span>
        <Textarea
          id={`${mode}-branch-address`}
          name="address"
          rows={3}
          required
          defaultValue={branch?.address ?? ""}
          disabled={isSubmitting}
          aria-invalid={fieldErrors.address ? true : undefined}
          aria-describedby={
            fieldErrors.address ? `${mode}-branch-address-error` : undefined
          }
        />
        <FieldError
          id={`${mode}-branch-address-error`}
          message={fieldErrors.address?.[0]}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <BranchField
          id={`${mode}-branch-city`}
          name="city"
          label="City"
          defaultValue={branch?.city ?? ""}
          error={fieldErrors.city?.[0]}
          disabled={isSubmitting}
        />
        <BranchField
          id={`${mode}-branch-province`}
          name="province"
          label="Province"
          defaultValue={branch?.province ?? ""}
          error={fieldErrors.province?.[0]}
          disabled={isSubmitting}
        />
      </div>

      <fieldset className="grid gap-4 border-t border-border pt-5">
        <legend className="control-label px-1">Attendance location</legend>
        <p className="control-help -mt-2">
          Coordinates and an allowed radius are optional and support
          location-aware attendance rules.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <BranchField
            id={`${mode}-branch-latitude`}
            name="latitude"
            label="Latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            defaultValue={branch?.latitude ?? ""}
            error={fieldErrors.latitude?.[0]}
            disabled={isSubmitting}
          />
          <BranchField
            id={`${mode}-branch-longitude`}
            name="longitude"
            label="Longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            defaultValue={branch?.longitude ?? ""}
            error={fieldErrors.longitude?.[0]}
            disabled={isSubmitting}
          />
        </div>
        <BranchField
          id={`${mode}-branch-radius`}
          name="allowedRadius"
          label="Allowed radius (meters)"
          type="number"
          step="1"
          min={1}
          defaultValue={branch?.allowedRadius ?? ""}
          error={fieldErrors.allowedRadius?.[0]}
          disabled={isSubmitting}
        />
      </fieldset>

      {feedback ? <Feedback tone="error">{feedback}</Feedback> : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create branch"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

interface BranchFieldProps {
  id: string;
  name: string;
  label: string;
  type?: "text" | "number";
  defaultValue?: string | number;
  error?: string;
  disabled: boolean;
  autoFocus?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
}

function BranchField({
  id,
  name,
  label,
  type = "text",
  defaultValue,
  error,
  disabled,
  autoFocus = false,
  ...inputProps
}: BranchFieldProps) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="control-label">{label}</span>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        data-sheet-initial-focus={autoFocus ? "" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
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

function optionalNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();

  return normalized === "" ? undefined : Number(normalized);
}
