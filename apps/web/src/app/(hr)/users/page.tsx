import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { UserAccountManagement } from "@/features/user/components/user-account-management";
import { getUsers } from "@/features/user/server/get-users";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const response = await getUsers();

  return (
    <UserAccountManagement
      users={response.data}
      currentUserId={currentUser.id}
    />
  );
}
