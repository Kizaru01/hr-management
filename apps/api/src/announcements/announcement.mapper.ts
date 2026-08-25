import type { AnnouncementAudience } from '../generated/prisma/client.js';

type AnnouncementScope = {
  id: string;
  name: string;
} | null;

type AnnouncementCreator = {
  id: string;
  employee: {
    firstName: string;
    middleName: string | null;
    lastName: string;
  } | null;
};

export type ActiveAnnouncement = {
  id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  publishedAt: Date;
  expiresAt: Date | null;
  createdBy: {
    id: string;
    name: string;
  };
  department: AnnouncementScope;
  branch: AnnouncementScope;
};

export type ManagedAnnouncement = ActiveAnnouncement & {
  isActive: boolean;
};

type ActiveAnnouncementSource = Omit<ActiveAnnouncement, 'createdBy'> & {
  createdBy: AnnouncementCreator;
};

type ManagedAnnouncementSource = ActiveAnnouncementSource & {
  isActive: boolean;
};

function mapAnnouncementCreator(createdBy: AnnouncementCreator) {
  const employee = createdBy.employee;
  const name = employee
    ? [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean)
        .join(' ')
    : 'Management';

  return {
    id: createdBy.id,
    name,
  };
}

export function mapActiveAnnouncement(
  announcement: ActiveAnnouncementSource,
): ActiveAnnouncement {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    audience: announcement.audience,
    publishedAt: announcement.publishedAt,
    expiresAt: announcement.expiresAt,
    createdBy: mapAnnouncementCreator(announcement.createdBy),
    department: announcement.department,
    branch: announcement.branch,
  };
}

export function mapManagedAnnouncement(
  announcement: ManagedAnnouncementSource,
): ManagedAnnouncement {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    audience: announcement.audience,
    publishedAt: announcement.publishedAt,
    expiresAt: announcement.expiresAt,
    isActive: announcement.isActive,
    createdBy: mapAnnouncementCreator(announcement.createdBy),
    department: announcement.department,
    branch: announcement.branch,
  };
}
