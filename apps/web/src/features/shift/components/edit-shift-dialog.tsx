"use client";

import type { ShiftSummary } from "../types/shift";
import { Dialog } from "@/components/dialog";
import { ShiftForm } from "./create-shift-form";

interface EditShiftDialogProps {
  shift: ShiftSummary | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const EditShiftDialog = ({
  shift,
  onClose,
  onSuccess,
}: EditShiftDialogProps) => {
  if (!shift) {
    return null;
  }

  return (
    <Dialog
      id="edit-shift-dialog"
      title="Edit shift"
      description="Update the name and scheduled hours."
      onRequestClose={onClose}
    >
      <ShiftForm
        mode="edit"
        shift={shift}
        onCancel={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
};
