"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [managerId, setManagerId] = useState("");

  const handleAssign = async () => {
    if (!managerId) return;

    await assignManager(employeeId, managerId);

    setOpen(false);
    router.refresh();
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
          onRequestClose={() => setOpen(false)}
        >
          <div className="space-y-4">
            <label className="grid gap-1.5">
              <span className="control-label">Manager</span>
              <Select
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
            </label>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                onClick={handleAssign}
                disabled={!managerId}
              >
                Save
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
