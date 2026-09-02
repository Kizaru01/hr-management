"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="border-b border-border pb-5">
        <h3 className="break-words text-lg font-semibold">{position.name}</h3>
        <Badge
          variant={position.isActive ? "success" : "neutral"}
          className="mt-3"
        >
          {position.isActive ? "Active" : "Inactive"}
        </Badge>
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

      <dl className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <Detail
          label="Active employees"
          value={String(position.activeEmployeeCount)}
        />
        <Detail
          label="Created"
          value={formatPositionDate(position.createdAt)}
        />
        <Detail
          label="Last updated"
          value={formatPositionDate(position.updatedAt)}
        />
      </dl>

      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-2 border-t border-border pt-5 sm:grid-cols-2">
        <Button type="button" onClick={onEdit} disabled={isChangingStatus}>
          Edit position
        </Button>
        <Button
          type="button"
          variant={position.isActive ? "destructive" : "secondary"}
          onClick={handleStatusChange}
          disabled={isChangingStatus}
        >
          {isChangingStatus
            ? position.isActive
              ? "Deactivating..."
              : "Reactivating..."
            : position.isActive
              ? "Deactivate"
              : "Reactivate"}
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm leading-6 [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}
