"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Sheet, useSheetController } from "@/components/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Feedback as FeedbackMessage } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import type { ShiftSummary } from "../types/shift";
import { ShiftForm } from "./create-shift-form";
import { ShiftList } from "./shift-list";

interface ShiftManagementProps {
  shifts: ShiftSummary[];
  activeCount: number;
}

type ShiftSheetContent =
  | { type: "create" }
  | { type: "edit"; shift: ShiftSummary };

type Feedback = {
  type: "success" | "error";
  message: string;
};

export function ShiftManagement({
  shifts,
  activeCount,
}: ShiftManagementProps) {
  const sheet = useSheetController<ShiftSheetContent>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleMutationSuccess = (message: string) => {
    setFeedback({ type: "success", message });
    sheet.requestClose();
  };

  return (
    <section className="page-stack">
      <PageHeader
        title="Shift Management"
        description="Configure work schedules and control which shifts can be assigned."
        actions={
          <>
            <Badge className="px-3 py-1.5 text-sm">
              {activeCount} active of {shifts.length}
            </Badge>
            <Button
              type="button"
              aria-haspopup="dialog"
              aria-controls="shift-sheet"
              onClick={(event) => {
                setFeedback(null);
                sheet.openSheet({ type: "create" }, event.currentTarget);
              }}
            >
              <Plus aria-hidden="true" size={17} />
              Create shift
            </Button>
          </>
        }
      />

      {feedback ? (
        <FeedbackMessage tone={feedback.type}>
          {feedback.message}
        </FeedbackMessage>
      ) : null}

      <div className="min-w-0 space-y-3">
        <div>
          <h2 className="font-semibold">Configured shifts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, update, or deactivate existing schedules.
          </p>
        </div>

        <ShiftList
          shifts={shifts}
          onEdit={(shift, trigger) => {
            setFeedback(null);
            sheet.openSheet({ type: "edit", shift }, trigger);
          }}
        />
      </div>

      <Sheet
        id="shift-sheet"
        title={
          sheet.content?.type === "edit" ? "Edit shift" : "Create shift"
        }
        description={
          sheet.content?.type === "edit"
            ? "Update the name and scheduled hours."
            : "Add a reusable work schedule for employee assignments."
        }
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
      >
        {sheet.content?.type === "create" ? (
          <ShiftForm
            mode="create"
            onCancel={sheet.requestClose}
            onSuccess={handleMutationSuccess}
          />
        ) : sheet.content?.type === "edit" ? (
          <ShiftForm
            key={sheet.content.shift.id}
            mode="edit"
            shift={sheet.content.shift}
            onCancel={sheet.requestClose}
            onSuccess={handleMutationSuccess}
          />
        ) : null}
      </Sheet>
    </section>
  );
}
