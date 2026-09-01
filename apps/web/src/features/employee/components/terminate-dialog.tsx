"use client";

import { useState } from "react";
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

  const [open, setOpen] = useState(false);
  const [terminationDate, setTerminationDate] = useState("");
  const [reason, setReason] = useState("");

  const handleTerminate = async () => {
    if (!terminationDate || !reason.trim()) return;

    await terminateEmployee(employeeId, {
      terminationDate,
      reason: reason.trim(),
    });

    setOpen(false);
    router.refresh();
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
          onRequestClose={() => setOpen(false)}
        >
          <div className="space-y-4">
            <label className="grid gap-1.5">
              <span className="control-label">Termination date</span>
              <Input
                type="date"
                value={terminationDate}
                onChange={(event) => setTerminationDate(event.target.value)}
                data-dialog-initial-focus
              />
            </label>

            <label className="grid gap-1.5">
              <span className="control-label">Reason</span>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Termination reason"
              />
            </label>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleTerminate}
                disabled={!terminationDate || !reason.trim()}
              >
                Confirm termination
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>
      ) : null}
    </>
  );
};
