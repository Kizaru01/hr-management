"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/ui/feedback";
import { ApiError } from "@/lib/api/api.client";
import { changeBranchStatus } from "../api/change-branch-status";
import type { Branch } from "../types/branch";

interface BranchStatusDialogProps {
  branch: Branch;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function BranchStatusDialog({
  branch,
  onClose,
  onSuccess,
}: BranchStatusDialogProps) {
  const router = useRouter();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const action = branch.isActive ? "deactivate" : "reactivate";

  const handleStatusChange = async () => {
    if (isChangingStatus) {
      return;
    }

    setIsChangingStatus(true);
    setErrorMessage(null);

    try {
      const response = await changeBranchStatus(branch.id, action);

      router.refresh();
      onSuccess(response.message);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : `Unable to ${action} branch.`,
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <Dialog
      id="branch-status-confirmation"
      title={`${branch.isActive ? "Deactivate" : "Reactivate"} branch`}
      description={
        branch.isActive
          ? "The branch will stop being valid for new employee assignments. Employee and historical records remain intact."
          : "The branch will become available for active use again."
      }
      onRequestClose={() => {
        if (!isChangingStatus) {
          onClose();
        }
      }}
    >
      <div className="grid gap-5">
        <p className="text-sm leading-6 text-secondary-foreground">
          {branch.isActive && branch.activeEmployeeCount > 0
            ? `This branch currently has ${branch.activeEmployeeCount} active ${branch.activeEmployeeCount === 1 ? "employee" : "employees"}. The request will be rejected until they are reassigned.`
            : `Confirm that you want to ${action} ${branch.name}.`}
        </p>

        {errorMessage ? <Feedback tone="error">{errorMessage}</Feedback> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            data-dialog-initial-focus=""
            onClick={onClose}
            disabled={isChangingStatus}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={branch.isActive ? "destructive" : "primary"}
            onClick={handleStatusChange}
            disabled={isChangingStatus}
          >
            {isChangingStatus ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : null}
            {isChangingStatus
              ? branch.isActive
                ? "Deactivating..."
                : "Reactivating..."
              : branch.isActive
                ? "Deactivate branch"
                : "Reactivate branch"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
