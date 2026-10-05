"use client";

import { actionFeedback, useValidationFocus } from "@/lib/action-feedback";

import { useState } from "react";
import { ApiError } from "@/lib/api/api.client";
import { useRouter } from "next/navigation";

import { assignManager } from "../api/assign-manager";
import type { ManagerOption } from "../types/employee";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";

interface Props {
  employeeId: string;
  options: ManagerOption[];
}

export const AssignManagerDialog = ({ employeeId, options }: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const validationFormRef = useValidationFocus(fieldErrors);
  const [open, setOpen] = useState(false);
  const [managerId, setManagerId] = useState("");

  const handleAssign = async () => {
    if (isSubmitting || !managerId) return;
    setIsSubmitting(true);
    setFieldErrors({});
    let mutationConfirmed = false;
    try {

    await actionFeedback(() => assignManager(employeeId, managerId), {
        success: "Manager assigned.",
        error: "Unable to assign manager. Please try again.",
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
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Assign Manager
      </Button>

      {open ? (
        <Dialog
          id="assign-manager-dialog"
          title="Assign manager"
          description="Choose an active employee to manage this employee."
          onRequestClose={() => { if (!isSubmitting) setOpen(false); }}
        >
          <form ref={validationFormRef} className="space-y-4" onSubmit={(event) => { event.preventDefault(); }}>
            <label className="grid gap-1.5">
              <span className="control-label">Manager</span>
              <Select
                name="managerId"
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.managerId)}
                value={managerId}
                onChange={(event) => setManagerId(event.target.value)}
                data-dialog-initial-focus
              >
                <option value="">Select manager</option>

                {options.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
              </Select>
              {fieldErrors.managerId?.[0] ? <p className="text-sm text-destructive">{fieldErrors.managerId[0]}</p> : null}
            </label>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                onClick={handleAssign}
                disabled={isSubmitting || !managerId}
              >
                {isSubmitting ? "Saving..." : "Save"}
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
