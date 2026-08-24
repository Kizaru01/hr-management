"use client";

import { useState } from "react";
import { rejectLeaveSchema } from "@hr-management/validation";
import { ApiError } from "@/lib/api/api.client";
import { rejectLeave } from "../api/reject-leave";
import type { ManagedLeaveRequest } from "../types/leave";
import { formatLeaveEmployeeName } from "../utils/leave-formatters";

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-leave-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 id="reject-leave-title" className="text-lg font-semibold">
          Reject Leave Request
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Add rejection remarks for {formatLeaveEmployeeName(leaveRequest.employee)}.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="grid gap-1" htmlFor="rejection-remarks">
            <span className="text-sm font-medium">Remarks</span>
            <textarea
              id="rejection-remarks"
              name="remarks"
              rows={5}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              disabled={isSubmitting}
              aria-invalid={remarksError ? true : undefined}
              className="rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          {remarksError ? (
            <p className="text-sm text-red-700">{remarksError}</p>
          ) : null}

          {errorMessage ? (
            <p role="alert" className="text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetAndClose}
              disabled={isSubmitting}
              className="rounded-md border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Rejecting..." : "Reject Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
