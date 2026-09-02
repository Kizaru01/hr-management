"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { approveLeave } from "../api/approve-leave";
import type { LeaveStatus, ManagedLeaveRequest } from "../types/leave";
import {
  formatLeaveDateRange,
  formatLeaveEmployeeName,
  formatLeaveRequestedAt,
  leaveStatusLabels,
  leaveTypeLabels,
} from "../utils/leave-formatters";
import { RejectLeaveDialog } from "./reject-leave-dialog";

interface ManagedLeaveRequestsProps {
  leaveRequests: ManagedLeaveRequest[];
  emptyMessage: string;
}

const statusStyles: Record<LeaveStatus, string> = {
  pending: "border-warning-border bg-warning-surface text-warning",
  approved: "border-success-border bg-success-surface text-success",
  rejected: "border-destructive-border bg-destructive-surface text-destructive",
  cancelled: "border-border-strong bg-hover text-secondary-foreground",
};

export const ManagedLeaveRequests = ({
  leaveRequests,
  emptyMessage,
}: ManagedLeaveRequestsProps) => {
  const router = useRouter();
  const [pendingApproveId, setPendingApproveId] = useState<string | null>(null);
  const [rejectingLeave, setRejectingLeave] =
    useState<ManagedLeaveRequest | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleApprove = async (leaveRequestId: string) => {
    if (pendingApproveId !== null) {
      return;
    }

    setPendingApproveId(leaveRequestId);
    setFeedback(null);

    try {
      const response = await approveLeave(leaveRequestId);

      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to approve leave request.",
      });
    } finally {
      setPendingApproveId(null);
    }
  };

  const handleRejectSuccess = (message: string) => {
    setFeedback({ type: "success", message });
    router.refresh();
  };

  return (
    <>
      <section className="table-shell">
        {feedback ? (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`border-b px-4 py-3 text-sm ${
              feedback.type === "error" ? "text-destructive" : "text-success"
            }`}
          >
            {feedback.message}
          </p>
        ) : null}

        {leaveRequests.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[1100px]">
              <thead>
                <tr>
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Leave Type</th>
                  <th className="px-4 py-3 font-medium">Date Range</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Requested On</th>
                  <th className="px-4 py-3 font-medium">Remarks</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaveRequests.map((leaveRequest) => (
                  <tr key={leaveRequest.id} className="align-top">
                    <td className="min-w-48 px-4 py-4">
                      <p className="font-medium">
                        {formatLeaveEmployeeName(leaveRequest.employee)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {leaveRequest.employee.employeeNumber}
                      </p>
                    </td>
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
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(leaveRequest.id)}
                            disabled={pendingApproveId !== null}
                            className="rounded-control border border-success px-3 py-1.5 font-medium text-success hover:bg-success-surface disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {pendingApproveId === leaveRequest.id
                              ? "Approving..."
                              : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFeedback(null);
                              setRejectingLeave(leaveRequest);
                            }}
                            disabled={pendingApproveId !== null}
                            className="rounded-control border border-destructive px-3 py-1.5 font-medium text-destructive hover:bg-destructive-surface disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
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

      <RejectLeaveDialog
        leaveRequest={rejectingLeave}
        onClose={() => setRejectingLeave(null)}
        onSuccess={handleRejectSuccess}
      />
    </>
  );
};
