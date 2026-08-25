import type { CreateAnnouncementInput } from "@hr-management/validation";

export type AnnouncementAudience = CreateAnnouncementInput["audience"];

export interface AnnouncementNamedEntity {
  id: string;
  name: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  publishedAt: string;
  expiresAt: string | null;
  createdBy: AnnouncementNamedEntity;
  department: AnnouncementNamedEntity | null;
  branch: AnnouncementNamedEntity | null;
}

export interface ManagedAnnouncement extends Announcement {
  isActive: boolean;
}

export interface CreatedAnnouncement {
  id: string;
}
