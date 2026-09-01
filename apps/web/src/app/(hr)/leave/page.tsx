import { ManagedLeaveRequests } from "@/features/leave/components/managed-leave-requests";
import { getLeaveRequests } from "@/features/leave/server/get-leave-requests";
import { PageHeader } from "@/components/ui/page-header";

export default async function LeavePage() {
  const response = await getLeaveRequests();

  return (
    <section className="page-stack">
      <PageHeader
        title="Leave Requests"
        description="Review and manage employee leave requests."
      />

      <ManagedLeaveRequests
        leaveRequests={response.data}
        emptyMessage="No leave requests found."
      />
    </section>
  );
}
