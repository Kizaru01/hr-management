import { AnnouncementManagement } from "@/features/announcement/components/announcement-management";
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
    <AnnouncementManagement
      announcements={announcementResponse.data}
      departments={departments}
      branches={branches}
    />
  );
}
