import { ManagedLeaveRequests } from "@/features/leave/components/managed-leave-requests";
import { getMyTeamLeaveRequests } from "@/features/leave/server/get-my-team-leave-requests";

export default async function TeamLeavePage() {
  const response = await getMyTeamLeaveRequests();

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold">Team Leave Requests</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage leave requests from your direct reports.
        </p>
      </div>

      <ManagedLeaveRequests
        leaveRequests={response.data}
        emptyMessage="No team leave requests found."
      />
    </section>
  );
}
