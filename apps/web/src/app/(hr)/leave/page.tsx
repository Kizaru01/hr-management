import { ManagedLeaveRequests } from "@/features/leave/components/managed-leave-requests";
import { getLeaveRequests } from "@/features/leave/server/get-leave-requests";

export default async function LeavePage() {
  const response = await getLeaveRequests();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leave Requests</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage employee leave requests.
        </p>
      </div>

      <ManagedLeaveRequests
        leaveRequests={response.data}
        emptyMessage="No leave requests found."
      />
    </section>
  );
}
