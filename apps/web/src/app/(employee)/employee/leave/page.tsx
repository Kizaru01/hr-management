import { CreateLeaveForm } from "@/features/leave/components/create-leave-form";
import { MyLeaveRequests } from "@/features/leave/components/my-leave-requests";
import { getMyLeaveRequests } from "@/features/leave/server/get-my-leave-requests";
import { PageHeader } from "@/components/ui/page-header";

export default async function EmployeeLeavePage() {
  const leaveRequests = await getMyLeaveRequests();

  return (
    <div className="page-stack mx-auto w-full max-w-6xl">
      <PageHeader
        title="Employee Leave"
        description="Submit leave requests and track their status."
      />

      <CreateLeaveForm />
      <MyLeaveRequests leaveRequests={leaveRequests.data} />
    </div>
  );
}
