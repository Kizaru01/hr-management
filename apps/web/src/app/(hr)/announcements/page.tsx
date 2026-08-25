import { CreateAnnouncementForm } from "@/features/announcement/components/create-announcement-form";
import { ManagedAnnouncements } from "@/features/announcement/components/managed-announcements";
import { getManagedAnnouncements } from "@/features/announcement/server/get-managed-announcements";
import { getBranches } from "@/features/branch/server/get-branches";
import { getDepartments } from "@/features/departments/server/get-departments";

export default async function AnnouncementsPage() {
  const [announcementResponse, departmentResponse, branchResponse] =
    await Promise.all([
      getManagedAnnouncements(),
      getDepartments(),
      getBranches(),
    ]);

  const departments = departmentResponse.data.map((department) => ({
    label: department.name,
    value: department.id,
  }));
  const branches = branchResponse.data.map((branch) => ({
    label: branch.name,
    value: branch.id,
  }));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <p className="mt-1 text-sm text-gray-600">
          Publish and review organization announcements.
        </p>
      </div>

      <CreateAnnouncementForm
        departments={departments}
        branches={branches}
      />
      <ManagedAnnouncements announcements={announcementResponse.data} />
    </section>
  );
}
