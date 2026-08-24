import { CreateLeaveForm } from "@/features/leave/components/create-leave-form";
import { MyLeaveRequests } from "@/features/leave/components/my-leave-requests";
import { getMyLeaveRequests } from "@/features/leave/server/get-my-leave-requests";

export default async function EmployeeLeavePage() {
  const leaveRequests = await getMyLeaveRequests();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold">Employee Leave</h1>
        <p className="mt-1 text-sm text-gray-600">
          Submit leave requests and track their status.
        </p>
      </div>

      <CreateLeaveForm />
      <MyLeaveRequests leaveRequests={leaveRequests.data} />
    </div>
  );
}
