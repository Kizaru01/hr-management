"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ApiError } from "@/lib/api/api.client";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { activateUserAccess } from "../api/activate-user-access";
import { deactivateUserAccess } from "../api/deactivate-user-access";
import { updateUserRole } from "../api/update-user-role";
import type { ManagedUser, UserRole } from "../types/user";

interface UserListProps {
  users: ManagedUser[];
  currentUserId: string;
  selectedUserId?: string;
  onSelect: (user: ManagedUser, trigger: HTMLElement) => void;
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

const roles: Array<{ value: UserRole; label: string }> = [
  { value: "admin", label: "Administrator" },
  { value: "hr", label: "HR" },
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
];

const desktopColumns =
  "lg:grid-cols-[minmax(13rem,1.25fr)_minmax(11rem,0.9fr)_minmax(8rem,0.7fr)_minmax(9rem,0.75fr)_minmax(8rem,0.65fr)_minmax(10rem,0.75fr)]";

const userDateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

const userDateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

export function UserList({
  users,
  currentUserId,
  selectedUserId,
  onSelect,
}: UserListProps) {
  const router = useRouter();
  const [draftRoles, setDraftRoles] = useState<Record<string, UserRole>>(() =>
    Object.fromEntries(users.map((user) => [user.id, user.role])),
  );
  const [pendingOperation, setPendingOperation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const activeAdministratorCount = users.filter(
    (user) =>
      user.role === "admin" && user.status === "active" && user.isActive,
  ).length;

  const handleRoleUpdate = async (user: ManagedUser) => {
    const nextRole = draftRoles[user.id] ?? user.role;

    if (pendingOperation || nextRole === user.role) {
      return;
    }

    const confirmed = window.confirm(
      `Change ${user.email} from ${roleLabel(user.role)} to ${roleLabel(nextRole)}? Any linked employee profile will remain linked.`,
    );

    if (!confirmed) {
      return;
    }

    const operation = `role:${user.id}`;
    setPendingOperation(operation);
    setFeedback(null);

    try {
      const response = await updateUserRole(user.id, { role: nextRole });

      setDraftRoles((current) => ({
        ...current,
        [user.id]: response.data.role,
      }));
      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to update account role.",
      });
    } finally {
      setPendingOperation(null);
    }
  };

  const handleAccessChange = async (
    user: ManagedUser,
    action: "activate" | "deactivate",
  ) => {
    if (pendingOperation) {
      return;
    }

    const confirmed = window.confirm(
      action === "deactivate"
        ? `Deactivate access for ${user.email}? The user will be blocked from signing in. This does not terminate the linked employee record.`
        : `Reactivate access for ${user.email}? This restores sign-in access but does not change employment status.`,
    );

    if (!confirmed) {
      return;
    }

    const operation = `${action}:${user.id}`;
    setPendingOperation(operation);
    setFeedback(null);

    try {
      const response =
        action === "activate"
          ? await activateUserAccess(user.id)
          : await deactivateUserAccess(user.id);

      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : `Unable to ${action} account access.`,
      });
    } finally {
      setPendingOperation(null);
    }
  };

  if (users.length === 0) {
    return (
      <EmptyState
        title="No user accounts found"
        description="Created sign-in accounts will appear here."
      />
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`rounded-md border border-border px-4 py-3 text-sm ${
            feedback.type === "error" ? "text-destructive" : "text-success"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <section aria-label="User accounts" className="table-shell">
        <div
          className={`hidden gap-4 border-b border-border bg-hover px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid ${desktopColumns}`}
        >
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last login</span>
          <span>Created</span>
          <span>Access</span>
        </div>

        <ul className="divide-y divide-border">
          {users.map((user) => {
            const draftRole = draftRoles[user.id] ?? user.role;
            const isCurrentUser = user.id === currentUserId;
            const isLastActiveAdministrator =
              user.role === "admin" &&
              user.status === "active" &&
              user.isActive &&
              activeAdministratorCount <= 1;
            const unsafeAdminRemoval =
              isLastActiveAdministrator && draftRole !== "admin";
            const roleOperation = `role:${user.id}`;
            const activateOperation = `activate:${user.id}`;
            const deactivateOperation = `deactivate:${user.id}`;
            const isTerminatedEmployee =
              user.linkedEmployee?.employmentStatus === "terminated";
            const isSelected = selectedUserId === user.id;

            return (
              <li
                key={user.id}
                tabIndex={0}
                role="group"
                aria-label={`View account details for ${user.email}`}
                aria-controls="user-account-sheet"
                onClick={(event) => onSelect(user, event.currentTarget)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    onSelect(user, event.currentTarget);
                  }
                }}
                className={`grid min-w-0 cursor-pointer gap-4 px-4 py-5 transition hover:bg-hover focus-visible:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 lg:items-center ${desktopColumns} ${
                  isSelected ? "bg-selected" : ""
                }`}
              >
                <div className="flex min-w-0 items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{user.email}</p>
                    {user.linkedEmployee ? (
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">
                        <p className="truncate">{user.linkedEmployee.name}</p>
                        <p>
                          {user.linkedEmployee.employeeNumber}
                          {isTerminatedEmployee ? " · Terminated employee" : ""}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-disabled-foreground">
                        No linked employee
                      </p>
                    )}
                    {isCurrentUser ? (
                      <Badge variant="info" className="mt-2">
                        Current account
                      </Badge>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    aria-label={`View account details for ${user.email}`}
                    aria-haspopup="dialog"
                    aria-controls="user-account-sheet"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(user, event.currentTarget);
                    }}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </button>
                </div>

                <div
                  className="grid gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <label className="sr-only" htmlFor={`role-${user.id}`}>
                    Role for {user.email}
                  </label>
                  <select
                    id={`role-${user.id}`}
                    value={draftRole}
                    onChange={(event) =>
                      setDraftRoles((current) => ({
                        ...current,
                        [user.id]: event.target.value as UserRole,
                      }))
                    }
                    disabled={pendingOperation !== null}
                    className="min-w-0 rounded-md border border-border-strong bg-background px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {roles.map((role) => (
                      <option
                        key={role.value}
                        value={role.value}
                        disabled={
                          role.value === "employee" &&
                          user.role !== "employee" &&
                          (!user.linkedEmployee || isTerminatedEmployee)
                        }
                      >
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRoleUpdate(user)}
                    disabled={
                      pendingOperation !== null ||
                      draftRole === user.role ||
                      unsafeAdminRemoval
                    }
                    title={
                      unsafeAdminRemoval
                        ? "Assign another active administrator first."
                        : undefined
                    }
                    className="rounded-md border border-border-strong px-2 py-1.5 text-sm font-medium hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pendingOperation === roleOperation
                      ? "Saving..."
                      : "Save role"}
                  </button>
                </div>

                <div>
                  <Badge variant={accountStatusVariant(user)}>
                    {accountStatusLabel(user)}
                  </Badge>
                </div>

                <p className="text-sm text-secondary-foreground">
                  {user.lastLoginAt
                    ? formatDateTime(user.lastLoginAt)
                    : "Never"}
                </p>

                <p className="text-sm text-secondary-foreground">
                  {formatDate(user.createdAt)}
                </p>

                <div
                  className="grid gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  {user.status === "active" && user.isActive ? (
                    <button
                      type="button"
                      onClick={() => handleAccessChange(user, "deactivate")}
                      disabled={
                        pendingOperation !== null ||
                        isCurrentUser ||
                        isLastActiveAdministrator
                      }
                      title={
                        isCurrentUser
                          ? "You cannot deactivate your own account."
                          : isLastActiveAdministrator
                            ? "Assign another active administrator first."
                            : undefined
                      }
                      className="rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pendingOperation === deactivateOperation
                        ? "Deactivating..."
                        : "Deactivate"}
                    </button>
                  ) : null}

                  {user.status === "active" &&
                  !user.isActive &&
                  !isTerminatedEmployee ? (
                    <button
                      type="button"
                      onClick={() => handleAccessChange(user, "activate")}
                      disabled={pendingOperation !== null}
                      className="rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pendingOperation === activateOperation
                        ? "Activating..."
                        : "Activate access"}
                    </button>
                  ) : null}

                  {user.status === "pending" ? (
                    <p className="text-xs leading-5 text-muted-foreground">
                      Awaiting token activation
                    </p>
                  ) : null}

                  {isTerminatedEmployee && !user.isActive ? (
                    <p className="text-xs leading-5 text-muted-foreground">
                      Access remains blocked for the terminated employee record.
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function roleLabel(role: UserRole) {
  if (role === "admin") {
    return "Administrator";
  }

  if (role === "hr") {
    return "HR";
  }

  return role === "manager" ? "Manager" : "Employee";
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

function formatDate(value: string) {
  return formatTimestamp(value, userDateFormatter);
}

function formatDateTime(value: string) {
  return formatTimestamp(value, userDateTimeFormatter);
}

function formatTimestamp(value: string, formatter: Intl.DateTimeFormat) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}
