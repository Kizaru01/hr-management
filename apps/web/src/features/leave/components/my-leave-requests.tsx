"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { cancelLeave } from "../api/cancel-leave";
import type {
  EmployeeLeaveRequest,
  LeaveStatus,
} from "../types/leave";
import {
  formatLeaveDateRange,
  formatLeaveRequestedAt,
  leaveStatusLabels,
  leaveTypeLabels,
} from "../utils/leave-formatters";

interface MyLeaveRequestsProps {
  leaveRequests: EmployeeLeaveRequest[];
}

const statusStyles: Record<LeaveStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
};

export const MyLeaveRequests = ({
  leaveRequests,
}: MyLeaveRequestsProps) => {
  const router = useRouter();
  const [pendingLeaveId, setPendingLeaveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCancel = async (leaveRequestId: string) => {
    if (pendingLeaveId !== null) {
      return;
    }

    setPendingLeaveId(leaveRequestId);
    setFeedback(null);

    try {
      const response = await cancelLeave(leaveRequestId);

      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to cancel leave request.",
      });
    } finally {
      setPendingLeaveId(null);
    }
  };

  return (
    <section className="rounded-lg border shadow-sm">
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold">My Leave Requests</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review your submitted requests and their current status.
        </p>

        {feedback ? (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`mt-3 text-sm ${
              feedback.type === "error" ? "text-red-700" : "text-green-700"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}
      </div>

      {leaveRequests.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-600">
          You haven&apos;t submitted any leave requests yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Leave Type</th>
                <th className="px-4 py-3 font-medium">Date Range</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Requested On</th>
                <th className="px-4 py-3 font-medium">Remarks</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaveRequests.map((leaveRequest) => (
                <tr key={leaveRequest.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-4 font-medium">
                    {leaveTypeLabels[leaveRequest.leaveType]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {formatLeaveDateRange(
                      leaveRequest.startDate,
                      leaveRequest.endDate,
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyles[leaveRequest.status]}`}
                    >
                      {leaveStatusLabels[leaveRequest.status]}
                    </span>
                  </td>
                  <td className="min-w-56 px-4 py-4">
                    {leaveRequest.reason}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {formatLeaveRequestedAt(leaveRequest.createdAt)}
                  </td>
                  <td className="min-w-40 px-4 py-4">
                    {leaveRequest.remarks ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    {leaveRequest.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(leaveRequest.id)}
                        disabled={pendingLeaveId !== null}
                        className="rounded-md border border-red-300 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingLeaveId === leaveRequest.id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
