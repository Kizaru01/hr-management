"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button
      type="button"
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full justify-start text-secondary-foreground"
    >
      <LogOut aria-hidden="true" size={16} />
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  );
};
