'use client';

import Link from 'next/link';

interface EmployeeActionsProps {
  employeeId: string;
}

export const EmployeeActions = ({
  employeeId,
}: EmployeeActionsProps) => (
  <div className="flex gap-2">
    <Link
      href={`/employees/${employeeId}/edit`}
      className="rounded-md border px-3 py-2 text-sm"
    >
      Edit
    </Link>

    <button className="rounded-md border px-3 py-2 text-sm">
      Assign Manager
    </button>

    <button className="rounded-md border px-3 py-2 text-sm">
      Terminate
    </button>
  </div>
);