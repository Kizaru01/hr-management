import { ManagedLeaveRequests } from "@/features/leave/components/managed-leave-requests";
import { getMyTeamLeaveRequests } from "@/features/leave/server/get-my-team-leave-requests";
import { PageHeader } from "@/components/ui/page-header";

export default async function TeamLeavePage() {
  const response = await getMyTeamLeaveRequests();

  return (
    <section className="page-stack mx-auto w-full max-w-6xl">
      <PageHeader
        title="Team Leave Requests"
        description="Review and manage leave requests from your direct reports."
      />

      <ManagedLeaveRequests
        leaveRequests={response.data}
        emptyMessage="No team leave requests found."
      />
    </section>
  );
}
