'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const LogoutButton = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] =
    useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        '/api/auth/logout',
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(
          'Unable to log out.',
        );
      }

      router.replace('/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading
        ? 'Signing out...'
        : 'Sign out'}
    </button>
  );
};