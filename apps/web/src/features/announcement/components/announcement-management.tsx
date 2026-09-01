"use client";

import { Plus } from "lucide-react";
import { Sheet, useSheetController } from "@/components/sheet";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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
  { type: "create" } | { type: "details"; announcement: ManagedAnnouncement };

export function AnnouncementManagement({
  announcements,
  departments,
  branches,
}: AnnouncementManagementProps) {
  const sheet = useSheetController<AnnouncementSheetContent>();
  const selectedAnnouncement =
    sheet.content?.type === "details" ? sheet.content.announcement : null;

  return (
    <section className="page-stack">
      <PageHeader
        title="Announcements"
        description="Publish and review organization announcements."
        actions={
          <Button
            type="button"
            aria-haspopup="dialog"
            aria-controls="announcement-sheet"
            onClick={(event) =>
              sheet.openSheet({ type: "create" }, event.currentTarget)
            }
          >
            <Plus aria-hidden="true" size={17} />
            Create announcement
          </Button>
        }
      />

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
