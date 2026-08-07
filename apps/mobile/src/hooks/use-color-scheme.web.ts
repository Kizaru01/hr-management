import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const colorScheme = useRNColorScheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  return hasHydrated ? colorScheme : 'light';
}