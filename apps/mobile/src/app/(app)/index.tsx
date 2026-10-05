import { useState } from "react";
import { useRouter } from "expo-router";
import { RefreshControl, View } from "react-native";
import {
  Action,
  Card,
  Copy,
  Detail,
  Loading,
  Notice,
  Screen,
} from "@/components/mobile-ui";
import { useResource } from "@/features/employee/use-resource";
import {
  parseAnnouncements,
  parseAttendance,
  parseProfile,
  parseUnread,
  type AttendanceStatus,
} from "@/lib/api/contracts";
import { businessDate, businessTime, dateOnly, humanize } from "@/lib/format";
import { useMobileTheme } from "@/constants/mobile-theme";

const labels: Record<AttendanceStatus["status"], string> = {
  holiday: "Company holiday",
  rest_day: "Rest day / no assigned shift",
  scheduled: "Not checked in yet",
  absent: "Absent",
  on_leave: "On approved leave",
  on_time: "Completed on time",
  late: "Late arrival",
  undertime: "Left early",
  late_and_undertime: "Late arrival · left early",
  in_progress: "Checked in",
};
export default function HomeScreen() {
  const router = useRouter();
  const profile = useResource("/employees/me", parseProfile);
  const attendance = useResource("/attendance/me/status", parseAttendance);
  const announcements = useResource("/announcements", parseAnnouncements);
  const notifications = useResource("/notifications/unread-count", parseUnread);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useMobileTheme();
  async function refresh() {
    setRefreshing(true);
    try {
      await Promise.all([
        profile.reload(),
        attendance.reload(),
        announcements.reload(),
        notifications.reload(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <Screen
      bottomInset={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          tintColor={theme.info}
          colors={[theme.info]}
        />
      }
    >
      <View style={{ gap: 6 }}>
        <Copy kind="eyebrow">{businessDate()} · MANILA TIME</Copy>
        <Copy kind="title">
          {profile.data ? `Hello, ${profile.data.firstName}` : "Your workday"}
        </Copy>
        <Copy kind="muted">A little clarity for the day ahead.</Copy>
      </View>
      {profile.loading ? (
        <Loading label="Loading your employee profile…" />
      ) : profile.error ? (
        <Card>
          <Notice
            message={profile.error}
            onRetry={() => void profile.reload()}
          />
        </Card>
      ) : null}
      <Card>
        <Copy kind="heading">Today’s attendance</Copy>
        {attendance.loading ? (
          <Loading label="Loading attendance…" />
        ) : attendance.error ? (
          <Notice
            message={attendance.error}
            onRetry={() => void attendance.reload()}
          />
        ) : attendance.data ? (
          <AttendanceDetails value={attendance.data} />
        ) : (
          <Copy kind="muted">Attendance information is not available.</Copy>
        )}
        <Copy kind="muted">
          Attendance is view-only here. For your assigned shift times, contact
          HR.
        </Copy>
      </Card>
      <Card>
        <Copy kind="heading">Notifications</Copy>
        {notifications.loading ? (
          <Loading label="Loading notification count…" />
        ) : notifications.error ? (
          <Notice
            message={notifications.error}
            onRetry={() => void notifications.reload()}
          />
        ) : (
          <View style={{ gap: 4 }}>
            <Copy kind="title">{notifications.data}</Copy>
            <Copy kind="muted">
              {notifications.data === 0
                ? "No unread notifications."
                : "Unread notifications in your employee account."}
            </Copy>
          </View>
        )}
      </Card>
      <View style={{ gap: 12 }}>
        <Copy kind="heading">Latest announcements</Copy>
        {announcements.loading ? (
          <Loading label="Loading announcements…" />
        ) : announcements.error ? (
          <Card>
            <Notice
              message={announcements.error}
              onRetry={() => void announcements.reload()}
            />
          </Card>
        ) : announcements.data?.length === 0 ? (
          <Card>
            <Copy kind="muted">
              You’re up to date. No current announcements for your audience.
            </Copy>
          </Card>
        ) : (
          announcements.data?.map((item) => (
            <Card key={item.id}>
              <Copy kind="eyebrow">{businessDate(item.publishedAt)}</Copy>
              <Copy kind="heading">{item.title}</Copy>
              <Copy>{item.content}</Copy>
            </Card>
          ))
        )}
      </View>
      <Action
        secondary
        label="View my profile"
        onPress={() => router.push("/profile")}
      />
    </Screen>
  );
}

function AttendanceDetails({ value }: { value: AttendanceStatus }) {
  const theme = useMobileTheme();
  const hasCheckIn = "checkInAt" in value;
  return (
    <View style={{ gap: 16 }}>
      <Copy
        kind="title"
        style={{
          fontSize: 23,
          lineHeight: 30,
          color:
            value.status === "absent"
              ? theme.danger
              : hasCheckIn
                ? theme.success
                : theme.text,
        }}
      >
        {labels[value.status]}
      </Copy>
      <Copy kind="muted">{dateOnly(value.workDate)}</Copy>
      {value.status === "holiday" ? <Copy>{value.name}</Copy> : null}
      {value.status === "on_leave" ? (
        <Copy>{humanize(value.leave.leaveType)}</Copy>
      ) : null}
      {value.status === "scheduled" ? (
        <Copy kind="muted">
          Your scheduled shift has not ended. You have not been marked absent.
        </Copy>
      ) : null}
      {value.status === "absent" ? (
        <Copy kind="muted">
          No check-in was recorded before your scheduled shift ended.
        </Copy>
      ) : null}
      {hasCheckIn ? (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 28 }}>
            <Detail label="CHECK-IN" value={businessTime(value.checkInAt)} />
            <Detail label="CHECK-OUT" value={businessTime(value.checkOutAt)} />
          </View>
          {value.lateMinutes > 0 ? (
            <Copy kind="muted">Late by {value.lateMinutes} minutes</Copy>
          ) : null}
          {value.undertimeMinutes > 0 ? (
            <Copy kind="muted">
              Undertime: {value.undertimeMinutes} minutes
            </Copy>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
