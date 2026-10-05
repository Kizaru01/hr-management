import { Alert, RefreshControl, View } from "react-native";
import {
  Action,
  Card,
  Copy,
  Detail,
  Loading,
  Notice,
  Screen,
} from "@/components/mobile-ui";
import { useAuth } from "@/features/auth/auth-provider";
import { useResource } from "@/features/employee/use-resource";
import { parseProfile } from "@/lib/api/contracts";
import { dateOnly, humanize } from "@/lib/format";
import { useMobileTheme } from "@/constants/mobile-theme";

export default function ProfileScreen() {
  const profile = useResource("/employees/me", parseProfile);
  const { user, signOut } = useAuth();
  const theme = useMobileTheme();
  const employee = profile.data;
  function confirmSignOut() {
    Alert.alert(
      "Sign out?",
      "Your saved session will be removed from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => void signOut(),
        },
      ],
    );
  }
  return (
    <Screen
      bottomInset={false}
      refreshControl={
        <RefreshControl
          refreshing={profile.loading}
          onRefresh={() => void profile.reload()}
          tintColor={theme.info}
          colors={[theme.info]}
        />
      }
    >
      <View style={{ gap: 6 }}>
        <Copy kind="eyebrow">YOUR ACCOUNT</Copy>
        <Copy kind="title">Profile</Copy>
        <Copy kind="muted">Your work information, at a glance.</Copy>
      </View>
      {profile.loading ? (
        <Loading label="Loading your profile…" />
      ) : profile.error ? (
        <Card>
          <Notice
            message={profile.error}
            onRetry={() => void profile.reload()}
          />
        </Card>
      ) : employee ? (
        <>
          <Card>
            <Copy kind="title">
              {[employee.firstName, employee.middleName, employee.lastName]
                .filter(Boolean)
                .join(" ")}
            </Copy>
            <Copy kind="muted">
              {employee.position.name} · {employee.department.name}
            </Copy>
            <Detail label="EMPLOYEE NUMBER" value={employee.employeeNumber} />
            <Detail label="WORK EMAIL" value={employee.email} />
          </Card>
          <Card>
            <Copy kind="heading">Work details</Copy>
            <Detail label="DEPARTMENT" value={employee.department.name} />
            <Detail label="POSITION" value={employee.position.name} />
            <Detail
              label="BRANCH"
              value={employee.branch?.name ?? "Not assigned"}
            />
            <Detail
              label="EMPLOYMENT TYPE"
              value={humanize(employee.employmentType)}
            />
            <Detail
              label="EMPLOYMENT STATUS"
              value={humanize(employee.employmentStatus)}
            />
            <Detail label="HIRE DATE" value={dateOnly(employee.hireDate)} />
          </Card>
        </>
      ) : null}
      <Card>
        <Copy kind="heading">Signed in as</Copy>
        <Copy>{user?.email}</Copy>
        {user?.role === "manager" ? (
          <Copy kind="muted">
            Manager account · personal employee information
          </Copy>
        ) : null}
        <Action secondary label="Sign out" onPress={confirmSignOut} />
        <Copy kind="muted">
          Signing out removes this device’s saved session.
        </Copy>
      </Card>
    </Screen>
  );
}
