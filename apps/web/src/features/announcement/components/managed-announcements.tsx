import type { ManagedAnnouncement } from "../types/announcement";
import {
  formatAnnouncementAudience,
  formatAnnouncementTimestamp,
} from "../utils/announcement-formatters";

interface ManagedAnnouncementsProps {
  announcements: ManagedAnnouncement[];
}

export const ManagedAnnouncements = ({
  announcements,
}: ManagedAnnouncementsProps) => (
  <section className="rounded-lg border shadow-sm">
    <div className="border-b p-6">
      <h2 className="text-lg font-semibold">Managed Announcements</h2>
      <p className="mt-1 text-sm text-gray-600">
        Review announcements published across the organization.
      </p>
    </div>

    {announcements.length === 0 ? (
      <p className="p-8 text-center text-sm text-gray-600">
        No announcements found.
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Audience</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created By</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="align-top">
                <td className="min-w-72 px-4 py-4">
                  <p className="font-medium">{announcement.title}</p>
                  <p className="mt-1 line-clamp-2 max-w-md whitespace-pre-wrap text-xs leading-5 text-gray-600">
                    {announcement.content}
                  </p>
                </td>
                <td className="min-w-48 px-4 py-4">
                  {formatAnnouncementAudience(announcement)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {formatAnnouncementTimestamp(announcement.publishedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {announcement.expiresAt
                    ? formatAnnouncementTimestamp(announcement.expiresAt)
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      announcement.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {announcement.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {announcement.createdBy.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);
