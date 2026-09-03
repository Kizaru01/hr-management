"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { createUser } from "../api/create-user";
import type { UserRole } from "../types/user";
import { UserFieldError } from "./user-field-error";

type Feedback = {
  type: "success" | "error";
  message: string;
};

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "employee", label: "Employee" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
];

interface CreateUserFormProps {
  onCancel?: () => void;
}

export function CreateUserForm({ onCancel }: CreateUserFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("employee");
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
    const result = createUserSchema.safeParse({
      email: formData.get("email"),
      role: formData.get("role"),
      employeeNumber: formData.get("employeeNumber"),
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
      const response = await createUser({
        ...result.data,
        employeeNumber: result.data.employeeNumber || undefined,
      });

      form.reset();
      setRole("employee");
      setFeedback({
        type: response.data.invitationSent ? "success" : "error",
        message: response.message,
      });
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
              : "Unable to create account.",
      });
      setFieldErrors(backendFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-1" htmlFor="user-email">
        <span className="text-sm font-medium">Email</span>
        <input
          id="user-email"
          name="email"
          type="email"
          data-sheet-initial-focus
          required
          autoComplete="off"
          disabled={isSubmitting}
          aria-invalid={fieldErrors.email ? true : undefined}
          className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        />
        <UserFieldError messages={fieldErrors.email} />
      </label>

      <label className="grid gap-1" htmlFor="user-role">
        <span className="text-sm font-medium">Role</span>
        <select
          id="user-role"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          disabled={isSubmitting}
          aria-invalid={fieldErrors.role ? true : undefined}
          className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <UserFieldError messages={fieldErrors.role} />
      </label>

      <label className="grid gap-1" htmlFor="user-employee-number">
        <span className="text-sm font-medium">
          Employee number {role === "employee" ? "" : "(optional)"}
        </span>
        <input
          id="user-employee-number"
          name="employeeNumber"
          type="text"
          required={role === "employee"}
          placeholder="EMP-0001"
          disabled={isSubmitting}
          aria-invalid={fieldErrors.employeeNumber ? true : undefined}
          className="rounded-md border border-border-strong bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          When supplied, the employee must be unlinked and use the same email
          address. Linking is preserved across later role changes.
        </p>
        <UserFieldError messages={fieldErrors.employeeNumber} />
      </label>

      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`rounded-md border border-border px-3 py-2 text-sm ${
            feedback.type === "error" ? "text-destructive" : "text-success"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-[38px] rounded-control border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </div>
    </form>
  );
}

function normalizeFieldErrors(
  errors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(errors).flatMap(([field, messages]) =>
      messages?.length ? [[field, messages]] : [],
    ),
  );
}
