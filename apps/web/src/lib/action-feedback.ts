"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api.client";
import { safeMessage } from "@/lib/api/safe-message";

type ActionOptions = { success: string; error: string; loading?: string; partial?: string };

// Called by mutation components around the request only, before refresh/close.
export async function actionFeedback<T>(request: () => Promise<T>, options: ActionOptions): Promise<T> {
  const id = options.loading ? toast.loading(options.loading) : undefined;
  try {
    const response = await request();
    const body = response as { message?: unknown; data?: { invitationSent?: boolean } } | undefined;
    const message = safeMessage(body?.message, options.success);
    if (body?.data?.invitationSent === false) {
      toast.warning(options.partial ?? "Account created, but the invitation was not sent. Use Resend invitation.", { id });
    } else {
      toast.success(message, { id });
    }
    return response;
  } catch (error) {
    if (error instanceof ApiError && error.details && Object.keys(error.details).length) {
      if (id !== undefined) toast.dismiss(id);
    } else {
      toast.error(error instanceof ApiError && error.status < 500
        ? safeMessage(error.message, options.error) : options.error, { id });
    }
    throw error;
  }
}

export function useValidationFocus(errors: Record<string, string[] | undefined>) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const frame = requestAnimationFrame(() => {
      const first = Array.from(form.elements).find((element) =>
        element instanceof HTMLElement && errors[element.getAttribute("name") ?? ""]?.length,
      );
      if (first instanceof HTMLElement) first.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [errors]);
  return formRef;
}
