"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { terminateEmployee } from "../api/terminate-employee";

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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border px-3 py-2 text-sm"
      >
        Terminate
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <input
        type="date"
        value={terminationDate}
        onChange={(event) => setTerminationDate(event.target.value)}
        className="w-full rounded-md border px-3 py-2"
      />

      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Termination reason"
        className="w-full rounded-md border px-3 py-2"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleTerminate}
          disabled={!terminationDate || !reason.trim()}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Confirm termination
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
