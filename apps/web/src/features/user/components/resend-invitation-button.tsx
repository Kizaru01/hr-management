"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/ui/feedback";
import { ApiError } from "@/lib/api/api.client";
import { resendUserInvitation } from "../api/resend-user-invitation";

interface ResendInvitationButtonProps {
  userId: string;
  onSent?: (message: string) => void;
}

export function ResendInvitationButton({
  userId,
  onSent,
}: ResendInvitationButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const handleResend = async () => {
    if (isSending) {
      return;
    }

    setIsSending(true);
    setFeedback(null);

    try {
      const response = await resendUserInvitation(userId);

      setFeedback({ tone: "success", message: response.message });
      onSent?.(response.message);
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to resend the invitation.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleResend}
        disabled={isSending}
      >
        {isSending ? "Sending invitation..." : "Resend invitation"}
      </Button>
      {feedback ? (
        <Feedback tone={feedback.tone}>{feedback.message}</Feedback>
      ) : null}
    </div>
  );
}
