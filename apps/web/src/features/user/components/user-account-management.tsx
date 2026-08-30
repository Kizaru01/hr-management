"use client";

import { useSheetController, Sheet } from "@/components/sheet";
import type { ManagedUser } from "../types/user";
import { CreateUserForm } from "./create-user-form";
import { UserDetails } from "./user-details";
import { UserList } from "./user-list";

interface UserAccountManagementProps {
  users: ManagedUser[];
  currentUserId: string;
}

type SheetContent =
  | { type: "create" }
  | { type: "details"; user: ManagedUser };

export function UserAccountManagement({
  users,
  currentUserId,
}: UserAccountManagementProps) {
  const sheet = useSheetController<SheetContent>();
  const activeCount = users.filter(
    (user) => user.status === "active" && user.isActive,
  ).length;
  const selectedUserId =
    sheet.content?.type === "details" ? sheet.content.user.id : undefined;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            User &amp; Account Management
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground/60">
            Create sign-in accounts, manage roles, and control access without
            changing employee employment records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <p className="w-fit shrink-0 rounded-full border border-foreground/20 bg-foreground/5 px-3 py-1.5 text-sm font-medium text-foreground/70">
            {activeCount} active of {users.length}
          </p>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls="user-account-sheet"
            onClick={(event) =>
              sheet.openSheet({ type: "create" }, event.currentTarget)
            }
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Create account
          </button>
        </div>
      </header>

      <UserList
        users={users}
        currentUserId={currentUserId}
        selectedUserId={selectedUserId}
        onSelect={(user, trigger) =>
          sheet.openSheet({ type: "details", user }, trigger)
        }
      />

      <Sheet
        id="user-account-sheet"
        title={
          sheet.content?.type === "create"
            ? "Create account"
            : "Account details"
        }
        description={
          sheet.content?.type === "create"
            ? "Create a pending account using the existing secure activation flow."
            : "Review the account information returned by the user management service."
        }
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
        autoFocusClose={sheet.content?.type === "details"}
      >
        {sheet.content?.type === "create" ? (
          <CreateUserForm onCancel={sheet.requestClose} />
        ) : sheet.content?.type === "details" ? (
          <UserDetails user={sheet.content.user} />
        ) : null}
      </Sheet>
    </section>
  );
}
