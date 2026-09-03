"use client";

import { useEffect, useState } from "react";
import { activateAccountSchema } from "@hr-management/validation";
import { KeyRound, UsersRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Feedback } from "@/components/ui/feedback";
import { Input } from "@/components/ui/form-controls";
import { ApiError } from "@/lib/api/api.client";
import { activateAccount } from "../api/activate-account";

type FieldErrors = Record<string, string[] | undefined>;

interface ActivateAccountFormProps {
  token: string;
}

export function ActivateAccountForm({ token }: ActivateAccountFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    title: string;
    message: string;
  } | null>(
    token
      ? null
      : {
          tone: "error",
          title: "Invalid activation link",
          message: "This activation link does not contain a valid token.",
        },
  );

  useEffect(() => {
    if (token) {
      window.history.replaceState(window.history.state, "", "/activate");
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || !token) {
      return;
    }

    const validation = activateAccountSchema.safeParse({
      token,
      password,
      confirmPassword,
    });

    setFieldErrors({});
    setFeedback(null);

    if (!validation.success) {
      setFieldErrors(validation.error.flatten().fieldErrors);
      setFeedback({
        tone: "error",
        title: "Check your password",
        message: "Please correct the highlighted fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await activateAccount(validation.data);

      setPassword("");
      setConfirmPassword("");
      setFeedback({
        tone: "success",
        title: "Account activated",
        message: response.message,
      });

      await new Promise((resolve) => window.setTimeout(resolve, 900));
      window.location.replace(
        response.data.role === "admin" || response.data.role === "hr"
          ? "/dashboard"
          : "/employee/dashboard",
      );
    } catch (error) {
      const backendErrors =
        error instanceof ApiError && error.details ? error.details : {};
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to activate the account.";

      setFieldErrors(backendErrors);
      setFeedback({
        tone: "error",
        title: activationErrorTitle(message),
        message,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" />
      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <span className="mb-4 flex size-10 items-center justify-center rounded-control border border-border bg-selected text-info">
              <UsersRound aria-hidden="true" size={20} />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              HR Management
            </p>
            <h1 className="mt-1">Activate your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a secure password to access your employee workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              id="activation-password"
              label="New password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              errors={fieldErrors.password}
              disabled={isSubmitting || !token}
              autoFocus={Boolean(token)}
            />
            <PasswordField
              id="activation-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              errors={fieldErrors.confirmPassword}
              disabled={isSubmitting || !token}
            />

            <p className="control-help">
              Use 8–72 characters. Your password is sent only through the secure
              activation request.
            </p>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !token}
            >
              <KeyRound aria-hidden="true" className="size-4" />
              {isSubmitting ? "Activating account..." : "Activate account"}
            </Button>

            {feedback ? (
              <Feedback tone={feedback.tone}>
                <p className="font-medium">{feedback.title}</p>
                <p className="mt-0.5">{feedback.message}</p>
              </Feedback>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  errors?: string[];
  disabled: boolean;
  autoFocus?: boolean;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  errors,
  disabled,
  autoFocus = false,
}: PasswordFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="control-label">
        {label}
      </label>
      <Input
        id={id}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5"
        autoComplete={autoComplete}
        required
        disabled={disabled}
        autoFocus={autoFocus}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? errorId : undefined}
      />
      {errors?.length ? (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {errors.join(" ")}
        </p>
      ) : null}
    </div>
  );
}

function activationErrorTitle(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("expired")) {
    return "Activation link expired";
  }

  if (normalized.includes("already been used")) {
    return "Account already activated";
  }

  if (normalized.includes("terminated")) {
    return "Account unavailable";
  }

  if (normalized.includes("invalid")) {
    return "Invalid activation link";
  }

  return "Activation failed";
}
