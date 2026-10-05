"use client";

import { actionFeedback, useValidationFocus } from "@/lib/action-feedback";

import { useState } from "react";
import { ApiError } from "@/lib/api/api.client";
import { useRouter } from "next/navigation";
import { terminateEmployee } from "../api/terminate-employee";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/form-controls";

interface Props {
  employeeId: string;
}

export const TerminateEmployeeDialog = ({ employeeId }: Props) => {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const validationFormRef = useValidationFocus(fieldErrors);
  const [open, setOpen] = useState(false);
  const [terminationDate, setTerminationDate] = useState("");
  const [reason, setReason] = useState("");

  const handleTerminate = async () => {
    if (isSubmitting || !terminationDate || !reason.trim()) return;
    setIsSubmitting(true);
    setFieldErrors({});
    let mutationConfirmed = false;
    try {

    await actionFeedback(() => terminateEmployee(employeeId, {
      terminationDate,
      reason: reason.trim(),
    }), {
        success: "Employee terminated.",
        error: "Unable to terminate employee. Please try again.",
      });
      mutationConfirmed = true;

    setOpen(false);
    router.refresh();
    } catch (error) {
      if (mutationConfirmed) return;
      if (error instanceof ApiError) setFieldErrors(error.details ?? {});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Terminate
      </Button>

      {open ? (
        <Dialog
          id="terminate-employee-dialog"
          title="Terminate employee"
          description="This action changes employment status and should be used with care."
          onRequestClose={() => { if (!isSubmitting) setOpen(false); }}
        >
          <form ref={validationFormRef} className="space-y-4" onSubmit={(event) => { event.preventDefault(); }}>
            <label className="grid gap-1.5">
              <span className="control-label">Termination date</span>
              <Input
                name="terminationDate"
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.terminationDate)}
                type="date"
                value={terminationDate}
                onChange={(event) => setTerminationDate(event.target.value)}
                data-dialog-initial-focus
              />
              {fieldErrors.terminationDate?.[0] ? <p className="text-sm text-destructive">{fieldErrors.terminationDate[0]}</p> : null}
            </label>

            <label className="grid gap-1.5">
              <span className="control-label">Reason</span>
              <Textarea
                name="reason"
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.reason)}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Termination reason"
              />
              {fieldErrors.reason?.[0] ? <p className="text-sm text-destructive">{fieldErrors.reason[0]}</p> : null}
            </label>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleTerminate}
                disabled={isSubmitting || !terminationDate || !reason.trim()}
              >
                {isSubmitting ? "Terminating..." : "Confirm termination"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
};
