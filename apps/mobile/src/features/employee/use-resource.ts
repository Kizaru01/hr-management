import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError, errorMessage } from "@/lib/api/client";

export interface Resource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
// One fetch approach: the mobile API client + this screen lifecycle hook. No persistent HR data cache.
export function useResource<T>(path: string, parse: (value: unknown) => T) {
  const { request } = useAuth();
  const [resource, setResource] = useState<Resource<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setResource({ data: null, loading: true, error: null });
    try {
      const data = parse(await request<unknown>(path, active.signal));
      if (!active.signal.aborted)
        setResource({ data, loading: false, error: null });
    } catch (error) {
      if (
        !active.signal.aborted &&
        !(error instanceof ApiError && error.kind === "cancelled")
      )
        setResource({ data: null, loading: false, error: errorMessage(error) });
    }
  }, [path, parse, request]);
  useFocusEffect(
    useCallback(() => {
      void load();
      return () => controller.current?.abort();
    }, [load]),
  );
  return { ...resource, reload: load };
}
