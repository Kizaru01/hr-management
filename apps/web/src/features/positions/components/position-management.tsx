"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Sheet, useSheetController } from "@/components/sheet";
import type { Position, PositionDepartmentSummary } from "../types/position";
import { PositionDetails } from "./position-details";
import { PositionForm } from "./position-form";
import { PositionList } from "./position-list";

interface PositionManagementProps {
  department: PositionDepartmentSummary;
  positions: Position[];
}

type PositionSheetContent =
  | { type: "create" }
  | { type: "details"; position: Position }
  | { type: "edit"; position: Position };

type Feedback = {
  type: "success" | "error";
  message: string;
};

export function PositionManagement({
  department,
  positions,
}: PositionManagementProps) {
  const sheet = useSheetController<PositionSheetContent>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const selectedPosition =
    sheet.content?.type === "details" || sheet.content?.type === "edit"
      ? sheet.content.position
      : null;

  const handleMutationSuccess = (message: string) => {
    setFeedback({ type: "success", message });
    sheet.requestClose();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-foreground/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/60">
          {positions.length} {positions.length === 1 ? "position" : "positions"}
        </p>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls="position-sheet"
          disabled={!department.isActive}
          title={
            department.isActive
              ? undefined
              : "Reactivate this department before creating a position."
          }
          onClick={(event) => {
            setFeedback(null);
            sheet.openSheet({ type: "create" }, event.currentTarget);
          }}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus aria-hidden="true" size={17} />
          Create position
        </button>
      </div>

      {!department.isActive ? (
        <p className="rounded-md border border-foreground/20 bg-foreground/5 px-4 py-3 text-sm text-foreground/70">
          This department is inactive. Existing positions remain available to
          review, but new positions cannot be created.
        </p>
      ) : null}

      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className="rounded-md border border-foreground/20 px-4 py-3 text-sm text-foreground/70"
        >
          {feedback.message}
        </p>
      ) : null}

      <PositionList
        positions={positions}
        selectedPositionId={selectedPosition?.id}
        onSelect={(position, trigger) => {
          setFeedback(null);
          sheet.openSheet({ type: "details", position }, trigger);
        }}
      />

      <Sheet
        id="position-sheet"
        title={
          sheet.content?.type === "create"
            ? "Create position"
            : sheet.content?.type === "edit"
              ? "Edit position"
              : "Position details"
        }
        description={
          sheet.content?.type === "create"
            ? `Add a position under ${department.name}.`
            : sheet.content?.type === "edit"
              ? "Update the position name and description."
              : "Review position information and lifecycle status."
        }
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
        autoFocusClose={sheet.content?.type === "details"}
      >
        {sheet.content?.type === "create" ? (
          <PositionForm
            mode="create"
            department={department}
            onCancel={sheet.requestClose}
            onSuccess={handleMutationSuccess}
          />
        ) : sheet.content?.type === "edit" ? (
          <PositionForm
            key={sheet.content.position.id}
            mode="edit"
            department={department}
            position={sheet.content.position}
            onCancel={() =>
              sheet.replaceContent({
                type: "details",
                position: selectedPosition!,
              })
            }
            onSuccess={handleMutationSuccess}
          />
        ) : sheet.content?.type === "details" ? (
          <PositionDetails
            position={sheet.content.position}
            onEdit={() =>
              sheet.replaceContent({
                type: "edit",
                position: selectedPosition!,
              })
            }
            onMutationSuccess={handleMutationSuccess}
          />
        ) : null}
      </Sheet>
    </section>
  );
}
