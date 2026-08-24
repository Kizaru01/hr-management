"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "../api/logout";

export const LogoutButton = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await logout();

      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
};
