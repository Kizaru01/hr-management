"use client";

import { useState } from "react";
import { rejectLeaveSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { rejectLeave } from "../api/reject-leave";
import type { ManagedLeaveRequest } from "../types/leave";
import { formatLeaveEmployeeName } from "../utils/leave-formatters";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form-controls";

interface RejectLeaveDialogProps {
  leaveRequest: ManagedLeaveRequest | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const RejectLeaveDialog = ({
  leaveRequest,
  onClose,
  onSuccess,
}: RejectLeaveDialogProps) => {
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remarksError, setRemarksError] = useState<string | null>(null);

  if (!leaveRequest) {
    return null;
  }

  const resetAndClose = () => {
    if (isSubmitting) {
      return;
    }

    setRemarks("");
    setErrorMessage(null);
    setRemarksError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setRemarksError(null);

    const result = rejectLeaveSchema.safeParse({ remarks });

    if (!result.success) {
      setRemarksError(result.error.flatten().fieldErrors.remarks?.[0] ?? null);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await rejectLeave(leaveRequest.id, result.data);

      setRemarks("");
      setErrorMessage(null);
      setRemarksError(null);
      onClose();
      onSuccess(response.message);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to reject leave request.",
      );
      setRemarksError(
        error instanceof ApiError
          ? (error.details?.remarks?.[0] ?? null)
          : null,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      id="reject-leave-dialog"
      title="Reject Leave Request"
      description={`Add rejection remarks for ${formatLeaveEmployeeName(leaveRequest.employee)}.`}
      onRequestClose={resetAndClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="grid gap-1" htmlFor="rejection-remarks">
          <span className="control-label">Remarks</span>
          <Textarea
            id="rejection-remarks"
            name="remarks"
            rows={5}
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={remarksError ? true : undefined}
            data-dialog-initial-focus
          />
        </label>

        {remarksError ? (
          <p className="text-sm text-destructive">{remarksError}</p>
        ) : null}

        {errorMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={resetAndClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Rejecting..." : "Reject Request"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
