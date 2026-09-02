import type { ManagedUser, UserRole } from "../types/user";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

interface UserDetailsProps {
  user: ManagedUser;
}

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

export function UserDetails({ user }: UserDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <p className="break-words text-lg font-semibold">{user.email}</p>
        <Badge
          variant={accountStatusVariant(user)}
          className="mt-3 px-2.5 py-1"
        >
          {accountStatusLabel(user)}
        </Badge>
      </div>

      <dl className="grid gap-5 text-sm">
        <Detail label="Role" value={roleLabel(user.role)} />

        {user.linkedEmployee ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Linked employee
            </dt>
            <dd className="mt-1.5 leading-6">
              <p className="font-medium">{user.linkedEmployee.name}</p>
              <p className="text-secondary-foreground">
                {user.linkedEmployee.employeeNumber}
              </p>
              <p className="capitalize text-muted-foreground">
                {user.linkedEmployee.employmentStatus}
              </p>
            </dd>
          </div>
        ) : (
          <Detail label="Linked employee" value="Not linked" />
        )}

        <Detail
          label="Last login"
          value={
            user.lastLoginAt
              ? formatTimestamp(user.lastLoginAt, dateTimeFormatter)
              : "Never"
          }
        />
        <Detail
          label="Created"
          value={formatTimestamp(user.createdAt, dateFormatter)}
        />
      </dl>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 leading-6 text-secondary-foreground">{value}</dd>
    </div>
  );
}

function roleLabel(role: UserRole) {
  if (role === "admin") {
    return "Administrator";
  }

  return role === "hr" ? "HR" : "Employee";
}

function accountStatusLabel(user: ManagedUser) {
  if (user.status === "pending") {
    return "Pending activation";
  }

  if (user.status === "active") {
    return user.isActive ? "Active" : "Deactivated";
  }

  return user.status.charAt(0).toUpperCase() + user.status.slice(1);
}

function accountStatusVariant(user: ManagedUser): BadgeVariant {
  if (user.status === "pending") {
    return "warning";
  }

  if (user.status === "active" && user.isActive) {
    return "success";
  }

  return user.status === "disabled"
    ? "destructive"
    : user.status === "suspended"
      ? "warning"
      : "neutral";
}

function formatTimestamp(value: string, formatter: Intl.DateTimeFormat) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}
