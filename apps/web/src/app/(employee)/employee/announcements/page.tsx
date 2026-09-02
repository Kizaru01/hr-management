import { AnnouncementFeed } from "@/features/announcement/components/announcement-feed";
import { getAnnouncements } from "@/features/announcement/server/get-announcements";
import { PageHeader } from "@/components/ui/page-header";

export default async function EmployeeAnnouncementsPage() {
  const response = await getAnnouncements();

  return (
    <div className="page-stack mx-auto w-full max-w-5xl">
      <PageHeader
        title="Announcements"
        description="Read the latest updates shared with you."
      />

      <AnnouncementFeed announcements={response.data} />
    </div>
  );
}
