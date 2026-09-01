"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { cancelLeave } from "../api/cancel-leave";
import type { EmployeeLeaveRequest, LeaveStatus } from "../types/leave";
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
  pending: "border-warning-border bg-warning-surface text-warning",
  approved: "border-success-border bg-success-surface text-success",
  rejected: "border-destructive-border bg-destructive-surface text-destructive",
  cancelled: "border-border-strong bg-hover text-secondary-foreground",
};

export const MyLeaveRequests = ({ leaveRequests }: MyLeaveRequestsProps) => {
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
    <section className="table-shell">
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold">My Leave Requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your submitted requests and their current status.
        </p>

        {feedback ? (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`mt-3 text-sm ${
              feedback.type === "error" ? "text-destructive" : "text-success"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}
      </div>

      {leaveRequests.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          You haven&apos;t submitted any leave requests yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px]">
            <thead>
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
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[leaveRequest.status]}`}
                    >
                      {leaveStatusLabels[leaveRequest.status]}
                    </span>
                  </td>
                  <td className="min-w-56 px-4 py-4">{leaveRequest.reason}</td>
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
                        className="rounded-control border border-destructive px-3 py-1.5 font-medium text-destructive hover:bg-destructive-surface disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pendingLeaveId === leaveRequest.id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    ) : (
                      <span className="text-disabled-foreground">—</span>
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
