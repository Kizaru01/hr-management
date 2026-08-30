"use client";

import { Plus } from "lucide-react";
import { Sheet, useSheetController } from "@/components/sheet";
import type { LookupOption } from "@/features/employee/types/employee";
import type { ManagedAnnouncement } from "../types/announcement";
import { AnnouncementDetails } from "./announcement-details";
import { CreateAnnouncementForm } from "./create-announcement-form";
import { ManagedAnnouncements } from "./managed-announcements";

interface AnnouncementManagementProps {
  announcements: ManagedAnnouncement[];
  departments: LookupOption[];
  branches: LookupOption[];
}

type AnnouncementSheetContent =
  | { type: "create" }
  | { type: "details"; announcement: ManagedAnnouncement };

export function AnnouncementManagement({
  announcements,
  departments,
  branches,
}: AnnouncementManagementProps) {
  const sheet = useSheetController<AnnouncementSheetContent>();
  const selectedAnnouncement =
    sheet.content?.type === "details" ? sheet.content.announcement : null;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Announcements</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Publish and review organization announcements.
          </p>
        </div>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls="announcement-sheet"
          onClick={(event) =>
            sheet.openSheet({ type: "create" }, event.currentTarget)
          }
          className="inline-flex w-fit items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus aria-hidden="true" size={17} />
          Create announcement
        </button>
      </header>

      <ManagedAnnouncements
        announcements={announcements}
        selectedAnnouncementId={selectedAnnouncement?.id}
        onSelect={(announcement, trigger) =>
          sheet.openSheet({ type: "details", announcement }, trigger)
        }
      />

      <Sheet
        id="announcement-sheet"
        title={
          sheet.content?.type === "create"
            ? "Create announcement"
            : "Announcement details"
        }
        description={
          sheet.content?.type === "create"
            ? "Publish an announcement to the company or a specific workplace group."
            : "Review the selected announcement."
        }
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
        autoFocusClose={sheet.content?.type === "details"}
      >
        {sheet.content?.type === "create" ? (
          <CreateAnnouncementForm
            departments={departments}
            branches={branches}
            onCancel={sheet.requestClose}
          />
        ) : selectedAnnouncement ? (
          <AnnouncementDetails announcement={selectedAnnouncement} />
        ) : null}
      </Sheet>
    </section>
  );
}
