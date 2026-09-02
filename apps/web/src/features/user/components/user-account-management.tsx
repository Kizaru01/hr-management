"use client";

import { useSheetController, Sheet } from "@/components/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import type { ManagedUser } from "../types/user";
import { CreateUserForm } from "./create-user-form";
import { UserDetails } from "./user-details";
import { UserList } from "./user-list";

interface UserAccountManagementProps {
  users: ManagedUser[];
  currentUserId: string;
}

type SheetContent = { type: "create" } | { type: "details"; user: ManagedUser };

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
    <section className="page-stack">
      <PageHeader
        title="User & Account Management"
        description="Create sign-in accounts, manage roles, and control access without changing employee employment records."
        actions={
          <>
            <Badge className="px-3 py-1.5 text-sm">
              {activeCount} active of {users.length}
            </Badge>
            <Button
              type="button"
              aria-haspopup="dialog"
              aria-controls="user-account-sheet"
              onClick={(event) =>
                sheet.openSheet({ type: "create" }, event.currentTarget)
              }
            >
              Create account
            </Button>
          </>
        }
      />

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
