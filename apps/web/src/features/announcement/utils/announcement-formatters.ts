import type {
  Announcement,
  AnnouncementAudience,
} from "../types/announcement";

export const announcementAudienceLabels: Record<
  AnnouncementAudience,
  string
> = {
  company: "Company",
  department: "Department",
  branch: "Branch",
};

const timestampFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

export const formatAnnouncementTimestamp = (value: string) =>
  timestampFormatter.format(new Date(value));

export const formatAnnouncementAudience = (
  announcement: Announcement,
) => {
  const label = announcementAudienceLabels[announcement.audience];

  if (announcement.audience === "department" && announcement.department) {
    return `${label} · ${announcement.department.name}`;
  }

  if (announcement.audience === "branch" && announcement.branch) {
    return `${label} · ${announcement.branch.name}`;
  }

  return label;
};
