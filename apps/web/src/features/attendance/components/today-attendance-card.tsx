"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { checkIn } from "../api/check-in";
import { checkOut } from "../api/check-out";
import type { MyAttendanceStatus } from "../types/attendance";
import {
  attendanceLeaveTypeLabels,
  attendanceRecordStatusLabels,
  formatAttendanceDate,
  formatAttendanceMinutes,
  formatAttendanceTime,
} from "../utils/attendance-formatters";

interface TodayAttendanceCardProps {
  initialStatus: MyAttendanceStatus;
}

type AttendanceAction = "check-in" | "check-out";

interface AttendanceDetail {
  label: string;
  value: string;
}

const statusLabels: Record<MyAttendanceStatus["status"], string> = {
  holiday: "Holiday",
  rest_day: "Rest Day",
  on_leave: "On Leave",
  scheduled: "Scheduled",
  absent: "Absent",
  ...attendanceRecordStatusLabels,
};

const getAttendanceDetails = (
  status: MyAttendanceStatus,
): AttendanceDetail[] => {
  switch (status.status) {
    case "holiday":
      return [{ label: "Holiday", value: status.name }];
    case "on_leave":
      return [
        {
          label: "Leave type",
          value: `${attendanceLeaveTypeLabels[status.leave.leaveType]} Leave`,
        },
      ];
    case "in_progress":
    case "late":
    case "late_and_undertime":
    case "undertime":
    case "on_time":
      return [
        { label: "Check in", value: formatAttendanceTime(status.checkInAt) },
        {
          label: "Check out",
          value: status.checkOutAt
            ? formatAttendanceTime(status.checkOutAt)
            : "—",
        },
        {
          label: "Late",
          value: formatAttendanceMinutes(status.lateMinutes),
        },
        {
          label: "Undertime",
          value: formatAttendanceMinutes(status.undertimeMinutes),
        },
      ];
    default:
      return [];
  }
};

const getAvailableAction = (
  status: MyAttendanceStatus,
): AttendanceAction | null => {
  if (status.status === "scheduled" || status.status === "absent") {
    return "check-in";
  }

  if (
    (status.status === "in_progress" || status.status === "late") &&
    status.checkOutAt === null
  ) {
    return "check-out";
  }

  return null;
};

export const TodayAttendanceCard = ({
  initialStatus,
}: TodayAttendanceCardProps) => {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<AttendanceAction | null>(
    null,
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const availableAction = getAvailableAction(initialStatus);
  const details = getAttendanceDetails(initialStatus);

  const handleAttendanceAction = async (action: AttendanceAction) => {
    if (pendingAction !== null) {
      return;
    }

    setPendingAction(action);
    setFeedback(null);

    try {
      const response =
        action === "check-in" ? await checkIn() : await checkOut();

      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      const fallbackMessage =
        action === "check-in" ? "Unable to check in." : "Unable to check out.";

      setFeedback({
        type: "error",
        message: error instanceof ApiError ? error.message : fallbackMessage,
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="rounded-card border border-border bg-card p-4 text-card-foreground shadow-card">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Today&apos;s status
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            {statusLabels[initialStatus.status]}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatAttendanceDate(initialStatus.workDate)}
        </p>
      </div>

      {details.length > 0 ? (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-sm text-muted-foreground">{detail.label}</dt>
              <dd className="mt-1 font-medium">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {availableAction ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => handleAttendanceAction(availableAction)}
            disabled={pendingAction !== null}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "check-in"
              ? "Checking in..."
              : pendingAction === "check-out"
                ? "Checking out..."
                : availableAction === "check-in"
                  ? "Check In"
                  : "Check Out"}
          </button>
        </div>
      ) : null}

      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`mt-4 text-sm ${
            feedback.type === "error" ? "text-destructive" : "text-success"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
};
