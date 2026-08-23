"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { assignManager } from "../api/assign-manager";
import type { ManagerOption } from "../types/employee";

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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border px-3 py-2 text-sm"
      >
        Assign Manager
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <select
        value={managerId}
        onChange={(event) => setManagerId(event.target.value)}
        className="w-full rounded-md border px-3 py-2"
      >
        <option value="">Select manager</option>

        {options.map((manager) => (
          <option key={manager.id} value={manager.id}>
            {manager.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAssign}
          disabled={!managerId}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
