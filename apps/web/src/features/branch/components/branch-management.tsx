"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Sheet, useSheetController } from "@/components/sheet";
import { Button } from "@/components/ui/button";
import { Feedback as FeedbackMessage } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import type { Branch } from "../types/branch";
import { BranchDetails } from "./branch-details";
import { BranchForm } from "./branch-form";
import { BranchList } from "./branch-list";
import { BranchStatusDialog } from "./branch-status-dialog";

interface BranchManagementProps {
  branches: Branch[];
}

type BranchSheetContent =
  | { type: "create" }
  | { type: "details"; branch: Branch }
  | { type: "edit"; branch: Branch };

type Feedback = {
  type: "success" | "error";
  message: string;
};

export function BranchManagement({ branches }: BranchManagementProps) {
  const sheet = useSheetController<BranchSheetContent>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [statusBranch, setStatusBranch] = useState<Branch | null>(null);
  const selectedBranch =
    sheet.content?.type === "details" || sheet.content?.type === "edit"
      ? sheet.content.branch
      : null;

  const handleMutationSuccess = (message: string) => {
    setFeedback({ type: "success", message });
    setStatusBranch(null);
    sheet.requestClose();
  };

  return (
    <section className="page-stack">
      <PageHeader
        title="Branches"
        description="Manage work locations, attendance boundaries, and their active lifecycle."
        actions={
          <Button
            type="button"
            aria-haspopup="dialog"
            aria-controls="branch-sheet"
            onClick={(event) => {
              setFeedback(null);
              sheet.openSheet({ type: "create" }, event.currentTarget);
            }}
          >
            <Plus aria-hidden="true" size={17} />
            Create branch
          </Button>
        }
      />

      {feedback ? (
        <FeedbackMessage tone={feedback.type}>
          {feedback.message}
        </FeedbackMessage>
      ) : null}

      <BranchList
        branches={branches}
        selectedBranchId={selectedBranch?.id}
        onSelect={(branch, trigger) => {
          setFeedback(null);
          sheet.openSheet({ type: "details", branch }, trigger);
        }}
      />

      <Sheet
        id="branch-sheet"
        title={
          sheet.content?.type === "create"
            ? "Create branch"
            : sheet.content?.type === "edit"
              ? "Edit branch"
              : "Branch details"
        }
        description={
          sheet.content?.type === "create"
            ? "Add a work location using the supported branch fields."
            : sheet.content?.type === "edit"
              ? "Update this branch's administrative and location information."
              : "Review location, attendance, employee, and lifecycle information."
        }
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
        autoFocusClose={sheet.content?.type === "details"}
      >
        {sheet.content?.type === "create" ? (
          <BranchForm
            mode="create"
            onCancel={sheet.requestClose}
            onSuccess={handleMutationSuccess}
          />
        ) : sheet.content?.type === "edit" ? (
          <BranchForm
            key={sheet.content.branch.id}
            mode="edit"
            branch={sheet.content.branch}
            onCancel={() =>
              sheet.replaceContent({
                type: "details",
                branch: selectedBranch!,
              })
            }
            onSuccess={handleMutationSuccess}
          />
        ) : sheet.content?.type === "details" ? (
          <BranchDetails
            branch={sheet.content.branch}
            onEdit={() =>
              sheet.replaceContent({
                type: "edit",
                branch: selectedBranch!,
              })
            }
            onRequestStatusChange={() => setStatusBranch(selectedBranch!)}
          />
        ) : null}
      </Sheet>

      {statusBranch ? (
        <BranchStatusDialog
          branch={statusBranch}
          onClose={() => setStatusBranch(null)}
          onSuccess={handleMutationSuccess}
        />
      ) : null}
    </section>
  );
}
