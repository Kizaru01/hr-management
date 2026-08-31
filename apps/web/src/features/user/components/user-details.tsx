import type { ManagedUser, UserRole } from "../types/user";

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
      <div className="border-b border-foreground/15 pb-5">
        <p className="break-words text-lg font-semibold">{user.email}</p>
        <span className="mt-3 inline-flex rounded-full border border-foreground/20 bg-foreground/5 px-2.5 py-1 text-xs font-medium">
          {accountStatusLabel(user)}
        </span>
      </div>

      <dl className="grid gap-5 text-sm">
        <Detail label="Role" value={roleLabel(user.role)} />

        {user.linkedEmployee ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Linked employee
            </dt>
            <dd className="mt-1.5 leading-6">
              <p className="font-medium">{user.linkedEmployee.name}</p>
              <p className="text-foreground/65">
                {user.linkedEmployee.employeeNumber}
              </p>
              <p className="capitalize text-foreground/55">
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
      <dt className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
        {label}
      </dt>
      <dd className="mt-1.5 leading-6 text-foreground/80">{value}</dd>
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

function formatTimestamp(value: string, formatter: Intl.DateTimeFormat) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}
