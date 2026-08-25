import { AnnouncementFeed } from "@/features/announcement/components/announcement-feed";
import { getAnnouncements } from "@/features/announcement/server/get-announcements";

export default async function EmployeeAnnouncementsPage() {
  const response = await getAnnouncements();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="mt-1 text-sm text-gray-600">
          Read the latest updates shared with you.
        </p>
      </div>

      <AnnouncementFeed announcements={response.data} />
    </div>
  );
}
