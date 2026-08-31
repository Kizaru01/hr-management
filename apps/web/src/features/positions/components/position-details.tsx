"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { changePositionStatus } from "../api/change-position-status";
import type { Position } from "../types/position";
import { formatPositionDate } from "../utils/position-formatters";

interface PositionDetailsProps {
  position: Position;
  onEdit: () => void;
  onMutationSuccess: (message: string) => void;
}

export function PositionDetails({
  position,
  onEdit,
  onMutationSuccess,
}: PositionDetailsProps) {
  const router = useRouter();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const action = position.isActive ? "deactivate" : "reactivate";

  const handleStatusChange = async () => {
    if (isChangingStatus) {
      return;
    }

    const confirmed = window.confirm(
      position.isActive
        ? `Deactivate ${position.name}? This is allowed only when no active employees are assigned.`
        : `Reactivate ${position.name}? Its parent department must be active.`,
    );

    if (!confirmed) {
      return;
    }

    setIsChangingStatus(true);
    setErrorMessage(null);

    try {
      const response = await changePositionStatus(position.id, action);

      router.refresh();
      onMutationSuccess(response.message);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : `Unable to ${action} position.`,
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-foreground/15 pb-5">
        <h3 className="break-words text-lg font-semibold">{position.name}</h3>
        <span className="mt-3 inline-flex rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium">
          {position.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <dl className="grid gap-4">
        <Detail
          label="Parent department"
          value={`${position.department.name} (${position.department.code})`}
        />
        <Detail
          label="Description"
          value={position.description ?? "Not provided"}
        />
      </dl>

      <dl className="grid gap-4 border-t border-foreground/15 pt-5 sm:grid-cols-2">
        <Detail
          label="Active employees"
          value={String(position.activeEmployeeCount)}
        />
        <Detail label="Created" value={formatPositionDate(position.createdAt)} />
        <Detail
          label="Last updated"
          value={formatPositionDate(position.updatedAt)}
        />
      </dl>

      {errorMessage ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-2 border-t border-foreground/15 pt-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={isChangingStatus}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          Edit position
        </button>
        <button
          type="button"
          onClick={handleStatusChange}
          disabled={isChangingStatus}
          className="rounded-md border border-foreground/25 px-4 py-2 text-sm font-medium hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isChangingStatus
            ? position.isActive
              ? "Deactivating..."
              : "Reactivating..."
            : position.isActive
              ? "Deactivate"
              : "Reactivate"}
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm leading-6 [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}
